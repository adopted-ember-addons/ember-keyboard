'use strict';
const fs = require('fs');
const semver = require('semver');
const getProject = require('./get-project');
const resolvePackage = require('resolve-package-path');

function getVersionFromJSONFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath);

    try {
      return JSON.parse(content).version;
    } catch (exception) {
      return null;
    }
  }
}

/**
 * DependencyVersionChecker
 */
class DependencyVersionChecker {
  constructor(parent, name) {
    this._parent = parent;
    this.name = name;
    let addon = this._parent._addon;
    let basedir = addon.root || getProject(addon).root;
    this._jsonPath = resolvePackage(this.name, basedir);
  }

  get version() {
    if (this._version === undefined && this._jsonPath) {
      this._version = getVersionFromJSONFile(this._jsonPath);
    }

    if (this._version === undefined && this._fallbackJsonPath) {
      this._version = getVersionFromJSONFile(this._fallbackJsonPath);
    }

    return this._version;
  }

  exists() {
    return this.version !== undefined;
  }

  isAbove(compareVersion) {
    if (!this.version) {
      return false;
    }
    return semver.gt(this.version, compareVersion);
  }

  assertAbove(compareVersion, _message) {
    let message = _message;
    if (!this.isAbove(compareVersion)) {
      if (!message) {
        const parentAddon = this._parent._addon;
        message = `The addon \`${parentAddon.name}\` @ \`${parentAddon.root}\` requires the npm package \`${this.name}\` to be above ${compareVersion}, but you have ${this.version}.`;
      }
      throw new Error(message);
    }
  }
}

for (let method of ['gt', 'lt', 'gte', 'lte', 'eq', 'neq', 'satisfies']) {
  DependencyVersionChecker.prototype[method] = function(range) {
    if (!this.version) {
      return method === 'neq';
    }
    return semver[method](this.version, range);
  };
}

module.exports = DependencyVersionChecker;
