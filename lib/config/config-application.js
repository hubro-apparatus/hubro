export default (config, userConfig) => {
  if (!('application' in userConfig)) {
    return;
  }

  const { application } = userConfig;

  if ('name' in application) {
    config.name = application.name;
  }
};
