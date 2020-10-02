import { observable, action, computed } from 'mobx';
import { RootStore } from './root_store';
import SocketData from '../SocketData';

class State {
    @observable
    deviceNr: number = -1;
}

class DataStore {
    @observable.ref
    private state = new State();
    private readonly root: RootStore;
    @observable.ref
    socket: SocketData = new SocketData();

    constructor(root: RootStore) {
        this.root = root;
        this.socket.onDevice = (deviceNr) => {
            if (this.state.deviceNr !== deviceNr) {
                this.setDeviceNr(deviceNr);
            }
        };
    }

    @action
    setDeviceNr(deviceNr: number) {
        this.state.deviceNr = deviceNr;
    }

    @computed
    get deviceNr(): number {
        return this.state.deviceNr;
    }

    @action
    setDeviceId(deviceId: string, saveToLocalStorage: boolean = true) {
        this.socket.setDeviceId(deviceId, saveToLocalStorage);
    }

    @computed
    get deviceId(): string {
        return this.socket.deviceId;
    }
    @action
    cleanup() {
        this.state = new State();
    }
}

export default DataStore;
