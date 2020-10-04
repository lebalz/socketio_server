import React, { Component } from 'react';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import { ColorPanel as ColorPanelModel } from '../models/ColorPanel';
import ViewStateStore from '../stores/view_state_store';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';

interface InjectedProps {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
class ColorPanel extends Component {
    get injected() {
        return this.props as InjectedProps;
    }

    componentDidUpdate(_prevProps: InjectedProps, _prevState: any) {
        if (
            this.injected.socketDataStore.data &&
            this.injected.socketDataStore.data?.colorPanel.displayedAt === undefined
        ) {
            this.injected.socketDataStore.data.colorPanel.displayedAt = timeStamp();
        }
    }

    @computed
    get colorPanel(): ColorPanelModel | undefined {
        return this.injected.socketDataStore.data?.colorPanel;
    }

    render() {
        return (
            <div
                id="color-panel"
                style={{
                    background: this.colorPanel?.color,
                    position: 'relative',
                    userSelect: 'none',
                }}
                onPointerDown={(e) => this.colorPanel?.onClick(e)}
                onPointerUp={() => this.colorPanel?.setTouched(false)}
                onPointerCancel={() => this.colorPanel?.setTouched(false)}
                onPointerOut={() => this.colorPanel?.setTouched(false)}
            >
                {this.colorPanel?.touched && (
                    <div
                        style={{
                            borderRadius: '50%',
                            width: '0.5rem',
                            height: '0.5rem',
                            position: 'absolute',
                            left: '1rem',
                            top: '1rem',
                            background: 'red',
                        }}
                    />
                )}
            </div>
        );
    }
}

export default ColorPanel;
