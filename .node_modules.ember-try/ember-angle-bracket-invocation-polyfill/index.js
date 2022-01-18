'use strict';

const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: 'ember-angle-bracket-invocation-polyfill',

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this.project);
    let emberVersion = checker.forEmber();

    this.shouldPolyfill = emberVersion.lt('3.4.0-alpha.1');
    this.shouldPolyfillNested = emberVersion.lt('3.10.0-alpha.1');
    this.shouldPolyfillBuiltinComponents = emberVersion.lt('3.10.0-alpha.1');

    let parentChecker = new VersionChecker(this.parent);
    let precompileVersion = parentChecker.for('ember-cli-htmlbars-inline-precompile');

    if (precompileVersion.exists() && precompileVersion.lt('1.0.3')) {
      this.ui.writeWarnLine(
        'Detected a version of ember-cli-htmlbars-inline-precompile that does not' +
          ' support angle bracket invocation, please update to at least 1.0.3.'
      );
    }
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
    } else if (this.shouldPolyfillNested) {
      let pluginObj = this._buildNestedPlugin();
      pluginObj.parallelBabel = {
        requireFile: __filename,
        buildUsing: '_buildPlugin',
        params: {},
      };
      registry.add('htmlbars-ast-plugin', pluginObj);
    }

    if (this.shouldPolyfillBuiltinComponents) {
      let linktoPluginObj = this._buildLinkToPlugin();
      linktoPluginObj.parallelBabel = {
        requireFile: __filename,
        buildUsing: '_buildLinkToPlugin',
        params: {},
      };
      registry.add('htmlbars-ast-plugin', linktoPluginObj);

      let inputPluginObj = this._buildInputPlugin();
      inputPluginObj.parallelBabel = {
        requireFile: __filename,
        buildUsing: '_buildInputPlugin',
        params: {},
      };
      registry.add('htmlbars-ast-plugin', inputPluginObj);
    }
  },

  _buildPlugin() {
    return {
      name: 'component-attributes',
      plugin: require('./lib/ast-transform'),
      baseDir() {
        return __dirname;
      },
    };
  },

  _buildNestedPlugin() {
    return {
      name: 'nested-component-invocation-support',
      plugin: require('./lib/ast-nested-transform'),
      baseDir() {
        return __dirname;
      },
    };
  },

  _buildLinkToPlugin() {
    return {
      name: 'link-to-component-invocation-support',
      plugin: require('./lib/ast-link-to-transform'),
      baseDir() {
        return __dirname;
      },
    };
  },

  _buildInputPlugin() {
    return {
      name: 'input-component-invocation-support',
      plugin: require('./lib/ast-input-transform'),
      baseDir() {
        return __dirname;
      },
    };
  },

  included() {
    this._super.included.apply(this, arguments);

    if (!this.shouldPolyfill) {
      return;
    }

    this.import('vendor/angle-bracket-invocation-polyfill/runtime-polyfill.js');
  },

  treeForVendor(rawVendorTree) {
    if (!this.shouldPolyfill) {
      return;
    }

    let babelAddon = this.addons.find(addon => addon.name === 'ember-cli-babel');

    let transpiledVendorTree = babelAddon.transpileTree(rawVendorTree, {
      babel: this.options.babel,

      'ember-cli-babel': {
        compileModules: false,
      },
    });

    return transpiledVendorTree;
  },

  treeForAddon() {
    if (this.shouldPolyfillBuiltinComponents) {
      return this._super.treeForAddon.apply(this, arguments);
    }
  },

  treeForApp() {
    if (this.shouldPolyfillBuiltinComponents) {
      return this._super.treeForApp.apply(this, arguments);
    }
  },
};
