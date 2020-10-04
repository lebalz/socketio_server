from dataclasses import dataclass
from enum import Enum
from typing import Optional, List, Union


@dataclass
class BaseMsg:
    device_id: str
    device_nr: float
    time_stamp: float


class DataType(Enum):
    ACCELERATION = "acceleration"
    ALERT_CONFIRM = "alert_confirm"
    ALL_DATA = "all_data"
    BORDER_OVERLAP = "border_overlap"
    COLOR = "color"
    GRID = "grid"
    GRID_UPDATE = "grid_update"
    GYRO = "gyro"
    INPUT_PROMPT = "input_prompt"
    INPUT_RESPONSE = "input_response"
    KEY = "key"
    NOTIFICATION = "notification"
    PLAYGROUND_CONFIG = "playground_config"
    POINTER = "pointer"
    SPRITE = "sprite"
    SPRITES = "sprites"
    SPRITE_CLICKED = "sprite_clicked"
    SPRITE_COLLISION = "sprite_collision"
    SPRITE_OUT = "sprite_out"
    UNKNOWN = "unknown"


@dataclass
class DataPkg:
    type: DataType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class SendDataPkg:
    type: DataType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class DataMsg:
    device_id: str
    device_nr: float
    time_stamp: float
    type: DataType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


class NotificationType(Enum):
    ERROR = "error"
    SUCCESS = "success"
    WARN = "warn"


class NotificationMsgType(Enum):
    NOTIFICATION = "notification"


@dataclass
class NotificationMsg:
    device_id: str
    device_nr: float
    message: str
    time_stamp: float
    type: NotificationMsgType
    alert: Optional[bool] = None
    broadcast: Optional[bool] = None
    notification_type: Optional[NotificationType] = None
    response_id: Optional[str] = None
    time: Optional[float] = None
    unicast_to: Optional[float] = None


class SocketEvents(Enum):
    ALL_DATA = "all_data"
    CLEAR_DATA = "clear_data"
    DATA_STORE = "data_store"
    DEVICE = "device"
    DEVICES = "devices"
    ERROR_MSG = "error_msg"
    GET_ALL_DATA = "get_all_data"
    GET_DEVICES = "get_devices"
    INFORMATION_MSG = "information_msg"
    JOIN_ROOM = "join_room"
    LEAVE_ROOM = "leave_room"
    NEW_DATA = "new_data"
    NEW_DEVICE = "new_device"
    REMOVE_ALL = "remove_all"
    ROOM_JOINED = "room_joined"
    ROOM_LEFT = "room_left"
    SET_NEW_DEVICE_NR = "set_new_device_nr"


@dataclass
class ErrorMsg:
    err: str
    msg: str
    type: SocketEvents


@dataclass
class AlertConfirm:
    displayed_at: float
    caller_id: Optional[str] = None


class AlertConfirmMsgType(Enum):
    ALERT_CONFIRM = "alert_confirm"


@dataclass
class AlertConfirmMsg:
    device_id: str
    device_nr: float
    displayed_at: float
    time_stamp: float
    type: AlertConfirmMsgType
    broadcast: Optional[bool] = None
    caller_id: Optional[str] = None
    unicast_to: Optional[float] = None


class ClientDataMsgInputType(Enum):
    DATE = "date"
    DATETIME_LOCAL = "datetime-local"
    NUMBER = "number"
    SELECT = "select"
    TEXT = "text"
    TIME = "time"


class InputPromptMsgType(Enum):
    INPUT_PROMPT = "input_prompt"


@dataclass
class InputPromptMsg:
    device_id: str
    device_nr: float
    question: str
    response_id: str
    time_stamp: float
    type: InputPromptMsgType
    broadcast: Optional[bool] = None
    input_type: Optional[ClientDataMsgInputType] = None
    options: Optional[List[str]] = None
    unicast_to: Optional[float] = None


class SelectionPromptInputType(Enum):
    SELECT = "select"


@dataclass
class SelectionPrompt:
    device_id: str
    device_nr: float
    input_type: SelectionPromptInputType
    options: List[str]
    question: str
    response_id: str
    time_stamp: float
    type: InputPromptMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class InputResponse:
    displayed_at: float
    response: Union[float, None, str]


class InputResponseMsgType(Enum):
    INPUT_RESPONSE = "input_response"


