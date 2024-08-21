import { html, render } from '@lit-labs/ssr';
import { collectResult} from '@lit-labs/ssr/lib/render-result.js';

const delayed = (time = 1000, slot = '') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const htm = html`<p slot="${slot}">${slot} - Delay: ${time} - Time: ${Date.now()}</p>`;
      const data = render(htm)
      resolve(data);
    }, time);
  });
}

const suspend = function* suspend() {
  yield delayed(1000, 'b');
  yield delayed(2000, 'c');
  yield delayed(500, 'a');
}

export default function* document(page, header) {
  yield* render(html`<!doctype html>
  <html lang="${header?.lang}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      ${header?.getScripts()}
      <title>${header?.title}</title>
    </head>
    <body>`);
      
    // yield* render(html`${page}`);

    /*
    yield* render(html`
      <template shadowrootmode="open">
        <header>Header: ${Date.now()}</header>
        <main>
          <slot name="a"><p>Fallback area A</p></slot>
          <slot name="b"><p>Fallback area B</p></slot>
          <slot name="c"><p>Fallback area C</p></slot>
        </main>
        <footer>Footer</footer>
      </template>
    `)

    yield* suspend();
    */

    yield* render(html`
<template shadowrootmode="open">

  <header>          
    <template shadowrootmode="open">
      <slot name="a"></slot>
    </template>
    <slot slot="a" name="a"></slot>
  </header>

  <main>
    <template shadowrootmode="open">
      <slot name="b"></slot>
    </template>
    <slot slot="b" name="b"></slot>
  </main>

  <footer>
    <template shadowrootmode="open">
      <slot name="c"></slot>
    </template>
    <slot slot="c" name="c"></slot>
  </footer>

</template>
    `);

    yield* suspend();

    yield* render(html`</body>
  </html>`);

};
