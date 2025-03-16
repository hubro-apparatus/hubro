export default (config, userConfig) => {
  if (!('paths' in userConfig)) {
    return;
  }

  const { paths } = userConfig;

  if ('base' in paths) {
    config.urlPathBase = paths.base;
  }

  if ('public' in paths) {
    config.urlPathPublic = paths.public;
  }
};