@dataclass
class InputResponseMsg:
    caller_id: str
    device_id: str
    device_nr: float
    displayed_at: float
    response: Union[float, None, str]
    time_stamp: float
    type: InputResponseMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


class PointerContext(Enum):
    COLOR = "color"
    GRID = "grid"


class PointerDataMsgType(Enum):
    POINTER = "pointer"


@dataclass
class PointerDataMsg:
    context: PointerContext
    device_id: str
    device_nr: float
    time_stamp: float
    type: PointerDataMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class ColorPointer:
    color: str
    displayed_at: float
    height: float
    width: float
    x: float
    y: float


class ColorPointerMsgContext(Enum):
    COLOR = "color"


@dataclass
class ColorPointerMsg:
    color: str
    context: ColorPointerMsgContext
    device_id: str
    device_nr: float
    displayed_at: float
    height: float
    time_stamp: float
    type: PointerDataMsgType
    width: float
    x: float
    y: float
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class ColorPanel:
    color: Union[List[float], float, str]


@dataclass
class ColorPanelMsg:
    color: Union[List[float], float, str]
    device_id: str
    device_nr: float
    time_stamp: float
    type: ColorPointerMsgContext
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class GridPointer:
    color: Union[List[float], float, None, str]
    column: float
    displayed_at: float
    row: float


class GridPointerMsgContext(Enum):
    GRID = "grid"


@dataclass
class GridPointerMsg:
    color: Union[List[float], float, None, str]
    column: float
    context: GridPointerMsgContext
    device_id: str
    device_nr: float
    displayed_at: float
    row: float
    time_stamp: float
    type: PointerDataMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


