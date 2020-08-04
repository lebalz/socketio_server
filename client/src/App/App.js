import React, { Component } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Controller from './pages/Controller';
import SocketData from './SocketData';
import 'semantic-ui-css/semantic.min.css'
import ColorPanel from './pages/ColorPanel';
import ColorGrid from './pages/ColorGrid';
import { Button, Label } from 'semantic-ui-react';

class App extends Component {
  state = { deviceId: `Device${Math.floor(Math.random() * 899) + 100}`, valid: true, deviceNr: -1 }
  socket = new SocketData();

  constructor(props) {
    super(props);
    this.socket.onDeviceNr = (deviceNr) => {
      this.setState({ deviceNr: deviceNr });
    }
  }

  componentDidMount() {
    const deviceId = localStorage.getItem('device_id');
    if (deviceId) {
      this.setState({ deviceId: deviceId });
    }
    this.socket.setDeviceId(deviceId || this.state.deviceId);
  }

  onChangeDeviceId = (event) => {
    const deviceId = event.target.value;
    this.setState({ deviceId: deviceId });
    localStorage.setItem('device_id', deviceId);
    this.socket.setDeviceId(deviceId);
  }



  render() {
    const App = () => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{display: 'flex', flexDirection: 'row', position: 'absolute', left: '4px', top: '4px'}}>
          <Link to="/">
            <Label icon="home" size="small" />
          </Link>
          <Label size="small" content={`Nr. ${this.state.deviceNr}`} />
        </div>
        <span>
          <label htmlFor="device-id" style={{ marginRight: '1em' }}>DeviceID</label>
          <input
            id="device-id"
            type="text"
            onChange={this.onChangeDeviceId}
            value={this.state.deviceId}
            valid={this.state.valid ? 'true' : 'false'}
            title={this.state.valid ? undefined : 'ID wird bereits verwendet'}
            autoFocus
            style={{ maxWidth: '10rem' }}
          />
        </span>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/controller' component={() => <Controller socket={this.socket} />} />
          <Route path='/color_panel' component={() => <ColorPanel socket={this.socket} />} />
          <Route path='/color_grid' component={() => <ColorGrid socket={this.socket} />} />
        </Switch>
      </div>
    )
    return (
      <Switch>
        <App />
      </Switch>
    );
  }
}

export default App;
