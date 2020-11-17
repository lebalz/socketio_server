import { DataType, InputPromptMsg, InputResponse } from './../../Shared/SharedTypings';
import SocketDataStore from '../stores/socket_data_store';
import { DropdownItemProps } from 'semantic-ui-react';
import { computed } from 'mobx';

export class InputPrompt {
    _prompt: InputPromptMsg;
    question: string;
    inputType?: string;
    timeStamp: number;
    options?: string[];
    responseId: string;

    socket: SocketDataStore;
    submitted: boolean = false;
    displayedAt?: number = undefined;

    constructor(prompt: InputPromptMsg, socket: SocketDataStore) {
        this._prompt = prompt;
        this.socket = socket;
        this.question = prompt.question;
        this.inputType = prompt.input_type;
        this.timeStamp = prompt.time_stamp;
        this.options = prompt.options;
        this.responseId = prompt.response_id;
    }

    get dataType() {
        return DataType.InputPrompt;
    }

    get selectOptions(): DropdownItemProps[] {
        if (this.inputType !== 'select') {
            return [];
        }
        if (!this.options) {
            return [];
        }
        return this.options.map((opt) => {
            return { text: opt, value: opt };
        });
    }

    @computed
    get defaultValue(): string | undefined {
        if (!this.options) {
            return undefined;
        }
        return this.options[0];
    }

    respond(response: string | number | Date) {
        this.socket.data?.inputPrompts.remove(this);
        if (!this.submitted) {
            this.submitted = true;
            this.socket.emitData<InputResponse>({
                type: DataType.InputResponse,
                time_stamp: this.timeStamp,
                caller_id: this.responseId,
                response: response,
                displayed_at: this.displayedAt ?? this.timeStamp,
            });
        }
    }

    cancel(emit: boolean = true) {
        this.socket.data?.inputPrompts.remove(this);
        if (!this.submitted) {
            this.submitted = true;
            if (emit) {
                this.socket.emitData<InputResponse>({
                    type: DataType.InputResponse,
                    time_stamp: this.timeStamp,
                    caller_id: this.responseId,
                    displayed_at: this.displayedAt ?? this.timeStamp,
                });
            }
        }
    }
}
