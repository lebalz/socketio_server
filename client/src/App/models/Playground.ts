import { Movement, Sprite, SpriteForm } from '../../Shared/SharedTypings';
import ControlledSprite from './ControlledSprite';
import UncontrolledSprite from './UncontrolledSprite';
import { timeStamp } from '../SocketData';

export class Playground {
  width: number = 100;
  height: number = 100;
  controlledSprites: ControlledSprite[] = [
  ];
  uncontrolledSprites: UncontrolledSprite[] = [];
  updateTimer?: NodeJS.Timeout;
  updateKey: number = timeStamp();
  shiftX: number = 0;
  shiftY: number = 0;
  onUpdate: (key: number) => void;

  constructor(onUpdate: (key: number) => void) {
    this.updateTimer = setInterval(this.update, 33);
    this.onUpdate = onUpdate;
    this.uncontrolledSprites.push(
      new UncontrolledSprite(
        {
          color: 'red',
          direction: [1, 1],
          form: SpriteForm.Round,
          height: 10,
          width: 10,
          id: 'bubble',
          movement: Movement.Uncontrolled,
          pos_x: 0,
          pos_y: 0,
          speed: 1,
        },
        this.onDone
      ),
      new UncontrolledSprite(
        {
          color: 'blue',
          direction: [1, 1],
          form: SpriteForm.Round,
          height: 10,
          width: 10,
          id: 'bubble',
          movement: Movement.Uncontrolled,
          pos_x: 0,
          pos_y: 0,
          speed: 0.5,
        },
        this.onDone
      ),
      new UncontrolledSprite(
        {
          color: 'green',
          direction: [1, 1],
          form: SpriteForm.Round,
          height: 10,
          width: 10,
          id: 'bubble',
          movement: Movement.Uncontrolled,
          pos_x: 0,
          pos_y: 0,
          speed: 0.25,
        },
        this.onDone
      ),
      new UncontrolledSprite(
        {
          color: 'yellow',
          direction: [1, 1],
          form: SpriteForm.Round,
          height: 10,
          width: 10,
          id: 'bubble',
          movement: Movement.Uncontrolled,
          pos_x: 0,
          pos_y: 0,
          speed: 0.125,
        },
        this.onDone
      ),
      new UncontrolledSprite(
        {
          color: 'orange',
          direction: [1, 1],
          form: SpriteForm.Round,
          height: 10,
          width: 10,
          id: 'bubble',
          movement: Movement.Uncontrolled,
          pos_x: 0,
          pos_y: 0,
          speed: 0.0625,
        },
        this.onDone
      )
    );
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
    const toRemove = this.uncontrolledSprites.filter((sprite) => {
      return sprite.isOutside(
        this.shiftX,
        this.height,
        this.width,
        this.shiftY
      );
    });
    toRemove.forEach((sprite) => {
      this.onDone(sprite);
    });

    this.updateKey = timeStamp();
    this.onUpdate(this.updateKey);
  };
}
