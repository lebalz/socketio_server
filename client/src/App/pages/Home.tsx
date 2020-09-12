import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
interface Props {
  noSleep: boolean;
  setNoSleep: (on: boolean) => void;
}

class Home extends Component<Props> {
  toggleNoSleep = () => {
    this.props.setNoSleep(!this.props.noSleep);
  };
  enableNoSleep = () => {
    this.props.setNoSleep(true);
  };
  render() {
    return (
      <div>
        <div style={{ textAlign: 'center' }}>
          <h1>Controller</h1>
          <div>
            <Button
              icon="lightbulb outline"
              content={`No Sleep: ${this.props.noSleep ? 'On' : 'Off'}`}
              onClick={this.toggleNoSleep}
              color={this.props.noSleep ? 'yellow' : 'grey'}
            />
          </div>

          <Link to={'./controller'}>
            <Button
              className="screen-link"
              icon="arrows alternate"
              content="Steuertasten"
              onClick={this.enableNoSleep}
            />
          </Link>
          <Link to={'./color_panel'}>
            <Button className="screen-link" icon="rss" content="Farbdisplay" onClick={this.enableNoSleep} />
          </Link>
          <Link to={'./color_grid'}>
            <Button
              className="screen-link"
              icon="grid layout"
              content="Farbraster"
              onClick={this.enableNoSleep}
            />
          </Link>
        </div>
      </div>
    );
  }
}
export default Home;
