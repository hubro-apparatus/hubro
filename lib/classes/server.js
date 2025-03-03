import abslog from 'abslog';

/**
 * @typedef {import('../common/config.js').default} Config
 * @typedef {import('abslog').AbstractLoggerOptions} AbstractLoggerOptions
 */

/**
 * Environment class.
 * Holds all the stuff which goes into the head the document.
 */
export default class HServer {
  #config;
  #log;
  #env;

  /**
   * @constructor
   *
   * Server class.
   * Holds server bound properties and functionallity, such as
   * adapters, the application config, envrionement variables
   * etc which is global for the whole running instance of the
   * application.
   *
   * The Server Object is passed on to middleware, actions and
   * routes.
   *
   * @example
   * ```
   * const server = new Server();
   * ```
   * @param {object} options
   * @param {Config} [options.config]
   * @param {AbstractLoggerOptions} [options.logger]
   */
  constructor({ config, logger } = {}) {
    this.#config = config;
    this.#log = abslog(logger);
    this.#env = {};
  }

  /**
   * @throws {Error} Read only-property
   */
  set config(value) {
    throw new Error('Cannot set read-only property.');
  }

  get config() {
    return this.#config;
  }

  /**
   * @throws {Error} Read only-property
   */
  set log(value) {
    throw new Error('Cannot set read-only property.');
  }

  get log() {
    return this.#log;
  }

  /**
   * @throws {Error} Read only-property
   */
  set env(value) {
    throw new Error('Cannot set read-only property.');
  }

  get env() {
    return this.#env;
  }

  setAdapter(name, adapter) {
    // TODO: Validate for property overrides.
    this[name] = adapter;
  }

  get [Symbol.toStringTag]() {
    return 'HubroServer';
  }
}
