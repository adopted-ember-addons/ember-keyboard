'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands: function() {
    return {
      'github-pages:commit': require('./lib/commands/commit')
    };
  }
};
