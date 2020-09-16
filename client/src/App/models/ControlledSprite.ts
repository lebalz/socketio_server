import { ControlledSprite as ControlledSpriteProps } from '../../Shared/SharedTypings';
import Sprite from './Sprite';

export default class ControlledSprite extends Sprite {
  constructor(sprite: ControlledSpriteProps) {
    super(sprite);
  }
}
