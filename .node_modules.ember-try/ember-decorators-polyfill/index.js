'use strict';
const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this.project);
    let emberVersion = checker.forEmber();
    let emberDataVersion = checker.for('ember-data');

    this._shouldPolyfillEmber = emberVersion.lt('3.10.0-alpha.0')
    this._shouldPolyfillData = emberDataVersion.exists() && emberDataVersion.lt('3.13.0-alpha.0');
  },

  included() {
    this._super.included.apply(this, arguments);

    if (this._shouldPolyfillEmber) {
      this.import('vendor/ember-decorators-polyfill/ember-fix.js');
    }

    if (this._shouldPolyfillData) {
      this.import('vendor/ember-decorators-polyfill/data-fix.js');
    }
  },

  treeForVendor(rawVendorTree) {
    if (!this._shouldPolyfillEmber && !this._shouldPolyfillData) {
      return;
    }

    let babelAddon = this.addons.find(
      addon => addon.name === 'ember-cli-babel'
    );

    let transpiledVendorTree = babelAddon.transpileTree(rawVendorTree, {
      babel: this.options.babel,

      'ember-cli-babel': {
        compileModules: false,
      },
    });

    return transpiledVendorTree;
  },
};
