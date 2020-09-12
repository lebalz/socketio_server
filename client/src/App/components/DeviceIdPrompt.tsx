import React from 'react';
import { Button, Header, Input, InputOnChangeData, Modal } from 'semantic-ui-react';

interface Props {
  deviceId: string;
  onSetDeviceId: (deviceId: string) => void;
  onCancel: () => void;
  open: boolean;
}

class DeviceIdPrompt extends React.Component<Props> {
  inputRef = React.createRef<Input>();
  state = { deviceId: this.props.deviceId };

  onChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({ deviceId: data.value });
  };
  onMount = () => {
    this.setState({ deviceId: this.props.deviceId });
    window.addEventListener('keyup', this.onEnter);
  };
  onClose = () => {
    window.removeEventListener('keyup', this.onEnter);
    this.props.onCancel();
  };
  onEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.props.onSetDeviceId(this.state.deviceId);
      this.onClose();
    }
  };
  render() {
    return (
      <Modal
        open={this.props.open}
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
            <Button color="red" onClick={() => this.props.onCancel()}>
              Cancel
            </Button>
            <Button
              content="Set"
              labelPosition="right"
              icon="send"
              onClick={() => this.props.onSetDeviceId(this.state.deviceId)}
              positive
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default DeviceIdPrompt;