class ColorName(Enum):
    ALICEBLUE = "aliceblue"
    ANTIQUEWHITE = "antiquewhite"
    AQUA = "aqua"
    AQUAMARINE = "aquamarine"
    AZURE = "azure"
    BEIGE = "beige"
    BISQUE = "bisque"
    BLACK = "black"
    BLANCHEDALMOND = "blanchedalmond"
    BLUE = "blue"
    BLUEVIOLET = "blueviolet"
    BROWN = "brown"
    BURLYWOOD = "burlywood"
    CADETBLUE = "cadetblue"
    CHARTREUSE = "chartreuse"
    CHOCOLATE = "chocolate"
    CORAL = "coral"
    CORNFLOWERBLUE = "cornflowerblue"
    CORNSILK = "cornsilk"
    CRIMSON = "crimson"
    CYAN = "cyan"
    DARKBLUE = "darkblue"
    DARKCYAN = "darkcyan"
    DARKGOLDENROD = "darkgoldenrod"
    DARKGRAY = "darkgray"
    DARKGREEN = "darkgreen"
    DARKKHAKI = "darkkhaki"
    DARKMAGENTA = "darkmagenta"
    DARKOLIVEGREEN = "darkolivegreen"
    DARKORANGE = "darkorange"
    DARKORCHID = "darkorchid"
    DARKRED = "darkred"
    DARKSALMON = "darksalmon"
    DARKSEAGREEN = "darkseagreen"
    DARKSLATEBLUE = "darkslateblue"
    DARKSLATEGRAY = "darkslategray"
    DARKTURQUOISE = "darkturquoise"
    DARKVIOLET = "darkviolet"
    DEEPPINK = "deeppink"
    DEEPSKYBLUE = "deepskyblue"
    DIMGRAY = "dimgray"
    DODGERBLUE = "dodgerblue"
    FIREBRICK = "firebrick"
    FLORALWHITE = "floralwhite"
    FORESTGREEN = "forestgreen"
    FUCHSIA = "fuchsia"
    GAINSBORO = "gainsboro"
    GHOSTWHITE = "ghostwhite"
    GOLD = "gold"
    GOLDENROD = "goldenrod"
    GRAY = "gray"
    GREEN = "green"
    GREENYELLOW = "greenyellow"
    HONEYDEW = "honeydew"
    HOTPINK = "hotpink"
    INDIANRED = "indianred"
    INDIGO = "indigo"
    IVORY = "ivory"
    KHAKI = "khaki"
    LAVENDER = "lavender"
    LAVENDERBLUSH = "lavenderblush"
    LAWNGREEN = "lawngreen"
    LEMONCHIFFON = "lemonchiffon"
    LIGHTBLUE = "lightblue"
    LIGHTCORAL = "lightcoral"
    LIGHTCYAN = "lightcyan"
    LIGHTGOLDENRODYELLOW = "lightgoldenrodyellow"
    LIGHTGREEN = "lightgreen"
    LIGHTGREY = "lightgrey"
    LIGHTPINK = "lightpink"
    LIGHTSALMON = "lightsalmon"
    LIGHTSEAGREEN = "lightseagreen"
    LIGHTSKYBLUE = "lightskyblue"
    LIGHTSLATEGRAY = "lightslategray"
    LIGHTSTEELBLUE = "lightsteelblue"
    LIGHTYELLOW = "lightyellow"
    LIME = "lime"
    LIMEGREEN = "limegreen"
    LINEN = "linen"
    MAGENTA = "magenta"
    MAROON = "maroon"
    MEDIUMAQUAMARINE = "mediumaquamarine"
    MEDIUMBLUE = "mediumblue"
    MEDIUMORCHID = "mediumorchid"
    MEDIUMPURPLE = "mediumpurple"
    MEDIUMSEAGREEN = "mediumseagreen"
    MEDIUMSLATEBLUE = "mediumslateblue"
    MEDIUMSPRINGGREEN = "mediumspringgreen"
    MEDIUMTURQUOISE = "mediumturquoise"
    MEDIUMVIOLETRED = "mediumvioletred"
    MIDNIGHTBLUE = "midnightblue"
    MINTCREAM = "mintcream"
    MISTYROSE = "mistyrose"
    MOCCASIN = "moccasin"
    NAVAJOWHITE = "navajowhite"
    NAVY = "navy"
    OLDLACE = "oldlace"
    OLIVE = "olive"
    OLIVEDRAB = "olivedrab"
    ORANGE = "orange"
    ORANGERED = "orangered"
    ORCHID = "orchid"
    PALEGOLDENROD = "palegoldenrod"
    PALEGREEN = "palegreen"
    PALETURQUOISE = "paleturquoise"
    PALEVIOLETRED = "palevioletred"
    PAPAYAWHIP = "papayawhip"
    PEACHPUFF = "peachpuff"
    PERU = "peru"
    PINK = "pink"
    PLUM = "plum"
    POWDERBLUE = "powderblue"
    PURPLE = "purple"
    REBECCAPURPLE = "rebeccapurple"
    RED = "red"
    ROSYBROWN = "rosybrown"
    ROYALBLUE = "royalblue"
    SADDLEBROWN = "saddlebrown"
    SALMON = "salmon"
    SANDYBROWN = "sandybrown"
    SEAGREEN = "seagreen"
    SEASHELL = "seashell"
    SIENNA = "sienna"
    SILVER = "silver"
    SKYBLUE = "skyblue"
    SLATEBLUE = "slateblue"
    SLATEGRAY = "slategray"
    SNOW = "snow"
    SPRINGGREEN = "springgreen"
    STEELBLUE = "steelblue"
    TAN = "tan"
    TEAL = "teal"
    THISTLE = "thistle"
    TOMATO = "tomato"
    TURQUOISE = "turquoise"
    VIOLET = "violet"
    WHEAT = "wheat"
    WHITE = "white"
    WHITESMOKE = "whitesmoke"
    YELLOW = "yellow"
    YELLOWGREEN = "yellowgreen"


@dataclass
class Grid:
    base_color: Union[List[float], ColorName, None]
    grid: Union[List[Union[List[Union[List[float], float, str]], str]], str]


@dataclass
class GridMsg:
    base_color: Union[List[float], ColorName, None]
    device_id: str
    device_nr: float
    grid: Union[List[Union[List[Union[List[float], float, str]], str]], str]
    time_stamp: float
    type: GridPointerMsgContext
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


class GridUpdateMsgType(Enum):
    GRID_UPDATE = "grid_update"


@dataclass
class GridUpdateMsg:
    base_color: Union[List[float], ColorName, None]
    color: Union[List[float], float, str]
    column: float
    device_id: str
    device_nr: float
    row: float
    time_stamp: float
    type: GridUpdateMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class ColorMsg:
    color: str
    device_id: str
    device_nr: float
    time_stamp: float
    type: ColorPointerMsgContext
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class NewDevice:
    device_id: str
    is_client: bool
    old_device_id: Optional[str] = None


@dataclass
class MessageType:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    is_client: Optional[bool] = None
    old_device_id: Optional[str] = None
    time_stamp: Optional[float] = None
    type: Optional[DataType] = None
    unicast_to: Optional[float] = None


