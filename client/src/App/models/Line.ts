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

    @observable
    zIndex: number;

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
        this.zIndex = sprite.z_index ?? playground.nextZIndex;
    }

    @computed
    get svgLineProps() {
        const minX = Math.min(this.x1, this.x2);
        const minY = Math.min(this.y1, this.y2);
        let x1 = this.x1 - minX;
        let x2 = this.x2 - minX;
        // svg has origin top left -> flip y1 and y2
        let y1 = this.y2 - minY;
        let y2 = this.y1 - minY;
        const spanX = Math.max(x1, x2);
        const spanY = Math.max(y1, y2);
        // adjust line if lineWidth is bigger than the span
        if (spanX <= this.lineWidth) {
            const remainder = this.lineWidth - spanX;
            const dt = remainder / 2;
            x1 += dt;
            x2 += dt;
        }
        if (spanY < this.lineWidth) {
            const remainder = this.lineWidth - spanY;
            const dt = remainder / 2;
            y1 += dt;
            y2 += dt;
        }

        return { x1, y1, x2, y2 };
    }

    @computed
    get length(): number {
        return Math.sqrt(this.width * this.width + this.height * this.height);
    }

    @computed
    get left(): number {
        const dx = Math.abs(this.x1 - this.x2);
        const min = Math.min(this.x1, this.x2);
        if (dx < this.lineWidth) {
            const remainder = this.lineWidth - dx;
            return min - remainder / 2;
        }
        return min;
    }

    @computed
    get right(): number {
        const dx = Math.abs(this.x1 - this.x2);
        const max = Math.max(this.x1, this.x2);
        if (dx < this.lineWidth) {
            const remainder = this.lineWidth - dx;
            return max + remainder / 2;
        }
        return max;
    }

    @computed
    get top(): number {
        const dy = Math.abs(this.y1 - this.y2);
        const max = Math.max(this.y1, this.y2);
        if (dy < this.lineWidth) {
            const remainder = this.lineWidth - dy;
            return max + remainder / 2;
        }
        return max;
    }

    @computed
    get bottom(): number {
        const dy = Math.abs(this.y1 - this.y2);
        const min = Math.min(this.y1, this.y2);
        if (dy < this.lineWidth) {
            const remainder = this.lineWidth - dy;
            return min - remainder / 2;
        }
        return min;
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
        if (sprite.z_index !== undefined) {
            this.zIndex = sprite.z_index;
        }
    }
}
