# Middleware

A middleware is an asyncronus function which is invoked server side before each `page`, `action` or `route` if provided. Middlewares have access to read values from the inbound request, such as Search Query Parameters, URL parameters and Headers, and can set values on the response, such as HTTP status code, Headers etc.

In a middleware one can also fetch data from a backend API or a database and the main purpose of a middleware is to populate data and pass it on for rendering or alter the response of a request before a render.

Simple example of a middleware which reads the search query parameter `text` and forwards it to a page:

```js
export const middleware = async ({ server, request, response }) => {
  const text = request.url.searchParams.get('text');
  return {
    text,
  };
};
```

Use the data from the middleware in a `page`:

```js
export default (props = {}) => {
  return html`
    <p>Search text is: ${props.text}.</p>
  `;
};
```

In this example the returned object in the `middleware` function is available on the `props` argument on the function in the `page`.

## Middleware levels

There are two levels of middleware in Hubro; Global level and route level. Both levels is written the in the same way.

### Global level

Global level middleware will run on all requests except the routes and files under the static endpoint and the routes used for providing local development features (such as the script and css HTTP endpoints).

The global level middleware is defined by a `middleware.js|ts` in the `./system/` folder:

```sh
|--/package.json
|--/hubro.config.js
|--/system
|  |--/middleware.js
|--/pages
|  |--/page.js
```

The global level middleware is an ideal place to do operations one want to do on every route.

### Router level

Router level middlewares will run for the HTTP route it is defined for. The routes level middleware will run after the global level middleware and have access to the properties set by the globel middleware and can override these properties if needed.

The route level middlewares is defined by a `middleware.js|ts` in the folder of the route it should be applied too or as a inline `middleware` function in the `page`, `action` or `route` file:

```sh
|--/package.json
|--/hubro.config.js
|--/pages
|  |--/page.js
|  |--/middleware.js
|  |--/[slug]
|  |  |--/page.js
|  |  |--/middleware.js
```

The route level middleware is an ideal place to do operations one want to do on only selected routes.

## Middleware and validation

TO BE IMPLEMENTED

## Writing middleware

A middleware is an asyncronus function exported with the name `middleware`. The function takes an argument object with the following argument properties:

 * server - An instance of Server - Holds properties features of the server
 * request - An instance of Request - Holds properties and values of the incomming HTTP request
 * response - An instance of Response - Holds properties and values to be written on the outgoing HTTP response

Example of a middleware signature:

```js
export const middleware = async ({ server, request, response }) => {
  // Middleware logic
};
```

The Server Object contain server bound properties and functionallity, such as adapters, the application config, envrionement variables etc which is global for the whole running instance of the application.

The Request Object is a read only Object which contain properties such as the Search Query Parameters, URL parameters and Headers on the inbound request. 

The Response Object contain properties to set values, such as HTTP status code, Headers, we want to set on the outbound response. The Response Object also contain a `.context` property for passing arbitrary values between middlewares and the `routes`, `actions` and `pages`.

### Reading request values

If one, as an example, have a route like this;

```sh
|--/pages
|  |--/[species]
|  |  |--/[name]
|  |  |  |--/page.js
```

and its requested as follow:

```sh
http://localhost:4000/owls/hubro/?sort=ascending
```

we get hold of the different parts in the URL in a middleware as follow:

```js
export const middleware = async ({ server, request, response }) => {

  // Access URL Parameters
  const { species, name } = request.urlParams;
  console.log(species);  // yields "owls"
  console.log(name);     // yields "hubro"

  // Access Search Query Parameters
  const sort = request.url.searchParams.get('sort');
  console.log(name);     // yields "ascending"
};
```

See the Request Object for an overview of properties and methods.

### Setting response values

Setting a HTTP header `x-hubro` to the value `owl` and redirecting to `/owl` with the HTTP status code `307`:

```js
export const middleware = async ({ server, request, response }) => {
  
  // Append an HTTP Header
  request.headers.append('x-hubro', 'owl');
  
  // Set the location to redirect too
  request.location = new URL('/owl', request.url);

  // Set the HTTP status code of the redirect
  response.status = 307;
};
```

See the Response Object for an overview of properties and methods.

### Passing data between middleware levels

Passing data between the Global Level middleware and the Route Level middleware is done by using the `.context` property on the Response Object.

Example of setting a value in the Global Level middleware:

```js
export const middleware = async ({ server, request, response }) => {
  response.context = {
    name: 'Hubro Apparatus',
  };
};
```

One can then read this value in the Route Level middleware:

```js
export const middleware = async ({ server, request, response }) => {
  const { name } = response.context;
  console.log(name);     // yields "Hubro Apparatus"
};
```

## Inline middleware

The route level middlewares can be defined by a `middleware.js|ts` in the folder of the route it should be applied too OR as and inlined middleware.

An inline `middleware` is defined by exporting an async function with the name `middleware` in the `page`, `action` or `route` file.

Example of an inline middleware in an `action` file:

```js
export const middleware = async ({ server, request, response }) => {
  return {
    type: 'owl',
  };
};

export default async ({ server, request, response }) => {
  const { type } = request.context;
  response.headers.append('x-hubro', type);
};
```

For most projects its recommended to keep middlewares in separate middeware files over inlining middlewares. The use case for inlining is mostly that is can reduce the amount of files in larger projects.

### Pages and Inline middleware

Its important to be aware that inlining middleware in `pages` come with some danger. Middlewares are functions which are invoked server side and are intended to only be used on the server.

On the other hand `pages` are web components which is intended to be able to be rendered in a browser while also being able to be server side rendered. When a Hubro application is built with the `hubro build` command `pages` are built into the client side browser bundle which is being served to end users.

In the build process inline middlewares in a `page` will be removed by default tree shaking in the build step so under normal circumstances middlewares should not end up into the client side browser bundle. 

BUT; its fully possible to break this default tree shaking causing the server side code in the middleware to end up in the client side browser bundle. This will affect bundle side and also has security aspect with it since its exposing server side code to the public.

### Actions and Routes and Inline middleware

Inlining middeware in `actions` and `routes` does not face the same challenge as inlining middeware in `pages`. Both `actions` and `routes` are invoked only on the server so inlining middleware in these does not expose the same danger of bundling up server side code into a browser bundle such as with `pages`.

### Precedence

If a `page`, `action` or `route` has a inline `middleware` function, this middleware has a higher precedence than a middleware file in the same folder. 

In the case where ex a `page` has a inline middleware and there is a middleware file in the same folder, the middleware file will not be loaded and only the inline middleware will be applied to the `page`.