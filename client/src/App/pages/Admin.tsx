import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import ViewStateStore from '../stores/view_state_store';
import SocketDataStore, { GLOBAL_LISTENER } from '../stores/socket_data_store';
import Nosleep from '../components/Nosleep';
import { action, computed } from 'mobx';
import LineGraph from '../components/LineGraph';

interface InjectedProps {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
class Admin extends Component {
    _isMounted = false;
    intervallHandle = undefined;
    get injected() {
        return this.props as InjectedProps;
    }

    @action
    componentDidMount() {
        this.injected.socketDataStore.isAdmin = true;
        this.injected.socketDataStore.refreshDevices();
    }

    @action
    componentWillUnmount() {
        this.injected.socketDataStore.isAdmin = false;
    }

    @computed
    get devices() {
        return this.injected.socketDataStore.devices
            .slice()
            .sort((a, b) => (a.deviceNr ?? 0) - (b.deviceNr ?? 0));
    }

    render() {
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
                        onClick={() => this.injected.socketDataStore.removeAllData()}
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
                                        {device.deviceNr}
                                    </Table.Cell>
                                    <Table.Cell collapsing>{device.deviceId}</Table.Cell>
                                    <Table.Cell collapsing>
                                        {device.isClient ? 'Controller' : 'Read Only'}
                                    </Table.Cell>
                                    <Table.Cell collapsing>{device.socketId}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
                <div style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                    {[...this.injected.socketDataStore.dataStore.keys()].map((deviceId) => {
                        if (deviceId === GLOBAL_LISTENER) {
                            return null;
                        }
                        const store = this.injected.socketDataStore.dataStore.get(deviceId);
                        if (!store) {
                            console.log('no store!!', deviceId);
                            return null;
                        }
                        return (
                            <div
                                key={deviceId}
                                style={{
                                    maxHeight: '80vh',
                                    overflowY: 'auto',
                                    marginTop: '8px',
                                    width: '100%',
                                }}
                                className="data-store-tables"
                            >
                                <Table celled striped compact unstackable color="blue">
                                    <Table.Header
                                        onClick={() => (store.show = !store.show)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Table.Row>
                                            <Table.HeaderCell>{deviceId}</Table.HeaderCell>
                                            <Table.HeaderCell>Time</Table.HeaderCell>
                                            <Table.HeaderCell>To</Table.HeaderCell>
                                            <Table.HeaderCell>Type</Table.HeaderCell>
                                            <Table.HeaderCell>Data</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    {store.show && (
                                        <Table.Body>
                                            {store.hasRawAcc && (
                                                <Table.Row>
                                                    <Table.HeaderCell colSpan="5">
                                                        <LineGraph type="acc" data={store.rawAccData} />
                                                    </Table.HeaderCell>
                                                </Table.Row>
                                            )}
                                            {store.hasRawGyro && (
                                                <Table.Row>
                                                    <Table.HeaderCell colSpan="5">
                                                        <LineGraph type="gyro" data={store.rawGyroData} />
                                                    </Table.HeaderCell>
                                                </Table.Row>
                                            )}
                                            {store.unchartableRawData.map((event, idx) => {
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
            </div>
        );
    }
}

export default Admin;
