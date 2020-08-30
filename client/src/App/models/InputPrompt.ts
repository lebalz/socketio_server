import { DataType, InputPromptMsg } from "./../../Shared/SharedTypings";
import SocketData from "../SocketData";

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

  respond(response: string | number | Date) {
    this.socket.addData({
      type: DataType.InputResponse,
      time_stamp: this.prompt.time_stamp,
      caller_id: this.prompt.response_id,
      response: response,
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
