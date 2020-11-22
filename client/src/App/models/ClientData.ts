import { GyroMsg } from './../../Shared/SharedTypings';
import { Playground } from './Playground';
import { action, computed, observable } from 'mobx';
import { AccMsg, ClientDataMsg, DataType } from '../../Shared/SharedTypings';
import { ColorGrid, defaultGrid } from './ColorGrid/ColorGrid';
import { ColorPanel, defaultColorPanelMsg } from './ColorPanel';
import { Notification } from './Notification';
import SocketDataStore from '../stores/socket_data_store';
import { InputPrompt } from './InputPrompt';

const CHARTEABLE_DATA_THRESHOLD = 50;
const MESSAGE_THRESHOLD = 5;
export default class ClientData {
    deviceId: string;
    socket: SocketDataStore;
    rawData = observable.map<DataType, ClientDataMsg[]>({}, { deep: true });
    displayOptions = observable.set<DataType>();

    @computed
    get rawAccData(): AccMsg[] {
        return (this.rawData.get(DataType.Acceleration) ?? []) as AccMsg[];
    }

    @computed
    get rawGyroData(): GyroMsg[] {
        return (this.rawData.get(DataType.Gyro) ?? []) as GyroMsg[];
    }

    @computed
    get dataTypes(): DataType[] {
        return [...this.rawData.keys()];
    }

    @computed
    get unchartableRawData(): ClientDataMsg[] {
        const raw: ClientDataMsg[] = [];
        const showAll = this.displayOptions.size === 0;
        this.rawData.forEach((data, key) => {
            if (key === DataType.Acceleration || key === DataType.Gyro) {
                return;
            }
            if (showAll || this.displayOptions.has(key)) {
                raw.push(...data);
            }
        });
        return raw.sort((a, b) => b.time_stamp - a.time_stamp);
    }

    @computed
    get hasRawAcc(): boolean {
        return this.rawData.has(DataType.Acceleration);
    }
    @computed
    get hasRawGyro(): boolean {
        return this.rawData.has(DataType.Gyro);
    }

    @observable
    show: boolean = false;

    private _logOnlyRawMessages: boolean;

    notifications = observable<Notification>([]);
    inputPrompts = observable<InputPrompt>([]);

    @observable.ref
    colorPanel: ColorPanel;

    @observable.ref
    colorGrid: ColorGrid;

    @observable.ref
    playground: Playground;

    constructor(socket: SocketDataStore, clientId: string, logOnlyRawMessages: boolean = false) {
        this.deviceId = clientId;
        this.socket = socket;
        this.colorPanel = new ColorPanel(defaultColorPanelMsg, this.socket);
        this.colorGrid = new ColorGrid(defaultGrid, this.socket);
        this.playground = new Playground(this.socket);
        this._logOnlyRawMessages = logOnlyRawMessages;
    }

    @computed
    get alertingMessages(): (InputPrompt | Notification)[] {
        const all = [...this.inputPrompts, ...this.notifications.filter((n) => n.alert)];
        return all.sort((a, b) => a.timeStamp - b.timeStamp);
    }

    @computed
    get isInputPromptOpen(): boolean {
        return this.alertingMessages[0]?.dataType === DataType.InputPrompt;
    }

    logOnlyRawMessages(on: boolean) {
        if (on) {
            this._logOnlyRawMessages = true;
        } else {
            this.rawData.clear();
            this._logOnlyRawMessages = false;
        }
    }

    @action
    addData(msgs: ClientDataMsg[]) {
        msgs.sort((a, b) => a.time_stamp - b.time_stamp);
        if (this._logOnlyRawMessages) {
            this.addToLog(msgs);
            return;
        }
        msgs.forEach((msg) => {
            if (msg.device_id === this.deviceId || msg.broadcast) {
                this.registerData(msg);
            }
        });
    }

    @action
    addToLog(msgs: ClientDataMsg[]) {
        msgs.forEach((msg) => {
            if (msg.device_id !== this.deviceId && !msg.broadcast) {
                return;
            }
            const data = this.rawData.get(msg.type);
            if (data) {
                if (msg.type === DataType.Gyro || msg.type === DataType.Acceleration) {
                    if (data.length > CHARTEABLE_DATA_THRESHOLD) {
                        data.shift();
                    }
                } else {
                    if (data.length > MESSAGE_THRESHOLD) {
                        data.shift();
                    }
                }
                data.push(msg);
            } else {
                this.rawData.set(msg.type, [msg]);
            }
        });
    }

    @action
    registerData(data: ClientDataMsg) {
        switch (data.type) {
            case DataType.Notification:
                this.notifications.push(
                    new Notification(data, (notification: Notification) => {
                        this.notifications.remove(notification);
                    })
                );
                break;
            case DataType.InputPrompt:
                this.inputPrompts.push(new InputPrompt(data, this.socket));
                break;
            case DataType.CancelUserInput:
                switch (data.input_type) {
                    case DataType.InputPrompt:
                        const prompt = this.inputPrompts.find(
                            (p) => p.responseId === data.response_id && p.timeStamp === data.time_stamp
                        );
                        prompt?.cancel(false);
                        break;
                    case DataType.Notification:
                        const notification = this.notifications.find(
                            (n) => n.responseId === data.response_id && n.timeStamp === data.time_stamp
                        );
                        if (notification) {
                            this.notifications.remove(notification);
                        }
                        break;
                }
                break;
            case DataType.Sprite:
                this.playground.addOrUpdateSprite(data.sprite);
                break;
            case DataType.Line:
                this.playground.addOrUpdateLine(data.line);
                break;
            case DataType.Lines:
                this.playground.addOrUpdateLines(...data.lines);
                break;
            case DataType.RemoveSprite:
                this.playground.removeSprite(data.id);
                break;
            case DataType.RemoveLine:
                this.playground.removeLine(data.id);
                break;
            case DataType.ClearPlayground:
                this.playground.clearSprites();
                this.playground.clearLines();
                const wasRunning = this.playground.isRunning;
                this.playground.stop();
                this.playground = new Playground(this.socket);
                if (wasRunning) {
                    this.playground.start();
                }

                break;
            case DataType.Sprites:
                this.playground.addOrUpdateSprites(...data.sprites);
                break;
            case DataType.PlaygroundConfig:
                this.playground.updateConfig(data.config);
                break;
            case DataType.Color:
                this.colorPanel = new ColorPanel(data, this.socket);
                break;
            case DataType.Grid:
                this.colorGrid = new ColorGrid(data, this.socket);
                break;
            case DataType.GridUpdate:
                this.colorGrid.update(data);
                break;
        }
    }

    @action
    clear() {
        this.playground.clearSprites();
        this.playground.clearLines();
        this.playground.stop();
        this.notifications.clear();
        this.inputPrompts.clear();
        this.rawData.clear();
        this.displayOptions.clear();
    }
}
