import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import getPort from 'get-port';
import pino from 'pino';

import { addressToURL } from '../common/utils.js';
import Hierarchy from '../common/hierarchy.js';

import pluginMiddleware from './plugins/middleware/middleware.js';
import pluginCompress from './plugins/compression/compression.js';
import pluginBundler from './plugins/bundler/bundler.js';
import pluginErrors from './plugins/errors/errors.js';
import pluginRouter from './plugins/router/router.js';
import pluginStatic from '@fastify/static';
import pluginCors from '@fastify/cors';
import pluginSSR from './plugins/ssr/ssr.js';

export default class ServerDevelopment {
  #hierarchy;
  #server;
  #config;
  #logger;
  #start;

  constructor(config) {
    this.#start = Date.now();

    this.#config = config;

    // @ts-expect-error
    this.#logger = pino({
      level: this.#config.logLevel,
      name: this.#config.logName,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    });

    this.#logger.info(`Hubro: ${this.#config.libVersion}`);
    this.#logger.trace(`Resolving Application root to: ${this.#config.cwd.pathname}`);
    this.#logger.trace(`Resolving Source folder to: ${this.#config.dirSrc.pathname}`);
    this.#logger.trace(`Resolving Build folder to: ${this.#config.dirBuild.pathname}`);
    this.#logger.trace(`Resolving Components folder to: ${this.#config.dirComponents.pathname}`);
    this.#logger.trace(`Resolving Layouts folder to: ${this.#config.dirLayouts.pathname}`);
    this.#logger.trace(`Resolving Public folder to: ${this.#config.dirPublic.pathname}`);
    this.#logger.trace(`Resolving System folder to: ${this.#config.dirSystem.pathname}`);
    this.#logger.trace(`Resolving Pages folder to: ${this.#config.dirPages.pathname}`);

    this.#hierarchy = new Hierarchy({
      logger: this.#logger,
      config: this.#config,
    });

    this.#server = Fastify({
      ignoreDuplicateSlashes: true,
      ignoreTrailingSlash: true,
      disableRequestLogging: !this.#config.logRequests,
      loggerInstance: this.#logger,
    });

    // Decorate server with properties which will
    // be set through the life cycle of a request
    this.#server.decorateRequest('document', null);
    this.#server.decorateRequest('header', null);
  }

  async initialize() {
    // TODO; Put these in the plugins??
    await this.#hierarchy.setMiddleware();
    await this.#hierarchy.setDocument();
    await this.#hierarchy.setNotFound();
    await this.#hierarchy.setError();
    await this.#hierarchy.setRoutes();

    await this.#server.register(pluginMiddleware, { config: this.#config, hierarchy: this.#hierarchy });
    await this.#server.register(pluginCompress, { config: this.#config });
    await this.#server.register(pluginBundler, { config: this.#config, hierarchy: this.#hierarchy });
    await this.#server.register(pluginErrors, { config: this.#config, hierarchy: this.#hierarchy });
    await this.#server.register(pluginRouter, { config: this.#config, hierarchy: this.#hierarchy });
    await this.#server.register(pluginCors, {});
    await this.#server.register(pluginSSR, { config: this.#config, hierarchy: this.#hierarchy });

    await this.#server.register(pluginStatic, {
      prefix: this.#config.urlPathPublic.pathname,
      root: fileURLToPath(this.#config.dirPublic),
    });
  }

  async start() {
    let port = this.#config.serverPort;

    if (this.#config.serverPort !== 0) {
      // TODO: Do post checking only in development mode??
      const ports = [];
      for (let i = 0; i < 20; i++) {
        ports.push(this.#config.serverPort + i);
      }

      port = await getPort({
        port: ports,
      });

      if (port !== this.#config.serverPort) {
        this.#logger.warn(`Port ${this.#config.serverPort} is used by other process. Using ${port}.`);
      }
    }

    try {
      await this.#server.listen({
        host: this.#config.serverHost,
        port,
        listenTextResolver: (address) => {
          return `Local: ${address}${this.#config.urlPathBase.pathname}`;
        },
      });

      const done = Date.now() - this.#start;
      this.#logger.info(`Ready in ${done}ms`);

      return addressToURL(this.#config, this.#server.addresses());
    } catch (err) {
      this.#logger.error(err);
      process.exit(1);
    }
  }

  async stop() {
    try {
      await this.#server.close();
    } catch (err) {
      this.#logger.error(err);
      process.exit(0);
    }
  }
}
