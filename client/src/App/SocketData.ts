import { ColorGrid as ColorGridModel, defaultGrid } from './models/ColorGrid/ColorGrid';
import socketioClient from 'socket.io-client';
import * as _ from 'lodash';
import {
    Device,
    SocketEvents,
    DataType,
    AllDataMsg,
    DevicesPkg,
    DataStore,
    MessageType,
    NotificationMsg,
    InputPromptMsg,
    SendDataPkg,
    PlaygroundConfig,
    SpriteMsg,
    GridUpdateMsg,
    ColorMsg,
    PlaygroundConfigMsg,
    GridMsg,
    ClientDataMsg,
    SpritesMsg,
} from '../Shared/SharedTypings';
import { Notification } from './models/Notification';
import { InputPrompt } from './models/InputPrompt';
import { ColorPanel as ColorPanelModel, defaultColorPanelMsg } from './models/ColorPanel';

import { action, observable, reaction } from 'mobx';
import { Playground } from './models/Playground';
const WS_PORT = process.env.NODE_ENV === 'production' ? '' : ':5000';

export const GLOBAL_LISTENER = 'GLOBAL_LISTENER';
export function timeStamp(): number {
    return Date.now() / 1000.0;
}

function randomDeviceNr() {
    return `Device${Math.floor(Math.random() * 899) + 100}`;
}

export interface ClientsAllDataPkg extends AllDataMsg {
    all_data: ClientDataMsg[];
}

const MESSAGE_THRESHOLD = 50;

class ClientData {
    @observable
    deviceId: string;
    data = observable<ClientDataMsg>([]);

    @observable
    show: boolean = true;

    constructor(clientId: string) {
        this.deviceId = clientId;
    }

    @action
    addData(...msgs: ClientDataMsg[]) {
        const newData = msgs.filter((msg) => msg.device_id === this.deviceId);
        if (this.data.length > MESSAGE_THRESHOLD && newData.length > 0) {
            const toRemoveCnt = this.data.length + newData.length - MESSAGE_THRESHOLD;
            this.data.replace([...this.data.slice(toRemoveCnt), ...newData]);
        } else {
            this.data.push(...newData);
        }
    }
}

export default class SocketData {
    socket: SocketIOClient.Socket;

    @observable
    isAdmin: boolean = false;
    /**
     *
     * @param {string} deviceId
     */
    @observable
    deviceId = localStorage.getItem('device_id') ?? randomDeviceNr();

    notifications = observable<Notification>([]);
    inputPrompts = observable<InputPrompt>([]);

    @observable
    colorPanel: ColorPanelModel = new ColorPanelModel(defaultColorPanelMsg, this);

    @observable
    colorGrid: ColorGridModel = new ColorGridModel(defaultGrid, this);

    @observable.ref
    playground: Playground = new Playground(this);

    /**
     *
     * @param {number} deviceNr
     */
    deviceNr = -1;

    /**
     *
     * @param {Array<any>} myData (data for this deviceId)
     */
    myData: ClientDataMsg[] = [];

    /**
     *
     * @param {Array<any>} data from other clients
     */
    dataStore = observable<ClientData>([]);

    /**
     *
     * @param {Array<{device_id: string, device_nr: number, is_client: boolean, socket_id: string}>}
     *        all connected devices
     */
    devices = observable<Device>([]);
    startTime = timeStamp();

    /**
     * @param {Array<event => void)>}
     */
    onData: ((data: ClientDataMsg) => void)[] = [];

    onSprite?: (data: SpriteMsg) => void;
    onSprites?: (data: SpriteMsg[]) => void;

    lastPlaygroundConfig: PlaygroundConfig = {
        width: 100,
        height: 100,
        shift_x: 0,
        shift_y: 0,
    };
    /**
     * @param {Array<event => void)>}
     */
    onPlaygroundConfig?: (data: PlaygroundConfig) => void = undefined;

    /**
     * @param {Array<event => void)>}
     */
    onDevices: ((devices: Device[]) => void)[] = [];

    /**
     * @param {Array<event => void)>}
     */
    onAllData: ((allData: ClientsAllDataPkg) => void)[] = [];

    /**
     * @param {undefined | (data) => void}
     */
    onDevice?: (deviceNr: number) => void;

    constructor() {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const ws_url = `${protocol}://${window.location.hostname}${WS_PORT}`;
        this.socket = socketioClient(ws_url, {
            transports: ['websocket', 'polling'],
        });
        this.configureAndConnect();
        reaction(
            () => this.isAdmin,
            (isAdmin) => {
                this.setGloablListener(isAdmin);
            }
        );
    }

    private setGloablListener = action((on: boolean) => {
        if (on) {
            this.socket.on(
                SocketEvents.DataStore,
                action((data: DataStore) => {
                    this.dataStore.replace([]);
                    Object.keys(data).forEach((clientId) => {
                        this.prepareNewClient(clientId);
                        this.clientsData(clientId)?.addData(...data[clientId]);
                    });
                })
            );
            this.socket.emit(SocketEvents.DataStore);
            this.setDeviceId(GLOBAL_LISTENER, false);
        } else {
            this.socket.off(SocketEvents.DataStore);
            this.setDeviceId(localStorage.getItem('device_id') ?? randomDeviceNr(), false);
            this.dataStore.replace([]);
        }
    });

