'use strict';

const stringUtils = require('ember-cli-string-utils');
const useTestFrameworkDetector = require('../test-framework-detector');

module.exports = useTestFrameworkDetector({
  description: 'Generates a helper integration test or a unit test.',

  fileMapTokens: function () {
    return {
      __root__() {
        return 'tests';
      },
      __testType__(options) {
        return options.locals.testType || 'integration';
      },
      __collection__() {
        return 'modifiers';
      },
    };
  },

  locals: function (options) {
    const friendlyTestName = [
      'Integration',
      'Modifier',
      options.entity.name,
    ].join(' | ');

    let dasherizedModulePrefix = stringUtils.dasherize(
      options.project.config().modulePrefix
    );

    return {
      friendlyTestName: friendlyTestName,
      dasherizedModulePrefix: dasherizedModulePrefix,
    };
  },
});
