import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import SocketDataStore from '../stores/socket_data_store';

interface InjectedProps {
    socketDataStore: SocketDataStore;
}

@inject('socketDataStore')
@observer
class GridCellPopup extends React.Component {
    get injected() {
        return this.props as InjectedProps;
    }

    @computed
    get activeCells() {
        return this.injected.socketDataStore.data.colorGrid.activeCells;
    }
    render() {
        if (this.activeCells.length === 0) {
            return null;
        }
        const cell = this.activeCells[0];
        const label = `[${cell.rowIdx}, ${cell.colIdx}]`;
        return (
            <div
                className="cell-index-popup"
                style={{
                    width: `${label.length / 1.5}em`,
                }}
            >
                {label}
            </div>
        );
    }
}

export default GridCellPopup;
