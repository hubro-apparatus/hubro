import { html, render } from '@lit-labs/ssr';

const delayed = (time = 1000, slot = '') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const htm = html`<p slot="${slot}">Delay: ${time} - Time: ${Date.now()}</p>`;
      const data = render(htm)
      resolve(data);
    }, time);
  });
}

const suspend = function* suspend(time, slot) {
  const value = yield delayed(time, slot);
  return render(value);
}

export default function* document(page, header) {
  yield* render(html`<!doctype html>
  <html lang="${header?.lang}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <title>${header?.title}</title>
    </head>
    <body>`);
      
    // yield* render(html`${page}`);

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


    yield* suspend(1000, 'c');
    yield* suspend(2000, 'a');
    yield* suspend(500, 'b');
    

    /*
    yield* render(html`
          <template shadowrootmode="open">
            <header>Header: ${Date.now()}</header>
            <main>
              <slot name="content">Fallback</slot>
            </main>
            <footer>Footer</footer>
          </template>  
    `)

    yield* helper(2000);
    yield* helper(500);
    yield* helper(1000);
    */

    yield* render(html`</body>
  </html>`);
  
  /*
  return html`<!doctype html>
    <html lang="${header?.lang}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        ${header?.getScripts()}
        <title>${header?.title}</title>
      </head>
      <body>
        ${page}
      </body>
    </html> `;
    */
};
