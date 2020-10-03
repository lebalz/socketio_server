import React from 'react';
import { Checkbox } from 'semantic-ui-react';
import { DataType } from 'src/Shared/SharedTypings';
import SensorDevice from './SensorDevice';

export interface GyroData {
    type: DataType.Gyro;
    alpha: number;
    beta: number;
    gamma: number;
    absolute: boolean;
}

interface Props {
    simulate: boolean;
    on: boolean;
    onData: (data: GyroData) => void;
    onChangeActive?: (on: boolean) => void;
}

class OrientationDevice extends SensorDevice<GyroData> {
    requestPermission(onGrant: () => void) {
        // feature detect
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then((permissionState) => {
                    if (permissionState === 'granted') {
                        onGrant();
                    }
                })
                .catch(console.error);
        } else {
            onGrant();
        }
    }

    onData = (e: DeviceOrientationEvent) => {
        if (!this.state.on) {
            return;
        }
        const gyroData: GyroData = {
            type: DataType.Gyro,
            alpha: e.alpha ?? 0,
            beta: e.beta ?? 0,
            gamma: e.gamma ?? 0,
            absolute: e.absolute,
        };
        this.props.onData(gyroData);
    };

    render() {
        return <Checkbox checked={this.state.on} onClick={this.toggleOn} label="Stream Gyro" />;
    }
}

const GyroSensor = (props: Props) => {
    return <OrientationDevice {...props} sensorEventName="deviceorientation" />;
};
export default GyroSensor;
