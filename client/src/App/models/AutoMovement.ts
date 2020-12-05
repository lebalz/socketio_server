import { action, computed, observable } from 'mobx';
import { Sprite as SpriteProps } from '../../Shared/SharedTypings';
import { timeStamp } from '../stores/socket_data_store';

export class AutoMovement {
    startTime: number = timeStamp();
    @observable
    speed: number;
    @observable
    distance?: number;
    @observable
    timeSpan?: number;
    @observable
    initX: number;
    @observable
    initY: number;

    @observable
    weight: number = 0;

    currentX: number;
    currentY: number;

    @observable
    direction: [x: number, y: number];

    onDone: () => void;
    onPositionChanged: (x: number, y: number) => void;
    constructor(sprite: SpriteProps, onPositionChanged: (x: number, y: number) => void, onDone: () => void) {
        this.speed = sprite.speed ?? 0;
        this.direction = sprite.direction ?? [0, 0];
        this.initX = sprite.pos_x ?? 0;
        this.initY = sprite.pos_y ?? 0;
        this.currentX = this.initX;
        this.currentY = this.initY;
        this.distance = sprite.distance;
        this.timeSpan = sprite.time_span;
        this.onDone = onDone;
        this.onPositionChanged = onPositionChanged;
    }

    @computed
    get isAutomoving(): boolean {
        return !!this.direction && !!this.speed;
    }

    @action
    update(sprite: SpriteProps) {
        if (sprite.pos_x !== undefined) {
            this.initX = sprite.pos_x;
            this.currentX = sprite.pos_x;
            this.startTime = timeStamp();
        }
        if (sprite.pos_y !== undefined) {
            this.initY = sprite.pos_y;
            this.currentY = sprite.pos_y;
            this.startTime = timeStamp();
        }
        if (sprite.reset_time) {
            this.startTime = timeStamp();
        }
        if (sprite.direction) {
            this.initX = this.currentX;
            this.initY = this.currentY;
            this.startTime = timeStamp();

            this.direction = sprite.direction;
        }
        if (sprite.distance !== undefined) {
            this.distance = sprite.distance;
        }
        if (sprite.speed !== undefined) {
            this.speed = sprite.speed;
        }
    }

    @action
    updatePosition() {
        if (!this.isAutomoving) {
            return;
        }
        if (this.timeSpan && timeStamp() - this.startTime > this.timeSpan) {
            return this.onDone();
        }
        const posX = this.initX + this.direction[0] * this.speed * (timeStamp() - this.startTime) * 10;
        const posY = this.initY + this.direction[1] * this.speed * (timeStamp() - this.startTime) * 10;
        this.currentX = posX;
        this.currentY = posY;
        this.onPositionChanged(posX, posY);
        if (this.distance) {
            const dX = this.initX - posX;
            const dY = this.initY - posY;
            const distance = Math.sqrt(dX * dX + dY * dY);
            if (distance >= this.distance) {
                this.onDone();
            }
        }
    }
}
