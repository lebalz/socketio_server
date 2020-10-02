import React from 'react';
import { InputPrompt as InputPromptModel } from '../models/InputPrompt';
import { inject, observer } from 'mobx-react';
import DataStore from '../stores/data_store';
import InputPrompt from './InputPrompt';
import { computed } from 'mobx';

interface InjectedProps {
    dataStore: DataStore;
}

@inject('dataStore')
@observer
class InputPromptContainer extends React.Component {
    get injected() {
        return this.props as InjectedProps;
    }

    @computed
    get inputPrompts(): InputPromptModel[] {
        return this.injected.dataStore.socket.inputPrompts;
    }

    render() {
        return <div>{this.inputPrompts.length > 0 && <InputPrompt prompt={this.inputPrompts[0]} />}</div>;
    }
}

export default InputPromptContainer;
