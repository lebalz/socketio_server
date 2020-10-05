import { action, computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button, DropdownProps, Header, Input, InputOnChangeData, Modal, Select } from 'semantic-ui-react';
import { InputPrompt as InputPromptModel } from '../models/InputPrompt';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import ViewStateStore from '../stores/view_state_store';

interface State {
    response?: string;
    displayedAt: number;
}

interface InjectedProps {
    socketDataStore: SocketDataStore;
    viewStateStore: ViewStateStore;
}

@inject('socketDataStore', 'viewStateStore')
@observer
class InputPrompt extends React.Component {
    inputRef = React.createRef<Input>();
    state: State = { response: undefined, displayedAt: timeStamp() };

    get injected() {
        return this.props as InjectedProps;
    }

    @computed
    get prompt(): InputPromptModel | undefined {
        return this.injected.socketDataStore.data?.inputPrompts[0];
    }

    @computed
    get isOpen() {
        return this.injected.socketDataStore.data?.isInputPromptOpen;
    }

    onMount = () => {
        window.addEventListener('keyup', this.onEnter);
        this.inputRef.current?.focus();
        this.setState({ response: this.prompt?.defaultValue });
        if (this.prompt) {
            this.prompt.displayedAt = timeStamp();
        }
    };

    onClose = action(() => {
        window.removeEventListener('keyup', this.onEnter);
        this.prompt?.cancel();
    });

    onEnter = action((e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            this.respond();
        }
    });

    @action
    respond() {
        this.prompt?.respond(this.state.response ?? this.prompt.defaultValue ?? '');
    }

    onChangeSelection = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        this.setState({ response: data.value });
    };

    onChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ response: data.value });
    };

    render() {
        if (!this.prompt) {
            return null;
        }
        return (
            <Modal
                open={this.isOpen}
                closeOnEscape
                closeOnDimmerClick={false}
                closeOnDocumentClick={false}
                onClose={this.onClose}
                onMount={this.onMount}
            >
                <Modal.Content>
                    <Modal.Description>
                        <Header>{this.prompt.question}</Header>
                        {this.prompt.inputType === 'select' ? (
                            <Select
                                fluid
                                options={this.prompt.selectOptions}
                                defaultValue={this.prompt.defaultValue}
                                placeholder="Select an Option"
                                onChange={this.onChangeSelection}
                            />
                        ) : (
                            <Input
                                ref={this.inputRef}
                                type={this.prompt.inputType}
                                fluid
                                onChange={this.onChange}
                                placeholder={this.prompt.inputType}
                                focus
                            />
                        )}
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button.Group fluid attached="bottom">
                        <Button color="red" onClick={() => this.prompt?.cancel()}>
                            Cancel
                        </Button>
                        <Button
                            content="Send"
                            labelPosition="right"
                            icon="send"
                            onClick={() => this.respond()}
                            positive
                        />
                    </Button.Group>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default InputPrompt;
