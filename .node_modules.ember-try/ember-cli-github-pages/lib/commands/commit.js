'use strict';

var exec = require('child_process').exec;
var RSVP = require('rsvp');
var path = require('path');

module.exports = {
  name: 'github-pages:commit',
  aliases: ['gh-pages:commit'],
  description: 'Build the test app for production and commit it into a git branch',
  works: 'insideProject',

  availableOptions: [{
    name:         'message',
    type:         String,
    default:      'new gh-pages version',
    description:  'The commit message to include with the build, must be wrapped in quotes.'
  }, {
    name:         'environment',
    type:         String,
    default:      'production',
    description:  'The ember environment to create a build for'
  }, {
    name:         'branch',
    type:         String,
    default:      'gh-pages',
    description:  'The git branch to push your pages to'
  }, {
    name:         'destination',
    type:         String,
    default:      '.',
    description:  'The directory into which the built application should be copied'
  }],

  run: function(options, rawArgs) {
    var ui          = this.ui;
    var root        = this.project.root;
    var execOptions = { cwd: root, shell: process.env.SHELL };

    function buildApp() {
      var env = options.environment;
      return runCommand('ember build --environment=' + env, execOptions);
    }

    function checkoutGhPages() {
      return runCommand('git checkout ' + options.branch, execOptions);
    }

    function copy() {
      var rel = path.relative(root, options.destination);
      if (options.destination === '.' || rel.match(/^\.\.(\/\.\.)*$/)) {
        return runCommand('cp -R dist/* ' + options.destination + '/', execOptions);
      } else {
        return runCommand('rm -r ' + options.destination, execOptions)
                .then(function() {
                  return runCommand('mkdir ' + options.destination, execOptions);
                })
                .then(function() {
                  return runCommand('cp -R dist/* ' + options.destination + '/', execOptions);
                });
      }
    }

    function addAndCommit() {
      return runCommand('git -c core.safecrlf=false add "' + options.destination + '"', execOptions)
              .then(function() {
                return runCommand('git commit -m "' + options.message + '"', execOptions);
              })
    }

    function returnToPreviousCheckout() {
      return runCommand('git checkout -', execOptions);
    }

    return buildApp()
      .then(checkoutGhPages)
      .then(copy)
      .then(addAndCommit)
      .then(returnToPreviousCheckout)
      .then(function() {
        var branch = options.branch;
        ui.write('Done. All that\'s left is to git push the ' + branch +
          ' branch.\nEx: git push origin ' + branch + ':' + branch +'\n');
      });
  }
};

function runCommand(/* child_process.exec args */) {
  var args = Array.prototype.slice.call(arguments);

  var lastIndex = args.length - 1;
  var lastArg   = args[lastIndex];
  var logOutput = false;
  if (typeof lastArg === 'boolean') {
    logOutput = lastArg;
    args.splice(lastIndex);
  }

  return new RSVP.Promise(function(resolve, reject) {
    var cb = function(err, stdout, stderr) {
      if (logOutput) {
        if (stderr) {
          console.log(stderr);
        }

        if (stdout) {
          console.log(stdout);
        }
      }

      if (err) {
        return reject(err);
      }

      return resolve();
    };

    args.push(cb);
    exec.apply(exec, args);
  }.bind(this));
}
