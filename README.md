# SocketIo Server

General purpose socket.io server coming with lightweight react app to generate and receive events.

## Emmited Events

In the examples, `device_id` is expected to be **FooBar**, `device_nr` to be `0` and a random `time_stamp` (seconds since epoch).

### `new_data`

a `new_data` event always has the following format:

```js
{
  device_id: 'FooBar',
  device_nr: 0,
  time_stamp: 12,
  type: 'key' | 'acceleration' | 'gyro' | 'pointer' | 'notification'
}
```

Optionally, the new_data event can be sent

-   to **all connected devices**:
    ```js
    {
      ...,
      broadcast: true
    }
    ```
-   to **a specific device**
    ```js
    {
      ...,
      unicast_to: 2 // only send the message to the device number 2
    }
    ```

#### Controller

-   `key`
    ```js
    {
        device_id: 'FooBar',
        device_nr: 0,
        time_stamp: 1596731613.793,
        type: 'key',
        key: 'up' | 'right' |'down' |'left' | 'home'
    }
    ```
-   `acceleration`
    ```js
    {
        device_id: 'FooBar',
        device_nr: 0,
        time_stamp: 1596731613.793,
        type: 'acceleration',
        x: 0.0,
        y: 0.0,
        z: -9.81,
        interval: 32 /* A number representing the interval of time, in milliseconds, at which data is obtained from the device.*/
    }
    ```
-   `gyro`
    ```js
    {
        device_id: 'FooBar',
        device_nr: 0,
        time_stamp: 1596731613.793,
        type: 'gyro',
        alpha: 0.0,   /* between 0 and 360degrees */
        beta: 0.0,    /* between -180 and 180 degrees */
        gamma: 0.0, /* between -90 and 90 degrees */
        absolute: true /* whether or not the device is providing orientation data absolutely */
    }
    ```

#### Color Panel

-   `pointer`
    ```js
    {
        device_id: 'FooBar',
        device_nr: 0,
        time_stamp: 1596731613.793,
        type: 'pointer',
        context: 'color',
        x: 0, /* location on click, 0: left, <width>: right */
        y: 0, /* location on click, 0: top, <height>: bottom */
        width: 500,
        height: 700,
        color: 'yellow' /* current color of the panel */
    }
    ```

#### Color Grid

-   `pointer`
    ```js
    {
        device_id: 'FooBar',
        device_nr: 0,
        time_stamp: 1596731613.793,
        type: 'pointer',
        context: 'grid',
        row: 0,     /* row index of clicked cell */
        column: 0,  /* column index of clicked cell */
        color: 'teal' /* color of clicked cell */
    }
    ```

### Server

Run within project root

-   `yarn install` to install npm packages
-   `yarn start` to start the server on port `5000` and websockets on `5001`

### Client app

Run within client folder

-   `yarn install` to install npm packages
-   `yarn start` to start the client on port `3000`

## Deploy with Dokku

### Prerequirements

```sh
dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
```

### Configure

```sh
dokku apps:create socketio-server
dokku domains:add socketio-server "your.domain.com"
```

### Initial Deploy

```sh
git remote add dokku dokku@<your-ip>:socketio-server
git push dokku main:master
```

### Letsencrypt

Make sure:

-   you have set a domain and your page is reachable
-   no pagerules with permanent redirects e.g. from Cloudflare exists

```sh
dokku config:set --no-restart socketio-server DOKKU_LETSENCRYPT_EMAIL=lebalz@outlook.com
dokku letsencrypt socketio-server
```
