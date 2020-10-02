import React, { Component, Fragment } from 'react';
import { GridRow } from '../models/ColorGrid/ColorGridRow';
import ColorGridCell from './ColorGridCell';

interface Props {
    row: GridRow;
}

class ColorGridRow extends Component<Props> {
    render() {
        return (
            <Fragment>
                {this.props.row.cells.map((cell) => {
                    return <ColorGridCell key={`${cell.rowIdx}${cell.colIdx}`} cell={cell} />;
                })}
            </Fragment>
        );
    }
}

export default ColorGridRow;
