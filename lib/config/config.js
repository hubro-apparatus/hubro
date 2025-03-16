import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

import application from './config-application.js';
import directories from './config-directories.js';
import compression from './config-compression.js';
import logging from './config-logging.js';
import server from './config-server.js';
import paths from './config-paths.js';

import { resolveCwd } from '../utils/utils.js';

const pkgJson = fs.readFileSync(path.join(import.meta.dirname, '../../package.json'), 'utf-8');
const pkg = JSON.parse(pkgJson);

const pkgDefaults = path.join(import.meta.dirname, '../../defaults');

/**
 * Config class. Loads and hold all config used by the Hubro Apparatus.
 */
export default class Config {
  // Hubro module properties
  #libVersion = pkg.version;

  // Development properties
  #development = true;

  // Application properties
  #name = 'Hubro';

  // Fixed file system properties
  #cwd;
  #pkgDefaults = pkgDefaults;

  // Configurable file system properties
  #dirSrc = './';
  #dirBuild = './build';
  #dirComponents = './components';
  #dirAdapters = './adapters';
  #dirLayouts = './layouts';
  #dirPublic = './public';
  #dirSystem = './system';
  #dirPages = './pages';
  #dirCss = './css';
  #dirJs = './js';

  // URL path properties
  #urlPathBase = './';
  #urlPathPublic = './public/';

  // Server instance properties
  #serverProtocol = 'http://';
  #serverHost = '0.0.0.0';
  #serverPort = 4000;

  // Logging properties
  #logRequests = false;
  #logLevel = 'info';
  #logName = undefined;

  // Compression properties
  #compression = true;

  /**
   * @constructor
   *
   * Internal config class.
   *
   * This class is used to keep an internal config which is used
   * only in the application. It keeps a flat object structure and
   * has sane defaults.
   *
   * The user config (hubro.config.js) is merged into this config.
   *
   * Internally one shall NOT access the user config directly. User
   * config should always be merged into an instance of this class
   * and config is accessed through the instance of this class.
   *
   * @example
   * ```
   * const config = new Config();
   * await config.load();
   * console.log(config.development);
   * ```
   *
   * @param {Object} [options] - Config options
   * @param {String} [options.cwd] - Current working directory
   * @param {Boolean} [options.development=true] - Development mode
   */
  constructor({ cwd, development = true } = {}) {
    this.#development = development;
    this.#cwd = resolveCwd(cwd);
  }

