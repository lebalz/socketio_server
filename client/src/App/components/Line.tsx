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
        const svgProps = line.svgLineProps;
        const x1 = svgProps.x1 * scaleX;
        const x2 = svgProps.x2 * scaleX;
        const y1 = svgProps.y1 * scaleX;
        const y2 = svgProps.y2 * scaleX;
        return (
            <div
                style={{
                    height: height,
                    width: width,
                    left: (line.left - this.shiftX) * scaleX,
                    bottom: (line.bottom - this.shiftY) * scaleX,
                    transform: line.rotate ? `rotate(${line.rotate})` : undefined,
                    zIndex: line.zIndex,
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
