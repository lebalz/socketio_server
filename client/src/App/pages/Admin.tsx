import React, { Component } from 'react';
import { Table, Button, Dropdown, Embed } from 'semantic-ui-react';
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
    get onlineDeviceIds(): string[] {
        return [...new Set<string>(this.devices.map((d) => d.deviceId))];
    }

    @action
    setGlobalDisplayState(on: boolean, offlineDevices: boolean = false) {
        if (on) {
            this.adminState.hiddenStoreNrs.clear();
            if (offlineDevices) {
                this.adminState.displayedDeviceIds.replace(this.deviceIdDropdownOptions);
            } else {
                this.adminState.displayedDeviceIds.replace(this.onlineDeviceIds);
            }
            this.adminState.displayedDeviceIds.delete(GLOBAL_LISTENER);
        } else {
            this.adminState.displayedDeviceIds.clear();
        }
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
        const types = new Set<DataType>([]);
        this.adminState.displayedDeviceIds.forEach((deviceId) => {
            const store = this.injected.socketDataStore.dataStore.get(deviceId);
            if (store) {
                [...store.rawData.keys()].forEach((t) => types.add(t as DataType));
            }
        });
        return types;
    }

    @computed
    get deviceIdDropdownOptions(): Set<string> {
        const opts = new Set([
            ...this.injected.socketDataStore.dataStore.keys(),
            ...this.devices.map((d) => d.deviceId),
        ]);
        opts.delete(GLOBAL_LISTENER);
        return opts;
    }

    @computed
    get rawMessages(): ClientDataMsg[] {
        const data: ClientDataMsg[] = [];
        const showAll = this.adminState.displayedTypes.size === 0;
        const { displayedDeviceIds, hiddenStoreNrs } = this.adminState;
        displayedDeviceIds.forEach((deviceId) => {
            const store = this.injected.socketDataStore.dataStore.get(deviceId);
            if (store) {
                if (showAll) {
                    store.rawData.forEach((pkgs, type) => {
                        if (![DataType.Acceleration, DataType.Gyro].includes(type)) {
                            data.push(
                                ...pkgs.filter(
                                    (d) =>
                                        !hiddenStoreNrs.has(d.device_nr) &&
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
                                            !hiddenStoreNrs.has(d.device_nr) &&
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
    get accMessages(): Map<number, AccMsg[]> {
        const showAll = this.adminState.displayedTypes.size === 0;
        if (!showAll && !this.adminState.displayedTypes.has(DataType.Acceleration)) {
            return new Map<number, AccMsg[]>();
        }
        const { hiddenStoreNrs, displayedDeviceIds } = this.adminState;
        const data = new Map<number, AccMsg[]>([]);
        displayedDeviceIds.forEach((deviceId) => {
            const store = this.injected.socketDataStore.dataStore.get(deviceId);
            if (store) {
                store.rawAccData.forEach((msg) => {
                    if (!hiddenStoreNrs.has(msg.device_nr)) {
                        if (displayedDeviceIds.has(msg.device_id) && !data.has(msg.device_nr)) {
                            data.set(msg.device_nr, []);
                        }
                    }
                    data.get(msg.device_nr)?.push(msg);
                });
            }
        });
        [...data.keys()].forEach((nr) => {
            if (data.get(nr)?.length === 0) {
                data.delete(nr);
            } else {
                data.set(
                    nr,
                    data.get(nr)!.sort((a, b) => a.time_stamp - b.time_stamp)
                );
            }
        });

        return data;
    }

    @computed
    get gyroMessages(): Map<number, GyroMsg[]> {
        const showAll = this.adminState.displayedTypes.size === 0;
        const data = new Map<number, GyroMsg[]>([]);
        if (!showAll && !this.adminState.displayedTypes.has(DataType.Gyro)) {
            return data;
        }
        const { hiddenStoreNrs, displayedDeviceIds } = this.adminState;
        displayedDeviceIds.forEach((deviceId) => {
            const store = this.injected.socketDataStore.dataStore.get(deviceId);
            if (store) {
                store.rawGyroData.forEach((msg) => {
                    if (!hiddenStoreNrs.has(msg.device_nr)) {
                        if (displayedDeviceIds.has(msg.device_id) && !data.has(msg.device_nr)) {
                            data.set(msg.device_nr, []);
                        }
                    }
                    data.get(msg.device_nr)?.push(msg);
                });
            }
        });
        [...data.keys()].forEach((nr) => {
            if (data.get(nr)?.length === 0) {
                data.delete(nr);
            } else {
                data.set(
                    nr,
                    data.get(nr)!.sort((a, b) => a.time_stamp - b.time_stamp)
                );
            }
        });

        return data;
    }

    render() {
        const showAll = this.adminState.displayedTypes.size === 0;
        const shownDevices = [...this.adminState.displayedDeviceIds].filter((d) => d !== '[object Object]');
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
                    <Button
                        icon="mobile alternate"
                        onClick={() => this.setGlobalDisplayState(true)}
                        size="mini"
                        content="Show All"
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
                            const isIdActive = this.adminState.displayedDeviceIds.has(device.deviceId);
                            const isNrHidden = this.adminState.hiddenStoreNrs.has(device.deviceNr);
                            return (
                                <Table.Row key={idx}>
                                    <Table.Cell
                                        style={{ cursor: 'pointer' }}
                                        className="no-text-select"
                                        collapsing
                                        textAlign="right"
                                        selectable
                                        positive={isIdActive && !isNrHidden}
                                        negative={isIdActive && isNrHidden}
                                        onClick={() => {
                                            if (isNrHidden) {
                                                this.adminState.hiddenStoreNrs.delete(device.deviceNr);
                                            } else if (!isIdActive) {
                                                this.adminState.displayedDeviceIds.add(device.deviceId);
                                                this.adminState.hiddenStoreNrs.delete(device.deviceNr);
                                            } else if (device.deviceNr !== undefined) {
                                                this.adminState.hiddenStoreNrs.add(device.deviceNr);
                                            }
                                        }}
                                    >
                                        {device.deviceNr}
                                    </Table.Cell>
                                    <Table.Cell
                                        className="no-text-select"
                                        style={{ cursor: 'pointer' }}
                                        collapsing
                                        selectable
                                        positive={isIdActive}
                                        onClick={() => {
                                            if (!isIdActive) {
                                                this.adminState.displayedDeviceIds.add(device.deviceId);
                                            } else {
                                                this.adminState.displayedDeviceIds.delete(device.deviceId);
                                            }
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
                {shownDevices.length === 1 && (
                    <Embed
                        style={{
                            maxHeight: '400px',
                        }}
                        active
                        url={`/playground?device_id=${shownDevices[0]}&striped=1&silent=1`}
                    />
                )}

                {this.deviceIdDropdownOptions.size > 0 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>All Devices</h3>
                            <Button
                                icon="mobile alternate"
                                onClick={() => this.setGlobalDisplayState(true, true)}
                                size="mini"
                                content="Show All"
                            />
                        </div>
                        <Dropdown
                            placeholder="Devices"
                            search
                            clearable
                            fluid
                            selection
                            multiple
                            options={[...this.deviceIdDropdownOptions].map((d) => ({
                                text: d,
                                value: d,
                            }))}
                            value={shownDevices}
                            onChange={(e, data) => {
                                if (typeof data.value === 'string') {
                                    return;
                                }
                                const opts = (data.value ?? []) as string[];
                                this.adminState.displayedDeviceIds.replace(new Set(opts));
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
                        {this.accMessages.size > 0 && <h3>Accelerometer</h3>}
                        {[...this.accMessages.keys()].map((deviceNr) => {
                            const len = this.accMessages.get(deviceNr)!.length ?? 1;
                            const last = this.accMessages.get(deviceNr)![len - 1];
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
                                        data={this.accMessages.get(deviceNr)!}
                                        width={Math.min(500, this.state.windowWidth)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        {this.gyroMessages.size > 0 && <h3>Gyrometer</h3>}
                        {[...this.gyroMessages.keys()].map((deviceNr) => {
                            const len = this.gyroMessages.get(deviceNr)!.length ?? 1;
                            const last = this.gyroMessages.get(deviceNr)![len - 1];
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
                                        data={this.gyroMessages.get(deviceNr)!}
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
