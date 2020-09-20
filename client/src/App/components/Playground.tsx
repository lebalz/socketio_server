import React, { Fragment } from 'react';
import { Playground as PlaygroundModel } from '../models/Playground';
import Sprite from './Sprite';

interface Props {
  playground: PlaygroundModel;
  scaleX: number;
  heightRatio: number;
}

class Playground extends React.Component<Props> {
  render() {
    const { scaleX, playground } = this.props;
    const { uncontrolledSprites, controlledSprites, shiftX, shiftY } = playground;
    return (
      <div
        className="playground"
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: `${100 * this.props.heightRatio}%`,
          background: 'lightgray',
        }}
      >
        <Fragment>
          <div style={{ position: 'absolute', bottom: 0, left: 0 }}>{this.props.playground.updateKey}</div>
          {uncontrolledSprites.map((sprite, idx) => {
            return (
              <Sprite
                sprite={sprite}
                scaleX={scaleX}
                key={`uncontrolled-${idx}`}
                shiftX={shiftX}
                shiftY={shiftY}
              />
            );
          })}
          {controlledSprites.map((sprite, idx) => {
            return (
              <Sprite
                sprite={sprite}
                scaleX={scaleX}
                key={`controlled-${idx}`}
                shiftX={shiftX}
                shiftY={shiftY}
              />
            );
          })}
        </Fragment>
      </div>
    );
  }
}

export default Playground;
