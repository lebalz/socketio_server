import {
  InformationPkg,
  SetDeviceNr,
  TimeStampedMsg,
  RoomDevice,
  NewDevice,
  DeviceIdPkg,
  DataMsg,
  Device,
  AllDataPkg,
  DataType,
  SocketEvents,
  DataStore,
  DevicesPkg,
  InputResponseMsg,
  NotificationMsg,
  InputPromptMsg,
} from "./client/src/Shared/SharedTypings";
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import morgan from "morgan";
import socketIo from "socket.io";

const GLOBAL_LISTENER_ROOM = "GLOBAL_LISTENER";
const THRESHOLD = 100;

/**
 * a motion data frame is an object of the form:
 * {
 *    device_id: "TJVSV",
 *    time_stamp: 1023
 *  };
 * the time_stamp is in milliseconds
 */
const dataStore: DataStore = {};

const undeliveredNotifications: NotificationMsg[] = [];
const undeliveredPrompts: InputPromptMsg[] = [];

// tslint:disable-next-line: variable-name
const socketId_device: {
  [key: string]: Device;
} = {};

const app = express();

/**
 * CREATE A SERVER OBJECT
 */
const server = http.createServer(app);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// ensure the server can call other domains: enable cross origin resource sharing (cors)
app.use(cors());

// received packages should be presented in the JSON format
app.use(bodyParser.json());

// show some helpful logs in the commandline
app.use(morgan("dev"));

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
  return Object.values(socketId_device);
}

/**
 * @return [Array<Device>] all devices, ordered by is_client and devie_nr:
 * 		- first clients, ordered ascending by device_nr
 * 		- last scripts (=non-clients), ordered descending by device_nr
 */
function devices(device_id?: string): Device[] {
  const unordered = Object.values(socketId_device);
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

function allDataPkg(deviceId: string): AllDataPkg {
  return {
    device_id: deviceId,
    type: DataType.AllData,
    all_data: dataStore[deviceId],
  };
}

function informationPkg(
  message: string,
  action: TimeStampedMsg,
  data = {}
): InformationPkg {
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
    device,
  };
}

