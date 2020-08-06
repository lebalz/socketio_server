import React, { Component } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Controller from './pages/Controller';
import SocketData from './SocketData';
import 'semantic-ui-css/semantic.min.css'
import ColorPanel from './pages/ColorPanel';
import ColorGrid from './pages/ColorGrid';
import { Label } from 'semantic-ui-react';
import Admin from './pages/Admin';
import NoSleep from 'nosleep.js';

class App extends Component {
  state = { deviceId: `Device${Math.floor(Math.random() * 899) + 100}`, valid: true, deviceNr: -1 }
  socket = new SocketData();

  constructor(props) {
    super(props);
    this.socket.onDevice = (deviceNr) => {
      this.setState({ deviceNr: deviceNr });
    }
  }

  componentDidMount() {
    const querySearchId = new URLSearchParams(window.location.search).get('deviceId')
    const deviceId = querySearchId || localStorage.getItem('device_id');
    if (deviceId) {
      this.setState({ deviceId: deviceId });
    }
    this.socket.setDeviceId(deviceId || this.state.deviceId);
    window.noSleep = new NoSleep();
  }

  onChangeDeviceId = (event) => {
    const deviceId = event.target.value;
    this.setState({ deviceId: deviceId });
    localStorage.setItem('device_id', deviceId);
    this.socket.setDeviceId(deviceId);
  }

  disableNoSleep = () => {
    try {
      window.noSleep.disable()
    } catch {
    }
  }


  render() {
    const App = () => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'row', position: 'absolute', left: '4px', top: '4px' }}>
          <Link to="/">
            <Label icon="home" size="small" onClick={this.disableNoSleep} />
          </Link>
          <Label size="small" content={`Nr. ${this.state.deviceNr}`} />
        </div>
        <span style={{ margin: '0.25em 0' }}>
          <label htmlFor="device-id" style={{ marginRight: '1em' }}>DeviceID</label>
          <input
            id="device-id"
            type="text"
            onChange={this.onChangeDeviceId}
            defaultValue={this.state.deviceId}
            valid={this.state.valid ? 'true' : 'false'}
            title={this.state.valid ? undefined : 'ID wird bereits verwendet'}
            autoFocus
            style={{ maxWidth: '10rem' }}
          />
        </span>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/controller/:deviceId?' component={() => <Controller socket={this.socket} />} />
          <Route path='/color_panel/:deviceId?' component={() => <ColorPanel socket={this.socket} />} />
          <Route path='/color_grid/:deviceId?' component={() => <ColorGrid socket={this.socket} />} />
          <Route path='/admin/:deviceId?' component={() => <Admin socket={this.socket} />} />
        </Switch>
      </div>
    )
    return (
      <Switch>
        {/* <Route exact path='/' component={App} /> */}
        <App />
      </Switch>
    );
  }
}

export default App;
