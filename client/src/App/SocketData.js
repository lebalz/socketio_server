import socketioClient from "socket.io-client";
import * as _ from 'lodash';

const WS_PORT = process.env.NODE_ENV === 'production' ? '' : ':5000'

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
     * @param {Array<{deviceId: string, deviceNr: number, isController: boolean}>} all connected devices
     */
    devices = []
    startTime = Date.now()

    /**
     * @param {Array<event => void)>}
     */
    onData = []

    /**
     * @param {undefined | (data) => void}
     */
    onDeviceNr = undefined

    constructor() {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const ws_url = `${protocol}://${window.location.hostname}${WS_PORT}`;
        console.log(ws_url);
        this.socket = socketioClient(ws_url, { transports: ['websocket', 'polling'] });
        this.socket.on(SocketEvents.Devices, (data) => {
            this.devices = data;
        });
        this.socket.on(SocketEvents.Device, data => {
            this.deviceNr = data.deviceNr;
            console.log(data);
            if (this.onDeviceNr) {
                this.onDeviceNr(data.deviceNr);
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
        this.socket.emit(SocketEvents.NewDevice, { deviceId: deviceId, oldDeviceId: oldId, isController: true });
    }, 300);

    clearData() {
        this.socket.emit(SocketEvents.Clear, { deviceId: this.deviceId });
    }

    refreshData() {
        this.socket.emit(SocketEvents.GetAllData, { deviceId: this.deviceId });
    }


    /**
     * 
     * @param {Object} data
     */
    addData(data) {
        this.socket.emit(SocketEvents.AddNewData, { deviceId: this.deviceId, timeStamp: Date.now() - this.startTime, ...data });
    }
}