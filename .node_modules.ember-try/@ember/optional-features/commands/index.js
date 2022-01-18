/* eslint-disable no-console */
'use strict';

const VersionChecker = require('ember-cli-version-checker');

const chalk = require('chalk');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const strip = require('../utils').strip;
const getConfigPath = require('../utils').getConfigPath;

const FEATURES = require('../features');

const USAGE_MESSAGE = strip`
  Usage:

    To list all available features, run ${chalk.bold('ember feature:list')}.
    To enable a feature, run ${chalk.bold('ember feature:enable some-feature')}.
    To disable a feature, run ${chalk.bold(
      'ember feature:disable some-feature'
    )}.
`;

const SHARED = {
  // TODO: promisify the sync code below

  _isFeatureAvailable(feature) {
    let checker = new VersionChecker(this.project).for('ember-source');
    return checker.gte(`${feature.since}-beta.1`);
  },

  _ensureConfigFile() {
    let configPath = getConfigPath(this.project);

    try {
      return this.project.resolveSync(configPath);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    }

    mkdirp.sync(path.join(this.project.root, path.dirname(configPath)));

    fs.writeFileSync(configPath, '{}', { encoding: 'UTF-8' });

    return configPath;
  },

  _setFeature: async function (name, value, shouldRunCodemod) {
    let feature = FEATURES[name];

    if (feature === undefined) {
      console.log(
        chalk.red(`Error: ${chalk.bold(name)} is not a valid feature.\n`)
      );
      return LIST_FEATURES.run.apply(this);
    }

    let configPath = this._ensureConfigFile();
    let configJSON = JSON.parse(
      fs.readFileSync(configPath, { encoding: 'UTF-8' })
    );
    if (!this._isFeatureAvailable(feature)) {
      console.log(
        chalk.red(
          `Error: ${chalk.bold(name)} is only available in Ember ${
            feature.since
          } or above.`
        )
      );
      return;
    }

    if (typeof feature.callback === 'function') {
      await feature.callback(this.project, value, shouldRunCodemod);
    }

    let config = {};

    Object.keys(FEATURES).forEach((feature) => {
      if (feature === name) {
        config[feature] = value;
      } else if (configJSON[feature] !== undefined) {
        config[feature] = configJSON[feature];
      }
    });

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', {
      encoding: 'UTF-8',
    });

    let state = value ? 'Enabled' : 'Disabled';

    console.log(
      chalk.green(
        `${state} ${chalk.bold(name)}. Be sure to commit ${chalk.underline(
          'config/optional-features.json'
        )} to source control!`
      )
    );
  },
};

const USAGE = Object.assign(
  {
    name: 'feature',
    description: 'Prints the USAGE.',
    works: 'insideProject',
    run() {
      console.log(USAGE_MESSAGE);
    },
  },
  SHARED
);

/* This forces strip`` to start counting the indentaiton */
const INDENT_START = '';

const LIST_FEATURES = Object.assign(
  {
    name: 'feature:list',
    description: 'List all available features.',
    works: 'insideProject',
    run() {
      console.log(USAGE_MESSAGE);
      console.log('Available features:');

      let hasFeatures = false;

      Object.keys(FEATURES).forEach((key) => {
        let feature = FEATURES[key];

        if (this._isFeatureAvailable(feature)) {
          console.log(strip`
          ${INDENT_START}
            ${chalk.bold(key)} ${chalk.cyan(`(Default: ${feature.default})`)}
              ${feature.description}
              ${chalk.gray(
                `More information: ${chalk.underline(feature.url)}`
              )}`);

          hasFeatures = true;
        }
      });

      if (hasFeatures) {
        console.log();
      } else {
        console.log(
          chalk.gray(strip`
        ${INDENT_START}
          No optional features available for your current Ember version.
      `)
        );
      }
    },
  },
  SHARED
);

const ENABLE_FEATURE = Object.assign(
  {
    name: 'feature:enable',
    description: 'Enable feature.',
    works: 'insideProject',
    availableOptions: [
      {
        name: 'run-codemod',
        type: Boolean,
        description: 'run any associated codemods without prompting',
        // intentionally not setting a default, when the value is undefined the
        // command will prompt the user
      },
    ],
    anonymousOptions: ['<feature-name>'],
    run(commandOptions, args) {
      return this._setFeature(args[0], true, commandOptions.runCodemod);
    },
  },
  SHARED
);

const DISABLE_FEATURE = Object.assign(
  {
    name: 'feature:disable',
    description: 'Disable feature.',
    works: 'insideProject',
    availableOptions: [
      {
        name: 'run-codemod',
        type: Boolean,
        description: 'run any associated codemods without prompting',
        // intentionally not setting a default, when the value is undefined the
        // command will prompt the user
      },
    ],
    anonymousOptions: ['<feature-name>'],
    run(commandOptions, args) {
      return this._setFeature(args[0], false, commandOptions.runCodemod);
    },
  },
  SHARED
);

module.exports = {
  feature: USAGE,
  'feature:list': LIST_FEATURES,
  'feature:enable': ENABLE_FEATURE,
  'feature:disable': DISABLE_FEATURE,
};
