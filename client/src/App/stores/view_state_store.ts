import { DataType, Key } from './../../Shared/SharedTypings';
import { observable, action, computed } from 'mobx';
import { RootStore, Store } from './root_store';
import { AccelerationData } from '../components/Controls/Sensors/AccelerationSensor';
import { GyroData } from '../components/Controls/Sensors/GyroSensor';
import { timeStamp } from './socket_data_store';

const MAX_SENSOR_VALUES = 100;
class ControllerState {
    @observable
    streamSenensor: boolean = false;
    @observable
    simulateSensor: boolean = false;
    @observable
    acceleration: boolean = localStorage.getItem('devicemotion') === 'on';
    @observable
    gyro: boolean = localStorage.getItem('deviceorientation') === 'on';
    lastAccValues = observable<AccelerationData>([]);
    lastGyroValues = observable<GyroData>([]);
    @observable
    lastCommands: { timeStamp: number; key: Key }[] = observable([]);
    @observable
    showLogs: boolean = true;

    @action
    addAccFrame(acc: AccelerationData) {
        if (this.lastAccValues.length > MAX_SENSOR_VALUES) {
            this.lastAccValues.replace([...this.lastAccValues.slice(1), acc]);
        } else {
            this.lastAccValues.push(acc);
        }
    }
    @action
    addGyroFrame(gyro: GyroData) {
        if (this.lastGyroValues.length > MAX_SENSOR_VALUES) {
            this.lastGyroValues.replace([...this.lastGyroValues.slice(1), gyro]);
        } else {
            this.lastGyroValues.push(gyro);
        }
    }
}

class State {
    @observable
    noSleepOn: boolean = false;
    @observable
    deviceIdPromptOpen: boolean = false;
    @observable
    inputPromptOpen: boolean = false;
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
    displayedStoreNrs = observable<{ nr: number; id: string }>([]);
    displayedStoreIds = observable.set<string>([]);
    displayedTypes = observable.set<DataType>([]);
    @observable
    showAllDevices: boolean = false;
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

class ViewStateStore implements Store {
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
    setInputPromptOpen(open: boolean) {
        this.state.inputPromptOpen = open;
    }

    @computed
    get inputPromptOpen(): boolean {
        return this.state.inputPromptOpen;
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
