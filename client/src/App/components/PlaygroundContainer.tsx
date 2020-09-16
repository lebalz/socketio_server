import React from 'react';
import { Playground as PlaygroundModel } from '../models/Playground';
import SocketData from '../SocketData';
import Playground from './Playground';

interface Props {
  socket: SocketData;
}

class PlaygroundContainer extends React.Component<Props> {
  containerRef = React.createRef<HTMLDivElement>();
  playground = new PlaygroundModel((key) => this.setState({ updateKey: key }));
  state = {
    scaleX: 1,
    heightRatio: 1,
    updateKey: 0,
  };

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    if (this.containerRef.current) {
      const rect = this.containerRef.current.getBoundingClientRect();
      const scaleX = rect.width / this.playground.width;
      const heightRatio = this.playground.height / this.playground.width;
      this.setState({ scaleX: scaleX, heightRatio: heightRatio });
    }
  }

  componentWillUnmount() {
    this.playground.stop();
  }

  render() {
    return (
      <div
        className="playground-container"
        ref={this.containerRef}
        style={{ width: '100vw', height: '100vh', border: '1px dotted black' }}
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
