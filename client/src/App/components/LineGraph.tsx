import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { LineChart, Line, XAxis, Legend, YAxis, Tooltip } from 'recharts';
import ViewStateStore from '../stores/view_state_store';
import { AccelerationData } from './Controls/Sensors/AccelerationSensor';
import { GyroData } from './Controls/Sensors/GyroSensor';

interface Props {
    type: 'acc' | 'gyro';
    data: AccelerationData[] | GyroData[];
}

interface InjectedProps extends Props {
    viewStateStore: ViewStateStore;
}

@inject('viewStateStore')
@observer
class LineGraph extends Component<Props> {
    state = { width: 250, height: 150 };
    chartRef = React.createRef<HTMLDivElement>();
    get injected() {
        return this.props as InjectedProps;
    }

    componentDidMount() {
        this.updateSize();
        window.addEventListener('resize', this.updateSize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateSize);
    }

    updateSize = () => {
        if (this.chartRef.current) {
            const bbox = this.chartRef.current.getBoundingClientRect();
            this.setState({ width: bbox.width, height: bbox.height });
        }
    };

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

    render() {
        return (
            <div ref={this.chartRef} style={{ width: '100%', height: '150px' }}>
                <LineChart
                    data={this.props.data.slice()}
                    width={this.state.width}
                    height={this.state.height}
                    margin={{
                        top: 5,
                        right: 5,
                        left: -30,
                        bottom: 5,
                    }}
                    compact
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
                                activeDot={false}
                                dataKey={label}
                                key={label}
                                dot={false}
                                stroke={this.color(idx)}
                            />
                        );
                    })}
                </LineChart>
            </div>
        );
    }
}
export default LineGraph;
