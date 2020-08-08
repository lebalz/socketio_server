const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
var cors = require("cors");
const http = require("http");
const morgan = require("morgan");
const socketIo = require("socket.io");

const SocketEvents = {
	Device: 'device',
	Devices: 'devices',
	AllData: 'all_data',
	AddNewData: 'new_data',
	NewData: 'new_data',
	Clear: 'clear_data',
	NewDevice: 'new_device',
	GetAllData: 'get_all_data',
	GetDevices: 'get_devices',
	JoinRoom: 'join_room',
	LeaveRoom: 'leave_room',
	RoomLeft: 'room_left',
	RoomJoined: 'room_joined',
	RemoveAll: 'remove_all',
	DataStore: 'data_store',
	ErrorMsg: 'error_msg'
}

GLOBAL_LISTENER_ROOM = 'GLOBAL_LISTENER'
THRESHOLD = 100
/**
 * a motion data frame is an object of the form:
 * {
 *    deviceId: "TJVSV",
 *    timeStamp: 1023
 *  };
 * the timeStamp is in milliseconds
 */
const dataStore = {};
/**
 * a map to save socketId -> {deviceId: string, isController: boolean, deviceNr: number, socketId: string} conversions
 */
const socketId_device = {};

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
app.use(morgan("dev"));


/**
 * SOCKET CONFIGURATION
 */
// create socket server
const io = socketIo(server);
/**
 * @return [Array<string>] all currently active deviceIds
 */
function devices() {
	return Object.values(socketId_device);
}


function nextDeviceNr(isController) {
	const numbers = devices().map(device => device.deviceNr)
	let nextNr = 0;
	if (isController) {
		while (numbers.includes(nextNr)) {
			nextNr += 1;
		}
	} else {
		nextNr = -1
		while (numbers.includes(nextNr)) {
			nextNr -= 1;
		}
	}
	return nextNr;
}

function allDataPkg(deviceId) {
	return {
		deviceId: deviceId,
		type: 'allData',
		allData: dataStore[deviceId]
	}
}

io.on("connection", (socket) => {
	// emit the initial data
	socket.emit(SocketEvents.Devices, devices());
	const device = socketId_device[socket.id];
	if (device && dataStore[device.deviceId]) {
		socket.emit(SocketEvents.AllData, allDataPkg(device.deviceId))
	}

	socket.on('disconnecting', () => {
		const rooms = Object.keys(socket.rooms);
		// the rooms array contains at least the socket ID
		rooms.forEach(room => {
			if (room !== socket.id) {
				const device = socketId_device[socket.id]
				socket.to(room).emit(SocketEvents.RoomLeft, { room: room, device: device })
			}
		})
	});

	// report on disconnect
	socket.on("disconnect", () => {
		delete socketId_device[socket.id];
		io.emit(SocketEvents.Devices, devices());
	});

	socket.on(SocketEvents.NewDevice, data => {
		if (data.oldDeviceId) {
			socket.leave(data.oldDeviceId);
			const oldDevice = socketId_device[socket.id]
			if (oldDevice) {
				io.to(data.oldDeviceId).emit(SocketEvents.RoomLeft, { room: data.oldDeviceId, device: oldDevice })
			}
			delete socketId_device[socket.id]
		}

		if (data.deviceId.length > 0) {
			if (!dataStore[data.deviceId]) {
				dataStore[data.deviceId] = [];
			}
			const isController = data.isController ? true : false;
			const device = {
				deviceId: data.deviceId,
				isController: isController,
				deviceNr: nextDeviceNr(isController),
				socketId: socket.id
			};
			socketId_device[socket.id] = device
			socket.join(data.deviceId, (err) => {
				if (err) {
					socket.emit(SocketEvents.ErrorMsg, { type: SocketEvents.NewDevice, err: err, msg: `Could not join room '${data.deviceId}'` })
				} else {
					io.to(data.deviceId).emit(SocketEvents.RoomJoined, { room: data.deviceId, device: device })
					socket.emit(SocketEvents.Device, device)
				}
			});
		}
		io.emit(SocketEvents.Devices, devices());
	});

	socket.on(SocketEvents.GetDevices, () => {
		socket.emit(SocketEvents.Devices, devices());
	});

	socket.on(SocketEvents.JoinRoom, (data) => {
		if (!data.room) {
			return
		}

		if (!Object.keys(socket.rooms).includes(data.room)) {
			const device = socketId_device[socket.id]
			socket.join(data.room, (err) => {
				if (!err) {
					io.to(data.room).emit(SocketEvents.RoomJoined, { room: data.room, device: device })
				} else {
					socket.emit(SocketEvents.ErrorMsg, { type: SocketEvents.JoinRoom, err: err, msg: `Could not join room '${data.room}'` })
				}
			})
		}
	})

	socket.on(SocketEvents.LeaveRoom, (data) => {
		if (!data.room) {
			return
		}

		if (Object.keys(socket.rooms).includes(data.room)) {
			const device = socketId_device[socket.id]
			socket.leave(data.room, (err) => {
				if (!err) {
					io.to(data.room).emit(SocketEvents.RoomLeft, { room: data.room, device: device })
					socket.emit(SocketEvents.RoomLeft, { room: data.room, device: device })
				} else {
					socket.emit(SocketEvents.ErrorMsg, { type: SocketEvents.LeaveRoom, err: err, msg: `Could not leave room '${data.room}'` })
				}
			})
		}
	})

	socket.on(SocketEvents.AddNewData, data => {
		// return if neither deviceId not deviceNr is given
		if (!data.deviceId && !data.deviceNr) {
			return;
		}
		let deviceId = data.deviceId
		let unicastTo = undefined
		if (data.unicastTo) {
			unicastTo = Object.values(socketId_device).find(device => device.deviceNr == data.unicastTo);
			if (unicastTo) {
				deviceId = unicastTo.deviceId;
			}
		}
		if (!dataStore[deviceId]) {
			dataStore[deviceId] = [];
		}

		// remove first element if too many elements are present
		if (dataStore[deviceId].length >= THRESHOLD) {
			dataStore[deviceId].shift();
		}
		// add the new data
		dataStore[deviceId].push(data);

		// socket.to(...) --> sends to all but self
		// io.to(...) --> sends to all in room
		if (data.broadcast) {
			io.emit(SocketEvents.NewData, data)
		} else if (unicastTo) {
			io.to(unicastTo.socketId).to(GLOBAL_LISTENER_ROOM).emit(SocketEvents.NewData, data);
		} else {
			io.to(data.deviceId).emit(SocketEvents.NewData, data);
			io.to(GLOBAL_LISTENER_ROOM).emit(SocketEvents.NewData, data);
		}
	});

	socket.on(SocketEvents.GetAllData, data => {
		// return if the device is not known
		if (!dataStore[data.deviceId]) {
			return;
		}

		socket.emit(SocketEvents.AllData, allDataPkg(data.deviceId))
	});

	socket.on(SocketEvents.Clear, data => {
		if (!dataStore[data.deviceId]) {
			return;
		}
		dataStore[data.deviceId] = [];
		io.emit(SocketEvents.AllData, allDataPkg(data.deviceId));
	});


	socket.on(SocketEvents.RemoveAll, () => {
		const device = socketId_device[socket.id]
		Object.keys(dataStore).forEach(key => {
			if (key !== device.deviceId) {
				delete dataStore[key]
			}
		})
		io.emit(SocketEvents.DataStore, dataStore);
	});


	socket.on(SocketEvents.DataStore, () => {
		socket.emit(SocketEvents.DataStore, dataStore);
	});
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

server.listen(process.env.PORT || 5000);