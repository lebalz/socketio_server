import {
    InformationPkg,
    SetDeviceNr,
    TimeStampedMsg,
    RoomDevice,
    RoomLeftPkg,
    NewDevice,
    DeviceIdPkg,
    Device,
    AllDataMsg,
    DataType,
    SocketEvents,
    DataStore,
    DevicesPkg,
    NotificationMsg,
    InputPromptMsg,
    ClientDataMsg,
    CancelUserInputMsg,
    ErrorMsg,
    SpriteMsg,
    LineMsg,
} from './client/src/Shared/SharedTypings';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';
import socketIo from 'socket.io';

const GLOBAL_LISTENER_ROOM = 'GLOBAL_LISTENER';
const THRESHOLD = 25;

const dataStore: DataStore = {};
const trackAutoMovementBroadcasts: { [key: string]: Map<string, Set<string>> } = {};

const socketId_device = new Map<string, Device>();

const app = express();

/**
 * CREATE A SERVER OBJECT
 */
const server = http.createServer(app);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// ensure the server can call other domains: enable cross origin resource sharing (cors)
app.use(cors());

// received packages should be presented in the JSON format
app.use(bodyParser.json());

// show some helpful logs in the commandline
app.use(morgan('dev'));

/**
 * SOCKET CONFIGURATION
 */
// create socket server
const io = socketIo(server);

/**
 * @return [Array<Device>] all devices, unordered
 *
 */
function unorderedDevices(): Device[] {
    return [...socketId_device.values()];
}

/**
 * @return [Array<Device>] all devices, ordered by is_client and devie_nr:
 * 		- first clients, ordered ascending by device_nr
 * 		- last scripts (=non-clients), ordered descending by device_nr
 */
function devices(device_id?: string): Device[] {
    const unordered = unorderedDevices();
    const partitioned = unordered.reduce(
        (store, device) => {
            if (device_id === undefined || device_id === device.device_id) {
                if (device.is_client) {
                    store.clients.push(device);
                } else {
                    store.scripts.push(device);
                }
            }
            return store;
        },
        { clients: [] as Device[], scripts: [] as Device[] }
    );
    return [
        ...partitioned.clients.sort((a, b) => a.device_nr - b.device_nr),
        ...partitioned.scripts.sort((a, b) => b.device_nr - a.device_nr),
    ];
}

function timeStamp(): number {
    return Date.now() / 1000.0;
}

let lastDeviceModification = timeStamp();
function touchDevices() {
    lastDeviceModification = timeStamp();
}

function devicesPkg(): DevicesPkg {
    return {
        time_stamp: lastDeviceModification,
        devices: devices(),
    };
}

let deviceNrAssginmentLocked = false;

let sequenceId = 0;
function nextSequenceId(): string {
    sequenceId = sequenceId + 1;
    return `s-${sequenceId}`;
}

function nextDeviceNr(is_client: boolean): number {
    const numbers = unorderedDevices().map((device) => device.device_nr);
    let nextNr = 0;
    if (is_client) {
        while (numbers.includes(nextNr)) {
            nextNr += 1;
        }
    } else {
        nextNr = -1;
        while (numbers.includes(nextNr)) {
            nextNr -= 1;
        }
    }
    return nextNr;
}

function allDataPkg(deviceId: string): AllDataMsg {
    return {
        device_id: deviceId,
        type: DataType.AllData,
        all_data: dataStore[deviceId],
        time_stamp: timeStamp(),
        device_nr: -999,
    };
}

function informationPkg(message: string, action: TimeStampedMsg, data = {}): InformationPkg {
    return {
        time_stamp: timeStamp(),
        message: message,
        action: action,
        ...data,
    };
}

function roomJoinedPkg(roomId: string, device: Device): RoomDevice {
    return {
        room: roomId,
        device: device,
    };
}

