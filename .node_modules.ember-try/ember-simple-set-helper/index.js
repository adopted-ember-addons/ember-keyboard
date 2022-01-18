'use strict';

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    const plugin = this._buildPlugin();

    plugin.parallelBabel = {
      requireFile: __filename,
      buildUsing: '_buildPlugin',
      params: {}
    };

    registry.add('htmlbars-ast-plugin', plugin);
  },

  _buildPlugin() {
    const SimpleSetTransform = require('./lib/simple-set-transform');

    return {
      name: 'set-placeholder',
      plugin: SimpleSetTransform,
      baseDir() {
        return __dirname;
      }
    };
  }
};