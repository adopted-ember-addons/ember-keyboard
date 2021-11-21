/* globals blanket, module */

var options = {
  modulePrefix: 'ember-keyboard',
  filter: '//.*ember-keyboard/.*/',
  antifilter: '//.*(tests|template).*/',
  loaderExclusions: [],
  enableCoverage: true,
  cliOptions: {
    reporters: ['lcov'],
    autostart: true,
    lcovOptions: {
      outputFile: 'lcov.info',
      //provide a function to rename es6 modules to a file path
      renamer: function (moduleName) {
        var root = /^ember-keyboard/;
        return moduleName.replace(root, 'addon') + '.js';
      },
    },
  },
};
if (typeof exports === 'undefined') {
  blanket.options(options);
} else {
  module.exports = options;
}
