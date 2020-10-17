import { computed, observable, action } from 'mobx';
import SocketDataStore from '../../stores/socket_data_store';
import { Grid as GridProps, CssColor } from '../../../Shared/SharedTypings';
import { GridCell } from './ColorGridCell';
import { ColorGrid } from './ColorGrid';

export const defaultGrid: GridProps = {
    grid: [
        ['white', 'black'],
        ['black', 'white'],
    ],
};

export class GridRow {
    cells = observable<GridCell>([]);
    socket: SocketDataStore;
    rowIdx: number;

    @observable.ref
    grid: ColorGrid;
    constructor(socket: SocketDataStore, rowIdx: number, row: (CssColor | undefined)[], grid: ColorGrid) {
        const cells: GridCell[] = [];
        this.rowIdx = rowIdx;
        this.socket = socket;
        this.grid = grid;
        const colIdx = row.length * rowIdx;
        row.forEach((cell, idx) => {
            cells.push(new GridCell(this.socket, [rowIdx, idx], colIdx + idx + 1, grid, cell));
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
        const colIdx = size * this.rowIdx;
        this.cells.forEach((cell, idx) => {
            cell.gridIndex = colIdx + idx + 1;
        });

        if (size < this.size) {
            this.cells.replace(this.cells.slice(0, size));
        } else if (size > this.size) {
            const newCells = [...Array(size - this.size)].map(
                (c, idx) =>
                    new GridCell(
                        this.socket,
                        [this.rowIdx, this.size + idx],
                        this.size + colIdx + idx + 1,
                        this.grid,
                        undefined
                    )
            );
            this.cells.push(...newCells);
        }
    }
}
