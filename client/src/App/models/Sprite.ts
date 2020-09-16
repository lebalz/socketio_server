import { Movement, SpriteForm, Sprite as SpriteProps } from '../../Shared/SharedTypings';

export default class Sprite {
  movement: Movement;
  id: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  form: SpriteForm;
  color: string;
  constructor(sprite: SpriteProps) {
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
