import { observable, action } from 'mobx';
import SocketData, { timeStamp } from '../../SocketData';
import { ColorName, CssColor, GridPointer, DataType, PointerContext } from '../../../Shared/SharedTypings';
import { RGB, toCssColor } from '../Color';

export class GridCell {
    socket: SocketData;
    rowIdx: number;
    colIdx: number;

    @observable
    rawColor?: CssColor;

    @observable
    color: string;

    @observable
    touched: boolean = false;
    displayedAt?: number;

    constructor(
        socket: SocketData,
        pos: [row: number, col: number],
        color?: CssColor,
        baseColor?: ColorName | RGB
    ) {
        this.rawColor = color;
        this.socket = socket;
        this.rowIdx = pos[0];
        this.colIdx = pos[1];
        this.color = toCssColor(color, baseColor) ?? ColorName.White;
    }

    @action
    update(color?: CssColor, baseColor?: ColorName | RGB) {
        this.displayedAt = undefined;
        this.rawColor = color;
        this.color = toCssColor(color, baseColor) ?? ColorName.White;
    }

    @action
    click() {
        console.log(this.displayedAt);
        this.socket.addData<GridPointer>({
            type: DataType.Pointer,
            context: PointerContext.Grid,
            row: this.rowIdx,
            column: this.colIdx,
            color: this.rawColor,
            displayed_at: this.displayedAt ?? timeStamp(),
        });
        this.touched = true;
    }
}
