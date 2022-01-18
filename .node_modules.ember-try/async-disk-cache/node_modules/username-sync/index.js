'use strict';

var os = require('os');
var execSync = require('child_process').execSync;

module.exports = function() {
  return module.exports.os() || module.exports.env() || module.exports.execSync();
};

module.exports.env = function() {
  var env = process.env;

  return env.SUDO_USER ||
    env.C9_USER /* Cloud9 */ ||
    env.LOGNAME ||
    env.USER ||
    env.LNAME ||
    env.USERNAME;
};

module.exports.os = function() {
  if (typeof os.userInfo === 'function') {
    return os.userInfo().username;
  }
};

module.exports.execSync = function() {
  var username = require('child_process').execSync('whoami').toString().trim();

  if (process.platform === 'win32') {
    username = username.replace(/^.*\\/, ''); // remove DOMAIN stuff
  }

  return username;
};
