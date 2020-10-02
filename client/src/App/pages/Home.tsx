import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Nosleep from '../components/Nosleep';
import ViewStateStore from '../stores/view_state_store';

interface InjectedProps {
    viewStateStore: ViewStateStore;
}

@inject('viewStateStore')
@observer
class Home extends Component {
    get injected() {
        return this.props as InjectedProps;
    }
    render() {
        return (
            <div>
                <div style={{ textAlign: 'center' }}>
                    <h1>Controller</h1>
                    <div>
                        <Nosleep />
                    </div>

                    <Link to={'./controller'}>
                        <Button
                            className="screen-link"
                            icon="arrows alternate"
                            content="Steuertasten"
                            onClick={() => this.injected.viewStateStore.setNoSleep(true)}
                        />
                    </Link>
                    <Link to={'./color_panel'}>
                        <Button
                            className="screen-link"
                            icon="rss"
                            content="Farbdisplay"
                            onClick={() => this.injected.viewStateStore.setNoSleep(true)}
                        />
                    </Link>
                    <Link to={'./color_grid'}>
                        <Button
                            className="screen-link"
                            icon="grid layout"
                            content="Farbraster"
                            onClick={() => this.injected.viewStateStore.setNoSleep(true)}
                        />
                    </Link>
                    <Link to={'./playground'}>
                        <Button
                            className="screen-link"
                            icon="play"
                            content="Playground"
                            onClick={() => this.injected.viewStateStore.setNoSleep(true)}
                        />
                    </Link>
                </div>
            </div>
        );
    }
}
export default Home;
