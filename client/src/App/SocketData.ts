import socketioClient from "socket.io-client";
import * as _ from "lodash";

export interface Device {
  device_id: string;
  socket_id: string;
  device_nr: number;
  is_client: boolean;
}

interface TimeStampedMsg {
  time_stamp: number;
}
export interface BaseMsg extends TimeStampedMsg {
  device_id: string;
  device_nr: number;
}

export enum DataType {
  Key = "key",
  Grid = "grid",
  Color = "color",
  Acceleration = "acceleration",
  Gyro = "gyro",
  Pointer = "pointer",
  Notification = "notification",
  Unknown = "unknown",
  AllData = "all_data",
}

export interface DataMsg extends BaseMsg {
  type: DataType;
  unicast_to?: number;
  broadcast?: boolean;
}

export enum PointerContext {
  Color = "color",
  Grid = "grid",
}

interface PointerDataMsg extends DataMsg {
  type: DataType.Pointer;
  context: PointerContext;
}

interface ColorPointer extends PointerDataMsg {
  context: PointerContext.Color;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridPointerMsg extends PointerDataMsg {
  context: PointerContext.Grid;
  row: number;
  column: number;
  color: string;
}

export interface GridMsg extends DataMsg {
  type: DataType.Grid;
  grid: string[][];
}
export interface ColorMsg extends DataMsg {
  type: DataType.Color;
  color: string;
}

export enum SocketEvents {
  Device = "device",
  Devices = "devices",
  AllData = "all_data",
  NewData = "new_data",
  Clear = "clear_data",
  NewDevice = "new_device",
  GetAllData = "get_all_data",
  GetDevices = "get_devices",
  JoinRoom = "join_room",
  LeaveRoom = "leave_room",
  RoomLeft = "room_left",
  RoomJoined = "room_joined",
  RemoveAll = "remove_all",
  DataStore = "data_store",
  ErrorMsg = "error_msg",
  SetNewDeviceNr = "set_new_device_nr",
  InformationMsg = "information_msg",
}

interface AllDataPkg {
  device_id: string;
  type: DataType.AllData;
  all_data: DataMsg[];
}

interface DevicesPkg {
  time_stamp: number;
  devices: Device[];
}

export enum Key {
  Up = "up",
  Right = "right",
  Down = "down",
  Left = "left",
  Home = "home",
}

export interface KeyMsg extends DataMsg {
  type: DataType.Key,
  key: Key
}

interface Acc {
  x: number;
  y: number;
  z: number;
  interval: number;
}

interface Gyro {
  alpha: number;
  beta: number;
  gamma: number;
  absolute: boolean;
}

export interface AccMsg extends Acc, DataMsg {
  type: DataType.Acceleration;
}

export interface GyroMsg extends Gyro, DataMsg {
  type: DataType.Gyro;
}

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
  emit(event: SocketEvents, data: Object = {}, broadcast: boolean = false) {
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

  /**
   *
   * @param {Object} data
   */
  addData(data: Object) {
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
  onDataStore?: (ds: { [id: string]: DataMsg[] }) => void;
  constructor() {
    super();
    this.deviceId = "GLOBAL_LISTENER";
    this.emit(SocketEvents.NewDevice, {
      device_id: this.deviceId,
      is_client: false,
    });

    this.socket.on(
      SocketEvents.DataStore,
      (data: { [id: string]: DataMsg[] }) => {
        this.dataStore = data;
        if (this.onDataStore) {
          this.onDataStore(data);
        }
      }
    );
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