  async load(...configuration) {
    try {
      const cacheBuster = this.#development ? `?cache=${Date.now()}` : '';
      const url = pathToFileURL(path.join(this.#cwd, 'hubro.config.js'));
      const { default: userConfig } = await import(`${url.pathname}${cacheBuster}`);

      userConfig.forEach((entry) => {
        application(this, entry);
        directories(this, entry);
        compression(this, entry);
        logging(this, entry);
        server(this, entry);
        paths(this, entry);
      });
    } catch {
      // Ignore that file does not exist
    }

    // Check if config objects passed as arguments to the method
    // or if its passed in an array of config object
    let methodConfig = configuration;
    if (Array.isArray(configuration[0])) {
      methodConfig = configuration[0];
    }

    methodConfig.forEach((entry) => {
      application(this, entry);
      directories(this, entry);
      compression(this, entry);
      logging(this, entry);
      server(this, entry);
      paths(this, entry);
    });
  }

  /**
   * The version of the Hubro module in use.
   *
   * Value is taken from the "version" property in package.json
   * in the Hubro module in use by the application.
   *
   * @type {string}
   */
  get libVersion() {
    return this.#libVersion;
  }

  /**
   * @throws {Error} Read only-property
   */
  set libVersion(value) {
    throw new Error('Cannot set read-only property.');
  }

  /**
   * Development mode
   *
   * If the server are in development mode or noe.
   *
   * Can only be set through the constructor since we do not want to
   * change mode mid flight.
   *
   * @type {boolean}
   */
  get development() {
    return this.#development;
  }

  /**
   * @throws {Error} Read only-property
   */
  set development(value) {
    throw new Error('Cannot set read-only property.');
  }

  /**
   * Application name
   *
   * @type {string}
   */
  get name() {
    return this.#name;
  }

  set name(value) {
    this.#name = value;
  }

  /**
   * Current Working Directory
   *
   * Current working directory is the directory the user executes
   * the Hubro command in. This defaults to, and has the same
   * behaviour as, process.cwd().
   *
   * The current working directory can also be overrided by the
   * 'cwd' property to the constructor of this class.
   *
   * The value passed on to the 'cwd' property on the constructor
   * will be resolved to a absolute path.
   * If an absolute path is provided it will be kept as is.
   * If a relative path is provided it will be resolved to an
   * absolute path.
   *
   * Can only be set through the constructor since we do not want to
   * change mode mid flight.
   *
   * @type {URL}
   */
  get cwd() {
    const joined = path.join(this.#cwd, '/');
    return pathToFileURL(joined);
  }

  /**
   * @throws {Error} Read only-property
   */
  set cwd(value) {
    throw new Error('Cannot set read-only property.');
  }

  /**
   * Package Default Directory
   *
   * Package default directory holds a set of application specific directories
   * and files an application needs to run but which might not be added in
   * the application.
   *
   * These files and folders can be overrided in an application by the application
   * providing the same directories or files.
   *
   * Example: This folder hold a default error.js which will be used in the
   * application if there is none provided. If the application has a
   * ./system/error.js it will be used instead of the one provided here.
   *
   * @type {URL}
   */
  get pkgDefaults() {
    const joined = path.join(this.#pkgDefaults, '/');
    return pathToFileURL(joined);
  }

  /**
   * @throws {Error} Read only-property
   */
  set pkgDefaults(value) {
    throw new Error('Cannot set read-only property.');
  }

  /**
   * Absolute path to the "source" directory on the file system.
   *
   * The "source" directory is the root of the application which all other
   * Hubro specific directories and files resides under.
   *
   * By default this is "./".
   *
   * When set all other Hubro specific directories and files should be
   * prefixed with this value.
   *
   * The absolute path is composed by .cwd and the relative value
   * for this property.
   *
   * This property is set by directories.src in the user config.
   *
   * @type {URL}
   */
  get dirSrc() {
    const joined = path.join(this.#cwd, this.#dirSrc, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirSrc(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.src is not relative. Must be relative path.');
    }
    this.#dirSrc = value;
  }

  /**
   * Absolute path to the "build" directory on the file system.
   *
   * The "build" directory is the root of where the browser
   * assets is placed by the build step.
   *
   * By default this is "./build".
   *
   * The absolute value is composed by .dirSrc and the relative
   * value for this property.
   *
   * This property is set by directories.build in the user config.
   *
   * @type {URL}
   */
  get dirBuild() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirBuild, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirBuild(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.build is not relative. Must be relative path.');
    }
    this.#dirBuild = value;
  }

  /**
   * Absolute path to the "components" directory on the file system.
   *
   * The "components" directory is a directory where local components
   * for the application can be stored.
   *
   * By default this is "./components".
   *
   * The absolute value is composed by .dirSrc and the relative
   * value for this property.
   *
   * This property is set by directories.components in the user config.
   *
   * @type {URL}
   */
  get dirComponents() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirComponents, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirComponents(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.components is not relative. Must be relative path.');
    }
    this.#dirComponents = value;
  }

  /**
   * Absolute path to the "layouts" directory on the file system.
   *
   * The "layouts" directory is a directory where local layouts
   * for the application can be stored.
   *
   * By default this is "./layouts".
   *
   * The absolute value is composed by .dirSrc and the relative
   * value for this property.
   *
   * This property is set by directories.layouts in the user config.
   *
   * @type {URL}
   */
  get dirLayouts() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirLayouts, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirLayouts(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.layouts is not relative. Must be relative path.');
    }
    this.#dirLayouts = value;
  }

  /**
   * Absolute path to the "adapters" directory on the file system.
   *
   * The "adapters" directory is a directory where integrations
   * to backend services, such as connections to databases, are
   * stored.
   *
   * By default this is "./adapters".
   *
   * The absolute value is composed by .dirSrc and the relative
   * value for this property.
   *
   * This property is set by directories.adapters in the user config.
   *
   * @type {URL}
   */
  get dirAdapters() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirAdapters, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirAdapters(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.adapters is not relative. Must be relative path.');
    }
    this.#dirAdapters = value;
  }

