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
  posX: number;
  posY: number;
  width: number;
  height: number;
  constructor(data: BoundingBoxProps) {
    this.posX = data.x;
    this.posY = data.y;
    this.width = data.width;
    this.height = data.height;
  }

  get right() {
    return this.posX + this.width;
  }
  get top() {
    return this.posY + this.height;
  }
  get left() {
    return this.posX;
  }
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
