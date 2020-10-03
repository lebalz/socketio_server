import { action, observable } from 'mobx';
import {
    Movement,
    SpriteForm,
    Sprite as SpriteProps,
    BorderSide,
    RequiredSpriteBase,
    BorderOverlap,
    DataType,
} from '../../Shared/SharedTypings';
import SocketDataStore from '../stores/socket_data_store';
import { BoundingBox } from './BoundingBox';

export interface ISprite {
    movement: Movement;
    id: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
    form: SpriteForm;
    color: string;
    clickable?: boolean;
    text?: string;
}

export class Sprite extends BoundingBox implements ISprite {
    movement: Movement;
    id: string;
    @observable
    form: SpriteForm;
    @observable
    color: string;
    @observable
    clickable: boolean;
    @observable
    text?: string;
    socket: SocketDataStore;
    borderOverlap?: BorderSide;

    constructor(socket: SocketDataStore, sprite: SpriteProps) {
        super({ ...sprite, x: sprite.pos_x, y: sprite.pos_y });
        this.socket = socket;
        this.id = sprite.id;
        this.movement = sprite.movement;
        this.form = sprite.form;
        this.color = sprite.color;
        this.clickable = !!sprite.clickable;
        this.text = sprite.text;
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
            border: overlap,
            x: this.posX,
            y: this.posY,
        });
    }
    @action
    update(sprite: Partial<SpriteProps> & RequiredSpriteBase) {
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
    }
}
