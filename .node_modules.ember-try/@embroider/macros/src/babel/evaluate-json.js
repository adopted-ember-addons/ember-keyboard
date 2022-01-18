"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLiterals = exports.assertArray = exports.assertNotArray = exports.Evaluator = void 0;
const types_1 = require("@babel/types");
const core_1 = require("@babel/core");
const state_1 = require("./state");
const dependency_satisfies_1 = __importDefault(require("./dependency-satisfies"));
const module_exists_1 = __importDefault(require("./module-exists"));
const get_config_1 = __importDefault(require("./get-config"));
const binops = {
    '||': function (a, b) {
        return a || b;
    },
    '&&': function (a, b) {
        return a && b;
    },
    '|': function (a, b) {
        return a | b;
    },
    '^': function (a, b) {
        return a ^ b;
    },
    '&': function (a, b) {
        return a & b;
    },
    '==': function (a, b) {
        // eslint-disable-next-line eqeqeq
        return a == b;
    },
    '!=': function (a, b) {
        // eslint-disable-next-line eqeqeq
        return a != b;
    },
    '===': function (a, b) {
        return a === b;
    },
    '!==': function (a, b) {
        return a !== b;
    },
    '<': function (a, b) {
        return a < b;
    },
    '>': function (a, b) {
        return a > b;
    },
    '<=': function (a, b) {
        return a <= b;
    },
    '>=': function (a, b) {
        return a >= b;
    },
    '<<': function (a, b) {
        return a << b;
    },
    '>>': function (a, b) {
        return a >> b;
    },
    '>>>': function (a, b) {
        return a >>> b;
    },
    '+': function (a, b) {
        return a + b;
    },
    '-': function (a, b) {
        return a - b;
    },
    '*': function (a, b) {
        return a * b;
    },
    '/': function (a, b) {
        return a / b;
    },
    '%': function (a, b) {
        return a % b;
    },
    '??': function (a, b) {
        if (a === null || a === undefined) {
            return b;
        }
        return a;
    },
};
const unops = {
    '-': function (a) {
        return -a;
    },
    '+': function (a) {
        return +a;
    },
    '~': function (a) {
        return ~a;
    },
    '!': function (a) {
        return !a;
    },
    void: function () {
        return undefined;
    },
};
// this is needed to make our strict types work when inter-operating with
// babel's own built-in evaluator
function isConfidentResult(result) {
    return result.confident;
}
class Evaluator {
    constructor(env = {}) {
        this.knownPaths = env.knownPaths || new Map();
        this.locals = env.locals || {};
        this.state = env.state;
    }
    evaluateMember(path, optionalChain) {
        let propertyPath = assertNotArray(path.get('property'));
        let property;
        if (path.node.computed) {
            property = this.evaluate(propertyPath);
        }
        else {
            property = this.evaluateKey(propertyPath);
        }
        if (property.confident) {
            let objectPath = path.get('object');
            let object = this.evaluate(objectPath);
            if (object.confident) {
                let confidentObject = object;
                let confidentProperty = property;
                return {
                    confident: true,
                    get value() {
                        if (optionalChain) {
                            return confidentObject.value != null
                                ? confidentObject.value[confidentProperty.value]
                                : confidentObject.value;
                        }
                        else {
                            return confidentObject.value[confidentProperty.value];
                        }
                    },
                };
            }
        }
        return { confident: false };
    }
    evaluateKey(path) {
        let first = this.evaluate(path);
        if (first.confident) {
            return first;
        }
        if (path.isIdentifier()) {
            return { confident: true, value: path.node.name };
        }
        return { confident: false };
    }
    evaluate(path) {
        let known = this.knownPaths.get(path);
        if (known) {
            return known;
        }
        let result = this.realEvaluate(path);
        return result;
    }
    realEvaluate(path) {
        let builtIn = path.evaluate();
        if (isConfidentResult(builtIn)) {
            return builtIn;
        }
        if (path.isMemberExpression()) {
            return this.evaluateMember(path, false);
        }
        // Here we are glossing over the lack of a real OptionalMemberExpression type
        // in our @babel/traverse typings.
        if (path.node.type === 'OptionalMemberExpression') {
            return this.evaluateMember(path, true);
        }
        if (path.isStringLiteral()) {
            return { confident: true, value: path.node.value };
        }
        if (path.isNumericLiteral()) {
            return { confident: true, value: path.node.value };
        }
        if (path.isBooleanLiteral()) {
            return { confident: true, value: path.node.value };
        }
        if (path.isNullLiteral()) {
            return { confident: true, value: null };
        }
        if (path.isObjectExpression()) {
            let props = assertArray(path.get('properties')).map(p => {
                let key = assertNotArray(p.get('key'));
                let keyEvalValue = this.evaluateKey(key);
                let value = assertNotArray(p.get('value'));
                let valueEvalValue = this.evaluate(value);
                return [keyEvalValue, valueEvalValue];
            });
            for (let [k, v] of props) {
                if (!k.confident || !v.confident) {
                    return { confident: false };
                }
            }
            let confidentProps = props;
            return {
                confident: true,
                get value() {
                    let result = {};
                    for (let [k, v] of confidentProps) {
                        result[k.value] = v.value;
                    }
                    return result;
                },
            };
        }
        if (path.isArrayExpression()) {
            let elements = path.get('elements').map(element => {
                return this.evaluate(element);
            });
            if (elements.every(element => element.confident)) {
                let confidentElements = elements;
                return {
                    confident: true,
                    get value() {
                        return confidentElements.map(element => element.value);
                    },
                };
            }
        }
        if (path.isAssignmentExpression()) {
            let leftPath = path.get('left');
            if (leftPath.isIdentifier()) {
                let rightPath = path.get('right');
                let right = this.evaluate(rightPath);
                if (right.confident) {
                    this.locals[leftPath.node.name] = right.value;
                    return right;
                }
            }
        }
        if (path.isCallExpression()) {
            let result = this.maybeEvaluateRuntimeConfig(path);
            if (result.confident) {
                return result;
            }
            result = this.evaluateMacroCall(path);
            if (result.confident) {
                return result;
            }
        }
        if (path.isLogicalExpression() || path.isBinaryExpression()) {
            let operator = path.node.operator;
            if (binops[operator]) {
                let leftOperand = this.evaluate(path.get('left'));
                if (leftOperand.confident) {
                    let rightOperand = this.evaluate(path.get('right'));
                    if (leftOperand.confident && rightOperand.confident) {
                        let value = binops[operator](leftOperand.value, rightOperand.value);
                        return { confident: true, value };
                    }
                }
            }
            return { confident: false };
        }
        if (path.isConditionalExpression()) {
            let test = this.evaluate(path.get('test'));
            if (test.confident) {
                let result = test.value ? this.evaluate(path.get('consequent')) : this.evaluate(path.get('alternate'));
                if (result.confident) {
                    return result;
                }
            }
        }
        if (path.isUnaryExpression()) {
            let operator = path.node.operator;
            if (unops[operator]) {
                let operand = this.evaluate(path.get('argument'));
                if (operand.confident) {
                    let value = unops[operator](operand.value);
                    return { confident: true, value };
                }
            }
            return { confident: false };
        }
        if (path.isIdentifier()) {
            if (!this.locals.hasOwnProperty(path.node.name)) {
                return { confident: false };
            }
            return { confident: true, value: this.locals[path.node.name] };
        }
        return { confident: false };
    }
    // This handles the presence of our runtime-mode getConfig functions. We want
    // to designate them as { confident: true }, because it's important that we
    // give feedback even in runtime-mode if the developer is trying to pass
    // non-static arguments somewhere they're not supposed to. But we don't
    // actually want to calculate their value here because that has been deferred
    // to runtime. That's why we've made `value` lazy. It lets us check the
    // confidence without actually forcing the value.
    maybeEvaluateRuntimeConfig(path) {
        var _a;
        let callee = path.get('callee');
        if (callee.isIdentifier()) {
            let { name } = callee.node;
            // Does the identifier refer to our runtime config?
            if (((_a = this.state) === null || _a === void 0 ? void 0 : _a.neededRuntimeImports.get(name)) === 'config') {
                return {
                    confident: true,
                    get value() {
                        throw new Error(`bug in @embroider/macros: didn't expect to need to evaluate this value`);
                    },
                };
            }
        }
        return { confident: false };
    }
    evaluateMacroCall(path) {
        if (!this.state) {
            return { confident: false };
        }
        let callee = path.get('callee');
        if (callee.referencesImport('@embroider/macros', 'dependencySatisfies')) {
            return { confident: true, value: dependency_satisfies_1.default(path, this.state) };
        }
        if (callee.referencesImport('@embroider/macros', 'moduleExists')) {
            return { confident: true, value: module_exists_1.default(path, this.state) };
        }
        if (callee.referencesImport('@embroider/macros', 'getConfig')) {
            return { confident: true, value: get_config_1.default(path, this.state, 'package') };
        }
        if (callee.referencesImport('@embroider/macros', 'getOwnConfig')) {
            return { confident: true, value: get_config_1.default(path, this.state, 'own') };
        }
        if (callee.referencesImport('@embroider/macros', 'getGlobalConfig')) {
            return { confident: true, value: get_config_1.default(path, this.state, 'getGlobalConfig') };
        }
        if (callee.referencesImport('@embroider/macros', 'isDevelopingApp')) {
            return {
                confident: true,
                value: Boolean(this.state.opts.appPackageRoot &&
                    this.state.opts.isDevelopingPackageRoots.includes(this.state.opts.appPackageRoot)),
            };
        }
        if (callee.referencesImport('@embroider/macros', 'isDevelopingThisPackage')) {
            return {
                confident: true,
                value: this.state.opts.isDevelopingPackageRoots.includes(state_1.owningPackage(path, this.state).root),
            };
        }
        if (callee.referencesImport('@embroider/macros', 'isTesting')) {
            let g = get_config_1.default(path, this.state, 'getGlobalConfig');
            let e = g && g['@embroider/macros'];
            let value = Boolean(e && e.isTesting);
            return { confident: true, value };
        }
        return { confident: false };
    }
}
exports.Evaluator = Evaluator;
// these next two functions are here because the type definitions we're using
// don't seem to know exactly which NodePath properties are arrays and which
// aren't.
function assertNotArray(input) {
    if (Array.isArray(input)) {
        throw new Error(`bug: not supposed to be an array`);
    }
    return input;
}
exports.assertNotArray = assertNotArray;
function assertArray(input) {
    if (!Array.isArray(input)) {
        throw new Error(`bug: supposed to be an array`);
    }
    return input;
}
exports.assertArray = assertArray;
function buildLiterals(value) {
    if (typeof value === 'undefined') {
        return types_1.identifier('undefined');
    }
    let ast = core_1.parse(`a(${JSON.stringify(value)})`, {});
    let statement = ast.program.body[0];
    let expression = statement.expression;
    return expression.arguments[0];
}
exports.buildLiterals = buildLiterals;
//# sourceMappingURL=evaluate-json.js.map