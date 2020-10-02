import { Movement, SpriteForm } from 'src/Shared/SharedTypings';
import SocketData from '../SocketData';
import ControlledSprite from './ControlledSprite';
import UncontrolledSprite from './UncontrolledSprite';

export function testSprites(socket: SocketData, onDone: (sprite: UncontrolledSprite) => void) {
    return [
        new UncontrolledSprite(
            socket,
            {
                color: 'red',
                direction: [1, 1],
                form: SpriteForm.Round,
                height: 10,
                width: 10,
                id: 'bubble1',
                movement: Movement.Uncontrolled,
                pos_x: 0,
                pos_y: 0,
                speed: 5,
                text: '1',
            },
            onDone
        ),
        new UncontrolledSprite(
            socket,
            {
                color: 'blue',
                direction: [1, 1],
                form: SpriteForm.Round,
                height: 10,
                width: 10,
                id: 'bubble2',
                movement: Movement.Uncontrolled,
                pos_x: 0,
                pos_y: 0,
                speed: 4,
                text: '2',
            },
            onDone
        ),
        new UncontrolledSprite(
            socket,
            {
                color: 'green',
                direction: [1, 1],
                form: SpriteForm.Round,
                height: 10,
                width: 10,
                id: 'bubble3',
                movement: Movement.Uncontrolled,
                pos_x: 0,
                pos_y: 0,
                speed: 3,
                text: '3',
            },
            onDone
        ),
        new UncontrolledSprite(
            socket,
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
                text: '4',
            },
            onDone
        ),
        new UncontrolledSprite(
            socket,
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
                clickable: true,
                text: '5',
            },
            onDone
        ),
    ];
}

export function testControlledSprites(socket: SocketData) {
    return [
        new ControlledSprite(socket, {
            color: 'red',
            form: SpriteForm.Rectangle,
            height: 10,
            width: 10,
            id: 'control1',
            movement: Movement.Controlled,
            pos_x: 25,
            pos_y: 25,
        }),
        new ControlledSprite(socket, {
            color: 'red',
            form: SpriteForm.Round,
            height: 10,
            width: 10,
            id: 'control2',
            movement: Movement.Controlled,
            pos_x: 0,
            pos_y: 0,
            clickable: true,
            text: '2',
        }),
    ];
}
