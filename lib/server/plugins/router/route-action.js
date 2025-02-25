import { mapFileSystemRoute } from './router-mapping.js';

/**
 * @typedef {import('../../../classes/request.js').default} HRequest
 * @typedef {import('../../../classes/response.js').default} HResponse
 * @typedef {import('../../../classes/header.js').default} HHeader
 */

// multipart/form-data
// curl -L POST -i -F field=value http://localhost:4000/submit

// application/x-www-form-urlencoded
// curl -L POST -i -d field=value http://localhost:4000/submit

/**
 * @returns {Promise<import('fastify').RouteOptions>}
 */
export default async ({ entry, logger }) => {
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
     * @param {import('fastify').FastifyRequest & { hRequest: HRequest; hResponse: HResponse; header: HHeader; }} request
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
     * @param {import('fastify').FastifyRequest & { hRequest: HRequest; hResponse: HResponse; header: HHeader; }} request
     * @param {import('fastify').FastifyReply & { ssr?: (page: any) => import('@lit-labs/ssr/lib/render-result-readable.js').RenderResultReadable }} reply
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

      return reply.redirect(res.location.href, res.status);
    },
  };
};
