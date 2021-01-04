import { inject, observer } from 'mobx-react';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Label, Popup } from 'semantic-ui-react';
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic';
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
        const striped = new URLSearchParams(window.location.search).get('striped');
        const noNav = striped || new URLSearchParams(window.location.search).get('no_nav');
        const noHeader = striped || new URLSearchParams(window.location.search).get('no_header');
        const noIndicator = striped || new URLSearchParams(window.location.search).get('no_indicator');
        const { viewStateStore, socketDataStore } = this.injected;
        const myId = socketDataStore.client.deviceId;
        const runningScripts = socketDataStore.devices.filter(
            (s) => s.deviceId === myId && (s.deviceNr ?? 0) < 0
        ).length;

        let runningScript: { color: SemanticCOLORS; tooltip: string } = {
            color: 'grey',
            tooltip: 'offline: no script running',
        };
        if (runningScripts === 1) {
            runningScript = { color: 'green', tooltip: 'one script running' };
        } else if (runningScripts > 1) {
            runningScript = {
                color: 'orange',
                tooltip: `${runningScripts} running scripts. This could lead to conflicts.`,
            };
        }

        const noSleep = (
            <div>
                <Popup
                    content="Prevent turing off screen"
                    position="top left"
                    trigger={
                        <Label
                            as="a"
                            size="small"
                            circular
                            icon="lightbulb outline"
                            onClick={() => viewStateStore.toggleNoSleep()}
                            color={viewStateStore.noSleepOn ? 'yellow' : undefined}
                        />
                    }
                />
            </div>
        );

        const runningState = (
            <div>
                <Popup
                    content={runningScript.tooltip}
                    position="top left"
                    trigger={
                        <Label
                            as="a"
                            size="small"
                            content={runningScripts}
                            circular
                            color={runningScript.color}
                        />
                    }
                />
            </div>
        );

        if (noNav || noHeader) {
            if (noIndicator) {
                return null;
            }
            return (
                <div className="header-bar">
                    {noSleep}
                    {runningState}
                    <div className="spacer" />
                </div>
            );
        }
        return (
            <div className="header-bar">
                <Link to="/">
                    <Label icon="home" size="small" onClick={() => viewStateStore.disableNoSleep()} />
                </Link>
                <div>
                    <Label size="small" content={`Nr. ${socketDataStore.client.deviceNr}`} />
                </div>
                {!noIndicator && (
                    <Fragment>
                        {noSleep}
                        {runningState}
                    </Fragment>
                )}
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
