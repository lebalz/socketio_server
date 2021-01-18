import React, { Fragment } from 'react';
import { Playground as PlaygroundModel } from '../models/Playground';
import SocketDataStore from '../stores/socket_data_store';
import Sprite from '../components/Sprite';
import Line from '../components/Line';
import AccelerationSensor, { AccelerationData } from '../components/Controls/Sensors/AccelerationSensor';
import GyroSensor, { GyroData } from '../components/Controls/Sensors/GyroSensor';
import { Checkbox } from 'semantic-ui-react';
import { KeyControlListener, KeyData } from '../components/Controls/KeyControls';
import ViewStateStore from '../stores/view_state_store';
import { inject, observer } from 'mobx-react';
import { action, computed, IReactionDisposer, reaction } from 'mobx';
import AudioTrack from '../components/AudioTrack';

type IOverload = {
    (data: AccelerationData): void;
    (data: GyroData): void;
    (data: KeyData): void;
};

interface InjectedProps {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
class Playground extends React.Component {
    containerRef = React.createRef<HTMLDivElement>();
    startDisposer?: IReactionDisposer;
    get injected() {
        return this.props as InjectedProps;
    }

    @computed
    get socket(): SocketDataStore {
        return this.injected.socketDataStore;
    }
    @computed
    get playground(): PlaygroundModel | undefined {
        return this.injected.socketDataStore.data?.playground;
    }
    @computed
    get playgroundState() {
        return this.injected.viewStateStore.playgroundState;
    }

    componentDidMount() {
        const isSilent = !!new URLSearchParams(window.location.search).get('silent');
        this.startDisposer = reaction(
            () => this.playground,
            (pg) => {
                if (pg) {
                    pg.isSilent = isSilent;
                    if (!pg.isRunning) {
                        pg.start();
                    }
                }
            }
        );
        window.addEventListener('resize', this.onResize);
        if (this.playground) {
            this.playground.isSilent = isSilent;
            this.playground.start();
        } else {
            window.addEventListener('click', this.checkRunning);
            console.log('add running checker');
        }
        this.onResize();
    }

    componentWillUnmount() {
        if (this.playground) {
            this.playground.stop();
        }
        if (this.startDisposer) {
            this.startDisposer();
        }
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('click', this.checkRunning);
    }

    checkRunning = () => {
        if (this.playground) {
            if (!this.playground.isRunning) {
                this.playground.start();
            }
            window.removeEventListener('click', this.checkRunning);
        }
    };

    onResize = () => {
        this.playgroundState.innerHeight = window.innerHeight;
        this.playgroundState.innerWidth = window.innerWidth;
    };

    @computed
    get scaleX() {
        if (!this.playground) {
            return 1;
        }
        return this.windowWidth / this.playground.width;
    }

    @computed
    get windowRatio() {
        return this.playgroundState.innerWidth / this.playgroundState.innerHeight;
    }

    @computed
    get widthRatio() {
        if (!this.playground) {
            return 1;
        }
        return this.playground.width / this.playground.height;
    }

    @computed
    get heightRatio() {
        if (!this.playground) {
            return 1;
        }
        return this.playground.height / this.playground.width;
    }

    @computed
    get windowWidth(): number {
        if (this.widthRatio < this.windowRatio) {
            return this.playgroundState.innerHeight * this.widthRatio;
        }
        return this.playgroundState.innerWidth;
    }

    @computed
    get windowHeight(): number {
        if (this.widthRatio < this.windowRatio) {
            return this.playgroundState.innerHeight;
        }
        return this.playgroundState.innerWidth * this.heightRatio;
    }

    onData: IOverload = (data: any) => {
        if (this.playground?.isSilent) {
            return;
        }
        this.socket.emitData(data);
    };

    toggleSimulateSensor = action(() => {
        this.playgroundState.simulateSensor = !this.playgroundState.simulateSensor;
    });

    toggleKeyControls = action(() => {
        this.playgroundState.keyControls = !this.playgroundState.keyControls;
    });

    get canStreamSensors(): boolean {
        return typeof DeviceMotionEvent !== 'undefined' && typeof DeviceOrientationEvent !== 'undefined';
    }

    render() {
        const striped = new URLSearchParams(window.location.search).get('striped');
        const silent = this.playground?.isSilent;
        const noControls =
            silent || striped || new URLSearchParams(window.location.search).get('no_controls');

        return (
            <Fragment>
                <div style={{ display: 'flex', justifyItems: 'flex-start' }}>
                    {!noControls && this.canStreamSensors && (
                        <Fragment>
                            <Checkbox
                                checked={this.playgroundState.simulateSensor}
                                onClick={this.toggleSimulateSensor}
                                label="Simulate Sensors"
                            />
                            <AccelerationSensor
                                simulate={this.playgroundState.simulateSensor}
                                onData={this.onData}
                                on
                            />
                            <GyroSensor
                                simulate={this.playgroundState.simulateSensor}
                                onData={this.onData}
                                on
                            />
                        </Fragment>
                    )}
                    {!this.canStreamSensors && (
                        <p style={{ color: 'orange' }}>Your Browser does not support Sensor Streaming :( </p>
                    )}
                    <KeyControlListener
                        on={noControls ? true : undefined}
                        hideCB={!!noControls}
                        onData={this.onData}
                        preventKeyDefaults={!this.injected.viewStateStore.deviceIdPromptOpen}
                    />
                </div>
                <div
                    className="playground-container"
                    ref={this.containerRef}
                    style={{
                        width: `${this.windowWidth}px`,
                        height: `${this.windowHeight}px`,
                    }}
                >
                    <div
                        className="playground"
                        style={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: `${100 * this.heightRatio}%`,
                            backgroundColor: this.playground?.color,
                            backgroundImage: this.playground?.image
                                ? `url('${this.playground.imageBase64}')`
                                : undefined,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: 'contain',
                        }}
                    >
                        {this.playground?.sprites.map((sprite) => {
                            return (
                                <Sprite sprite={sprite} scaleX={this.scaleX} key={`sprite-${sprite.id}`} />
                            );
                        })}
                        {this.playground?.lines.map((line) => {
                            return <Line line={line} scaleX={this.scaleX} key={`line-${line.id}`} />;
                        })}
                        {this.playground?.trackNames.map((track) => {
                            const audio = this.playground?.audioTracks.get(track);
                            return audio?.playing.map((p, i) => {
                                return <AudioTrack audio={p} key={i} />;
                            });
                        })}
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default Playground;
