import ServerProd from './server/server-prod.js';
import ServerDev from './server/server-dev.js';
import Config from '../lib/config/config.js';

export default async ({ development = true, cwd = undefined } = {}, ...userConfig) => {
  const config = new Config({
    development,
    cwd,
  });
  await config.load(...userConfig);

  if (development) {
    const server = new ServerDev(config);
    await server.initialize();
    return server;
  } else {
    const server = new ServerProd(config);
    await server.initialize();
    return server;
  }
};
