import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { LineChart, Line, XAxis, Legend, YAxis, Tooltip } from 'recharts';
import ViewStateStore from '../stores/view_state_store';
import { AccelerationData } from './Controls/Sensors/AccelerationSensor';
import { GyroData } from './Controls/Sensors/GyroSensor';

interface Props {
    type: 'acc' | 'gyro';
}

interface InjectedProps extends Props {
    viewStateStore: ViewStateStore;
}

@inject('viewStateStore')
@observer
class LineGraph extends Component<Props> {
    get injected() {
        return this.props as InjectedProps;
    }

    get yKeys() {
        if (this.props.type === 'acc') {
            return ['x', 'y', 'z'];
        }

        return ['alpha', 'beta', 'gamma'];
    }

    color(idx: number) {
        switch (idx) {
            case 0:
                return 'red';
            case 1:
                return 'green';
            case 2:
                return 'blue';
            default:
                return undefined;
        }
    }

    @computed
    get data() {
        if (this.props.type === 'acc') {
            return this.injected.viewStateStore.controllerState.lastAccValues.slice();
        }
        return this.injected.viewStateStore.controllerState.lastGyroValues.slice();
    }

    render() {
        return (
            <LineChart
                data={this.data}
                width={window.innerWidth * 0.9}
                height={150}
                margin={{
                    top: 5,
                    right: 5,
                    left: -30,
                    bottom: 5,
                }}
            >
                <XAxis dataKey={'time_stamp'} />
                <YAxis />
                <Tooltip />
                <Legend />
                {this.yKeys.map((label, idx) => {
                    return (
                        <Line
                            isAnimationActive={false}
                            type="monotone"
                            dataKey={label}
                            key={label}
                            dot={false}
                            stroke={this.color(idx)}
                        />
                    );
                })}
            </LineChart>
        );
    }
}
export default LineGraph;
