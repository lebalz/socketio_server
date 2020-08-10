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
	ErrorMsg: 'error_msg',
	SetNewDeviceNr: 'set_new_device_nr',
	InformationMsg: 'information_msg'
}

GLOBAL_LISTENER_ROOM = 'GLOBAL_LISTENER'
THRESHOLD = 100
/**
 * a motion data frame is an object of the form:
 * {
 *    device_id: "TJVSV",
 *    time_stamp: 1023
 *  };
 * the time_stamp is in milliseconds
 */
const dataStore = {};
/**
 * a map to save socket_id -> {device_id: string, is_client: boolean, device_nr: number, socket_id: string} conversions
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
 * @return [Array<Device>] all devices, unordered
 * 
 */
function unorderedDevices() {
	return Object.values(socketId_device);
}


/**
 * @return [Array<Device>] all devices, ordered by is_client and devie_nr:
 * 		- first clients, ordered ascending by device_nr
 * 		- last scripts (=non-clients), ordered descending by device_nr 
 */
function devices(device_id = undefined) {
	const unordered = Object.values(socketId_device);
	const partitioned = unordered.reduce((store, device) => {
		if (device_id === undefined || device_id === device.device_id) {
			if (device.is_client) {
				store.clients.push(device)
			} else {
				store.scripts.push(device)
			}
		}
		return store;
	}, { clients: [], scripts: [] })
	return [
		...partitioned.clients.sort((a, b) => a.device_nr - b.device_nr),
		...partitioned.scripts.sort((a, b) => b.device_nr - a.device_nr)
	]
}

function timeStamp() {
	return Date.now() / 1000.0
}

let lastDeviceModification = timeStamp();
function touchDevices() {
	lastDeviceModification = timeStamp();
}

function devicesPkg() {
	return {
		time_stamp: lastDeviceModification,
		devices: devices()
	}
}

let deviceNrAssginmentLocked = false

function nextDeviceNr(is_client) {
	const numbers = unorderedDevices().map(device => device.device_nr)
	let nextNr = 0;
	if (is_client) {
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
		device_id: deviceId,
		type: 'all_data',
		all_data: dataStore[deviceId]
	}
}

function informationPkg(message, action, data = {}) {
	return {
		time_stamp: timeStamp(),
		message: message,
		action: action,
		...data
	}
}

function roomJoinedPkg(roomId, device) {
	return {
		room: roomId,
		device: device
	}
}

