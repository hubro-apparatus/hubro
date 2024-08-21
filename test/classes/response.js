import { test } from 'node:test';
import assert from 'node:assert/strict';

import HResponse from '../../lib/classes/response.js';

test('Response - .location', async (t) => {
  await t.test('Default value', () => {
    const response = new HResponse();
    assert.equal(response.location, undefined, 'Should be "undefined"');
  });

  await t.test('Set value', () => {
    const response = new HResponse();
    response.location = new URL('http://localhost:4000/foo');
    assert.ok(response.location instanceof URL, 'Should be instance of URL');
    assert.equal(response.location.href, 'http://localhost:4000/foo', 'Should be set value');
    assert.equal(response.status, 308, 'Should be 308');
  });

  await t.test('Illegal value', () => {
    const response = new HResponse();
    try {
      response.location = 'http://localhost:4000/foo';
    } catch (err) {
      assert.match(err.message, /Value must be of type URL/, 'Should throw');
    }
  });

  await t.test('Status is a 3xx value', () => {
    const response = new HResponse();
    response.status = 301;
    response.location = new URL('http://localhost:4000/foo');
    assert.equal(response.location.href, 'http://localhost:4000/foo', 'Should be set value');
    assert.equal(response.status, 301, 'Should keep existing status');
  });
});

test('Response - .headers', async (t) => {
  await t.test('Default value', () => {
    const response = new HResponse();
    assert.ok(response.headers instanceof Headers, 'Should be instance of Headers');
  });

  await t.test('Set value', () => {
    const response = new HResponse();
    response.headers = new Headers({ foo: 'bar' });
    assert.ok(response.headers instanceof Headers, 'Should be instance of Headers');
    assert.equal(response.headers.get('foo'), 'bar', 'Should be set value');
  });

  await t.test('Illegal value', () => {
    const response = new HResponse();
    try {
      // @ts-expect-error Testing bad input
      response.headers = 'foo:bar';
    } catch (err) {
      assert.match(err.message, /Value must be of type Headers/, 'Should throw');
    }
  });
});

test('Response - .context', async (t) => {
  await t.test('Default value', () => {
    const response = new HResponse();
    assert.ok(response.context instanceof Object, 'Should be instance of Object');
  });

  await t.test('Set value', () => {
    const response = new HResponse();
    response.context = { foo: 'bar' };
    assert.equal(response.context.foo, 'bar', 'Should be set value');
  });
});

test('Response - .status', async (t) => {
  await t.test('Default value', () => {
    const response = new HResponse();
    assert.equal(response.status, 200, 'Should be 200');
  });

  await t.test('Set 2xx value', () => {
    const response = new HResponse();

    response.status = 204;
    assert.equal(response.status, 204, 'Should be set value');

    response.status = 200;
    assert.equal(response.status, 200, 'Should be set value');
  });

  await t.test('Set 3xx value', () => {
    const response = new HResponse();

    response.status = 302;
    assert.equal(response.status, 302, 'Should be set value');
  });

  await t.test('Illegal value', () => {
    const response = new HResponse();
    try {
      // @ts-expect-error Testing bad input
      response.status = '204';
    } catch (err) {
      assert.match(err.message, /Value must be a integer/, 'Should throw');
    }
  });

  await t.test('Set 4xx value', () => {
    const response = new HResponse();
    try {
      response.status = 404;
    } catch (err) {
      assert.match(err.message, /For sending 4xx or 5xx HTTP errors, throw a HttpError instead/, 'Should throw');
    }
  });

  await t.test('Set 5xx value', () => {
    const response = new HResponse();
    try {
      response.status = 500;
    } catch (err) {
      assert.match(err.message, /For sending 4xx or 5xx HTTP errors, throw a HttpError instead/, 'Should throw');
    }
  });

  await t.test('Set out of range value', () => {
    const response = new HResponse();

    try {
      response.status = 1;
    } catch (err) {
      assert.match(err.message, /Value must be a legal 2xx or 3xx HTTP status code/, 'Should throw');
    }

    try {
      response.status = 666;
    } catch (err) {
      assert.match(err.message, /Value must be a legal 2xx or 3xx HTTP status code/, 'Should throw');
    }
  });
});

test('Response - .type', async (t) => {
  await t.test('Default value', () => {
    const response = new HResponse();
    assert.equal(response.type, 'text/html; charset=utf-8', 'Should be text/html; charset=utf-8');
  });

  await t.test('Set value', () => {
    const response = new HResponse();
    response.type = 'application/json; charset=utf-8';
    assert.equal(response.type, 'application/json; charset=utf-8', 'Should be set value');
  });
});
