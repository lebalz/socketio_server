import React, { Component } from 'react';
import { Table, Button, Checkbox } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import ViewStateStore from '../stores/view_state_store';
import SocketDataStore, { GLOBAL_LISTENER } from '../stores/socket_data_store';
import Nosleep from '../components/Nosleep';
import { action, computed } from 'mobx';
import LineGraph from '../components/LineGraph';
import { DataType } from 'src/Shared/SharedTypings';
import Device from '../models/Device';

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
    get adminState() {
        return this.injected.viewStateStore.adminState;
    }

    @computed
    get devices(): Device[] {
        return this.injected.socketDataStore.devices
            .slice()
            .sort((a, b) => (a.deviceNr ?? 0) - (b.deviceNr ?? 0));
    }

    @computed
    get globalListenerNrs(): number[] {
        return this.devices
            .filter((d) => d.deviceNr !== undefined && d.deviceId === GLOBAL_LISTENER)
            .map((d) => d.deviceNr!);
    }

    @computed
    get deviceIds(): string[] {
        return [...new Set<string>(this.devices.map((d) => d.deviceId))];
    }

    @action
    setGlobalDisplayState(on: boolean) {
        if (on) {
            const all = this.devices
                .filter((d) => d.deviceId !== GLOBAL_LISTENER)
                .map((d) => ({ nr: d.deviceNr ?? -999, id: d.deviceId }));
            this.injected.viewStateStore.adminState.displayedStoreNrs.replace(all);
        } else {
            this.injected.viewStateStore.adminState.displayedStoreNrs.clear();
        }
    }

    @action
    setDisplayState(deviceId: string, deviceNr: number, on: boolean) {
        if (this.globalListenerNrs.includes(deviceNr)) {
            return;
        }
        const s = this.adminState.displayedStoreNrs.find((d) => d.nr === deviceNr);
        if (on) {
            if (!s) {
                this.adminState.displayedStoreNrs.push({ nr: deviceNr, id: deviceId });
            }
        } else {
            if (s) {
                this.adminState.displayedStoreNrs.remove(s);
            }
        }
    }

    @action
    setDisplayStateForGroup(deviceId: string, on: boolean) {
        if (deviceId === GLOBAL_LISTENER) {
            return;
        }
        if (on) {
            this.injected.viewStateStore.adminState.displayedStoreIds.add(deviceId);
        } else {
            this.injected.viewStateStore.adminState.displayedStoreIds.delete(deviceId);
        }
        const store = this.injected.socketDataStore.dataStore.get(deviceId);
        if (store) {
            store.show = on;
        }
        const devices = this.devices.filter((d) => d.deviceId === deviceId);
        devices.forEach((d) => {
            this.setDisplayState(d.deviceId, d.deviceNr ?? -999, on);
        });
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
                    <Checkbox
                        slider
                        onChange={(e, data) => {
                            this.setGlobalDisplayState(!!data.checked);
                        }}
                        label="Show All"
                    />
                </span>
                <Table celled striped compact unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan="1">Device Nr</Table.HeaderCell>
                            <Table.HeaderCell colSpan="1">Device Id</Table.HeaderCell>
                            <Table.HeaderCell colSpan="1">Type</Table.HeaderCell>
                            <Table.HeaderCell colSpan="1">Socket Id</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.devices.map((device, idx) => {
                            const activeId = this.adminState.displayedStoreIds.has(device.deviceId);
                            const activeNr = !!this.adminState.displayedStoreNrs.find(
                                (d) => d.nr === device.deviceNr && d.id === device.deviceId
                            );
                            return (
                                <Table.Row key={idx}>
                                    <Table.Cell
                                        style={{ cursor: 'pointer' }}
                                        className="no-text-select"
                                        collapsing
                                        textAlign="right"
                                        selectable
                                        positive={activeNr}
                                        negative={activeId && !activeNr}
                                        onClick={() => {
                                            this.setDisplayState(
                                                device.deviceId,
                                                device.deviceNr ?? -999,
                                                !activeNr
                                            );
                                        }}
                                    >
                                        {device.deviceNr}
                                    </Table.Cell>
                                    <Table.Cell
                                        className="no-text-select"
                                        style={{ cursor: 'pointer' }}
                                        collapsing
                                        selectable
                                        positive={activeId}
                                        onClick={() => {
                                            this.setDisplayStateForGroup(device.deviceId, !activeId);
                                        }}
                                    >
                                        {device.deviceId}
                                    </Table.Cell>
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
                    {this.deviceIds.map((deviceId) => {
                        if (deviceId === GLOBAL_LISTENER) {
                            return null;
                        }
                        const store = this.injected.socketDataStore.dataStore.get(deviceId);
                        if (!store) {
                            console.log('no store!!', deviceId);
                            return null;
                        }
                        if (![...this.adminState.displayedStoreNrs].find((nr) => nr.id === deviceId)) {
                            return null;
                        }
                        const showAll = store.displayOptions.size === 0;
                        const displayedNrs = this.adminState.displayedStoreNrs.map((nr) => nr.nr);
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
                                    <Table.Header>
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
                                                                            store.displayOptions.delete(dt);
                                                                        } else {
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
                                            {store.adminViewMessages
                                                .filter((pkg) => displayedNrs.includes(pkg.device_nr))
                                                .map((pkg, idx) => {
                                                    return (
                                                        <Table.Row key={idx}>
                                                            <Table.Cell collapsing>
                                                                {pkg.device_id}:{pkg.device_nr}
                                                            </Table.Cell>
                                                            <Table.Cell collapsing>
                                                                {pkg.time_stamp.toLocaleDateString()}
                                                                <br />
                                                                {`${pkg.time_stamp.toLocaleTimeString()}.${`${pkg.time_stamp.getMilliseconds()}`.padEnd(
                                                                    3,
                                                                    '0'
                                                                )}`}
                                                            </Table.Cell>
                                                            <Table.Cell collapsing>{pkg.to}</Table.Cell>
                                                            <Table.Cell collapsing>{pkg.type}</Table.Cell>
                                                            <Table.Cell collapsing>
                                                                <pre
                                                                    style={{
                                                                        overflowY: 'auto',
                                                                        maxHeight: '10em',
                                                                    }}
                                                                >
                                                                    <code>{pkg.raw}</code>
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
