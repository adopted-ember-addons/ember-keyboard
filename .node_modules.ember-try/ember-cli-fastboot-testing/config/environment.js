'use strict';

module.exports = function(environment, appConfig) {
  if (environment === 'test' || environment === 'development') {
    appConfig.fastboot = appConfig.fastboot || {};
    appConfig.fastboot.hostWhitelist = appConfig.fastboot.hostWhitelist || [];
    appConfig.fastboot.hostWhitelist.push(/localhost:\d+$/);
  }

  return { };
};
