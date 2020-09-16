import React, { Component, Fragment } from 'react';
import { Checkbox, Segment, Form } from 'semantic-ui-react';
import MotionSimulator from '../models/MotionSimulator';
import SocketData, { timeStamp } from '../SocketData';
import { Key } from '../../Shared/SharedTypings';
import AccSensor, { AccelerationData } from '../components/AccSensor';
import GyroSensor, { GyroData } from '../components/GyroSensor';
import KeyControls, { KeyData } from '../components/KeyControls';

interface Props {
  socket: SocketData;
}

interface ControllerState {
  streamSenensor: boolean;
  simulateSensor: boolean;
  acceleration: boolean;
  gyro: boolean;
  lastAcceleration?: AccelerationData;
  lastGyro?: GyroData;
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
    lastAcceleration: undefined,
    lastGyro: undefined,
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
    if (localStorage.getItem('stream_sensor') === 'on') {
      this.setState({ streamSenensor: true });
    }
    if (localStorage.getItem('simulate_sensor') === 'yes') {
      this.setState({ simulateSensor: true });
    }
  }

  setActive(key: Key, active: boolean) {
    const activeState = { ...this.state.active };
    activeState[key] = active;
    this.setState({ active: activeState });
  }

  onKeyData = (data: KeyData) => {
    const cmds = this.state.lastCommands;
    if (cmds.length > 5) {
      cmds.shift();
    }
    cmds.push({ timeStamp: timeStamp(), key: data.key });
    this.setState({ lastCommands: cmds });
    this.socket.addData(data);
  };

  toggleSensorStream = () => {
    const stream = !this.state.streamSenensor;
    this.setState({ streamSenensor: stream });
    localStorage.setItem('stream_sensor', stream ? 'on' : 'off');
  };

  toggleSimulateSensor = () => {
    const simulate = !this.state.simulateSensor;
    this.setState({ simulateSensor: simulate });
    localStorage.setItem('simulate_sensor', simulate ? 'yes' : 'no');
  };

  onAccelerationData = (data: AccelerationData) => {
    this.socket.addData(data);
    this.setState({ lastAcceleration: data });
  };

  onGyroData = (data: GyroData) => {
    this.socket.addData(data);
    this.setState({ lastGyro: data });
  };

  render() {
    return (
      <Fragment>
        <KeyControls onData={this.onKeyData} />
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
                  onClick={this.toggleSimulateSensor}
                  label="Simulate Sensors"
                />
                <AccSensor
                  simulate={this.state.simulateSensor}
                  onData={this.onAccelerationData}
                  on={this.state.streamSenensor}
                />
                <GyroSensor
                  simulate={this.state.simulateSensor}
                  onData={this.onGyroData}
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
                <code>{JSON.stringify(this.state.lastAcceleration, null, 2)}</code>
              </pre>
            </div>
          )}
          {this.state.showLogs && this.state.streamSenensor && this.state.gyro && (
            <div style={{ margin: '1em' }}>
              <pre>
                <code>{JSON.stringify(this.state.lastGyro, null, 2)}</code>
              </pre>
            </div>
          )}
        </Segment>
      </Fragment>
    );
  }
}

export default Controller;
