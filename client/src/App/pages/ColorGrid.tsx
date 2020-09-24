import React, { Component } from 'react';
import SocketData, { timeStamp } from '../SocketData';
import { DataType, PointerContext, GridPointer, ClientDataMsg } from '../../Shared/SharedTypings';
import { Grid, ColorGrid as ColorGridType } from '../models/Grid';

interface Props {
    socket: SocketData;
}

interface GridState {
    activeCell?: string;
    x: number;
    y: number;
    displayedAt?: number;
    width: number;
    height: number;
    dimensions: [row: number, col: number];
    grid: ColorGridType;
}

class ColorGrid extends Component<Props> {
    _isMounted = false;
    grid: Grid = new Grid({ grid: '90\n09' });
    state: GridState = {
        dimensions: [0, 0],
        grid: this.grid.grid,
        activeCell: undefined,
        x: 0,
        y: 0,
        displayedAt: timeStamp(),
        width: 500,
        height: 200,
    };
    // Initialize the state
    socket: SocketData;

    constructor(props: Props) {
        super(props);
        this.socket = props.socket;
        this.updateSize();
    }

    componentDidUpdate(_prevProps: Props, prevState: GridState) {
        if (this.state.grid !== prevState.grid) {
            this.setState({ displayedAt: timeStamp() });
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.socket.onData.push(this.onData);
        const grids = this.socket.getData(DataType.Grid);
        const latestGrid = grids[grids.length - 1];
        if (latestGrid && latestGrid.grid && latestGrid.grid.length > 0 && latestGrid.grid[0].length > 0) {
            this.grid = new Grid(latestGrid);
            this.setState({
                displayedAt: timeStamp(),
                width: window.innerWidth,
                height: window.innerHeight,
                grid: this.grid.grid,
            });
        } else {
            this.updateSize();
        }
        window.addEventListener('resize', this.updateSize);
    }

    componentWillUnmount() {
        this._isMounted = false;
        const callbackFun = this.socket.onData.indexOf((f: any) => f === this.onData);
        if (callbackFun >= 0) {
            this.socket.onData.splice(callbackFun, callbackFun);
        }
        window.removeEventListener('resize', this.updateSize);
    }

    updateSize = () => {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    };

    onData = (data: ClientDataMsg) => {
        if (!this._isMounted) {
            return;
        }
        switch (data.type) {
            case DataType.Grid:
                this.grid = new Grid(data);
                this.setState({
                    dimensions: this.grid.dimensions,
                    grid: this.grid.grid,
                    displayedAt: undefined,
                });
                break;
            case DataType.GridUpdate:
                this.grid.update(data);
                this.setState({
                    dimensions: this.grid.dimensions,
                    grid: this.grid.grid,
                    displayedAt: undefined,
                });
                break;
        }
    };

    onClick(row: number, column: number) {
        this.setState({ activeCell: undefined });
        this.socket.addData<GridPointer>({
            type: DataType.Pointer,
            context: PointerContext.Grid,
            row: row,
            column: column,
            color: this.grid.rawAt(row, column),
            displayed_at: this.state.displayedAt ?? timeStamp(),
        });
    }

    get maxWidth() {
        const rowCount = this.state.dimensions[0];
        const columnCount = this.state.dimensions[1];
        const maxCellW = window.innerWidth / columnCount;
        const maxCellH = window.innerHeight / rowCount;
        return Math.min(maxCellH, maxCellW) * columnCount;
    }

    render() {
        const { dimensions, activeCell, grid } = this.state;
        return (
            <div
                id="color-grid"
                style={{
                    width: '100%',
                    maxWidth: `${this.maxWidth}px`,
                    display: 'grid',
                    gridAutoFlow: 'row',
                    gridTemplateColumns: `repeat(${dimensions[1]}, 1fr)`,
                    outline: '1px dashed lightgrey',
                }}
                key={`grid-${dimensions}`}
            >
                {grid.map((row, rowIdx) => {
                    return (typeof row === 'string' ? [row] : row).map((cell, colIdx) => {
                        const key = `cell_${rowIdx}_${colIdx}`;
                        const isActive = key === activeCell;
                        const label = `[${rowIdx}, ${colIdx}]`;
                        return (
                            <div
                                key={key}
                                className="grid-cell"
                                style={{
                                    background: cell,
                                    gridRowStart: rowIdx + 1,
                                    gridRowEnd: rowIdx + 1,
                                    gridColumnStart: colIdx + 1,
                                    gridColumnEnd: colIdx + 1,
                                    outline: isActive ? '3px solid grey' : undefined,
                                    outlineOffset: isActive ? '-3px' : undefined,
                                }}
                                onPointerDown={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    this.setState({
                                        activeCell: key,
                                        x: e.clientX - rect.left,
                                        y: e.clientY - rect.top,
                                    });
                                }}
                                onPointerUp={() => this.onClick(rowIdx, colIdx)}
                                onPointerCancel={() => this.setState({ activeCell: undefined })}
                                onPointerOut={(e) => {
                                    if (isActive) {
                                        /** do hit test with the center of the pointer */
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        if (
                                            e.clientX < rect.left ||
                                            e.clientX > rect.right ||
                                            e.clientY < rect.top ||
                                            e.clientY > rect.bottom
                                        ) {
                                            this.setState({ activeCell: undefined });
                                        }
                                    }
                                }}
                            >
                                {isActive && (
                                    <div
                                        className="cell-index-popup"
                                        style={{
                                            width: `${label.length / 1.5}em`,
                                            top: `calc(${this.state.y}px - 6rem)`,
                                            left: `calc(${this.state.x}px - ${label.length / 3}em)`,
                                        }}
                                    >
                                        {label}
                                    </div>
                                )}
                            </div>
                        );
                    });
                })}
            </div>
        );
    }
}

export default ColorGrid;
