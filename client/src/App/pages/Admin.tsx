import React, { Component } from 'react';
import { Table, Button, Checkbox, Dropdown } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import ViewStateStore from '../stores/view_state_store';
import SocketDataStore, { GLOBAL_LISTENER } from '../stores/socket_data_store';
import Nosleep from '../components/Nosleep';
import { action, computed } from 'mobx';
import LineGraph from '../components/LineGraph';
import { AccMsg, ClientDataMsg, DataType, GyroMsg } from 'src/Shared/SharedTypings';
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

    @computed
    get displayedDeviceNrs(): Set<number> {
        return new Set<number>(this.adminState.displayedStoreNrs.map((d) => d.nr));
    }

    @computed
    get displayedDeviceIds(): Set<string> {
        const set = new Set<string>(this.adminState.displayedStoreNrs.map((d) => d.id));
        this.adminState.displayedStoreIds.forEach((id) => {
            set.add(id);
        });
        return set;
    }

    @action
    setGlobalDisplayState(on: boolean) {
        this.adminState.showAllDevices = on;
        if (on) {
            const all = this.devices
                .filter((d) => d.deviceId !== GLOBAL_LISTENER)
                .map((d) => ({ nr: d.deviceNr ?? -999, id: d.deviceId }));
            this.adminState.displayedStoreNrs.replace(all);
        } else {
            this.adminState.displayedStoreNrs.clear();
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
            this.adminState.displayedStoreIds.add(deviceId);
        } else {
            this.adminState.displayedStoreIds.delete(deviceId);
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

    @action
    setDisplayedType(type: DataType, on: boolean) {
        if (on) {
            this.adminState.displayedTypes.add(type);
        } else {
            this.adminState.displayedTypes.delete(type);
        }
    }

    @computed
    get typeOptions(): Set<DataType> {
        const { displayedDeviceIds } = this;
        const types = new Set<DataType>([]);
        const deviceIds = new Set<string>([...displayedDeviceIds, ...this.offlineDeviceIds]);
        deviceIds.forEach((deviceId) => {
            const store = this.injected.socketDataStore.dataStore.get(deviceId);
            if (store) {
                [...store.rawData.keys()].forEach((t) => types.add(t as DataType));
            }
        });
        return types;
    }

    @computed
    get offlineDeviceIds(): string[] {
        return [...this.injected.socketDataStore.dataStore.keys()].filter((d) => !this.deviceIds.includes(d));
    }

    @computed
    get rawMessages(): ClientDataMsg[] {
        const { displayedDeviceNrs, displayedDeviceIds } = this;
        const data: ClientDataMsg[] = [];
        const showAll = this.adminState.displayedTypes.size === 0;
        displayedDeviceIds.forEach((deviceId) => {
            const store = this.injected.socketDataStore.dataStore.get(deviceId);
            if (store) {
                if (showAll) {
                    store.rawData.forEach((pkgs, type) => {
                        if (![DataType.Acceleration, DataType.Gyro].includes(type)) {
                            data.push(
                                ...pkgs.filter(
                                    (d) =>
                                        displayedDeviceNrs.has(d.device_nr) ||
                                        displayedDeviceIds.has(d.device_id)
                                )
                            );
                        }
                    });
                } else {
                    this.adminState.displayedTypes.forEach((type) => {
                        if (![DataType.Acceleration, DataType.Gyro].includes(type)) {
                            const msgs = store.rawData.get(type);
                            if (msgs) {
                                data.push(
                                    ...msgs.filter(
                                        (d) =>
                                            displayedDeviceNrs.has(d.device_nr) ||
                                            displayedDeviceIds.has(d.device_id)
                                    )
                                );
                            }
                        }
                    });
                }
            }
        });
        return data.sort((a, b) => b.time_stamp - a.time_stamp);
    }

    @computed
    get accMessages(): { [key: string]: AccMsg[] } {
        const showAll = this.adminState.displayedTypes.size === 0;
        if (!showAll && !this.adminState.displayedTypes.has(DataType.Acceleration)) {
            return {};
        }
        const { displayedDeviceNrs, displayedDeviceIds } = this;
        const data: { [key: number]: AccMsg[] } = {};
        displayedDeviceNrs.forEach((d) => (data[d] = []));
        displayedDeviceIds.forEach((deviceId) => {
            const store = this.injected.socketDataStore.dataStore.get(deviceId);
            if (store) {
                store.rawAccData.forEach((msg) => {
                    if (this.offlineDeviceIds.includes(msg.device_id) && data[msg.device_nr] === undefined) {
                        data[msg.device_nr] = [];
                    }
                    if (data[msg.device_nr] !== undefined) {
                        data[msg.device_nr].push(msg);
                    }
                });
            }
        });
        displayedDeviceNrs.forEach((nr) => {
            if (data[nr].length === 0) {
                delete data[nr];
            } else {
                data[nr] = data[nr].sort((a, b) => a.time_stamp - b.time_stamp);
            }
        });

        return data;
    }

    @computed
    get gyroMessages(): { [key: string]: GyroMsg[] } {
        const showAll = this.adminState.displayedTypes.size === 0;
        if (!showAll && !this.adminState.displayedTypes.has(DataType.Gyro)) {
            return {};
        }
        const { displayedDeviceNrs, displayedDeviceIds } = this;
        const data: { [key: number]: GyroMsg[] } = {};
        displayedDeviceNrs.forEach((d) => (data[d] = []));
        displayedDeviceIds.forEach((deviceId) => {
            const store = this.injected.socketDataStore.dataStore.get(deviceId);
            if (store) {
                store.rawGyroData.forEach((msg) => {
                    if (data[msg.device_nr] !== undefined) {
                        data[msg.device_nr].push(msg);
                    }
                });
            }
        });
        displayedDeviceNrs.forEach((nr) => {
            if (data[nr].length === 0) {
                delete data[nr];
            } else {
                data[nr] = data[nr].sort((a, b) => a.time_stamp - b.time_stamp);
            }
        });

        return data;
    }

    render() {
        const showAll = this.adminState.displayedTypes.size === 0;
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
                        checked={this.adminState.showAllDevices}
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

                {this.offlineDeviceIds.length > 0 && (
                    <div>
                        <h3>Offline Devices</h3>
                        <Dropdown
                            placeholder="Offline Devices"
                            search
                            clearable
                            selection
                            options={this.offlineDeviceIds.map((d) => ({ text: d, value: d }))}
                            onChange={(e, data) => {
                                if (this.adminState.offlineDeviceId) {
                                    this.setDisplayStateForGroup(this.adminState.offlineDeviceId, false);
                                }
                                this.setDisplayStateForGroup(data.value as string, true);
                                this.adminState.offlineDeviceId = data.value as string;
                            }}
                        />
                    </div>
                )}
                <div style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                    <Button.Group style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {[...this.typeOptions].map((dt) => {
                            const active = showAll || this.adminState.displayedTypes.has(dt);
                            return (
                                <Button
                                    size="mini"
                                    compact
                                    key={dt}
                                    color={active ? 'blue' : undefined}
                                    active={active}
                                    onClick={() => {
                                        this.setDisplayedType(dt, showAll ? true : !active);
                                    }}
                                >
                                    {dt}
                                </Button>
                            );
                        })}
                    </Button.Group>
                    <div>
                        {Object.keys(this.accMessages).length > 0 && <h3>Accelerometer</h3>}
                        {Object.keys(this.accMessages).map((deviceNr) => {
                            const len = this.accMessages[deviceNr]?.length ?? 1;
                            const last = this.accMessages[deviceNr][len - 1];
                            const ts = last ? new Date(last.time_stamp * 1000) : new Date(0);
                            return (
                                <div key={deviceNr}>
                                    <span>
                                        {last?.device_id}:<b>{deviceNr}</b>
                                        {'@'}
                                        {ts.toLocaleDateString()} {ts.toLocaleTimeString()}:
                                        {ts.getMilliseconds()}
                                    </span>
                                    <LineGraph
                                        type="acc"
                                        data={this.accMessages[deviceNr]}
                                        width={Math.min(500, this.state.windowWidth)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        {Object.keys(this.gyroMessages).length > 0 && <h3>Gyrometer</h3>}
                        {Object.keys(this.gyroMessages).map((deviceNr) => {
                            const len = this.gyroMessages[deviceNr]?.length ?? 1;
                            const last = this.gyroMessages[deviceNr][len - 1];
                            const ts = last ? new Date(last.time_stamp * 1000) : new Date(0);
                            return (
                                <div key={deviceNr}>
                                    <span>
                                        {last?.device_id}:<b>{deviceNr}</b>
                                        {'@'}
                                        {ts.toLocaleDateString()} {ts.toLocaleTimeString()}:
                                        {ts.getMilliseconds()}
                                    </span>
                                    <LineGraph
                                        type="gyro"
                                        data={this.gyroMessages[deviceNr]}
                                        width={Math.min(500, this.state.windowWidth)}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div
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
                                    <Table.HeaderCell>DeviceId</Table.HeaderCell>
                                    <Table.HeaderCell>Time</Table.HeaderCell>
                                    <Table.HeaderCell>To</Table.HeaderCell>
                                    <Table.HeaderCell>Type</Table.HeaderCell>
                                    <Table.HeaderCell>Data</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {this.rawMessages.map((pkg, idx) => {
                                    const ts = new Date(pkg.time_stamp * 1000);
                                    let to = pkg.device_id;
                                    if (pkg.broadcast) {
                                        to = 'broadcast';
                                    }
                                    if (typeof pkg.unicast_to === 'number') {
                                        to = `${pkg.unicast_to}`;
                                    }
                                    let raw = '';
                                    switch (pkg.type) {
                                        case DataType.Sprites:
                                            raw = `Updating ${pkg.sprites.length} sprites ${
                                                pkg.sprites.length < 5
                                                    ? pkg.sprites.map((s) => s.id).join(', ')
                                                    : ''
                                            }`;
                                            break;
                                        case DataType.Grid:
                                            if (
                                                !(
                                                    typeof pkg.grid === 'string' ||
                                                    (pkg.grid[0] && typeof pkg.grid[0] === 'string')
                                                )
                                            ) {
                                                if (pkg.grid.length > 20 && pkg.grid[0].length > 20) {
                                                    raw = `${pkg.grid.length}x${pkg.grid[0].length} Grid`;
                                                }
                                            }
                                            if (raw === '') {
                                                raw = JSON.stringify(
                                                    {
                                                        ...pkg,
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
                                                    ...pkg,
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
                                                {pkg.device_id}:{pkg.device_nr}
                                            </Table.Cell>
                                            <Table.Cell collapsing>
                                                {ts.toLocaleDateString()}
                                                <br />
                                                {`${ts.toLocaleTimeString()}.${`${ts.getMilliseconds()}`.padEnd(
                                                    3,
                                                    '0'
                                                )}`}
                                            </Table.Cell>
                                            <Table.Cell collapsing>{to}</Table.Cell>
                                            <Table.Cell collapsing>{pkg.type}</Table.Cell>
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
                        </Table>
                    </div>
                </div>
            </div>
        );
    }
}

export default Admin;
