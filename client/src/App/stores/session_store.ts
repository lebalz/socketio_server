import { action } from 'mobx';
import { RootStore, Store } from './root_store';
import { createBrowserHistory, Location } from 'history';
import { SynchronizedHistory, RouterStore, syncHistoryWithStore } from 'mobx-react-router';

class SessionStore implements Store {
    browserHistory = createBrowserHistory();
    history: SynchronizedHistory;

    constructor(root: RootStore, routerStore: RouterStore) {
        this.history = syncHistoryWithStore(this.browserHistory, routerStore);
    }

    get route(): Location {
        const { location } = this.history;
        return location;
    }

    @action
    cleanup() {}
}

export default SessionStore;
