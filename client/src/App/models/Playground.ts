import {
    BorderSide,
    DataType,
    PlaygroundConfig,
    RequiredSpriteBase,
    SpriteOut,
} from './../../Shared/SharedTypings';
import {
    Movement,
    SpriteForm,
    Sprite as SpriteProps,
    UncontrolledSprite as UncontrolledSpriteProps,
    ControlledSprite as ControlledSpriteProps,
} from '../../Shared/SharedTypings';
import ControlledSprite from './ControlledSprite';
import UncontrolledSprite from './UncontrolledSprite';
import SocketDataStore from '../stores/socket_data_store';
import { IBoundingBox } from './BoundingBox';
import { Sprite } from './Sprite';
import { action, computed, observable } from 'mobx';

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
    @observable
    width: number = 100;
    @observable
    height: number = 100;
    @observable
    shiftX: number = -50;
    @observable
    shiftY: number = -50;

    controlledSprites = observable<ControlledSprite>([]);
    uncontrolledSprites = observable<UncontrolledSprite>([]);

    socket: SocketDataStore;
    updateTimer?: NodeJS.Timeout;

    constructor(socket: SocketDataStore) {
        this.socket = socket;
        // this.controlledSprites.push(...testControlledSprites(socket));
        // this.uncontrolledSprites.push(...testSprites(socket, this.onSpriteDone));
    }

    @computed
    get sprites() {
        return [...this.controlledSprites, ...this.uncontrolledSprites];
    }

    start() {
        this.updateTimer = setInterval(this.update, REFRESH_RATE);
    }

    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = undefined;
        }
    }

    @action
    addOrUpdateSprite(sprite: Partial<SpriteProps> & RequiredSpriteBase) {
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
                const uncSprite = this.uncontrolledSprites.find((s) => s.id === sprite.id);
                if (uncSprite) {
                    uncSprite.update(sprite);
                } else {
                    this.addSprite({ ...DEFAULT_UNCONTROLLED, ...sprite });
                }
                break;
        }
    }

    @action
    removeSprite(id: string) {
        const sprite = this.sprites.find((s) => s.id === id);
        if (!sprite) {
            return;
        }
        if (sprite.movement === Movement.Controlled) {
            this.controlledSprites.remove(sprite as ControlledSprite);
        } else if (sprite.movement === Movement.Uncontrolled) {
            this.uncontrolledSprites.remove(sprite as UncontrolledSprite);
        }
    }

    @action
    addOrUpdateSprites(...sprites: (Partial<SpriteProps> & RequiredSpriteBase)[]) {
        sprites.forEach((sprite) => {
            this.addOrUpdateSprite(sprite);
        });
    }

    @action
    addSprite(sprite: SpriteProps) {
        switch (sprite.movement) {
            case Movement.Controlled:
                const toDelete = this.controlledSprites.find((s) => s.id === sprite.id);
                if (toDelete) {
                    this.controlledSprites.remove(toDelete);
                }
                this.controlledSprites.push(new ControlledSprite(this.socket, sprite));
                break;
            case Movement.Uncontrolled:
                const toDeleteU = this.uncontrolledSprites.find((s) => s.id === sprite.id);
                if (toDeleteU) {
                    this.uncontrolledSprites.remove(toDeleteU);
                }
                this.uncontrolledSprites.push(new UncontrolledSprite(this.socket, sprite, this.onSpriteDone));
                break;
        }
    }

    @action
    clearSprites() {
        this.uncontrolledSprites.clear();
        this.controlledSprites.clear();
    }

    onSpriteDone = action((sprite: UncontrolledSprite) => {
        this.uncontrolledSprites.remove(sprite);
        this.socket.emitData<SpriteOut>({
            type: DataType.SpriteOut,
            sprite_id: sprite.id,
        });
    });

    update = action(() => {
        this.uncontrolledSprites.slice().forEach((sprite) => {
            sprite.updatePosition();
            if (sprite.hasNoOverlap(this)) {
                this.onSpriteDone(sprite);
            } else {
                sprite.reportBorderOverlap(this.borderOverlap(sprite));
            }
        });

        this.controlledSprites.forEach((sprite) => {
            const overlaps = this.sprites.filter((s) => {
                return s !== sprite && sprite.hasOverlap(s);
            });
            sprite.reportCollisions(new Set<Sprite>(overlaps));
            sprite.reportBorderOverlap(this.borderOverlap(sprite));
        });
    });

    @action
    updateConfig(config: PlaygroundConfig) {
        if (!config) {
            return;
        }
        this.height = config.height ?? this.height;
        this.width = config.width ?? this.width;
        this.shiftX = config.shift_x ?? this.shiftX;
        this.shiftY = config.shift_y ?? this.shiftY;
    }

    @computed
    get left() {
        return this.shiftX;
    }
    @computed
    get right() {
        return this.width + this.shiftX;
    }
    @computed
    get top() {
        return this.height + this.shiftY;
    }
    @computed
    get bottom() {
        return this.shiftY;
    }

    hasOverlap(other: IBoundingBox): boolean {
        const xOverlap = this.right < other.left || other.right > this.left;
        const yOverlap = this.bottom < other.top || other.bottom > this.top;
        return xOverlap && yOverlap;
    }

    borderOverlap(other: IBoundingBox): BorderSide | undefined {
        if (other === undefined) {
            return;
        }
        if (other.left < this.left) {
            return BorderSide.Left;
        }
        if (this.right < other.right) {
            return BorderSide.Right;
        }
        if (this.top < other.top) {
            return BorderSide.Top;
        }
        if (other.bottom < this.bottom) {
            return BorderSide.Bottom;
        }
    }
}
