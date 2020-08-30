import React from "react";
import { DataType, NotificationMsg } from "../../Shared/SharedTypings";
import { Notification as NotificationModel } from "../models/Notification";
import Notification from "./Notification";
import SocketData from "../SocketData";

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
        window.alert(notification.message);
        this.props.socket.addData({
          type: DataType.AlertConfirm,
          time_stamp: notification.time_stamp,
          caller_id: notification.response_id,
        });
      } else {
        const ntfs = this.state.notifications.slice();
        ntfs.push(
          new NotificationModel(notification, this.onDismissNotification)
        );
        this.setState({ notifications: ntfs });
      }
    };
  }

  onDismissNotification = (notification: NotificationModel) => {
    let ntfs = this.state.notifications.slice();
    if (!ntfs.includes(notification)) {
      return;
    }
    ntfs.splice(ntfs.indexOf(notification), 1);
    this.setState({ notifications: ntfs });
  };

  render() {
    return (
      <div id="notification-container">
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
