import fp from 'fastify-plugin';

import routeAction from './route-action.js';
import routeClient from './route-client.js';
import routeRoute from './route-route.js';
import routePage from './route-page.js';

import Header from '../../../classes/header.js';

/**
 * @typedef {import('../../../common/config.js').default} Config
 * @typedef {import('../../../hierarchy/hierarchy.js').default} Hierarchy
 */

export default fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {object} options
   * @param {Hierarchy} [options.hierarchy]
   * @param {Config} [options.config]
   */
  async (fastify, { config, hierarchy } = {}) => {
    // TODO: Set default header here????
    fastify.addHook('preHandler', async (request) => {
      // @ts-expect-error
      request.header = new Header();
    });

    const logger = fastify.log;
    const routes = hierarchy.registry[Symbol.iterator]();

    for await (const item of routes) {
      const entry = item[1];

      if (entry.type === 'api') {
        if (entry.uriRoute !== '') {
          try {
            const routes = await routeRoute({ entry, logger });
            routes.forEach((route) => {
              fastify.route(route);
            });
          } catch (error) {
            fastify.log.warn(`Router could not import route at path ${entry.uriRoute.href}`);
            fastify.log.error(error);
          }
        }
      }

      if (entry.type === 'page') {
        if (entry.uriAction !== '') {
          try {
            const route = await routeAction({ entry, logger });
            fastify.route(route);
          } catch (error) {
            fastify.log.warn(`Router could not import action at path ${entry.uriAction.href}`);
            fastify.log.error(error);
          }
        }

        if (entry.uriPage !== '') {
          try {
            const route = await routePage({ config, entry, logger });
            fastify.route(route);
          } catch (error) {
            fastify.log.warn(`Router could not import page at path ${entry.uriPage.href}`);
            fastify.log.error(error);
          }
        }
      }

      if (entry.type === 'client') {
        if (entry.uriClient !== '') {
          try {
            const route = await routeClient({ config, entry, logger, hierarchy });
            fastify.route(route);
          } catch (error) {
            fastify.log.warn(`Router could not import page at path ${entry.uriClient.href}`);
            fastify.log.error(error);
          }
        }
      }
    }
  },
  {
    fastify: '5',
    name: 'plugin-router',
  },
);
