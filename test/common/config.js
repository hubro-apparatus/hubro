import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import Config from '../../lib/common/config.js';
import { resolveCwd } from '../../lib/common/utils.js';

// Semver regex
// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semver = (str) => {
  const regex = new RegExp(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm,
  );
  return regex.test(str);
};

test('Config - .libVersion', async (t) => {
  await t.test('Get value', () => {
    const config = new Config();
    assert.ok(semver(config.libVersion), 'Should contain a valid semver value');
  });

  await t.test('Set value', () => {
    const config = new Config();
    try {
      config.libVersion = '1.0.0-test.1';
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw if being set');
    }
  });
});

test('Config - .development', async (t) => {
  await t.test('Default', () => {
    const config = new Config();
    assert.ok(config.development, 'Should be true');
  });

  await t.test('Set value by constructor', () => {
    const config = new Config({ development: false });
    assert.strictEqual(config.development, false, 'Should be false');
  });

  await t.test('Set value by setter', () => {
    const config = new Config();
    try {
      config.development = false;
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw if being set');
    }
  });
});

test('Config - .name', async (t) => {
  await t.test('Get value', () => {
    const config = new Config();
    assert.strictEqual(config.name, 'Hubro', 'Should be "Hubro"');
  });

  await t.test('Set value', () => {
    const config = new Config();
    config.name = 'foo';
    assert.strictEqual(config.name, 'foo', 'Should be set');
  });
});

test('Config - .cwd', async (t) => {
  await t.test('Default behaviour', () => {
    const config = new Config();
    assert.ok(config.cwd instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.cwd)), 'Should resolve to an absolute path');

    try {
      // @ts-ignore
      config.cwd = '/tmp';
    } catch (err) {
      assert.match(err.message, /Cannot set read-only property./, 'Should throw if being set');
    }
  });

  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: './tmp/some/path' });
    assert.ok(path.isAbsolute(fileURLToPath(config.cwd)), 'Should resolve to an absolute path');
    assert.ok(config.cwd.href.endsWith('/tmp/some/path/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp/some/path' });
    assert.ok(path.isAbsolute(fileURLToPath(config.cwd)), 'Should resolve to an absolute path');
    assert.ok(config.cwd.href.endsWith('/tmp/some/path/'), 'Should end with set path and have a / at the end');
  });
});

