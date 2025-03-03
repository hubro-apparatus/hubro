# Request

Request is an immutable object which represents an incoming HTTP request to the server. It holds values such as:

- HTTP Request Headers
- URL parameters (route parameters)
- Search Query Parameters

The Request object is passed through the lifecycle of the global middleware,
the routes middleware and the `page`, `action` or `route` of a request.

The Object is request bound which means that its **only** available for the request which is being processed. Any data stored on a request bound Object is **not** available to another request which might be processed in paralell.

The Request object in Hubro is a small abstraction on top of the [Node.js Request](https://nodejs.org/docs/latest/api/globals.html#request)
handeled by the underlaying HTTP server. The values on this object have been parsed and
processed by the underlying HTTP server and Hubro.

## Properties

The Request object has the following properties.

### .urlParams

A getter returning an object with the parameters from the URL as specified by the router.

As an example, say you have a route like this:


- `/pages`
  - `/[type]`
    - `/[id]`
      - `/page.js`

Given a request for the URL `http://localhost:4000/owl/234827/` the returned object will be as follows:

```js
{
    type: 'owl',
    id: 234827,
}
```


Below is an example of getting the `id` URL parameter in a middleware.

```js
export const middleware = async ({ server, request, response }) => {
  const { id } = request.urlParams;
  return {
    id,
  };
};
```

Setting a value on this property will throw an Error.

### .headers

A getter that returns a [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
object with the HTTP headers of the request.

Below is an example of getting the `x-hubro` HTTP header in a middleware.

```js
export const middleware = async ({ server, request, response }) => {
  const bird = request.headers.get('x-hubro');
  return {
    bird,
  };
};
```

Setting a value on this property will throw an Error.

### .method

A getter that returns the HTTP method for the request. The returned value will always be upper case.

Below is an example of doing different operations in a middleware based on the request method.

```js
export const middleware = async ({ server, request, response }) => {
  if (request.method === 'POST') {
    // Do something
  }

  if (request.method === 'GET') {
    // Do something else
  }
};
```

Setting a value on this property will throw an Error.

### .body

A getter that returns the body of the HTTP request.

On a `GET` request this value will always be `null`.

On `POST`, `PUT` and `DELETE` requests the value will be a
[FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
object containing the data of the payload.

Say you have a form that `POST`s an input field with the name `bird` to the route `/submit`.

```html
<form action="/submit" method="POST">
  <input name="bird">
  <button>Submit</button>
</form>
```

When the form is submitted, the values of the form can be accessed as follow in `pages/submit/action.js`.

```js
export default async ({ server, request, response }) => {
  const bird = request.body.get('bird');
};
```

Setting a value on this property will throw an Error.

### .url

A getter that returns the URL of the request as a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) object.

```js
export const middleware = async ({ server, request, response }) => {
  const pathname = request.url.pathname;

  if (pathname === '/owl') {
    // do something special for owls
  }
};
```

Setting a value on this property will throw an Error.

#### Search Query Parameters

Search Query Parameters to a request is accessibe as a web standard [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
object on the `.searchParams` property of the returned URL Object on the `.url` property.

Below is an example of accessing a Search Query Parameter on the Request object in a middleware.

```js
// Example request URL
// http://localhost:4321/example/?text=Hello%2C%20World!

export const middleware = async ({ server, request, response }) => {
  // Hello, World!
  const text = request.url.searchParams.get('text');
  return {
    text,
  };
};
```

## Methods

The Request object has the following methods.

### .toRequest(url)

Returns the Request as a browser-compatible [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request) object.

This web standard Request object can for example be used directly in [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) to do HTTP requests.

The method takes the following arguments:

- `url` - `optional` - An [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) object to use as an alternative value instead of the `.url` value on the incoming Request.

Below is an example of a middleware where all properties of the incomming request are forwarded on an HTTP request to an upstream HTTP server.

```js
export const middleware = async ({ server, request, response }) => {

  // Clone the URL object of the incomming request.
  const url = new URL(request.url);

  // Set a new upstream host. This changes the host but will
  // keep pathname, search query params, protocol etc from
  // the original URL object.
  url.host = 'api.service.hubro.dev';

  // Pass the new URL on to the method. The returned
  // Request object now holds all headers, search query
  // params etc from the original request but it has a
  // new host.
  const upstream = request.toRequest(url);

  // Use the returned Request object to do an HTTP request
  // to the upstream host.
  const req = await fetch(upstream);
  const obj = await req.json();

  return obj;
};
```