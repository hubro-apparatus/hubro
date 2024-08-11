import formbody from '@fastify/formbody';
import fp from 'fastify-plugin';

import Response from '../../../classes/response.js';
import Request from '../../../classes/request.js';

/**
 * @typedef {import('../../../common/config.js').default} Config
 * @typedef {import('../../../common/hierarchy.js').default} Hierarchy
 */

export default fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {object} options
   * @param {Config} [options.config]
   * @param {Hierarchy} [options.hierarchy]
   */
  async (fastify, { config, hierarchy } = {}) => {
    // fastify.log.trace(`Compressions is: ${config.compression ? 'Enabled' : 'Disabled'}`);
    fastify.register(formbody);

    const uriMiddleware = hierarchy.getMiddleware();
    const hook = await import(`${uriMiddleware.href}`);

    fastify.decorateRequest('hResponse', null);
    fastify.decorateRequest('hRequest', null);

    const pub = config.urlPathPublic.pathname;
    const js = config.urlPathToJs().pathname;

    fastify.addHook('preHandler', async (request) => {
      const route = request.routeOptions.url;

      // Do not run on undefined routes (404s)
      if (route === undefined) {
        return;
      }

      // Do not run on static file routes and development routes
      if (route.startsWith(pub) || route.startsWith(js)) {
        return;
      }

      const url = `${request.protocol}://${request.hostname}${request.url}`;

      // TODO: Make request.params match router roules
      // Ex; { '*': 'lit' } -> * is not part of router??

      request.hRequest = new Request(url, {
        headers: request.headers,
        method: request.method,
        params: request.params,
      });

      request.hResponse = new Response();

      // Handle HTTP POST: application/x-www-form-urlencoded
      if (request.method === 'POST' || request.method === 'PUT') {
        // Copy original body into a FormData object
        Object.entries(request.body).forEach(([key, value]) => {
          request.hRequest.body.append(key, value);
        });
      }

      // Set specific values for "actions"
      if (request.routeOptions.config.entry.type === 'action') {
        request.hResponse.location = request.hRequest.url;
        request.hResponse.status = 303;
        request.hResponse.type = 'text/plain; charset=utf-8';
      }

      // Set specific values for "routes"
      if (request.routeOptions.config.entry.type === 'route') {
        request.hResponse.type = 'application/json; charset=utf-8';
      }

      try {
        const props = await hook.middleware(request.hRequest, request.hResponse);
        request.hResponse.context = props;
      } catch (error) {
        fastify.log.error(error);
      }
    });
  },
  {
    fastify: '4',
    name: 'plugin-middleware',
  },
);
