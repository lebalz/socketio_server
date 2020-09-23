import { Grid as GridProps, GridUpdateMsg, ColorName, CssColor } from './../../Shared/SharedTypings';
import { RGB, toCssColor, colorToRgb } from './Color';

export type ColorGrid = (string | undefined)[][];
const DEFAULT_GRID = [['white']];

export class Grid {
    grid: ColorGrid;
    rawColorGrid: CssColor[][];
    baseColor?: RGB;

    constructor(data: GridProps) {
        this.baseColor = typeof data.base_color === 'string' ? colorToRgb(data.base_color) : data.base_color;
        this.rawColorGrid = this.to2dArray(data.grid);
        this.grid = this.sanitize(this.rawColorGrid, this.baseColor);
        this.unifyColumnSizes();
    }

    to2dArray(grid: CssColor[][] | CssColor[] | string): CssColor[][] {
        if (typeof grid === 'string') {
            const colorGrid = grid
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
            return this.to2dArray(colorGrid);
        }
        if (grid.length === 0) {
            return DEFAULT_GRID;
        }
        if (typeof grid[0] === 'string') {
            const colorGrid = (grid as string[]).map((line) => [...line]);
            return this.to2dArray(colorGrid);
        }
        return grid as CssColor[][];
    }

    sanitize(grid: CssColor[][], baseColor: ColorName | RGB = ColorName.Red): ColorGrid {
        return grid.map((line) => line.map((color) => toCssColor(color, baseColor)));
    }

    get columnCount(): number {
        return this.grid[0] ? this.grid[0].length : 0;
    }

    get rowCount(): number {
        return this.grid.length;
    }

    get dimensions(): [row: number, columns: number] {
        return [this.rowCount, this.columnCount];
    }

    rawAt(rowIdx: number, columnIdx: number): CssColor | undefined {
        const row = this.rawColorGrid[rowIdx];
        if (!row) {
            return;
        }
        return row[columnIdx];
    }

    colorAt(rowIdx: number, columnIdx: number): string | undefined {
        const row = this.grid[rowIdx];
        if (!row) {
            return;
        }
        return row[columnIdx];
    }

    update(data: GridUpdateMsg) {
        if (!this.rawColorGrid[data.row]) {
            this.rawColorGrid[data.row] = [];
        }
        if (!this.grid[data.row]) {
            this.grid[data.row] = [];
        }
        this.rawColorGrid[data.row][data.column] = data.color;
        this.grid[data.row][data.column] = toCssColor(data.color, data.base_color ?? this.baseColor);
        this.unifyColumnSizes();
    }

    unifyColumnSizes() {
        const maxColIdx = this.grid.reduce((prev, row) => (prev > row.length ? prev : row.length), -1) - 1;
        if (maxColIdx < 0) {
            return DEFAULT_GRID;
        }
        this.grid.forEach((row) => {
            if (row.length <= maxColIdx) {
                row[maxColIdx] = undefined;
            }
        });
    }
}
