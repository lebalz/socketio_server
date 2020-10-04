import React, { Component, Fragment } from 'react';
import { Route, Switch, Router } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Controller from './pages/Controller';
import 'semantic-ui-css/semantic.min.css';
import ColorPanel from './pages/ColorPanel';
import ColorGrid from './pages/ColorGrid';
import Admin from './pages/Admin';
import NoSleep from 'nosleep.js';
import NotificationList from './components/NotificationList';
import DeviceIdPrompt from './components/DeviceIdPrompt';
import { observer, Provider } from 'mobx-react';
import rootStore from './stores/root_store';
import Header from './components/Header';
import Playground from './pages/Playground';
import InputPrompt from './components/InputPrompt';

const AppContent = observer(() => (
    <Provider
        rootStore={rootStore}
        routerStore={rootStore.routing}
        viewStateStore={rootStore.viewStateStore}
        socketDataStore={rootStore.socketDataStore}
    >
        <Router history={rootStore.session.history}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Header />
                <Switch>
                    <Route exact path="/" component={() => <Home />} />
                    <Route path="/controller/:device_id?" component={() => <Controller />} />
                    <Route path="/color_panel/:device_id?" component={() => <ColorPanel />} />
                    <Route path="/color_grid/:device_id?" component={() => <ColorGrid />} />
                    <Route path="/admin/:device_id?" component={() => <Admin />} />
                    <Route path="/playground/:device_id?" component={() => <Playground />} />
                </Switch>
            </div>
        </Router>
        <NotificationList />
        <InputPrompt />
        <DeviceIdPrompt />
    </Provider>
));

@observer
class App extends Component {
    componentDidMount() {
        const querySearchId = new URLSearchParams(window.location.search).get('device_id');
        if (querySearchId) {
            rootStore.socketDataStore.setDeviceId(querySearchId, false);
        }
        (window as any).noSleep = new NoSleep();
    }

    render() {
        return (
            <Fragment>
                <Switch>
                    <AppContent />
                </Switch>
            </Fragment>
        );
    }
}

export default App;