@dataclass
class Device:
    device_id: str
    device_nr: float
    is_client: bool
    socket_id: str


@dataclass
class RoomLeftPkg:
    device: Device
    room: str


class UnknownMsgType(Enum):
    UNKNOWN = "unknown"


@dataclass
class UnknownMsg:
    device_id: str
    device_nr: float
    time_stamp: float
    type: UnknownMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class PlaygroundConfig:
    height: Optional[float] = None
    shift_x: Optional[float] = None
    shift_y: Optional[float] = None
    width: Optional[float] = None


class Key(Enum):
    DOWN = "down"
    F1 = "F1"
    F2 = "F2"
    F3 = "F3"
    F4 = "F4"
    HOME = "home"
    LEFT = "left"
    RIGHT = "right"
    UP = "up"


class Overlap(Enum):
    IN = "in"
    OUT = "out"


class SpriteForm(Enum):
    RECTANGLE = "rectangle"
    ROUND = "round"


class Movement(Enum):
    CONTROLLED = "controlled"
    UNCONTROLLED = "uncontrolled"


@dataclass
class SpriteObject:
    id: str
    movement: Movement
    clickable: Optional[bool] = None
    collision_detection: Optional[bool] = None
    color: Optional[str] = None
    direction: Optional[List[float]] = None
    distance: Optional[float] = None
    form: Optional[SpriteForm] = None
    height: Optional[float] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    reset_time: Optional[bool] = None
    speed: Optional[float] = None
    text: Optional[str] = None
    time_span: Optional[float] = None
    width: Optional[float] = None


@dataclass
class Sprite:
    color: str
    form: SpriteForm
    height: float
    id: str
    movement: Movement
    pos_x: float
    pos_y: float
    width: float
    clickable: Optional[bool] = None
    collision_detection: Optional[bool] = None
    direction: Optional[List[float]] = None
    distance: Optional[float] = None
    reset_time: Optional[bool] = None
    speed: Optional[float] = None
    text: Optional[str] = None
    time_span: Optional[float] = None


class ClientDataMsgType(Enum):
    ACCELERATION = "acceleration"
    ALERT_CONFIRM = "alert_confirm"
    ALL_DATA = "all_data"
    COLOR = "color"
    GRID = "grid"
    GRID_UPDATE = "grid_update"
    GYRO = "gyro"
    INPUT_PROMPT = "input_prompt"
    INPUT_RESPONSE = "input_response"
    KEY = "key"
    NOTIFICATION = "notification"
    PLAYGROUND_CONFIG = "playground_config"
    POINTER = "pointer"
    SPRITE = "sprite"
    SPRITES = "sprites"
    SPRITE_COLLISION = "sprite_collision"
    SPRITE_OUT = "sprite_out"
    UNKNOWN = "unknown"


@dataclass
class DataStore:
    acceleration: Optional[List['ClientDataMsg']] = None
    alert_confirm: Optional[List['ClientDataMsg']] = None
    all_data: Optional[List['ClientDataMsg']] = None
    border_overlap: Optional[List['ClientDataMsg']] = None
    color: Optional[List['ClientDataMsg']] = None
    grid: Optional[List['ClientDataMsg']] = None
    grid_update: Optional[List['ClientDataMsg']] = None
    gyro: Optional[List['ClientDataMsg']] = None
    input_prompt: Optional[List['ClientDataMsg']] = None
    input_response: Optional[List['ClientDataMsg']] = None
    key: Optional[List['ClientDataMsg']] = None
    notification: Optional[List['ClientDataMsg']] = None
    playground_config: Optional[List['ClientDataMsg']] = None
    pointer: Optional[List['ClientDataMsg']] = None
    sprite: Optional[List['ClientDataMsg']] = None
    sprite_clicked: Optional[List['ClientDataMsg']] = None
    sprite_collision: Optional[List['ClientDataMsg']] = None
    sprite_out: Optional[List['ClientDataMsg']] = None
    sprites: Optional[List['ClientDataMsg']] = None
    unknown: Optional[List['ClientDataMsg']] = None


