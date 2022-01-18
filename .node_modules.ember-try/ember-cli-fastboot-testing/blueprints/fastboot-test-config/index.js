/* eslint-env node */
module.exports = {
  description: 'Generates test config for adding custom Fastboot sandbox globals',

  normalizeEntityName(entityName) {
    return entityName;
  },

  fileMapTokens(options) {
    let configPath = 'config';
    let pkg = this.project.pkg;

    if (pkg['ember-addon'] && pkg['ember-addon']['configPath']) {
      configPath = pkg['ember-addon']['configPath'];
    }
    return {
      __config__(options) {
        return configPath
      }
    }
  }

};
