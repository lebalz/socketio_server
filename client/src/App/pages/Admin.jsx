import React, { Component } from 'react';
import { Table, Segment, Button, Checkbox } from 'semantic-ui-react';
import { SocketEvents, AdminSocketData } from '../SocketData';
import * as _ from 'lodash';

const THRESHOLD = 20

class ColorPanel extends Component {
  _isMounted = false;
  intervallHandle = undefined;
  state = { devices: [], dataStore: {}, showRaw: false, noSleepOn: false }

  componentDidMount() {
    this._isMounted = true;
    this.props.socket.disconnect()
    this.socket = new AdminSocketData()

    this.socket.onDevices.push(this.onDevices)
    this.socket.onDataStore = this.onDataStore
    this.socket.onData.push(this.onData)
    this.socket.emit(SocketEvents.DataStore)
    this.socket.emit(SocketEvents.GetDevices)
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.socket.destroy()
  }

  onData = (data) => {
    const dataStore = this.state.dataStore || {}
    if (!data.device_id) {
      return;
    }
    if (!dataStore[data.device_id]) {
      dataStore[data.device_id] = []
    }
    if (dataStore[data.device_id].length > THRESHOLD) {
      dataStore[data.device_id].shift()
    }
    dataStore[data.device_id].push(data)
    this.setState({ dataStore: dataStore })
  }

  onDataStore = (data) => {
    this.setState({ dataStore: data })
  }

  onDevices = (devices) => {
    if (this._isMounted) {
      this.setState({ devices: devices })
    }
  }

  enableNoSleep = () => {
    if (this.state.noSleepOn) {
      window.noSleep.disable();
      this.setState({ noSleepOn: false })
    } else {
      window.noSleep.enable();
      this.setState({ noSleepOn: true })
    }
  }

  get allEvents() {
    return _.orderBy(_.flatten(Object.values(this.state.dataStore)), ['time_stamp'], 'desc')
  }
  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        <span>
          <Button icon="trash" onClick={() => this.socket.removeAllData()} content="Clear All Data" color="red" />
          <Button icon="lightbulb outline" content="No Sleep" onClick={this.enableNoSleep} color={this.state.noSleepOn ? 'yellow' : 'grey'} />
        </span>
        <Table celled striped compact unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan='4'>Users</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {_.sortBy(this.state.devices, ['device_nr'], 'asc').map((device) => {
              return (
                <Table.Row key={device.socket_id}>
                  <Table.Cell collapsing textAlign="right">{device.device_nr}</Table.Cell>
                  <Table.Cell collapsing>{device.device_id}</Table.Cell>
                  <Table.Cell collapsing>{device.is_controller ? 'Controller' : 'Read Only'}</Table.Cell>
                  <Table.Cell collapsing>{device.socket_id}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>

          <Table celled striped compact unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Device Id</Table.HeaderCell>
                <Table.HeaderCell>Time</Table.HeaderCell>
                <Table.HeaderCell>To</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Data</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.allEvents.map((event, idx) => {
                const ts = new Date(event.time_stamp * 1000);
                let to = event.device_id
                if (event.broadcast) {
                  to = 'broadcast'
                }
                if (typeof (event.unicast_to) === 'number') {
                  to = event.unicast_to
                }
                return (
                  <Table.Row key={idx}>
                    <Table.Cell collapsing>{event.device_id}:{event.device_nr}</Table.Cell>
                    <Table.Cell collapsing>{`${ts.toLocaleTimeString()}.${`${ts.getMilliseconds()}`.padEnd(3, '0')}`}</Table.Cell>
                    <Table.Cell collapsing>{to}</Table.Cell>
                    <Table.Cell collapsing>{event.type}</Table.Cell>
                    <Table.Cell collapsing>
                      <pre style={{ overflowY: 'auto', maxHeight: '10em' }}>
                        <code>
                          {JSON.stringify({ ...event, type: undefined, time_stamp: undefined, device_id: undefined, device_nr: undefined }, null, 1)}
                        </code>
                      </pre>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </div>

        <Checkbox toggle onClick={() => { this.setState({ showRaw: !this.state.showRaw }) }} label="show raw" checked={this.state.showRaw} />
        {this.state.showRaw &&
          <Segment style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <pre>
              <code>
                {JSON.stringify(this.state.dataStore, null, 2)}
              </code>
            </pre>
          </Segment>
        }
      </div>
    );
  }
}

export default ColorPanel;