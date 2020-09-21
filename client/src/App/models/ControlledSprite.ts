import { Movement, Sprite as SpriteProps } from 'src/Shared/SharedTypings';
import { Sprite } from './Sprite';

export default class ControlledSprite extends Sprite {
  update(sprite: SpriteProps) {
    if (sprite.movement !== Movement.Controlled || sprite.id !== this.id) {
      return;
    }
    if (sprite.pos_x !== undefined) {
      this.posX = sprite.pos_x;
    }
    if (sprite.pos_y !== undefined) {
      this.posY = sprite.pos_y;
    }
    if (sprite.color !== undefined) {
      this.color = sprite.color;
    }
    if (sprite.form !== undefined) {
      this.form = sprite.form;
    }
    if (sprite.height !== undefined) {
      this.height = sprite.height;
    }
    if (sprite.width !== undefined) {
      this.width = sprite.width;
    }
  }
}
