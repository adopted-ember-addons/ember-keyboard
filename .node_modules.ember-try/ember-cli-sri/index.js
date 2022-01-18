/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-sri',
  included: function(app) {
    this._super.included.apply(this,arguments);

    this.options = app.options.SRI || {};

    if (!('enabled' in this.options)) {
      this.options.enabled = true;
    }

    // SRI is default on
    this.options.runsIn = this.options.runsIn || ['production', 'test'];

    // Disable if application isn't in runs-in
    if (this.options.runsIn.indexOf(app.env) === -1) {
      this.options.enabled = false;
    }

    if ('fingerprint' in app.options && 'prepend' in app.options.fingerprint) {
      this.options.prefix = app.options.fingerprint.prepend;
    }

    if (app.options.origin) {
      this.options.origin = app.options.origin;
    }

    if (!('paranoiaCheck' in this.options)) {
      this.options.paranoiaCheck = false;
    }

    if (!('fingerprintCheck' in this.options)) {
      this.options.fingerprintCheck = false;
    }
  },
  postprocessTree: function(type, tree) {
    var options = this.options || {};
    if (type === 'all' && options.enabled) {
      return require('broccoli-sri-hash')(tree, options);
    } else {
      return tree;
    }
  }
};
