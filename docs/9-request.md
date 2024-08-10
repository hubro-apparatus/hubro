# Request

The Request Object is an imutable Object which represent a incomming HTTP request to the server. 

The Object is created by the server and hold values, such as Search Query Parameters, URL parameters and Headers, and is passed through the lifecycle of the global middleware, the routes middleware and the `page`, `action` or `route` of a request.

Example of accessing a Search Query Parameter on the Request Object in a middleware: 

```js
export const middleware = async (request, response) => {
  const text = request.url.searchParams.get('text');
  return {
    text,
  };
};
```

The Request Object in Hubro is a small abstraction on top of the node.js request handeled by the underlaying HTTP server. The values on this Object have been parsed and processed by the underlaying HTTP server and Hubro.

## Properties

The Request Object has the following properties:

### .urlParams

An getter returning an Object with the matched parameters in the URL by the router.

If one, as an example, have a route like this;

```sh
|--/pages
|  |--/[type]
|  |  |--/[id]
|  |  |  |--/page.js
```

and its requested as follow:

```sh
http://localhost:4000/owl/234827/
```

the returned Object will be as follow:

```js
{
    type: 'owl',
    id: 234827,
}
```

Example of getting the `id` URL parameter in a middleware:

```js
export const middleware = async (request, response) => {
  const { id } = request.urlParams;
  return {
    id,
  };
};
```

Setting an value on this property will throw an Error.

### .headers

An getter that returns an web standard [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) Object with the headers of the request. 

Example of getting the `x-hubro` HTTP Header in a middleware:

```js
export const middleware = async (request, response) => {
  const bird = request.headers.get('x-hubro');
  return {
    bird,
  };
};
```

Setting an value on this property will throw an Error.

### .method

An getter that returns the HTTP method for the route. The returned value will always be upper case.

Example of doing different operations based on if the request is a `GET` or `POST` request in a middleware:

```js
export const middleware = async (request, response) => {
  if (request.method === 'POST') {
    // Do something
  }

  if (request.method === 'GET') {
    // Do something else
  }
};
```

Setting an value on this property will throw an Error.

### .body

An getter that returns the payload of the HTTP request. 

On a `GET` request this value will always be `null`. On `POST`, `PUT` and `DELETE` requests the value will be a web standard [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) Object containing the data of the payload.

Example of a HTML form:

```html
<form action="/submit" method="POST">
  <input name="bird">
  <button>Submit</button>
</form>
```

When above form is submitted, the values of the form can be accessed as follow in an `action`:

```js
export default async (request, response) => {
  const bird = response.body.get('bird');
};
```

Setting an value on this property will throw an Error.

### .url

A getter that returns the URL of the request as an web standard [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) Object.

Example of getting the pathname of the URL in a middleware:

```js
export const middleware = async (request, response) => {
  const pathname = request.url.pathname;
  
  if (pathname === '/owl') {
    // do something specila for owls
  }
};
```

Setting an value on this property will throw an Error.

#### Search Query Parameters

Search Query Parameters to a request is accessibe as a web standard [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) Object on the `.searchParams` property of the returned URL Object on the `.url` property.

If a URL is requested with Search Query Parameters as follow:

```sh
http://localhost:4000/?bird=owl
```

the Search Query Parameters can be accessed as follow in a middleware:

```js
export const middleware = async (request, response) => {
  const bird = request.searchParams.get('bird');
  return {
    bird,
  };
};
```

## Methods

The Request Object has the following methods:

### .toRequest(url)

Returns a a web standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request) Object of the (this) Request Object.

This web standard Request Object can as an example be used directly in [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) to do HTTP requests.

The method takes the following arguments:

  * `url` - `optional` - An [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) Object to use as an alternative value instead of the `.url` value on the incoming Request. 

Example of a middleware where all properties of the incomming request is forwarded on a HTTP request to a upstream HTTP server:

```js
export const middleware = async (request, response) => {
  
  // Clone the URL object of the incomming request
  const url = new URL(request.url);

  // Set a new upstream host. This change the host but will 
  // keep pathname, search query params, protocol etc from 
  // the original
  url.host = 'api.service.hubro.dev';

  // Pass the cloded URL on to the method. The returned
  // Request object now holds all headers, search query
  // params etc from the original request but it has a
  // new host
  const upstream = request.toRequest(url);

  // Use the returned Request object to do a HTTP call
  // to the upstream host
  const req = await fetch(upstream);
  const obj = await req.json();

  return obj;
};
```