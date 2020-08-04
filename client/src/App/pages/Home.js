import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';


class Home extends Component {
  render() {
    return (
    <div className="App">
      <h1>Controller</h1>
      <Link to={'./controller'}>
        <Button icon="arrows alternate" content="Steuertasten" />
      </Link>
      <Link to={'./color_panel'}>
        <Button icon="rss" content="Farbdisplay" />
      </Link>
      <Link to={'./color_grid'}>
        <Button icon="grid layout" content="Farbraster" />
      </Link>
    </div>
    );
  }
}
export default Home;