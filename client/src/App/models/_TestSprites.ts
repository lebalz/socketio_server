import { Movement, SpriteForm } from 'src/Shared/SharedTypings';
import ControlledSprite from './ControlledSprite';
import UncontrolledSprite from './UncontrolledSprite';

export function testSprites(onDone: (sprite: UncontrolledSprite) => void) {
  return [
    // new UncontrolledSprite(
    //   {
    //     color: 'red',
    //     direction: [1, 1],
    //     form: SpriteForm.Round,
    //     height: 10,
    //     width: 10,
    //     id: 'bubble1',
    //     movement: Movement.Uncontrolled,
    //     pos_x: 0,
    //     pos_y: 0,
    //     speed: 5,
    //   },
    //   onDone
    // ),
    // new UncontrolledSprite(
    //   {
    //     color: 'blue',
    //     direction: [1, 1],
    //     form: SpriteForm.Round,
    //     height: 10,
    //     width: 10,
    //     id: 'bubble2',
    //     movement: Movement.Uncontrolled,
    //     pos_x: 0,
    //     pos_y: 0,
    //     speed: 4,
    //   },
    //   onDone
    // ),
    // new UncontrolledSprite(
    //   {
    //     color: 'green',
    //     direction: [1, 1],
    //     form: SpriteForm.Round,
    //     height: 10,
    //     width: 10,
    //     id: 'bubble3',
    //     movement: Movement.Uncontrolled,
    //     pos_x: 0,
    //     pos_y: 0,
    //     speed: 3,
    //   },
    //   onDone
    // ),
    new UncontrolledSprite(
      {
        color: 'yellow',
        direction: [1, 1],
        form: SpriteForm.Round,
        height: 10,
        width: 10,
        id: 'bubble4',
        movement: Movement.Uncontrolled,
        pos_x: 0,
        pos_y: 0,
        speed: 2,
      },
      onDone
    ),
    new UncontrolledSprite(
      {
        color: 'orange',
        direction: [1, 1],
        form: SpriteForm.Round,
        height: 10,
        width: 10,
        id: 'bubble5',
        movement: Movement.Uncontrolled,
        pos_x: 0,
        pos_y: 0,
        speed: 1,
      },
      onDone
    ),
  ];
}

export function testControlledSprites() {
  return [
    new ControlledSprite({
      color: 'red',
      form: SpriteForm.Rectangle,
      height: 10,
      width: 10,
      id: 'control1',
      movement: Movement.Controlled,
      pos_x: 45,
      pos_y: 45,
    }),
    new ControlledSprite({
      color: 'red',
      form: SpriteForm.Round,
      height: 10,
      width: 10,
      id: 'control2',
      movement: Movement.Controlled,
      pos_x: 0,
      pos_y: 0,
    }),
  ];
}
