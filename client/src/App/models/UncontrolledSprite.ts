import { UncontrolledSprite as UncontrolledSpriteProps } from '../../Shared/SharedTypings';
import { timeStamp } from '../SocketData';
import Sprite from './Sprite';

export default class UncontrolledSprite extends Sprite {
  startTime: number = timeStamp();
  direction: number[];
  speed: number;
  distance?: number;
  timeSpan?: number;
  collisionDetection?: boolean;
  initX: number;
  initY: number;
  onDone: (sprite: UncontrolledSprite) => void;
  constructor(sprite: UncontrolledSpriteProps, onDone: (sprite: UncontrolledSprite) => void) {
    super(sprite);
    this.direction = sprite.direction;
    this.speed = sprite.speed;
    this.distance = sprite.distance;
    this.timeSpan = sprite.time_span;
    this.collisionDetection = sprite.collision_detection;
    this.initX = sprite.pos_x;
    this.initY = sprite.pos_y;
    this.onDone = onDone;
  }

  update() {
    if (this.timeSpan && timeStamp() - this.startTime > this.timeSpan) {
      return this.onDone(this);
    }
    this.posX += this.direction[0];
    this.posY += this.direction[1];
  }
}
