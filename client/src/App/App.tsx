import React, { Component, Fragment } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Controller from './pages/Controller';
import SocketData from './SocketData';
import 'semantic-ui-css/semantic.min.css';
import ColorPanel from './pages/ColorPanel';
import ColorGrid from './pages/ColorGrid';
import { Label } from 'semantic-ui-react';
import Admin from './pages/Admin';
import NoSleep from 'nosleep.js';
import NotificationList from './components/NotificationList';
import InputPromptContainer from './components/InputPromptContainer';
import DeviceIdPrompt from './components/DeviceIdPrompt';
import PlaygroundContainer from './pages/PlaygroundContainer';

interface State {
  deviceId: string;
  valid: boolean;
  deviceNr: number;
  noSleep: boolean;
  deviceIdPromptOpen: boolean;
}

class App extends Component {
  state: State = {
    valid: true,
    deviceId: `Device${Math.floor(Math.random() * 899) + 100}`,
    deviceNr: -1,
    noSleep: false,
    deviceIdPromptOpen: false,
  };
  socket: SocketData = new SocketData();

  constructor(props: any) {
    super(props);
    this.socket.onDevice = (deviceNr) => {
      if (this.state.deviceNr !== deviceNr) {
        this.setState({
          deviceNr: deviceNr,
        });
      }
    };
  }

  componentDidMount() {
    const querySearchId = new URLSearchParams(window.location.search).get('device_id');
    const deviceId = querySearchId || localStorage.getItem('device_id');
    if (deviceId) {
      this.setState({ deviceId: deviceId });
    }
    window.addEventListener('focus', this.onWakeUp);
    this.onWakeUp();
    this.socket.setDeviceId(deviceId || this.state.deviceId);
    (window as any).noSleep = new NoSleep();
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.onWakeUp);
  }

  onWakeUp = () => {
    this.socket.wakeUp();
  };

  disableNoSleep = () => {
    this.setNoSleep(false);
  };

  setNoSleep = (on: boolean) => {
    try {
      const ns = (window as any).noSleep as any;
      if (on) {
        ns.enable();
        this.setState({ noSleep: true });
      } else {
        ns.disable();
        this.setState({ noSleep: false });
      }
    } catch {}
  };
  toggleNoSleep = () => {
    try {
      const ns = (window as any).noSleep as any;
      this.setNoSleep(!ns._wakeLock);
    } catch {}
  };

  onSetDeviceId = (deviceId: string) => {
    this.setState({ deviceId: deviceId, deviceIdPromptOpen: false });
    this.socket.setDeviceId(deviceId);
    localStorage.setItem('device_id', deviceId);
    this.socket.setDeviceId(deviceId);
  };

  render() {
    const App = () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div className="header-bar">
          <Link to="/">
            <Label icon="home" size="small" onClick={this.disableNoSleep} />
          </Link>
          <div>
            <Label size="small" content={`Nr. ${this.state.deviceNr}`} />
          </div>
          <div>
            <Label
              as="a"
              size="small"
              icon="lightbulb outline"
              onClick={this.toggleNoSleep}
              color={this.state.noSleep ? 'yellow' : undefined}
            />
          </div>
          <div className="spacer" />
          <div style={{ margin: '0.25em 0' }}>
            <label htmlFor="device-id" style={{ marginRight: '1em' }}>
              DeviceID
            </label>
            <input
              key="device-id"
              type="string"
              value={this.state.deviceId}
              readOnly
              onClick={() => this.setState({ deviceIdPromptOpen: true })}
            />
          </div>
          <div className="spacer" />
        </div>
        <Switch>
          <Route
            exact
            path="/"
            component={() => <Home noSleep={this.state.noSleep} setNoSleep={this.setNoSleep} />}
          />
          <Route path="/controller/:device_id?" component={() => <Controller socket={this.socket} />} />
          <Route path="/color_panel/:device_id?" component={() => <ColorPanel socket={this.socket} />} />
          <Route path="/color_grid/:device_id?" component={() => <ColorGrid socket={this.socket} />} />
          <Route path="/admin/:device_id?" component={() => <Admin socket={this.socket} />} />
          <Route
            path="/playground/:device_id?"
            component={() => <PlaygroundContainer socket={this.socket} />}
          />
        </Switch>
      </div>
    );
    return (
      <Fragment>
        <Switch>
          <App />
        </Switch>
        <NotificationList socket={this.socket} />
        <InputPromptContainer socket={this.socket} />
        <DeviceIdPrompt
          open={this.state.deviceIdPromptOpen}
          onCancel={() => this.setState({ deviceIdPromptOpen: false })}
          onSetDeviceId={this.onSetDeviceId}
          deviceId={this.state.deviceId}
        />
      </Fragment>
    );
  }
}

export default App;
