import { RenderResultReadable } from '@lit-labs/ssr/lib/render-result-readable.js';
import { render } from '@lit-labs/ssr';
import fp from 'fastify-plugin';

/**
 * @typedef {import('../../../common/config.js').default} Config
 * @typedef {import('../../../common/hierarchy.js').default} Hierarchy
 */

export default fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify
   * @param {object} options
   * @param {Config} [options.config]
   * @param {Hierarchy} [options.hierarchy]
   */
  async (fastify, { hierarchy } = {}) => {
    const uriDocument = hierarchy.getDocument();
    const { default: document } = await import(`${uriDocument.href}`);

    // NB: An arrow function will break use of 'this'
    fastify.decorateReply('ssr', function (page) {
      const props = this?.request?.hResponse?.context;
      const doc = document(page(props), this?.request?.header);
      return new RenderResultReadable(render(doc));
    });
  },
  {
    fastify: '4',
    name: 'plugin-ssr',
  },
);
