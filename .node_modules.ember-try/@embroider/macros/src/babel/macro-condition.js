"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMacroConditionPath = void 0;
const evaluate_json_1 = require("./evaluate-json");
const error_1 = __importDefault(require("./error"));
function isMacroConditionPath(path) {
    let test = path.get('test');
    if (test.isCallExpression()) {
        let callee = test.get('callee');
        if (callee.referencesImport('@embroider/macros', 'macroCondition')) {
            return true;
        }
    }
    return false;
}
exports.isMacroConditionPath = isMacroConditionPath;
function macroCondition(conditionalPath, state) {
    let args = conditionalPath.get('test').get('arguments');
    if (args.length !== 1) {
        throw error_1.default(conditionalPath, `macroCondition accepts exactly one argument, you passed ${args.length}`);
    }
    let [predicatePath] = args;
    let predicate = new evaluate_json_1.Evaluator({ state }).evaluate(predicatePath);
    if (!predicate.confident) {
        throw error_1.default(args[0], `the first argument to macroCondition must be statically known`);
    }
    let consequent = conditionalPath.get('consequent');
    let alternate = conditionalPath.get('alternate');
    if (state.opts.mode === 'run-time') {
        let callee = conditionalPath.get('test').get('callee');
        state.neededRuntimeImports.set(callee.node.name, 'macroCondition');
    }
    else {
        let [kept, removed] = predicate.value ? [consequent.node, alternate.node] : [alternate.node, consequent.node];
        if (kept) {
            conditionalPath.replaceWith(kept);
        }
        else {
            conditionalPath.remove();
        }
        if (removed) {
            state.removed.add(removed);
        }
    }
}
exports.default = macroCondition;
//# sourceMappingURL=macro-condition.js.map