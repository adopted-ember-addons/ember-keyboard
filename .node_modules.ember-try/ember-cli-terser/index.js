'use strict';

module.exports = {
  name: require('./package').name,

  included(app) {
    this._super.included.apply(this, arguments);

    let defaultOptions = {
      enabled: app.env === 'production',

      terser: {
        compress: {
          // this is adversely affects heuristics for IIFE eval
          'negate_iife': false,
          // limit sequences because of memory issues during parsing
          sequences: 30,
        },
        mangle: {
          safari10: true
        },
        output: {
          // no difference in size and much easier to debug
          semicolons: false,
        },
      }
    };

    if (app.options.sourcemaps && !this._sourceMapsEnabled(app.options.sourcemaps)) {
      defaultOptions.terser.sourceMap = false;
    }

    let addonOptions = app.options['ember-cli-terser'];

    if ('ember-cli-uglify' in app.options) {
      this.ui.writeWarnLine('[ember-cli-terser] Passing options as `ember-cli-uglify` in `ember-cli-build.js` is deprecated, please update to passing `ember-cli-terser` (with a `terser` property) instead.');

      addonOptions = Object.assign({}, app.options['ember-cli-uglify'], { terser: app.options['ember-cli-uglify'].uglify, uglify: undefined });
    }

    this._terserOptions = Object.assign({}, defaultOptions, addonOptions);
  },

  _sourceMapsEnabled(options) {
    if (options.enabled === false) {
      return false;
    }

    let extensions = options.extensions || [];
    if (extensions.indexOf('js') === -1) {
      return false;
    }

    return true;
  },

  postprocessTree(type, tree) {
    if (this._terserOptions.enabled === true && type === 'all') {
      const Terser = require('broccoli-terser-sourcemap');

      return new Terser(tree, this._terserOptions);
    } else {
      return tree;
    }
  }
};
