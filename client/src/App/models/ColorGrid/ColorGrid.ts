import { computed, observable, action } from 'mobx';
import SocketDataStore from '../../stores/socket_data_store';
import { Grid as GridProps, GridUpdateMsg, CssColor } from '../../../Shared/SharedTypings';
import { RGB, colorToRgb } from '../Color';
import { GridRow } from './ColorGridRow';
import { GridCell } from './ColorGridCell';

const DEFAULT_GRID = [['white']];

export const defaultGrid: GridProps = {
    grid: [
        ['white', 'black'],
        ['black', 'white'],
    ],
};

const to2dArray = (grid: CssColor[][] | CssColor[] | string): CssColor[][] => {
    if (typeof grid === 'string') {
        const colorGrid = grid
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        return to2dArray(colorGrid);
    }
    if (grid.length === 0) {
        return DEFAULT_GRID;
    }
    if (typeof grid[0] === 'string') {
        const colorGrid = (grid as string[]).map((line) => [...line]);
        return to2dArray(colorGrid);
    }
    if (typeof grid[0] !== 'object') {
        return [grid] as CssColor[][];
    }
    return grid as CssColor[][];
};

const unifyColumnSizes = (grid: CssColor[][]) => {
    const maxColIdx = grid.reduce((prev, row) => (prev > row.length ? prev : row.length), -1) - 1;
    if (maxColIdx < 0) {
        return DEFAULT_GRID;
    }
    const unified: (CssColor | undefined)[][] = [];
    grid.forEach((row) => {
        const uniRow = row.slice() as (CssColor | undefined)[];
        if (uniRow.length <= maxColIdx) {
            uniRow[maxColIdx] = undefined;
        }
        unified.push(uniRow);
    });
    return unified;
};

export class ColorGrid {
    rows = observable<GridRow>([]);

    @observable
    baseColor?: RGB;
    socket: SocketDataStore;
    @observable
    displayedAt?: number;
    @observable
    enumerate: boolean;

    constructor(data: GridProps, socket: SocketDataStore) {
        this.socket = socket;
        this.baseColor = typeof data.base_color === 'string' ? colorToRgb(data.base_color) : data.base_color;
        const rawColorGrid = unifyColumnSizes(to2dArray(data.grid));
        const rows: GridRow[] = [];
        this.enumerate = !!data.enumerate;
        rawColorGrid.forEach((row, idx) => {
            rows.push(new GridRow(this.socket, idx, row, this));
        });
        this.rows.replace(rows);
    }

    @computed
    get columnCount(): number {
        if (this.rowCount === 0) {
            return 0;
        }
        return this.rows[0].size;
    }

    @computed
    get activeCells(): GridCell[] {
        return this.rows.reduce((previous, row) => [...previous, ...row.activeCells], [] as GridCell[]);
    }

    @computed
    get rowCount(): number {
        return this.rows.length;
    }

    get dimensions(): [row: number, columns: number] {
        return [this.rowCount, this.columnCount];
    }

    cellAt(rowIdx: number, columnIdx: number): GridCell | undefined {
        const row = this.rows[rowIdx];
        if (!row) {
            return;
        }
        return row.cells[columnIdx];
    }

    rawAt(rowIdx: number, columnIdx: number): CssColor | undefined {
        return this.cellAt(rowIdx, columnIdx)?.rawColor;
    }

    colorAt(rowIdx: number, columnIdx: number): string | undefined {
        return this.cellAt(rowIdx, columnIdx)?.color;
    }

    @action
    update(data: GridUpdateMsg) {
        this.displayedAt = undefined;
        if (data.base_color !== undefined) {
            this.baseColor =
                typeof data.base_color === 'string' ? colorToRgb(data.base_color) : data.base_color;
        }

        if (data.enumerate !== undefined) {
            this.enumerate = data.enumerate;
        }

        if (data.number === undefined && data.row === undefined) {
            return;
        }

        let row = data.row ?? 0;
        let column = data.column ?? 0;
        if (data.number !== undefined) {
            data.number = data.number - 1;
            row = ~~(data.number / this.columnCount);
            column = data.number % this.columnCount;
        }
        if (this.columnCount <= column) {
            this.rows.forEach((row) => row.updateSize(column + 1));
        }
        if (this.rowCount <= row) {
            const toAdd = row + 1 - this.rowCount;
            const rows = [...Array(toAdd)].map(
                (_, idx) =>
                    new GridRow(
                        this.socket,
                        this.rowCount + idx,
                        [...Array<undefined>(this.columnCount)],
                        this
                    )
            );
            this.rows.push(...rows);
        }
        this.rows[row].cells[column].update(data.color);
    }
}
