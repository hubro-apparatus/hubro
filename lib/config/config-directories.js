export default (config, userConfig) => {
  if (!('directories' in userConfig)) {
    return;
  }

  const { directories } = userConfig;

  if ('src' in directories) {
    config.dirSrc = directories.src;
  }

  if ('adapters' in directories) {
    config.dirAdapters = directories.adapters;
  }

  if ('build' in directories) {
    config.dirBuild = directories.build;
  }

  if ('components' in directories) {
    config.dirComponents = directories.components;
  }

  if ('layouts' in directories) {
    config.dirLayouts = directories.layouts;
  }

  if ('public' in directories) {
    config.dirPublic = directories.public;
  }

  if ('system' in directories) {
    config.dirSystem = directories.system;
  }

  if ('pages' in directories) {
    config.dirPages = directories.pages;
  }

  if ('css' in directories) {
    config.dirCss = directories.css;
  }

  if ('js' in directories) {
    config.dirJs = directories.js;
  }
};
