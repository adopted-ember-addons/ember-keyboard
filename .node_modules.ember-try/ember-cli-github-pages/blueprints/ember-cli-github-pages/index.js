'use strict';

var RSVP = require('rsvp');
var path = require('path');
var fs = require('fs');
var writeFile = RSVP.denodeify(fs.writeFile);
var VersionChecker = require('ember-cli-version-checker');

module.exports = {
  description: 'Updates dummy config to work on gh-pages',
  normalizeEntityName: function() { },

  afterInstall: function() {
    var checker = new VersionChecker(this);
    var dep = checker.for('ember-cli', 'npm');
    var urlType = dep.satisfies('>= 2.7.0-beta.1') ? 'rootURL' : 'baseUrl';

    this.urlType = urlType;

    return this.updateDummyConfig().then(function() {
      this.ui.writeLine('Updated config/environment.js ' + urlType + ' and locationType.');
    }.bind(this));
  },

  updateDummyConfig: function() {
    var name = this.project.pkg.name;
    var search = "  if (environment === 'production') {";
    var replace = "  if (environment === 'production') {\n    ENV.locationType = 'hash';\n    ENV." + this.urlType + " = '/" + name + "/';";

    return this.replaceEnvironment(search, replace);
  },

  replaceEnvironment: function(search, replace) {
    var addon = this.project.pkg['ember-addon'];
    var configPath = addon ? addon.configPath : 'config';

    return this.replaceInFile(configPath + '/environment.js', search, replace);
  },

  replaceInFile: function(pathRelativeToProjectRoot, searchTerm, contentsToInsert) {
    var fullPath = path.join(this.project.root, pathRelativeToProjectRoot);
    var originalContents  = '';

    if (fs.existsSync(fullPath)) {
      originalContents = fs.readFileSync(fullPath, { encoding: 'utf8' });
    }

    var contentsToWrite = originalContents.replace(searchTerm, contentsToInsert);
    var returnValue = {
      path: fullPath,
      originalContents: originalContents,
      contents: contentsToWrite,
      inserted: false
    };

    if (contentsToWrite !== originalContents) {
      returnValue.inserted = true;

      return writeFile(fullPath, contentsToWrite)
        .then(function() {
          return returnValue;
        });
    } else {
      return RSVP.resolve(returnValue);
    }
  }
}
