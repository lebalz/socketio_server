import {
  DataType,
  InputPromptMsg,
  InputResponse,
  SelectionPrompt,
} from "./../../Shared/SharedTypings";
import SocketData from "../SocketData";
import { DropdownItemProps } from "semantic-ui-react";

export class InputPrompt {
  prompt: InputPromptMsg;
  socket: SocketData;
  onDone: (n: InputPrompt) => void;

  constructor(
    prompt: InputPromptMsg,
    socket: SocketData,
    onDone: (n: InputPrompt) => void
  ) {
    this.prompt = prompt;
    this.socket = socket;
    this.onDone = onDone;
  }

  get question() {
    return this.prompt.question;
  }

  get inputType() {
    return this.prompt.input_type;
  }

  get timeStamp() {
    return this.prompt.time_stamp;
  }

  get selectOptions(): DropdownItemProps[] {
    if (this.prompt.input_type !== "select") {
      return [];
    }
    const prompt = this.prompt as SelectionPrompt;
    return prompt.options.map((opt) => {
      return { text: opt, value: opt };
    });
  }

  get defaultValue(): string | undefined {
    if (!this.prompt.options) {
      return undefined;
    }
    return this.prompt.options[0];
  }

  respond(response: string | number | Date, displayedAt: number) {
    const pkg: InputResponse = {
      response: response,
      displayed_at: displayedAt
    }
    this.socket.addData({
      type: DataType.InputResponse,
      time_stamp: this.prompt.time_stamp,
      caller_id: this.prompt.response_id,
      ...pkg
    });

    this.onDone(this);
  }

  cancel() {
    this.socket.addData({
      type: DataType.InputResponse,
      time_stamp: this.prompt.time_stamp,
      caller_id: this.prompt.response_id,
      response: undefined,
    });
    this.onDone(this);
  }
}