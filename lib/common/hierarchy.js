import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

import { Glob } from 'glob';
import abslog from 'abslog';

/**
 * @typedef {import('./config.js').default} Config
 */

const ACTION = /action(\.js|\.ts)/;
const ROUTE = /route(\.js|\.ts)/;
const PAGE = /page(\.js|\.ts)/;

const createHash = (value, length = 8) => {
  return crypto.createHash('shake256', { outputLength: length }).update(value).digest('hex');
};

export default class HierarchyRoutes {
  /**
   * @param {object} options
   * @param {Config} [options.config]
   */
  constructor({ config, logger }) {
    this.logger = abslog(logger);
    this.config = config;

    this.routesGlob = new Glob([`**/action.{ts,js}`, `**/route.{ts,js}`, `**/page.{ts,js}`], {
      withFileTypes: true,
      posix: true,
      nodir: true,
      cwd: this.config.dirPages,
    });

    this.routes = new Map();

    this.middleware;
    this.document;
    this.notFound;
    this.error;
  }

  async setRoutes() {
    this.routes.clear();

    for await (const entry of this.routesGlob) {
      const uriParentPath = pathToFileURL(join(entry.parentPath, '/'));
      const uriFullPath = pathToFileURL(join(entry.parentPath, '/', entry.name));

      if (ACTION.test(entry.name)) {
        this.setAction(uriParentPath, uriFullPath);
      }

      if (ROUTE.test(entry.name)) {
        this.setRoute(uriParentPath, uriFullPath);
      }

      if (PAGE.test(entry.name)) {
        this.setPage(uriParentPath, uriFullPath);
      }
    }
  }

  setAction(parentPath, source) {
    let route = parentPath.pathname.replace(this.config.dirPages.pathname, '/');
    route = new URL(`.${route}`, this.config.urlPathBase).pathname; // Append base path

    const hash = createHash(`${route}:action.js`);

    this.logger.trace(`Action: ${hash} - ${source}`);

    const entry = {
      source,
      bundle: false,
      route,
      hash,
      type: 'action',
    };

    this.routes.set(hash, entry);

    return entry;
  }

  setRoute(parentPath, source) {
    let route = parentPath.pathname.replace(this.config.dirPages.pathname, '/');
    route = new URL(`.${route}`, this.config.urlPathBase).pathname; // Append base path

    const hash = createHash(`${route}:route.js`);

    this.logger.trace(`Route: ${hash} - ${source}`);

    const entry = {
      source,
      bundle: false,
      route,
      hash,
      type: 'route',
    };

    this.routes.set(hash, entry);

    return entry;
  }

  setPage(parentPath, source) {
    let route = parentPath.pathname.replace(this.config.dirPages.pathname, '/');
    route = new URL(`.${route}`, this.config.urlPathBase).pathname; // Append base path

    const hash = createHash(`${route}:page.js`);

    this.logger.trace(`Page: ${hash} - ${source.pathname}`);

    const entry = {
      source,
      bundle: true,
      route,
      hash,
      type: 'page',
    };

    this.routes.set(hash, entry);

    return entry;
  }

  getEntryByHash(hash) {
    return this.routes.get(hash);
  }

  getEntryByPath(path) {
    // TODO: Can be made more efficient
    return Array.from(this.routes.values()).filter((entry) => {
      return path === entry.source.pathname;
    })[0];
  }

  toBundle() {
    return Array.from(this.routes.values())
      .filter((entry) => {
        return entry.bundle;
      })
      .map((entry) => {
        return entry.source.pathname;
      });
  }

  async setMiddleware() {
    const uri = new URL('./middleware.js', this.config.dirSystem);
    try {
      const stats = await fs.stat(uri);
      if (stats.isFile()) {
        this.middleware = uri;
        this.logger.trace(`Using user defined middleware.js at ${uri.pathname}`);
      }
    } catch (err) { // eslint-disable-line
      this.middleware = new URL('./system/middleware.js', this.config.pkgDefaults);
      this.logger.trace(`No user defined middleware.js found. Using system default.`);
    }
    return this.middleware;
  }

  getMiddleware() {
    return this.middleware;
  }

  async setDocument() {
    const uri = new URL('./document.js', this.config.dirSystem);
    try {
      const stats = await fs.stat(uri);
      if (stats.isFile()) {
        this.document = uri;
        this.logger.trace(`Using user defined document.js at ${uri.pathname}`);
      }
    } catch (err) { // eslint-disable-line
      this.document = new URL('./system/document.js', this.config.pkgDefaults);
      this.logger.trace(`No user defined document.js found. Using system default.`);
    }
    return this.document;
  }

  getDocument() {
    return this.document;
  }

  async setNotFound() {
    const uri = new URL('./not-found.js', this.config.dirSystem);
    try {
      const stats = await fs.stat(uri);
      if (stats.isFile()) {
        this.notFound = uri;
        this.logger.trace(`Using user defined not-found.js at ${uri.pathname}`);
      }
    } catch (err) { // eslint-disable-line
      this.notFound = new URL('./system/not-found.js', this.config.pkgDefaults);
      this.logger.trace(`No user defined not-found.js found. Using system default.`);
    }
    return this.notFound;
  }

  getNotFound() {
    return this.notFound;
  }

  async setError() {
    const uri = new URL('./error.js', this.config.dirSystem);
    try {
      const stats = await fs.stat(uri);
      if (stats.isFile()) {
        this.error = uri;
        this.logger.trace(`Using user defined error.js at ${uri.pathname}`);
      }
    } catch (err) { // eslint-disable-line
      this.error = new URL('./system/error.js', this.config.pkgDefaults);
      this.logger.trace(`No user defined error.js found. Using system default.`);
    }
    return this.error;
  }

  getError() {
    return this.error;
  }
}
