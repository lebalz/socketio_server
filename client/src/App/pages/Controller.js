import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Segment, Form } from 'semantic-ui-react';
import { SocketEvents } from '../SocketData';
import MotionSimulator from '../Simulator'

class Controller extends Component {
  state = {
    streamSenensor: false,
    simulateSensor: false,
    acceleration: true,
    gyro: true,
    currentAcceleration: {},
    currentGyro: {},
    lastCommands: [],
    showLogs: true
  }
  simulator = new MotionSimulator();

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
    this.socket.addData({ type: 'key', key: action});
  }

  requestMotionPermission(onGrant) {
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

  requestOrientationPermission(onGrant) {
    // feature detect
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
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
    if (!this.state.acceleration) {
      return;
    }
    sensor['x'] = e.accelerationIncludingGravity.x;
    sensor['y'] = e.accelerationIncludingGravity.y;
    sensor['z'] = e.accelerationIncludingGravity.z;
    sensor['interval'] = e.interval;
    const motionData = {
      type: 'acceleration',
      acceleration: sensor
    };
    this.setState({ currentAcceleration: motionData })
    this.socket.addData(motionData);
  };


  onDeviceOrientation = (e) => {
    const sensor = {}
    if (!this.state.gyro) {
      return;
    }
    sensor['alpha'] = e.alpha;
    sensor['beta'] = e.beta;
    sensor['gamma'] = e.gamma;
    sensor['absolute'] = e.absolute;
    const gyroData = {
      type: 'gyro',
      gyro: sensor
    };
    this.setState({ currentGyro: gyroData });
    this.socket.addData(gyroData);
  };

  setupAccelerationStream(simulateSensor) {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }
    this.requestMotionPermission(() => {
      if (simulateSensor) {
        deviceSimulator.addEventListener("devicemotion", this.onDevicemotion, true);
        window.removeEventListener("devicemotion", this.onDevicemotion, true);
        this.simulator.startMotionSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      } else {
        deviceSimulator.removeEventListener("devicemotion", this.onDevicemotion, true);
        window.addEventListener("devicemotion", this.onDevicemotion, true);
        this.simulator.stopMotionSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      }
    })
  }

  setupGyroStream(simulateSensor) {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }
    this.requestOrientationPermission(() => {
      if (simulateSensor) {
        deviceSimulator.addEventListener("deviceorientation", this.onDeviceOrientation, true);
        window.removeEventListener("deviceorientation", this.onDeviceOrientation, true);
        this.simulator.startOrientationSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      } else {
        deviceSimulator.removeEventListener("deviceorientation", this.onDeviceOrientation, true);
        window.addEventListener("deviceorientation", this.onDeviceOrientation, true);
        this.simulator.stopOrientationSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      }
    })
  }

  setupSensorStream(simulateSensor) {
    if (this.state.acceleration) {
      this.setupAccelerationStream(simulateSensor)
    }
    if (this.state.gyro) {
      this.setupGyroStream(simulateSensor)
    }
    this.setState({ simulateSensor: simulateSensor })
  }

  toggleSensorStream = () => {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }

    if (this.state.streamSenensor) {
      window.removeEventListener("devicemotion", this.onDevicemotion, true);
      window.removeEventListener("deviceorientation", this.onDeviceOrientation, true);
      deviceSimulator.removeEventListener("devicemotion", this.onDevicemotion, true);
      deviceSimulator.removeEventListener("deviceorientation", this.onDeviceOrientation, true);
      this.simulator.stopSimulation()
      this.setState({ streamSenensor: false });
    } else {
      this.setupSensorStream(this.state.simulateSensor)
      this.setState({ streamSenensor: true });
    }
  }

  toggleAccelerationStream = () => {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }

    if (this.state.acceleration) {
      window.removeEventListener("devicemotion", this.onDevicemotion, true);
      deviceSimulator.removeEventListener("devicemotion", this.onDevicemotion, true);
      this.simulator.stopMotionSimulation()
      this.setState({ acceleration: false });
    } else {
      this.setupAccelerationStream(this.state.simulateSensor)
      this.setState({ acceleration: true });
    }
  }

  toggleGyroStream = () => {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }

    if (this.state.gyro) {
      window.removeEventListener("deviceorientation", this.onDeviceOrientation, true);
      deviceSimulator.removeEventListener("deviceorientation", this.onDeviceOrientation, true);
      this.simulator.stopOrientationSimulation()
      this.setState({ gyro: false });
    } else {
      this.setupGyroStream(this.state.simulateSensor)
      this.setState({ gyro: true });
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
            <Button circular icon="circle" onClick={() => this.onClick('home')} className="action middle" size="huge" />
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
                <Checkbox checked={this.state.acceleration} onClick={this.toggleAccelerationStream} label="Stream Acceleration" />
                <Checkbox checked={this.state.gyro} onClick={this.toggleGyroStream} label="Stream Gyro" />
              </Fragment>

            )}
          </div>
        </Segment>
        <Segment style={{ width: '100%' }}>
          <Checkbox label="Logs Anzeigen" checked={this.state.showLogs} onClick={() => this.setState({ showLogs: !this.state.showLogs })} />
          {this.state.showLogs && (
            <div style={{ margin: '1em' }}>
              {this.state.lastCommands.slice().reverse().map((cmd) => {
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
          {this.state.showLogs && this.state.streamSenensor && this.state.acceleration && (
            <div style={{ margin: '1em' }}>
              <pre>
                <code>
                  {JSON.stringify(this.state.currentAcceleration, null, 2)}
                </code>
              </pre>
            </div>
          )}
          {this.state.showLogs && this.state.streamSenensor && this.state.gyro && (
            <div style={{ margin: '1em' }}>
              <pre>
                <code>
                  {JSON.stringify(this.state.currentGyro, null, 2)}
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