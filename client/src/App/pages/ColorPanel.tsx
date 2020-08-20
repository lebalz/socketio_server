import React, { Component } from "react";
import SocketData, { DataMsg, DataType, ColorMsg } from "../SocketData";

interface Props {
  socket: SocketData;
}

class ColorPanel extends Component<Props> {
  _isMounted = false;
  state = { color: "#aaffff", touched: false };
  socket: SocketData;

  // Initialize the state
  constructor(props: Props) {
    super(props);
    this.socket = props.socket;
  }

  componentDidMount() {
    this._isMounted = true;
    this.socket.onData.push(this.onData);
  }

  componentWillUnmount() {
    this._isMounted = false;
    const callbackFun = this.socket.onData.indexOf((f: any) => f === this.onData);
    if (callbackFun >= 0) {
      this.socket.onData.splice(callbackFun, callbackFun);
      const colors = this.socket.getData(DataType.Color);
      if (colors.length > 0) {
        this.setState({ color: colors[colors.length - 1] });
      }
    }
  }

  onData = (data: DataMsg) => {
    if (this._isMounted && data.type === DataType.Color) {
      const colorData = data as ColorMsg
      this.setState({ color: colorData.color });
    }
  };

  onClick = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = (event.target as HTMLDivElement).getBoundingClientRect();
    this.setState({ touched: undefined });
    this.socket.addData({
      type: "pointer",
      context: "color",
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      color: this.state.color,
    });
  };

  render() {
    return (
      <div
        id="color-panel"
        style={{
          background: this.state.color,
          position: "relative",
          userSelect: "none",
        }}
        onPointerDown={() => this.setState({ touched: true })}
        onPointerUp={this.onClick}
        onPointerCancel={() => this.setState({ touched: undefined })}
        onPointerOut={() => this.setState({ touched: undefined })}
      >
        {this.state.touched && (
          <div
            style={{
              borderRadius: "50%",
              width: "0.5rem",
              height: "0.5rem",
              position: "absolute",
              left: "1rem",
              top: "1rem",
              background: "red",
            }}
          ></div>
        )}
      </div>
    );
  }
}

export default ColorPanel;
