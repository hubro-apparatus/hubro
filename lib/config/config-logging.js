export default (config, userConfig) => {
  if (!('logging' in userConfig)) {
    return;
  }

  const { logging } = userConfig;

  if ('requests' in logging) {
    config.logRequests = logging.requests;
  }

  if ('level' in logging) {
    config.logLevel = logging.level;
  }

  if ('name' in logging) {
    config.logName = logging.name;
  }
};
