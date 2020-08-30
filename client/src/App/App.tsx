import React, { Component, Fragment } from "react";
import { Route, Switch, Link } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Controller from "./pages/Controller";
import SocketData from "./SocketData";
import "semantic-ui-css/semantic.min.css";
import ColorPanel from "./pages/ColorPanel";
import ColorGrid from "./pages/ColorGrid";
import { Label } from "semantic-ui-react";
import Admin from "./pages/Admin";
import NoSleep from "nosleep.js";
import NotificationList from "./components/NotificationList";
import InputPromptContainer from "./components/InputPromptContainer";

interface State {
  deviceId: string;
  valid: boolean;
  deviceNr: number;
}

class App extends Component {
  state: State = {
    deviceId: `Device${Math.floor(Math.random() * 899) + 100}`,
    valid: true,
    deviceNr: -1,
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
    const querySearchId = new URLSearchParams(window.location.search).get(
      "device_id"
    );
    const deviceId = querySearchId || localStorage.getItem("device_id");
    if (deviceId) {
      this.setState({ deviceId: deviceId });
    }
    this.socket.setDeviceId(deviceId || this.state.deviceId);
    (window as any).noSleep = new NoSleep();
  }

  onChangeDeviceId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const deviceId = event.target.value;
    this.setState({ deviceId: deviceId });
    localStorage.setItem("device_id", deviceId);
    this.socket.setDeviceId(deviceId);
  };

  disableNoSleep = () => {
    try {
      ((window as any).noSleep as NoSleep).disable();
    } catch {}
  };

  render() {
    const App = () => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="header-bar">
          <Link to="/">
            <Label icon="home" size="small" onClick={this.disableNoSleep} />
          </Link>
          <div>
            <Label size="small" content={`Nr. ${this.state.deviceNr}`} />
          </div>
          <div className="spacer" />
          <span style={{ margin: "0.25em 0" }}>
            <label htmlFor="device-id" style={{ marginRight: "1em" }}>
              DeviceID
            </label>
            <input
              id="device-id"
              type="text"
              onChange={this.onChangeDeviceId}
              defaultValue={this.state.deviceId}
              title={this.state.valid ? undefined : "ID wird bereits verwendet"}
              autoFocus
              style={{ maxWidth: "10rem" }}
            />
          </span>
          <div className="spacer" />
        </div>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route
            path="/controller/:device_id?"
            component={() => <Controller socket={this.socket} />}
          />
          <Route
            path="/color_panel/:device_id?"
            component={() => <ColorPanel socket={this.socket} />}
          />
          <Route
            path="/color_grid/:device_id?"
            component={() => <ColorGrid socket={this.socket} />}
          />
          <Route
            path="/admin/:device_id?"
            component={() => <Admin socket={this.socket} />}
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
      </Fragment>
    );
  }
}

export default App;
