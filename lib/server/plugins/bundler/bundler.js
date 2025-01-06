import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import * as importMap from 'esbuild-plugin-import-map';
import esbuild from 'esbuild';
import etag from '@fastify/etag';
import fp from 'fastify-plugin';

// Set root be root folder of the Hubro module because
// we want to bundle up files in the Hubro module (not
// in the project using the Hubro module).
// @ts-ignore
const root = join(import.meta.dirname, '../../../../');

const require = createRequire(import.meta.url);

const build = async ({ entryPoints = [] } = {}) => {
  const result = await esbuild.build({
    resolveExtensions: ['.js', '.ts'],
    legalComments: 'none',
    entryPoints,
    charset: 'utf8',
    target: 'esnext',
    bundle: true,
    format: 'esm',
    plugins: [importMap.plugin()],
    outdir: `${tmpdir()}/build-noop`,
    treeShaking: true,
    minify: true,
    write: false,
  });

  return result.outputFiles[0].text;
};

/**
 * @typedef {import('../../../common/config.js').default} Config
 * @typedef {import('../../../common/hierarchy.js').default} Hierarchy
 */

export default fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {object} options
   * @param {Hierarchy} [options.hierarchy]
   * @param {Config} [options.config]
   */
  async (fastify, { config, hierarchy } = {}) => {
    fastify.register(etag, {
      algorithm: 'fnv1a',
    });

    const moduleCache = new Map();

    fastify.addHook('onListen', async () => {
      const { address, port } = /** @type {{ address: string; family: string; port: number;}} */ (
        fastify.server.address()
      );

      const components = config.urlPathToJs('/components/').pathname;
      const layouts = config.urlPathToJs('/layouts/').pathname;
      const lit = config.urlPathToJs('/modules/lit').pathname;

      await importMap.load(`http://${address}:${port}`, {
        imports: {
          '#components/': components,
          '#layouts/': layouts,
          lit: lit,
        },
      });
    });

    // URI: http://localhost:4000/_/js/lit/hydration.js

    fastify.get(config.urlPathToJs('/lit/hydration.js').pathname, async (request, reply) => {
      const depname = '@lit-labs/ssr-client/lit-element-hydrate-support.js';

      if (!moduleCache.has(depname)) {
        const filePath = require.resolve(depname, { paths: [root] });
        const body = await build({
          entryPoints: [filePath],
        });
        moduleCache.set(depname, body);
      }

      reply.type('application/javascript');
      return moduleCache.get(depname);
    });

    // URI: http://localhost:4000/_/js/components/button.js

    fastify.get(config.urlPathToJs('/components/*').pathname, async (request, reply) => {
      const component = request.params['*'];
      const filePath = fileURLToPath(new URL(component, config.dirComponents));

      const body = await build({
        entryPoints: [filePath],
      });

      // TODO: 404 if component does not exist
      reply.type('application/javascript');
      return body;
    });

    // URI: http://localhost:4000/_/js/modules/lit

    fastify.get(config.urlPathToJs('/modules/*').pathname, async (request, reply) => {
      const depname = request.params['*'];

      if (!moduleCache.has(depname)) {
        const filePath = require.resolve(depname, { paths: [fileURLToPath(config.cwd)] });
        const body = await build({
          entryPoints: [filePath],
        });
        moduleCache.set(depname, body);
      }

      // TODO: 404 if module does not exist
      reply.type('application/javascript');
      return moduleCache.get(depname);
    });

    // URI: http://localhost:4000/_/js/layouts/layout.js

    fastify.get(config.urlPathToJs('/layouts/*').pathname, async (request, reply) => {
      const layout = request.params['*'];
      const filePath = fileURLToPath(new URL(layout, config.dirLayouts));

      const body = await build({
        entryPoints: [filePath],
      });

      // TODO: 404 if layout does not exist
      reply.type('application/javascript');
      return body;
    });

    // URI: http://localhost:4000/_/js/pages/013da72ffabed68b.js

    fastify.get(config.urlPathToJs('/pages/:hash.js').pathname, async (request, reply) => {
      const hash = request.params['hash'];
      const entry = hierarchy.getEntryByHash(hash);
      const filePath = fileURLToPath(entry.source);

      // TODO: 404 if entry.bundle === false
      const body = await build({
        entryPoints: [filePath],
      });

      // TODO: 404 if page does not exist
      reply.type('application/javascript');
      return body;
    });
  },
  {
    fastify: '5',
    name: 'plugin-bundler',
  },
);
