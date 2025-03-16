import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { Glob } from 'glob';
import fp from 'fastify-plugin';

/**
 * @typedef {import('../../../config/config.js').default} Config
 * @typedef {import('abslog').AbstractLoggerOptions} AbstractLoggerOptions
 */

/**
 * @typedef {import('../../../hierarchy/hierarchy.js').default} HubroHierarchy
 * @typedef {import('../../../classes/response.js').default} HubroResponse
 * @typedef {import('../../../classes/request.js').default} HubroRequest
 * @typedef {import('../../../classes/server.js').default} HubroServer
 * @typedef {import('../../../classes/header.js').default} HubroHeader
 * @typedef {import('../../../config/config.js').default} HubroConfig
 *
 * @typedef {import('fastify').FastifyReply & { ssr?: (page: any) => import('@lit-labs/ssr/lib/render-result-readable.js').RenderResultReadable }} FastifyReply
 * @typedef {import('fastify').FastifyRequest & { hRequest: HubroRequest; hResponse: HubroResponse; header: HubroHeader; }} FastifyRequest
 * @typedef {import('fastify').FastifyInstance  & { hServer: HubroServer; }} FastifyInstance
 */
export default fp(
  /**
   * @param {FastifyInstance} fastify
   * @param {object} options
   * @param {HubroConfig} [options.config]
   */
  async (fastify, { config } = {}) => {
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
          fastify.log.warn(`Adapter is not loaded due to missing "default" export: ${file.href}`);
          return;
        }

        const adapter = new module.default(fastify.hServer);

        if (!adapter.name) {
          fastify.log.warn(`Adapter is not loaded due to missing "name" property: ${file.href}`);
          return;
        }

        // TODO:
        // - Check if adapter name is reserved. If so; throw
        // - Check if adapter name is already used. If so; throw

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
        fastify.log.error(error);
      }
    }
  },
  {
    fastify: '5',
    name: 'plugin-adapters',
  },
);
