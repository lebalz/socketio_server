import { Component } from 'react';

export interface Props<T> {
  onData: (data: T) => void;
}

class IController<T> extends Component<Props<T>> {
  onData = (e: any) => {};
}

export default IController;
