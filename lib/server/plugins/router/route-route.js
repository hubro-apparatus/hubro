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
 * @returns {Promise<import('fastify').RouteOptions[]>}
 */
export default async ({ entry, logger }) => {
  const source = await import(`${entry.source.href}`);

  let hook;

  if (source?.middleware) {
    hook = source;
    logger.trace(`Loaded inline middleware for route ${entry.route}`);
  } else {
    try {
      const middlewareUri = entry.source.href.replace('route.', 'middleware.');
      const middleware = await import(middlewareUri);
      hook = middleware;
      logger.trace(`Loaded external middleware for route ${entry.route}`);
    } catch {
      // Do nothing when middleware does not exist
    }
  }

  /** @type {import('fastify').RouteOptions[]} */
  const routes = [];
  const route = mapFileSystemRoute(entry.route);

  // HTTP GET routes
  if (source?.GET) {
    routes.push({
      method: 'GET',
      url: route,
      config: {
        entry,
      },
      //schema: { ... },

      /**
       * @param {import('fastify').FastifyRequest & { hRequest: HRequest; hResponse: HResponse; header: HHeader; }} request
       */
      preHandler: async (request) => {
        if (hook?.middleware) {
          const res = request.hResponse;
          const req = request.hRequest;

          const context = await hook.middleware(req, res);
          res.context = context;
        }
      },

      /**
       * @param {import('fastify').FastifyRequest & { hRequest: HRequest; hResponse: HResponse; header: HHeader; }} request
       * @param {import('fastify').FastifyReply & { ssr?: (page: any) => import('@lit-labs/ssr/lib/render-result-readable.js').RenderResultReadable }} reply
       */
      handler: async function (request, reply) {
        const res = request.hResponse;
        const req = request.hRequest;

        const body = await source.GET(req, res);

        res.headers.forEach((value, key) => {
          reply.header(key, value);
        });

        reply.type(res.type);

        return body;
      },
    });
  }

  // HTTP PUT routes
  if (source?.PUT) {
    routes.push({
      method: 'PUT',
      url: route,
      config: {
        entry,
      },
      //schema: { ... },

      preHandler:
        /**
         * @param {import('fastify').FastifyRequest & { hRequest: HRequest; hResponse: HResponse; header: HHeader; }} request
         */
        async (request) => {
          if (hook?.middleware) {
            const res = request.hResponse;
            const req = request.hRequest;

            const context = await hook.middleware(req, res);
            res.context = context;
          }
        },

      handler:
        /**
         * @param {import('fastify').FastifyRequest & { hRequest: HRequest; hResponse: HResponse; header: HHeader; }} request
         * @param {import('fastify').FastifyReply & { ssr?: (page: any) => import('@lit-labs/ssr/lib/render-result-readable.js').RenderResultReadable }} reply
         */
        async function (request, reply) {
          const res = request.hResponse;
          const req = request.hRequest;

          const body = await source.PUT(req, res);

          res.headers.forEach((value, key) => {
            reply.header(key, value);
          });

          reply.type(res.type);

          return body;
        },
    });
  }

  // HTTP POST routes
  if (source?.POST) {
    routes.push({
      method: 'POST',
      url: route,
      config: {
        entry,
      },
      //schema: { ... },

      preHandler:
        /**
         * @param {import('fastify').FastifyRequest & { hRequest: HRequest; hResponse: HResponse; header: HHeader; }} request
         */
        async (request) => {
          if (hook?.middleware) {
            const res = request.hResponse;
            const req = request.hRequest;

            const context = await hook.middleware(req, res);
            res.context = context;
          }
        },

      handler:
        /**
         * @param {import('fastify').FastifyRequest & { hRequest: HRequest; hResponse: HResponse; header: HHeader; }} request
         * @param {import('fastify').FastifyReply & { ssr?: (page: any) => import('@lit-labs/ssr/lib/render-result-readable.js').RenderResultReadable }} reply
         */
        async function (request, reply) {
          const res = request.hResponse;
          const req = request.hRequest;

          const body = await source.POST(req, res);

          res.headers.forEach((value, key) => {
            reply.header(key, value);
          });

          reply.type(res.type);

          return body;
        },
    });
  }

  return routes;
};
