import React from 'react';
import { InputPrompt as InputPromptModel } from '../models/InputPrompt';
import { inject, observer } from 'mobx-react';
import InputPrompt from './InputPrompt';
import { computed } from 'mobx';
import SocketDataStore from '../stores/socket_data_store';

interface InjectedProps {
    socketDataStore: SocketDataStore;
}

@inject('socketDataStore')
@observer
class InputPromptContainer extends React.Component {
    get injected() {
        return this.props as InjectedProps;
    }

    @computed
    get inputPrompts(): InputPromptModel[] {
        return this.injected.socketDataStore.data.inputPrompts;
    }

    render() {
        return <div>{this.inputPrompts.length > 0 && <InputPrompt prompt={this.inputPrompts[0]} />}</div>;
    }
}

export default InputPromptContainer;
