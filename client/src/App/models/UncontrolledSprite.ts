import { action } from 'mobx';
import {
    UncontrolledSprite as UncontrolledSpriteProps,
    RequiredSpriteBase,
} from '../../Shared/SharedTypings';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import { Sprite } from './Sprite';

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
    constructor(
        socket: SocketDataStore,
        sprite: UncontrolledSpriteProps,
        onDone: (sprite: UncontrolledSprite) => void
    ) {
        super(socket, sprite);
        this.direction = sprite.direction;
        this.speed = sprite.speed;
        this.distance = sprite.distance;
        this.timeSpan = sprite.time_span;
        this.collisionDetection = sprite.collision_detection;
        this.initX = sprite.pos_x;
        this.initY = sprite.pos_y;
        this.onDone = onDone;
    }

    @action
    update(sprite: Partial<UncontrolledSpriteProps> & RequiredSpriteBase) {
        super.update(sprite);
        if (sprite.reset_time) {
            this.startTime = timeStamp();
        }
        if (sprite.direction) {
            this.direction = sprite.direction;
        }
        if (sprite.distance !== undefined) {
            this.distance = sprite.distance;
        }
        if (sprite.speed !== undefined) {
            this.speed = sprite.speed;
        }
        if (sprite.collision_detection) {
            this.collisionDetection = sprite.collision_detection;
        }
    }

    @action
    updatePosition() {
        if (this.timeSpan && timeStamp() - this.startTime > this.timeSpan) {
            return this.onDone(this);
        }
        this.posX = this.initX + this.direction[0] * this.speed * (timeStamp() - this.startTime) * 10;
        this.posY = this.initY + this.direction[1] * this.speed * (timeStamp() - this.startTime) * 10;
        if (this.distance) {
            const dX = this.initX - this.posX;
            const dY = this.initY - this.posY;
            const distance = Math.sqrt(dX * dX + dY * dY);
            if (distance >= this.distance) {
                this.onDone(this);
            }
        }
    }
}
