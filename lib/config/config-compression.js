export default (config, userConfig) => {
  if (!('compression' in userConfig)) {
    return;
  }

  const { compression } = userConfig;

  if ('enable' in compression) {
    config.compression = compression.enable;
  }
};
