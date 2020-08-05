import React, { Component } from 'react';

class ColorPanel extends Component {
  _isMounted = false;
  state = { color: '#aaffff' };
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
        this.setState({ color: colors[colors.length - 1]})
      }
      console.log('removed component')
    }
  }

  onData = (data) => {
    if (this._isMounted && data.type === 'color') {
      this.setState({ color: data.color })
    }
  }

  render() {
    return (
      <div id="color-panel" style={{ background: this.state.color }}>
      </div>
    );
  }
}

export default ColorPanel;