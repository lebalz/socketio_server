import { Playground } from './Playground';
import { action, observable } from 'mobx';
import { ClientDataMsg, DataType } from '../../Shared/SharedTypings';
import { ColorGrid, defaultGrid } from './ColorGrid/ColorGrid';
import { ColorPanel, defaultColorPanelMsg } from './ColorPanel';
import { Notification } from './Notification';
import SocketDataStore from '../stores/socket_data_store';
import { InputPrompt } from './InputPrompt';

const MESSAGE_THRESHOLD = 50;
export default class ClientData {
    deviceId: string;
    socket: SocketDataStore;
    rawData = observable.map<string, ClientDataMsg[]>({});

    @observable
    show: boolean = true;

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
            let data = this.rawData.get(msg.type);
            if (data) {
                if (data.length > MESSAGE_THRESHOLD) {
                    data.pop();
                }
            } else {
                data = observable<ClientDataMsg>([]);
                this.rawData.set(msg.type, data);
            }
            data.unshift(msg);
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
                this.inputPrompts.push(
                    new InputPrompt(data, this.socket, (prompt: InputPrompt) =>
                        this.inputPrompts.remove(prompt)
                    )
                );
                break;
            case DataType.Sprite:
                this.playground.addOrUpdateSprite(data.sprite);
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
}
