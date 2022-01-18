/* global module */

module.exports = {

  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addPackagesToProject([
      { name: 'highlightjs' },
      { name: 'marked' }
    ]);
  }
};
