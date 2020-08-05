import socketioClient from "socket.io-client";
import * as _ from 'lodash';

const WS_PORT = process.env.NODE_ENV === 'production' ? '' : ':5000'

export const SocketEvents = {
    Device: 'device',
    Devices: 'devices',
    AllData: 'all_data',
    AddNewData: 'new_data',
    NewData: 'new_data',
    Clear: 'clear_data',
    NewDevice: 'new_device',
    GetAllData: 'get_all_data',
    GetDevices: 'get_devices',
	RemoveAll: 'remove_all',
	DataStore: 'data_store'
}

export default class SocketData {

    /**
     * 
     * @param {string} deviceId 
     */
    deviceId = ''

    /**
     * 
     * @param {number} deviceNr 
     */
    deviceNr = -1

    /**
     * 
     * @param {Array<any>} myData (data for this deviceId) 
     */
    myData = []

    /**
     * 
     * @param {Array<any>} data from other clients 
     */
    otherData = []


    /**
     * 
     * @param {Array<{deviceId: string, deviceNr: number, isController: boolean, socketId: string}>} all connected devices
     */
    devices = []
    startTime = Date.now()

    /**
     * @param {Array<event => void)>}
     */
    onData = []

    /**
     * @param {Array<event => void)>}
     */
    onDevices = []

    /**
     * @param {Array<event => void)>}
     */
    onAllData = []

    /**
     * @param {undefined | (data) => void}
     */
    onDevice = undefined

    constructor() {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const ws_url = `${protocol}://${window.location.hostname}${WS_PORT}`;
        console.log(ws_url);
        this.socket = socketioClient(ws_url, { transports: ['websocket', 'polling'] });
        this.socket.on(SocketEvents.Devices, (data) => {
            this.devices = data;
            this.onDevices.forEach(callback => callback(data))
        });
        this.socket.on(SocketEvents.Device, data => {
            this.deviceNr = data.deviceNr;
            console.log(data);
            if (this.onDevice) {
                this.onDevice(data.deviceNr);
            }
            this.refreshData()
        })
        this.socket.on(SocketEvents.AllData, data => {
            if (Array.isArray(data)) {
                const device = data.find(d => d.deviceId);
                if (device) {
                    const deviceId = device.deviceId;
                    if (deviceId === this.deviceId) {
                        this.myData = data;
                    } else {
                        this.otherData.push(...data);
                    }
                }
                this.onAllData.forEach(callback => callback(data))
            }
        })
        this.socket.on(SocketEvents.NewData, data => {
            if (data.deviceId === this.deviceId) {
                this.myData.push(data);
            } else if (data.deviceId) {
                this.otherData.push(data);
            }
            this.onData.forEach(callback => {
                callback(data)
            })
        });
    }

    getData(type) {
        return this.myData.filter(d => d.type === type);
    }

    setDeviceId = _.debounce((deviceId) => {
        const oldId = this.deviceId;
        this.deviceId = deviceId;
        this.emit(SocketEvents.NewDevice, { deviceId: deviceId, oldDeviceId: oldId, isController: true });
    }, 300);

    clearData() {
        this.emit(SocketEvents.Clear);
    }

    refreshData() {
        this.emit(SocketEvents.GetAllData);
    }

    refreshDevices() {
        this.emit(SocketEvents.GetDevices);
    }

    /**
     * 
     * @param {string} event 
     * @param {Object} data 
     * @param {boolean} broadcast 
     */
    emit(event, data, broadcast = false) {
        this.socket.emit(
            event,
            {
                deviceId: this.deviceId,
                timeStamp: Date.now(),
                broadcast: broadcast,
                ...data
            }
        );
    }


    /**
     * 
     * @param {Object} data
     */
    addData(data) {
        this.emit(SocketEvents.AddNewData, data);
    }

    removeListener(name, callback) {
        const callbackIdx = this[name].indexOf(f => f === callback)
        if (callbackIdx >= 0) {
            this[name].splice(callbackIdx, callbackIdx)
        }
    }
}

export class AdminSocketData extends SocketData {
    dataStore = {}

    /**
     * @param {undefined | (data) => void}
     */
    onDataStore = undefined
    constructor() {
        super()
        this.deviceId = 'GLOBAL_LISTENER';
        this.emit(SocketEvents.NewDevice, { deviceId: this.deviceId, isController: true });
        
        this.socket.on(SocketEvents.DataStore, data => {
            this.dataStore = data
            if (this.onDataStore) {
                this.onDataStore(data)
            }
        });
    }

    removeAllData() {
        this.emit(SocketEvents.RemoveAll);
    }

    getDataStore() {
        this.emit(SocketEvents.DataStore);
    }

    get allEvents() {
        return _.orderBy(this.otherData, ['timeStamp'], 'desc')
    }

    disconnect() {
        this.onAllData = []
        this.onData = []
        this.onDevices = []
        this.onDataStore = undefined
        this.onDevice = undefined
        this.socket.disconnect()
    }
}