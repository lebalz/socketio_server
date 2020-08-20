import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';


class Home extends Component {
  render() {
    return (
      <div style={{textAlign: 'center'}}>
        <h1>Controller</h1>
        <Link to={'./controller'} >
          <Button
            className="screen-link"
            icon="arrows alternate"
            content="Steuertasten"
            onClick={() => ((window as any).noSleep as NoSleep).enable()} />
        </Link>
        <Link to={'./color_panel'} >
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
    );
  }
}
export default Home;