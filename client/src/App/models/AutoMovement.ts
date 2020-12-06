import { action, computed, observable } from 'mobx';
import {
    Sprite as SpriteProps,
    SpriteAutoMovement as SpriteAutoMovementProps,
    AutoMovement as RawAutoMovement,
} from '../../Shared/SharedTypings';
import { timeStamp } from '../stores/socket_data_store';

export class AutoMovement {
    isInitMovement: boolean;
    movements: RawAutoMovement[] = [];
    repeat: number;
    exitOnDone: boolean;

    @observable
    startTime: number = timeStamp();

    @observable
    pausedTime: number = timeStamp();

    movementSequenceSize: number;
    movementsCount: number = 0;
    onDone: (self: AutoMovement) => void;
    fixPosition: () => void;
    constructor(
        sprite: SpriteAutoMovementProps,
        fixPosition: () => void,
        onDone: (self: AutoMovement) => void,
        initMovement: boolean = false
    ) {
        this.onDone = onDone;
        this.fixPosition = fixPosition;
        this.isInitMovement = initMovement;
        if (initMovement) {
            this.movements = sprite.movements;
        } else {
            sprite.movements.forEach((m) => {
                if (
                    ((m.direction[0] !== 0 || m.direction[1] !== 0) && m.speed !== 0) ||
                    (m.time_span && m.time_span > 0)
                ) {
                    this.movements.push(m);
                } else {
                    console.warn('No movement or time_span specified. The movement was removed:', m);
                }
            });
        }
        this.exitOnDone = !!sprite.exit_on_done;
        this.repeat = sprite.cycle ? Infinity : sprite.repeat ?? 1;
        this.movementSequenceSize = sprite.movements.length;
    }

    @computed
    get elapsedTime(): number {
        return timeStamp() - this.startTime;
    }

    @computed
    get movementsCycleCount(): number {
        return Math.floor(this.movementsCount / this.movementSequenceSize);
    }

    get hasMovement(): boolean {
        if (this.movements.length === 0) {
            return false;
        }
        return (
            (this.movements[0].direction[0] !== 0 || this.movements[0].direction[1] !== 0) &&
            this.movements[0].speed !== 0
        );
    }

    get hasNextMovement(): boolean {
        return this.movements.length > 1;
    }

    get isProcessing(): boolean {
        if (this.movements.length === 0) {
            return false;
        }
        if (this.hasMovement) {
            return true;
        }
        if (this.currentMovement?.time_span && this.currentMovement.time_span > 0) {
            return true;
        }
        return false;
    }

    updated(props: Partial<RawAutoMovement>, movementIdx: number = 0): RawAutoMovement {
        const copy: RawAutoMovement = {
            direction: [...this.movements[movementIdx].direction],
            speed: this.movements[movementIdx].speed,
            time_span: this.movements[movementIdx].time_span,
            distance: this.movements[movementIdx].distance,
        };
        for (const [key, value] of Object.entries(props)) {
            if (value !== undefined) {
                (copy as any)[key] = value as any;
            }
        }
        return copy;
    }

    @action
    pause() {
        this.pausedTime = timeStamp();
    }

    @action
    start() {
        if (this.currentMovement?.time_span) {
            const dt = this.pausedTime - this.startTime;
            if (dt > 0) {
                this.currentMovement.time_span -= dt;
            }
        }
        this.startTime = timeStamp();
    }

    @action
    resetTime() {
        this.startTime = timeStamp();
        this.pausedTime = timeStamp();
    }

    get currentMovement(): RawAutoMovement | undefined {
        return this.movements[0];
    }

    @action
    nextMovementInSequence(): RawAutoMovement | undefined {
        if (!this.isProcessing) {
            this.movementSequenceSize = 0;
            this.onDone(this);
            return;
        }
        const current = this.movements[0];
        this.movements.splice(0, 1);

        if (this.movementsCycleCount + 1 < (this.repeat ?? 0)) {
            this.movements.push(current);
        }
        this.resetTime();
        this.fixPosition();
        this.movementsCount += 1;
        if (!this.isProcessing) {
            this.onDone(this);
            return;
        }

        return this.movements[0];
    }
}

export class AutoMovementSequencer {
    @observable
    initX: number;
    @observable
    initY: number;

    currentX: number;
    currentY: number;
    sequences = observable<AutoMovement>([]);

