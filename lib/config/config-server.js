export default (config, userConfig) => {
  if (!('server' in userConfig)) {
    return;
  }

  const { server } = userConfig;

  if ('port' in server) {
    config.serverPort = server.port;
  }

  if ('host' in server) {
    config.serverHost = server.host;
  }
};
