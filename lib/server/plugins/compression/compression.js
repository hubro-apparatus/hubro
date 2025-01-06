import compress from '@fastify/compress';
import fp from 'fastify-plugin';

/**
 * @typedef {import('../../../common/config.js').default} Config
 */

export default fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {object} options
   * @param {Config} [options.config]
   */
  async (fastify, { config } = {}) => {
    fastify.log.trace(`Compressions is: ${config.compression ? 'Enabled' : 'Disabled'}`);
    if (config.compression) {
      await fastify.register(compress, { global: true });
    }
  },
  {
    fastify: '5',
    name: 'plugin-compression',
  },
);
