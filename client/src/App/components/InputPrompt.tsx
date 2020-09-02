import React from "react";
import {
  Button,
  DropdownProps,
  Header,
  Input,
  InputOnChangeData,
  Modal,
  Select,
} from "semantic-ui-react";
import { InputPrompt as InputPromptModel } from "../models/InputPrompt";

interface Props {
  prompt: InputPromptModel;
}

class InputPrompt extends React.Component<Props> {
  inputRef = React.createRef<Input>();
  state = { open: true, response: "" };

  componentDidMount() {
    this.inputRef.current?.focus();
  }

  onChangeSelection = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    this.setState({ response: data.value });
  };

  onChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    this.setState({ response: data.value });
  };
  render() {
    const prompt = this.props.prompt;
    return (
      <Modal open={this.state.open}>
        <Modal.Content>
          <Modal.Description>
            <Header>{prompt.question}</Header>
            {prompt.inputType === "select" ? (
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
                type={prompt.inputType}
                fluid
                onChange={this.onChange}
                placeholder={prompt.inputType}
                focus
              />
            )}
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button.Group fluid attached="bottom">
            <Button color="red" onClick={() => prompt.cancel()}>
              Cancel
            </Button>
            <Button
              content="Send"
              labelPosition="right"
              icon="send"
              onClick={() => prompt.respond(this.state.response)}
              positive
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default InputPrompt;
