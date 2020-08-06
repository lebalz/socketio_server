import React, { Component } from 'react';

class ColorPanel extends Component {
  _isMounted = false;
  state = { color: '#aaffff', touched: false };
  // Initialize the state
  constructor(props) {
    super(props);
    this.socket = props.socket
  }

  componentDidMount() {
    this._isMounted = true;
    this.socket.onData.push(this.onData);
  }

  componentWillUnmount() {
    this._isMounted = false;
    const callbackFun = this.socket.onData.indexOf(f => f === this.onClick)
    if (callbackFun >= 0) {
      this.socket.onData.splice(callbackFun, callbackFun)
      const colors = this.socket.getData('color');
      if (colors.leangth > 0) {
        this.setState({ color: colors[colors.length - 1] })
      }
    }
  }

  onData = (data) => {
    if (this._isMounted && data.type === 'color') {
      this.setState({ color: data.color })
    }
  }

  onClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const pointer = {
      context: 'color',
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      color: this.state.color
    }
    this.socket.addData({
      type: 'pointer',
      pointer: pointer
    });
  }

  render() {
    return (
      <div id="color-panel"
        style={{
          background: this.state.color,
          position: 'relative',
          userSelect: 'none'
        }}
        onClick={this.onClick}
        onPointerDown={() => this.setState({ touched: true })}
        onPointerUp={() => this.setState({ touched: false })}
      >
        {this.state.touched && (
          <div
            style={{
              borderRadius: '50%',
              width: '0.5rem',
              height: '0.5rem',
              position: 'absolute',
              left: '1rem',
              top: '1rem',
              background: 'red'
            }}></div>
        )}
      </div>
    );
  }
}

export default ColorPanel;