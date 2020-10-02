import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from 'semantic-ui-react';
import ViewStateStore from '../stores/view_state_store';

interface InjectedProps {
    viewStateStore: ViewStateStore;
}

@inject('viewStateStore')
@observer
class Nosleep extends React.Component {
    get injected() {
        return this.props as InjectedProps;
    }

    render() {
        const { viewStateStore } = this.injected;
        return (
            <Button
                icon="lightbulb outline"
                content={`No Sleep: ${viewStateStore.noSleepOn ? 'On' : 'Off'}`}
                onClick={() => viewStateStore.toggleNoSleep()}
                color={viewStateStore.noSleepOn ? 'yellow' : 'grey'}
            />
        );
    }
}
export default Nosleep;
