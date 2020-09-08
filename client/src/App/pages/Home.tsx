import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

class Home extends Component {
  state = { noSleepOn: false };
  toggleNoSleep = () => {
    if (this.state.noSleepOn) {
      ((window as any).noSleep as NoSleep).disable();
      this.setState({ noSleepOn: false });
    } else {
      ((window as any).noSleep as NoSleep).enable();
      this.setState({ noSleepOn: true });
    }
  };
  render() {
    return (
      <div>
        <div style={{ textAlign: 'center' }}>
          <h1>Controller</h1>
          <div>
            <Button
              icon="lightbulb outline"
              content={`No Sleep: ${this.state.noSleepOn ? 'On' : 'Off'}`}
              onClick={this.toggleNoSleep}
              color={this.state.noSleepOn ? 'yellow' : 'grey'}
            />
          </div>

          <Link to={'./controller'}>
            <Button
              className="screen-link"
              icon="arrows alternate"
              content="Steuertasten"
              onClick={() => ((window as any).noSleep as NoSleep).enable()}
            />
          </Link>
          <Link to={'./color_panel'}>
            <Button
              className="screen-link"
              icon="rss"
              content="Farbdisplay"
              onClick={() => ((window as any).noSleep as NoSleep).enable()}
            />
          </Link>
          <Link to={'./color_grid'}>
            <Button
              className="screen-link"
              icon="grid layout"
              content="Farbraster"
              onClick={() => ((window as any).noSleep as NoSleep).enable()}
            />
          </Link>
        </div>
      </div>
    );
  }
}
export default Home;
