import { Movement, SpriteForm, Sprite as SpriteProps } from '../../Shared/SharedTypings';
import { BoundingBox } from './BoundingBox';

export interface ISprite {
  movement: Movement;
  id: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  form: SpriteForm;
  color: string;
}

export class Sprite extends BoundingBox implements ISprite {
  movement: Movement;
  id: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  form: SpriteForm;
  color: string;
  constructor(sprite: SpriteProps) {
    super({ ...sprite, x: sprite.pos_x, y: sprite.pos_y });
    this.id = sprite.id;
    this.movement = sprite.movement;
    this.posX = sprite.pos_x;
    this.posY = sprite.pos_y;
    this.width = sprite.width;
    this.height = sprite.height;
    this.form = sprite.form;
    this.color = sprite.color;
  }
}
