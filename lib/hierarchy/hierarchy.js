import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

import { Glob } from 'glob';
import abslog from 'abslog';

import Entry from './hierarchy-entry.js';

/**
 * @typedef {import('../common/config.js').default} Config
 */

const MIDDLEWARE = /middleware(\.js|\.ts)/;
const CLIENT = /client(\.js|\.ts)/;
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
   * @param {import('abslog').AbstractLoggerOptions} [options.logger]
   */
  constructor({ config, logger }) {
    this.logger = abslog(logger);
    this.config = config;

    this.routesGlob = new Glob(
      [`**/middleware.{ts,js}`, `**/client.{ts,js}`, `**/action.{ts,js}`, `**/route.{ts,js}`, `**/page.{ts,js}`],
      /** @type {import('glob').GlobOptionsWithFileTypesTrue} */ ({
        withFileTypes: true,
        posix: true,
        nodir: true,
        cwd: this.config.dirPages,
      }),
    );

    this.registry = new Map();
    this.middleware;
    this.document;
    this.page;
    this.notFound;
    this.error;
  }

  async setRoutes() {
    this.registry.clear();

    for await (const entry of this.routesGlob) {
      const uriParentPath = pathToFileURL(join(entry.parentPath, '/'));
      const uriFullPath = pathToFileURL(join(entry.parentPath, '/', entry.name));

      let route = uriParentPath.pathname.replace(this.config.dirPages.pathname, '/');
      route = decodeURIComponent(new URL(`.${route}`, this.config.urlPathBase).pathname); // Append base path
      const hash = createHash(route);

      let ent;
      if (this.registry.has(hash)) {
        ent = this.registry.get(hash);
      } else {
        ent = new Entry(hash, route);
        // this.registry.set(hash, ent);
      }

      if (MIDDLEWARE.test(entry.name)) {
        ent.uriMiddleware = uriFullPath;
        this.logger.trace(`Middleware: ${hash} - ${uriFullPath}`);
      }

      if (CLIENT.test(entry.name)) {
        ent.uriClient = uriFullPath;
        this.logger.trace(`Client: ${hash} - ${uriFullPath}`);
      }

      if (ACTION.test(entry.name)) {
        ent.uriAction = uriFullPath;
        this.logger.trace(`Action: ${hash} - ${uriFullPath}`);
      }

      if (ROUTE.test(entry.name)) {
        ent.uriRoute = uriFullPath;
        this.logger.trace(`Route: ${hash} - ${uriFullPath}`);
      }

      if (PAGE.test(entry.name)) {
        ent.uriPage = uriFullPath;
        this.logger.trace(`Page: ${hash} - ${uriFullPath}`);
      }

      this.registry.set(hash, ent);
    }
  }

  getEntryByHash(hash) {
    return this.registry.get(hash);
    //    return this.routes.get(hash);
  }

  getEntryByPath(path) {
    // TODO: Can be made more efficient
    return Array.from(this.registry.values()).filter((entry) => {
      return path === entry.uriClient.pathname;
    })[0];
  }

  toBundle() {
    return Array.from(this.registry.values())
      .filter((entry) => {
        return entry.bundle;
      })
      .map((entry) => {
        return entry.uriClient.pathname;
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
    } catch {
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
    } catch {
      this.document = new URL('./system/document.js', this.config.pkgDefaults);
      this.logger.trace(`No user defined document.js found. Using system default.`);
    }
    return this.document;
  }

  getDocument() {
    return this.document;
  }

  async setPage() {
    const uri = new URL('./page.js', this.config.dirSystem);
    try {
      const stats = await fs.stat(uri);
      if (stats.isFile()) {
        this.page = uri;
        this.logger.trace(`Using user defined page.js at ${uri.pathname}`);
      }
    } catch {
      this.page = new URL('./system/page.js', this.config.pkgDefaults);
      this.logger.trace(`No user defined page.js found. Using system default.`);
    }
    return this.page;
  }

  getPage() {
    return this.page;
  }

  async setNotFound() {
    const uri = new URL('./not-found.js', this.config.dirSystem);
    try {
      const stats = await fs.stat(uri);
      if (stats.isFile()) {
        this.notFound = uri;
        this.logger.trace(`Using user defined not-found.js at ${uri.pathname}`);
      }
    } catch {
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
    } catch {
      this.error = new URL('./system/error.js', this.config.pkgDefaults);
      this.logger.trace(`No user defined error.js found. Using system default.`);
    }
    return this.error;
  }

  getError() {
    return this.error;
  }
}
