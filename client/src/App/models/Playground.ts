import {
    BorderSide,
    ColorName,
    DataType,
    PlaygroundConfig,
    SpriteOut,
    SocketImage,
} from './../../Shared/SharedTypings';
import { Sprite as SpriteProps } from '../../Shared/SharedTypings';
import Sprite from './Sprite';
import SocketDataStore from '../stores/socket_data_store';
import { IBoundingBox } from './BoundingBox';
import { action, computed, observable } from 'mobx';

export const REFRESH_RATE = 5;

function toBase64(data: SocketImage) {
    const base64 = Buffer.from(data.image).toString('base64');
    return `data:image/${data.type};base64,${base64}`;
}

export class Playground implements IBoundingBox {
    @observable
    width: number = 100;
    @observable
    height: number = 100;
    @observable
    shiftX: number = -50;
    @observable
    shiftY: number = -50;
    @observable
    color: string = ColorName.Lightgrey;

    images = observable.map<string, string>();

    sprites = observable<Sprite>([]);

    socket: SocketDataStore;
    updateTimer?: NodeJS.Timeout;

    constructor(socket: SocketDataStore) {
        this.socket = socket;
    }

    @computed
    get collisionDetectedSprites() {
        return this.sprites.filter((s) => s.collisionDetection);
    }

    @computed
    get unDetectedSprites() {
        return this.sprites.filter((s) => !s.collisionDetection);
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

    @computed
    get isRunning(): boolean {
        return !!this.updateTimer;
    }

    @action
    addOrUpdateSprite(sprite: SpriteProps) {
        const thisSprite = this.sprites.find((s) => s.id === sprite.id);
        if (thisSprite) {
            thisSprite.update(sprite);
        } else {
            this.addSprite(sprite);
        }
    }

    @action
    removeSprite(id: string, emit: boolean = false) {
        const sprite = this.sprites.find((s) => s.id === id);
        if (!sprite) {
            return;
        }
        this.sprites.remove(sprite);
        if (emit) {
            this.socket.emitData<SpriteOut>({
                type: DataType.SpriteOut,
                id: sprite.id,
            });
        }
    }

    @action
    addOrUpdateSprites(...sprites: SpriteProps[]) {
        sprites.forEach((sprite) => {
            this.addOrUpdateSprite(sprite);
        });
    }

    @action
    addSprite(sprite: SpriteProps) {
        const toDelete = this.sprites.find((s) => s.id === sprite.id);
        if (toDelete) {
            this.sprites.remove(toDelete);
        }
        this.sprites.push(new Sprite(this, sprite));
    }

    @action
    clearSprites() {
        this.sprites.clear();
    }

    update = action(() => {
        this.sprites.forEach((sprite) => {
            if (sprite.isAutomoving) {
                sprite.autoMovement.updatePosition();
            }
            if (sprite.hasNoOverlap(this)) {
                sprite.done();
            } else {
                sprite.reportBorderOverlap(this.borderOverlap(sprite));
            }
            if (sprite.collisionDetection) {
                const overlaps = this.sprites.filter((s) => {
                    return s !== sprite && sprite.hasOverlap(s);
                });
                sprite.reportCollisions(new Set<Sprite>(overlaps));
            }
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
        this.color = config.color ?? this.color;
        config.images?.forEach((img) => {
            this.images.set(img.name, toBase64(img));
        });
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
