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
	GetDevices: 'get_devices'
}

THRESHOLD = 200
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


function nextDeviceNr() {
	const numbers = devices().map(device => device.deviceNr)
	let nextNr = 0;
	while (numbers.includes(nextNr)) {
		nextNr += 1;
	}
	return nextNr;
}

io.on("connection", (socket) => {
	console.log("New client joined: ", socket.id);
	// emit the initial data
	socket.emit(SocketEvents.Devices, devices());
	const device = socketId_device[socket.id];
	if (device && dataStore[device.deviceId]) {
		socket.emit(SocketEvents.AllData, dataStore[device.deviceId])
	}

	// report on disconnect
	socket.on("disconnect", () => {
		console.log("Client disconnected: ", socket.id, socketId_device[socket.id]);
		const device = socketId_device[socket.id]
		if (device && devices().filter(d => d.deviceId === device.deviceId).length === 1) {
			delete dataStore[socketId_device[socket.id].deviceId];
		}
		delete socketId_device[socket.id];
		io.emit(SocketEvents.Devices, devices());
	});

	socket.on(SocketEvents.NewDevice, data => {
		console.log("register new device: ", data)

		if (data.oldDeviceId) {
			socket.leave(data.oldDeviceId);
		}

		if (data.deviceId.length > 0) {
			if (!dataStore[data.deviceId]) {
				dataStore[data.deviceId] = [];
			}
			const isController = data.isController ? true : false;
			socketId_device[socket.id] = {
				deviceId: data.deviceId,
				isController: isController,
				deviceNr: isController ? nextDeviceNr() : -1,
				socketId: socket.id
			};
			socket.join(data.deviceId);
			socket.emit(SocketEvents.Device, socketId_device[socket.id])
		}
		io.emit(SocketEvents.Devices, devices());
	});

	socket.on(SocketEvents.GetDevices, () => {
		socket.emit(SocketEvents.Devices, devices());
	});

	socket.on(SocketEvents.AddNewData, data => {
		// return if neither deviceId not deviceNr is given
		if (!data.deviceId && !data.deviceNr) {
			return;
		}
		let deviceId = data.deviceId
		let device = undefined
		if (data.deviceNr) {
			device = socketId_device.find(device => device.deviceNr == data.deviceNr);
			if (device) {
				deviceId = device.deviceId;
			}
		}
		if (!dataStore[deviceId]) {
			dataStore[deviceId] = [];
		}
		console.log('new data: ', data)

		// remove first element if too many elements are present
		if (dataStore[deviceId].length >= THRESHOLD) {
			dataStore[deviceId].shift();
		}
		// add the new data
		dataStore[deviceId].push(data);

		if (data.broadcast) {
			io.emit(SocketEvents.NewData, data)
		} else if (device) {
			io.to(device.socketId).emit(SocketEvents.NewData, data);
		} else {
			io.in(data.deviceId).emit(SocketEvents.NewData, data);
		}
	});

	socket.on(SocketEvents.GetAllData, data => {
		console.log('get_all_data', data, dataStore[data.deviceId]);
		// return if the device is not known
		if (!dataStore[data.deviceId]) {
			return;
		}

		socket.emit(SocketEvents.AllData, dataStore[data.deviceId])
	});

	socket.on(SocketEvents.Clear, data => {
		if (!dataStore[data.deviceId]) {
			return;
		}
		dataStore[data.deviceId] = [];
		io.emit(SocketEvents.AllData, dataStore[data.deviceId]);
	});
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
server.listen(Number.parseInt(port, 10) + 1);

console.log('App is listening on port ' + port);
