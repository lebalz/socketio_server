import { computed, observable, action } from 'mobx';
import SocketData from '../../SocketData';
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
    baseColor?: RGB;
    socket: SocketData;
    @observable
    displayedAt?: number;

    constructor(data: GridProps, socket: SocketData) {
        this.socket = socket;
        this.baseColor = typeof data.base_color === 'string' ? colorToRgb(data.base_color) : data.base_color;
        const rawColorGrid = unifyColumnSizes(to2dArray(data.grid));
        const rows: GridRow[] = [];
        rawColorGrid.forEach((row, idx) => {
            rows.push(new GridRow(this.socket, idx, row, this.baseColor));
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
        if (this.columnCount <= data.column) {
            this.rows.forEach((row) => row.updateSize(data.column + 1));
        }
        if (this.rowCount <= data.row) {
            const toAdd = data.row + 1 - this.rowCount;
            const rows = [...Array(toAdd)].map(
                (_, idx) =>
                    new GridRow(this.socket, this.rowCount + idx, [...Array<undefined>(this.columnCount)])
            );
            this.rows.push(...rows);
        }
        this.rows[data.row].cells[data.column].update(data.color, data.base_color ?? this.baseColor);
    }
}
