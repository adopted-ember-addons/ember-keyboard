'use strict';
const {
  hasSingleImplementation,
  allAddons,
} = require('./utils/single-implementation');
const semver = require('semver');
const SilentError = require('silent-error');
const { EOL } = require('os');
/* global Set */

module.exports = class ProjectWideDependencyChecker {
  constructor(project) {
    if (
      !project ||
      typeof project !== 'object' ||
      typeof project.isEmberCLIProject !== 'function'
    ) {
      throw new TypeError(
        `[ember-cli-version-checker]'s forProject must be provided an ember-cli project class`
      );
    }

    if (project._addonsInitialized !== true) {
      throw new TypeError(
        `[ember-cli-version-checker]'s forProject must be provided an project instance who's addons have been initialized. This is typically outside the addon's init`
      );
    }

    this._project = project;
  }

  hasSingleImplementation(name) {
    return hasSingleImplementation(name, this._project);
  }

  *allAddons() {
    yield* allAddons(this._project);
  }

  filterAddonsByName(name) {
    const addons = [];

    for (let addon of this.allAddons()) {
      if (addon.name === name) {
        addons.push(addon);
      }
    }

    return addons;
  }

  filterAddonsByNames(names) {
    const result = Object.create(null);
    for (let name of names) {
      result[name] = [];
    }

    for (let addon of this.allAddons()) {
      const addonResult = result[addon.name];
      if (addonResult !== undefined) {
        addonResult.push(addon);
      }
    }

    return result;
  }

  assertSingleImplementation(name, customMessage) {
    const uniqueImplementations = new Set();

    for (let addon of this.allAddons()) {
      if (addon.name === name) {
        uniqueImplementations.add(addon.root);
      }
    }

    if (uniqueImplementations.size === 1) {
      return true;
    }

    let message;
    if (uniqueImplementations.size < 1) {
      message = `[ember-cli-version-checker] This project requires a single implementation version of the npm package \`${name}\`, but none where found.`;
    } else {
      if (customMessage) {
        message = customMessage;
      } else {
        message = `[ember-cli-version-checker] This project requires a single implementation version of the npm package \`${name}\`, but there're multiple. Please resolve \`${name}\` to same version:`;
      }
    }
    for (let root of uniqueImplementations) {
      message += `\n - ${name} @ ${root}`;
    }

    throw new SilentError(message);
  }

  check(constraints) {
    const names = Object.keys(constraints);
    const addons = this.filterAddonsByNames(names);
    const node_modules = Object.create(null);

    for (let name in addons) {
      const found = addons[name];
      const versions = found.map(addon => addon.pkg.version);

      const constraint = constraints[name];
      const missing = versions.length === 0;
      const isSatisfied =
        !missing &&
        versions.every(version =>
          semver.satisfies(version, constraint, { includePrerelease: true })
        );

      let message;
      if (isSatisfied) {
        message = '';
      } else if (missing) {
        message = `'${name}' was not found, expected version: [${constraint}]`;
      } else {
        message = `'${name}' expected version: [${constraint}] but got version${
          versions.length > 1 ? 's' : ''
        }: [${versions.join(', ')}]`;
      }

      node_modules[name] = {
        versions,
        isSatisfied,
        message,
      };
    }

    return new Check(node_modules);
  }
};

class Check {
  constructor(node_modules) {
    this.node_modules = node_modules;
    Object.freeze(this);
  }

  get isSatisfied() {
    return Object.values(this.node_modules).every(
      node_module => node_module.isSatisfied
    );
  }

  get message() {
    let result = '';

    for (const name in this.node_modules) {
      const { message } = this.node_modules[name];
      if (message !== '') {
        result += ` - ${message}${EOL}`;
      }
    }

    return result;
  }

  assert(description = 'Checker Assertion Failed') {
    if (this.isSatisfied) {
      return;
    }
    throw new Error(
      `[Ember-cli-version-checker] ${description}\n${this.message}`
    );
  }
}
