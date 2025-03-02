import { mapFileSystemRoute } from './router-mapping.js';

// multipart/form-data
// curl -L POST -i -F field=value http://localhost:4000/submit

// application/x-www-form-urlencoded
// curl -L POST -i -d field=value http://localhost:4000/submit

/**
 * @typedef {import('../../../hierarchy/hierarchy-entry.js').default} HubroHierarchyEntry
 * @typedef {import('../../../classes/response.js').default} HubroResponse
 * @typedef {import('../../../classes/request.js').default} HubroRequest
 * @typedef {import('../../../classes/server.js').default} HubroServer
 * @typedef {import('../../../classes/header.js').default} HubroHeader
 *
 * @typedef {import('fastify').FastifyReply & { ssr?: (page: any) => import('@lit-labs/ssr/lib/render-result-readable.js').RenderResultReadable }} FastifyReply
 * @typedef {import('fastify').FastifyRequest & { hRequest: HubroRequest; hResponse: HubroResponse; header: HubroHeader; }} FastifyRequest
 * @typedef {import('fastify').FastifyInstance  & { hServer: HubroServer; }} FastifyInstance
 * @typedef {import('pino').BaseLogger} Logger
 *
 * @param {object} options
 * @param {HubroHierarchyEntry} [options.entry]
 * @param {Logger} [options.logger]
 * @returns {Promise<import('fastify').RouteOptions>}
 */
export default async ({ entry, logger } = {}) => {
  const source = await import(entry.uriAction.href);
  const action = source.default;

  let hook;

  if (source?.middleware) {
    hook = source;
    logger.trace(`Loaded inline middleware for route ${entry.route}`);
  } else {
    try {
      const middleware = await import(entry.uriMiddleware.href);
      hook = middleware;
      logger.trace(`Loaded external middleware for route ${entry.route}`);
    } catch {
      // Do nothing when middleware does not exist
    }
  }

  const route = mapFileSystemRoute(entry.route);

  return {
    method: 'POST',
    url: route,
    config: {
      entry,
    },
    //schema: { ... },

    /**
     * @param { FastifyRequest } request
     * @this { FastifyInstance }
     */
    preHandler: async function (request) {
      if (hook?.middleware) {
        const args = {
          response: request.hResponse,
          request: request.hRequest,
          server: this.hServer,
        };

        const context = await hook.middleware(args);
        request.hResponse.context = context;
      }
    },

    /**
     * @param { FastifyRequest } request
     * @param { FastifyReply } reply
     * @this { FastifyInstance }
     */
    handler: async function (request, reply) {
      const res = request.hResponse;
      const req = request.hRequest;

      const args = {
        response: res,
        request: req,
        server: this.hServer,
      };

      await action(args);

      res.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      if (res.location === undefined) {
        res.location = req.url;
      }

      return reply.redirect(res.location.href, res.status);
    },
  };
};
