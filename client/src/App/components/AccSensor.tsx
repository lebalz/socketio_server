import React from 'react';
import { Checkbox } from 'semantic-ui-react';
import { DataType } from 'src/Shared/SharedTypings';
import ISensorDevice from './ISensorDevice';

interface AccData {
  type: DataType.Acceleration;
  x: number;
  y: number;
  z: number;
  interval: number;
}

interface Props {
  on: boolean;
  simulate: boolean;
  onData: (data: AccData) => void;
}

class MotionDevice extends ISensorDevice<AccData> {
  requestPermission(onGrant: () => void) {
    // feature detect
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
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

  onData = (e: DeviceMotionEvent) => {
    if (!this.state.on) {
      return;
    }
    if (e.accelerationIncludingGravity == null) {
      return;
    }
    const motionData: AccData = {
      type: DataType.Acceleration,
      x: e.accelerationIncludingGravity.x ?? 0,
      y: e.accelerationIncludingGravity.y ?? 0,
      z: e.accelerationIncludingGravity.z ?? 0,
      interval: e.interval,
    };
    this.props.onData(motionData);
  };

  render() {
    return <Checkbox checked={this.state.on} onClick={this.toggleOn} label="Stream Acceleration" />;
  }
}

const AccSensor = (props: Props) => {
  return <MotionDevice {...props} sensorEventName="devicemotion" />;
};
export default AccSensor;