io.on("connection", (socket) => {
	// emit the initial data
	socket.emit(SocketEvents.Devices, devicesPkg());
	const device = socketId_device[socket.id];
	if (device && dataStore[device.device_id]) {
		socket.emit(SocketEvents.AllData, allDataPkg(device.device_id))
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
		touchDevices()
		io.emit(SocketEvents.Devices, devicesPkg());
	});

	socket.on(SocketEvents.NewDevice, data => {
		if (data.old_device_id) {
			socket.leave(data.old_device_id);
			const oldDevice = socketId_device[socket.id]
			if (oldDevice) {
				io.to(data.old_device_id).emit(SocketEvents.RoomLeft, { room: data.old_device_id, device: oldDevice })
			}
			delete socketId_device[socket.id]
		}

		if (data.device_id.length > 0) {
			if (!dataStore[data.device_id]) {
				dataStore[data.device_id] = [];
			}
			const is_client = data.is_client ? true : false;
			const device = {
				device_id: data.device_id,
				is_client: is_client,
				device_nr: nextDeviceNr(is_client),
				socket_id: socket.id
			};

			touchDevices()
			socketId_device[socket.id] = device
			socket.join(data.device_id, (err) => {
				if (err) {
					socket.emit(SocketEvents.ErrorMsg, { type: SocketEvents.NewDevice, err: err, msg: `Could not join room '${data.device_id}'` })
				} else {
					io.to(data.device_id).emit(SocketEvents.RoomJoined, roomJoinedPkg(data.device_id, device))
					socket.emit(SocketEvents.Device, device)
				}
			});
		}
		io.emit(SocketEvents.Devices, devicesPkg());
	});

	socket.on(SocketEvents.GetDevices, () => {
		socket.emit(SocketEvents.Devices, devicesPkg());
	});

	socket.on(SocketEvents.JoinRoom, (data) => {
		if (!data.room) {
			return
		}

		if (!Object.keys(socket.rooms).includes(data.room)) {
			const device = socketId_device[socket.id]
			socket.join(data.room, (err) => {
				if (!err) {
					io.to(data.room).emit(SocketEvents.RoomJoined, roomJoinedPkg(data.room, device))
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
		// return if neither device_id not device_nr is given
		if (!data.device_id && !data.device_nr) {
			return;
		}
		let device_id = data.device_id
		let unicast_to = undefined
		if (typeof data.unicast_to === 'number') {
			unicast_to = unorderedDevices().find(device => device.device_nr == data.unicast_to);
			if (unicast_to) {
				device_id = unicast_to.device_id;
				data.broadcast = false
			}
		}
		if (!dataStore[device_id]) {
			dataStore[device_id] = [];
		}

		// remove first element if too many elements are present
		if (dataStore[device_id].length >= THRESHOLD) {
			dataStore[device_id].shift();
		}
		// add the new data
		dataStore[device_id].push(data);

		// socket.to(...) --> sends to all but self
		// io.to(...) --> sends to all in room
		if (data.broadcast) {
			io.emit(SocketEvents.NewData, data)
		} else if (unicast_to) {
			io.to(unicast_to.socket_id).to(GLOBAL_LISTENER_ROOM).emit(SocketEvents.NewData, data);
		} else {
			io.to(data.device_id).emit(SocketEvents.NewData, data);
			io.to(GLOBAL_LISTENER_ROOM).emit(SocketEvents.NewData, data);
		}
	});

	socket.on(SocketEvents.GetAllData, data => {
		// return if the device is not known
		if (!data.device_id || !dataStore[data.device_id]) {
			return;
		}

		socket.emit(SocketEvents.AllData, allDataPkg(data.device_id))
	});

	socket.on(SocketEvents.Clear, data => {
		if (!data.device_id || !dataStore[data.device_id]) {
			return;
		}
		dataStore[data.device_id] = [];
		io.emit(SocketEvents.AllData, allDataPkg(data.device_id));
	});

	socket.on(SocketEvents.ReassignNumbers, data => {
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
	socket.on(SocketEvents.SetNewDeviceNr, data => {
		if (deviceNrAssginmentLocked) {
			return socket.emit(SocketEvents.InformationMsg, informationPkg('Error', data, { cause: 'another script tries to change the device nr', should_retry: true }))
		}
		deviceNrAssginmentLocked = true
		try {
			if (!(data.device_id || typeof data.current_device_nr === 'number')) {
				return socket.emit(SocketEvents.InformationMsg, informationPkg('Error', data, { cause: 'data did not contain valid fields "device_id" or "current_device_nr"' }))
			}
			let deviceToReassign
			if (typeof data.current_device_nr === 'number') {
				deviceToReassign = unorderedDevices().find(d => d.device_nr === data.current_device_nr)
			} else {
				deviceToReassign = devices(data.device_id)[0]
			}
			if (!deviceToReassign) {
				return socket.emit(SocketEvents.InformationMsg, informationPkg('Error', data, { cause: 'no device found' }))
			}
			const affectedDevice = unorderedDevices().find(d => d.device_nr === data.new_device_nr)
			deviceToReassign.device_nr = data.new_device_nr
			if (affectedDevice) {
				affectedDevice.device_nr = nextDeviceNr(affectedDevice.is_client)
				io.to(affectedDevice.socket_id).emit(SocketEvents.Device, affectedDevice)
			}
			io.to(deviceToReassign.socket_id).emit(SocketEvents.Device, deviceToReassign)
			touchDevices()
			io.emit(SocketEvents.Devices, devicesPkg());
			socket.emit(SocketEvents.InformationMsg, informationPkg('Success', data))
		} catch (err) {
			return socket.emit(SocketEvents.InformationMsg, informationPkg('Error', data, { cause: err }))
		} finally {
			deviceNrAssginmentLocked = false
		}
	});


	socket.on(SocketEvents.RemoveAll, () => {
		const device = socketId_device[socket.id]
		Object.keys(dataStore).forEach(key => {
			if (device == undefined || key !== device.device_id) {
				delete dataStore[key]
			}
		})
		touchDevices()
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