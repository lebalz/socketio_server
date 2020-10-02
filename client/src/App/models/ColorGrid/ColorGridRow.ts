import { computed, observable, action } from 'mobx';
import SocketData from '../../SocketData';
import { Grid as GridProps, ColorName, CssColor } from '../../../Shared/SharedTypings';
import { RGB } from '../Color';
import { GridCell } from './ColorGridCell';

export const defaultGrid: GridProps = {
    grid: [
        ['white', 'black'],
        ['black', 'white'],
    ],
};

export class GridRow {
    cells = observable<GridCell>([]);
    socket: SocketData;
    rowIdx: number;
    constructor(
        socket: SocketData,
        rowIdx: number,
        row: (CssColor | undefined)[],
        baseColor?: ColorName | RGB
    ) {
        const cells: GridCell[] = [];
        this.rowIdx = rowIdx;
        this.socket = socket;
        row.forEach((cell, idx) => {
            cells.push(new GridCell(this.socket, [rowIdx, idx], cell, baseColor));
        });
        this.cells.replace(cells);
    }

    @computed
    get activeCells(): GridCell[] {
        return this.cells.filter((cell) => cell.touched);
    }

    @computed
    get size(): number {
        return this.cells.length;
    }

    @action
    updateSize(size: number) {
        if (size < this.size) {
            this.cells.replace(this.cells.slice(0, size));
        } else if (size > this.size) {
            const newCells = [...Array(size - this.size)].map(
                (c, idx) => new GridCell(this.socket, [this.rowIdx, this.size + idx])
            );
            this.cells.push(...newCells);
        }
    }
}
