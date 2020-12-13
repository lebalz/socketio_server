import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { DataType, SpriteClicked } from 'src/Shared/SharedTypings';
import { Playground } from '../models/Playground';
import { default as SpriteModel } from '../models/Sprite';
import SocketDataStore from '../stores/socket_data_store';
import ViewStateStore from '../stores/view_state_store';

interface Props {
    sprite: SpriteModel;
    scaleX: number;
}

interface InjectedProps extends Props {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
class Sprite extends React.Component<Props> {
    state = { isClicked: false };
    private _isMounted = false;
    private _timeout?: NodeJS.Timeout;
    get injected() {
        return this.props as InjectedProps;
    }
    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._isMounted = false;
    }
    @computed
    get playground(): Playground | undefined {
        return this.injected.socketDataStore.data?.playground;
    }

    @computed
    get shiftX(): number {
        return this.playground?.shiftX ?? 0;
    }
    @computed
    get shiftY(): number {
        return this.playground?.shiftY ?? 0;
    }

    onDrag = (event: React.DragEvent<HTMLDivElement>) => {
        console.log(event);
    };

    onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (this.props.sprite.clickable) {
            e.stopPropagation();
            this.playground?.socket.emitData<SpriteClicked>({
                type: DataType.SpriteClicked,
                id: this.props.sprite.id,
                text: this.props.sprite.text,
                x: this.props.sprite.posX,
                y: this.props.sprite.posY,
            });
            if (this._timeout) {
                clearTimeout(this._timeout);
            }
            this.setState({ isClicked: true });
            this._timeout = setTimeout(() => {
                if (this._isMounted) {
                    this.setState({ isClicked: false });
                    this._timeout = undefined;
                }
            }, 150);
        }
    };
    render() {
        const { scaleX } = this.props;
        const cls = `sprite ${this.props.sprite.form}`;
        const {
            height,
            left,
            bottom,
            anchorX,
            anchorY,
            width,
            color,
            borderColor,
            borderStyle,
            borderWidth,
            rotate,
            zIndex,
        } = this.props.sprite;
        let borderW = borderWidth ?? 1 / scaleX;
        if (borderW > Math.min(width, height) / 2) {
            borderW = Math.min(width, height) / 2;
        }
        return (
            <div
                style={{
                    width: width * scaleX,
                    height: height * scaleX,
                    backgroundColor: color ? color : this.state.isClicked ? 'gray' : undefined,
                    border: borderColor
                        ? `${borderW * scaleX}px ${borderStyle ?? 'solid'} ${borderColor}`
                        : undefined,
                    left: (left - this.shiftX) * scaleX,
                    bottom: (bottom - this.shiftY) * scaleX,
                    boxSizing: 'border-box',
                    lineHeight: `${height * scaleX}px`,
                    filter: this.state.isClicked ? 'brightness(85%)' : undefined,
                    transform: rotate ? `rotate(${rotate}deg)` : undefined,
                    transformOrigin: rotate ? `${anchorX * 100}% ${(1 - anchorY) * 100}%` : undefined,
                    zIndex: zIndex,
                }}
                className={cls}
                onClick={this.onClick}
                onDrag={this.onDrag}
            >
                <ImageAndText
                    {...this.props.sprite}
                    image={this.props.sprite.imageBase64}
                    center={!!(borderColor || color || this.props.sprite.imageBase64)}
                    scale={scaleX}
                />
            </div>
        );
    }
}

interface ITProps {
    image?: string;
    text?: string;
    fontSize?: number;
    fontColor?: string;
    center?: boolean;
    scale: number;
}

const ImageAndText = (props: ITProps) => {
    const svgStyle: React.CSSProperties = {
        width: 'min-content',
        height: '100%',
        margin: 0,
        fontFamily: 'monospace',
        overflow: 'visible',
        fontSize: props.fontSize ? `${props.fontSize * props.scale}` : undefined,
        fill: props.fontColor,
    };
    if (!props.center && props.text && !props.image) {
        return (
            <svg style={svgStyle}>
                <text x="0" y="90%" textAnchor="start" dominantBaseline="auto">
                    {props.text}
                </text>
            </svg>
        );
    }
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: props.image ? `url('${props.image}')` : undefined,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
            }}
        >
            {props.text && (
                <svg
                    style={{
                        ...svgStyle,
                        width: '95%',
                        height: '95%',
                        margin: '2.5%',
                        baselineShift: '50%',
                    }}
                >
                    <text x="48%" y="52%" dominantBaseline="middle" textAnchor="middle">
                        {props.text}
                    </text>
                </svg>
            )}
        </div>
    );
};

export default Sprite;
