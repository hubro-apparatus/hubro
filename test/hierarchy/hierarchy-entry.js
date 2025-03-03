import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import Entry from '../../lib/hierarchy/hierarchy-entry.js';

test('HierarchyEntry - Constructor', async (t) => {
  await t.test('Set arguments', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');

    assert.strictEqual(hierarchy.hash, 'hash-value', 'Should be set value on constructor');
    assert.strictEqual(hierarchy.route, '/route/value', 'Should be set value on constructor');
  });
});

test('HierarchyEntry - .bundle', async (t) => {
  await t.test('Default', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    assert.strictEqual(hierarchy.bundle, false, 'Should be "false" when ".uriClient" is NOT set');

    hierarchy.uriClient = pathToFileURL('/client.js');
    assert.strictEqual(hierarchy.bundle, true, 'Should be "true" when ".uriClient" is set');

    try {
      // @ts-ignore
      hierarchy.bundle = true;
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw if being set directly');
    }
  });
});

test('HierarchyEntry - .uriMiddleware', async (t) => {
  await t.test('Default', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    assert.strictEqual(hierarchy.uriMiddleware, undefined, 'Should be empty String');

    const fileMiddleware = pathToFileURL('/middleware.js');

    hierarchy.uriMiddleware = fileMiddleware;
    assert.strictEqual(hierarchy.uriMiddleware.pathname, fileMiddleware.pathname, 'Should be set value');
  });
});

test('HierarchyEntry - .uriClient', async (t) => {
  await t.test('Default', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    assert.strictEqual(hierarchy.uriClient, undefined, 'Should be empty String');

    const fileClient = pathToFileURL('/client.js');

    hierarchy.uriClient = fileClient;
    assert.strictEqual(hierarchy.uriClient.pathname, fileClient.pathname, 'Should be set value');
  });
});

test('HierarchyEntry - .uriAction', async (t) => {
  await t.test('Default', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    assert.strictEqual(hierarchy.uriAction, undefined, 'Should be empty String');

    const fileAction = pathToFileURL('/action.js');

    hierarchy.uriAction = fileAction;
    assert.strictEqual(hierarchy.uriAction.pathname, fileAction.pathname, 'Should be set value');
  });
});

test('HierarchyEntry - .uriRoute', async (t) => {
  await t.test('Default', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    assert.strictEqual(hierarchy.uriRoute, undefined, 'Should be empty String');

    const fileRoute = pathToFileURL('/route.js');

    hierarchy.uriRoute = fileRoute;
    assert.strictEqual(hierarchy.uriRoute.pathname, fileRoute.pathname, 'Should be set value');
  });
});

test('HierarchyEntry - .uriPage', async (t) => {
  await t.test('Default', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    assert.strictEqual(hierarchy.uriPage, undefined, 'Should be empty String');

    const filePage = pathToFileURL('/page.js');

    hierarchy.uriPage = filePage;
    assert.strictEqual(hierarchy.uriPage.pathname, filePage.pathname, 'Should be set value');
  });
});

test('HierarchyEntry - "type" is "empty"', async (t) => {
  await t.test('no .uri* properties is set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    assert.strictEqual(hierarchy.type, 'empty', 'Should be "empty"');
  });
});

test('HierarchyEntry - "type" is "api"', async (t) => {
  await t.test('.uriRoute is set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    hierarchy.uriAction = pathToFileURL('/action.js');
    hierarchy.uriClient = pathToFileURL('/client.js');
    hierarchy.uriPage = pathToFileURL('/page.js');

    hierarchy.uriRoute = pathToFileURL('/route.js');

    assert.strictEqual(hierarchy.type, 'api', 'Should be "api"');
  });
});

test('HierarchyEntry - "type" is "page"', async (t) => {
  await t.test('.uriPage, .uriAction and .uriClient is set. .uriRoute is not set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    hierarchy.uriAction = pathToFileURL('/action.js');
    hierarchy.uriClient = pathToFileURL('/client.js');
    hierarchy.uriPage = pathToFileURL('/page.js');

    assert.strictEqual(hierarchy.type, 'page', 'Should be "page"');
    assert.strictEqual(hierarchy.bundle, true, 'Should be "true"');
  });

  await t.test('.uriPage, and .uriClient is set. .uriRoute and .uriAction is not set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    hierarchy.uriClient = pathToFileURL('/client.js');
    hierarchy.uriPage = pathToFileURL('/page.js');

    assert.strictEqual(hierarchy.type, 'page', 'Should be "page"');
    assert.strictEqual(hierarchy.bundle, true, 'Should be "true"');
  });

  await t.test('.uriAction and .uriClient is set. .uriRoute and .uriPage is not set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    hierarchy.uriAction = pathToFileURL('/action.js');
    hierarchy.uriClient = pathToFileURL('/client.js');

    assert.strictEqual(hierarchy.type, 'page', 'Should be "page"');
    assert.strictEqual(hierarchy.bundle, true, 'Should be "true"');
  });

  await t.test('.uriPage and .uriAction is set. .uriRoute and .uriClient is not set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    hierarchy.uriAction = pathToFileURL('/action.js');
    hierarchy.uriPage = pathToFileURL('/page.js');

    assert.strictEqual(hierarchy.type, 'page', 'Should be "page"');
    assert.strictEqual(hierarchy.bundle, false, 'Should be "false"');
  });

  await t.test('.uriPage is set. .uriRoute, .uriAction and .uriClient is not set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    hierarchy.uriPage = pathToFileURL('/page.js');

    assert.strictEqual(hierarchy.type, 'page', 'Should be "page"');
    assert.strictEqual(hierarchy.bundle, false, 'Should be "false"');
  });

  await t.test('.uriAction is set. .uriRoute, .uriPage and .uriClient is not set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    hierarchy.uriAction = pathToFileURL('/action.js');

    assert.strictEqual(hierarchy.type, 'page', 'Should be "page"');
    assert.strictEqual(hierarchy.bundle, false, 'Should be "false"');
  });
});

test('HierarchyEntry - "type" is "client"', async (t) => {
  await t.test('Only .uriClient is set', async () => {
    const hierarchy = new Entry('hash-value', '/route/value');
    hierarchy.uriClient = pathToFileURL('/client.js');

    assert.strictEqual(hierarchy.type, 'client', 'Should be "client"');
    assert.strictEqual(hierarchy.bundle, true, 'Should be "true"');
  });
});