@dataclass
class ClientDataMsg:
    base_color: Union[List[float], ColorName, None]
    color: Union[List[float], float, None, str]
    device_id: str
    device_nr: float
    grid: Union[List[Union[List[Union[List[float], float, str]], str]], None, str]
    response: Union[float, None, str]
    time_stamp: float
    type: ClientDataMsgType
    absolute: Optional[bool] = None
    alert: Optional[bool] = None
    all_data: Optional[DataStore] = None
    alpha: Optional[float] = None
    beta: Optional[float] = None
    broadcast: Optional[bool] = None
    caller_id: Optional[str] = None
    column: Optional[float] = None
    config: Optional[PlaygroundConfig] = None
    context: Optional[PointerContext] = None
    displayed_at: Optional[float] = None
    gamma: Optional[float] = None
    input_type: Optional[ClientDataMsgInputType] = None
    interval: Optional[float] = None
    key: Optional[Key] = None
    message: Optional[str] = None
    notification_type: Optional[NotificationType] = None
    options: Optional[List[str]] = None
    overlap: Optional[Overlap] = None
    question: Optional[str] = None
    response_id: Optional[str] = None
    row: Optional[float] = None
    sprite: Optional[SpriteObject] = None
    sprite_id: Optional[str] = None
    sprite_ids: Optional[List[str]] = None
    sprites: Optional[List[Sprite]] = None
    time: Optional[float] = None
    unicast_to: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None


@dataclass
class PartialDataMsg:
    base_color: Union[List[float], ColorName, None]
    color: Union[List[float], float, None, str]
    grid: Union[List[Union[List[Union[List[float], float, str]], str]], None, str]
    response: Union[float, None, str]
    absolute: Optional[bool] = None
    alert: Optional[bool] = None
    all_data: Optional[DataStore] = None
    alpha: Optional[float] = None
    beta: Optional[float] = None
    broadcast: Optional[bool] = None
    caller_id: Optional[str] = None
    column: Optional[float] = None
    config: Optional[PlaygroundConfig] = None
    context: Optional[PointerContext] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    displayed_at: Optional[float] = None
    gamma: Optional[float] = None
    input_type: Optional[ClientDataMsgInputType] = None
    interval: Optional[float] = None
    key: Optional[Key] = None
    message: Optional[str] = None
    notification_type: Optional[NotificationType] = None
    options: Optional[List[str]] = None
    overlap: Optional[Overlap] = None
    question: Optional[str] = None
    response_id: Optional[str] = None
    row: Optional[float] = None
    sprite: Optional[SpriteObject] = None
    sprite_id: Optional[str] = None
    sprite_ids: Optional[List[str]] = None
    sprites: Optional[List[Sprite]] = None
    time: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[ClientDataMsgType] = None
    unicast_to: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None


class AllDataMsgType(Enum):
    ALL_DATA = "all_data"


@dataclass
class AllDataMsg:
    all_data: DataStore
    device_id: str
    device_nr: float
    time_stamp: float
    type: AllDataMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class DevicesPkg:
    devices: List[Device]
    time_stamp: float


class KeyMsgType(Enum):
    KEY = "key"


@dataclass
class KeyMsg:
    device_id: str
    device_nr: float
    key: Key
    time_stamp: float
    type: KeyMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class TimeStampedMsg:
    time_stamp: float


@dataclass
class InformationPkg:
    action: TimeStampedMsg
    message: str
    time_stamp: float


@dataclass
class SetDeviceNr:
    device_id: str
    new_device_nr: float
    time_stamp: float
    current_device_nr: Optional[float] = None


@dataclass
class RoomDevice:
    device: Device
    room: str


@dataclass
class DeviceIDPkg:
    device_id: str


@dataclass
class Playground:
    height: float
    width: float
    shift_x: Optional[float] = None
    shift_y: Optional[float] = None


class PlaygroundConfigMsgType(Enum):
    PLAYGROUND_CONFIG = "playground_config"


@dataclass
class PlaygroundConfigMsg:
    config: PlaygroundConfig
    device_id: str
    device_nr: float
    time_stamp: float
    type: PlaygroundConfigMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class SpriteCollision:
    overlap: Overlap
    sprite_ids: List[str]


class SpriteCollisionMsgType(Enum):
    SPRITE_COLLISION = "sprite_collision"


@dataclass
class SpriteCollisionMsg:
    device_id: str
    device_nr: float
    overlap: Overlap
    sprite_ids: List[str]
    time_stamp: float
    type: SpriteCollisionMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class SpriteOut:
    sprite_id: str


@dataclass
class SpriteClicked:
    sprite_id: str
    x: float
    y: float
    text: Optional[str] = None


