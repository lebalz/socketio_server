import React, { Component, Fragment } from 'react';
import { Button, Checkbox, IconProps } from 'semantic-ui-react';
import { Key, DataType } from '../../../Shared/SharedTypings';
import { SemanticShorthandItem } from 'semantic-ui-react/dist/commonjs/generic';
import IController from './IController';

interface Props {
    keys?: Key[];
    hideControls?: boolean;
    onData: (data: KeyData) => void;
}

export interface KeyData {
    type: DataType.Key;
    key: Key;
}

interface State {
    active: {
        [key in Key]?: boolean;
    };
}

export const ARROW_CONTROLS = [Key.Down, Key.Home, Key.Left, Key.Right, Key.Up];
export const F_KEY_CONTROLS = [Key.F1, Key.F2, Key.F3, Key.F4];

class KeyControls extends Component<Props> implements IController<KeyData> {
    private _isMounted = false;
    state: State = {
        active: {},
    };

    componentDidMount() {
        window.addEventListener('keyup', this.onKey);
        window.addEventListener('keydown', this.onKeyDown);
        this._isMounted = true;
    }
    componentWillUnmount() {
        window.removeEventListener('keyup', this.onKey);
        window.removeEventListener('keydown', this.onKeyDown);
        this._isMounted = false;
    }

    setActive(key: Key, active: boolean) {
        const activeState = { ...this.state.active };
        activeState[key] = active;
        this.setState({ active: activeState });
    }

    onData(action: Key) {
        if (!this.keys.has(action)) {
            return;
        }
        const data: KeyData = {
            key: action,
            type: DataType.Key,
        };
        this.setActive(action, true);
        setTimeout(() => {
            if (this._isMounted) {
                this.setActive(action, false);
            }
        }, 200);
        this.props.onData(data);
    }

    keyIcon(key: Key): SemanticShorthandItem<IconProps> {
        switch (key) {
            case Key.Up:
            case Key.Right:
            case Key.Left:
            case Key.Down:
                return `angle ${key}`;
            case Key.Home:
                return 'circle';
            default:
                return undefined;
        }
    }
    onKeyDown = (e: KeyboardEvent) => {
        switch (e.code) {
            case 'Space':
            case 'ArrowRight':
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'ArrowDown':
            case 'F1':
            case 'F2':
            case 'F3':
            case 'F4':
                return e.preventDefault();
        }
    };
    onKey = (e: KeyboardEvent) => {
        switch (e.code) {
            case 'Space':
                return this.onData(Key.Home);
            case 'ArrowRight':
                return this.onData(Key.Right);
            case 'ArrowLeft':
                return this.onData(Key.Left);
            case 'ArrowUp':
                return this.onData(Key.Up);
            case 'ArrowDown':
                return this.onData(Key.Down);
            case 'F1':
            case 'Digit1':
                return this.onData(Key.F1);
            case 'F2':
            case 'Digit2':
                return this.onData(Key.F2);
            case 'F3':
            case 'Digit3':
                return this.onData(Key.F3);
            case 'F4':
            case 'Digit4':
                return this.onData(Key.F4);
        }
    };

    get keys(): Set<Key> {
        return new Set(this.props.keys ?? [...ARROW_CONTROLS, ...F_KEY_CONTROLS]);
    }

    get arrowControls(): Key[] {
        return ARROW_CONTROLS.filter((key) => this.keys.has(key));
    }
    get fKeyControls(): Key[] {
        return F_KEY_CONTROLS.filter((key) => this.keys.has(key));
    }

    render() {
        if (this.props.hideControls) {
            return <div className="controls" />;
        }
        return (
            <div className="control">
                <div className="actions">
                    {this.arrowControls.length > 0 &&
                        this.arrowControls.map((key) => {
                            return (
                                <Button
                                    key={key}
                                    icon={this.keyIcon(key)}
                                    onClick={() => this.onData(key)}
                                    className={`action ${key}`}
                                    size="huge"
                                    active={this.state.active[key]}
                                />
                            );
                        })}
                </div>
                <div className="function-keys">
                    {this.fKeyControls.length > 0 &&
                        this.fKeyControls.map((key) => {
                            return (
                                <Button
                                    key={key}
                                    onClick={() => this.onData(key)}
                                    className={`action ${key}`}
                                    content={key.toUpperCase()}
                                    size="medium"
                                    active={this.state.active[key]}
                                />
                            );
                        })}
                </div>
            </div>
        );
    }
}

export default KeyControls;
interface KeyListenerProps {
    onData: (data: KeyData) => void;
}
export class KeyControlListener extends Component<KeyListenerProps> implements IController<KeyData> {
    state = { on: true };
    onData(data: KeyData) {
        this.props.onData(data);
    }

    toggle = () => {
        this.setState({ on: !this.state.on });
    };

    render() {
        return (
            <Fragment>
                {this.state.on && <KeyControls hideControls onData={(data: KeyData) => this.onData(data)} />}
                <Checkbox checked={this.state.on} onClick={this.toggle} label="Key" />
            </Fragment>
        );
    }
}
