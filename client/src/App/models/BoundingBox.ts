import { computed, observable } from 'mobx';

interface BoundingBoxProps {
    x: number;
    y: number;
    width: number;
    height: number;
    /**
     * the anchor (center) of the sprite
     * @param x: range from 0 (left) to 1 (right)
     * @param y: range from 0 (bottom) to 1 (top)
     */
    anchor: [x: number, y: number];
}

export interface IBoundingBox {
    right: number;
    left: number;
    top: number;
    bottom: number;
    /**
     * the anchor (center) of the sprite
     * @param x: range from 0 (left) to 1 (right)
     * @param y: range from 0 (bottom) to 1 (top)
     */
    anchor: [x: number, y: number];

    hasOverlap: (other: IBoundingBox) => boolean;
}

export class BoundingBox implements IBoundingBox {
    @observable
    posX: number;
    @observable
    posY: number;
    @observable
    width: number;
    @observable
    height: number;

    /**
     * the anchor (center) of the sprite
     * @param x: range from 0 (left) to 1 (right)
     * @param y: range from 0 (bottom) to 1 (top)
     */
    @observable.ref
    anchor: [x: number, y: number];
    constructor(data: BoundingBoxProps) {
        this.posX = data.x;
        this.posY = data.y;
        this.width = data.width;
        this.height = data.height;
        this.anchor = data.anchor;
    }

    @computed
    get anchorX(): number {
        return this.anchor[0];
    }

    @computed
    get anchorY(): number {
        return this.anchor[1];
    }

    @computed
    get right() {
        return this.posX + (1 - this.anchorX) * this.width;
    }

    @computed
    get top() {
        return this.posY + (1 - this.anchorY) * this.height;
    }

    @computed
    get left() {
        return this.posX - this.anchorX * this.width;
    }

    @computed
    get bottom() {
        return this.posY - this.anchorY * this.height;
    }

    hasOverlap(other: IBoundingBox): boolean {
        if (other === undefined) {
            return false;
        }
        const xOverlap = this.right > other.left && this.left < other.right;
        const yOverlap = this.top > other.bottom && this.bottom < other.top;
        return xOverlap && yOverlap;
    }

    hasNoOverlap(other: IBoundingBox): boolean {
        if (other === undefined) {
            return false;
        }
        if (this.left > other.right || this.right < other.left) {
            return true;
        }
        if (this.bottom > other.top || this.top < other.bottom) {
            return true;
        }
        return false;
    }
}
