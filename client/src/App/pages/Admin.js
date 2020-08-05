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
    this.socket = new AdminSocketData()

    this.socket.onDevices.push(this.onDevices)
    this.socket.onDataStore = this.onDataStore
    this.socket.onData.push(this.onData)
    this.socket.emit(SocketEvents.DataStore)
    this.socket.emit(SocketEvents.GetDevices)
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.socket.disconnect()
  }

  onData = (data) => {
    const dataStore = this.state.dataStore || {}
    if (!data.deviceId) {
      return;
    }
    if (!dataStore[data.deviceId]) {
      dataStore[data.deviceId] = []
    }
    if (dataStore[data.deviceId].length > THRESHOLD) {
      dataStore[data.deviceId].shift()
    }
    dataStore[data.deviceId].push(data)
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
    return _.orderBy(_.flatten(Object.values(this.state.dataStore)), ['timeStamp'], 'desc')
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
            {_.sortBy(this.state.devices, ['deviceNr'], 'asc').map((device) => {
              return (
                <Table.Row key={device.socketId}>
                  <Table.Cell collapsing textAlign="right">{device.deviceNr}</Table.Cell>
                  <Table.Cell collapsing>{device.deviceId}</Table.Cell>
                  <Table.Cell collapsing>{device.isController ? 'Controller' : 'Read Only'}</Table.Cell>
                  <Table.Cell collapsing>{device.socketId}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>

          <Table celled striped compact unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan='4'>Events</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.allEvents.map((event, idx) => {
                return (
                  <Table.Row key={idx}>
                    <Table.Cell collapsing>{event.deviceId}</Table.Cell>
                    <Table.Cell collapsing>{new Date(event.timeStamp).toLocaleTimeString()}</Table.Cell>
                    <Table.Cell collapsing>{event.type}</Table.Cell>
                    <Table.Cell collapsing>
                      <pre style={{ overflowY: 'auto', maxHeight: '10em' }}>
                        <code>
                          {JSON.stringify(event[event.type || ''], null, 1)}
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