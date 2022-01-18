'use strict';

let fs = require('fs');
let path = require('path');
let nock = require('nock');
let url = require('url');
let JSONfn = require('json-fn');
let FastBoot = require('fastboot');
let bodyParser = require('body-parser');

function createMockRequest(app) {
  app.post('/__mock-request', bodyParser.json({ limit: '50mb' }), (req, res) => {
    const requestOrigin = req.body.origin || req.headers.origin;
    let mock = nock(requestOrigin)
      .persist()
      .intercept(req.body.path, req.body.method)
      .reply(req.body.statusCode, req.body.response);

    res.json({ mocks: mock.pendingMocks() });
  });
}

function createCleanUpMocks(app) {
  app.use('/__cleanup-mocks', (req, res) => {
    nock.cleanAll()

    res.json({ ok: true });
  });
}

function createFastbootTest(app, callback) {
  app.post('/__fastboot-testing', bodyParser.json(), (req, res) => {
    let urlToVisit = decodeURIComponent(req.body.url);
    let parsed = url.parse(urlToVisit, true);

    let headers = Object.assign(
      {},
      req.headers,
      JSONfn.parse(req.body.options).headers || {}
    );

    let defaultOptions = {
      request: {
        method: 'GET',
        protocol: 'http',
        url: parsed.path,
        query: parsed.query,
        headers,
      },
      response: {},
    };

    let options = Object.assign(defaultOptions, JSONfn.parse(req.body.options));

    res.set('x-fastboot-testing', true);

    callback({ req, res, options, urlToVisit });
  });
}

function createFastbootEcho(app) {
  app.post('/fastboot-testing/echo', bodyParser.text(), (req, res) => {
    res.send(req.body);
  });
}

function reloadServer(fastboot, distPath) {
  fastboot.reload({ distPath });
}

function createServer(distPath, pkg) {
  let options = makeFastbootTestingConfig({ distPath }, pkg);
  let fastboot = new FastBoot(options);

  return fastboot;
}

function makeFastbootTestingConfig(config, pkg) {
  let defaults = {
    setupFastboot() {}
  };

  let configPath = 'config';

  if (pkg['ember-addon'] && pkg['ember-addon']['configPath']) {
    configPath = pkg['ember-addon']['configPath'];
  }

  let fastbootTestConfigPath = path.resolve(configPath, 'fastboot-testing.js');

  let customized = fs.existsSync(fastbootTestConfigPath) ?
    require(fastbootTestConfigPath) :
    {};

  return Object.assign({}, config, defaults, customized);
}

module.exports = {
  createMockRequest,
  createCleanUpMocks,
  createFastbootTest,
  createFastbootEcho,
  reloadServer,
  createServer,
  makeFastbootTestingConfig
};
