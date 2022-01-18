'use strict';

const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package.json').name,

  emberResolverFeatureFlags() {
    const resolverConfig = {}; //TODO: load from ember-cli-build.js

    return Object.assign({
      /* Add default feature flags here, for now there is none */
    }, resolverConfig.features);
  },

  included() {
    this._super.included.apply(this, arguments);

    let checker = new VersionChecker(this);
    let dep = checker.for('ember-cli', 'npm');

    if (dep.lt('2.0.0')) {
      this.monkeyPatchVendorFiles();
    }
  },

  monkeyPatchVendorFiles() {
    let filesToAppend = this.app.legacyFilesToAppend;
    let legacyResolverIndex = filesToAppend.indexOf(this.app.bowerDirectory + '/ember-resolver/dist/modules/ember-resolver.js');

    if (legacyResolverIndex > -1) {
      filesToAppend.splice(legacyResolverIndex, 1);
    }
  }
};
