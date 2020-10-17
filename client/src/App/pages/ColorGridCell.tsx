import React, { Component } from 'react';
import { timeStamp } from '../stores/socket_data_store';
import { inject, observer } from 'mobx-react';
import ViewStateStore from '../stores/view_state_store';
import { computed } from 'mobx';
import { GridCell } from '../models/ColorGrid/ColorGridCell';

interface Props {
    cell: GridCell;
}

interface InjectedProps extends Props {
    viewStateStore: ViewStateStore;
}

@inject('viewStateStore')
@observer
class ColorGridCell extends Component<Props> {
    get injected() {
        return this.props as InjectedProps;
    }

    @computed
    get cell() {
        return this.props.cell;
    }

    componentDidMount() {
        if (!this.cell.displayedAt) {
            this.cell.displayedAt = timeStamp();
        }
    }

    componentDidUpdate() {
        if (!this.cell.displayedAt) {
            this.cell.displayedAt = timeStamp();
        }
    }

    render() {
        return (
            <div
                className="grid-cell"
                style={{
                    background: this.cell.color,
                    gridRowStart: this.cell.rowIdx + 1,
                    gridRowEnd: this.cell.rowIdx + 1,
                    gridColumnStart: this.cell.colIdx + 1,
                    gridColumnEnd: this.cell.colIdx + 1,
                    outline: this.cell.touched ? '3px solid grey' : undefined,
                    outlineOffset: this.cell.touched ? '-3px' : undefined,
                    position: 'relative',
                }}
                onPointerDown={() => {
                    this.cell.click();
                }}
                onPointerUp={() => (this.cell.touched = false)}
                onPointerCancel={() => (this.cell.touched = false)}
                onPointerOut={(e) => {
                    if (this.cell.touched) {
                        /** do hit test with the center of the pointer */
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (
                            e.clientX < rect.left ||
                            e.clientX > rect.right ||
                            e.clientY < rect.top ||
                            e.clientY > rect.bottom
                        ) {
                            this.cell.touched = false;
                        }
                    }
                }}
            >
                {this.cell.showIndex && (
                    <span
                        style={{
                            color: 'white',
                            mixBlendMode: 'difference',
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {this.props.cell.gridIndex}
                    </span>
                )}
            </div>
        );
    }
}

export default ColorGridCell;
