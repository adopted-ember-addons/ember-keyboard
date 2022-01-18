'use strict';

const path = require('path');

module.exports = function (blueprint) {
  blueprint.supportsAddon = function () {
    return false;
  };

  blueprint.filesPath = function () {
    let type;

    const dependencies = this.project.dependencies();

    if ('ember-qunit' in dependencies) {
      type = 'qunit';
    } else if ('ember-mocha' in dependencies) {
      type = 'mocha';
    } else {
      this.ui.writeLine("Couldn't determine test style - using QUnit");
      type = 'qunit';
    }

    return path.join(this.path, type + '-files');
  };

  return blueprint;
};
