import { Component } from 'react';
import MotionSimulator from '../models/MotionSimulator';

interface Props<T> {
  on: boolean;
  simulate: boolean;
  sensorEventName: 'devicemotion' | 'deviceorientation';
  onData: (data: T) => void;
}

interface State {
  on: boolean;
}

class ISensorDevice<T> extends Component<Props<T>> {
  state: State = {
    on: false,
  };
  simulator?: MotionSimulator;

  componentDidMount() {
    const isOn = localStorage.getItem(`${this.props.sensorEventName}`) === 'on';
    if (isOn) {
      if (this.props.on) {
        this.start();
      } else {
        this.setState({ on: true });
      }
    }
  }

  componentDidUpdate(prevProps: Props<T>) {
    if (this.props.on !== prevProps.on) {
      if (this.props.on) {
        this.start();
      } else {
        this.stop();
      }
    } else if (this.props.simulate !== prevProps.simulate && this.state.on) {
      this.restart();
    }
  }

  componentWillUnmount() {
    this.stop();
  }

  requestPermission(onGrant: () => void) {
    onGrant();
  }

  onData = (e: any) => {};

  get deviceSimulator(): HTMLElement | null {
    return document.getElementById('DeviceSimulator');
  }

  restart() {
    this.stop();
    this.start(true);
  }

  start(force: boolean = false) {
    this.requestPermission(() => {
      if (this.props.simulate) {
        if (!this.deviceSimulator) {
          return;
        }
        if (!this.simulator) {
          this.simulator = new MotionSimulator();
        }
        this.deviceSimulator.addEventListener(this.props.sensorEventName, this.onData as any, true);
        this.simulator.start(this.props.sensorEventName);
      } else {
        window.addEventListener(this.props.sensorEventName, this.onData, true);
      }
      this.setState({ on: true });
    });
  }
  stop() {
    window.removeEventListener(this.props.sensorEventName, this.onData, true);
    this.simulator?.stopSimulation();
    this.simulator = undefined;
    this.deviceSimulator?.removeEventListener(this.props.sensorEventName, this.onData as any, true);
    this.setState({ on: false });
  }

  toggleOn = () => {
    if (this.state.on) {
      localStorage.setItem(`${this.props.sensorEventName}`, 'off');
      this.stop();
    } else {
      localStorage.setItem(`${this.props.sensorEventName}`, 'on');
      this.start();
    }
  };
}

export default ISensorDevice;
