import React from 'react';
import { Checkbox } from 'semantic-ui-react';
import { DataType } from 'src/Shared/SharedTypings';
import SensorDevice from './SensorDevice';

export interface AccelerationData {
    type: DataType.Acceleration;
    x: number;
    y: number;
    z: number;
    interval: number;
}

interface Props {
    on: boolean;
    simulate: boolean;
    onData: (data: AccelerationData) => void;
    onChangeActive?: (on: boolean) => void;
}

class MotionDevice extends SensorDevice<AccelerationData> {
    requestPermission(onGrant: () => void) {
        // feature detect
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then((permissionState) => {
                    if (permissionState === 'granted') {
                        this.setState({ isiOS: true });
                        onGrant();
                    }
                })
                .catch(console.error);
        } else {
            onGrant();
        }
    }

    onData = (e: DeviceMotionEvent) => {
        if (!this.state.on) {
            return;
        }
        if (e.accelerationIncludingGravity == null) {
            return;
        }

        const motionData: AccelerationData = {
            type: DataType.Acceleration,
            x: e.accelerationIncludingGravity.x ?? 0,
            y: e.accelerationIncludingGravity.y ?? 0,
            z: e.accelerationIncludingGravity.z ?? 0,
            interval: e.interval,
        };
        if (this.state.isiOS) {
            motionData.x = -motionData.x;
            motionData.y = -motionData.y;
            motionData.z = -motionData.z;
        }
        this.props.onData(motionData);
    };

    render() {
        return <Checkbox checked={this.state.on} onClick={this.toggleOn} label="Stream Acceleration" />;
    }
}

const AccelerationSensor = (props: Props) => {
    return <MotionDevice {...props} sensorEventName="devicemotion" />;
};
export default AccelerationSensor;
