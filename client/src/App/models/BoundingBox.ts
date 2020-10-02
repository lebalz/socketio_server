import { computed, observable } from 'mobx';

interface BoundingBoxProps {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IBoundingBox {
    right: number;
    left: number;
    top: number;
    bottom: number;

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
    constructor(data: BoundingBoxProps) {
        this.posX = data.x;
        this.posY = data.y;
        this.width = data.width;
        this.height = data.height;
    }

    @computed
    get right() {
        return this.posX + this.width;
    }
    @computed
    get top() {
        return this.posY + this.height;
    }
    @computed
    get left() {
        return this.posX;
    }
    @computed
    get bottom() {
        return this.posY;
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
