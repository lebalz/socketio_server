import React, { Component, Fragment } from 'react';
import { Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class ColorGrid extends Component {
  _isMounted = false;
  state = { grid: [['#aaffff', '#ffaaff'], ['#ffaaff', '#aaffff']] };
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
      console.log('removed component')
    }
  }

  onData = (data) => {
    if (this._isMounted && data.type === 'grid') {
      this.setState({ grid: data.grid })
    }
  }

  render() {
    const grid = this.state.grid;
    return (
      <div id="color-grid" style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
        gridAutoFlow: 'row'
      }}>
        {grid.map((row, rowIdx) => {
          return row.map((cell, colIdx) => {
            return (
              <div key={`cell_${rowIdx}_${colIdx}`} style={{
                background: cell,
                width: '100%',
                paddingTop: '100%',
                gridRowStart: rowIdx + 1,
                gridRowEnd: rowIdx + 1,
                gridColumnStart: colIdx + 1,
                gridColumnEnd: colIdx + 1
              }} />
            )
          });
        })}
      </div>
    );
  }
}

export default ColorGrid;