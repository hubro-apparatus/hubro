import Server from '../lib/server/server-prod.js';
import Config from '../lib/config/config.js';

const config = new Config({
  development: false,
});
await config.load();

const server = new Server(config);
await server.initialize();
await server.start();