function addDataToStore(deviceId: string, data: ClientDataMsg) {
    if (deviceId === undefined) {
        return;
    }
    if (!dataStore[deviceId]) {
        dataStore[deviceId] = {};
    }
    switch (data.type) {
        case DataType.Sprites:
            data.sprites.forEach((s) => {
                if (s.movements) {
                    s.movements.movements.forEach((m) => (m.id = nextSequenceId()));
                }
                addDataToStore(deviceId, {
                    type: DataType.Sprite,
                    sprite: s,
                    time_stamp: data.time_stamp,
                    device_id: data.device_id,
                    device_nr: data.device_nr,
                });
            });
            return;
        case DataType.Lines:
            data.lines.forEach((l) =>
                addDataToStore(deviceId, {
                    type: DataType.Line,
                    line: l,
                    time_stamp: data.time_stamp,
                    device_id: data.device_id,
                    device_nr: data.device_nr,
                })
            );
            return;
        case (DataType.AllData, DataType.Unknown):
            return;
        case DataType.Notification:
            if (!data.alert) {
                return;
            }
        case DataType.AlertConfirm:
            // remove confirmed messages
            const notifications = dataStore[deviceId][DataType.Notification] as NotificationMsg[];
            if (notifications) {
                const alertIdx = notifications.findIndex((n) => n.time_stamp === data.time_stamp);
                notifications.splice(alertIdx, 1);
            }
            return;
        case DataType.InputResponse:
            const prompts = dataStore[deviceId][DataType.InputPrompt] as InputPromptMsg[];
            if (prompts) {
                const promptIdx = prompts.findIndex((n) => n.time_stamp === data.time_stamp);
                prompts.splice(promptIdx, 1);
            }
            return;
        case DataType.RemoveSprite:
            const removeSpriteStore = dataStore[deviceId][DataType.Sprite] as SpriteMsg[];
            if (removeSpriteStore) {
                const toRemoveIdx = removeSpriteStore.findIndex((s) => s.sprite.id === data.id);
                if (toRemoveIdx >= 0) {
                    removeSpriteStore.splice(toRemoveIdx, 1);
                }
            }
            if (trackAutoMovementBroadcasts[deviceId] && trackAutoMovementBroadcasts[deviceId].has(data.id)) {
                trackAutoMovementBroadcasts[deviceId].delete(data.id);
            }
            return;
        case DataType.RemoveLine:
            const removeLineStore = dataStore[deviceId][DataType.Line] as LineMsg[];
            if (removeLineStore) {
                const toRemoveIdx = removeLineStore.findIndex((s) => s.line.id === data.id);
                if (toRemoveIdx >= 0) {
                    removeLineStore.splice(toRemoveIdx, 1);
                }
            }
            return;
        case DataType.ClearPlayground:
            // update sprites which are already present...
            dataStore[deviceId][DataType.Sprite]?.splice(0);
            dataStore[deviceId][DataType.Line]?.splice(0);
            dataStore[deviceId][DataType.PlaygroundConfig]?.splice(0);
            trackAutoMovementBroadcasts[deviceId] = new Map<string, Set<string>>();
            return;
        case DataType.AutoMovementPos:
            if (data.movement_id === 'init') {
                data.stop_propagation = true;
                return;
            }
            if (!trackAutoMovementBroadcasts[deviceId]) {
                trackAutoMovementBroadcasts[deviceId] = new Map<string, Set<string>>();
            }
            if (!trackAutoMovementBroadcasts[deviceId].has(data.id)) {
                trackAutoMovementBroadcasts[deviceId].set(data.id, new Set<string>());
            }
            if (trackAutoMovementBroadcasts[deviceId].get(data.id)?.has(data.movement_id)) {
                data.stop_propagation = true;
                return;
            }
            trackAutoMovementBroadcasts[deviceId].get(data.id)?.add(data.movement_id);
            const sStore = dataStore[deviceId][DataType.Sprite] as SpriteMsg[];
            const prevIdx = sStore.findIndex((s) => s.sprite.id === data.id);
            if (prevIdx >= 0) {
                const prev = sStore.splice(prevIdx, 1)[0];
                prev.time_stamp = data.time_stamp;
                let removeMovements = false;
                if (prev.sprite.movements?.repeat !== undefined) {
                    prev.sprite.movements.repeat = prev.sprite.movements.repeat - 1;
                    if (prev.sprite.movements.repeat < 0) {
                        removeMovements = true;
                    }
                } else if (!prev.sprite.movements?.cycle) {
                    removeMovements = true;
                }
                prev.sprite = {
                    ...prev.sprite,
                    pos_x: data.x,
                    pos_y: data.y,
                    movements: removeMovements ? undefined : prev.sprite.movements,
                };
                sStore.push(prev);
            }
            return;
    }
    let store = dataStore[deviceId][data.type];
    if (!store) {
        store = [];
        dataStore[deviceId][data.type] = store;
    }

    if (data.type === DataType.Sprite) {
        // update sprites which are already present...
        const sprite_store = store as SpriteMsg[];
        if (data.sprite.movements) {
            data.sprite.movements.movements.forEach((m) => (m.id = nextSequenceId()));
        }
        const prevIdx = sprite_store.findIndex((s) => s.sprite.id === data.sprite.id);
        if (prevIdx >= 0) {
            const prev = sprite_store.splice(prevIdx, 1)[0];
            prev.time_stamp = data.time_stamp;
            prev.sprite = { ...prev.sprite, ...data.sprite, movements: undefined };
            sprite_store.push(prev);
            return;
        }
    }
    if (data.type === DataType.Line) {
        // update sprites which are already present...
        const line_store = store as LineMsg[];
        const prevIdx = line_store.findIndex((s) => s.line.id === data.line.id);
        if (prevIdx >= 0) {
            const prev = line_store.splice(prevIdx, 1)[0];
            prev.time_stamp = data.time_stamp;
            prev.line = { ...prev.line, ...data.line };
            line_store.push(prev);
            return;
        }
    }

    // remove first element if too many elements are present
    if (store.length >= THRESHOLD) {
        switch (data.type) {
            case DataType.Sprite:
                // remove preferrably sprites without collision detection
                const uncontrIdx = (store as SpriteMsg[]).findIndex((msg) => !msg.sprite.collision_detection);
                if (uncontrIdx >= 0) {
                    store.splice(uncontrIdx, 1);
                } else {
                    store.shift();
                }
                break;
            default:
                store.shift();
                break;
        }
    }
    switch (data.type) {
        case DataType.PlaygroundConfig:
            store.splice(0);
            store.push(data);
            break;
        default:
            store.push(data);
            break;
    }
}