io.on("connection", (socket) => {
  // emit the initial data
  socket.emit(SocketEvents.Devices, devicesPkg());
  const myDevice = socketId_device[socket.id];
  if (myDevice && dataStore[myDevice.device_id]) {
    socket.emit(SocketEvents.AllData, allDataPkg(myDevice.device_id));
  }

  socket.on("disconnecting", () => {
    const rooms = Object.keys(socket.rooms);
    // the rooms array contains at least the socket ID
    rooms.forEach((room) => {
      if (room !== socket.id) {
        const device = socketId_device[socket.id];
        const roomDevice: RoomDevice = { room: room, device: device };
        socket.to(room).emit(SocketEvents.RoomLeft, roomDevice);
      }
    });
  });

  // report on disconnect
  socket.on("disconnect", () => {
    delete socketId_device[socket.id];
    touchDevices();
    io.emit(SocketEvents.Devices, devicesPkg());
  });

  socket.on(SocketEvents.NewDevice, (data: NewDevice) => {
    console.log("Device: ", data);
    if (data.old_device_id) {
      socket.leave(data.old_device_id);
      const oldDevice = socketId_device[socket.id];
      if (oldDevice) {
        io.to(data.old_device_id).emit(SocketEvents.RoomLeft, {
          room: data.old_device_id,
          device: oldDevice,
        });
      }
      delete socketId_device[socket.id];
    }

    if (data.device_id.length > 0) {
      if (!dataStore[data.device_id]) {
        dataStore[data.device_id] = [];
      }
      const is_client = data.is_client ? true : false;
      const device = {
        device_id: data.device_id,
        is_client,
        device_nr: nextDeviceNr(is_client),
        socket_id: socket.id,
      };

      touchDevices();
      socketId_device[socket.id] = device;
      socket.join(data.device_id, (err) => {
        if (err) {
          socket.emit(SocketEvents.ErrorMsg, {
            type: SocketEvents.NewDevice,
            err,
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

    if (data.is_client) {
      const undeliveredP = undeliveredPrompts.filter(
        (n) => n.device_id === data.device_id
      );

      const undeliveredN = undeliveredNotifications.filter(
        (n) => n.device_id === data.device_id
      );
      const undelivered = [...undeliveredN, ...undeliveredP].sort(
        (a, b) => a.time_stamp - b.time_stamp
      );
      if (undelivered.length > 0) {
        undelivered.forEach((n) => {
          io.emit(SocketEvents.NewData, n);
        });
      }
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
      const device = socketId_device[socket.id];
      socket.join(data.room, (err) => {
        if (!err) {
          io.to(data.room).emit(
            SocketEvents.RoomJoined,
            roomJoinedPkg(data.room, device)
          );
        } else {
          socket.emit(SocketEvents.ErrorMsg, {
            type: SocketEvents.JoinRoom,
            err,
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
      const device = socketId_device[socket.id];
      socket.leave(data.room, (err: string) => {
        if (!err) {
          io.to(data.room).emit(SocketEvents.RoomLeft, {
            room: data.room,
            device: device,
          });
          socket.emit(SocketEvents.RoomLeft, {
            room: data.room,
            device: device,
          });
        } else {
          socket.emit(SocketEvents.ErrorMsg, {
            type: SocketEvents.LeaveRoom,
            err,
            msg: `Could not leave room '${data.room}'`,
          });
        }
      });
    }
  });

  socket.on(SocketEvents.NewData, (data: DataMsg) => {
    // return if neither device_id not device_nr is given
    if (!data.device_id && !data.device_nr) {
      return;
    }
    let device_id = data.device_id;
    let unicast_to;
    if (typeof data.unicast_to === "number") {
      unicast_to = unorderedDevices().find(
        (d) => d.device_nr === data.unicast_to
      );
      if (unicast_to) {
        device_id = unicast_to.device_id;
        data.broadcast = false;
      }
    }
    if (device_id === undefined) {
      return;
    }
    if (!dataStore[device_id]) {
      dataStore[device_id] = [];
    }

    // remove first element if too many elements are present
    if (dataStore[device_id].length >= THRESHOLD) {
      dataStore[device_id].shift();
    }
    if (data.type === undefined) {
      data.type = DataType.Unknown;
    }
    if (data.type === DataType.InputPrompt) {
      data.response_id = socket.id;
      undeliveredPrompts.push((data as unknown) as InputPromptMsg);
    }
    if (data.type === DataType.Notification && data.alert) {
      data.response_id = socket.id;
      undeliveredNotifications.push((data as unknown) as NotificationMsg);
    }
    // add the new data
    dataStore[device_id].push(data as DataMsg);

    // socket.to(...) --> sends to all but self
    // io.to(...) --> sends to all in room
    if (data.caller_id) {
      try {
        if (data.type === DataType.InputResponse) {
          const prompt = undeliveredPrompts.find(
            (p) =>
              p.time_stamp === data.time_stamp && p.device_id === data.device_id
          );
          if (prompt) {
            undeliveredPrompts.splice(undeliveredPrompts.indexOf(prompt), 1);
          }
        } else if (data.type === DataType.AlertConfirm) {
          const notification = undeliveredNotifications.find(
            (n) =>
              n.time_stamp === data.time_stamp && n.device_id === data.device_id
          );
          if (notification) {
            undeliveredNotifications.splice(
              undeliveredNotifications.indexOf(notification),
              1
            );
          }
        }
        io.to(data.caller_id).emit(SocketEvents.NewData, data);
      } catch (e: any) {
        console.error(e);
      }
    } else if (data.broadcast) {
      io.emit(SocketEvents.NewData, data);
    } else if (unicast_to) {
      io.to(unicast_to.socket_id)
        .to(GLOBAL_LISTENER_ROOM)
        .emit(SocketEvents.NewData, data);
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
    dataStore[data.device_id] = [];
    io.emit(SocketEvents.AllData, allDataPkg(data.device_id));
  });

  /**
   * @param data {Object}
   * 			data: {
   * 					time_stamp: float			// time_stamp in seconds since epoch
   * 					new_device_nr: int, 		// <- requested device nr
   * 					device_id: string,			// for the client with this device_id
   * 					current_device_nr?: int		// ... or more specific the client with this nr.
   * 			}
   */
  socket.on(SocketEvents.SetNewDeviceNr, (data: SetDeviceNr) => {
    if (deviceNrAssginmentLocked) {
      return socket.emit(
        SocketEvents.InformationMsg,
        informationPkg("Error", data, {
          cause: "another script tries to change the device nr",
          should_retry: true,
        })
      );
    }
    deviceNrAssginmentLocked = true;
    try {
      if (!(data.device_id || typeof data.current_device_nr === "number")) {
        return socket.emit(
          SocketEvents.InformationMsg,
          informationPkg("Error", data, {
            cause:
              'data did not contain valid fields "device_id" or "current_device_nr"',
          })
        );
      }
      let deviceToReassign;
      if (typeof data.current_device_nr === "number") {
        deviceToReassign = unorderedDevices().find(
          (d) => d.device_nr === data.current_device_nr
        );
      } else {
        deviceToReassign = devices(data.device_id)[0];
      }
      if (!deviceToReassign) {
        return socket.emit(
          SocketEvents.InformationMsg,
          informationPkg("Error", data, { cause: "no device found" })
        );
      }
      const device = unorderedDevices().find(
        (d) => d.device_nr === data.new_device_nr
      );
      deviceToReassign.device_nr = data.new_device_nr;
      if (device) {
        device.device_nr = nextDeviceNr(device.is_client);
        io.to(device.socket_id).emit(SocketEvents.Device, device);
      }
      io.to(deviceToReassign.socket_id).emit(
        SocketEvents.Device,
        deviceToReassign
      );
      touchDevices();
      io.emit(SocketEvents.Devices, devicesPkg());
      socket.emit(SocketEvents.InformationMsg, informationPkg("Success", data));
    } catch (err) {
      return socket.emit(
        SocketEvents.InformationMsg,
        informationPkg("Error", data, { cause: err })
      );
    } finally {
      deviceNrAssginmentLocked = false;
    }
  });

  socket.on(SocketEvents.RemoveAll, () => {
    const device = socketId_device[socket.id];
    Object.keys(dataStore).forEach((key) => {
      if (device === undefined || key !== device.device_id) {
        delete dataStore[key];
      }
    });
    undeliveredPrompts.splice(0);
    undeliveredNotifications.splice(0);
    touchDevices();
    io.emit(SocketEvents.DataStore, dataStore);
  });

  socket.on(SocketEvents.DataStore, () => {
    socket.emit(SocketEvents.DataStore, dataStore);
  });
});

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

server.listen(process.env.PORT || 5000);
