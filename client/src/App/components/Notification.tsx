import React from 'react';
import { Card, Icon } from 'semantic-ui-react';
import { Notification as NotificationModel } from '../models/Notification';

interface Props {
  notification: NotificationModel;
}

class Notification extends React.Component<Props> {
  state = {};
  color = () => {
    const type = this.props.notification.type;
    if (type === 'error') {
      return 'red';
    }
    if (type === 'warn') {
      return 'orange';
    }
    if (type === 'success') {
      return 'green';
    }
    return 'blue';
  };

  render() {
    const notification = this.props.notification;
    return (
      <div style={{ padding: '4px', position: 'relative' }} className="notification">
        <Card color={this.color()} fluid raised>
          <Card.Meta className="notification-header">
            {notification.timeString.toLocaleTimeString()}
          </Card.Meta>
          <Card.Content>
            <div style={{ position: 'absolute', top: '0px', right: '4px' }}>
              <Icon
                name="close"
                className="clickable"
                onClick={() => {
                  notification.dismiss();
                }}
              />
            </div>
            <div>
              <pre style={{ margin: 0 }}>{notification.message}</pre>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }
}

export default Notification;
