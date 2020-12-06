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
    fixPosition: (movementId?: string) => void;
    constructor(
        sprite: SpriteAutoMovementProps,
        fixPosition: (movementId?: string) => void,
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
                if (m.movement === 'absolute') {
                    if ((m.speed && m.speed !== 0) || m.time !== undefined) {
                        this.movements.push(m);
                    } else {
                        console.warn('No speed or time_span specified. The movement was removed:', m);
                    }
                } else if (
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
        if (this.movements[0].movement === 'absolute') {
            return true;
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
        if (!this.currentMovement) {
            return false;
        }
        switch (this.currentMovement.movement) {
            case 'absolute':
                if (this.currentMovement.time !== undefined) {
                    return true;
                }
                if (this.currentMovement.speed && this.currentMovement.speed !== 0) {
                    return true;
                }
                break;
            case 'relative':
                if (this.currentMovement.time_span && this.currentMovement.time_span > 0) {
                    return true;
                }
                break;
        }
        return false;
    }

    updated(props: Partial<RawAutoMovement>, movementIdx: number = 0): RawAutoMovement {
        const current = this.movements[movementIdx];
        let copy: RawAutoMovement;
        if (current.movement === 'absolute') {
            copy = {
                movement: 'absolute',
                id: props.id!,
                to: [...current.to],
                speed: current.speed,
                time: current.time,
            };
        } else {
            copy = {
                movement: 'relative',
                id: props.id!,
                direction: [...current.direction],
                speed: current.speed,
                time_span: current.time_span,
                distance: current.distance,
            };
        }
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
        switch (this.currentMovement?.movement) {
            case 'absolute':
                if (this.currentMovement?.time) {
                    const dt = this.pausedTime - this.startTime;
                    if (dt > 0) {
                        this.currentMovement.time -= dt;
                    }
                }
                break;
            case 'relative':
                if (this.currentMovement?.time_span) {
                    const dt = this.pausedTime - this.startTime;
                    if (dt > 0) {
                        this.currentMovement.time_span -= dt;
                    }
                }
                break;
        }
        this.resetTime();
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
        if (current.id.endsWith('r')) {
            const parts = current.id.split('-');
            parts[parts.length - 1] = `${this.movementsCycleCount}r`;
            current.id = parts.join('-');
        } else {
            current.id = `${current.id}-${this.movementsCycleCount}r`;
        }

        this.resetTime();
        this.fixPosition(current.id);
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
    onInitPosChanged: (x: number, y: number, mid: string) => void;
    constructor(
        sprite: SpriteProps,
        onPositionChanged: (x: number, y: number) => void,
        onInitPosChanged: (x: number, y: number, mid: string) => void,
        onDone: () => void
    ) {
        this.onInitPosChanged = onInitPosChanged;
        const movement = new AutoMovement(
            {
                movements: [
                    {
                        movement: 'relative',
                        id: 'init',
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
        this.configureAutoMovementState(this.currentSequence?.currentMovement?.id);
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
    configureAutoMovementState(movementId?: string) {
        this.fixPosition(movementId);
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
            const updated = currentInit.updated({ direction, distance, speed, time: time_span, id: 'init' });
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
            this.configureAutoMovementState(currentInit.currentMovement?.id);
        }
        if (sprite.movements !== undefined) {
            const current = this.currentSequence;
            current?.pause();
            this.sequences.push(
                new AutoMovement(sprite.movements, this.fixPosition, this.onSequenceFinished, false)
            );
            this.configureAutoMovementState(current?.currentMovement?.id);
        }
    }

    @action
    nextMovementInSequence(): RawAutoMovement | undefined {
        if (!this.currentSequence) {
            return;
        }
        this.currentSequence.nextMovementInSequence();
    }

    fixPosition = action((movementId?: string) => {
        this.initX = this.currentX;
        this.initY = this.currentY;
        if (movementId && this.currentSequence && !this.currentSequence.isInitMovement) {
            this.onInitPosChanged(this.initX, this.initY, movementId);
        }
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
        let posX: number;
        let posY: number;

        const dt = timeStamp() - this.currentSequence.startTime;
        switch (movement.movement) {
            case 'absolute':
                const dX = movement.to[0] - this.initX;
                const dY = movement.to[1] - this.initY;
                if (movement.time !== undefined) {
                    if (movement.time === 0) {
                        posX = movement.to[0];
                        posY = movement.to[1];
                    } else {
                        posX = this.initX + (dt / movement.time) * dX;
                        posY = this.initY + (dt / movement.time) * dY;
                    }
                } else if (movement.speed) {
                    const len = Math.sqrt(dX * dX + dY * dY);
                    if (len === 0) {
                        posX = movement.to[0];
                        posY = movement.to[1];
                    } else {
                        posX = this.initX + (movement.speed * dt * 10 * dX) / len;
                        posY = this.initY + (movement.speed * dt * 10 * dY) / len;
                    }
                } else {
                    posX = this.currentX;
                    posY = this.currentY;
                }
                break;
            case 'relative':
                posX = this.initX + movement.direction[0] * movement.speed * dt * 10;
                posY = this.initY + movement.direction[1] * movement.speed * dt * 10;
                break;
        }
        this.currentX = posX;
        this.currentY = posY;
        this.onPositionChanged(posX, posY);
        switch (movement.movement) {
            case 'absolute':
                if (movement.time !== undefined && this.currentSequence.elapsedTime > movement.time) {
                    this.nextMovementInSequence();
                } else if (movement.speed) {
                    const toX = movement.to[0];
                    const toY = movement.to[1];
                    let xDone = false;
                    let yDone = false;
                    if (this.initX <= toX) {
                        xDone = toX - this.currentX <= 0;
                    } else {
                        xDone = toX - this.currentX >= 0;
                    }
                    if (this.initY <= toY) {
                        yDone = toY - this.currentY <= 0;
                    } else {
                        yDone = toY - this.currentY >= 0;
                    }
                    if (xDone && yDone) {
                        this.nextMovementInSequence();
                    }
                }
                break;
            case 'relative':
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
                break;
        }

        return true;
    }
}
