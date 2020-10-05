import { action, observable } from 'mobx';
import { DataType, SpriteCollision } from 'src/Shared/SharedTypings';
import { timeStamp } from '../stores/socket_data_store';
import { Sprite } from './Sprite';

export default class ControlledSprite extends Sprite {
    overlaps = observable.set<Sprite>();

    @action
    reportCollisions(overlaps: Set<Sprite>) {
        if (this.overlaps.size === 0 && overlaps.size === 0) {
            return;
        }
        const reportIn = [...overlaps].filter((sprite) => !this.overlaps.has(sprite));
        const reportOut = [...this.overlaps].filter((sprite) => !overlaps.has(sprite));
        const ts = timeStamp();
        reportIn.forEach((sprite) => {
            if (sprite.id === this.id) {
                return;
            }
            this.overlaps.add(sprite);
            this.socket.emitData<SpriteCollision>({
                type: DataType.SpriteCollision,
                sprites: [
                    { id: this.id, movement: this.movement },
                    { id: sprite.id, movement: sprite.movement },
                ],
                time_stamp: ts,
                overlap: 'in',
            });
        });
        reportOut.forEach((sprite) => {
            if (this.overlaps.delete(sprite)) {
                this.socket.emitData<SpriteCollision>({
                    type: DataType.SpriteCollision,
                    sprites: [
                        { id: this.id, movement: this.movement },
                        { id: sprite.id, movement: sprite.movement },
                    ],
                    time_stamp: ts,
                    overlap: 'out',
                });
            }
        });
    }
}
