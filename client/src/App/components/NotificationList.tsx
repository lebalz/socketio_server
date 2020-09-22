import React from 'react';
import { AlertConfirm, DataType, NotificationMsg } from '../../Shared/SharedTypings';
import { Notification as NotificationModel } from '../models/Notification';
import Notification from './Notification';
import SocketData, { timeStamp } from '../SocketData';
import { Icon } from 'semantic-ui-react';

interface Props {
    socket: SocketData;
}
interface State {
    notifications: NotificationModel[];
}

class NotificationList extends React.Component<Props> {
    state: State = {
        notifications: [],
    };

    constructor(props: Props) {
        super(props);
        props.socket.onNotification = (notification: NotificationMsg) => {
            if (notification.alert) {
                const ts = timeStamp();
                window.alert(notification.message);
                const pkg: AlertConfirm = {
                    displayed_at: ts,
                };
                this.props.socket.addData({
                    type: DataType.AlertConfirm,
                    time_stamp: notification.time_stamp,
                    caller_id: notification.response_id,
                    ...pkg,
                });
            } else {
                const ntfs = this.state.notifications.slice();
                ntfs.push(new NotificationModel(notification, this.onDismissNotification));
                this.setState({ notifications: ntfs });
            }
        };
    }

    onDismissNotification = (notification: NotificationModel) => {
        const ntfs = this.state.notifications.slice();
        if (!ntfs.includes(notification)) {
            return;
        }
        ntfs.splice(ntfs.indexOf(notification), 1);
        this.setState({ notifications: ntfs });
    };

    render() {
        return (
            <div id="notification-container">
                {this.state.notifications.length > 1 && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            this.setState({ notifications: [] });
                        }}
                    >
                        <div>Alle schliessen</div>
                        <Icon name="close" className="clickable" />
                    </div>
                )}
                {this.state.notifications
                    .sort((a, b) => b.timeStamp - a.timeStamp)
                    .map((n, idx) => {
                        return <Notification notification={n} key={idx} />;
                    })}
            </div>
        );
    }
}

export default NotificationList;
