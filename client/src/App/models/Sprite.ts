import { action, computed, observable } from 'mobx';
import {
    SpriteForm,
    Sprite as SpriteProps,
    BorderSide,
    BorderOverlap,
    DataType,
    ColorName,
    SpriteCollision,
} from '../../Shared/SharedTypings';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import { BoundingBox } from './BoundingBox';

class AutoMovement {
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

    currentX: number;
    currentY: number;

    @observable.ref
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
        return ((this.direction[0] !== 0 || this.direction[1] !== 0) && this.speed !== 0) || !this.timeSpan;
    }

    @action
    update(sprite: SpriteProps) {
        if (sprite.pos_x !== undefined) {
            this.initX = sprite.pos_x;
            this.currentX = sprite.pos_x;
            this.startTime = timeStamp();
        }
        if (sprite.pos_y !== undefined) {
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

export default class Sprite extends BoundingBox {
    socket: SocketDataStore;
    borderOverlap?: BorderSide;
    id: string;
    overlaps = observable.set<Sprite>();

    @observable
    collisionDetection: boolean;

    @observable
    form: SpriteForm;

    @observable
    color: string;

    @observable
    clickable: boolean;

    @observable
    text?: string;

    @observable.ref
    autoMovement: AutoMovement;

    constructor(socket: SocketDataStore, sprite: SpriteProps) {
        super({ width: 5, height: 5, ...sprite, x: sprite.pos_x ?? 0, y: sprite.pos_y ?? 0 });
        this.socket = socket;
        this.id = sprite.id;
        this.collisionDetection = sprite.collision_detection ?? false;
        this.autoMovement = new AutoMovement(sprite, this.onPositionChanges, this.done);
        this.form = sprite.form ?? SpriteForm.Rectangle;
        this.color = sprite.color ?? ColorName.Aliceblue;
        this.clickable = !!sprite.clickable;
        this.text = sprite.text;
    }

    done = action(() => {
        this.socket.data?.playground.removeSprite(this.id, true);
    });

    @computed
    get isAutomoving(): boolean {
        return this.autoMovement.isAutomoving;
    }

    reportBorderOverlap(overlap?: BorderSide) {
        if (!overlap) {
            this.borderOverlap = undefined;
            return;
        }
        if (overlap === this.borderOverlap) {
            return;
        }
        this.borderOverlap = overlap;
        this.socket.emitData<BorderOverlap>({
            type: DataType.BorderOverlap,
            id: this.id,
            collision_detection: this.collisionDetection,
            border: overlap,
            x: this.posX,
            y: this.posY,
        });
    }

    onPositionChanges = action((x: number, y: number) => {
        this.posX = x;
        this.posY = y;
    });

    @action
    update(sprite: SpriteProps) {
        if (sprite.id !== this.id) {
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
        if (sprite.clickable !== undefined) {
            this.clickable = sprite.clickable;
        }
        if (sprite.text !== undefined) {
            this.text = sprite.text;
        }
        this.autoMovement.update(sprite);
    }

    @action
    reportCollisions(overlaps: Set<Sprite>) {
        if (this.overlaps.size === 0 && overlaps.size === 0) {
            return;
        }
        const reportIn = [...overlaps].filter((sprite) => !this.overlaps.has(sprite));
        const reportOut = [...this.overlaps].filter((sprite) => !overlaps.has(sprite));
        const ts = timeStamp();
        reportIn.forEach((sprite) => {
            if (sprite.id === this.id) {
                return;
            }
            if (sprite.collisionDetection) {
                sprite.overlaps.add(this);
            }
            this.overlaps.add(sprite);
            this.socket.emitData<SpriteCollision>({
                type: DataType.SpriteCollision,
                sprites: [
                    { id: this.id, collision_detection: this.collisionDetection },
                    { id: sprite.id, collision_detection: sprite.collisionDetection },
                ],
                time_stamp: ts,
                overlap: 'in',
            });
        });
        reportOut.forEach((sprite) => {
            if (this.overlaps.delete(sprite)) {
                if (sprite.collisionDetection) {
                    sprite.overlaps.delete(this);
                }
                this.socket.emitData<SpriteCollision>({
                    type: DataType.SpriteCollision,
                    sprites: [
                        { id: this.id, collision_detection: this.collisionDetection },
                        { id: sprite.id, collision_detection: sprite.collisionDetection },
                    ],
                    time_stamp: ts,
                    overlap: 'out',
                });
            }
        });
    }
}
