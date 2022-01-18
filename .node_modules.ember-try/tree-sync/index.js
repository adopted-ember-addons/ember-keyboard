'use strict';

const walkSync = require('walk-sync');
const FSTree = require('fs-tree-diff');
const mkdirp = require('mkdirp');
const fs = require('fs');
const debug = require('debug')('tree-sync');

module.exports = class TreeSync {
  constructor(input, output, options = {}) {
    this._input = input;
    this._output = output;
    this._options = options;
    this._walkSyncOpts = {};
    this._hasSynced = false;
    this._lastInput = FSTree.fromEntries([]);

    // Pass through whitelisted options to walk-sync.
    if (this._options.globs) {
      this._walkSyncOpts.globs = options.globs;
    }
    if (this._options.ignore) {
      this._walkSyncOpts.ignore = options.ignore;
    }

    debug('initializing TreeSync:  %s -> %s', this._input, this._output);
  }

  sync() {
    mkdirp.sync(this._output);
    mkdirp.sync(this._input);

    debug('syncing %s -> %s', this._input, this._output);

    const input = FSTree.fromEntries(walkSync.entries(this._input, this._walkSyncOpts));
    const output = FSTree.fromEntries(walkSync.entries(this._output, this._walkSyncOpts));

    debug('walked %s %dms and  %s %dms', this._input, input.size, this._output, output.size);

    const isFirstSync = !this._hasSynced;
    let operations = output.calculatePatch(input).filter(operation => {
      if (operation[0] === 'change') {
        return isFirstSync;
      } else {
        return true;
      }
    });

    const inputOperations = this._lastInput.calculatePatch(input).filter(operation => {
      return operation[0] === 'change';
    });

    this._lastInput = input;

    operations = operations.concat(inputOperations);

    debug('calc operations %d', operations.length);

    for (const patch of operations) {
      const operation = patch[0];
      const pathname = patch[1];
      const entry = patch[2];

      const inputFullPath = this._input + '/' + pathname;
      const outputFullPath = this._output + '/' + pathname;

      switch(operation) {
        case 'create' :
        case 'change' :
          fs.writeFileSync(outputFullPath, fs.readFileSync(inputFullPath), { mode: entry.mode });
          fs.utimesSync(outputFullPath, new Date(), entry.mtime / 1e3);
          break;

        case 'mkdir' :
          try {
            fs.mkdirSync(outputFullPath);
          } catch(e) {
            if (e && e.code === 'EEXIST') { /* do nothing */ }
            else { throw e; }
          }
          break;

        case 'unlink':
          try {
            fs.unlinkSync(outputFullPath);
          } catch(e) {
            if (e && e.code === 'ENOENT') { /* do nothing */ }
            else { throw e; }
          }
          break;

        case 'rmdir':
          fs.rmdirSync(outputFullPath);
          break;

        default:
          throw TypeError('Unknown operation:' + operation + ' on path: ' + pathname);
      }
    }

    this._hasSynced = true;
    debug('applied patches: %d', operations.length);

    // Return only type and name; don't want downstream relying on entries.
    return operations.map(op => op.slice(0,2));
  }
};
