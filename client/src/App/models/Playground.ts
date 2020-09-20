import { Movement, Sprite } from '../../Shared/SharedTypings';
import ControlledSprite from './ControlledSprite';
import UncontrolledSprite from './UncontrolledSprite';
import { timeStamp } from '../SocketData';
import { testControlledSprites, testSprites } from './_TestSprites';
import { IBoundingBox } from './BoundingBox';
import { Sprite as SpriteModel } from './Sprite';

export const REFRESH_RATE = 5;

export class Playground implements IBoundingBox {
  width: number = 100;
  height: number = 100;
  controlledSprites: ControlledSprite[] = [];
  uncontrolledSprites: UncontrolledSprite[] = [];
  updateTimer?: NodeJS.Timeout;
  updateKey: number = timeStamp();
  shiftX: number = 0;
  shiftY: number = 0;

  // onUpdate: (key: number, collisions: [SpriteModel, SpriteModel][]) => void;
  onUpdate: (key: number, collisions: SpriteModel[][]) => void;

  constructor(onUpdate: (timeStamp: number, collisions: SpriteModel[][]) => void) {
    this.updateTimer = setInterval(this.update, REFRESH_RATE);
    this.onUpdate = onUpdate;
    this.uncontrolledSprites.push(...testSprites(this.onDone));
    this.controlledSprites.push(...testControlledSprites());
  }

  get sprites() {
    return [...this.controlledSprites, ...this.uncontrolledSprites];
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
      return sprite.hasNoOverlap(this);
    });
    toRemove.forEach((sprite) => {
      this.onDone(sprite);
    });

    // const collisions: [SpriteModel, SpriteModel][] = [];
    const collisions: SpriteModel[][] = [];

    this.controlledSprites.forEach((sprite) => {
      const overlap = this.sprites.find((s) => {
        return s !== sprite && sprite.hasOverlap(s);
      });
      if (overlap) {
        collisions.push([sprite, overlap]);
      }
    });

    this.updateKey = timeStamp();
    this.onUpdate(this.updateKey, collisions);
  };

  get left() {
    return -this.shiftX;
  }
  get right() {
    return this.shiftX + this.width;
  }
  get top() {
    return this.shiftY + this.height;
  }
  get bottom() {
    return -this.shiftY;
  }

  hasOverlap(other: IBoundingBox): boolean {
    const xOverlap = this.right < other.left || other.right > this.left;
    const yOverlap = this.bottom < other.top || other.bottom > this.top;
    return xOverlap && yOverlap;
  }
}
