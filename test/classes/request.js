import { test } from 'node:test';
import assert from 'node:assert/strict';

import HRequest from '../../lib/classes/request.js';

test('Request - .urlParams', async (t) => {
  await t.test('Default value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    assert.ok(request.urlParams instanceof Object, 'Should be instance of Object');
  });

  await t.test('With value', () => {
    const request = new HRequest('http://hubro.dev/foo/', {
      params: { hubro: 'owl' },
    });
    assert.ok(request.urlParams instanceof Object, 'Should be instance of Object');
    assert.equal(request.urlParams.hubro, 'owl', 'Should be set value');
  });

  await t.test('Set value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    try {
      request.urlParams = { hubro: 'owl' };
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw');
    }
  });
});

test('Request - .headers', async (t) => {
  await t.test('Default value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    assert.ok(request.headers instanceof Headers, 'Should be instance of Headers');
  });

  await t.test('With value', () => {
    const request = new HRequest('http://hubro.dev/foo/', {
      headers: { 'x-hubro': 'owl' },
    });
    assert.ok(request.headers instanceof Headers, 'Should be instance of Headers');
    assert.equal(request.headers.get('x-hubro'), 'owl', 'Should be set value');
  });

  await t.test('Set value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    try {
      request.headers = new Headers();
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw');
    }
  });
});

test('Request - .method', async (t) => {
  await t.test('Default value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    assert.equal(request.method, 'GET', 'Should be "GET"');
  });

  await t.test('With value', () => {
    const request = new HRequest('http://hubro.dev/foo/', {
      method: 'post',
    });
    assert.equal(request.method, 'POST', 'Should be "POST"');
  });

  await t.test('Set value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    try {
      request.method = 'POST';
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw');
    }
  });
});

test('Request - .body', async (t) => {
  await t.test('Default value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    assert.equal(request.body, null, 'Should be "null"');
  });

  await t.test('With value', () => {
    const reqPost = new HRequest('http://hubro.dev/foo/', {
      method: 'post',
    });
    assert.equal(reqPost.method, 'POST', 'Should be "POST"');
    assert.ok(reqPost.body instanceof FormData, 'Should be instance of FormData');

    const reqPut = new HRequest('http://hubro.dev/foo/', {
      method: 'put',
    });
    assert.equal(reqPut.method, 'PUT', 'Should be "PUT"');
    assert.ok(reqPut.body instanceof FormData, 'Should be instance of FormData');
  });

  await t.test('Set value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    try {
      request.body = new FormData();
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw');
    }
  });
});

test('Request - .url', async (t) => {
  await t.test('Default value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    assert.ok(request.url instanceof URL, 'Should be instance of URL');
    assert.equal(request.url.host, 'hubro.dev', 'Should be host of set value');
  });

  await t.test('Set value', () => {
    const request = new HRequest('http://hubro.dev/foo/');
    try {
      request.url = new URL('http://localhost:4000');
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw');
    }
  });
});

test('Request - .toRequest()', async (t) => {
  await t.test('Default value', () => {
    const request = new HRequest('http://hubro.dev/foo/', {
      headers: {
        'x-hubro': 'owl',
      },
    });
    const copy = request.toRequest();
    assert.ok(copy instanceof Request, 'Should be instance of Request');
  });
});
