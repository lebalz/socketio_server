import React from 'react';
import { AlertConfirm, DataType } from '../../Shared/SharedTypings';
import { Notification as NotificationModel } from '../models/Notification';
import Notification from './Notification';
import { timeStamp } from '../SocketData';
import { Icon } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import DataStore from '../stores/data_store';
import { computed, IReactionDisposer, reaction } from 'mobx';

interface InjectedProps {
    dataStore: DataStore;
}

@inject('dataStore')
@observer
class NotificationList extends React.Component {
    get injected() {
        return this.props as InjectedProps;
    }
    reactionDisposer: IReactionDisposer;

    constructor(props: any) {
        super(props);
        const { socket } = this.injected.dataStore;
        this.reactionDisposer = reaction(
            () => socket.notifications.length,
            (length) => {
                if (length > 0) {
                    const notification = socket.notifications[0];
                    if (notification?.alert) {
                        const ts = timeStamp();
                        window.alert(notification.message);
                        socket.addData<AlertConfirm>({
                            type: DataType.AlertConfirm,
                            time_stamp: notification.timeStamp,
                            caller_id: notification.responseId,
                            displayed_at: ts,
                        });
                        socket.notifications.remove(notification);
                    }
                }
            }
        );
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }

    onDismissNotification = (notification: NotificationModel) => {
        this.injected.dataStore.socket.notifications.remove(notification);
    };

    @computed
    get notifications(): NotificationModel[] {
        const notifics = this.injected.dataStore.socket.notifications.filter(
            (notification) => !notification.alert
        );
        return notifics.sort((a, b) => b.timeStamp - a.timeStamp);
    }

    render() {
        return (
            <div id="notification-container">
                {this.notifications.length > 1 && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            this.injected.dataStore.socket.notifications.clear();
                        }}
                    >
                        <div>Alle schliessen</div>
                        <Icon name="close" className="clickable" />
                    </div>
                )}
                {this.notifications.map((notification, idx) => {
                    return <Notification notification={notification} key={idx} />;
                })}
            </div>
        );
    }
}

export default NotificationList;