io.on('connection', (socket) => {
    // emit the initial data
    socket.emit(SocketEvents.Devices, devicesPkg());
    const myDevice = socketId_device.get(socket.id);
    if (myDevice && dataStore[myDevice.device_id]) {
        socket.emit(SocketEvents.AllData, allDataPkg(myDevice.device_id));
    }

    socket.on('disconnecting', () => {
        const rooms = Object.keys(socket.rooms);
        // the rooms array contains at least the socket ID
        rooms.forEach((room) => {
            if (room !== socket.id) {
                const device = socketId_device.get(socket.id)!;
                const roomDevice: RoomDevice = { room: room, device: device };
                socket.to(room).emit(SocketEvents.RoomLeft, roomDevice);
            }
        });
    });

    // report on disconnect
    socket.on('disconnect', () => {
        socketId_device.delete(socket.id);
        touchDevices();
        io.emit(SocketEvents.Devices, devicesPkg());
    });

    socket.on(SocketEvents.NewDevice, (data: NewDevice) => {
        console.log('Device: ', data);
        if (data.old_device_id) {
            socket.leave(data.old_device_id);
            const oldDevice = socketId_device.get(socket.id);
            if (oldDevice) {
                io.to(data.old_device_id).emit(SocketEvents.RoomLeft, {
                    room: data.old_device_id,
                    device: oldDevice,
                });
            }
            socketId_device.delete(socket.id);
        }

        if (data.device_id.length > 0) {
            if (!dataStore[data.device_id]) {
                dataStore[data.device_id] = {};
            }
            const is_client = data.is_client ? true : false;
            const device = {
                device_id: data.device_id,
                is_client: is_client,
                device_nr: nextDeviceNr(is_client),
                socket_id: socket.id,
            };

            touchDevices();
            socketId_device.set(socket.id, device);
            socket.join(data.device_id, (err) => {
                if (err) {
                    socket.emit(SocketEvents.ErrorMsg, {
                        type: SocketEvents.NewDevice,
                        err: err,
                        msg: `Could not join room '${data.device_id}'`,
                    });
                } else {
                    io.to(data.device_id).emit(
                        SocketEvents.RoomJoined,
                        roomJoinedPkg(data.device_id, device)
                    );
                    socket.emit(SocketEvents.Device, device);
                }
            });
        }
        io.emit(SocketEvents.Devices, devicesPkg());
    });

    socket.on(SocketEvents.GetDevices, () => {
        socket.emit(SocketEvents.Devices, devicesPkg());
    });

    socket.on(SocketEvents.JoinRoom, (data: RoomDevice) => {
        if (!data.room) {
            return;
        }

        if (!Object.keys(socket.rooms).includes(data.room)) {
            const device = socketId_device.get(socket.id)!;
            socket.join(data.room, (err) => {
                if (!err) {
                    io.to(data.room).emit(SocketEvents.RoomJoined, roomJoinedPkg(data.room, device));
                } else {
                    socket.emit(SocketEvents.ErrorMsg, {
                        type: SocketEvents.JoinRoom,
                        err: err,
                        msg: `Could not join room '${data.room}'`,
                    });
                }
            });
        }
    });

    socket.on(SocketEvents.LeaveRoom, (data: RoomDevice) => {
        if (!data.room) {
            return;
        }

        if (Object.keys(socket.rooms).includes(data.room)) {
            const device = socketId_device.get(socket.id);
            socket.leave(data.room, (err: string) => {
                if (!err) {
                    const pkg: RoomLeftPkg = {
                        room: data.room,
                        device: device!,
                    };
                    io.to(data.room).emit(SocketEvents.RoomLeft, pkg);
                    socket.emit(SocketEvents.RoomLeft, pkg);
                } else {
                    const errMsg: ErrorMsg = {
                        type: SocketEvents.LeaveRoom,
                        err: err,
                        msg: `Could not leave room '${data.room}'`,
                    };
                    socket.emit(SocketEvents.ErrorMsg, errMsg);
                }
            });
        }
    });

    socket.on(SocketEvents.NewData, (data: ClientDataMsg) => {
        // return if neither device_id nor device_nr is given
        if (!data.device_id && data.device_nr === undefined) {
            return;
        }
        let device_id: string | undefined = data.device_id;
        if (!device_id) {
            device_id = unorderedDevices().find((d) => d.device_nr === data.device_nr)?.device_id;
        }
        if (!device_id) {
            return;
        }
        let unicast_to;
        if (typeof data.deliver_to === 'string') {
            if (device_id !== data.deliver_to) {
                device_id = data.deliver_to;
                data.cross_origin = true;
            }
        }
        if (typeof data.unicast_to === 'number') {
            unicast_to = unorderedDevices().find((d) => d.device_nr === data.unicast_to);
            if (unicast_to) {
                device_id = unicast_to.device_id;
                data.broadcast = false;
            }
        }

        // dont crash when someone does not add type info
        if ((data as any).type === undefined) {
            data.type = DataType.Unknown;
        }
        if (data.type === DataType.InputPrompt) {
            data.response_id = socket.id;
        }
        if (data.type === DataType.Notification && data.alert) {
            data.response_id = socket.id;
        }
        addDataToStore(device_id, data);
        if (data.stop_propagation) {
            return;
        }
        // socket.to(...) --> sends to all but self
        // io.to(...) --> sends to all in room
        const caller_id = (data as any).caller_id;
        if (caller_id) {
            io.to(caller_id).emit(SocketEvents.NewData, data);
            let input_type: DataType.Notification | DataType.InputPrompt | undefined;
            if (data.type === DataType.InputResponse) {
                input_type = DataType.InputPrompt;
            } else if (data.type === DataType.AlertConfirm) {
                input_type = DataType.Notification;
            }
            if (!!input_type) {
                const cancelRequest: CancelUserInputMsg = {
                    device_id: device_id,
                    time_stamp: data.time_stamp,
                    device_nr: data.device_nr,
                    response_id: caller_id,
                    input_type: input_type,
                    type: DataType.CancelUserInput,
                };
                io.to(device_id).emit(SocketEvents.NewData, cancelRequest);
            }
        } else if (data.broadcast) {
            io.emit(SocketEvents.NewData, data);
        } else if (unicast_to) {
            io.to(unicast_to.socket_id).to(GLOBAL_LISTENER_ROOM).emit(SocketEvents.NewData, data);
        } else {
            io.to(device_id).emit(SocketEvents.NewData, data);
            io.to(GLOBAL_LISTENER_ROOM).emit(SocketEvents.NewData, data);
        }
    });

    socket.on(SocketEvents.GetAllData, (data: DeviceIdPkg) => {
        // return if the device is not known
        if (!data.device_id || !dataStore[data.device_id]) {
            return;
        }

        socket.emit(SocketEvents.AllData, allDataPkg(data.device_id));
    });

    socket.on(SocketEvents.Clear, (data: DeviceIdPkg) => {
        if (!data.device_id || !dataStore[data.device_id]) {
            return;
        }
        dataStore[data.device_id] = {};
        trackAutoMovementBroadcasts[data.device_id] = new Map<string, Set<string>>();
        io.emit(SocketEvents.AllData, allDataPkg(data.device_id));
    });

    socket.on(SocketEvents.SetNewDeviceNr, (data: SetDeviceNr) => {
        if (deviceNrAssginmentLocked) {
            return socket.emit(
                SocketEvents.InformationMsg,
                informationPkg('Error', data, {
                    cause: 'another script tries to change the device nr',
                    should_retry: true,
                })
            );
        }
        deviceNrAssginmentLocked = true;
        try {
            if (!(data.device_id || typeof data.current_device_nr === 'number')) {
                return socket.emit(
                    SocketEvents.InformationMsg,
                    informationPkg('Error', data, {
                        cause: 'data did not contain valid fields "device_id" or "current_device_nr"',
                    })
                );
            }
            let deviceToReassign;
            if (typeof data.current_device_nr === 'number') {
                deviceToReassign = unorderedDevices().find((d) => d.device_nr === data.current_device_nr);
            } else {
                deviceToReassign = devices(data.device_id)[0];
            }
            if (!deviceToReassign) {
                return socket.emit(
                    SocketEvents.InformationMsg,
                    informationPkg('Error', data, { cause: 'no device found' })
                );
            }
            const device = unorderedDevices().find((d) => d.device_nr === data.new_device_nr);
            deviceToReassign.device_nr = data.new_device_nr;
            if (device) {
                device.device_nr = nextDeviceNr(device.is_client);
                io.to(device.socket_id).emit(SocketEvents.Device, device);
            }
            io.to(deviceToReassign.socket_id).emit(SocketEvents.Device, deviceToReassign);
            touchDevices();
            io.emit(SocketEvents.Devices, devicesPkg());
            socket.emit(SocketEvents.InformationMsg, informationPkg('Success', data));
        } catch (err) {
            return socket.emit(SocketEvents.InformationMsg, informationPkg('Error', data, { cause: err }));
        } finally {
            deviceNrAssginmentLocked = false;
        }
    });

    socket.on(SocketEvents.RemoveAll, () => {
        const device = socketId_device.get(socket.id);

        Object.keys(dataStore).forEach((key) => {
            if (device === undefined || key !== device.device_id) {
                delete dataStore[key];
            }
        });
        Object.keys(trackAutoMovementBroadcasts).forEach((key) => {
            delete trackAutoMovementBroadcasts[key];
        });

        touchDevices();
        io.emit(SocketEvents.DataStore, dataStore);
    });

    socket.on(SocketEvents.DataStore, () => {
        socket.emit(SocketEvents.DataStore, dataStore);
    });
});

// Handles any requests that don't match the ones above
app.get('*', (_req, res) => {
    res.sendFile(path.join(`${__dirname}/client/build/index.html`));
});

server.listen(process.env.PORT || 5000);
