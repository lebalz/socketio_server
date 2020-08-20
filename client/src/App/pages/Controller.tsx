import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Segment, Form } from 'semantic-ui-react';
import MotionSimulator from '../Simulator'
import SocketData, { Key, AccMsg, GyroMsg, KeyMsg } from '../SocketData';

interface Props {
  socket: SocketData;
}

interface ControllerState {
  streamSenensor: boolean,
  simulateSensor: boolean,
  acceleration: boolean,
  gyro: boolean,
  currentAcceleration?: AccMsg,
  currentGyro?: GyroMsg,
  lastCommands: { timeStamp: number, key: Key}[],
  showLogs: boolean
}

class Controller extends Component<Props> {
  state: ControllerState = {
    streamSenensor: false,
    simulateSensor: false,
    acceleration: true,
    gyro: true,
    currentAcceleration: undefined,
    currentGyro: undefined,
    lastCommands: [],
    showLogs: true
  }
  simulator = new MotionSimulator();
  socket: SocketData;

  // Initialize the state
  constructor(props: Props) {
    super(props);
    this.socket = props.socket;
  }

  componentWillUnmount() {
    this.stopSensorStream();
  }

  onClick(action: Key) {
    const cmds = this.state.lastCommands
    if (cmds.length > 5) {
      cmds.shift();
    }
    cmds.push({ timeStamp: Date.now() / 1000.0, key: action });
    this.setState({ lastCommands: cmds });
    this.socket.addData({ type: 'key', key: action });
  }

  requestMotionPermission(onGrant: () => void) {
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

  requestOrientationPermission(onGrant: () => void) {
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



  onDevicemotion = (e: DeviceMotionEvent) => {
    if (!this.state.acceleration) {
      return;
    }
    if (e.accelerationIncludingGravity == null) {
      return;
    }
    const motionData = {
      type: 'acceleration',
      x: e.accelerationIncludingGravity.x,
      y: e.accelerationIncludingGravity.y,
      z: e.accelerationIncludingGravity.z,
      interval: e.interval
    };
    this.setState({ currentAcceleration: motionData })
    this.socket.addData(motionData);
  };


  onDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (!this.state.gyro) {
      return;
    }
    const gyroData = {
      type: 'gyro',
      alpha: e.alpha,
      beta: e.beta,
      gamma: e.gamma,
      absolute: e.absolute
    };
    this.setState({ currentGyro: gyroData });
    this.socket.addData(gyroData);
  };

  setupAccelerationStream(simulateSensor: boolean) {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }
    this.requestMotionPermission(() => {
      if (simulateSensor) {
        deviceSimulator.addEventListener("devicemotion", this.onDevicemotion as any, true);
        window.removeEventListener("devicemotion", this.onDevicemotion, true);
        this.simulator.startMotionSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      } else {
        deviceSimulator.removeEventListener("devicemotion", this.onDevicemotion as any, true);
        window.addEventListener("devicemotion", this.onDevicemotion, true);
        this.simulator.stopMotionSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      }
    })
  }

  setupGyroStream(simulateSensor: boolean) {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }
    this.requestOrientationPermission(() => {
      if (simulateSensor) {
        deviceSimulator.addEventListener("deviceorientation", this.onDeviceOrientation as any, true);
        window.removeEventListener("deviceorientation", this.onDeviceOrientation, true);
        this.simulator.startOrientationSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      } else {
        deviceSimulator.removeEventListener("deviceorientation", this.onDeviceOrientation as any, true);
        window.addEventListener("deviceorientation", this.onDeviceOrientation, true);
        this.simulator.stopOrientationSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      }
    })
  }

  setupSensorStream(simulateSensor:boolean) {
    if (this.state.acceleration) {
      this.setupAccelerationStream(simulateSensor)
    }
    if (this.state.gyro) {
      this.setupGyroStream(simulateSensor)
    }
    this.setState({ simulateSensor: simulateSensor })
  }

  stopSensorStream = () => {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }

    window.removeEventListener("devicemotion", this.onDevicemotion, true);
    window.removeEventListener("deviceorientation", this.onDeviceOrientation, true);
    deviceSimulator.removeEventListener("devicemotion", this.onDevicemotion as any, true);
    deviceSimulator.removeEventListener("deviceorientation", this.onDeviceOrientation as any, true);
    this.simulator.stopSimulation()
    this.setState({ streamSenensor: false });
  }

  toggleSensorStream = () => {
    const deviceSimulator = document.getElementById("DeviceSimulator");

    if (!deviceSimulator) {
      return;
    }

    if (this.state.streamSenensor) {
      this.stopSensorStream()
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
      deviceSimulator.removeEventListener("devicemotion", this.onDevicemotion as any, true);
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
      deviceSimulator.removeEventListener("deviceorientation", this.onDeviceOrientation as any, true);
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
            <Button icon="angle up" onClick={() => this.onClick(Key.Up)} className="action up" size="huge" />
            <Button icon="angle right" onClick={() => this.onClick(Key.Right)} className="action right" size="huge" />
            <Button icon="angle down" onClick={() => this.onClick(Key.Down)} className="action down" size="huge" />
            <Button icon="angle left" onClick={() => this.onClick(Key.Left)} className="action left" size="huge" />
            <Button circular icon="circle" onClick={() => this.onClick(Key.Home)} className="action middle" size="huge" />
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
                const ts = new Date(cmd.timeStamp * 1000);
                return (
                  <div key={cmd.timeStamp}>
                    {`${ts.toLocaleTimeString()}.${`${ts.getMilliseconds()}`.padEnd(3, '0')}: `}
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