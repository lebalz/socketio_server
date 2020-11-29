import {
    BorderSide,
    ColorName,
    DataType,
    PlaygroundConfig,
    SpriteRemoved,
    SocketImage,
    SpriteOut,
    ImageFormats,
} from './../../Shared/SharedTypings';
import { Sprite as SpriteProps, Line as LineProps } from '../../Shared/SharedTypings';
import Sprite from './Sprite';
import Line from './Line';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import { IBoundingBox } from './BoundingBox';
import { action, computed, observable } from 'mobx';

export const REFRESH_RATE = 5;

const IMG_CONTENT_TYPE: { [key in ImageFormats]: string } = {
    [ImageFormats.JPEG]: 'jpeg',
    [ImageFormats.JPG]: 'jpg',
    [ImageFormats.PNG]: 'png',
    [ImageFormats.SVG]: 'svg+xml',
};
const IMG_ENCODING: { [key in ImageFormats]: string } = {
    [ImageFormats.JPEG]: 'base64',
    [ImageFormats.JPG]: 'base64',
    [ImageFormats.PNG]: 'base64',
    [ImageFormats.SVG]: 'utf8',
};

function toBase64(data: SocketImage) {
    const enc = IMG_ENCODING[data.type];
    let rawImg = '';
    if (data.type === ImageFormats.SVG) {
        rawImg = encodeURIComponent(data.image);
    } else {
        rawImg = Buffer.from(data.image).toString('base64');
    }
    return `data:image/${IMG_CONTENT_TYPE[data.type]};${enc},${rawImg}`;
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
    @observable
    isMounted: boolean = false;

    @observable
    image?: string;

    _zIndex: number = 0;

    anchor: [x: number, y: number] = [0, 0];

    images = observable.map<string, string>();

    sprites = observable<Sprite>([]);
    lines = observable<Line>([]);

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

    get nextZIndex(): number {
        this._zIndex += 1;
        return this._zIndex;
    }

    start() {
        this.updateTimer = setInterval(this.update, REFRESH_RATE);
    }

    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = undefined;
        }
        this._zIndex = 0;
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
            this.socket.emitData<SpriteRemoved>({
                type: DataType.SpriteRemoved,
                id: sprite.id,
            });
        }
    }

    @action
    removeLine(id: string) {
        const line = this.lines.find((s) => s.id === id);
        if (!line) {
            return;
        }
        this.lines.remove(line);
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

    @action
    addOrUpdateLine(line: LineProps) {
        const thisLine = this.lines.find((s) => s.id === line.id);
        if (thisLine) {
            thisLine.update(line);
        } else {
            this.addLine(line);
        }
    }

    @action
    addOrUpdateLines(...lines: LineProps[]) {
        lines.forEach((line) => {
            this.addOrUpdateLine(line);
        });
    }

    @action
    addLine(line: LineProps) {
        const toDelete = this.lines.find((s) => s.id === line.id);
        if (toDelete) {
            this.lines.remove(toDelete);
        }
        this.lines.push(new Line(this, line));
    }

    @computed
    get imageBase64(): string | undefined {
        if (!this.image) {
            return undefined;
        }
        return this.images.get(this.image);
    }

    @action
    clearLines() {
        this.lines.clear();
    }

    update = action(() => {
        this.sprites.forEach((sprite) => {
            if (sprite.isAutomoving) {
                sprite.autoMovement.updatePosition();
            }
            const hasOverlap = sprite.hasOverlap(this);
            if (hasOverlap) {
                if (sprite.isInactive) {
                    sprite.setActive();
                }
                sprite.reportBorderOverlap(this.borderOverlap(sprite));
            } else {
                if (sprite.isInactive && timeStamp() - sprite.inactiveSince! > 2) {
                    sprite.done();
                } else {
                    sprite.setInactive();
                }
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
        if (config.image !== undefined) {
            this.image = config.image;
        }
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

    @action
    reportSpriteOut(id: string) {
        this.socket.emitData<SpriteOut>({
            type: DataType.SpriteOut,
            id: id,
        });
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
