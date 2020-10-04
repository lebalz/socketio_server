import React from 'react';
import { AlertConfirm, DataType } from '../../Shared/SharedTypings';
import { Notification as NotificationModel } from '../models/Notification';
import Notification from './Notification';
import SocketDataStore, { timeStamp } from '../stores/socket_data_store';
import { Icon } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import { computed, IReactionDisposer, reaction } from 'mobx';

interface InjectedProps {
    socketDataStore: SocketDataStore;
}

@inject('socketDataStore')
@observer
class NotificationList extends React.Component {
    get injected() {
        return this.props as InjectedProps;
    }
    reactionDisposer: IReactionDisposer;

    constructor(props: any) {
        super(props);
        const { socketDataStore } = this.injected;
        this.reactionDisposer = reaction(
            () => socketDataStore.data?.notifications.length,
            (length) => {
                if (length && length > 0) {
                    const notification = socketDataStore.data?.notifications[0];
                    if (notification?.alert) {
                        const ts = timeStamp();
                        window.alert(notification.message);
                        socketDataStore.emitData<AlertConfirm>({
                            type: DataType.AlertConfirm,
                            time_stamp: notification.timeStamp,
                            caller_id: notification.responseId,
                            displayed_at: ts,
                        });
                        socketDataStore.data?.notifications.remove(notification);
                    }
                }
            }
        );
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }

    onDismissNotification = (notification: NotificationModel) => {
        this.injected.socketDataStore.data?.notifications.remove(notification);
    };

    @computed
    get notifications(): NotificationModel[] {
        const notifics = this.injected.socketDataStore.data?.notifications.filter(
            (notification) => !notification.alert
        );
        if (!notifics) {
            return [];
        }
        return notifics.slice().sort((a, b) => b.timeStamp - a.timeStamp);
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
                            this.injected.socketDataStore.data?.notifications.clear();
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
