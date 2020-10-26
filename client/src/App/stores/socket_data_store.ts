import socketioClient from 'socket.io-client';
import {
    Device as DeviceProps,
    SocketEvents,
    AllDataMsg,
    DevicesPkg,
    DataStore,
    MessageType,
    SendDataPkg,
    ClientDataMsg,
    ClientsData,
} from '../../Shared/SharedTypings';

import { action, computed, observable, reaction } from 'mobx';
import { RootStore, Store } from './root_store';
import Device from '../models/Device';
import ClientData from '../models/ClientData';
const WS_PORT = process.env.NODE_ENV === 'production' ? '' : ':5000';

export const GLOBAL_LISTENER = 'GLOBAL_LISTENER';
export function timeStamp(): number {
    return Date.now() / 1000.0;
}

function randomDeviceNr() {
    return `Device${Math.floor(Math.random() * 899) + 100}`;
}

export interface ClientsAllDataPkg extends AllDataMsg {
    all_data: ClientsData;
}

export default class SocketDataStore implements Store {
    private readonly root: RootStore;
    socket: SocketIOClient.Socket;

    @observable
    isAdmin: boolean = false;

    @observable.ref
    client = new Device({
        device_id: localStorage.getItem('device_id') ?? randomDeviceNr(),
    });

    dataStore = observable.map<string, ClientData>({});
    devices = observable<Device>([]);

    startTime = timeStamp();

    constructor(root: RootStore) {
        this.root = root;
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const ws_url = `${protocol}://${window.location.hostname}${WS_PORT}`;
        this.socket = socketioClient(ws_url, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 500,
        });
        this.configureAndConnect();
        reaction(
            () => this.isAdmin,
            (isAdmin) => {
                this.setGloablListener(isAdmin);
            }
        );
    }

    @computed
    get data(): ClientData | undefined {
        // if (!this.dataStore.has(this.client.deviceId)) {
        //     throw new Error(`No data store initialized for ${this.client.deviceId}`);
        // }
        return this.dataStore.get(this.client.deviceId);
    }

    @action
    addDataToStore(deviceId: string, ...msgs: ClientDataMsg[]) {
        const broadcastMsgs = msgs.filter((msg) => msg.broadcast);
        let directMsgs = msgs;
        /**
         * broadcasting messages go direct to this client
         */
        if (broadcastMsgs.length > 0) {
            this.data?.addData(broadcastMsgs);
            directMsgs = msgs.filter((msg) => !msg.broadcast);
        }
        if (directMsgs.length === 0) {
            return;
        }

        /**
         * the rest of the data is delivered to the concerning client
         */
        let store = this.clientsData(deviceId);
        if (!store) {
            store = new ClientData(this, deviceId, this.isAdmin);
            this.dataStore.set(deviceId, store);
        }
        store.addData(directMsgs);
    }

    clientsData(deviceId: string): ClientData | undefined {
        return this.dataStore.get(deviceId);
    }

    configureAndConnect() {
        this.socket.on(SocketEvents.Devices, (data: DevicesPkg) => {
            this.devices.replace(data.devices.map((dev) => new Device(dev)));
        });

        this.socket.on(SocketEvents.Device, (data: DeviceProps) => {
            this.client = new Device(data);
            this.refreshData();
        });

        this.socket.on(SocketEvents.AllData, (data: AllDataMsg) => {
            const allData = Object.values(data.all_data).reduce(
                (all, store) => (store ? [...all!, ...store] : store!),
                [] as ClientDataMsg[]
            ) as ClientDataMsg[];
            this.addDataToStore(data.device_id, ...allData);
        });

        this.socket.on(
            SocketEvents.NewData,
            action((data: ClientDataMsg) => {
                this.addDataToStore(data.device_id, data);
            })
        );
        this.connect();
        this.setDeviceId(this.client.deviceId, false);
    }

    get isDisabled() {
        return this.socket.connected;
    }

    @action
    setDeviceId(deviceId: string, saveToLocalStorage: boolean = true) {
        const newDevId = deviceId.trim();
        const oldId = this.client.deviceId;
        this.client = new Device({ device_id: newDevId });
        if (saveToLocalStorage) {
            localStorage.setItem('device_id', newDevId);
        }
        if (!this.dataStore.has(newDevId)) {
            this.dataStore.set(newDevId, new ClientData(this, newDevId));
        }
        this.emit(SocketEvents.NewDevice, {
            device_id: newDevId,
            old_device_id: oldId,
            is_client: true,
        });
    }

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
            device_id: this.client.deviceId,
            device_nr: this.client.deviceNr,
            time_stamp: timeStamp(),
            broadcast: broadcast,
            ...data,
        });
    }

    emitData<T>(data: SendDataPkg & T) {
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
        setTimeout(() => {
            this.getDataStore();
            this.refreshDevices();
        }, 250);
    }

    getDataStore() {
        this.emit(SocketEvents.DataStore);
    }

    /**
     * this function shall never be called directly. It is invoked by the autorun
     * function defined in the constructor and depends on the `isAdmin` state.
     */
    private setGloablListener = action((on: boolean) => {
        if (on) {
            this.socket.on(
                SocketEvents.DataStore,
                action((data: DataStore) => {
                    this.dataStore.forEach((cData) => cData.clear());
                    this.dataStore.clear();
                    Object.keys(data).forEach((clientId) => {
                        const client = new ClientData(this, clientId, true);
                        const allData = Object.values(data[clientId]).reduce(
                            (all, store) => (store ? [...all!, ...store] : store!),
                            [] as ClientDataMsg[]
                        ) as ClientDataMsg[];
                        client.addData(allData);
                        this.dataStore.set(clientId, client);
                    });
                })
            );
            this.setDeviceId(GLOBAL_LISTENER, false);
            this.socket.emit(SocketEvents.DataStore);
        } else {
            this.socket.off(SocketEvents.DataStore);
            this.dataStore.forEach((cData) => cData.clear());
            this.dataStore.clear();
            this.setDeviceId(localStorage.getItem('device_id') ?? randomDeviceNr(), false);
            [...this.dataStore.values()].forEach((store) => {
                store.logOnlyRawMessages(false);
            });
        }
    });

    @action
    cleanup() {
        this.dataStore.forEach((cData) => cData.clear());
        this.dataStore.clear();
    }
}
