import React, { Component, Fragment } from 'react';
import { Button } from 'semantic-ui-react';

class Controller extends Component {
  // Initialize the state
  constructor(props) {
    super(props);
    this.socket = props.socket
  }

  onClick(action) {
    this.socket.addData({ type: 'key', key: action })
  }

  render() {
    return (
      <Fragment>
        <div className="control">
          <h1>Controller</h1>
          <div className="actions">
            <Button icon="angle up" onClick={() => this.onClick('up')} className="action up" size="huge" />
            <Button icon="angle right" onClick={() => this.onClick('right')} className="action right" size="huge" />
            <Button icon="angle down" onClick={() => this.onClick('down')} className="action down" size="huge" />
            <Button icon="angle left" onClick={() => this.onClick('left')} className="action left" size="huge" />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Controller;