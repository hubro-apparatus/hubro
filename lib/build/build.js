import pino from 'pino';

import entries from './build-entries.js';
import system from './build-system.js';

import Hierarchy from '../common/hierarchy.js';

export default async (config) => {
  const hierarchy = new Hierarchy({ config });

  // @ts-expect-error
  const logger = pino({
    level: config.logLevel,
    name: config.logName,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  });

  try {
    const start = Date.now();
    logger.info(`Kvikk: ${config.libVersion}`);
    logger.info(`Creating production build:`);

    await hierarchy.setRoutes();
    /*
    // TODO: Improve to not be for await
    for await (const entry of hierarchy.scan()) {
      logger.trace(entry);
    }
      */

    await system(logger, config);
    await entries(logger, config, hierarchy);

    const done = Date.now() - start;
    logger.info(`Build done in ${done}ms`);
    process.exit(0);
  } catch (error) {
    logger.error('Build errored!');
    logger.error(error);
    process.exit(1);
  }
};
