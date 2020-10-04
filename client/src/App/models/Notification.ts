import { DataType, NotificationMsg } from './../../Shared/SharedTypings';
import _ from 'lodash';

export class Notification {
    notification: NotificationMsg;
    onDismiss: (n: Notification) => void;
    constructor(notification: NotificationMsg, onDismiss: (n: Notification) => void) {
        this.notification = notification;
        this.onDismiss = onDismiss;
        if (this.notification.time! > 0) {
            _.delay(() => {
                this.onDismiss(this);
            }, this.notification.time!);
        }
    }

    get dataType() {
        return DataType.Notification;
    }

    get type() {
        return this.notification.notification_type;
    }

    get alert() {
        return this.notification.alert;
    }

    get time() {
        return this.notification.time;
    }

    get message() {
        return this.notification.message;
    }

    get timeString() {
        return new Date(this.notification.time_stamp * 1000);
    }

    get timeStamp() {
        return this.notification.time_stamp;
    }

    get responseId() {
        return this.notification.response_id;
    }

    dismiss() {
        this.onDismiss(this);
    }
}
