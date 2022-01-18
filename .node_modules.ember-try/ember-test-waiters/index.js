'use strict';

const forceHighlander = require('./force-highlander-addon').forceHighlander;

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);

    forceHighlander(this.project);
  },
};
