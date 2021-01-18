import React from 'react';
import { default as AudioModel } from '../models/Audio';

interface Props {
    audio: AudioModel;
}

class AudioTrack extends React.Component<Props> {
    audioRef = React.createRef<HTMLAudioElement>();

    componentDidMount() {
        if (this.audioRef.current) {
            const name = this.props.audio.name;
            try {
                this.audioRef.current.pause();
                this.audioRef.current.src = this.props.audio.audioData;
                this.audioRef.current.volume = this.props.audio.volume;
                const playPromise = this.audioRef.current.play();
                this.audioRef.current.onended = this.onEnded;
                // In browsers that don’t yet support this functionality,
                // playPromise won’t be defined.
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log(`play ${name}`);
                        })
                        .catch((error) => {
                            console.log(`failed to play ${name}:`);
                            console.log(error);
                        });
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    onEnded = (ev: Event) => {
        if (this.props.audio.repeat) {
            this.audioRef.current?.play();
        }
    };

    shouldComponentUpdate(nextProps: Props) {
        return nextProps.audio.id !== this.props.audio.id;
    }

    render() {
        return <audio ref={this.audioRef} />;
    }
}
export default AudioTrack;
