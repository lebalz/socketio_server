export interface Device {
  device_id: string;
  socket_id: string;
  device_nr: number;
  is_client: boolean;
}

export interface TimeStampedMsg {
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

export interface DataStore {
  [key: string]: DataMsg[];
}

export interface DataPkg {
  type: DataType;
  unicast_to?: number;
  broadcast?: boolean;
  [key: string]: any;
}

export interface DataMsg extends DataPkg, BaseMsg {}

export enum PointerContext {
  Color = "color",
  Grid = "grid",
}

export interface PointerDataMsg extends DataMsg {
  type: DataType.Pointer;
  context: PointerContext;
}

export interface ColorPointer extends PointerDataMsg {
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

export interface NewDevice {
  device_id: string;
  old_device_id?: string;
  is_client: boolean;
}

export type MessageType = DataMsg | DataPkg | NewDevice | undefined;

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

export interface AllDataPkg {
  device_id: string;
  type: DataType.AllData;
  all_data: DataMsg[];
}

export interface DevicesPkg {
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
  type: DataType.Key;
  key: Key;
}

export interface InformationPkg extends TimeStampedMsg {
  message: string;
  action: TimeStampedMsg;
  [key: string]: any;
}

export interface SetDeviceNr extends TimeStampedMsg {
  new_device_nr: number;
  device_id: string;
  current_device_nr?: number;
}

export interface RoomDevice {
  room: string;
  device: Device;
}

export interface DeviceIdPkg {
  device_id: string;
}

export interface Acc {
  x: number;
  y: number;
  z: number;
  interval: number;
}

export interface Gyro {
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
