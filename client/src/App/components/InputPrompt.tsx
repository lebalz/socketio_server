import React from 'react';
import { Button, DropdownProps, Header, Input, InputOnChangeData, Modal, Select } from 'semantic-ui-react';
import { InputPrompt as InputPromptModel } from '../models/InputPrompt';
import { timeStamp } from '../SocketData';

interface Props {
    prompt?: InputPromptModel;
}

interface State {
    open: boolean;
    response?: string;
    displayedAt: number;
}

class InputPrompt extends React.Component<Props> {
    inputRef = React.createRef<Input>();
    state: State = { open: true, response: undefined, displayedAt: timeStamp() };

    componentDidMount() {
        this.inputRef.current?.focus();
        this.setState({ displayedAt: timeStamp() });
    }

    onMount = () => {
        window.addEventListener('keyup', this.onEnter);
        this.setState({ response: this.props.prompt?.defaultValue });
    };

    onClose = () => {
        window.removeEventListener('keyup', this.onEnter);
        this.props.prompt?.cancel(this.state.displayedAt);
    };

    onEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            this.respond();
        }
        // this.props.prompt?.cancel(this.state.displayedAt);
    };

    respond() {
        this.props.prompt?.respond(
            this.state.response ?? this.props.prompt.defaultValue ?? '',
            this.state.displayedAt
        );
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.prompt !== prevProps.prompt) {
            this.setState({ displayedAt: timeStamp() });
        }
    }

    onChangeSelection = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        this.setState({ response: data.value });
    };

    onChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ response: data.value });
    };

    render() {
        const prompt = this.props.prompt;
        return (
            <Modal
                open={this.state.open && !!prompt}
                closeOnEscape
                closeOnDimmerClick={false}
                closeOnDocumentClick={false}
                onClose={this.onClose}
                onMount={this.onMount}
            >
                <Modal.Content>
                    <Modal.Description>
                        <Header>{prompt?.question}</Header>
                        {prompt?.inputType === 'select' ? (
                            <Select
                                fluid
                                options={prompt.selectOptions}
                                defaultValue={prompt.defaultValue}
                                placeholder="Select an Option"
                                onChange={this.onChangeSelection}
                            />
                        ) : (
                            <Input
                                ref={this.inputRef}
                                type={prompt?.inputType}
                                fluid
                                onChange={this.onChange}
                                placeholder={prompt?.inputType}
                                focus
                            />
                        )}
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button.Group fluid attached="bottom">
                        <Button color="red" onClick={() => prompt?.cancel(this.state.displayedAt)}>
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
