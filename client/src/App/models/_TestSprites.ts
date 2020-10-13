import { Playground } from './Playground';
import { SpriteForm } from 'src/Shared/SharedTypings';
import Sprite from './Sprite';

export function testSprites(playground: Playground): Sprite[] {
    return [
        new Sprite(playground, {
            color: 'red',
            direction: [1, 1],
            form: SpriteForm.Round,
            height: 10,
            width: 10,
            id: 'bubble1',
            pos_x: 0,
            pos_y: 0,
            speed: 5,
            text: '1',
        }),
        new Sprite(playground, {
            color: 'blue',
            direction: [1, 1],
            form: SpriteForm.Round,
            height: 10,
            width: 10,
            id: 'bubble2',
            pos_x: 0,
            pos_y: 0,
            speed: 4,
            text: '2',
        }),
        new Sprite(playground, {
            color: 'green',
            direction: [1, 1],
            form: SpriteForm.Round,
            height: 10,
            width: 10,
            id: 'bubble3',
            pos_x: 0,
            pos_y: 0,
            speed: 3,
            text: '3',
        }),
        new Sprite(playground, {
            color: 'yellow',
            direction: [1, 1],
            form: SpriteForm.Round,
            height: 10,
            width: 10,
            id: 'bubble4',
            pos_x: 0,
            pos_y: 0,
            speed: 2,
            text: '4',
        }),
        new Sprite(playground, {
            color: 'orange',
            direction: [1, 1],
            form: SpriteForm.Round,
            height: 10,
            width: 10,
            id: 'bubble5',
            pos_x: 0,
            pos_y: 0,
            speed: 1,
            clickable: true,
            text: '5',
        }),
    ];
}

export function testCollisionDetectedSprites(playground: Playground): Sprite[] {
    return [
        new Sprite(playground, {
            color: 'red',
            form: SpriteForm.Rectangle,
            height: 10,
            width: 10,
            id: 'control1',
            collision_detection: true,
            pos_x: 25,
            pos_y: 25,
        }),
        new Sprite(playground, {
            color: 'red',
            form: SpriteForm.Round,
            height: 10,
            width: 10,
            id: 'control2',
            collision_detection: true,
            pos_x: 0,
            pos_y: 0,
            clickable: true,
            text: '2',
        }),
    ];
}
