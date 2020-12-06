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
import { action, computed } from 'mobx';
import LineGraph from '../components/LineGraph';

const DISPLAY_FLOAT_PRECISION = 100000;

function toPrecision(num: number) {
    return ~~(num * DISPLAY_FLOAT_PRECISION) / DISPLAY_FLOAT_PRECISION;
}
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

    onAccelerationData = action((data: AccelerationData) => {
        this.socket.emitData<Acc>(data);
        this.controllerState.addAccFrame(data);
        this.setState({
            lastAcc: {
                ...data,
                x: toPrecision(data.x),
                y: toPrecision(data.y),
                z: toPrecision(data.z),
            },
        });
    });

    onGyroData = (data: GyroData) => {
        this.socket.emitData<Gyro>(data);
        this.controllerState.addGyroFrame(data);
        this.setState({
            lastGyro: {
                ...data,
                alpha: toPrecision(data.alpha),
                beta: toPrecision(data.beta),
                gamma: toPrecision(data.gamma),
            },
        });
    };

    render() {
        const showStreamLogs = this.controllerState.showLogs && this.controllerState.streamSenensor;
        return (
            <Fragment>
                <h1>Controller</h1>
                <KeyControls
                    onData={this.onKeyData}
                    preventKeyDefaults={!this.injected.viewStateStore.deviceIdPromptOpen}
                />
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
                        <div style={{ display: 'flex', margin: '1em', flexWrap: 'wrap' }}>
                            <div
                                style={{ flexGrow: 0, flexShrink: 1, flexBasis: '250px', maxWidth: '250px' }}
                            >
                                <h3>Acceleration</h3>
                                <pre>
                                    <code>{JSON.stringify(this.state.lastAcc, null, 2)}</code>
                                </pre>
                            </div>
                            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '200px' }}>
                                <LineGraph
                                    type="acc"
                                    data={this.injected.viewStateStore.controllerState.lastAccValues}
                                />
                            </div>
                        </div>
                    )}
                    {showStreamLogs && this.controllerState.gyro && (
                        <div style={{ display: 'flex', margin: '1em', flexWrap: 'wrap' }}>
                            <div
                                style={{ flexGrow: 0, flexShrink: 1, flexBasis: '250px', maxWidth: '250px' }}
                            >
                                <h3>Gyro</h3>
                                <pre>
                                    <code>{JSON.stringify(this.state.lastGyro, null, 2)}</code>
                                </pre>
                            </div>
                            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '200px' }}>
                                <LineGraph
                                    type="gyro"
                                    data={this.injected.viewStateStore.controllerState.lastGyroValues}
                                />
                            </div>
                        </div>
                    )}
                </Segment>
            </Fragment>
        );
    }
}

export default Controller;
