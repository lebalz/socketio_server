import { observable, action } from 'mobx';
import RouterStore from './router_store';
import SessionStore from './session_store';
import ViewStateStore from './view_state_store';
import DataStore from './data_store';

export interface Store {
    cleanup: () => void;
}

export class RootStore implements Store {
    stores = observable<Store>([]);
    routing: RouterStore;
    session: SessionStore;
    viewStateStore: ViewStateStore;
    dataStore: DataStore;

    @observable initialized = false;

    constructor() {
        this.routing = new RouterStore();
        this.stores.push(this.routing);

        this.session = new SessionStore(this, this.routing);
        this.stores.push(this.session);

        this.viewStateStore = new ViewStateStore(this);
        this.stores.push(this.viewStateStore);

        this.dataStore = new DataStore(this);
        this.stores.push(this.dataStore);

        this.initialized = true;
    }

    @action cleanup() {
        this.stores.forEach((store) => store.cleanup());
    }
}

const instance = new RootStore();
(window as any).store = instance;

export default instance;
