'use strict';

const VersionChecker = require('ember-cli-version-checker');
const NATIVE_SUPPORT_VERSION = '3.22.0-alpha.1';
let hasBeenWarned = false;

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);
    this._ensureThisImport();

    const checker = new VersionChecker(this);
    const emberVersion = checker.for('ember-source');

    if (emberVersion.lt(NATIVE_SUPPORT_VERSION)) {
      this.import('vendor/ember-destroyable-polyfill/index.js');
    } else if (this.parent === this.project && !hasBeenWarned) {
      this.ui.writeWarnLine(
        `${this.name} is not required for Ember ${NATIVE_SUPPORT_VERSION} and later, please remove from your 'package.json'.`
      );
      hasBeenWarned = true;
    }
  },

  treeForVendor(tree) {
    const babel = this.addons.find((a) => a.name === 'ember-cli-babel');

    return babel.transpileTree(tree, {
      babel: this.options.babel,

      'ember-cli-babel': {
        compileModules: false,
      },
    });
  },

  _ensureThisImport() {
    if (!this.import) {
      this._findHost = function findHostShim() {
        let current = this;
        let app;
        do {
          app = current.app || app;
          // eslint-disable-next-line no-cond-assign
        } while (current.parent.parent && (current = current.parent));
        return app;
      };
      this.import = function importShim(asset, options) {
        const app = this._findHost();
        app.import(asset, options);
      };
    }
  },
};
