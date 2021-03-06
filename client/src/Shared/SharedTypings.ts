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
    is_silent: boolean;
}

export interface TimeStampedMsg {
    time_stamp: number;
}
export interface BaseMsg extends TimeStampedMsg {
    device_id: string;
    device_nr: number;
    stop_propagation?: boolean;
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
    CancelUserInput = 'cancel_user_input',
    Unknown = 'unknown',
    AllData = 'all_data',
    AlertConfirm = 'alert_confirm',
    Sprite = 'sprite',
    Sprites = 'sprites',
    RemoveSprite = 'remove_sprite',
    SpriteCollision = 'sprite_collision',
    SpriteOut = 'sprite_out',
    SpriteRemoved = 'sprite_removed',
    SpriteClicked = 'sprite_clicked',
    PlaygroundConfig = 'playground_config',
    ClearPlayground = 'clear_playground',
    CleanPlayground = 'clean_playground',
    BorderOverlap = 'border_overlap',
    Line = 'line',
    Lines = 'lines',
    RemoveLine = 'remove_line',
    StartAudio = 'start_audio',
    StopAudio = 'stop_audio',
    AutoMovementPos = 'auto_movement_pos',
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
    deliver_to?: string;
    cross_origin?: boolean /** sender device_id and receiver's device id are not the same */;
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
    number: number;
    color?: CssColor;
    displayed_at: number;
}

export interface GridPointerMsg extends PointerDataMsg, GridPointer {
    context: PointerContext.Grid;
}

export interface Grid {
    grid: CssColor[][] | string[] | string;
    base_color?: RGB | ColorName;
    enumerate?: boolean;
}
export interface GridMsg extends DataMsg, Grid {
    type: DataType.Grid;
}

interface GridUpdate {
    color?: CssColor;
    base_color?: RGB | ColorName;
    row?: number;
    column?: number;
    number?: number;
    enumerate?: boolean;
}

export interface GridUpdateMsg extends DataMsg, GridUpdate {
    type: DataType.GridUpdate;
}

export interface ColorMsg extends DataMsg {
    type: DataType.Color;
    color: string;
}

export interface NewDevice {
    device_id: string;
    old_device_id?: string;
    is_client: boolean;
    is_silent: boolean;
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
    Timer = 'timer',
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
    | CleanPlaygroundMsg
    | SpriteCollisionMsg
    | SpriteOutMsg
    | SpriteRemovedMsg
    | PlaygroundConfigMsg
    | LineMsg
    | LinesMsg
    | RemoveLineMsg
    | UnknownMsg
    | CancelUserInputMsg
    | StartAudioMsg
    | StopAudioMsg
    | AutoSpritePositionChangedMsg;

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

export interface CancelUserInputMsg extends DataMsg {
    type: DataType.CancelUserInput;
    input_type: DataType.InputPrompt | DataType.Notification;
    response_id?: string;
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

export enum ImageFormats {
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    GIF = 'gif',
    SVG = 'svg',
    WEBP = 'webp',
    BMP = 'bmp',
}

interface RasterImage {
    image: ArrayBuffer;
    type: ImageFormats.JPEG | ImageFormats.JPG | ImageFormats.PNG;
    name: string;
}

interface SvgImage {
    image: string;
    type: ImageFormats.SVG;
    name: string;
}

export type SocketImage = RasterImage | SvgImage;
export enum AudioFormats {
    MP3 = 'mp3',
    OGG = 'ogg',
    WAV = 'wav',
}
export interface SocketAudio {
    audio: ArrayBuffer;
    name: string;
    type: AudioFormats;
    volume?: number;
}

export interface PlaygroundConfig {
    width?: number;
    height?: number;
    shift_x?: number;
    shift_y?: number;
    color?: string;
    images?: SocketImage[];
    audio_tracks?: SocketAudio[];
    image?: string;
}

export interface PlaygroundConfigMsg extends DataMsg {
    type: DataType.PlaygroundConfig;
    config: PlaygroundConfig;
}

export interface SpriteCollision {
    sprites: [
        { id: string; collision_detection: boolean; pos_x: number; pos_y: number },
        { id: string; collision_detection: boolean; pos_x: number; pos_y: number }
    ];
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

export interface SpriteRemoved {
    id: string;
}

export interface AutoSpritePositionChanged {
    id: string;
    movement_id: string;
    x: number;
    y: number;
}

export interface AutoSpritePositionChangedMsg extends DataMsg, AutoSpritePositionChanged {
    type: DataType.AutoMovementPos;
    time_stamp: number;
}

export interface SpriteRemovedMsg extends DataMsg, SpriteRemoved {
    type: DataType.SpriteRemoved;
    time_stamp: number;
}

export interface AbsoluteAutoMovement {
    movement: 'absolute';
    id: string;
    speed?: number;
    time?: number;
    to: [x: number, y: number];
}

export interface RelativeAutoMovement {
    movement: 'relative';
    id: string;
    direction: [x: number, y: number];
    speed: number;
    time_span?: number;
    distance?: number;
}

export type AutoMovement = AbsoluteAutoMovement | RelativeAutoMovement;

export interface SpriteAutoMovement {
    movements: AutoMovement[];
    cycle?: boolean;
    repeat?: number;
    exit_on_done?: boolean;
    cancel_previous?: boolean;
}

export interface Line {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color?: string;
    line_width?: number;
    rotate?: number;
    anchor?: number;
    z_index?: number;
}

export interface LinesMsg extends DataMsg {
    type: DataType.Lines;
    lines: Line[];
}

export interface StartAudioMsg extends DataMsg {
    type: DataType.StartAudio;
    name: string;
    repeat?: boolean;
    id?: string;
    volume?: number;
}

export interface StopAudioMsg extends DataMsg {
    type: DataType.StopAudio;
    name?: string;
    id?: string;
}

export interface LineMsg extends DataMsg {
    type: DataType.Line;
    line: Line;
}

export interface RemoveLineMsg extends DataMsg {
    type: DataType.RemoveLine;
    id: string;
}

export interface Audio {
    name: string;
    repeat?: number;
}

export interface Sprite {
    id: string;
    pos_x?: number;
    pos_y?: number;

    /**
     * the anchor (center) of the sprite
     * @param x: range from 0 (left) to 1 (right)
     * @param y: range from 0 (bottom) to 1 (top)
     */
    anchor?: [x: number, y: number];
    width?: number;
    height?: number;
    form?: SpriteForm;
    color?: string;
    border_color?: string;
    border_width?: number;
    border_style?:
        | 'dotted'
        | 'dashed'
        | 'solid'
        | 'double'
        | 'groove'
        | 'ridge'
        | 'inset'
        | 'outset'
        | 'none'
        | 'hidden';
    collision_detection?: boolean;
    clickable?: boolean;
    text?: string;
    font_color?: string;
    font_size?: number;
    direction?: [number, number];
    speed?: number;
    distance?: number;
    time_span?: number;
    reset_time?: boolean;
    image?: string;
    rotate?: number;
    z_index?: number;
    movements?: SpriteAutoMovement;
    draggeable?: boolean;
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
export interface CleanPlaygroundMsg extends DataMsg {
    type: DataType.CleanPlayground;
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