class SpriteOutMsgType(Enum):
    SPRITE_OUT = "sprite_out"


@dataclass
class SpriteOutMsg:
    device_id: str
    device_nr: float
    sprite_id: str
    time_stamp: float
    type: SpriteOutMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class RequiredSpriteBase:
    id: str
    movement: Movement


@dataclass
class SpriteBase:
    color: str
    form: SpriteForm
    height: float
    id: str
    movement: Movement
    pos_x: float
    pos_y: float
    width: float
    clickable: Optional[bool] = None
    text: Optional[str] = None


class ControlledSpriteMovement(Enum):
    CONTROLLED = "controlled"


@dataclass
class ControlledSprite:
    color: str
    form: SpriteForm
    height: float
    id: str
    movement: ControlledSpriteMovement
    pos_x: float
    pos_y: float
    width: float
    clickable: Optional[bool] = None
    text: Optional[str] = None


class UncontrolledSpriteMovement(Enum):
    UNCONTROLLED = "uncontrolled"


@dataclass
class UncontrolledSprite:
    color: str
    direction: List[float]
    form: SpriteForm
    height: float
    id: str
    movement: UncontrolledSpriteMovement
    pos_x: float
    pos_y: float
    speed: float
    width: float
    clickable: Optional[bool] = None
    collision_detection: Optional[bool] = None
    distance: Optional[float] = None
    reset_time: Optional[bool] = None
    text: Optional[str] = None
    time_span: Optional[float] = None


@dataclass
class ControlledSpriteMsgSprite:
    id: str
    movement: ControlledSpriteMovement
    clickable: Optional[bool] = None
    color: Optional[str] = None
    form: Optional[SpriteForm] = None
    height: Optional[float] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    text: Optional[str] = None
    width: Optional[float] = None


class ControlledSpriteMsgType(Enum):
    SPRITE = "sprite"


@dataclass
class ControlledSpriteMsg:
    device_id: str
    device_nr: float
    sprite: ControlledSpriteMsgSprite
    time_stamp: float
    type: ControlledSpriteMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class UncontrolledSpriteMsgSprite:
    id: str
    movement: UncontrolledSpriteMovement
    clickable: Optional[bool] = None
    collision_detection: Optional[bool] = None
    color: Optional[str] = None
    direction: Optional[List[float]] = None
    distance: Optional[float] = None
    form: Optional[SpriteForm] = None
    height: Optional[float] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    reset_time: Optional[bool] = None
    speed: Optional[float] = None
    text: Optional[str] = None
    time_span: Optional[float] = None
    width: Optional[float] = None


@dataclass
class UncontrolledSpriteMsg:
    device_id: str
    device_nr: float
    sprite: UncontrolledSpriteMsgSprite
    time_stamp: float
    type: ControlledSpriteMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class SpriteMsg:
    device_id: str
    device_nr: float
    sprite: SpriteObject
    time_stamp: float
    type: ControlledSpriteMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


class SpritesMsgType(Enum):
    SPRITES = "sprites"


@dataclass
class SpritesMsg:
    device_id: str
    device_nr: float
    sprites: List[Sprite]
    time_stamp: float
    type: SpritesMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class UpdateSprite:
    id: str
    color: Optional[str] = None
    form: Optional[SpriteForm] = None
    height: Optional[float] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    width: Optional[float] = None


class BorderSide(Enum):
    BOTTOM = "bottom"
    LEFT = "left"
    RIGHT = "right"
    TOP = "top"


@dataclass
class BorderOverlap:
    border: BorderSide
    id: str
    x: float
    y: float


class BorderOverlapMsgType(Enum):
    BORDER_OVERLAP = "border_overlap"


@dataclass
class BorderOverlapMsg:
    border_overlap: BorderOverlap
    device_id: str
    device_nr: float
    time_stamp: float
    type: BorderOverlapMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class Acc:
    interval: float
    x: float
    y: float
    z: float


@dataclass
class Gyro:
    absolute: bool
    alpha: float
    beta: float
    gamma: float


class AccMsgType(Enum):
    ACCELERATION = "acceleration"


@dataclass
class AccMsg:
    device_id: str
    device_nr: float
    interval: float
    time_stamp: float
    type: AccMsgType
    x: float
    y: float
    z: float
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


class GyroMsgType(Enum):
    GYRO = "gyro"


