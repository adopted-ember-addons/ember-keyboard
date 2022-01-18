"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const evaluate_json_1 = require("./evaluate-json");
const error_1 = __importDefault(require("./error"));
const util_1 = require("util");
function failBuild(path, state) {
    let args = path.get('arguments');
    if (args.length < 1) {
        throw error_1.default(path, `failBuild needs at least one argument`);
    }
    let e = new evaluate_json_1.Evaluator({ state });
    state.jobs.push(() => {
        let argValues = args.map(a => e.evaluate(a));
        for (let i = 0; i < argValues.length; i++) {
            if (!argValues[i].confident) {
                throw error_1.default(args[i], `the arguments to failBuild must be statically known`);
            }
        }
        let confidentArgValues = argValues;
        if (!wasRemoved(path, state)) {
            maybeEmitError(path, confidentArgValues);
        }
    });
}
exports.default = failBuild;
function maybeEmitError(path, argValues) {
    let [message, ...rest] = argValues;
    throw error_1.default(path, util_1.format(`failBuild: ${message.value}`, ...rest.map(r => r.value)));
}
function wasRemoved(path, state) {
    return state.removed.has(path.node) || Boolean(path.findParent(p => state.removed.has(p.node)));
}
//# sourceMappingURL=fail-build.js.map