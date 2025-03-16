import Config from '../lib/config/config.js';
import build from '../lib/build/build.js';

const config = new Config({
  development: true,
});
await config.load();

await build(config);
