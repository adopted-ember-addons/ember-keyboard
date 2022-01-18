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
const types_1 = require("@babel/types");
const core_1 = require("@embroider/core");
const state_1 = require("./state");
const get_config_1 = require("./get-config");
const macro_condition_1 = __importStar(require("./macro-condition"));
const each_1 = require("./each");
const error_1 = __importDefault(require("./error"));
const fail_build_1 = __importDefault(require("./fail-build"));
const evaluate_json_1 = require("./evaluate-json");
const packageCache = core_1.PackageCache.shared('embroider-stage3');
function main(context) {
    let visitor = {
        Program: {
            enter(_, state) {
                state.generatedRequires = new Set();
                state.jobs = [];
                state.removed = new Set();
                state.calledIdentifiers = new Set();
                state.neededRuntimeImports = new Map();
            },
            exit(path, state) {
                pruneMacroImports(path);
                addRuntimeImports(path, state);
                for (let handler of state.jobs) {
                    handler();
                }
            },
        },
        'IfStatement|ConditionalExpression': {
            enter(path, state) {
                if (macro_condition_1.isMacroConditionPath(path)) {
                    state.calledIdentifiers.add(path.get('test').get('callee').node);
                    macro_condition_1.default(path, state);
                }
            },
        },
        ForOfStatement: {
            enter(path, state) {
                if (each_1.isEachPath(path)) {
                    state.calledIdentifiers.add(path.get('right').get('callee').node);
                    each_1.insertEach(path, state);
                }
            },
        },
        FunctionDeclaration: {
            enter(path, state) {
                let id = path.get('id');
                if (id.isIdentifier() && id.node.name === 'initializeRuntimeMacrosConfig') {
                    let pkg = packageCache.ownerOfFile(state_1.sourceFile(path, state));
                    if (pkg && pkg.name === '@embroider/macros') {
                        get_config_1.inlineRuntimeConfig(path, state);
                    }
                }
            },
        },
        CallExpression: {
            enter(path, state) {
                let callee = path.get('callee');
                if (!callee.isIdentifier()) {
                    return;
                }
                // failBuild is implemented for side-effect, not value, so it's not
                // handled by evaluateMacroCall.
                if (callee.referencesImport('@embroider/macros', 'failBuild')) {
                    state.calledIdentifiers.add(callee.node);
                    fail_build_1.default(path, state);
                    return;
                }
                // importSync doesn't evaluate to a static value, so it's implemented
                // directly here, not in evaluateMacroCall.
                if (callee.referencesImport('@embroider/macros', 'importSync')) {
                    let r = types_1.identifier('require');
                    state.generatedRequires.add(r);
                    callee.replaceWith(r);
                    return;
                }
                // getOwnConfig/getGlobalConfig/getConfig needs special handling, so
                // even though it also emits values via evaluateMacroCall when they're
                // needed recursively by other macros, it has its own insertion-handling
                // code that we invoke here.
                //
                // The things that are special include:
                //  - automatic collapsing of chained properties, etc
                //  - these macros have runtime implementations sometimes, which changes
                //    how we rewrite them
                let mode = callee.referencesImport('@embroider/macros', 'getOwnConfig')
                    ? 'own'
                    : callee.referencesImport('@embroider/macros', 'getGlobalConfig')
                        ? 'getGlobalConfig'
                        : callee.referencesImport('@embroider/macros', 'getConfig')
                            ? 'package'
                            : false;
                if (mode) {
                    state.calledIdentifiers.add(callee.node);
                    get_config_1.insertConfig(path, state, mode);
                    return;
                }
                // isTesting can have a runtime implementation. At compile time it
                // instead falls through to evaluateMacroCall.
                if (callee.referencesImport('@embroider/macros', 'isTesting') && state.opts.mode === 'run-time') {
                    state.calledIdentifiers.add(callee.node);
                    state.neededRuntimeImports.set(callee.node.name, 'isTesting');
                    return;
                }
                let result = new evaluate_json_1.Evaluator({ state }).evaluateMacroCall(path);
                if (result.confident) {
                    state.calledIdentifiers.add(callee.node);
                    path.replaceWith(evaluate_json_1.buildLiterals(result.value));
                }
            },
        },
        ReferencedIdentifier(path, state) {
            for (let candidate of [
                'dependencySatisfies',
                'moduleExists',
                'getConfig',
                'getOwnConfig',
                'failBuild',
                'importSync',
                'isDevelopingApp',
                'isDevelopingThisPackage',
                'isTesting',
            ]) {
                if (path.referencesImport('@embroider/macros', candidate) && !state.calledIdentifiers.has(path.node)) {
                    throw error_1.default(path, `You can only use ${candidate} as a function call`);
                }
            }
            if (path.referencesImport('@embroider/macros', 'macroCondition') && !state.calledIdentifiers.has(path.node)) {
                throw error_1.default(path, `macroCondition can only be used as the predicate of an if statement or ternary expression`);
            }
            if (path.referencesImport('@embroider/macros', 'each') && !state.calledIdentifiers.has(path.node)) {
                throw error_1.default(path, `the each() macro can only be used within a for ... of statement, like: for (let x of each(thing)){}`);
            }
            if (state.opts.owningPackageRoot) {
                // there is only an owningPackageRoot when we are running inside a
                // classic ember-cli build. In the embroider stage3 build, there is no
                // owning package root because we're compiling *all* packages
                // simultaneously.
                //
                // given that we're inside classic ember-cli, stop here without trying
                // to rewrite bare `require`. It's not needed, because both our
                // `importSync` and any user-written bare `require` can both mean the
                // same thing: runtime AMD `require`.
                return;
            }
            if (path.node.name === 'require' &&
                !state.generatedRequires.has(path.node) &&
                !path.scope.hasBinding('require') &&
                ownedByEmberPackage(path, state)) {
                // Our importSync macro has been compiled to `require`. But we want to
                // distinguish that from any pre-existing, user-written `require` in an
                // Ember addon, which should retain its *runtime* meaning.
                path.replaceWith(types_1.memberExpression(types_1.identifier('window'), path.node));
            }
        },
    };
    if (context.types.OptionalMemberExpression) {
        // our getConfig and getOwnConfig macros are supposed to be able to absorb
        // optional chaining. To make that work we need to see the optional chaining
        // before preset-env compiles them away.
        visitor.OptionalMemberExpression = {
            enter(path, state) {
                if (state.opts.mode === 'compile-time') {
                    let result = new evaluate_json_1.Evaluator({ state }).evaluate(path);
                    if (result.confident) {
                        path.replaceWith(evaluate_json_1.buildLiterals(result.value));
                    }
                }
            },
        };
    }
    return { visitor };
}
exports.default = main;
// This removes imports from "@embroider/macros" itself, because we have no
// runtime behavior at all.
function pruneMacroImports(path) {
    if (!path.isProgram()) {
        return;
    }
    for (let topLevelPath of path.get('body')) {
        if (topLevelPath.isImportDeclaration() && topLevelPath.get('source').node.value === '@embroider/macros') {
            topLevelPath.remove();
        }
    }
}
function addRuntimeImports(path, state) {
    if (state.neededRuntimeImports.size > 0) {
        path.node.body.push(types_1.importDeclaration([...state.neededRuntimeImports].map(([local, imported]) => types_1.importSpecifier(types_1.identifier(local), types_1.identifier(imported))), types_1.stringLiteral(state_1.pathToRuntime(path, state))));
    }
}
function ownedByEmberPackage(path, state) {
    let filename = state_1.sourceFile(path, state);
    let pkg = packageCache.ownerOfFile(filename);
    return pkg && pkg.isEmberPackage();
}
//# sourceMappingURL=macros-babel-plugin.js.map