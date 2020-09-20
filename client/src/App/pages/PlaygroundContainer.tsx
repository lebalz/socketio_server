import React from 'react';
import { DataType, SpriteCollision } from 'src/Shared/SharedTypings';
import { Playground as PlaygroundModel } from '../models/Playground';
import { Sprite as SpriteModel } from '../models/Sprite';
import SocketData from '../SocketData';
import Playground from '../components/Playground';

interface Props {
  socket: SocketData;
}

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

  render() {
    return (
      <div
        className="playground-container"
        ref={this.containerRef}
        style={{
          width: `${this.state.width}px`,
          height: `${this.state.height}px`,
          border: '1px dotted black',
        }}
      >
        <Playground
          playground={this.playground}
          scaleX={this.state.scaleX}
          key={this.state.updateKey}
          heightRatio={this.state.heightRatio}
        />
      </div>
    );
  }
}

export default PlaygroundContainer;
