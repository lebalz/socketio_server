export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export enum ColorName {
    Aliceblue = 'aliceblue',
    Antiquewhite = 'antiquewhite',
    Aqua = 'aqua',
    Aquamarine = 'aquamarine',
    Azure = 'azure',
    Beige = 'beige',
    Bisque = 'bisque',
    Black = 'black',
    Blanchedalmond = 'blanchedalmond',
    Blue = 'blue',
    Blueviolet = 'blueviolet',
    Brown = 'brown',
    Burlywood = 'burlywood',
    Cadetblue = 'cadetblue',
    Chartreuse = 'chartreuse',
    Chocolate = 'chocolate',
    Coral = 'coral',
    Cornflowerblue = 'cornflowerblue',
    Cornsilk = 'cornsilk',
    Crimson = 'crimson',
    Cyan = 'cyan',
    Darkblue = 'darkblue',
    Darkcyan = 'darkcyan',
    Darkgoldenrod = 'darkgoldenrod',
    Darkgray = 'darkgray',
    Darkgreen = 'darkgreen',
    Darkkhaki = 'darkkhaki',
    Darkmagenta = 'darkmagenta',
    Darkolivegreen = 'darkolivegreen',
    Darkorange = 'darkorange',
    Darkorchid = 'darkorchid',
    Darkred = 'darkred',
    Darksalmon = 'darksalmon',
    Darkseagreen = 'darkseagreen',
    Darkslateblue = 'darkslateblue',
    Darkslategray = 'darkslategray',
    Darkturquoise = 'darkturquoise',
    Darkviolet = 'darkviolet',
    Deeppink = 'deeppink',
    Deepskyblue = 'deepskyblue',
    Dimgray = 'dimgray',
    Dodgerblue = 'dodgerblue',
    Firebrick = 'firebrick',
    Floralwhite = 'floralwhite',
    Forestgreen = 'forestgreen',
    Fuchsia = 'fuchsia',
    Gainsboro = 'gainsboro',
    Ghostwhite = 'ghostwhite',
    Gold = 'gold',
    Goldenrod = 'goldenrod',
    Gray = 'gray',
    Green = 'green',
    Greenyellow = 'greenyellow',
    Honeydew = 'honeydew',
    Hotpink = 'hotpink',
    Indianred = 'indianred',
    Indigo = 'indigo',
    Ivory = 'ivory',
    Khaki = 'khaki',
    Lavender = 'lavender',
    Lavenderblush = 'lavenderblush',
    Lawngreen = 'lawngreen',
    Lemonchiffon = 'lemonchiffon',
    Lightblue = 'lightblue',
    Lightcoral = 'lightcoral',
    Lightcyan = 'lightcyan',
    Lightgoldenrodyellow = 'lightgoldenrodyellow',
    Lightgrey = 'lightgrey',
    Lightgreen = 'lightgreen',
    Lightpink = 'lightpink',
    Lightsalmon = 'lightsalmon',
    Lightseagreen = 'lightseagreen',
    Lightskyblue = 'lightskyblue',
    Lightslategray = 'lightslategray',
    Lightsteelblue = 'lightsteelblue',
    Lightyellow = 'lightyellow',
    Lime = 'lime',
    Limegreen = 'limegreen',
    Linen = 'linen',
    Magenta = 'magenta',
    Maroon = 'maroon',
    Mediumaquamarine = 'mediumaquamarine',
    Mediumblue = 'mediumblue',
    Mediumorchid = 'mediumorchid',
    Mediumpurple = 'mediumpurple',
    Mediumseagreen = 'mediumseagreen',
    Mediumslateblue = 'mediumslateblue',
    Mediumspringgreen = 'mediumspringgreen',
    Mediumturquoise = 'mediumturquoise',
    Mediumvioletred = 'mediumvioletred',
    Midnightblue = 'midnightblue',
    Mintcream = 'mintcream',
    Mistyrose = 'mistyrose',
    Moccasin = 'moccasin',
    Navajowhite = 'navajowhite',
    Navy = 'navy',
    Oldlace = 'oldlace',
    Olive = 'olive',
    Olivedrab = 'olivedrab',
    Orange = 'orange',
    Orangered = 'orangered',
    Orchid = 'orchid',
    Palegoldenrod = 'palegoldenrod',
    Palegreen = 'palegreen',
    Paleturquoise = 'paleturquoise',
    Palevioletred = 'palevioletred',
    Papayawhip = 'papayawhip',
    Peachpuff = 'peachpuff',
    Peru = 'peru',
    Pink = 'pink',
    Plum = 'plum',
    Powderblue = 'powderblue',
    Purple = 'purple',
    Rebeccapurple = 'rebeccapurple',
    Red = 'red',
    Rosybrown = 'rosybrown',
    Royalblue = 'royalblue',
    Saddlebrown = 'saddlebrown',
    Salmon = 'salmon',
    Sandybrown = 'sandybrown',
    Seagreen = 'seagreen',
    Seashell = 'seashell',
    Sienna = 'sienna',
    Silver = 'silver',
    Skyblue = 'skyblue',
    Slateblue = 'slateblue',
    Slategray = 'slategray',
    Snow = 'snow',
    Springgreen = 'springgreen',
    Steelblue = 'steelblue',
    Tan = 'tan',
    Teal = 'teal',
    Thistle = 'thistle',
    Tomato = 'tomato',
    Turquoise = 'turquoise',
    Violet = 'violet',
    Wheat = 'wheat',
    White = 'white',
    Whitesmoke = 'whitesmoke',
    Yellow = 'yellow',
    Yellowgreen = 'yellowgreen',
}
export type CssColor = ColorName | string | number | RGB | RGBA;

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
    RemoveSprite = 'remove_sprite',
    SpriteCollision = 'sprite_collision',
    SpriteOut = 'sprite_out',
    SpriteClicked = 'sprite_clicked',
    PlaygroundConfig = 'playground_config',
    ClearPlayground = 'clear_playground',
    BorderOverlap = 'border_overlap',
}

