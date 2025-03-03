import HServer from '../lib/classes/server.js';

declare module "fastify" {
	interface FastifyInstance {
		hServer: HServer;
	}
}
