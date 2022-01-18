"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.failBuild = void 0;
const util_1 = require("util");
const evaluate_1 = __importDefault(require("./evaluate"));
function failBuild(node) {
    if (node.params.length < 1) {
        throw new Error(`macroFailBuild requires at least one argument`);
    }
    let values = node.params.map(evaluate_1.default);
    for (let i = 0; i < values.length; i++) {
        if (!values[i].confident) {
            throw new Error(`argument ${i} to macroFailBuild is not statically analyzable`);
        }
    }
    let [message, ...rest] = values;
    throw new Error(util_1.format(`failBuild: ${message.value}`, ...rest.map((r) => r.value)));
}
exports.failBuild = failBuild;
//# sourceMappingURL=fail-build.js.map