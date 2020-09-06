import React, { Component } from "react";
import SocketData, { ClientDataMsg, timeStamp } from "../SocketData";
import {
  DataType,
  PointerContext,
  GridPointer,
} from "../../Shared/SharedTypings";

interface Props {
  socket: SocketData;
}

interface GridState {
  grid: string[][];
  activeCell?: string;
  x: number;
  y: number;
  displayedAt?: number;
}

class ColorGrid extends Component<Props> {
  _isMounted = false;
  state: GridState = {
    grid: [
      ["#aaffff", "#ffaaff"],
      ["#ffaaff", "#aaffff"],
    ],
    activeCell: undefined,
    x: 0,
    y: 0,
    displayedAt: timeStamp(),
  };
  // Initialize the state
  socket: SocketData;

  constructor(props: Props) {
    super(props);
    this.socket = props.socket;
  }

  componentDidUpdate(prevProps: Props, prevState: GridState) {
    if (this.state.grid !== prevState.grid) {
      this.setState({ displayedAt: timeStamp() });
    }
  }

  componentDidMount() {
    this._isMounted = true;
    this.socket.onData.push(this.onData);
    const grids = this.socket.getData(DataType.Grid);
    const latestGrid = grids[grids.length - 1];
    if (
      latestGrid &&
      latestGrid.grid &&
      latestGrid.grid.length > 0 &&
      latestGrid.grid[0].length > 0
    ) {
      this.setState({ grid: latestGrid.grid, displayedAt: timeStamp() });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    const callbackFun = this.socket.onData.indexOf(
      (f: any) => f === this.onData
    );
    if (callbackFun >= 0) {
      this.socket.onData.splice(callbackFun, callbackFun);
    }
  }

  onData = (data: ClientDataMsg) => {
    if (this._isMounted && data.type === DataType.Grid) {
      const grid = data.grid!;
      const first_row = grid[0];
      if (first_row.length === 0) {
        // an empty row was provided, set the screen to white
        this.setState({ grid: [["white"]], displayedAt: undefined });
      } else if (Array.isArray(first_row)) {
        this.setState({ grid: grid, displayedAt: undefined });
      } else {
        // only a 1D array is provided - use it as row
        this.setState({ grid: [grid], displayedAt: undefined });
      }
    }
  };

  onClick(row: number, column: number) {
    const rowColors = this.state.grid[row] || [];
    this.setState({ activeCell: undefined });
    const pkg: GridPointer = {
      row: row,
      column: column,
      color: rowColors[column],
      displayed_at: this.state.displayedAt ?? timeStamp(),
    };
    this.socket.addData({
      type: DataType.Pointer,
      context: PointerContext.Grid,
      ...pkg,
    });
  }

  render() {
    const grid = this.state.grid;
    return (
      <div
        id="color-grid"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          gridAutoFlow: "row",
        }}
      >
        {grid.map((row, rowIdx) => {
          return row.map((cell, colIdx) => {
            const key = `cell_${rowIdx}_${colIdx}`;
            const isActive = key === this.state.activeCell;
            const label = `[${rowIdx}, ${colIdx}]`;
            return (
              <div
                key={key}
                style={{
                  background: cell,
                  width: "100%",
                  paddingTop: "100%",
                  gridRowStart: rowIdx + 1,
                  gridRowEnd: rowIdx + 1,
                  gridColumnStart: colIdx + 1,
                  gridColumnEnd: colIdx + 1,
                  outline: isActive ? "3px solid grey" : undefined,
                  outlineOffset: isActive ? "-3px" : undefined,
                  position: "relative",
                  userSelect: "none",
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
