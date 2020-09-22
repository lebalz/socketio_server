import React, { Fragment } from 'react';
import { DataType, PlaygroundConfig, SpriteCollision, SpriteMsg, SpriteOut } from 'src/Shared/SharedTypings';
import { Playground as PlaygroundModel } from '../models/Playground';
import { Sprite as SpriteModel } from '../models/Sprite';
import SocketData from '../SocketData';
import Playground from '../components/Playground';
import AccelerationSensor, { AccelerationData } from '../components/Controls/Sensors/AccelerationSensor';
import GyroSensor, { GyroData } from '../components/Controls/Sensors/GyroSensor';
import { Checkbox } from 'semantic-ui-react';
import { KeyControlListener, KeyData } from '../components/Controls/KeyControls';

interface Props {
    socket: SocketData;
}

type IOverload = {
    (data: AccelerationData): void;
    (data: GyroData): void;
    (data: KeyData): void;
};

class PlaygroundContainer extends React.Component<Props> {
    containerRef = React.createRef<HTMLDivElement>();
    playground: PlaygroundModel;
    lastCollisions: string[] = [];
    state = {
        scaleX: 1,
        heightRatio: 1,
        updateKey: 0,
        width: 100,
        height: 100,
        simulateSensor: false,
        keyControls: true,
    };

    onUpdate = (timeStamp: number, collisions: SpriteModel[][]) => {
        this.setState({ updateKey: timeStamp });
        const undetected = this.lastCollisions.slice();
        collisions.forEach((sprites) => {
            const iid = `${sprites[0].id}::::${sprites[1].id}`;
            if (this.lastCollisions.includes(iid)) {
                delete undetected[undetected.indexOf(iid)];
                return;
            }
            this.props.socket.addData<SpriteCollision>({
                type: DataType.SpriteCollision,
                sprite_ids: [sprites[0].id, sprites[1].id],
                time_stamp: timeStamp,
                overlap: 'in',
            });
            this.lastCollisions.push(iid);
        });
        undetected.forEach((un) => {
            const ids = un.split('::::');
            this.props.socket.addData<SpriteCollision>({
                type: DataType.SpriteCollision,
                overlap: 'out',
                time_stamp: timeStamp,
                sprite_ids: [ids[0], ids[1]],
            });
            delete this.lastCollisions[this.lastCollisions.indexOf(un)];
        });
    };

    constructor(props: Props) {
        super(props);
        this.playground = new PlaygroundModel(this.onUpdate, this.onSpriteOut);
    }

    onSpriteOut = (id: string) => {
        this.props.socket.addData<SpriteOut>({
            type: DataType.SpriteOut,
            sprite_id: id,
        });
    };

    componentDidMount() {
        window.addEventListener('resize', this.onResize);
        this.updateSize();
        this.props.socket.onPlaygroundConfig = this.onConfiguration;
        this.props.socket.onSprite = this.onSprite;
        this.props.socket.onSprites = this.onSprites;
    }

    componentWillUnmount() {
        this.playground.stop();
        window.removeEventListener('resize', this.onResize);
        this.props.socket.onSprite = undefined;
        this.props.socket.onSprites = undefined;
        this.props.socket.onPlaygroundConfig = undefined;
    }

    onSprite = (data: SpriteMsg) => {
        this.playground.addOrUpdateSprite(data.sprite);
    };

    onSprites = (sprites: any) => {
        this.playground.addOrUpdateSprites(sprites.sprites);
    };

    onConfiguration = (config: PlaygroundConfig) => {
        this.playground.updateConfig(config);
        this.updateSize();
    };

    onResize = (ev: UIEvent) => {
        this.updateSize();
    };

    updateSize() {
        let { scaleX, heightRatio } = this.state;
        if (this.containerRef.current) {
            scaleX = this.width / this.playground.width;
            heightRatio = this.playground.height / this.playground.width;
        }
        this.setState({
            width: this.width,
            height: this.height,
            scaleX: scaleX,
            heightRatio: heightRatio,
        });
    }

    get windowRatio() {
        return window.innerWidth / window.innerHeight;
    }

    get playgroundRatio() {
        return this.playground.width / this.playground.height;
    }

    get width() {
        if (this.playgroundRatio >= 1) {
            if (this.windowRatio > this.playgroundRatio) {
                return window.innerHeight;
            }
            return window.innerWidth;
        }
        if (this.windowRatio > this.playgroundRatio) {
            return window.innerHeight * this.playgroundRatio;
        }
        return window.innerWidth;
    }

    get height() {
        return this.width / this.playgroundRatio;
    }

    onData: IOverload = (data: any) => {
        this.props.socket.addData(data);
    };

    toggleSimulateSensor = () => {
        const simulate = !this.state.simulateSensor;
        this.setState({ simulateSensor: simulate });
        localStorage.setItem('simulate_sensor', simulate ? 'yes' : 'no');
    };

    toggleKeyControls = () => {
        const keyControls = !this.state.keyControls;
        this.setState({ keyControls: keyControls });
    };

    render() {
        return (
            <Fragment>
                <div style={{ display: 'flex', justifyItems: 'flex-start' }}>
                    <Checkbox
                        checked={this.state.simulateSensor}
                        onClick={this.toggleSimulateSensor}
                        label="Simulate Sensors"
                    />
                    <AccelerationSensor simulate={this.state.simulateSensor} onData={this.onData} on />
                    <GyroSensor simulate={this.state.simulateSensor} onData={this.onData} on />
                    <KeyControlListener onData={this.onData} />
                </div>

                <div
                    className="playground-container"
                    ref={this.containerRef}
                    style={{
                        width: `${this.state.width}px`,
                        height: `${this.state.height}px`,
                    }}
                >
                    <Playground
                        playground={this.playground}
                        scaleX={this.state.scaleX}
                        key={this.state.updateKey}
                        heightRatio={this.state.heightRatio}
                    />
                </div>
            </Fragment>
        );
    }
}

export default PlaygroundContainer;
