import { test } from 'node:test';
import assert from 'node:assert/strict';

import Hierarchy from '../../lib/hierarchy/hierarchy.js';
import Config from '../../lib/common/config.js';

test('Hierarchy - .setDocument()', async (t) => {
  await t.test('Default', async () => {
    const config = new Config();
    const hierarchy = new Hierarchy({ config });

    const result = await hierarchy.setDocument();

    assert.ok(result instanceof URL, 'Should be a URL object');
    assert.ok(result.href.endsWith('/defaults/system/document.js'), 'Should end with to /defaults/system/document.js');
  });
});

test('Hierarchy - .setError()', async (t) => {
  await t.test('Default', async () => {
    const config = new Config();
    const hierarchy = new Hierarchy({ config });

    const result = await hierarchy.setError();

    assert.ok(result instanceof URL, 'Should be a URL object');
    assert.ok(result.href.endsWith('/defaults/system/error.js'), 'Should end with to /defaults/system/error.js');
  });
});

test('Hierarchy - .setNotFound()', async (t) => {
  await t.test('Default', async () => {
    const config = new Config();
    const hierarchy = new Hierarchy({ config });

    const result = await hierarchy.setNotFound();

    assert.ok(result instanceof URL, 'Should be a URL object');
    assert.ok(
      result.href.endsWith('/defaults/system/not-found.js'),
      'Should end with to /defaults/system/not-found.js',
    );
  });
});
