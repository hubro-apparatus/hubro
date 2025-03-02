import { test } from 'node:test';
import assert from 'node:assert/strict';

import HServer from '../../lib/classes/server.js';

test('Server - .config', async (t) => {
  await t.test('Default value', () => {
    const server = new HServer();
    assert.equal(server.config, undefined, 'Should be "undefined"');
  });
});
