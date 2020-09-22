import { ColorName, RGB } from './../App/models/Color';
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
    Key = 'key',
    Grid = 'grid',
    GridUpdate = 'grid_update',
    Color = 'color',
    Acceleration = 'acceleration',
    Gyro = 'gyro',
    Pointer = 'pointer',
    Notification = 'notification',
    InputPrompt = 'input_prompt',
    InputResponse = 'input_response',
    Unknown = 'unknown',
    AllData = 'all_data',
    AlertConfirm = 'alert_confirm',
    Sprite = 'sprite',
    Sprites = 'sprites',
    SpriteCollision = 'sprite_collision',
    SpriteOut = 'sprite_out',
    PlaygroundConfig = 'playground_config',
}

export interface DataStore {
    [key: string]: ClientDataMsg[];
}

export interface DataPkg {
    type: DataType;
    unicast_to?: number;
    broadcast?: boolean;
    caller_id?: string;
    response_id?: string;
    alert?: boolean;
    sprites?: SpriteMsg[];
    sprite?: ControlledSprite | UncontrolledSprite;
}

export interface SendDataPkg extends DataPkg {
    [key: string]: any;
}

interface DataMsg extends DataPkg, BaseMsg, TimeStampedMsg {}

export interface NotificationMsg extends DataMsg {
    type: DataType.Notification;
    message: string;
    notification_type?: 'success' | 'error' | 'warn';
    time?: number;
    alert?: boolean;
    response_id?: string;
}

export interface AlertConfirm {
    displayed_at: number;
}

export interface AlertConfirmMsg extends DataMsg, AlertConfirm {
    type: DataType.AlertConfirm;
}

export interface InputPromptMsg extends DataMsg {
    type: DataType.InputPrompt;
    question: string;
    input_type?: 'number' | 'date' | 'text' | 'datetime-local' | 'time' | 'select';
    response_id: string;
    options?: string[];
}

export interface SelectionPrompt extends InputPromptMsg {
    input_type: 'select';
    options: string[];
}

export interface InputResponse {
    response?: string | number | Date;
    displayed_at: number;
}

export interface InputResponseMsg extends DataMsg, InputResponse {
    caller_id: string;
    type: DataType.InputResponse;
}

export enum PointerContext {
    Color = 'color',
    Grid = 'grid',
}

export interface PointerDataMsg extends DataMsg {
    type: DataType.Pointer;
    context: PointerContext;
}

export interface ColorPointer {
    x: number;
    y: number;
    color: string;
    width: number;
    height: number;
    displayed_at: number;
}

export interface ColorPointerMsg extends PointerDataMsg, ColorPointer {
    context: PointerContext.Color;
}

export interface GridPointer {
    row: number;
    column: number;
    color: string;
    displayed_at: number;
}

export interface GridPointerMsg extends PointerDataMsg, GridPointer {
    context: PointerContext.Grid;
}

export type ColorSpecification = string | number;

export interface GridMsg extends DataMsg {
    type: DataType.Grid;
    grid: ColorSpecification[][] | string[] | string;
    base_color?: RGB | ColorName;
}

export interface GridUpdateMsg extends DataMsg {
    type: DataType.GridUpdate;
    row: number;
    column: number;
    color: ColorSpecification | string;
    base_color?: RGB | ColorName;
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
    Device = 'device',
    Devices = 'devices',
    AllData = 'all_data',
    NewData = 'new_data',
    Clear = 'clear_data',
    NewDevice = 'new_device',
    GetAllData = 'get_all_data',
    GetDevices = 'get_devices',
    JoinRoom = 'join_room',
    LeaveRoom = 'leave_room',
    RoomLeft = 'room_left',
    RoomJoined = 'room_joined',
    RemoveAll = 'remove_all',
    DataStore = 'data_store',
    ErrorMsg = 'error_msg',
    SetNewDeviceNr = 'set_new_device_nr',
    InformationMsg = 'information_msg',
}

interface UnknownMsg extends DataMsg {
    type: DataType.Unknown;
}

export type ClientDataMsg =
    | KeyMsg
    | GridMsg
    | GridUpdateMsg
    | ColorMsg
    | AccMsg
    | GyroMsg
    | PointerDataMsg
    | NotificationMsg
    | InputPromptMsg
    | InputResponseMsg
    | AllDataMsg
    | AlertConfirmMsg
    | SpriteMsg
    | SpritesMsg
    | SpriteCollisionMsg
    | SpriteOutMsg
    | PlaygroundConfigMsg
    | UnknownMsg;

export interface AllDataMsg extends DataMsg {
    device_id: string;
    type: DataType.AllData;
    all_data: ClientDataMsg[];
}

export interface DevicesPkg {
    time_stamp: number;
    devices: Device[];
}

export enum Key {
    Up = 'up',
    Right = 'right',
    Down = 'down',
    Left = 'left',
    Home = 'home',
    F1 = 'F1',
    F2 = 'F2',
    F3 = 'F3',
    F4 = 'F4',
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

export enum Movement {
    Controlled = 'controlled',
    Uncontrolled = 'uncontrolled',
}

export enum SpriteForm {
    Round = 'round',
    Rectangle = 'rectangle',
}

export interface Playground {
    width: number;
    height: number;
    shift_x?: number;
    shift_y?: number;
}

export interface PlaygroundConfig {
    width?: number;
    height?: number;
    shift_x?: number;
    shift_y?: number;
}

export interface PlaygroundConfigMsg extends DataMsg {
    type: DataType.PlaygroundConfig;
    config: PlaygroundConfig;
}

export interface SpriteCollision {
    sprite_ids: [spriteA: string, spriteB: string];
    overlap: 'in' | 'out';
}

export interface SpriteCollisionMsg extends DataMsg, SpriteCollision {
    type: DataType.SpriteCollision;
    time_stamp: number;
}

export interface SpriteOut {
    sprite_id: string;
}

export interface SpriteOutMsg extends DataMsg, SpriteOut {
    type: DataType.SpriteOut;
    time_stamp: number;
}

export interface SpriteBase {
    id: string;
    pos_x: number;
    pos_y: number;
    width: number;
    height: number;
    form: SpriteForm;
    color: string;
}

export interface ControlledSprite extends SpriteBase {
    movement: Movement.Controlled;
}

export interface UncontrolledSprite extends SpriteBase {
    movement: Movement.Uncontrolled;
    direction: number[];
    speed: number;
    distance?: number;
    time_span?: number;
    collision_detection?: boolean;
}

export type Sprite = ControlledSprite | UncontrolledSprite;

export interface ControlledSpriteMsg extends DataMsg, Partial<ControlledSprite> {
    id: string;
    type: DataType.Sprite;
    sprite: ControlledSprite;
}
export interface UncontrolledSpriteMsg extends DataMsg, Partial<UncontrolledSprite> {
    id: string;
    type: DataType.Sprite;
    sprite: UncontrolledSprite;
}

export type SpriteMsg = ControlledSpriteMsg | UncontrolledSpriteMsg;

export interface SpritesMsg extends DataMsg {
    type: DataType.Sprites;
    sprites: SpriteMsg[];
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
