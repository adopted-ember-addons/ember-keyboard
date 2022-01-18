"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const findup_sync_1 = __importDefault(require("findup-sync"));
const esm_1 = __importDefault(require("esm"));
const esmRequire = esm_1.default(module);
/**
 * Require a brocfile via either ESM or TypeScript
 *
 * @param {String} brocfilePath The path to the brocfile
 * @returns {*}
 */
function requireBrocfile(brocfilePath) {
    let brocfile;
    if (brocfilePath.match(/\.ts$/)) {
        try {
            require.resolve('ts-node');
        }
        catch (e) {
            throw new Error(`Cannot find module 'ts-node', please install`);
        }
        try {
            require.resolve('typescript');
        }
        catch (e) {
            throw new Error(`Cannot find module 'typescript', please install`);
        }
        // Register ts-node typescript compiler
        require('ts-node').register(); // eslint-disable-line node/no-unpublished-require
        // Load brocfile via ts-node
        brocfile = require(brocfilePath);
    }
    else {
        // Load brocfile via esm shim
        brocfile = esmRequire(brocfilePath);
    }
    // ESM `export default X` is represented as module.exports = { default: X }
    // eslint-disable-next-line no-prototype-builtins
    if (brocfile !== null && typeof brocfile === 'object' && brocfile.hasOwnProperty('default')) {
        brocfile = brocfile.default;
    }
    return brocfile;
}
module.exports = function loadBrocfile(options = {}) {
    let brocfilePath;
    if (options.brocfilePath) {
        brocfilePath = path_1.default.resolve(options.brocfilePath);
    }
    else {
        brocfilePath = findup_sync_1.default('Brocfile.{ts,js}', {
            nocase: true,
        });
    }
    if (!brocfilePath) {
        throw new Error('Brocfile.[js|ts] not found');
    }
    const baseDir = options.cwd || path_1.default.dirname(brocfilePath);
    // The chdir should perhaps live somewhere else and not be a side effect of
    // this function, or go away entirely
    process.chdir(baseDir);
    const brocfile = requireBrocfile(brocfilePath);
    // Brocfile should export a function, if it did, return now
    if (typeof brocfile === 'function') {
        return brocfile;
    }
    // Wrap brocfile result in a function for backwards compatibility
    return () => brocfile;
};
//# sourceMappingURL=load_brocfile.js.map