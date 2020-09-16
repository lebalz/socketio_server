import { Movement, Sprite } from '../../Shared/SharedTypings';
import ControlledSprite from './ControlledSprite';
import UncontrolledSprite from './UncontrolledSprite';
import { timeStamp } from '../SocketData';

export default class Playground {
  width: number = 100;
  height: number = 100;
  controlledSprites: ControlledSprite[] = [];
  uncontrolledSprites: UncontrolledSprite[] = [];
  updateTimer?: NodeJS.Timeout;
  updateKey: number = timeStamp();

  constructor() {
    this.updateTimer = setInterval(this.update, 33);
  }

  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  addSprite(sprite: Sprite) {
    switch (sprite.movement) {
      case Movement.Controlled:
        const toDeleteIdx = this.controlledSprites.findIndex((s) => s.id === sprite.id);
        if (toDeleteIdx) {
          delete this.controlledSprites[toDeleteIdx];
        }
        this.controlledSprites.push(new ControlledSprite(sprite));
        break;
      case Movement.Uncontrolled:
        this.uncontrolledSprites.push(new UncontrolledSprite(sprite, this.onDone));
        break;
    }
  }

  onDone = (sprite: UncontrolledSprite) => {
    const idx = this.uncontrolledSprites.indexOf(sprite);
    if (idx >= 0) {
      delete this.uncontrolledSprites[idx];
    }
  };

  update = () => {
    this.uncontrolledSprites.forEach((sprite) => {
      sprite.update();
    });
    this.updateKey = timeStamp();
  };
}