export type ClientsData = {
    [type in DataType]?: ClientDataMsg[];
};

export interface DataStore {
    [deviceId: string]: ClientsData;
}

export interface DataPkg {
    type: DataType;
    unicast_to?: number;
    broadcast?: boolean;
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

export interface ErrorMsg {
    type: SocketEvents;
    err: string;
    msg: string;
}

export interface AlertConfirm {
    displayed_at: number;
    caller_id?: string;
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

export interface ColorPanel {
    color: CssColor;
}

export interface ColorPanelMsg extends DataMsg, ColorPanel {
    type: DataType.Color;
}

export interface GridPointer {
    row: number;
    column: number;
    color?: CssColor;
    displayed_at: number;
}

export interface GridPointerMsg extends PointerDataMsg, GridPointer {
    context: PointerContext.Grid;
}

export interface Grid {
    grid: CssColor[][] | string[] | string;
    base_color?: RGB | ColorName;
}
export interface GridMsg extends DataMsg, Grid {
    type: DataType.Grid;
}

export interface GridUpdateMsg extends DataMsg {
    type: DataType.GridUpdate;
    row: number;
    column: number;
    color: CssColor;
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

export interface RoomLeftPkg {
    room: string;
    device: Device;
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
    | RemoveSpriteMsg
    | ClearPlaygroundMsg
    | SpriteCollisionMsg
    | SpriteOutMsg
    | PlaygroundConfigMsg
    | UnknownMsg;

export type PartialDataMsg = Partial<ClientDataMsg>;

export interface AllDataMsg extends DataMsg {
    device_id: string;
    type: DataType.AllData;
    all_data: ClientsData;
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
    color?: string;
}

export interface PlaygroundConfigMsg extends DataMsg {
    type: DataType.PlaygroundConfig;
    config: PlaygroundConfig;
}

export interface SpriteCollision {
    sprites: [{ id: string; collision_detection: boolean }, { id: string; collision_detection: boolean }];
    overlap: 'in' | 'out';
}

export interface SpriteCollisionMsg extends DataMsg, SpriteCollision {
    type: DataType.SpriteCollision;
    time_stamp: number;
}

export interface SpriteClicked {
    id: string;
    text?: string;
    x: number;
    y: number;
}
export interface SpriteClickedMsg extends DataMsg, SpriteClicked {
    type: DataType.SpriteClicked;
}

export interface SpriteOut {
    id: string;
}

export interface SpriteOutMsg extends DataMsg, SpriteOut {
    type: DataType.SpriteOut;
    time_stamp: number;
}

export interface Sprite {
    id: string;
    pos_x?: number;
    pos_y?: number;
    width?: number;
    height?: number;
    form?: SpriteForm;
    color?: string;
    collision_detection?: boolean;
    clickable?: boolean;
    text?: string;
    direction?: [number, number];
    speed?: number;
    distance?: number;
    time_span?: number;
    reset_time?: boolean;
}

export interface SpriteMsg extends DataMsg {
    type: DataType.Sprite;
    sprite: Sprite;
}

export interface SpritesMsg extends DataMsg {
    type: DataType.Sprites;
    sprites: Sprite[];
}

export interface RemoveSpriteMsg extends DataMsg {
    type: DataType.RemoveSprite;
    id: string;
}
export interface ClearPlaygroundMsg extends DataMsg {
    type: DataType.ClearPlayground;
}

export interface UpdateSprite {
    id: string;
    pos_x?: number;
    pos_y?: number;
    width?: number;
    height?: number;
    form?: SpriteForm;
    color?: string;
}

export enum BorderSide {
    Left = 'left',
    Right = 'right',
    Top = 'top',
    Bottom = 'bottom',
}

export interface BorderOverlap {
    border: BorderSide;
    x: number;
    y: number;
    collision_detection: boolean;
    id: string;
}

export interface BorderOverlapMsg extends DataMsg {
    type: DataType.BorderOverlap;
    border_overlap: BorderOverlap;
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