test('Config - .dirSrc', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';

    assert.ok(config.dirSrc instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirSrc)), 'Should resolve to an absolute path');
    assert.ok(config.dirSrc.href.endsWith('/tmp/src/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirSrc = '/src';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.src is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirAdapters', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';
    config.dirAdapters = './adapters';

    assert.ok(config.dirAdapters instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirAdapters)), 'Should resolve to an absolute path');
    assert.ok(
      config.dirAdapters.href.endsWith('/tmp/src/adapters/'),
      'Should end with set path and have a / at the end',
    );
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirAdapters = '/adapters';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.adapters is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirBuild', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';
    config.dirBuild = './build';

    assert.ok(config.dirBuild instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirBuild)), 'Should resolve to an absolute path');
    assert.ok(config.dirBuild.href.endsWith('/tmp/src/build/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirBuild = '/build';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.build is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirCompoents', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';
    config.dirComponents = './components';

    assert.ok(config.dirComponents instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirComponents)), 'Should resolve to an absolute path');
    assert.ok(
      config.dirComponents.href.endsWith('/tmp/src/components/'),
      'Should end with set path and have a / at the end',
    );
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirComponents = '/components';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.components is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirLayouts', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';
    config.dirLayouts = './layouts';

    assert.ok(config.dirLayouts instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirLayouts)), 'Should resolve to an absolute path');
    assert.ok(config.dirLayouts.href.endsWith('/tmp/src/layouts/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirLayouts = '/layouts';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.layouts is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirPublic', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';
    config.dirPublic = './public';

    assert.ok(config.dirPublic instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirPublic)), 'Should resolve to an absolute path');
    assert.ok(config.dirPublic.href.endsWith('/tmp/src/public/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirPublic = '/public';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.public is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirSystem', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';
    config.dirSystem = './system';

    assert.ok(config.dirSystem instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirSystem)), 'Should resolve to an absolute path');
    assert.ok(config.dirSystem.href.endsWith('/tmp/src/system/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirSystem = '/system';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.system is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirPages', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';
    config.dirPages = './pages';

    assert.ok(config.dirPages instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirPages)), 'Should resolve to an absolute path');
    assert.ok(config.dirPages.href.endsWith('/tmp/src/pages/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirPages = '/pages';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.pages is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirCss', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirCss = './styles';

    assert.ok(config.dirCss instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirCss)), 'Should resolve to an absolute path');
    assert.ok(config.dirCss.href.endsWith('/tmp/build/styles/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirCss = '/styles';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.css is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .dirJs', async (t) => {
  await t.test('Custom cwd - Relative path', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirJs = './scripts';

    assert.ok(config.dirJs instanceof URL, 'Should be a URL object');
    assert.ok(path.isAbsolute(fileURLToPath(config.dirJs)), 'Should resolve to an absolute path');
    assert.ok(config.dirJs.href.endsWith('/tmp/build/scripts/'), 'Should end with set path and have a / at the end');
  });

  await t.test('Custom cwd - Absolute path', () => {
    const config = new Config({ cwd: '/tmp' });
    try {
      config.dirJs = '/scripts';
    } catch (err) {
      assert.match(
        err.message,
        /Value for directories.js is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });
});

test('Config - .urlPathBase', async (t) => {
  await t.test('Set path - Default', () => {
    const config = new Config();
    assert.ok(config.urlPathBase instanceof URL, 'Should be a URL object');
    assert.equal(config.urlPathBase.pathname, '/', 'Should be /');
  });

  await t.test('Set path - Absolute path', () => {
    const config = new Config();
    try {
      config.urlPathBase = '/app';
    } catch (err) {
      assert.match(
        err.message,
        /Value for paths.base is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });

  await t.test('Set path - Set default ./', () => {
    const config = new Config();
    config.urlPathBase = './';
    assert.ok(config.urlPathBase instanceof URL, 'Should be a URL object');
    assert.equal(config.urlPathBase.pathname, '/', 'Should be /');
  });

  await t.test('Set path - Simple padded path', () => {
    const config = new Config();
    config.urlPathBase = './base/';
    assert.ok(config.urlPathBase instanceof URL, 'Should be a URL object');
    assert.equal(config.urlPathBase.pathname, '/base/', 'Should be /base/');
  });

  await t.test('Set path - Simple no padded path', () => {
    const config = new Config();
    config.urlPathBase = './base';
    assert.ok(config.urlPathBase instanceof URL, 'Should be a URL object');
    assert.equal(config.urlPathBase.pathname, '/base/', 'Should be /base/');
  });
});

test('Config - .urlPathPublic', async (t) => {
  await t.test('Set path - Default', () => {
    const config = new Config();
    assert.ok(config.urlPathPublic instanceof URL, 'Should be a URL object');
    assert.equal(config.urlPathPublic.pathname, '/public/', 'Should be /public/');
  });

  await t.test('Set path - Absolute path', () => {
    const config = new Config();
    try {
      config.urlPathPublic = '/pub';
    } catch (err) {
      assert.match(
        err.message,
        /Value for paths.public is not relative. Must be relative path./,
        'Should throw if absolute',
      );
    }
  });

  await t.test('Set path - Simple padded path', () => {
    const config = new Config();
    config.urlPathPublic = './pub/';
    assert.ok(config.urlPathPublic instanceof URL, 'Should be a URL object');
    assert.equal(config.urlPathPublic.pathname, '/pub/', 'Should be /pub/');
  });

  await t.test('Set path - Simple no padded path', () => {
    const config = new Config();
    config.urlPathPublic = './pub';
    assert.ok(config.urlPathPublic instanceof URL, 'Should be a URL object');
    assert.equal(config.urlPathPublic.pathname, '/pub/', 'Should be /pub/');
  });
});

test('Config - .load()', async (t) => {
  await t.test('Load file based user config', async () => {
    const cwd = path.join(resolveCwd(), '/fixtures/config');
    const config = new Config({ cwd });
    await config.load();

    assert.equal(config.serverPort, 9000, 'Should be same as in the user config');
  });

  await t.test('Load method provided config - Config objects as arguments', async () => {
    const cwd = path.join(resolveCwd(), '/fixtures/config');
    const config = new Config({ cwd });
    await config.load(
      {
        application: {
          name: 'bar',
        },
      },
      {
        server: {
          port: 8888,
        },
      },
    );

    assert.equal(config.name, 'bar', 'Should be same as provided to load()');
    assert.equal(config.serverPort, 8888, 'Should be same as provided to load()');
  });

  await t.test('Load method provided config - Array of config objects', async () => {
    const cwd = path.join(resolveCwd(), '/fixtures/config');

    const config = new Config({ cwd });
    await config.load([
      {
        application: {
          name: 'bar',
        },
      },
      {
        server: {
          port: 8888,
        },
      },
    ]);

    assert.equal(config.name, 'bar', 'Should be same as provided to load()');
    assert.equal(config.serverPort, 8888, 'Should be same as provided to load()');
  });
});

test('Config - .urlPathToJs()', async (t) => {
  await t.test('Default', () => {
    const config = new Config();
    const result = config.urlPathToJs();

    assert.ok(result instanceof URL, 'Should be a URL object');
    assert.equal(result.pathname, '/_/js/', 'Should be "/_/js/"');
  });

  await t.test('Default - Development mode is false', () => {
    const config = new Config({ development: false });
    const result = config.urlPathToJs();

    assert.ok(result instanceof URL, 'Should be a URL object');
    assert.equal(result.pathname, '/public/js/', 'Should be "/public/js/"');
  });

  await t.test('Custom directories', () => {
    const config = new Config({ cwd: '/tmp' });
    config.dirSrc = './src';
    config.dirBuild = './out';
    config.dirJs = './scripts';

    const result = config.urlPathToJs('/some/file.js');

    assert.ok(result instanceof URL, 'Should be a URL object');
    assert.equal(result.pathname, '/_/scripts/some/file.js');
  });

  await t.test('Custom directories - Development mode is false', () => {
    const config = new Config({ cwd: '/tmp', development: false });
    config.dirSrc = './src';
    config.dirBuild = './out';
    config.dirJs = './scripts';

    const result = config.urlPathToJs('/some/file.js');

    assert.ok(result instanceof URL, 'Should be a URL object');
    assert.equal(result.pathname, '/public/scripts/some/file.js');
  });
});
