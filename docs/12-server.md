# Server

The Server Object is an Object which hold properties and features which is bound to the instance of the running application server.

The Object is created by the server and hold such as, as an example, the server config and environment variables and provide access to adapters and the logger. 

The Object is application bound which means that it **is** available for the server and shared between request which is being processed. Any data stored on a application bound Object **are** available to another request which might be processed in paralell.

Example of setting a info log message in a middleware: 

```js
export const middleware = async ({ server, request, response }) => {
      server.log.info('Logging from middleware');
};
```

## Properties

The Server Object has the following properties:

### .config

### .log

### .env

To be implemented

## Adapters