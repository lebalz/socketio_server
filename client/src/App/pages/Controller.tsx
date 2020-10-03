import React, { Component, Fragment } from 'react';
import { Checkbox, Segment, Form } from 'semantic-ui-react';
import MotionSimulator from '../models/MotionSimulator';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import { Acc, Gyro, Key } from '../../Shared/SharedTypings';
import AccelerationSensor, { AccelerationData } from '../components/Controls/Sensors/AccelerationSensor';
import GyroSensor, { GyroData } from '../components/Controls/Sensors/GyroSensor';
import KeyControls, { KeyData } from '../components/Controls/KeyControls';
import { inject, observer } from 'mobx-react';
import ViewStateStore from '../stores/view_state_store';
import { computed, runInAction } from 'mobx';
import LineGraph from '../components/LineGraph';

interface InjectedProps {
    socketDataStore: SocketDataStore;
    viewStateStore: ViewStateStore;
}

interface StateProps {
    active: {
        [key in Key]?: boolean;
    };
    lastAcc?: AccelerationData;
    lastGyro?: GyroData;
}

@inject('socketDataStore', 'viewStateStore')
@observer
class Controller extends Component {
    state: StateProps = { active: {} };
    get injected() {
        return this.props as InjectedProps;
    }
    simulator = new MotionSimulator();

    componentDidMount() {
        if (localStorage.getItem('stream_sensor') === 'on') {
            this.controllerState.streamSenensor = true;
        }
        if (localStorage.getItem('simulate_sensor') === 'yes') {
            this.controllerState.simulateSensor = true;
        }
    }

    setActive(key: Key, active: boolean) {
        const activeState = { ...this.state.active };
        activeState[key] = active;
        this.setState({ active: activeState });
    }

    @computed
    get controllerState() {
        return this.injected.viewStateStore.controllerState;
    }

    @computed
    get socket() {
        return this.injected.socketDataStore;
    }

    onKeyData = (data: KeyData) => {
        const cmds = this.controllerState.lastCommands;
        if (cmds.length > 5) {
            cmds.shift();
        }
        cmds.push({ timeStamp: timeStamp(), key: data.key });
        this.setState({ lastCommands: cmds });
        this.socket.emitData<KeyData>(data);
    };

    toggleSensorStream = () => {
        this.controllerState.streamSenensor = !this.controllerState.streamSenensor;
        localStorage.setItem('stream_sensor', this.controllerState.streamSenensor ? 'on' : 'off');
    };

    toggleSimulateSensor = () => {
        this.controllerState.simulateSensor = !this.controllerState.simulateSensor;
        localStorage.setItem('simulate_sensor', this.controllerState.simulateSensor ? 'yes' : 'no');
    };

    onAccelerationData = (data: AccelerationData) => {
        this.socket.emitData<Acc>(data);
        this.controllerState.addAccFrame(data);
        this.setState({ lastAcc: data });
    };

    onGyroData = (data: GyroData) => {
        this.socket.emitData<Gyro>(data);
        this.controllerState.addGyroFrame(data);
        this.setState({ lastGyro: data });
    };

    render() {
        const showStreamLogs = this.controllerState.showLogs && this.controllerState.streamSenensor;
        const { lastAcc, lastGyro } = this.state;
        return (
            <Fragment>
                <h1>Controller</h1>
                <KeyControls onData={this.onKeyData} />
                <Segment>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Form.Field>
                            <Checkbox
                                checked={this.controllerState.streamSenensor}
                                onClick={this.toggleSensorStream}
                                label="Sensoren Streamen"
                            />
                        </Form.Field>
                        {this.controllerState.streamSenensor && (
                            <Fragment>
                                <Checkbox
                                    checked={this.controllerState.simulateSensor}
                                    onClick={this.toggleSimulateSensor}
                                    label="Simulate Sensors"
                                />
                                <AccelerationSensor
                                    simulate={this.controllerState.simulateSensor}
                                    onData={this.onAccelerationData}
                                    on={this.controllerState.streamSenensor}
                                    onChangeActive={(on) => (this.controllerState.acceleration = on)}
                                />
                                <GyroSensor
                                    simulate={this.controllerState.simulateSensor}
                                    onData={this.onGyroData}
                                    on={this.controllerState.streamSenensor}
                                    onChangeActive={(on) => (this.controllerState.gyro = on)}
                                />
                            </Fragment>
                        )}
                    </div>
                </Segment>
                <Segment style={{ width: '100%' }}>
                    <Checkbox
                        label="Logs Anzeigen"
                        checked={this.controllerState.showLogs}
                        onClick={() => (this.controllerState.showLogs = !this.controllerState.showLogs)}
                    />
                    {this.controllerState.showLogs && (
                        <div style={{ margin: '1em' }}>
                            {this.controllerState.lastCommands
                                .slice()
                                .reverse()
                                .map((cmd) => {
                                    const ts = new Date(cmd.timeStamp * 1000);
                                    return (
                                        <div key={cmd.timeStamp}>
                                            {`${ts.toLocaleTimeString()}.${`${ts.getMilliseconds()}`.padEnd(
                                                3,
                                                '0'
                                            )}: `}
                                            <i>{cmd.key}</i>
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    {showStreamLogs && this.controllerState.acceleration && (
                        <div style={{ margin: '1em' }}>
                            <h3>Acceleration</h3>
                            <pre>
                                <code>
                                    {`[${lastAcc?.x.toFixed(5)}, ${lastAcc?.y.toFixed(
                                        5
                                    )}, ${lastAcc?.z.toFixed(5)}]`}
                                </code>
                            </pre>
                            <LineGraph type="acc" />
                        </div>
                    )}
                    {showStreamLogs && this.controllerState.gyro && (
                        <div style={{ margin: '1em' }}>
                            <h3>Gyro</h3>
                            <pre>
                                <code>{`[${lastGyro?.alpha.toFixed(5)}, ${lastGyro?.beta.toFixed(
                                    5
                                )}, ${lastGyro?.gamma.toFixed(5)}]`}</code>
                            </pre>
                            <LineGraph type="gyro" />
                        </div>
                    )}
                </Segment>
            </Fragment>
        );
    }
}

export default Controller;
