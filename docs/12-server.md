# Server

The Server Object is an Object which hold properties and features which is bound to the instance of the running application server.

It is created by the server and hold such as, as an example, the server config and environment variables and provide access to adapters and the logger. 

This Object is application bound which means it **is** available for the whole server and are shared between requests which is being processed. Any data stored on a application bound Object **are** available to another request which might be processed in paralell.

In a Hubro application the Server Object is made avaiable to middlewares and adapters.

Example of setting a info log message in a middleware: 

```js
export const middleware = async ({ server, request, response }) => {
      server.log.info('Logging from middleware');
};
```

Example of setting a log message in an adapter:

```js
export default class {
    constructor({ log } = {}) {
        this.name = 'db';
        log.info('Logging from an adapter');
    }
}
```

## Properties

The Server Object has the following properties:

### .config

A getter that returns the servers Config Object. See the Config section for further documentaion on which properties are available. 

Example of getting the configured `port` of the server in a middleware:

```js
export const middleware = ({ server, request, response }) => {
  return {
    port: server.config.serverPort,
  }
};
```

### .log

A getter that returns the built in logger, [Pino](https://getpino.io/), in Hubro. See the Logging section for further documentaion on which methods and properties are available. 

Example of setting a info log message in a middleware: 

```js
export const middleware = async ({ server, request, response }) => {
      server.log.info('Logging from middleware');
};
```

### .env

TO BE IMPLEMENTED

## Adapters

One of the core features of the Server Object is to provide access to the Adapters configured for the application. Adapters are accessable through properties on the Server Object which reflects the `name` of the adapter.

In other words; if an adapter is given the name `db`, the adapter are available as `.db` on the Server Object.

This is best explained through an example:

```js
export default class {
    constructor({ log } = {}) {
        this.name = 'db';
    }

    text() {
        return 'Hello World';
    }
}
```

In the above we define an adaptor with the name `db`.

```js
export const middleware = async ({ server, request, response }) => {
      const text = server.db.text();
      return { text };
};
```

We can then access this adapter on the Server Object in a middleware on `server.db` as shown above.

### Reserved names

Due to adapters being set as properties directly on the Server Object by the name of the adapters, adapters can not be named with one of the already existing properties on the Server Object. 

In other words; the following can not be used as adapter names:

 * 'config'
 * 'log'
 * 'env'

If an adapter use any of these names, the server will throw and the adapter will not be mounted.
