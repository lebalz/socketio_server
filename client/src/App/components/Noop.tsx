import React, { Fragment } from 'react';
export default class Noop extends React.Component {
    componentDidMount() {
        console.log('Noop mounted: ', Date.now());
    }
    componentWillUnmount() {
        console.log('Noop unmounted: ', Date.now());
    }
    render() {
        return <div style={{ zIndex: 999, width: '50px', height: '50px', background: 'red' }} />;
    }
}