    @action
    prepareNewClient(deviceId: string) {
        if (!this.clientsData(deviceId)) {
            this.dataStore.push(new ClientData(deviceId));
        }
    }

    @action
    clientsData(deviceId: string): ClientData | undefined {
        return this.dataStore.find((client) => client.deviceId === deviceId);
    }

    configureAndConnect() {
        this.socket.on(SocketEvents.Devices, (data: DevicesPkg) => {
            this.devices.replace(data.devices);
            this.onDevices.forEach((callback) => callback(data.devices));
        });

        this.socket.on(SocketEvents.Device, (data: Device) => {
            this.deviceNr = data.device_nr;
            if (this.onDevice) {
                this.onDevice(data.device_nr);
            }
            this.refreshData();
        });

        this.socket.on(SocketEvents.AllData, (data: AllDataMsg) => {
            const allData: ClientDataMsg[] = data.all_data;
            if (data.device_id === this.deviceId) {
                this.myData = allData;
            } else {
                let cData = this.clientsData(data.device_id);
                if (!cData) {
                    this.prepareNewClient(data.device_id);
                    cData = this.clientsData(data.device_id);
                }
                cData?.addData(...allData);
            }
        });

        this.socket.on(
            SocketEvents.NewData,
            action((data: ClientDataMsg) => {
                if (data.device_id === this.deviceId) {
                    this.myData.push(data);
                } else if (data.device_id) {
                    let cData = this.clientsData(data.device_id);
                    if (!cData) {
                        this.prepareNewClient(data.device_id);
                        cData = this.clientsData(data.device_id);
                    }
                    cData?.addData(data);
                }
                switch (data.type) {
                    case DataType.Notification:
                        if (this.isAdmin) {
                            return;
                        }
                        this.notifications.push(
                            new Notification(data, (notification: Notification) => {
                                this.notifications.remove(notification);
                            })
                        );
                        break;
                    case DataType.InputPrompt:
                        if (this.isAdmin) {
                            return;
                        }
                        this.inputPrompts.push(
                            new InputPrompt(data, this, (prompt: InputPrompt) =>
                                this.inputPrompts.remove(prompt)
                            )
                        );
                        break;
                    case DataType.Sprite:
                        this.playground.addOrUpdateSprite(data.sprite);
                        break;
                    case DataType.Sprites:
                        this.playground.addOrUpdateSprites(...data.sprites);
                        if (this.onSprites) {
                            this.onSprites((data as any) as SpriteMsg[]);
                        }
                        break;
                    case DataType.PlaygroundConfig:
                        this.playground.updateConfig(data.config);
                        if (this.onPlaygroundConfig) {
                            this.onPlaygroundConfig((data as any) as PlaygroundConfig);
                        }
                        break;
                    case DataType.Color:
                        this.colorPanel = new ColorPanelModel(data, this);
                        break;
                    case DataType.Grid:
                        this.colorGrid = new ColorGridModel(data, this);
                        break;
                    case DataType.GridUpdate:
                        this.colorGrid.update(data);
                        break;
                }
                this.onData.forEach((callback) => {
                    callback(data);
                });
            })
        );
        this.connect();
        this.setDeviceId(this.deviceId, false);
    }

    get isDisabled() {
        return this.socket.connected;
    }

    getData(type: DataType.Grid): GridMsg[];
    getData(type: DataType.Color): ColorMsg[];
    getData(type: DataType.GridUpdate): GridUpdateMsg[];
    getData(type: DataType.InputPrompt): InputPromptMsg[];
    getData(type: DataType.Notification): NotificationMsg[];
    getData(type: DataType.PlaygroundConfig): PlaygroundConfigMsg[];
    getData(type: DataType.Sprite): SpriteMsg[];
    getData(type: DataType.Sprites): SpritesMsg[];
    getData(type: DataType): ClientDataMsg[] {
        return this.myData.filter((d) => d.type === type);
    }

    setDeviceId = _.debounce((deviceId: string, saveToLocalStorage: boolean = true) => {
        const oldId = this.deviceId;
        this.deviceId = deviceId;
        if (saveToLocalStorage) {
            localStorage.setItem('device_id', deviceId);
        }
        this.emit(SocketEvents.NewDevice, {
            device_id: deviceId,
            old_device_id: oldId,
            is_client: true,
        });
    }, 300);

    clearData() {
        this.emit(SocketEvents.Clear);
    }

    refreshData() {
        this.emit(SocketEvents.GetAllData);
    }

    refreshDevices() {
        this.emit(SocketEvents.GetDevices);
    }

    /**
     *
     * @param {string} event
     * @param {Object} data
     * @param {boolean} broadcast
     */
    emit(event: SocketEvents, data: MessageType = undefined, broadcast: boolean = false) {
        if (!this.socket.connected) {
            this.connect();
        }
        this.socket.emit(event, {
            device_id: this.deviceId,
            device_nr: this.deviceNr,
            time_stamp: timeStamp(),
            broadcast: broadcast,
            ...data,
        });
    }

    addData<T>(data: SendDataPkg & T) {
        this.emit(SocketEvents.NewData, data);
    }

    connect() {
        this.socket.connect();
    }

    disconnect() {
        this.socket.disconnect();
    }

    removeAllData() {
        this.emit(SocketEvents.RemoveAll);
    }

    getDataStore() {
        this.emit(SocketEvents.DataStore);
    }
}
