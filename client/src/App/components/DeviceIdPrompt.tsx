import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button, Header, Input, InputOnChangeData, Modal } from 'semantic-ui-react';
import SocketDataStore from '../stores/socket_data_store';
import ViewStateStore from '../stores/view_state_store';

interface InjectedProps {
    socketDataStore: SocketDataStore;
    viewStateStore: ViewStateStore;
}

@inject('socketDataStore', 'viewStateStore')
@observer
class DeviceIdPrompt extends React.Component {
    inputRef = React.createRef<Input>();
    state = { deviceId: this.injected.socketDataStore.client.deviceId };

    get injected() {
        return this.props as InjectedProps;
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ deviceId: data.value });
    };
    onMount = () => {
        this.setState({ deviceId: this.injected.socketDataStore.client.deviceId });
        window.addEventListener('keyup', this.onEnter);
    };
    onClose = () => {
        window.removeEventListener('keyup', this.onEnter);
        this.injected.viewStateStore.setDeviceIdPromptOpen(false);
    };
    onEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            this.injected.socketDataStore.setDeviceId(this.state.deviceId);
            this.onClose();
        }
    };
    render() {
        return (
            <Modal
                open={this.injected.viewStateStore.deviceIdPromptOpen}
                closeOnEscape
                closeOnDimmerClick
                onClose={this.onClose}
                onMount={this.onMount}
            >
                <Modal.Content>
                    <Modal.Description>
                        <Header>Device ID</Header>
                        <Input
                            ref={this.inputRef}
                            type="text"
                            fluid
                            onChange={this.onChange}
                            value={this.state.deviceId}
                            autoFocus
                        />
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button.Group fluid attached="bottom">
                        <Button
                            color="red"
                            onClick={() => {
                                this.injected.viewStateStore.setDeviceIdPromptOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            content="Set"
                            labelPosition="right"
                            icon="send"
                            onClick={() => {
                                this.injected.socketDataStore.setDeviceId(this.state.deviceId);
                                this.onClose();
                            }}
                            positive
                        />
                    </Button.Group>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default DeviceIdPrompt;
