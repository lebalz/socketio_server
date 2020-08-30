import React from "react";
import {
  Button,
  Header,
  Input,
  InputOnChangeData,
  Modal,
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
            <Input
              ref={this.inputRef}
              type={prompt.inputType}
              fluid
              onChange={this.onChange}
              placeholder={prompt.inputType}
              focus
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
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
        </Modal.Actions>
      </Modal>
    );
  }
}

export default InputPrompt;
