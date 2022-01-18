'use strict';

const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this.project);
    let emberVersion = checker.forEmber();

    this.shouldPolyfillManager = emberVersion.lt('3.8.0-alpha.1');
    this.shouldPolyfillCapabilities = emberVersion.lt('3.13.0-beta.3');
  },

  included() {
    this._super.included.apply(this, arguments);

    if (this.shouldPolyfillManager) {
      this.import('vendor/ember-modifier-manager-polyfill.js');
    }

    if (this.shouldPolyfillCapabilities) {
      this.import('vendor/ember-modifier-capabilities-polyfill.js');
    }
  },

  treeForVendor(rawVendorTree) {
    if (!this.shouldPolyfillManager && !this.shouldPolyfillCapabilities) {
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
};
