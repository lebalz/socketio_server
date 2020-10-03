import React, { Component } from 'react';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import { ColorGrid as ColorGridModel } from '../models/ColorGrid/ColorGrid';
import { inject, observer } from 'mobx-react';
import ViewStateStore from '../stores/view_state_store';
import { action, computed } from 'mobx';
import ColorGridRow from './ColorGridRow';
import GridCellPopup from '../components/GridCellPopup';

interface InjectedProps {
    viewStateStore: ViewStateStore;
    socketDataStore: SocketDataStore;
}

@inject('viewStateStore', 'socketDataStore')
@observer
class ColorGrid extends Component {
    get injected() {
        return this.props as InjectedProps;
    }

    @computed
    get grid(): ColorGridModel {
        return this.injected.socketDataStore.data.colorGrid;
    }

    @computed
    get viewState() {
        return this.injected.viewStateStore.gridState;
    }

    componentDidUpdate(_prevProps: any, _prevState: any) {
        if (this.grid.displayedAt) {
            this.grid.displayedAt = timeStamp();
        }
    }

    componentDidMount() {
        this.updateSize();
        window.addEventListener('resize', this.updateSize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateSize);
    }

    updateSize = action(() => {
        this.injected.viewStateStore.gridState.height = window.innerHeight;
        this.injected.viewStateStore.gridState.width = window.innerWidth;
    });

    get maxWidth() {
        const maxCellW = this.injected.viewStateStore.gridState.width / this.grid.columnCount;
        const maxCellH = this.injected.viewStateStore.gridState.height / this.grid.rowCount;
        return Math.min(maxCellH, maxCellW) * this.grid.columnCount;
    }

    render() {
        return (
            <div
                id="color-grid"
                style={{
                    maxWidth: `${this.maxWidth}px`,
                    gridTemplateColumns: `repeat(${this.grid.columnCount}, 1fr)`,
                }}
            >
                {this.grid.rows.map((row, rowIdx) => {
                    return <ColorGridRow key={rowIdx} row={row} />;
                })}
                <GridCellPopup />
            </div>
        );
    }
}

export default ColorGrid;
