import { Playground } from './Playground';
import { action, computed, observable } from 'mobx';
import { SocketAudio, AudioFormats } from '../../Shared/SharedTypings';
export default class Audio {
    id: string;
    playground: Playground;
    name: string;
    rawAudio: ArrayBuffer;
    type: AudioFormats;
    playing = observable<Audio>([]);
    volume: number;
    repeat: boolean;

    constructor(
        playground: Playground,
        audio: SocketAudio,
        id: string | undefined = undefined,
        repeat: boolean = false
    ) {
        this.playground = playground;
        this.rawAudio = audio.audio;
        this.name = audio.name;
        this.type = audio.type;
        this.id = id ?? 'root';
        this.volume = audio.volume ?? 0.8;
        this.repeat = repeat;
    }

    @computed
    get audioData() {
        return window.URL.createObjectURL(new Blob([this.rawAudio], { type: `audio/${this.type}` }));
    }

    @action
    play(id: string, repeat?: boolean, volume?: number) {
        this.playing.push(
            new Audio(
                this.playground,
                { audio: this.rawAudio, name: this.name, type: this.type, volume: volume },
                id,
                repeat
            )
        );
    }

    @action
    stop(id?: string) {
        if (this.id !== 'root' || id === 'root') {
            return;
        }
        const audio = this.playing.find((a) => a.id === id);
        if (audio) {
            this.playing.remove(audio);
        }
    }
    @action
    stopAll() {
        this.playing.clear();
    }
}
