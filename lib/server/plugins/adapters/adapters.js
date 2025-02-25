import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { Glob } from 'glob';
import abslog from 'abslog';
import fp from 'fastify-plugin';

/**
 * @typedef {import('../../../common/config.js').default} Config
 * @typedef {import('abslog').AbstractLoggerOptions} AbstractLoggerOptions
 */

export default fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {object} options
   * @param {Config} [options.config]
   * @param {AbstractLoggerOptions} [options.logger]
   */
  async (fastify, { config, logger } = {}) => {
    const log = abslog(logger);

    const glob = new Glob(
      [`**/*.{ts,js}`],
      /** @type {import('glob').GlobOptionsWithFileTypesTrue} */ ({
        withFileTypes: true,
        posix: true,
        nodir: true,
        cwd: config.dirAdapters,
      }),
    );

    for await (const entry of glob) {
      const file = pathToFileURL(join(entry.parentPath, '/', entry.name));
      try {
        const module = await import(file.href);

        if (!module.default) {
          log.warn(`Adapter is not loaded due to missing "default" export: ${file.href}`);
          return;
        }

        const adapter = new module.default(fastify.hServer);

        if (!adapter.name) {
          log.warn(`Adapter is not loaded due to missing "name" property: ${file.href}`);
          return;
        }

        fastify.hServer.setAdapter(adapter.name, adapter);

        if (adapter?.ready) {
          fastify.addHook('onReady', async () => {
            await adapter.ready();
          });
        }

        // TODO: Only runs when fastify.close() is called
        // so implement fastify.close() to close the server
        if (adapter?.close) {
          fastify.addHook('onClose', async () => {
            await adapter.close();
          });
        }
      } catch (error) {
        log.error(error);
      }
    }
  },
  {
    fastify: '5',
    name: 'plugin-adapters',
  },
);
