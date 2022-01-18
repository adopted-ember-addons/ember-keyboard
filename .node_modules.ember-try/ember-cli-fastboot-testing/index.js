'use strict';

let resolve = require('resolve');
let minimist = require('minimist');

let {
  createCleanUpMocks,
  createFastbootEcho,
  createFastbootTest,
  createMockRequest,
  reloadServer,
  createServer
} = require('./lib/helpers');

module.exports = {
  name: 'ember-cli-fastboot-testing',

  isDevelopingAddon() {
    return false;
  },

  isEnabled() {
    // enable this addon if were building for the dummy
    // app. that's because this is most likely an addon docs
    // build and we need this addon enabled for our docs
    // to deploy correctly.
    return this.app.name === "dummy" ||
      this.app.env !== "production";
  },

  included() {
    this._super.included.apply(this, arguments);

    try {
      resolve.sync('ember-cli-fastboot/package.json', { basedir: this.project.root });
    } catch(err) {
      throw new Error(`Unable to find FastBoot. Did you forget to add ember-cli-fastboot to your app? ${err}`);
    }
  },

  serverMiddleware(options) {
    this._fastbootRenderingMiddleware(options.app);
  },

  testemMiddleware(app) {
    this._fastbootRenderingMiddleware(app);
  },

  // we have to use the outputReady hook to ensure that ember-cli has finished copying the contents to the outputPath directory
  outputReady(result) {
    // NOTE: result.directory is not updated and still references the same path as postBuild hook (this might be a bug in ember-cli)
    // Set the distPath to the "final" outputPath, where EMBER_CLI_TEST_OUTPUT is the path passed to testem (set by ember-cli).
    // We fall back to result.directory if EMBER_CLI_TEST_OUTPUT is not set.
    let distPath = process.env.EMBER_CLI_TEST_OUTPUT || result.directory;
    let { pkg } = this.project;

    if (this.fastboot) {
      reloadServer(this.fastboot, distPath);
    } else {
      this.fastboot = createServer(distPath, pkg);
    }

    return result;
  },

  _fastbootRenderingMiddleware(app) {
    createMockRequest(app);
    createCleanUpMocks(app);
    createFastbootTest(app, ({res, options, urlToVisit}) => {
      if (!this.fastboot) {
        const path = minimist(process.argv.slice(2)).path;
        if (path) {
          this.fastboot = createServer(path, this.project.pkg);
        } else {
          return res.json({ err: 'no path found' });
        }
      }

      this.fastboot
        .visit(urlToVisit, options)
        .then(page => {
          page.html().then(html => {
            res.json({
              finalized: page.finalized,
              url: page.url,
              statusCode: page.statusCode,
              headers: page.headers.headers,
              html: html
            });
          });
        })
        .catch(err => {
          let errorObject;
          let jsonError = {};

          errorObject = (typeof err === 'string') ?
            new Error(err) :
            err;

          // we need to copy these properties off the error
          // object into a pojo that can be serialized and
          // sent over the wire to the test runner.
          let errorProps = [
            'description',
            'fileName',
            'lineNumber',
            'message',
            'name',
            'number',
            'stack'
          ];

          errorProps.forEach(key => jsonError[key] = errorObject[key]);

          res.json({ err: jsonError });
        });
    });

    if (this.app && this.app.name === "dummy") {
      // our dummy app has an echo endpoint!
      createFastbootEcho(app);
    }
  },
};
