'use strict';

module.exports = {
  name: require('./package').name,

  config(environment, appConfig) {
    const addonConfig = appConfig['emberKeyboard'] || {};

    if (
      'disableInputsInitializer' in addonConfig &&
      !this.disableInputsInitializerDeprecationPrinted
    ) {
      // Do not print deprecation message multiple times
      // as this hook may be invoked more than once.
      this.disableInputsInitializerDeprecationPrinted = true;

      this.ui.writeDeprecateLine(
        '[ember-keyboard] The `emberKeyboard.disableInputsInitializer` option is obsolete. ' +
          'You can remove it from your `config/environment.js` file.',
        false
      );
    }

    if ('propagation' in addonConfig && !this.propagationDeprecationPrinted) {
      // Do not print deprecation message multiple times
      // as this hook may be invoked more than once.
      this.propagationDeprecationPrinted = true;

      this.ui.writeDeprecateLine(
        '[ember-keyboard] The `emberKeyboard.propagation` option is obsolete. ' +
          'You can remove it from your `config/environment.js` file.',
        false
      );
    }
  },
};
