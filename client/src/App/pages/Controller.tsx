import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Segment, Form, IconProps } from 'semantic-ui-react';
import MotionSimulator from '../Simulator';
import SocketData, { timeStamp } from '../SocketData';
import { Key, AccMsg, GyroMsg, DataType } from '../../Shared/SharedTypings';
import { SemanticShorthandItem } from 'semantic-ui-react/dist/commonjs/generic';

interface Props {
  socket: SocketData;
}

interface ControllerState {
  streamSenensor: boolean;
  simulateSensor: boolean;
  acceleration: boolean;
  gyro: boolean;
  currentAcceleration?: AccMsg;
  currentGyro?: GyroMsg;
  lastCommands: { timeStamp: number; key: Key }[];
  showLogs: boolean;
  active: {
    [key in Key]?: boolean;
  };
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
    showLogs: true,
    active: {},
  };
  simulator = new MotionSimulator();
  socket: SocketData;

  // Initialize the state
  constructor(props: Props) {
    super(props);
    this.socket = props.socket;
  }

  componentDidMount() {
    window.addEventListener('keyup', this.onKey);
  }
  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKey);
    this.stopSensorStream();
  }

  setActive(key: Key, active: boolean) {
    const activeState = { ...this.state.active };
    activeState[key] = active;
    this.setState({ active: activeState });
  }

  onClick(action: Key) {
    const cmds = this.state.lastCommands;
    if (cmds.length > 5) {
      cmds.shift();
    }
    cmds.push({ timeStamp: timeStamp(), key: action });
    this.setActive(action, true);
    setTimeout(() => {
      this.setActive(action, false);
    }, 200);
    this.socket.addData({ type: DataType.Key, key: action });
  }

  requestMotionPermission(onGrant: () => void) {
    // feature detect
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            onGrant();
          }
        })
        .catch(console.error);
    } else {
      onGrant();
    }
  }

  requestOrientationPermission(onGrant: () => void) {
    // feature detect
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            onGrant();
          }
        })
        .catch(console.error);
    } else {
      onGrant();
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
      type: DataType.Acceleration,
      x: e.accelerationIncludingGravity.x ?? 0,
      y: e.accelerationIncludingGravity.y ?? 0,
      z: e.accelerationIncludingGravity.z ?? 0,
      interval: e.interval,
    };
    this.setState({ currentAcceleration: motionData });
    this.socket.addData(motionData);
  };

  onDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (!this.state.gyro) {
      return;
    }
    const gyroData = {
      type: DataType.Gyro,
      alpha: e.alpha,
      beta: e.beta,
      gamma: e.gamma,
      absolute: e.absolute,
    };
    this.setState({ currentGyro: gyroData });
    this.socket.addData(gyroData);
  };

  setupAccelerationStream(simulateSensor: boolean) {
    const deviceSimulator = document.getElementById('DeviceSimulator');

    if (!deviceSimulator) {
      return;
    }
    this.requestMotionPermission(() => {
      if (simulateSensor) {
        deviceSimulator.addEventListener('devicemotion', this.onDevicemotion as any, true);
        window.removeEventListener('devicemotion', this.onDevicemotion, true);
        this.simulator.startMotionSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      } else {
        deviceSimulator.removeEventListener('devicemotion', this.onDevicemotion as any, true);
        window.addEventListener('devicemotion', this.onDevicemotion, true);
        this.simulator.stopMotionSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      }
    });
  }

  setupGyroStream(simulateSensor: boolean) {
    const deviceSimulator = document.getElementById('DeviceSimulator');

    if (!deviceSimulator) {
      return;
    }
    this.requestOrientationPermission(() => {
      if (simulateSensor) {
        deviceSimulator.addEventListener('deviceorientation', this.onDeviceOrientation as any, true);
        window.removeEventListener('deviceorientation', this.onDeviceOrientation, true);
        this.simulator.startOrientationSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      } else {
        deviceSimulator.removeEventListener('deviceorientation', this.onDeviceOrientation as any, true);
        window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
        this.simulator.stopOrientationSimulation();
        this.setState({ simulateSensor: simulateSensor, streamSenensor: true });
      }
    });
  }

  setupSensorStream(simulateSensor: boolean) {
    if (this.state.acceleration) {
      this.setupAccelerationStream(simulateSensor);
    }
    if (this.state.gyro) {
      this.setupGyroStream(simulateSensor);
    }
    this.setState({ simulateSensor: simulateSensor });
  }

  stopSensorStream = () => {
    const deviceSimulator = document.getElementById('DeviceSimulator');

    if (!deviceSimulator) {
      return;
    }

    window.removeEventListener('devicemotion', this.onDevicemotion, true);
    window.removeEventListener('deviceorientation', this.onDeviceOrientation, true);
    deviceSimulator.removeEventListener('devicemotion', this.onDevicemotion as any, true);
    deviceSimulator.removeEventListener('deviceorientation', this.onDeviceOrientation as any, true);
    this.simulator.stopSimulation();
    this.setState({ streamSenensor: false });
  };

  toggleSensorStream = () => {
    const deviceSimulator = document.getElementById('DeviceSimulator');

    if (!deviceSimulator) {
      return;
    }

    if (this.state.streamSenensor) {
      this.stopSensorStream();
    } else {
      this.setupSensorStream(this.state.simulateSensor);
      this.setState({ streamSenensor: true });
    }
  };

  toggleAccelerationStream = () => {
    const deviceSimulator = document.getElementById('DeviceSimulator');

    if (!deviceSimulator) {
      return;
    }

    if (this.state.acceleration) {
      window.removeEventListener('devicemotion', this.onDevicemotion, true);
      deviceSimulator.removeEventListener('devicemotion', this.onDevicemotion as any, true);
      this.simulator.stopMotionSimulation();
      this.setState({ acceleration: false });
    } else {
      this.setupAccelerationStream(this.state.simulateSensor);
      this.setState({ acceleration: true });
    }
  };

  toggleGyroStream = () => {
    const deviceSimulator = document.getElementById('DeviceSimulator');

    if (!deviceSimulator) {
      return;
    }

    if (this.state.gyro) {
      window.removeEventListener('deviceorientation', this.onDeviceOrientation, true);
      deviceSimulator.removeEventListener('deviceorientation', this.onDeviceOrientation as any, true);
      this.simulator.stopOrientationSimulation();
      this.setState({ gyro: false });
    } else {
      this.setupGyroStream(this.state.simulateSensor);
      this.setState({ gyro: true });
    }
  };

  keyIcon(key: Key): SemanticShorthandItem<IconProps> {
    switch (key) {
      case Key.Up:
      case Key.Right:
      case Key.Left:
      case Key.Down:
        return `angle ${key}`;
      case Key.Home:
        return 'circle';
      default:
        return undefined;
    }
  }
  onKey = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'Space':
        return this.onClick(Key.Home);
      case 'ArrowRight':
        return this.onClick(Key.Right);
      case 'ArrowLeft':
        return this.onClick(Key.Left);
      case 'ArrowUp':
        return this.onClick(Key.Up);
      case 'ArrowDown':
        return this.onClick(Key.Down);
      case 'F1':
      case 'Digit1':
        return this.onClick(Key.F1);
      case 'F2':
      case 'Digit2':
        return this.onClick(Key.F2);
      case 'F3':
      case 'Digit3':
        return this.onClick(Key.F3);
      case 'F4':
      case 'Digit4':
        return this.onClick(Key.F4);
    }
  };

  render() {
    return (
      <Fragment>
        <div className="control">
          <h1>Controller</h1>
          <div className="actions">
            {[Key.Down, Key.Home, Key.Left, Key.Right, Key.Up].map((key) => {
              return (
                <Button
                  key={key}
                  icon={this.keyIcon(key)}
                  onClick={() => this.onClick(key)}
                  className={`action ${key}`}
                  size="huge"
                  active={this.state.active[key]}
                />
              );
            })}
            <div className="function-keys">
              {[Key.F1, Key.F2, Key.F3, Key.F4].map((key) => {
                return (
                  <Button
                    key={key}
                    onClick={() => this.onClick(key)}
                    className={`action ${key}`}
                    content={key.toUpperCase()}
                    size="medium"
                    active={this.state.active[key]}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <Segment>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Form.Field>
              <Checkbox
                checked={this.state.streamSenensor}
                onClick={this.toggleSensorStream}
                label="Sensoren Streamen"
              />
            </Form.Field>
            {this.state.streamSenensor && (
              <Fragment>
                <Checkbox
                  checked={this.state.simulateSensor}
                  onClick={() => this.setupSensorStream(!this.state.simulateSensor)}
                  label="Simulate Sensors"
                />
                <Checkbox
                  checked={this.state.acceleration}
                  onClick={this.toggleAccelerationStream}
                  label="Stream Acceleration"
                />
                <Checkbox checked={this.state.gyro} onClick={this.toggleGyroStream} label="Stream Gyro" />
              </Fragment>
            )}
          </div>
        </Segment>
        <Segment style={{ width: '100%' }}>
          <Checkbox
            label="Logs Anzeigen"
            checked={this.state.showLogs}
            onClick={() => this.setState({ showLogs: !this.state.showLogs })}
          />
          {this.state.showLogs && (
            <div style={{ margin: '1em' }}>
              {this.state.lastCommands
                .slice()
                .reverse()
                .map((cmd) => {
                  const ts = new Date(cmd.timeStamp * 1000);
                  return (
                    <div key={cmd.timeStamp}>
                      {`${ts.toLocaleTimeString()}.${`${ts.getMilliseconds()}`.padEnd(3, '0')}: `}
                      <i>{cmd.key}</i>
                    </div>
                  );
                })}
            </div>
          )}
          {this.state.showLogs && this.state.streamSenensor && this.state.acceleration && (
            <div style={{ margin: '1em' }}>
              <pre>
                <code>{JSON.stringify(this.state.currentAcceleration, null, 2)}</code>
              </pre>
            </div>
          )}
          {this.state.showLogs && this.state.streamSenensor && this.state.gyro && (
            <div style={{ margin: '1em' }}>
              <pre>
                <code>{JSON.stringify(this.state.currentGyro, null, 2)}</code>
              </pre>
            </div>
          )}
        </Segment>
      </Fragment>
    );
  }
}

export default Controller;
