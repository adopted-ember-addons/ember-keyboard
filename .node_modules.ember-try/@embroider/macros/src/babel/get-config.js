"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inlineRuntimeConfig = exports.insertConfig = void 0;
const types_1 = require("@babel/types");
const state_1 = require("./state");
const core_1 = require("@embroider/core");
const error_1 = __importDefault(require("./error"));
const evaluate_json_1 = require("./evaluate-json");
const assert_never_1 = __importDefault(require("assert-never"));
const types_2 = require("@babel/types");
const packageCache = core_1.PackageCache.shared('embroider-stage3');
function getPackage(path, state, mode) {
    let packageName;
    if (mode === 'own') {
        if (path.node.arguments.length !== 0) {
            throw error_1.default(path, `getOwnConfig takes zero arguments, you passed ${path.node.arguments.length}`);
        }
        packageName = undefined;
    }
    else if (mode === 'package') {
        if (path.node.arguments.length !== 1) {
            throw error_1.default(path, `getConfig takes exactly one argument, you passed ${path.node.arguments.length}`);
        }
        let packageNode = path.node.arguments[0];
        if (packageNode.type !== 'StringLiteral') {
            throw error_1.default(evaluate_json_1.assertArray(path.get('arguments'))[0], `the argument to getConfig must be a string literal`);
        }
        packageName = packageNode.value;
    }
    else {
        assert_never_1.default(mode);
    }
    return targetPackage(state_1.sourceFile(path, state), packageName, packageCache);
}
// this evaluates to the actual value of the config. It can be used directly by the Evaluator.
function getConfig(path, state, mode) {
    let config;
    if (mode === 'getGlobalConfig') {
        return state.opts.globalConfig;
    }
    let pkg = getPackage(path, state, mode);
    if (pkg) {
        config = state.opts.userConfigs[pkg.root];
    }
    return config;
}
exports.default = getConfig;
// this is the imperative version that's invoked directly by the babel visitor
// when we encounter getConfig. It's implemented in terms of getConfig so we can
// be sure we have the same semantics.
function insertConfig(path, state, mode) {
    if (state.opts.mode === 'compile-time') {
        let config = getConfig(path, state, mode);
        let collapsed = collapse(path, config);
        let literalResult = evaluate_json_1.buildLiterals(collapsed.config);
        collapsed.path.replaceWith(literalResult);
    }
    else {
        if (mode === 'getGlobalConfig') {
            state.neededRuntimeImports.set(calleeName(path), 'getGlobalConfig');
        }
        else {
            let pkg = getPackage(path, state, mode);
            let pkgRoot;
            if (pkg) {
                pkgRoot = types_1.stringLiteral(pkg.root);
            }
            else {
                pkgRoot = types_1.identifier('undefined');
            }
            let name = state_1.unusedNameLike('config', path);
            path.replaceWith(types_1.callExpression(types_1.identifier(name), [pkgRoot]));
            state.neededRuntimeImports.set(name, 'config');
        }
    }
}
exports.insertConfig = insertConfig;
function targetPackage(fromPath, packageName, packageCache) {
    let us = packageCache.ownerOfFile(fromPath);
    if (!us) {
        throw new Error(`unable to determine which npm package owns the file ${fromPath}`);
    }
    if (!packageName) {
        return us;
    }
    try {
        return packageCache.resolve(packageName, us);
    }
    catch (err) {
        return null;
    }
}
function collapse(path, config) {
    let evaluator = new evaluate_json_1.Evaluator({ knownPaths: new Map([[path, { confident: true, value: config }]]) });
    while (true) {
        let parentPath = path.parentPath;
        let result = evaluator.evaluate(parentPath);
        if (!result.confident || parentPath.isAssignmentExpression()) {
            return { path, config: evaluator.evaluate(path).value };
        }
        path = parentPath;
    }
}
function inlineRuntimeConfig(path, state) {
    path.get('body').node.body = [
        types_1.returnStatement(evaluate_json_1.buildLiterals({ packages: state.opts.userConfigs, global: state.opts.globalConfig })),
    ];
}
exports.inlineRuntimeConfig = inlineRuntimeConfig;
function calleeName(path) {
    let callee = path.node.callee;
    if (types_2.isIdentifier(callee)) {
        return callee.name;
    }
    throw new Error(`bug: our macros should only be invoked as identifiers`);
}
//# sourceMappingURL=get-config.js.map