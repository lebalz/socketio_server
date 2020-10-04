import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { DataType, SpriteClicked } from 'src/Shared/SharedTypings';
import { Playground } from '../models/Playground';
import { ISprite } from '../models/Sprite';
import SocketDataStore from '../stores/socket_data_store';
import ViewStateStore from '../stores/view_state_store';

interface Props {
    sprite: ISprite;
    scaleX: number;
}

interface InjectedProps extends Props {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
class Sprite extends React.Component<Props> {
    get injected() {
        return this.props as InjectedProps;
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

    state = { clicked: false };
    onClick = () => {
        if (this.props.sprite.clickable) {
            this.playground?.socket.emitData<SpriteClicked>({
                type: DataType.SpriteClicked,
                sprite_id: this.props.sprite.id,
                text: this.props.sprite.text,
                x: this.props.sprite.posX,
                y: this.props.sprite.posY,
            });
        }
    };
    render() {
        const { scaleX } = this.props;
        const cls = `sprite ${this.props.sprite.form}`;
        const { height, posX, posY, width, color } = this.props.sprite;
        return (
            <div
                style={{
                    width: width * scaleX,
                    height: height * scaleX,
                    background: color,
                    left: (posX - this.shiftX) * scaleX,
                    bottom: (posY - this.shiftY) * scaleX,
                    lineHeight: `${height * scaleX}px`,
                }}
                className={cls}
                onClick={this.onClick}
            >
                {this.props.sprite.text && (
                    <svg style={{ width: '95%', height: '95%', margin: '2.5%', baselineShift: '50%' }}>
                        <text x="48%" y="52%" dominantBaseline="middle" textAnchor="middle">
                            {this.props.sprite.text}
                        </text>
                    </svg>
                )}
            </div>
        );
    }
}

export default Sprite;
