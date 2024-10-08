import { mapFileSystemRoute } from './router-mapping.js';

/**
 * @typedef {import('../../../classes/request.js').default} HRequest
 * @typedef {import('../../../classes/response.js').default} HResponse
 * @typedef {import('../../../classes/header.js').default} HHeader
 */

/**
 * @returns {Promise<import('fastify').RouteOptions>}
 */
export default async ({ config, entry, logger }) => {
  const source = await import(`${entry.source.href}`);
  const page = source.default;

  let hook;

  if (source?.middleware) {
    hook = source;
    logger.trace(`Loaded inline middleware for route ${entry.route}`);
  } else {
    try {
      const middlewareUri = entry.source.href.replace('page.', 'middleware.');
      const middleware = await import(middlewareUri);
      hook = middleware;
      logger.trace(`Loaded external middleware for route ${entry.route}`);
    } catch {
      // Do nothing when middleware does not exist
    }
  }

  const route = mapFileSystemRoute(entry.route);

  return {
    method: 'GET',
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

        // TODO: Build proper script tags
        const scriptHydrationUrl = config.urlPathToJs('/lit/hydration.js');
        request.header.setScript(scriptHydrationUrl.href);

        const scriptPageUrl = config.urlPathToJs(`/pages/${request.routeOptions.config.entry.hash}.js`);
        request.header.setScript(scriptPageUrl.href);

        res.headers.forEach((value, key) => {
          reply.header(key, value);
        });

        reply.type(res.type);
        return reply.ssr(page);
      },
  };
};
