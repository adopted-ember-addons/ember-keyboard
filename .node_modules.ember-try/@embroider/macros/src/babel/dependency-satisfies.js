"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const semver_1 = require("semver");
const core_1 = require("@embroider/core");
const error_1 = __importDefault(require("./error"));
const evaluate_json_1 = require("./evaluate-json");
const packageCache = core_1.PackageCache.shared('embroider-stage3');
function dependencySatisfies(path, state) {
    if (path.node.arguments.length !== 2) {
        throw error_1.default(path, `dependencySatisfies takes exactly two arguments, you passed ${path.node.arguments.length}`);
    }
    let [packageName, range] = path.node.arguments;
    if (packageName.type !== 'StringLiteral') {
        throw error_1.default(evaluate_json_1.assertArray(path.get('arguments'))[0], `the first argument to dependencySatisfies must be a string literal`);
    }
    if (range.type !== 'StringLiteral') {
        throw error_1.default(evaluate_json_1.assertArray(path.get('arguments'))[1], `the second argument to dependencySatisfies must be a string literal`);
    }
    let sourceFileName = state_1.sourceFile(path, state);
    try {
        let us = packageCache.ownerOfFile(sourceFileName);
        if (!us) {
            return false;
        }
        let version = packageCache.resolve(packageName.value, us).version;
        return semver_1.satisfies(version, range.value, {
            includePrerelease: true,
        });
    }
    catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
            throw err;
        }
        return false;
    }
}
exports.default = dependencySatisfies;
//# sourceMappingURL=dependency-satisfies.js.map