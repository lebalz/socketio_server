import React, { Component } from 'react';
import { Button, IconProps } from 'semantic-ui-react';
import { Key, DataType } from '../../Shared/SharedTypings';
import { SemanticShorthandItem } from 'semantic-ui-react/dist/commonjs/generic';
import IController from './IController';

interface Props {
  keys?: Key[];
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
  state: State = {
    active: {},
  };

  componentDidMount() {
    window.addEventListener('keyup', this.onKey);
  }
  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKey);
  }

  setActive(key: Key, active: boolean) {
    const activeState = { ...this.state.active };
    activeState[key] = active;
    this.setState({ active: activeState });
  }

  onData(action: Key) {
    const data: KeyData = {
      key: action,
      type: DataType.Key,
    };
    this.setActive(action, true);
    setTimeout(() => {
      this.setActive(action, false);
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
    return (
      <div className="control">
        <h1>Controller</h1>
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
