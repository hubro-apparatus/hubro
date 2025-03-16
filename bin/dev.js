import Server from '../lib/server/server-dev.js';
import Config from '../lib/config/config.js';

const config = new Config({
  development: true,
});
await config.load();

const server = new Server(config);
await server.initialize();
await server.start();
