# Routing

Hubro uses file-based routing inside the `/pages` directory.
Each directory in `pages` corresponds to a URL and can hold
either:

- [Pages](#pages)
- [Actions](#actions)
- [API routes](#api-routes)

## Pages

Hubro's file-based router looks for `page.js` files inside each subdirectory of `/pages`.

- `/pages`
  - `/about`
    - `page.js`
  - `page.js`

Pages must include a function as its default export. That function must return
a Lit `TemplateResult` (typically [html](https://lit.dev/docs/api/static-html/#html)).

```js
import { html } from 'hubro/ssr';

export default () => {
  return html`
    <h1>Hello, World!</h1>
  `;
};
```

### metadata

Pages can export a `metadata` function that will be included in the document `<head>`.
A common use case is to set a descriptive `<title>`.

```js
export const metadata = () => {
  return {
    title: 'Hello, World!',
  };
};
```

## Actions

Hubro's file-based router looks for `action.js` files inside each subdirectory of `/pages`.
Actions are designed to accept [form submissions](https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_and_retrieving_form_data#on_the_client_side_defining_how_to_send_the_data).
Actions must include an `async` function as its default export. The function is passed a [request] and [response] as its two arguments.

### Actions example

Let's make a form that submits your favorite `bird` to an action. We'll be working with a `/pages` directory that looks like this.

- `/pages`
  - `/submit`
    - `action.js`
    - `page.js`
  - `page.js`

In `pages/page.js` we add a form that `POST`s an `input` with the name `bird` to the action `/submit`.

```js
import { html } from 'hubro/ssr';

export default () => {
  return html`
    <form action="/submit" method="POST">
      <input name="bird">
      <button>Submit</button>
    </form>
  `;
};
```

Our `action.js` in the `/submit` subdirectory can read the submitted value via the [request object](./9-request.md#body).

```js
export default async (request, response) => {
  const bird = request.body.get('bird');
};
```

## API routes

While [actions](#actions) are great for handling form inputs,
sometimes you need to fetch a value from the browser or have some other interaction between browser and server.

Hubro's file-based router looks for `route.js` files inside each subdirectory of `/pages`. By convention it's
recommended to place `route.js` in an `/api` subdirectory to avoid name collisions with a page or action,
which both take precedence over an API route.

An API route must export at least one `async` function with a name matching the HTTP method it will handle:

- `GET`
- `POST`
- `PUT`

Each function gets the same [request] and [response] objects as an action.

Each function must return its response body.
`Content-Type` defaults to `application/json`, but you can change that with the `response` object.

```js
export const GET = async (request, response) => {
  return {
    time: Date.now(),
  };
}

export const POST = async (request, response) => {
  return {
    created: Date.now(),
    success: true,
  };
}

export const PUT = async (request, response) => {
  return {
    updated: Date.now(),
    success: true,
  };
}
```

## URL parameters

Some routes are dynamic, for instance the ID of a shop item page, or the title of a blog post.
Hubro's file-based router supports URL parameters by using square brackets in the directory name.

Let's build the routes for a blog.
We'll want a landing page and a page that should handle the rendering of our blog posts.

- `/pages`
  - `/post`
    - `/[slug]`
      - `page.js`
  - `page.js`

Here Hubro will use `/pages/post/[slug]/page.js` to render both `/post/hello-world`,
`/post/my-second-post` and whatever else we might name our blog posts.

### URL parameters in APIs

The same square bracket syntax can be applied to API routes.
By convention API routes are placed in an `/api` subdirectory, but you can include as many URL parameters as you'd like
inside that directory.

- `/pages`
  - `/chat`
    - `/api`
      - `/[thread]`
        - `route.js`
          - `/[message]`
            - `route.js`
    - `page.js`
  - `page.js`

[request]: ./9-request.md
[response]: ./10-response.md