  /**
   * Absolute path to the "public" directory on the file system.
   *
   * The "public" directory is a directory where static files
   * (such as images, graphics etc) for the application can
   * be stored.
   *
   * By default this is "./public".
   *
   * The absolute value is composed by .dirSrc and the relative
   * value for this property.
   *
   * This property is set by directories.public in the user config.
   *
   * @type {URL}
   */
  get dirPublic() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirPublic, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirPublic(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.public is not relative. Must be relative path.');
    }
    this.#dirPublic = value;
  }

  /**
   * Absolute path to the "system" directory on the file system.
   *
   * The "system" directory is a directory where system wide files
   * (such as not-found pages, error pages etc) for the application
   * is stored.
   *
   * By default this is "./system".
   *
   * The absolute value is composed by .dirSrc and the relative
   * value for this property.
   *
   * This property is set by directories.system in the user config.
   *
   * @type {URL}
   */
  get dirSystem() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirSystem, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirSystem(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.system is not relative. Must be relative path.');
    }
    this.#dirSystem = value;
  }

  /**
   * Absolute path to the "pages" directory on the file system.
   *
   * The "pages" directory is the root directory of the router.
   *
   * By default this is "./pages".
   *
   * The absolute value is composed by .dirSrc and the relative
   * value for this property.
   *
   * This property is set by directories.pages in the user config.
   *
   * @type {URL}
   */
  get dirPages() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirPages, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirPages(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.pages is not relative. Must be relative path.');
    }
    this.#dirPages = value;
  }

  /**
   * Relative path to the "css" directory on the file system.
   *
   * The "css" is relative to the build directory.
   *
   * By default this is "./build/css".
   *
   * This property is set by directories.css in the user config.
   *
   * @type {URL}
   */
  get dirCss() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirBuild, this.#dirCss, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirCss(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.css is not relative. Must be relative path.');
    }
    this.#dirCss = value;
  }

  /**
   * Absolute path to the "js" directory on the file system.
   *
   * The "js" is relative to the build directory.
   *
   * By default this is "./build/js".
   *
   * This property is set by directories.js in the user config.
   *
   * @type {URL}
   */
  get dirJs() {
    const joined = path.join(this.#cwd, this.#dirSrc, this.#dirBuild, this.#dirJs, '/');
    return pathToFileURL(joined);
  }

  /**
   * @param {string} value
   */
  set dirJs(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for directories.js is not relative. Must be relative path.');
    }
    this.#dirJs = value;
  }

  /**
   * Base URL path for all routes of the application.
   *
   * This value will be added as a prefix to the pathname of
   * all routes in the application and will prefix all paths
   * in the application.
   *
   * Example:
   * http://localhost:4000/<base>/<routes>...
   *
   * The value should be relative and end with a forward slash.
   * If value does not end with a forward slash it will be padded
   * with a forward slash at the end.
   *
   * The padding is done to adher to relative URL resolving:
   * https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references
   *
   * Defaults to ./
   *
   * @type {URL}
   */
  get urlPathBase() {
    const url = `${this.#serverProtocol}${this.#serverHost}:${this.#serverPort}`;
    return new URL(this.#urlPathBase, url);
  }

  /**
   * @param {string} value
   */
  set urlPathBase(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for paths.base is not relative. Must be relative path.');
    }
    const pad = value.endsWith('/') ? '' : '/';
    this.#urlPathBase = `${value}${pad}`;
  }

  /**
   * URL path for the static file server.
   *
   * The value should be relative and end with a forward slash.
   * If value does not end with a forward slash it will be padded
   * with a forward slash at the end.
   *
   * The padding is done to adher to relative URL resolving:
   * https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references
   *
   * Defaults to ./public/
   *
   * @type {URL}
   */
  get urlPathPublic() {
    const host = `${this.#serverProtocol}${this.#serverHost}:${this.#serverPort}`;
    const url = new URL(this.#urlPathBase, host);
    return new URL(this.#urlPathPublic, url);
  }

  /**
   * @param {string} value
   */
  set urlPathPublic(value) {
    if (path.isAbsolute(value)) {
      throw new Error('Value for paths.public is not relative. Must be relative path.');
    }
    const pad = value.endsWith('/') ? '' : '/';
    this.#urlPathPublic = `${value}${pad}`;
  }

  /**
   * The host of the server.
   *
   * @type {string}
   */
  get serverHost() {
    return this.#serverHost;
  }

  /**
   * @throws {Error} Read only-property
   */
  set serverHost(value) {
    this.#serverHost = value;
  }

  /**
   * The port of the server
   *
   * @type {number}
   */
  get serverPort() {
    return this.#serverPort;
  }

  /**
   * @throws {Error} Read only-property
   */
  set serverPort(value) {
    this.#serverPort = value;
  }

  get logRequests() {
    return this.#logRequests;
  }

  set logRequests(value) {
    this.#logRequests = value;
  }

  get logLevel() {
    return this.#logLevel;
  }

  set logLevel(value) {
    this.#logLevel = value.toLowerCase();
  }

  get logName() {
    return this.#logName === undefined ? this.#name : this.#logName;
  }

  set logName(value) {
    this.#logName = value;
  }

  get compression() {
    return this.#compression;
  }

  set compression(value) {
    this.#compression = value;
  }

  /**
   * Build URL to the javascript assets.
   *
   * Takes development mode into account and builds a URL
   * which is different for the two envrionments.
   *
   * For development mode the returned URL will point to the
   * dynamic asset build routes and for production mode it will
   * point to the static file server.
   *
   * @param {String} [appendix] A path to append at the end of the URL
   * @returns {URL}
   */
  urlPathToJs(appendix = '') {
    const url = `${this.#serverProtocol}${this.#serverHost}:${this.#serverPort}`;
    const env = this.#development ? '/_' : this.#urlPathPublic;
    const base = path.join('/', this.#urlPathBase, env, this.#dirJs, '/', appendix);
    return new URL(base, url);
  }
}
