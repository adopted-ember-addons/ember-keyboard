"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const error_1 = __importDefault(require("./error"));
const evaluate_json_1 = require("./evaluate-json");
const resolve_1 = __importDefault(require("resolve"));
const path_1 = require("path");
function moduleExists(path, state) {
    if (path.node.arguments.length !== 1) {
        throw error_1.default(path, `moduleExists takes exactly one argument, you passed ${path.node.arguments.length}`);
    }
    let [moduleSpecifier] = path.node.arguments;
    if (moduleSpecifier.type !== 'StringLiteral') {
        throw error_1.default(evaluate_json_1.assertArray(path.get('arguments'))[0], `the first argument to moduleExists must be a string literal`);
    }
    let sourceFileName = state_1.sourceFile(path, state);
    try {
        resolve_1.default.sync(moduleSpecifier.value, { basedir: path_1.dirname(sourceFileName) });
        return true;
    }
    catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
            throw err;
        }
        return false;
    }
}
exports.default = moduleExists;
//# sourceMappingURL=module-exists.js.map