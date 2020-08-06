/**
 * emit all 64ms a new event
 */
const INTERVAL = 64;

export default class MotionSimulator {
  x = 0.0;
  y = 0.0;
  z = -9.81;

  dx = 0.0;
  dy = 0.0;
  dz = 0.0;

  alpha = 0.0;
  beta = 0.0;
  gamma = 0.0;

  counter = 0;
  orientationCounter = 0;

  constructor() {
    this.deviceSimulator = document.getElementById("DeviceSimulator");
  }

  startMotionSimulation() {
    this.motionIntervalId = setInterval(this.emitMotionEvent, INTERVAL);
  }
  startOrientationSimulation() {
    this.orientationIntervalId = setInterval(this.emitOrientationEvent, INTERVAL);
  }
  stopMotionSimulation() {
    if (this.motionIntervalId) {
      clearInterval(this.motionIntervalId);
    }
  }
  stopOrientationSimulation() {
    if (this.orientationIntervalId) {
      clearInterval(this.orientationIntervalId);
    }
  }

  stopSimulation() {
    this.stopMotionSimulation();
    this.stopOrientationSimulation();
  }

  get acceleration() {
    return {
      x: this.dx,
      y: this.dy,
      z: this.dz
    };
  }

  get accelerationIncludingGravity() {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    };
  }

  get rotationRate() {
    return {
      alpha: this.alpha,
      beta: this.beta,
      gamma: this.gamma
    };
  }

  nextOrientationValues() {
    this.alpha = Math.sin(this.orientationCounter / (2000 / INTERVAL)) * 180 + 180;
    this.beta = Math.cos(this.orientationCounter / (2000 / INTERVAL)) * 180.0;
    this.orientationCounter += 1;
  }

  nextValues() {
    this.dx = Math.random() / 10;
    this.dy = Math.random() / 10;
    this.dz = Math.sin(this.counter / (50 / INTERVAL));

    this.x = this.dx + 0;
    this.y = this.dy + 9.81;
    this.z = this.dz + 0;

    this.counter += 1;
  }


  emitMotionEvent = () => {
    this.nextValues();
    const event = new DeviceMotionEvent(
      "devicemotion",
      {
        acceleration: this.acceleration,
        accelerationIncludingGravity: this.accelerationIncludingGravity,
        rotationRate: this.rotationRate,
        interval: INTERVAL
      }
    )

    this.deviceSimulator.dispatchEvent(event);
  }

  emitOrientationEvent = () => {
    this.nextOrientationValues();
    const event = new DeviceOrientationEvent(
      "deviceorientation",
      {
        alpha: this.alpha,
        beta: this.beta,
        gamma: this.gamma,
        absolute: true
      }
    )

    this.deviceSimulator.dispatchEvent(event);
  }
}