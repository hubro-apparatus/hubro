import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * @typedef {import('../config/config.js').default} Config
 */

/**
 * Checks if a value is a string.
 *
 * @param {unknown} [str] A value to check
 * @returns {boolean}
 */
export const isString = (str) => typeof str === 'string';

/**
 * Checks if a value is a function.
 *
 * @param {unknown} [fn] A value to check
 * @returns {boolean}
 */
export const isFunction = (fn) => {
  const type = {}.toString.call(fn);
  return type === '[object Function]' || type === '[object AsyncFunction]';
};

/**
 * Resolve cwd.
 *
 * @param {string|URL} [cwd] Custom cwd to resolve
 * @returns {string}
 */
export const resolveCwd = (cwd) => {
  if (cwd instanceof URL) {
    cwd = fileURLToPath(cwd);
  }
  return cwd ? path.resolve(cwd) : process.cwd();
};

/**
 * Converts a Fastify server address Array to a URL object.
 *
 * Take configured base path into account and appends it
 * to the URL.
 *
 * The returned address will be the first address in the
 * addressess array provided.
 *
 * @param {Config} [config] Config object
 * @param {Array} [addresses] Config object
 * @returns {URL}
 */
export const addressToURL = (config, addresses) => {
  const address = addresses[0].address;
  const port = addresses[0].port;
  return new URL(config.urlPathBase.pathname, `http://${address}:${port}`);
};
