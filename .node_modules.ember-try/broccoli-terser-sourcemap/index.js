'use strict';

const fs = require('fs');
const walkSync = require('walk-sync');
const Plugin = require('broccoli-plugin');
const path = require('path');
const defaults = require('lodash.defaultsdeep');
const symlinkOrCopy = require('symlink-or-copy');
const MatcherCollection = require('matcher-collection');
const debug = require('debug')('broccoli-terser-sourcemap');
const queue = require('async-promise-queue');
const workerpool = require('workerpool');

const processFile = require('./lib/process-file');

const silent = process.argv.indexOf('--silent') !== -1;

const worker = queue.async.asyncify(doWork => doWork());

const MatchNothing = {
  match() {
    return false;
  },
};

module.exports = class TerserWriter extends Plugin {
  constructor(_inputNodes, options = {}) {
    let inputNodes = Array.isArray(_inputNodes) ? _inputNodes : [_inputNodes];

    super(inputNodes, {
      name: options.name,
      annotation: options.annotation,
      needsCache: false,
    });

    this.options = defaults(options, {
      terser: {
        sourceMap: {},
      },
    });

    // async prop is deprecated since terser.minify() is async by default
    if ('async' in this.options) {
      throw new Error('\n Passing `async` property inside `options` is deprecated.');
    }

    this.concurrency = Number(process.env.JOBS) || this.options.concurrency || Math.max(require('os').cpus().length - 1, 1);

    // create a worker pool using an external worker script
    this.pool = workerpool.pool(path.join(__dirname, 'lib', 'worker.js'), {
      maxWorkers: this.concurrency,
      workerType: 'auto',
    });

    let exclude = this.options.exclude;
    if (Array.isArray(exclude)) {
      this.excludes = new MatcherCollection(exclude);
    } else {
      this.excludes = MatchNothing;
    }
  }

  async build() {
    let pendingWork = [];

    this.inputPaths.forEach(inputPath => {
      walkSync(inputPath).forEach(relativePath => {
        if (relativePath.slice(-1) === '/') {
          return;
        }
        let inFile = path.join(inputPath, relativePath);
        let outFile = path.join(this.outputPath, relativePath);

        fs.mkdirSync(path.dirname(outFile), { recursive: true });

        if (this._isJSExt(relativePath) && !this.excludes.match(relativePath)) {
          // wrap this in a function so it doesn't actually run yet, and can be throttled
          let terserOperation = () => this.processFile(inFile, outFile, relativePath, this.outputPath);
          pendingWork.push(terserOperation);
        } else if (relativePath.slice(-4) === '.map') {
          if (this.excludes.match(`${relativePath.slice(0, -4)}.{js,mjs}`)) {
            // ensure .map files for excluded JS paths are also copied forward
            symlinkOrCopy.sync(inFile, outFile);
          }
          // skip, because it will get handled when its corresponding JS does
        } else {
          symlinkOrCopy.sync(inFile, outFile);
        }
      });
    });

    try {
      await queue(worker, pendingWork, this.concurrency);
    } finally {
      // make sure to shut down the workers on both success and error case
      this.pool.terminate();
    }
  }

  _isJSExt(relativePath) {
    return relativePath.slice(-3) === '.js' || relativePath.slice(-4) === '.mjs';
  }

  processFile(inFile, outFile, relativePath, outDir) {
    // don't run this in the workerpool if concurrency is disabled (can set JOBS <= 1)
    if (this.concurrency > 1) {
      debug('running in workerpool, concurrency=%d', this.concurrency);
      // each of these arguments is a string, which can be sent to the worker process as-is
      return this.pool.exec('processFileParallel', [inFile, outFile, relativePath, outDir, silent, this.options]);
    }
    debug('not running in workerpool');
    return processFile(inFile, outFile, relativePath, outDir, silent, this.options);
  }
};