@dataclass
class GyroMsg:
    absolute: bool
    alpha: float
    beta: float
    device_id: str
    device_nr: float
    gamma: float
    time_stamp: float
    type: GyroMsgType
    broadcast: Optional[bool] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialControlledSprite:
    clickable: Optional[bool] = None
    color: Optional[str] = None
    form: Optional[SpriteForm] = None
    height: Optional[float] = None
    id: Optional[str] = None
    movement: Optional[ControlledSpriteMovement] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    text: Optional[str] = None
    width: Optional[float] = None


@dataclass
class PartialUncontrolledSprite:
    clickable: Optional[bool] = None
    collision_detection: Optional[bool] = None
    color: Optional[str] = None
    direction: Optional[List[float]] = None
    distance: Optional[float] = None
    form: Optional[SpriteForm] = None
    height: Optional[float] = None
    id: Optional[str] = None
    movement: Optional[UncontrolledSpriteMovement] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    reset_time: Optional[bool] = None
    speed: Optional[float] = None
    text: Optional[str] = None
    time_span: Optional[float] = None
    width: Optional[float] = None


@dataclass
class PartialNotificationMsg:
    alert: Optional[bool] = None
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    message: Optional[str] = None
    notification_type: Optional[NotificationType] = None
    response_id: Optional[str] = None
    time: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[NotificationMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialAlertConfirmMsg:
    broadcast: Optional[bool] = None
    caller_id: Optional[str] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    displayed_at: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[AlertConfirmMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialInputPromptMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    input_type: Optional[ClientDataMsgInputType] = None
    options: Optional[List[str]] = None
    question: Optional[str] = None
    response_id: Optional[str] = None
    time_stamp: Optional[float] = None
    type: Optional[InputPromptMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialInputResponseMsg:
    response: Union[float, None, str]
    broadcast: Optional[bool] = None
    caller_id: Optional[str] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    displayed_at: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[InputResponseMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialPointerDataMsg:
    broadcast: Optional[bool] = None
    context: Optional[PointerContext] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[PointerDataMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialGridMsg:
    base_color: Union[List[float], ColorName, None]
    grid: Union[List[Union[List[Union[List[float], float, str]], str]], None, str]
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[GridPointerMsgContext] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialGridUpdateMsg:
    base_color: Union[List[float], ColorName, None]
    color: Union[List[float], float, None, str]
    broadcast: Optional[bool] = None
    column: Optional[float] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    row: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[GridUpdateMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialColorMsg:
    broadcast: Optional[bool] = None
    color: Optional[str] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[ColorPointerMsgContext] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialUnknownMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[UnknownMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialKeyMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    key: Optional[Key] = None
    time_stamp: Optional[float] = None
    type: Optional[KeyMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialAccMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    interval: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[AccMsgType] = None
    unicast_to: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None


@dataclass
class PartialGyroMsg:
    absolute: Optional[bool] = None
    alpha: Optional[float] = None
    beta: Optional[float] = None
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    gamma: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[GyroMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialAllDataMsg:
    all_data: Optional[DataStore] = None
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[AllDataMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialControlledSpriteMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    sprite: Optional[ControlledSpriteMsgSprite] = None
    time_stamp: Optional[float] = None
    type: Optional[ControlledSpriteMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialUncontrolledSpriteMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    sprite: Optional[UncontrolledSpriteMsgSprite] = None
    time_stamp: Optional[float] = None
    type: Optional[ControlledSpriteMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialSpritesMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    sprites: Optional[List[Sprite]] = None
    time_stamp: Optional[float] = None
    type: Optional[SpritesMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialSpriteCollisionMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    overlap: Optional[Overlap] = None
    sprite_ids: Optional[List[str]] = None
    time_stamp: Optional[float] = None
    type: Optional[SpriteCollisionMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialSpriteOutMsg:
    broadcast: Optional[bool] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    sprite_id: Optional[str] = None
    time_stamp: Optional[float] = None
    type: Optional[SpriteOutMsgType] = None
    unicast_to: Optional[float] = None


@dataclass
class PartialPlaygroundConfigMsg:
    broadcast: Optional[bool] = None
    config: Optional[PlaygroundConfig] = None
    device_id: Optional[str] = None
    device_nr: Optional[float] = None
    time_stamp: Optional[float] = None
    type: Optional[PlaygroundConfigMsgType] = None
    unicast_to: Optional[float] = None
