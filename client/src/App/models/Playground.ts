import { PlaygroundConfig } from './../../Shared/SharedTypings';
import {
    Movement,
    Sprite as SpriteProps,
    SpriteForm,
    UncontrolledSprite as UncontrolledSpriteProps,
    ControlledSprite as ControlledSpriteProps,
} from '../../Shared/SharedTypings';
import ControlledSprite from './ControlledSprite';
import UncontrolledSprite from './UncontrolledSprite';
import { timeStamp } from '../SocketData';
import { IBoundingBox } from './BoundingBox';
import { Sprite as SpriteModel } from './Sprite';

export const REFRESH_RATE = 5;

const DEFAULT_UNCONTROLLED: UncontrolledSpriteProps = {
    id: 'bubble',
    color: 'red',
    direction: [0, 0],
    form: SpriteForm.Rectangle,
    height: 5,
    width: 5,
    pos_x: 0,
    pos_y: 0,
    movement: Movement.Uncontrolled,
    speed: 0,
};
const DEFAULT_CONTROLLED: ControlledSpriteProps = {
    id: 'bubble',
    color: 'red',
    form: SpriteForm.Rectangle,
    movement: Movement.Controlled,
    height: 5,
    width: 5,
    pos_x: 0,
    pos_y: 0,
};

export class Playground implements IBoundingBox {
    width: number = 100;
    height: number = 100;
    controlledSprites: ControlledSprite[] = [];
    uncontrolledSprites: UncontrolledSprite[] = [];
    updateTimer?: NodeJS.Timeout;
    updateKey: number = timeStamp();
    shiftX: number = 50;
    shiftY: number = 50;

    // onUpdate: (key: number, collisions: [SpriteModel, SpriteModel][]) => void;
    onUpdate: (key: number, collisions: SpriteModel[][]) => void;

    onSpriteOut: (id: string) => void;

    constructor(
        onUpdate: (timeStamp: number, collisions: SpriteModel[][]) => void,
        onSpriteOut: (id: string) => void
    ) {
        this.updateTimer = setInterval(this.update, REFRESH_RATE);
        this.onUpdate = onUpdate;
        this.onSpriteOut = onSpriteOut;
        // this.uncontrolledSprites.push(...testSprites(this.onDone));
        // this.controlledSprites.push(...testControlledSprites());
    }

    get sprites() {
        return [...this.controlledSprites, ...this.uncontrolledSprites];
    }

    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = undefined;
        }
    }

    addOrUpdateSprite(sprite: SpriteProps) {
        switch (sprite.movement) {
            case Movement.Controlled:
                const thisSprite = this.controlledSprites.find((s) => s.id === sprite.id);
                if (thisSprite) {
                    thisSprite.update(sprite);
                } else {
                    this.addSprite({ ...DEFAULT_CONTROLLED, ...sprite });
                }
                break;
            case Movement.Uncontrolled:
                this.addSprite({ ...DEFAULT_UNCONTROLLED, ...sprite });
                break;
        }
    }

    addOrUpdateSprites(sprites: SpriteProps[]) {
        sprites.forEach((sprite) => {
            this.addOrUpdateSprite(sprite);
        });
    }

    addSprite(sprite: SpriteProps) {
        switch (sprite.movement) {
            case Movement.Controlled:
                const toDeleteIdx = this.controlledSprites.findIndex((s) => s.id === sprite.id);
                if (toDeleteIdx >= 0) {
                    delete this.controlledSprites[toDeleteIdx];
                }
                this.controlledSprites.push(new ControlledSprite(sprite));
                break;
            case Movement.Uncontrolled:
                this.uncontrolledSprites.push(new UncontrolledSprite(sprite, this.onDone));
                break;
        }
    }

    onDone = (sprite: UncontrolledSprite) => {
        const idx = this.uncontrolledSprites.indexOf(sprite);
        if (idx >= 0) {
            delete this.uncontrolledSprites[idx];
        }
        this.onSpriteOut(sprite.id);
    };

    update = () => {
        this.uncontrolledSprites.forEach((sprite) => {
            sprite.update();
        });
        const toRemove = this.uncontrolledSprites.filter((sprite) => {
            return sprite.hasNoOverlap(this);
        });
        toRemove.forEach((sprite) => {
            this.onDone(sprite);
        });

        // const collisions: [SpriteModel, SpriteModel][] = [];
        const collisions: SpriteModel[][] = [];

        this.controlledSprites.forEach((sprite) => {
            const overlap = this.sprites.find((s) => {
                return s !== sprite && sprite.hasOverlap(s);
            });
            if (overlap) {
                collisions.push([sprite, overlap]);
            }
        });

        this.updateKey = timeStamp();
        this.onUpdate(this.updateKey, collisions);
    };

    updateConfig(config: PlaygroundConfig) {
        this.height = config.height ?? this.height;
        this.width = config.width ?? this.width;
        this.shiftX = config.shift_x ?? this.shiftX;
        this.shiftY = config.shift_y ?? this.shiftY;
    }

    get left() {
        return -this.shiftX;
    }
    get right() {
        return this.shiftX + this.width;
    }
    get top() {
        return this.shiftY + this.height;
    }
    get bottom() {
        return -this.shiftY;
    }

    hasOverlap(other: IBoundingBox): boolean {
        const xOverlap = this.right < other.left || other.right > this.left;
        const yOverlap = this.bottom < other.top || other.bottom > this.top;
        return xOverlap && yOverlap;
    }
}
