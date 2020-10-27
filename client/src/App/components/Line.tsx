import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Playground } from '../models/Playground';
import { default as LineModel } from '../models/Line';
import SocketDataStore from '../stores/socket_data_store';
import ViewStateStore from '../stores/view_state_store';

interface Props {
    line: LineModel;
    scaleX: number;
}

interface InjectedProps extends Props {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
class Line extends React.Component<Props> {
    get injected() {
        return this.props as InjectedProps;
    }
    @computed
    get playground(): Playground | undefined {
        return this.injected.socketDataStore.data?.playground;
    }

    @computed
    get shiftX(): number {
        return this.playground?.shiftX ?? 0;
    }
    @computed
    get shiftY(): number {
        return this.playground?.shiftY ?? 0;
    }

    render() {
        const { scaleX, line } = this.props;
        const width = line.width * scaleX;
        const height = line.height * scaleX;
        let x1: number = 0;
        let x2: number = 0;
        let y1: number = 0;
        let y2: number = 0;
        let left = (line.left - this.shiftX) * scaleX;
        let bottom = (line.bottom - this.shiftX) * scaleX;
        const lineWidth = line.lineWidth * scaleX;
        if (line.x1 === line.x2) {
            x1 = lineWidth / 2;
            x2 = x1;
            left = left - lineWidth / 2;
        } else if (line.x1 < line.x2) {
            x1 = 0;
            x2 = width;
        } else {
            x1 = width;
            x2 = 0;
        }
        if (line.y1 === line.y2) {
            y1 = lineWidth / 2;
            y2 = y1;
            bottom = bottom - lineWidth / 2;
        } else if (line.y1 < line.y2) {
            y1 = height;
            y2 = 0;
        } else {
            y1 = 0;
            y2 = height;
        }
        return (
            <div
                style={{
                    height: height,
                    width: width,
                    left: left,
                    bottom: bottom,
                    transform: line.rotate ? `rotate(${line.rotate})` : undefined,
                }}
                className="line"
            >
                <svg width="100%" height="100%">
                    <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        style={{
                            stroke: line.color ?? 'black',
                            strokeWidth: line.lineWidth * scaleX,
                        }}
                    />
                </svg>
            </div>
        );
    }
}

export default Line;
