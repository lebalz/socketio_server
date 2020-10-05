import { SpriteForm } from 'src/Shared/SharedTypings';
import SocketDataStore from '../stores/socket_data_store';
import Sprite from './Sprite';

export function testSprites(socket: SocketDataStore): Sprite[] {
    return [
        new Sprite(socket, {
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
        new Sprite(socket, {
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
        new Sprite(socket, {
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
        new Sprite(socket, {
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
        new Sprite(socket, {
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

export function testCollisionDetectedSprites(socket: SocketDataStore): Sprite[] {
    return [
        new Sprite(socket, {
            color: 'red',
            form: SpriteForm.Rectangle,
            height: 10,
            width: 10,
            id: 'control1',
            collision_detection: true,
            pos_x: 25,
            pos_y: 25,
        }),
        new Sprite(socket, {
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
