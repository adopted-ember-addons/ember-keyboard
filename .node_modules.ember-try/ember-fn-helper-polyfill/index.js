'use strict';

const VersionChecker = require('ember-cli-version-checker');
const { cacheKeyForStableTree } = require('calculate-cache-key-for-tree');

module.exports = {
  name: require('./package').name,

  cacheKeyForTree: cacheKeyForStableTree,

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this.project);
    let emberVersion = checker.forEmber();

    this.shouldPolyfill = emberVersion.lt('3.11.0-alpha.1');
  },

  setupPreprocessorRegistry(type, registry) {
    if (this.shouldPolyfill) {
      let pluginObj = this._buildPlugin();

      pluginObj.parallelBabel = {
        requireFile: __filename,
        buildUsing: '_buildPlugin',
        params: {},
      };

      registry.add('htmlbars-ast-plugin', pluginObj);
    }
  },

  _buildPlugin() {
    return {
      name: 'fn-helper-polyfill',
      plugin: require('./lib/ast-transform'),
      baseDir() {
        return __dirname;
      },
    };
  },

  treeFor() {
    if (!this.shouldPolyfill) {
      return;
    }

    return this._super.treeFor.apply(this, arguments);
  },
};
