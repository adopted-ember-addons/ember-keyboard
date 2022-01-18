"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const workerpool_1 = __importDefault(require("workerpool"));
const index_1 = require("./index");
async function run(transformPath, filePath, options) {
    const module = require(transformPath);
    const plugin = typeof module.default === 'function' ? module.default : module;
    return readFile(filePath)
        .then((contents) => applyTransform(plugin, filePath, contents))
        .then((output) => writeFile(filePath, output, options))
        .then((output) => ({
        type: 'update',
        file: filePath,
        status: output.skipped ? 'skipped' : output.changed ? 'ok' : 'nochange',
    }))
        .catch((err) => ({
        type: 'error',
        file: filePath,
        error: err.stack,
    }));
}
/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, contents) => {
            err ? reject(err) : resolve(contents);
        });
    });
}
function applyTransform(plugin, filePath, contents) {
    const results = index_1.transform({
        template: contents,
        filePath,
        plugin,
    });
    return {
        skipped: !results.code,
        changed: results.code !== contents,
        source: results.code,
    };
}
async function writeFile(filePath, output, options) {
    const { changed, source } = output;
    if (options.dry || !changed) {
        return output;
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, source, 'utf8', (err) => {
            err ? reject(err) : resolve(output);
        });
    });
}
workerpool_1.default.worker({
    run,
});
//# sourceMappingURL=worker.js.map