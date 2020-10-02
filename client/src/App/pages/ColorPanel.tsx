import React, { Component } from 'react';
import { timeStamp } from '../SocketData';
import { ColorPanel as ColorPanelModel } from '../models/ColorPanel';
import ViewStateStore from '../stores/view_state_store';
import DataStore from '../stores/data_store';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';

interface InjectedProps {
    viewStateStore: ViewStateStore;
    dataStore: DataStore;
}

@inject('viewStateStore', 'dataStore')
@observer
class ColorPanel extends Component {
    get injected() {
        return this.props as InjectedProps;
    }

    componentDidUpdate(_prevProps: InjectedProps, _prevState: any) {
        if (this.injected.dataStore.socket.colorPanel.displayedAt === undefined) {
            this.injected.dataStore.socket.colorPanel.displayedAt = timeStamp();
        }
    }

    @computed
    get colorPanel(): ColorPanelModel {
        return this.injected.dataStore.socket.colorPanel;
    }

    render() {
        return (
            <div
                id="color-panel"
                style={{
                    background: this.colorPanel.color,
                    position: 'relative',
                    userSelect: 'none',
                }}
                onPointerDown={(e) => this.colorPanel.onClick(e)}
                onPointerUp={() => (this.colorPanel.touched = false)}
                onPointerCancel={() => (this.colorPanel.touched = false)}
                onPointerOut={() => (this.colorPanel.touched = false)}
            >
                {this.colorPanel.touched && (
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
