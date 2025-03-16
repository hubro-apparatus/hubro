import fp from 'fastify-plugin';

import routeAction from './route-action.js';
import routeClient from './route-client.js';
import routeRoute from './route-route.js';
import routePage from './route-page.js';

import Header from '../../../classes/header.js';

/**
 * @typedef {import('../../../hierarchy/hierarchy.js').default} HubroHierarchy
 * @typedef {import('../../../classes/response.js').default} HubroResponse
 * @typedef {import('../../../classes/request.js').default} HubroRequest
 * @typedef {import('../../../classes/server.js').default} HubroServer
 * @typedef {import('../../../classes/header.js').default} HubroHeader
 * @typedef {import('../../../common/config.js').default} HubroConfig
 *
 * @typedef {import('fastify').FastifyReply & { ssr?: (page: any) => import('@lit-labs/ssr/lib/render-result-readable.js').RenderResultReadable }} FastifyReply
 * @typedef {import('fastify').FastifyRequest & { hRequest: HubroRequest; hResponse: HubroResponse; header: HubroHeader; }} FastifyRequest
 * @typedef {import('fastify').FastifyInstance  & { hServer: HubroServer; }} FastifyInstance
 */
export default fp(
  /**
   * @param {FastifyInstance} fastify
   * @param {object} options
   * @param {HubroHierarchy} [options.hierarchy]
   * @param {HubroConfig} [options.config]
   */
  async (fastify, { config, hierarchy } = {}) => {
    fastify.addHook(
      'preHandler',

      /**
       * @param { FastifyRequest } request
       */
      async (request) => {
        // TODO: Set default header here????
        request.header = new Header();
      },
    );

    const logger = fastify.log;
    const routes = hierarchy.registry[Symbol.iterator]();

    for await (const item of routes) {
      const entry = item[1];

      if (entry.type === 'api') {
        if (entry.uriRoute !== undefined) {
          try {
            const routes = await routeRoute({ entry, logger });
            routes.forEach((route) => {
              fastify.route(route);
            });
          } catch (error) {
            fastify.log.warn(`Router could not import route at path ${entry.uriRoute?.href}`);
            fastify.log.error(error);
          }
        }
      }

      if (entry.type === 'page') {
        if (entry.uriPage !== undefined) {
          try {
            const route = await routePage({ config, entry, logger });
            fastify.route(route);
          } catch (error) {
            fastify.log.warn(`Router could not import page at path ${entry.uriPage?.href}`);
            fastify.log.error(error);
          }
        }

        if (entry.uriAction !== undefined) {
          try {
            const route = await routeAction({ entry, logger });
            fastify.route(route);
          } catch (error) {
            fastify.log.warn(`Router could not import action at path ${entry.uriAction?.href}`);
            fastify.log.error(error);
          }
        }
      }

      if (entry.type === 'client') {
        if (entry.uriClient !== undefined) {
          try {
            const route = await routeClient({ config, hierarchy, entry, logger });
            fastify.route(route);
          } catch (error) {
            fastify.log.warn(`Router could not import page at path ${entry.uriClient?.href}`);
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
