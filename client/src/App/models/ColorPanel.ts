import {
    CssColor,
    ColorPanel as ColorPanelProps,
    ColorPointer,
    DataType,
    PointerContext,
} from './../../Shared/SharedTypings';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import { action, computed, observable } from 'mobx';
import { toCssColor } from './Color';

export const defaultColorPanelMsg: ColorPanelProps = {
    color: 'cyan',
};

export class ColorPanel {
    rawColor: CssColor;
    socket: SocketDataStore;
    displayedAt?: number;
    @observable
    touched: boolean = false;
    id: number = Date.now();
    constructor(data: ColorPanelProps, socket: SocketDataStore) {
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
        this.socket.emitData<ColorPointer>({
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

    @action
    setTouched(touched: boolean) {
        this.touched = touched;
    }
}
