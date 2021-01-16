import { computed, observable } from 'mobx';

import { Device as DeviceProps } from '../../Shared/SharedTypings';

export default class Device {
    @observable
    deviceId: string;
    @observable
    socketId?: string;
    @observable
    deviceNr?: number;
    @observable
    isClient?: boolean;
    @observable
    isSilent: boolean;

    constructor(device: { device_id: string } & Partial<DeviceProps>) {
        this.deviceId = device.device_id;
        this.socketId = device.socket_id;
        this.deviceNr = device.device_nr;
        this.isClient = device.is_client;
        this.isSilent = device.is_silent ?? false;
    }

    @computed
    get isConnected(): boolean {
        return !!this.socketId;
    }
}
