const {
  _addDecoratorPlugins,
  _addTypeScriptPlugin,
  _getAddonProvidedConfig,
  _shouldCompileModules,
  _shouldIncludeHelpers,
  _shouldHandleTypeScript,
  _shouldIncludeDecoratorPlugins,
  _getHelpersPlugin,
  _getDebugMacroPlugins,
  _getEmberModulesAPIPolyfill,
  _getEmberDataPackagesPolyfill,
  _getModulesPlugin,
  _getPresetEnv,
} = require("./babel-options-util");

module.exports = function getBabelOptions(config, appInstance) {
  let { parent, project } = appInstance;
  let addonProvidedConfig = _getAddonProvidedConfig(config);
  let shouldIncludeHelpers = _shouldIncludeHelpers(config, appInstance);
  let shouldHandleTypeScript = _shouldHandleTypeScript(config, parent, project);
  let shouldIncludeDecoratorPlugins = _shouldIncludeDecoratorPlugins(config);

 let emberCLIBabelConfig = config["ember-cli-babel"];
  let shouldRunPresetEnv = true;

  if (emberCLIBabelConfig) {
    shouldRunPresetEnv = !emberCLIBabelConfig.disablePresetEnv;
  }

  let options = {};

  let userPlugins = addonProvidedConfig.plugins;
  let userPostTransformPlugins = addonProvidedConfig.postTransformPlugins;

  if (shouldHandleTypeScript) {
    userPlugins = _addTypeScriptPlugin(userPlugins.slice(), parent, project);
  }

  if (shouldIncludeDecoratorPlugins) {
    userPlugins = _addDecoratorPlugins(
      userPlugins.slice(),
      addonProvidedConfig.options,
      config,
      parent,
      project
    );
  }

  options.plugins = []
    .concat(
      shouldIncludeHelpers && _getHelpersPlugin(project),
      userPlugins,
      _getDebugMacroPlugins(config, project),
      _getEmberModulesAPIPolyfill(config, parent, project),
      _getEmberDataPackagesPolyfill(config, parent),
      _shouldCompileModules(config, project) && _getModulesPlugin(),
      userPostTransformPlugins
    ).filter(Boolean);

  options.presets = [
    shouldRunPresetEnv && _getPresetEnv(addonProvidedConfig, project),
  ].filter(Boolean);

  return options;
};
