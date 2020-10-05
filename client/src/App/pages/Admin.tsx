import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import ViewStateStore from '../stores/view_state_store';
import SocketDataStore, { GLOBAL_LISTENER } from '../stores/socket_data_store';
import Nosleep from '../components/Nosleep';
import { action, computed } from 'mobx';
import LineGraph from '../components/LineGraph';
import { DataType } from 'src/Shared/SharedTypings';

interface InjectedProps {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
class Admin extends Component {
    containerRef = React.createRef<HTMLDivElement>();
    _isMounted = false;
    intervallHandle = undefined;
    state = { windowWidth: 100 };
    get injected() {
        return this.props as InjectedProps;
    }

    @action
    componentDidMount() {
        this.injected.socketDataStore.isAdmin = true;
        this.injected.socketDataStore.refreshDevices();
        this.onResize();
        window.addEventListener('resize', this.onResize);
    }

    @action
    componentWillUnmount() {
        this.injected.socketDataStore.isAdmin = false;
        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
        if (this.containerRef.current) {
            const bbox = this.containerRef.current.getBoundingClientRect();
            this.setState({ windowWidth: bbox.width });
        }
    };

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
                ref={this.containerRef}
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
                        const showAll = store.displayOptions.size === 0;
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
                                            <Table.Row>
                                                <Table.HeaderCell colSpan="5">
                                                    <Button.Group>
                                                        {store.dataTypes.map((dt) => {
                                                            const active =
                                                                showAll || store.displayOptions.has(dt);
                                                            return (
                                                                <Button
                                                                    size="mini"
                                                                    compact
                                                                    key={dt}
                                                                    color={active ? 'blue' : undefined}
                                                                    active={active}
                                                                    onClick={() => {
                                                                        if (store.displayOptions.has(dt)) {
                                                                            console.log('rm', dt);
                                                                            store.displayOptions.delete(dt);
                                                                        } else {
                                                                            console.log('add', dt);
                                                                            store.displayOptions.add(dt);
                                                                        }
                                                                    }}
                                                                >
                                                                    {dt}
                                                                </Button>
                                                            );
                                                        })}
                                                    </Button.Group>
                                                </Table.HeaderCell>
                                            </Table.Row>
                                            {store.hasRawAcc &&
                                                (showAll ||
                                                    store.displayOptions.has(DataType.Acceleration)) && (
                                                    <Table.Row>
                                                        <Table.HeaderCell colSpan="5">
                                                            <LineGraph
                                                                type="acc"
                                                                data={store.rawAccData}
                                                                width={this.state.windowWidth * 0.9}
                                                            />
                                                        </Table.HeaderCell>
                                                    </Table.Row>
                                                )}
                                            {store.hasRawGyro &&
                                                (showAll || store.displayOptions.has(DataType.Gyro)) && (
                                                    <Table.Row>
                                                        <Table.HeaderCell colSpan="5">
                                                            <LineGraph
                                                                type="gyro"
                                                                data={store.rawGyroData}
                                                                width={this.state.windowWidth * 0.9}
                                                            />
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
                                                let raw = '';
                                                switch (event.type) {
                                                    case DataType.Sprites:
                                                        raw = `Updating ${event.sprites.length} sprites ${
                                                            event.sprites.length < 5
                                                                ? event.sprites.map((s) => s.id).join(', ')
                                                                : ''
                                                        }`;
                                                        break;
                                                    case DataType.Grid:
                                                        if (
                                                            !(
                                                                typeof event.grid === 'string' ||
                                                                (event.grid[0] &&
                                                                    typeof event.grid[0] === 'string')
                                                            )
                                                        ) {
                                                            if (
                                                                event.grid.length > 20 &&
                                                                event.grid[0].length > 20
                                                            ) {
                                                                raw = `${event.grid.length}x${event.grid[0].length} Grid`;
                                                            }
                                                        }
                                                        if (raw === '') {
                                                            raw = JSON.stringify(
                                                                {
                                                                    ...event,
                                                                    type: undefined,
                                                                    time_stamp: undefined,
                                                                    device_id: undefined,
                                                                    device_nr: undefined,
                                                                },
                                                                null,
                                                                1
                                                            );
                                                        }
                                                        break;
                                                    default:
                                                        raw = JSON.stringify(
                                                            {
                                                                ...event,
                                                                type: undefined,
                                                                time_stamp: undefined,
                                                                device_id: undefined,
                                                                device_nr: undefined,
                                                            },
                                                            null,
                                                            1
                                                        );
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
                                                                <code>{raw}</code>
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
