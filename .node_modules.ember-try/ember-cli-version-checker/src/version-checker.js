'use strict';

const DependencyVersionChecker = require('./dependency-version-checker');
const ProjectWideDependencyChecker = require('./project-wide-dependency-checker');

module.exports = class VersionChecker {
  constructor(addon) {
    this._addon = addon;
  }

  static forProject(project) {
    return new ProjectWideDependencyChecker(project);
  }

  for(name, type) {
    if (type === 'bower') {
      throw new Error(
        '[ember-cli-version-checker] Bower is no longer supported'
      );
    } else {
      return new DependencyVersionChecker(this, name);
    }
  }

  forEmber() {
    throw new Error(
      `[ember-cli-version-checker] 'checker.forEmber' has been removed, please use 'checker.for(\`ember-source\`)'`
    );
  }
};
