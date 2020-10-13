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

    onClick = () => {
        if (this.props.sprite.clickable) {
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
        const { height, posX, posY, width, color, imageBase64, rotate } = this.props.sprite;
        return (
            <div
                style={{
                    width: width * scaleX,
                    height: height * scaleX,
                    backgroundColor: color,
                    left: (posX - this.shiftX) * scaleX,
                    bottom: (posY - this.shiftY) * scaleX,
                    lineHeight: `${height * scaleX}px`,
                    filter: this.state.isClicked ? 'brightness(85%)' : undefined,
                    transform: rotate ? `rotate(${rotate}deg)` : undefined,
                }}
                className={cls}
                onClick={this.onClick}
            >
                <ImageAndText text={this.props.sprite.text} image={imageBase64} />
            </div>
        );
    }
}

interface ITProps {
    image?: string;
    text?: string;
}

const ImageAndText = (props: ITProps) => {
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
                <svg style={{ width: '95%', height: '95%', margin: '2.5%', baselineShift: '50%' }}>
                    <text x="48%" y="52%" dominantBaseline="middle" textAnchor="middle">
                        {props.text}
                    </text>
                </svg>
            )}
        </div>
    );
};

export default Sprite;
