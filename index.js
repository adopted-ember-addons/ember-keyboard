'use strict';

module.exports = {
  name: require('./package').name,

  config(environment, appConfig) {
    const addonConfig = appConfig['emberKeyboard'] || {};

    if ('disableInputsInitializer' in addonConfig && !this.deprecationPrinted) {
      // Do not print deprecation message multiple times
      // as this hook may be invoked more than once.
      this.deprecationPrinted = true;

      this.ui.writeDeprecateLine(
        '[ember-keyboard] The `emberKeyboard.disableInputsInitializer` option is obsolete. ' +
        'You can remove it from your `config/environment.js` file.', false
      );
    }
  },
};
