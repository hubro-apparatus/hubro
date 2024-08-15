# Response

The Response Object is an Object which is used to create an outgoing HTTP response from the server. 

The Object is created by the server and is used to set values, such as HTTP status, Headers etc, on as it is passed through the lifecycle of the global middleware, the routes middleware and the `page`, `action` or `route` of a request. 

Example of setting a new status, which will yeld the server to respond with this status code instead of the default (200), on the Response Object in a middleware: 

```js
export const middleware = async (request, response) => {
  response.status = 204;
};
```

The Response Object in Hubro is a small abstraction on top of the node.js response handeled by the underlaying HTTP server. The values on this Object is used to produce the final HTTP response by the underlaying HTTP server and Hubro.

## Properties

The Response Object has the following properties:

### .location

A setter and getter for setting [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) on the response.

Location dictates HTTP Clients (and browsers) to request a new location, aka a redirect. Setting a location will also set `.status` to `308`. The `.status` can be set to a different status code after location have been set.

The value is a web standard [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) Object.

Example of creating a redirect to a different pathname, `/owl`, on the same server in a middleware:

```js
export const middleware = async (request, response) => {
  response.location = new URL('/owl', request.url);
};
```

### .headers

A setter and getter for setting [`HTTP Headers`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) on the response.

The property hold an web standard [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) Object. Setting HTTP Headers is done by appending headers to this Object. 

Example of appending a `x-hubro` HTTP Header to a response in a middleware:

```js
export const middleware = async (request, response) => {
  response.headers.append('x-hubro', 'owl');
};
```

One can replace the existing Headers Object by setting a new Header Object on the property.

Example of setting a new Header Object in a middleware:

```js
export const middleware = async (request, response) => {
  const headers = new Headers({
    'x-hubro': 'owl',
  });
  response.headers = headers;
};
```

### .context

A setter and getter for setting arbitrary values. By default an empty Object literal.

This property can be used to set any value which is shared through the lifecycle of a request. Values which needs to be passed from global level middleware to routes level middleware and to `pages`, `actions`  and `routes` should be set here.

Please see the section "Writing middlewares" for further information.

Example of setting a context value in a middleware:

```js
export default async (request, response) => {
  response.context = {
    bird: 'owl',
  };
};
```

### .status

A setter and getter for setting the [`Status Code`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of the response.

The value must be a numeric value in the range of [`200-299`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses) (Successful Responses) or [`300-399`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages) (Redirection messages).

Example of setting a `307` redirection status code in an `action`:

```js
export default async (request, response) => {
  response.status = 307;
};
```

Client error responses ([`4xx`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses)) and Server error responses ([`5xx`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses)) should not be set directly on the Response. These should be created by throwing a HTTP Error Object. 

See Error Handling for further information.

### .type

A setter and getter for setting the [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) of the response.

The value must be a [MIME type](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Configuring_server_MIME_types) as a String.

The Hubro will set different defaults based on what type of route is being invoked:

 * Pages - `text/html; charset=utf-8`
 * Actions - `text/plain; charset=utf-8`
 * Routes - `application/json; charset=utf-8`
