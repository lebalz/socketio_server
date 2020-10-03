import { inject, observer } from 'mobx-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Label } from 'semantic-ui-react';
import SocketDataStore from '../stores/socket_data_store';
import ViewStateStore from '../stores/view_state_store';

interface InjectedProps {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
export default class Header extends React.Component {
    get injected() {
        return this.props as InjectedProps;
    }
    render() {
        const { viewStateStore, socketDataStore } = this.injected;
        return (
            <div className="header-bar">
                <Link to="/">
                    <Label icon="home" size="small" onClick={() => viewStateStore.disableNoSleep()} />
                </Link>
                <div>
                    <Label size="small" content={`Nr. ${socketDataStore.client.deviceNr}`} />
                </div>
                <div>
                    <Label
                        as="a"
                        size="small"
                        icon="lightbulb outline"
                        onClick={() => viewStateStore.toggleNoSleep()}
                        color={viewStateStore.noSleepOn ? 'yellow' : undefined}
                    />
                </div>
                <div className="spacer" />
                <div style={{ margin: '0.25em 0' }}>
                    <label htmlFor="device-id" style={{ marginRight: '1em' }}>
                        DeviceID
                    </label>
                    <input
                        disabled={this.injected.socketDataStore.isAdmin}
                        key="device-id"
                        type="string"
                        value={socketDataStore.client.deviceId}
                        readOnly
                        onClick={() =>
                            viewStateStore.setDeviceIdPromptOpen(!this.injected.socketDataStore.isAdmin)
                        }
                    />
                </div>
                <div className="spacer" />
            </div>
        );
    }
}
