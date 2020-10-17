import { observable, action, computed } from 'mobx';
import SocketDataStore, { timeStamp } from '../../stores/socket_data_store';
import { ColorName, CssColor, GridPointer, DataType, PointerContext } from '../../../Shared/SharedTypings';
import { toCssColor } from '../Color';
import { ColorGrid } from './ColorGrid';

export class GridCell {
    socket: SocketDataStore;
    rowIdx: number;
    colIdx: number;

    @observable.ref
    grid: ColorGrid;

    @observable
    gridIndex: number;

    @observable
    rawColor?: CssColor;

    @observable
    baseColor?: string;

    @observable
    touched: boolean = false;
    displayedAt?: number;

    constructor(
        socket: SocketDataStore,
        pos: [row: number, col: number],
        gridIndex: number,
        grid: ColorGrid,
        color?: CssColor
    ) {
        this.rawColor = color;
        this.gridIndex = gridIndex;
        this.socket = socket;
        this.rowIdx = pos[0];
        this.colIdx = pos[1];
        this.grid = grid;
    }

    @computed
    get color(): string {
        return toCssColor(this.rawColor, this.grid.baseColor) ?? ColorName.White;
    }

    @computed
    get fontColor(): string {
        if (this.baseColor) {
            return this.baseColor;
        }
        return this.color;
    }

    @action
    update(color?: CssColor) {
        this.displayedAt = undefined;
        this.rawColor = color;
    }

    @computed
    get showIndex(): boolean {
        return this.grid.enumerate;
    }

    @action
    click() {
        this.socket.emitData<GridPointer>({
            type: DataType.Pointer,
            context: PointerContext.Grid,
            row: this.rowIdx,
            column: this.colIdx,
            number: this.gridIndex,
            color: this.rawColor,
            displayed_at: this.displayedAt ?? timeStamp(),
        });
        this.touched = true;
    }
}
