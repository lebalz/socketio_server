import socketioClient from "socket.io-client";
import * as _ from "lodash";
import {
  DataMsg,
  Device,
  SocketEvents,
  DataType,
  AllDataPkg,
  DevicesPkg,
  DataStore,
  DataPkg,
  MessageType,
} from "../Shared/SharedTypings";

const WS_PORT = process.env.NODE_ENV === "production" ? "" : ":5000";

export default class SocketData {
  socket: SocketIOClient.Socket;
  /**
   *
   * @param {string} deviceId
   */
  deviceId = "";

  /**
   *
   * @param {number} deviceNr
   */
  deviceNr = -1;

  /**
   *
   * @param {Array<any>} myData (data for this deviceId)
   */
  myData: DataMsg[] = [];

  /**
   *
   * @param {Array<any>} data from other clients
   */
  otherData: DataMsg[] = [];

  /**
   *
   * @param {Array<{device_id: string, device_nr: number, is_client: boolean, socket_id: string}>} all connected devices
   */
  devices: Device[] = [];
  startTime = Date.now() / 1000.0;

  /**
   * @param {Array<event => void)>}
   */
  onData: ((data: DataMsg) => void)[] = [];

  /**
   * @param {Array<event => void)>}
   */
  onDevices: ((devices: Device[]) => void)[] = [];

  /**
   * @param {Array<event => void)>}
   */
  onAllData: ((allData: AllDataPkg) => void)[] = [];

  /**
   * @param {undefined | (data) => void}
   */
  onDevice?: (deviceNr: number) => void;

  constructor() {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const ws_url = `${protocol}://${window.location.hostname}${WS_PORT}`;
    this.socket = socketioClient(ws_url, {
      transports: ["websocket", "polling"],
    });
    this.socket.on(SocketEvents.Devices, (data: DevicesPkg) => {
      this.devices = data.devices;
      this.onDevices.forEach((callback) => callback(data.devices));
    });
    this.socket.on(SocketEvents.Device, (data: Device) => {
      this.deviceNr = data.device_nr;
      if (this.onDevice) {
        this.onDevice(data.device_nr);
      }
      this.refreshData();
    });
    this.socket.on(SocketEvents.AllData, (data: AllDataPkg) => {
      if (data.device_id === this.deviceId) {
        this.myData = data.all_data;
      } else {
        this.otherData.push(...data.all_data);
      }
      this.onAllData.forEach((callback) => callback(data));
    });
    this.socket.on(SocketEvents.NewData, (data: DataMsg) => {
      if (data.device_id === this.deviceId) {
        this.myData.push(data);
      } else if (data.device_id) {
        this.otherData.push(data);
      }
      this.onData.forEach((callback) => {
        callback(data);
      });
    });
    this.connect();
  }

  get isDisabled() {
    return this.socket.connected;
  }

  getData(type: DataType) {
    return this.myData.filter((d) => d.type === type);
  }

  setDeviceId = _.debounce((deviceId) => {
    const oldId = this.deviceId;
    this.deviceId = deviceId;
    this.emit(SocketEvents.NewDevice, {
      device_id: deviceId,
      old_device_id: oldId,
      is_client: true,
    });
  }, 300);

  clearData() {
    this.emit(SocketEvents.Clear);
  }

  refreshData() {
    this.emit(SocketEvents.GetAllData);
  }

  refreshDevices() {
    this.emit(SocketEvents.GetDevices);
  }

  /**
   *
   * @param {string} event
   * @param {Object} data
   * @param {boolean} broadcast
   */
  emit(event: SocketEvents, data: MessageType = undefined, broadcast: boolean = false) {
    if (!this.socket.connected) {
      this.connect();
    }
    this.socket.emit(event, {
      device_id: this.deviceId,
      device_nr: this.deviceNr,
      time_stamp: Date.now() / 1000.0,
      broadcast: broadcast,
      ...data,
    });
  }

  addData(data: DataPkg) {
    this.emit(SocketEvents.NewData, data);
  }

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export class AdminSocketData extends SocketData {
  dataStore = {};

  /**
   * @param {undefined | (data) => void}
   */
  onDataStore?: (ds: DataStore) => void;
  constructor() {
    super();
    this.deviceId = "GLOBAL_LISTENER";
    this.emit(SocketEvents.NewDevice, {
      device_id: this.deviceId,
      is_client: false,
    });

    this.socket.on(SocketEvents.DataStore, (data: DataStore) => {
      this.dataStore = data;
      if (this.onDataStore) {
        this.onDataStore(data);
      }
    });
  }

  removeAllData() {
    this.emit(SocketEvents.RemoveAll);
  }

  getDataStore() {
    this.emit(SocketEvents.DataStore);
  }

  get allEvents() {
    return _.orderBy(this.otherData, ["time_stamp"], "desc");
  }

  destroy() {
    this.onAllData = [];
    this.onData = [];
    this.onDevices = [];
    this.onDataStore = undefined;
    this.onDevice = undefined;
    this.disconnect();
  }
}
