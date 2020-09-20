import React, { Fragment } from 'react';
import { DataMsg, DataType, SpriteCollision } from 'src/Shared/SharedTypings';
import { Playground as PlaygroundModel } from '../models/Playground';
import { Sprite as SpriteModel } from '../models/Sprite';
import SocketData from '../SocketData';
import Playground from '../components/Playground';
import AccelerationSensor, { AccelerationData } from '../components/Controls/Sensors/AccelerationSensor';
import GyroSensor, { GyroData } from '../components/Controls/Sensors/GyroSensor';
import { Checkbox } from 'semantic-ui-react';
import KeyControls, { KeyControlListener, KeyData } from '../components/Controls/KeyControls';

interface Props {
  socket: SocketData;
}

type IOverload = {
  (data: AccelerationData): void;
  (data: GyroData): void;
  (data: KeyData): void;
};

class PlaygroundContainer extends React.Component<Props> {
  containerRef = React.createRef<HTMLDivElement>();
  playground: PlaygroundModel;
  lastCollisions: string[] = [];
  state = {
    scaleX: 1,
    heightRatio: 1,
    updateKey: 0,
    width: 100,
    height: 100,
    simulateSensor: false,
    keyControls: true,
  };

  onUpdate = (timeStamp: number, collisions: SpriteModel[][]) => {
    this.setState({ updateKey: timeStamp });
    const undetected = this.lastCollisions.slice();
    collisions.forEach((sprites) => {
      const iid = `${sprites[0].id}::::${sprites[1].id}`;
      if (this.lastCollisions.includes(iid)) {
        delete undetected[undetected.indexOf(iid)];
        return;
      }
      const data: SpriteCollision = {
        type: DataType.SpriteCollision,
        sprites: [sprites[0].id, sprites[1].id],
        time_stamp: timeStamp,
        overlap: 'in',
      };
      this.props.socket.addData(data);
      this.lastCollisions.push(iid);
    });
    undetected.forEach((un) => {
      const data: SpriteCollision = {
        type: DataType.SpriteCollision,
        sprites: un.split('::::'),
        time_stamp: timeStamp,
        overlap: 'out',
      };
      this.props.socket.addData(data);
      delete this.lastCollisions[this.lastCollisions.indexOf(un)];
    });
  };

  constructor(props: Props) {
    super(props);
    this.playground = new PlaygroundModel(this.onUpdate);
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.updateSize();
  }

  componentWillUnmount() {
    this.playground.stop();
    window.removeEventListener('resize', this.onResize);
  }

  onResize = (ev: UIEvent) => {
    this.updateSize();
  };

  updateSize() {
    let { scaleX, heightRatio } = this.state;
    if (this.containerRef.current) {
      scaleX = this.width / this.playground.width;
      heightRatio = this.playground.height / this.playground.width;
    }
    this.setState({
      width: this.width,
      height: this.height,
      scaleX: scaleX,
      heightRatio: heightRatio,
    });
  }

  get windowRatio() {
    return window.innerWidth / window.innerHeight;
  }

  get playgroundRatio() {
    return this.playground.width / this.playground.height;
  }

  get width() {
    if (this.playgroundRatio >= 1) {
      if (this.windowRatio > this.playgroundRatio) {
        return window.innerHeight;
      }
      return window.innerWidth;
    }
    if (this.windowRatio > this.playgroundRatio) {
      return window.innerHeight * this.playgroundRatio;
    }
    return window.innerWidth;
  }

  get height() {
    return this.width / this.playgroundRatio;
  }

  onData: IOverload = (data: any) => {
    this.props.socket.addData(data);
  };

  toggleSimulateSensor = () => {
    const simulate = !this.state.simulateSensor;
    this.setState({ simulateSensor: simulate });
    localStorage.setItem('simulate_sensor', simulate ? 'yes' : 'no');
  };

  toggleKeyControls = () => {
    const keyControls = !this.state.keyControls;
    this.setState({ keyControls: keyControls });
  };

  render() {
    return (
      <Fragment>
        <div style={{ display: 'flex', justifyItems: 'flex-start' }}>
          <Checkbox
            checked={this.state.simulateSensor}
            onClick={this.toggleSimulateSensor}
            label="Simulate Sensors"
          />
          <AccelerationSensor simulate={this.state.simulateSensor} onData={this.onData} on />
          <GyroSensor simulate={this.state.simulateSensor} onData={this.onData} on />
          <Checkbox checked={this.state.keyControls} onClick={this.toggleKeyControls} label="Keys" />
          <KeyControlListener onData={this.onData} />
        </div>

        <div
          className="playground-container"
          ref={this.containerRef}
          style={{
            width: `${this.state.width}px`,
            height: `${this.state.height}px`,
          }}
        >
          <Playground
            playground={this.playground}
            scaleX={this.state.scaleX}
            key={this.state.updateKey}
            heightRatio={this.state.heightRatio}
          />
        </div>
      </Fragment>
    );
  }
}

export default PlaygroundContainer;