    onDone: () => void;
    onPositionChanged: (x: number, y: number) => void;
    constructor(sprite: SpriteProps, onPositionChanged: (x: number, y: number) => void, onDone: () => void) {
        const movement = new AutoMovement(
            {
                movements: [
                    {
                        direction: sprite.direction ?? [0, 0],
                        speed: sprite.speed ?? 0,
                        distance: sprite.distance,
                        time_span: sprite.time_span,
                    },
                ],
                exit_on_done: true,
            },
            this.fixPosition,
            this.onSequenceFinished,
            true
        );
        movement.start();
        this.sequences.push(movement);
        this.initX = sprite.pos_x ?? 0;
        this.initY = sprite.pos_y ?? 0;
        this.currentX = this.initX;
        this.currentY = this.initY;
        this.onDone = onDone;
        this.onPositionChanged = onPositionChanged;
        if (sprite.movements) {
            const movements = new AutoMovement(
                sprite.movements,
                this.fixPosition,
                this.onSequenceFinished,
                false
            );
            this.sequences.push(movements);
        }
        this.configureAutoMovementState();
    }

    onSequenceFinished = (sequence: AutoMovement) => {
        this.sequences.remove(sequence);
        if (sequence.exitOnDone) {
            this.onDone();
        } else {
            this.currentSequence?.start();
        }
    };

    @computed
    get initMovement(): AutoMovement | undefined {
        for (let i = this.sequences.length - 1; i >= 0; i = i - 1) {
            if (this.sequences[i].isInitMovement) {
                return this.sequences[i];
            }
        }
        return undefined;
    }

    @computed
    get currentSequence(): AutoMovement | undefined {
        if (this.sequences.length > 0) {
            return this.sequences[this.sequences.length - 1];
        }
        return undefined;
    }

    @computed
    get hasActiveMovementSequences(): boolean {
        return this.sequences.length > 0;
    }

    @computed
    get isAutomoving(): boolean {
        return this.hasActiveMovementSequences;
    }

    @action
    configureAutoMovementState() {
        this.fixPosition();
        this.currentSequence?.start();
    }

    @action
    update(sprite: SpriteProps) {
        let direction: [x: number, y: number] | undefined = undefined;
        let speed: number | undefined = undefined;
        let distance: number | undefined = undefined;
        let time_span: number | undefined = undefined;
        if (sprite.pos_x !== undefined) {
            this.initX = sprite.pos_x;
            this.currentX = sprite.pos_x;
            this.currentSequence?.resetTime();
        }
        if (sprite.pos_y !== undefined) {
            this.initY = sprite.pos_y;
            this.currentY = sprite.pos_y;
            this.currentSequence?.resetTime();
        }
        if (sprite.reset_time) {
            this.currentSequence?.resetTime();
        }
        if (sprite.direction) {
            this.fixPosition();
            direction = sprite.direction;
        }
        if (sprite.distance !== undefined) {
            distance = sprite.distance;
        }
        if (sprite.speed !== undefined) {
            speed = sprite.speed;
        }
        if (sprite.time_span !== undefined) {
            time_span = sprite.time_span;
        }
        if ([direction, distance, speed, time_span].some((d) => d !== undefined) && this.initMovement) {
            const currentInit = this.initMovement;
            const updated = currentInit.updated({ direction, distance, speed, time_span });
            this.currentSequence?.pause();
            this.sequences.push(
                new AutoMovement(
                    {
                        movements: [updated],
                        exit_on_done: true,
                    },
                    this.fixPosition,
                    this.onSequenceFinished,
                    true
                )
            );
            this.sequences.remove(currentInit);
            this.configureAutoMovementState();
        }
        if (sprite.movements !== undefined) {
            this.currentSequence?.pause();
            this.sequences.push(
                new AutoMovement(sprite.movements, this.fixPosition, this.onSequenceFinished, false)
            );
            this.configureAutoMovementState();
        }
    }

    @action
    nextMovementInSequence(): RawAutoMovement | undefined {
        if (!this.currentSequence) {
            return;
        }
        this.currentSequence.nextMovementInSequence();
    }

    fixPosition = action(() => {
        this.initX = this.currentX;
        this.initY = this.currentY;
    });

    @action
    updatePosition() {
        if (
            !this.currentSequence ||
            (!this.currentSequence.isProcessing && !this.currentSequence.hasNextMovement)
        ) {
            return false;
        }
        const movement: RawAutoMovement = this.currentSequence.currentMovement!;
        const posX =
            this.initX +
            movement.direction[0] * movement.speed * (timeStamp() - this.currentSequence.startTime) * 10;
        const posY =
            this.initY +
            movement.direction[1] * movement.speed * (timeStamp() - this.currentSequence.startTime) * 10;
        this.currentX = posX;
        this.currentY = posY;
        this.onPositionChanged(posX, posY);
        if (movement.distance) {
            const dX = this.initX - posX;
            const dY = this.initY - posY;
            const distance = Math.sqrt(dX * dX + dY * dY);
            if (distance >= movement.distance) {
                this.nextMovementInSequence();
            }
        } else if (movement.time_span) {
            if (this.currentSequence.elapsedTime > movement.time_span) {
                this.nextMovementInSequence();
            }
        }
        return true;
    }
}
