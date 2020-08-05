import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Segment, Form } from 'semantic-ui-react';
import { SocketEvents } from '../SocketData';
import MotionSimulator from '../Simulator'

class Controller extends Component {
  state = {
    streamSenensor: false,
    simulateSensor: false,
    acceleration: true,
    rotation: true,
    currentSensorFrame: {},
    lastCommands: [],
    showLogs: false
  }
  // Initialize the state
  constructor(props) {
    super(props);
    this.socket = props.socket
  }

  onClick(action) {
    const cmds = this.state.lastCommands
    if (cmds.length > 5) {
      cmds.shift();
    }
    cmds.push({ timeStamp: Date.now(), key: action });
    this.setState({ lastCommands: cmds });
    this.socket.addData({ type: 'key', key: action });
  }

  requestPermission(onGrant) {
    // feature detect
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            onGrant()
          }
        })
        .catch(console.error);
    } else {
      onGrant()
    }
  }



  onDevicemotion = (e) => {
    const sensor = {}
    if (this.state.acceleration) {
      sensor['x'] = e.accelerationIncludingGravity.x;
      sensor['y'] = e.accelerationIncludingGravity.y;
      sensor['z'] = e.accelerationIncludingGravity.z;
    }
    if (this.state.rotation) {
      sensor['alpha'] = e.rotationRate.alpha;
      sensor['beta'] = e.rotationRate.beta;
      sensor['gamma'] = e.rotationRate.gamma;
    }
    this.setState({ currentSensorFrame: sensor })
    const motionData = {
      type: 'sensor',
      sensor: sensor
    };
    this.socket.emit(SocketEvents.NewData, motionData);
  };

  setupSensorStream(simulateSensor) {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }
    this.requestPermission(() => {
      if (simulateSensor) {
        deviceSimulator.addEventListener("devicemotion", this.onDevicemotion, true);
        window.removeEventListener("devicemotion", this.onDevicemotion, true);
        const simulator = new MotionSimulator();
        this.setState({ simulateSensor: simulateSensor, simulator: simulator, streamSenensor: true });
      } else {
        deviceSimulator.removeEventListener("devicemotion", this.onDevicemotion, true);
        window.addEventListener("devicemotion", this.onDevicemotion, true);
        if (this.state.simulator) {
          this.state.simulator.stopSimulation();
        }
        this.setState({ simulateSensor: simulateSensor, simulator: undefined, streamSenensor: true });
      }
    })
  }

  toggleSensorStream = () => {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }

    if (this.state.streamSenensor) {
      window.removeEventListener("devicemotion", this.onDevicemotion, true);
      deviceSimulator.removeEventListener("devicemotion", this.onDevicemotion, true);
      this.setState({ streamSenensor: false, simulator: undefined });
    } else {
      this.setupSensorStream(this.state.simulateSensor)
    }
  }

  render() {
    return (
      <Fragment>
        <div className="control">
          <h1>Controller</h1>
          <div className="actions">
            <Button icon="angle up" onClick={() => this.onClick('up')} className="action up" size="huge" />
            <Button icon="angle right" onClick={() => this.onClick('right')} className="action right" size="huge" />
            <Button icon="angle down" onClick={() => this.onClick('down')} className="action down" size="huge" />
            <Button icon="angle left" onClick={() => this.onClick('left')} className="action left" size="huge" />
          </div>
        </div>
        <Segment>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Form.Field>
              <Checkbox checked={this.state.streamSenensor} onClick={this.toggleSensorStream} label="Sensoren Streamen" />
            </Form.Field>
            {this.state.streamSenensor && (
              <Fragment>
                <Checkbox checked={this.state.simulateSensor} onClick={() => this.setupSensorStream(!this.state.simulateSensor)} label="Simulate Sensors" />
                <Checkbox checked={this.state.acceleration} onClick={() => this.setState({ acceleration: !this.state.acceleration })} label="Stream Acceleration" />
                <Checkbox checked={this.state.rotation} onClick={() => this.setState({ rotation: !this.state.rotation })} label="Stream Rotation" />
              </Fragment>

            )}
          </div>
        </Segment>
        <Segment style={{width: '100%'}}>
          <Checkbox label="Logs Anzeigen" checked={this.state.showLogs} onClick={() => this.setState({ showLogs: !this.state.showLogs })} />
          {this.state.showLogs && (
            <div style={{ margin: '1em' }}>
              {this.state.lastCommands.map((cmd) => {
                return (
                  <div key={cmd.timeStamp}>
                    {(new Date(cmd.timeStamp)).toLocaleTimeString()}:{' '}
                    <i>
                      {cmd.key}
                    </i>
                  </div>
                )
              })}
            </div>
          )}
          {this.state.showLogs && this.state.streamSenensor && (
            <div style={{ margin: '1em' }}>
              <pre>
                <code>
                  {JSON.stringify(this.state.currentSensorFrame, null, 2)}
                </code>
              </pre>
            </div>
          )}
        </Segment>
      </Fragment>
    );
  }
}

export default Controller;