import React from 'react';
import { ISprite } from '../models/Sprite';

interface Props {
  sprite: ISprite;
  scaleX: number;
  shiftX: number;
  shiftY: number;
}

class Sprite extends React.Component<Props> {
  render() {
    const { scaleX, shiftX, shiftY } = this.props;
    const cls = `sprite ${this.props.sprite.form}`;
    const { height, posX, posY, width, color } = this.props.sprite;
    return (
      <div
        style={{
          width: width * scaleX,
          height: height * scaleX,
          background: color,
          position: 'absolute',
          left: (posX + shiftX) * scaleX,
          bottom: (posY + shiftY) * scaleX,
        }}
        className={cls}
      />
    );
  }
}

export default Sprite;
