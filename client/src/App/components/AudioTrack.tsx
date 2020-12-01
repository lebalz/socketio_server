import React from 'react';
import { default as AudioModel } from '../models/Audio';

interface Props {
    audio: AudioModel;
}

class AudioTrack extends React.Component<Props> {
    audioRef = React.createRef<HTMLAudioElement>();

    componentDidMount() {
        if (this.audioRef.current) {
            this.audioRef.current.pause();
            this.audioRef.current.src = this.props.audio.audioData;
            this.audioRef.current.volume = this.props.audio.volume;
            this.audioRef.current.play();
            this.audioRef.current.onended = this.onEnded;
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
