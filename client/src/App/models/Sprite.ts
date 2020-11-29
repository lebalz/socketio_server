import { Playground } from './Playground';
import { action, computed, observable } from 'mobx';
import {
    SpriteForm,
    Sprite as SpriteProps,
    BorderSide,
    BorderOverlap,
    DataType,
    SpriteCollision,
} from '../../Shared/SharedTypings';
import { timeStamp } from '../stores/socket_data_store';
import { BoundingBox } from './BoundingBox';

export function santizieColors(color?: string | number): string | undefined {
    if (color === undefined) {
        return undefined;
    }
    if (typeof color === 'number') {
        return undefined;
    }
    if (['', 'invisible', 'unset', 'undefined', 'none'].includes(color.toString().toLowerCase())) {
        return undefined;
    }
    return color;
}

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

export default class Sprite extends BoundingBox {
    playground: Playground;
    borderOverlap?: BorderSide;
    id: string;
    overlaps = observable.set<Sprite>();

    @observable
    _inactiveSince?: number = undefined;

    @observable
    zIndex: number;

    @observable
    collisionDetection: boolean;

    @observable
    form: SpriteForm;

    @observable
    color?: string;

    @observable
    borderColor?: string;

    @observable
    borderWidth?: number;

    @observable
    borderStyle?: string;

    @observable
    clickable: boolean;

    @observable
    text?: string;

    @observable
    fontColor?: string;

    @observable
    fontSize?: number;

    @observable
    image?: string;

    @observable
    rotate?: number;

    @observable.ref
    autoMovement: AutoMovement;

    constructor(playground: Playground, sprite: SpriteProps) {
        super({
            width: sprite.width ?? 5,
            height: sprite.height ?? 5,
            x: sprite.pos_x ?? 0,
            y: sprite.pos_y ?? 0,
            anchor: sprite.anchor ?? [0, 0],
        });
        this.zIndex = sprite.z_index ?? playground.nextZIndex;
        this.playground = playground;
        this.id = sprite.id;
        this.collisionDetection = sprite.collision_detection ?? false;
        this.autoMovement = new AutoMovement(sprite, this.onPositionChanges, this.done);
        this.form = sprite.form ?? SpriteForm.Rectangle;
        if (this.form === SpriteForm.Round && sprite.anchor === undefined) {
            this.anchor = [0.5, 0.5];
        }
        this.color = santizieColors(sprite.color);
        this.borderColor = santizieColors(sprite.border_color);
        this.borderWidth = sprite.border_width;
        this.borderStyle = sprite.border_style;
        this.clickable = !!sprite.clickable;
        this.text = sprite.text;
        this.fontColor = santizieColors(sprite.font_color);
        this.fontSize = sprite.font_size;
        this.image = sprite.image;
        this.rotate = sprite.rotate;
    }

    done = action(() => {
        this.playground.socket.data?.playground.removeSprite(this.id, true);
    });

    @computed
    get isAutomoving(): boolean {
        return this.autoMovement.isAutomoving;
    }

    @computed
    get isInactive(): boolean {
        return !!this._inactiveSince;
    }

    @computed
    get inactiveSince(): number | undefined {
        return this._inactiveSince;
    }

    @action
    setInactive() {
        if (this.isInactive) {
            return;
        }
        this._inactiveSince = timeStamp();
        this.playground.reportSpriteOut(this.id);
    }
    @action
    setActive() {
        this._inactiveSince = undefined;
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
        this.playground.socket.emitData<BorderOverlap>({
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

    @computed
    get imageBase64(): string | undefined {
        if (!this.image) {
            return undefined;
        }
        return this.playground.images.get(this.image);
    }

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
        if (sprite.anchor !== undefined && sprite.anchor.length === 2) {
            this.anchor = sprite.anchor;
        }
        if (sprite.color !== undefined) {
            this.color = santizieColors(sprite.color);
        }
        if (sprite.border_color !== undefined) {
            this.borderColor = santizieColors(sprite.border_color);
        }
        if (sprite.border_width !== undefined) {
            this.borderWidth = sprite.border_width;
        }
        if (sprite.border_style !== undefined) {
            this.borderStyle = sprite.border_style;
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
        if (sprite.rotate !== undefined) {
            this.rotate = sprite.rotate;
        }
        if (sprite.image !== undefined) {
            this.image = sprite.image;
        }
        if (sprite.font_color !== undefined) {
            this.fontColor = santizieColors(sprite.font_color);
        }
        if (sprite.font_size !== undefined) {
            this.fontSize = sprite.font_size;
        }
        if (sprite.z_index !== undefined) {
            this.zIndex = sprite.z_index;
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
            this.playground.socket.emitData<SpriteCollision>({
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
                this.playground.socket.emitData<SpriteCollision>({
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
