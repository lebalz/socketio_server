import React, { Component, Fragment } from 'react';
import { Button, Checkbox, Segment, Form, IconProps } from 'semantic-ui-react';
import MotionSimulator from '../models/MotionSimulator';
import SocketData, { timeStamp } from '../SocketData';
import { Key, AccMsg, GyroMsg, DataType } from '../../Shared/SharedTypings';
import { SemanticShorthandItem } from 'semantic-ui-react/dist/commonjs/generic';
import AccSensor from '../components/AccSensor';
import GyroSensor from '../components/GyroSensor';

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
                onClick={() => this.setState({ streamSenensor: !this.state.streamSenensor })}
                label="Sensoren Streamen"
              />
            </Form.Field>
            {this.state.streamSenensor && (
              <Fragment>
                <Checkbox
                  checked={this.state.simulateSensor}
                  onClick={() => this.setState({ simulateSensor: !this.state.simulateSensor })}
                  label="Simulate Sensors"
                />
                <AccSensor
                  simulate={this.state.simulateSensor}
                  onData={(data) => this.socket.addData(data)}
                  on={this.state.streamSenensor}
                />
                <GyroSensor
                  simulate={this.state.simulateSensor}
                  onData={(data) => this.socket.addData(data)}
                  on={this.state.streamSenensor}
                />
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
