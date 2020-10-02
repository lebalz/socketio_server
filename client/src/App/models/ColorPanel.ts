import {
    CssColor,
    ColorPanel as ColorPanelProps,
    ColorPointer,
    DataType,
    PointerContext,
} from './../../Shared/SharedTypings';
import SocketData, { timeStamp } from '../SocketData';
import { action, computed, observable } from 'mobx';
import { toCssColor } from './Color';

export const defaultColorPanelMsg: ColorPanelProps = {
    color: 'cyan',
};

export class ColorPanel {
    rawColor: CssColor;
    socket: SocketData;
    displayedAt?: number;
    @observable
    touched: boolean = false;
    id: number = Date.now();
    constructor(data: ColorPanelProps, socket: SocketData) {
        this.rawColor = data.color;
        this.socket = socket;
    }

    @computed
    get color(): string | undefined {
        return toCssColor(this.rawColor);
    }

    @action
    onClick(event: React.PointerEvent<HTMLDivElement>) {
        const rect = (event.target as HTMLDivElement).getBoundingClientRect();
        this.touched = true;
        this.socket.addData<ColorPointer>({
            type: DataType.Pointer,
            context: PointerContext.Color,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            width: rect.width,
            height: rect.height,
            color: this.color || 'white',
            displayed_at: this.displayedAt ?? timeStamp(),
        });
    }
}
