import fp from 'fastify-plugin';

import routeAction from './route-action.js';
import routeRoute from './route-route.js';
import routePage from './route-page.js';

import Header from '../../../classes/header.js';

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
    // TODO: Set default header here????
    fastify.addHook('preHandler', async (request) => {
      request.header = new Header();
    });

    const logger = fastify.log;
    const routes = hierarchy.routes[Symbol.iterator]();

    for await (const item of routes) {
      const entry = item[1];

      // Set "page" route
      if (entry.type === 'page') {
        try {
          const route = await routePage({ config, entry, logger });
          fastify.route(route);
        } catch (error) {
          fastify.log.warn(`Router could not import page at path ${entry.source.href}`);
          fastify.log.error(error);
        }
      }

      // Set "action" route
      if (entry.type === 'action') {
        try {
          const route = await routeAction({ config, entry, logger });
          fastify.route(route);
        } catch (error) {
          fastify.log.warn(`Router could not import action at path ${entry.source.href}`);
          fastify.log.error(error);
        }
      }

      // Set "route" route
      if (entry.type === 'route') {
        try {
          const route = await routeRoute({ config, entry, logger });
          fastify.route(route);
        } catch (error) {
          fastify.log.warn(`Router could not import route at path ${entry.source.href}`);
          fastify.log.error(error);
        }
      }
    }
  },
  {
    fastify: '4',
    name: 'plugin-router',
  },
);
