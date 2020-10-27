import { Playground } from './Playground';
import { action, computed, observable } from 'mobx';
import { Line as LineProps } from '../../Shared/SharedTypings';
import { santizieColors } from './Sprite';

export default class Line {
    playground: Playground;
    id: string;

    @observable
    color?: string;

    @observable
    x1: number;

    @observable
    y1: number;

    @observable
    x2: number;

    @observable
    y2: number;

    @observable
    rotate?: number;

    @observable
    lineWidth: number;

    @observable
    anchor: number;

    constructor(playground: Playground, sprite: LineProps) {
        this.playground = playground;
        this.id = sprite.id;
        this.x1 = sprite.x1;
        this.y1 = sprite.y1;
        this.x2 = sprite.x2;
        this.y2 = sprite.y2;
        this.color = sprite.color;
        this.lineWidth = sprite.line_width ?? 0.1;
        this.rotate = sprite.rotate;
        this.anchor = sprite.anchor ?? 0;
    }

    @computed
    get length(): number {
        return Math.sqrt(this.width * this.width + this.height * this.height);
    }

    @computed
    get left(): number {
        if (this.x1 === this.x2) {
            return this.x1 - this.lineWidth / 2;
        }
        return Math.min(this.x1, this.x2);
    }

    @computed
    get right(): number {
        if (this.x1 === this.x2) {
            return this.x1 + this.lineWidth / 2;
        }
        return Math.max(this.x1, this.x2);
    }

    @computed
    get top(): number {
        if (this.y1 === this.y2) {
            return this.y1 + this.lineWidth / 2;
        }
        return Math.max(this.y1, this.y2);
    }

    @computed
    get bottom(): number {
        if (this.y1 === this.y2) {
            return this.y1 - this.lineWidth / 2;
        }
        return Math.min(this.y1, this.y2);
    }

    @computed
    get width(): number {
        const width = Math.abs(this.x1 - this.x2);
        if (width < this.lineWidth) {
            return this.lineWidth;
        }
        return width;
    }

    @computed
    get height(): number {
        const height = Math.abs(this.y1 - this.y2);
        if (height < this.lineWidth) {
            return this.lineWidth;
        }
        return height;
    }

    @action
    update(sprite: LineProps) {
        if (sprite.id !== this.id) {
            return;
        }
        if (sprite.x1 !== undefined) {
            this.x1 = sprite.x1;
        }
        if (sprite.x2 !== undefined) {
            this.x2 = sprite.x2;
        }
        if (sprite.y1 !== undefined) {
            this.y1 = sprite.y1;
        }
        if (sprite.y2 !== undefined) {
            this.y2 = sprite.y2;
        }
        if (sprite.anchor !== undefined) {
            this.anchor = sprite.anchor;
        }
        if (sprite.color !== undefined) {
            this.color = santizieColors(sprite.color);
        }
        if (sprite.line_width !== undefined) {
            this.lineWidth = sprite.line_width;
        }
        if (sprite.rotate !== undefined) {
            this.rotate = sprite.rotate;
        }
    }
}
