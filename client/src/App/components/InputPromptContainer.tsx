import React from "react";
import { InputPromptMsg } from "../../Shared/SharedTypings";
import { InputPrompt as InputPromptModel } from "../models/InputPrompt";
import InputPrompt from "./InputPrompt";
import SocketData from "../SocketData";

interface Props {
  socket: SocketData;
}

interface State {
  prompts: InputPromptModel[];
}
class InputPromptContainer extends React.Component<Props> {
  state: State = {
    prompts: [],
  };
  constructor(props: Props) {
    super(props);

    props.socket.onInputPrompt = (prompt: InputPromptMsg) => {
      const ntfs = this.state.prompts.slice();
      ntfs.push(
        new InputPromptModel(prompt, this.props.socket, this.onResponded)
      );
      this.setState({ prompts: ntfs });
    };
  }

  onResponded = (prompt: InputPromptModel) => {
    let prompts = this.state.prompts.slice();
    if (!prompts.includes(prompt)) {
      return;
    }
    prompts.splice(prompts.indexOf(prompt), 1);
    this.setState({ prompts: prompts });
  };

  render() {
    return (
      <div>
        {this.state.prompts.length > 0 && (
          <InputPrompt prompt={this.state.prompts[0]} />
        )}
      </div>
    );
  }
}

export default InputPromptContainer;
