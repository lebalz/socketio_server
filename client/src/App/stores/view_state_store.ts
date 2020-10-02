import { Key } from './../../Shared/SharedTypings';
import { observable, action, computed } from 'mobx';
import { RootStore } from './root_store';
import { AccelerationData } from '../components/Controls/Sensors/AccelerationSensor';
import { GyroData } from '../components/Controls/Sensors/GyroSensor';
import { timeStamp } from '../SocketData';

class ControllerState {
    @observable
    streamSenensor: boolean = false;
    @observable
    simulateSensor: boolean = false;
    @observable
    acceleration: boolean = true;
    @observable
    gyro: boolean = true;
    @observable
    lastAcceleration?: AccelerationData;
    @observable
    lastGyro?: GyroData;
    @observable
    lastCommands: { timeStamp: number; key: Key }[] = observable([]);
    @observable
    showLogs: boolean = true;
}

class State {
    @observable
    noSleepOn: boolean = false;
    @observable
    deviceIdPromptOpen: boolean = false;
}

class ColorState {
    color: string = '#aaffff';
    touched: boolean = false;
    displayedAt?: number = timeStamp();
}

class ColorGridState {
    @observable
    width: number = 500;
    @observable
    height: number = 500;
    @observable
    x: number = 0;
    @observable
    y: number = 0;
}

class AdminState {
    @observable
    showRaw: boolean = false;
}

class PlaygroundState {
    @observable
    simulateSensor: boolean = false;
    @observable
    keyControls: boolean = true;

    @observable
    innerWidth: number = 100;
    @observable
    innerHeight: number = 100;
}

class ViewStateStore {
    private readonly root: RootStore;
    @observable.ref
    private state = new State();

    @observable.ref
    controllerState = new ControllerState();

    @observable.ref
    colorState = new ColorState();

    @observable.ref
    gridState = new ColorGridState();

    @observable.ref
    adminState = new AdminState();

    @observable.ref
    playgroundState = new PlaygroundState();

    constructor(root: RootStore) {
        this.root = root;
    }

    @action
    setDeviceIdPromptOpen(open: boolean) {
        this.state.deviceIdPromptOpen = open;
    }

    @computed
    get deviceIdPromptOpen(): boolean {
        return this.state.deviceIdPromptOpen;
    }

    @action
    toggleNoSleep() {
        this.setNoSleep(!this.noSleepOn);
    }
    @action
    disableNoSleep() {
        this.setNoSleep(false);
    }

    @action
    setNoSleep(on: boolean) {
        try {
            const ns = (window as any).noSleep as any;
            if (on) {
                ns.enable();
                this.state.noSleepOn = true;
            } else {
                ns.disable();
                this.state.noSleepOn = false;
            }
        } catch {}
    }

    @computed
    get noSleepOn(): boolean {
        return this.state.noSleepOn;
    }
    @action
    cleanup() {
        this.state = new State();
    }
}

export default ViewStateStore;
