import React, { Component } from 'react';
import { Table, Segment, Button, Checkbox } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import ViewStateStore from '../stores/view_state_store';
import DataStore from '../stores/data_store';
import { GLOBAL_LISTENER } from '../SocketData';
import Nosleep from '../components/Nosleep';
import { action, computed } from 'mobx';

interface InjectedProps {
    viewStateStore: ViewStateStore;
    dataStore: DataStore;
}

@inject('viewStateStore', 'dataStore')
@observer
class Admin extends Component {
    _isMounted = false;
    intervallHandle = undefined;
    get injected() {
        return this.props as InjectedProps;
    }

    @action
    componentDidMount() {
        this.injected.dataStore.socket.isAdmin = true;
        this.injected.dataStore.socket.refreshDevices();
    }

    @action
    componentWillUnmount() {
        this.injected.dataStore.socket.isAdmin = false;
    }

    @computed
    get devices() {
        return this.injected.dataStore.socket.devices.sort((a, b) => a.device_nr - b.device_nr);
    }

    render() {
        const showRaw = this.injected.viewStateStore.adminState.showRaw;
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                }}
            >
                <span>
                    <Button
                        icon="trash"
                        onClick={() => this.injected.dataStore.socket.removeAllData()}
                        content="Clear All Data"
                        color="red"
                    />
                    <Nosleep />
                </span>
                <Table celled striped compact unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan="4">Users</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.devices.map((device, idx) => {
                            return (
                                <Table.Row key={idx}>
                                    <Table.Cell collapsing textAlign="right">
                                        {device.device_nr}
                                    </Table.Cell>
                                    <Table.Cell collapsing>{device.device_id}</Table.Cell>
                                    <Table.Cell collapsing>
                                        {device.is_client ? 'Controller' : 'Read Only'}
                                    </Table.Cell>
                                    <Table.Cell collapsing>{device.socket_id}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
                <div style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                    {this.injected.dataStore.socket.dataStore.map((store) => {
                        if (store.deviceId === GLOBAL_LISTENER) {
                            return null;
                        }
                        return (
                            <div
                                key={store.deviceId}
                                style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: '8px' }}
                                className="data-store-tables"
                            >
                                <Table celled striped compact unstackable color="blue">
                                    <Table.Header
                                        onClick={() => (store.show = !store.show)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Table.Row>
                                            <Table.HeaderCell>{store.deviceId}</Table.HeaderCell>
                                            <Table.HeaderCell>Time</Table.HeaderCell>
                                            <Table.HeaderCell>To</Table.HeaderCell>
                                            <Table.HeaderCell>Type</Table.HeaderCell>
                                            <Table.HeaderCell>Data</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    {store.show && (
                                        <Table.Body>
                                            {store.data.reverse().map((event, idx) => {
                                                const ts = new Date(event.time_stamp * 1000);
                                                let to = event.device_id;
                                                if (event.broadcast) {
                                                    to = 'broadcast';
                                                }
                                                if (typeof event.unicast_to === 'number') {
                                                    to = `${event.unicast_to}`;
                                                }
                                                return (
                                                    <Table.Row key={idx}>
                                                        <Table.Cell collapsing>
                                                            {event.device_id}:{event.device_nr}
                                                        </Table.Cell>
                                                        <Table.Cell
                                                            collapsing
                                                        >{`${ts.toLocaleTimeString()}.${`${ts.getMilliseconds()}`.padEnd(
                                                            3,
                                                            '0'
                                                        )}`}</Table.Cell>
                                                        <Table.Cell collapsing>{to}</Table.Cell>
                                                        <Table.Cell collapsing>{event.type}</Table.Cell>
                                                        <Table.Cell collapsing>
                                                            <pre
                                                                style={{
                                                                    overflowY: 'auto',
                                                                    maxHeight: '10em',
                                                                }}
                                                            >
                                                                <code>
                                                                    {JSON.stringify(
                                                                        {
                                                                            ...event,
                                                                            type: undefined,
                                                                            time_stamp: undefined,
                                                                            device_id: undefined,
                                                                            device_nr: undefined,
                                                                        },
                                                                        null,
                                                                        1
                                                                    )}
                                                                </code>
                                                            </pre>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                );
                                            })}
                                        </Table.Body>
                                    )}
                                </Table>
                            </div>
                        );
                    })}
                </div>
                <Checkbox
                    toggle
                    onClick={action(() => {
                        this.injected.viewStateStore.adminState.showRaw = !showRaw;
                    })}
                    label="show raw"
                    checked={showRaw}
                />
                <div style={{ marginBottom: '2em' }} />
                {showRaw && (
                    <Segment style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <pre>
                            <code>{JSON.stringify(this.injected.dataStore.socket.dataStore, null, 2)}</code>
                        </pre>
                    </Segment>
                )}
            </div>
        );
    }
}

export default Admin;
