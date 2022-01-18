"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DefaultEnvironment = exports.RuntimeEnvironment = exports.DefaultRuntimeResolver = exports.RuntimeEnvironmentDelegateImpl = exports.EnvironmentImpl = exports.TRANSACTION = exports.ScopeImpl = undefined;
exports.isScopeReference = isScopeReference;
exports.AotRuntime = AotRuntime;
exports.CustomJitRuntime = CustomJitRuntime;
exports.JitRuntime = JitRuntime;
exports.JitRuntimeFromProgram = JitRuntimeFromProgram;
exports.inTransaction = inTransaction;

var _reference = require("@glimmer/reference");

var _util = require("@glimmer/util");

var _helper = require("./dom/helper");

var _references = require("./references");

var _dynamic = require("./vm/attributes/dynamic");

var _program = require("@glimmer/program");

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass);
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var _a;
function isScopeReference(s) {
    if (s === null || Array.isArray(s)) return false;
    return true;
}
var ScopeImpl = exports.ScopeImpl = function () {
    function ScopeImpl(
    // the 0th slot is `self`
    slots, callerScope,
    // named arguments and blocks passed to a layout that uses eval
    evalScope,
    // locals in scope when the partial was invoked
    partialMap) {
        _classCallCheck(this, ScopeImpl);

        this.slots = slots;
        this.callerScope = callerScope;
        this.evalScope = evalScope;
        this.partialMap = partialMap;
    }

    ScopeImpl.root = function root(self) {
        var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var refs = new Array(size + 1);
        for (var i = 0; i <= size; i++) {
            refs[i] = _references.UNDEFINED_REFERENCE;
        }
        return new ScopeImpl(refs, null, null, null).init({ self: self });
    };

    ScopeImpl.sized = function sized() {
        var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        var refs = new Array(size + 1);
        for (var i = 0; i <= size; i++) {
            refs[i] = _references.UNDEFINED_REFERENCE;
        }
        return new ScopeImpl(refs, null, null, null);
    };

    ScopeImpl.prototype.init = function init(_ref) {
        var self = _ref.self;

        this.slots[0] = self;
        return this;
    };

    ScopeImpl.prototype.getSelf = function getSelf() {
        return this.get(0);
    };

    ScopeImpl.prototype.getSymbol = function getSymbol(symbol) {
        return this.get(symbol);
    };

    ScopeImpl.prototype.getBlock = function getBlock(symbol) {
        var block = this.get(symbol);
        return block === _references.UNDEFINED_REFERENCE ? null : block;
    };

    ScopeImpl.prototype.getEvalScope = function getEvalScope() {
        return this.evalScope;
    };

    ScopeImpl.prototype.getPartialMap = function getPartialMap() {
        return this.partialMap;
    };

    ScopeImpl.prototype.bind = function bind(symbol, value) {
        this.set(symbol, value);
    };

    ScopeImpl.prototype.bindSelf = function bindSelf(self) {
        this.set(0, self);
    };

    ScopeImpl.prototype.bindSymbol = function bindSymbol(symbol, value) {
        this.set(symbol, value);
    };

    ScopeImpl.prototype.bindBlock = function bindBlock(symbol, value) {
        this.set(symbol, value);
    };

    ScopeImpl.prototype.bindEvalScope = function bindEvalScope(map) {
        this.evalScope = map;
    };

    ScopeImpl.prototype.bindPartialMap = function bindPartialMap(map) {
        this.partialMap = map;
    };

    ScopeImpl.prototype.bindCallerScope = function bindCallerScope(scope) {
        this.callerScope = scope;
    };

    ScopeImpl.prototype.getCallerScope = function getCallerScope() {
        return this.callerScope;
    };

    ScopeImpl.prototype.child = function child() {
        return new ScopeImpl(this.slots.slice(), this.callerScope, this.evalScope, this.partialMap);
    };

    ScopeImpl.prototype.get = function get(index) {
        if (index >= this.slots.length) {
            throw new RangeError('BUG: cannot get $' + index + ' from scope; length=' + this.slots.length);
        }
        return this.slots[index];
    };

    ScopeImpl.prototype.set = function set(index, value) {
        if (index >= this.slots.length) {
            throw new RangeError('BUG: cannot get $' + index + ' from scope; length=' + this.slots.length);
        }
        this.slots[index] = value;
    };

    return ScopeImpl;
}();
var TRANSACTION = exports.TRANSACTION = 'TRANSACTION [c3938885-aba0-422f-b540-3fd3431c78b5]';

var TransactionImpl = function () {
    function TransactionImpl() {
        _classCallCheck(this, TransactionImpl);

        this.scheduledInstallManagers = [];
        this.scheduledInstallModifiers = [];
        this.scheduledUpdateModifierManagers = [];
        this.scheduledUpdateModifiers = [];
        this.createdComponents = [];
        this.createdManagers = [];
        this.updatedComponents = [];
        this.updatedManagers = [];
        this.destructors = [];
    }

    TransactionImpl.prototype.didCreate = function didCreate(component, manager) {
        this.createdComponents.push(component);
        this.createdManagers.push(manager);
    };

    TransactionImpl.prototype.didUpdate = function didUpdate(component, manager) {
        this.updatedComponents.push(component);
        this.updatedManagers.push(manager);
    };

    TransactionImpl.prototype.scheduleInstallModifier = function scheduleInstallModifier(modifier, manager) {
        this.scheduledInstallModifiers.push(modifier);
        this.scheduledInstallManagers.push(manager);
    };

    TransactionImpl.prototype.scheduleUpdateModifier = function scheduleUpdateModifier(modifier, manager) {
        this.scheduledUpdateModifiers.push(modifier);
        this.scheduledUpdateModifierManagers.push(manager);
    };

    TransactionImpl.prototype.didDestroy = function didDestroy(d) {
        this.destructors.push(d);
    };

    TransactionImpl.prototype.commit = function commit() {
        var createdComponents = this.createdComponents,
            createdManagers = this.createdManagers;

        for (var i = 0; i < createdComponents.length; i++) {
            var component = createdComponents[i];
            var manager = createdManagers[i];
            manager.didCreate(component);
        }
        var updatedComponents = this.updatedComponents,
            updatedManagers = this.updatedManagers;

        for (var _i = 0; _i < updatedComponents.length; _i++) {
            var _component = updatedComponents[_i];
            var _manager = updatedManagers[_i];
            _manager.didUpdate(_component);
        }
        var destructors = this.destructors;

        for (var _i2 = 0; _i2 < destructors.length; _i2++) {
            destructors[_i2][_util.DROP]();
        }
        var scheduledInstallManagers = this.scheduledInstallManagers,
            scheduledInstallModifiers = this.scheduledInstallModifiers;

        for (var _i3 = 0; _i3 < scheduledInstallManagers.length; _i3++) {
            var modifier = scheduledInstallModifiers[_i3];
            var _manager2 = scheduledInstallManagers[_i3];
            _manager2.install(modifier);
        }
        var scheduledUpdateModifierManagers = this.scheduledUpdateModifierManagers,
            scheduledUpdateModifiers = this.scheduledUpdateModifiers;

        for (var _i4 = 0; _i4 < scheduledUpdateModifierManagers.length; _i4++) {
            var _modifier = scheduledUpdateModifiers[_i4];
            var _manager3 = scheduledUpdateModifierManagers[_i4];
            _manager3.update(_modifier);
        }
    };

    return TransactionImpl;
}();

function toBool(value) {
    return !!value;
}
var EnvironmentImpl = exports.EnvironmentImpl = function () {
    function EnvironmentImpl(_ref2) {
        var appendOperations = _ref2.appendOperations,
            updateOperations = _ref2.updateOperations;

        _classCallCheck(this, EnvironmentImpl);

        this[_a] = null;
        this.appendOperations = appendOperations;
        this.updateOperations = updateOperations;
    }

    EnvironmentImpl.prototype.toConditionalReference = function toConditionalReference(reference) {
        return new _references.ConditionalReference(reference, toBool);
    };

    EnvironmentImpl.prototype.getAppendOperations = function getAppendOperations() {
        return this.appendOperations;
    };

    EnvironmentImpl.prototype.getDOM = function getDOM() {
        return this.updateOperations;
    };

    EnvironmentImpl.prototype.begin = function begin() {
        false && (0, _util.assert)(!this[TRANSACTION], 'A glimmer transaction was begun, but one already exists. You may have a nested transaction, possibly caused by an earlier runtime exception while rendering. Please check your console for the stack trace of any prior exceptions.');

        this[TRANSACTION] = new TransactionImpl();
    };

    EnvironmentImpl.prototype.didCreate = function didCreate(component, manager) {
        this.transaction.didCreate(component, manager);
    };

    EnvironmentImpl.prototype.didUpdate = function didUpdate(component, manager) {
        this.transaction.didUpdate(component, manager);
    };

    EnvironmentImpl.prototype.scheduleInstallModifier = function scheduleInstallModifier(modifier, manager) {
        this.transaction.scheduleInstallModifier(modifier, manager);
    };

    EnvironmentImpl.prototype.scheduleUpdateModifier = function scheduleUpdateModifier(modifier, manager) {
        this.transaction.scheduleUpdateModifier(modifier, manager);
    };

    EnvironmentImpl.prototype.didDestroy = function didDestroy(d) {
        this.transaction.didDestroy(d);
    };

    EnvironmentImpl.prototype.commit = function commit() {
        var transaction = this.transaction;
        this[TRANSACTION] = null;
        transaction.commit();
    };

    EnvironmentImpl.prototype.attributeFor = function attributeFor(element, attr, _isTrusting) {
        var namespace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        return (0, _dynamic.dynamicAttribute)(element, attr, namespace);
    };

    _createClass(EnvironmentImpl, [{
        key: 'transaction',
        get: function get() {
            return this[TRANSACTION];
        }
    }]);

    return EnvironmentImpl;
}();
_a = TRANSACTION;
var RuntimeEnvironmentDelegateImpl = exports.RuntimeEnvironmentDelegateImpl = function () {
    function RuntimeEnvironmentDelegateImpl() {
        var inner = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, RuntimeEnvironmentDelegateImpl);

        this.inner = inner;
        this.iterable = {
            named: {
                '@index': function index(_, _index) {
                    return String(_index);
                },
                '@primitive': function primitive(item) {
                    return String(item);
                },
                '@identity': function identity(item) {
                    return item;
                }
            },
            default: function _default(key) {
                return function (item) {
                    return item[key];
                };
            }
        };
        if (inner.toBool) {
            this.toBool = inner.toBool;
        } else {
            this.toBool = function (value) {
                return !!value;
            };
        }
    }

    RuntimeEnvironmentDelegateImpl.prototype.protocolForURL = function protocolForURL(url) {
        if (this.inner.protocolForURL) {
            return this.inner.protocolForURL(url);
        } else if (typeof URL === 'object' || typeof URL === 'undefined') {
            return legacyProtocolForURL(url);
        } else if (typeof document !== 'undefined') {
            return new URL(url, document.baseURI).protocol;
        } else {
            return new URL(url, 'https://www.example.com').protocol;
        }
    };

    RuntimeEnvironmentDelegateImpl.prototype.attributeFor = function attributeFor(element, attr, isTrusting, namespace) {
        if (this.inner.attributeFor) {
            return this.inner.attributeFor(element, attr, isTrusting, namespace);
        } else {
            return (0, _dynamic.dynamicAttribute)(element, attr, namespace);
        }
    };

    return RuntimeEnvironmentDelegateImpl;
}();
function legacyProtocolForURL(url) {
    if (typeof window === 'undefined') {
        var match = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i.exec(url);
        return match && match[1] ? match[1].toLowerCase() : '';
    }
    var anchor = window.document.createElement('a');
    anchor.href = url;
    return anchor.protocol;
}
var DefaultRuntimeResolver = exports.DefaultRuntimeResolver = function () {
    function DefaultRuntimeResolver(inner) {
        _classCallCheck(this, DefaultRuntimeResolver);

        this.inner = inner;
    }

    DefaultRuntimeResolver.prototype.lookupComponent = function lookupComponent(name, referrer) {
        if (this.inner.lookupComponent) {
            var component = this.inner.lookupComponent(name, referrer);
            if (component === undefined) {
                throw new Error('Unexpected component ' + name + ' (from ' + referrer + ') (lookupComponent returned undefined)');
            }
            return component;
        } else {
            throw new Error('lookupComponent not implemented on RuntimeResolver.');
        }
    };

    DefaultRuntimeResolver.prototype.lookupPartial = function lookupPartial(name, referrer) {
        if (this.inner.lookupPartial) {
            var partial = this.inner.lookupPartial(name, referrer);
            if (partial === undefined) {
                throw new Error('Unexpected partial ' + name + ' (from ' + referrer + ') (lookupPartial returned undefined)');
            }
            return partial;
        } else {
            throw new Error('lookupPartial not implemented on RuntimeResolver.');
        }
    };

    DefaultRuntimeResolver.prototype.resolve = function resolve(handle) {
        if (this.inner.resolve) {
            var resolved = this.inner.resolve(handle);
            if (resolved === undefined) {
                throw new Error('Unexpected handle ' + handle + ' (resolve returned undefined)');
            }
            return resolved;
        } else {
            throw new Error('resolve not implemented on RuntimeResolver.');
        }
    };

    DefaultRuntimeResolver.prototype.compilable = function compilable(locator) {
        if (this.inner.compilable) {
            var resolved = this.inner.compilable(locator);
            if (resolved === undefined) {
                throw new Error('Unable to compile ' + name + ' (compilable returned undefined)');
            }
            return resolved;
        } else {
            throw new Error('compilable not implemented on RuntimeResolver.');
        }
    };

    DefaultRuntimeResolver.prototype.getInvocation = function getInvocation(locator) {
        if (this.inner.getInvocation) {
            var invocation = this.inner.getInvocation(locator);
            if (invocation === undefined) {
                throw new Error('Unable to get invocation for ' + JSON.stringify(locator) + ' (getInvocation returned undefined)');
            }
            return invocation;
        } else {
            throw new Error('getInvocation not implemented on RuntimeResolver.');
        }
    };

    return DefaultRuntimeResolver;
}();
function AotRuntime(document, program) {
    var resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var delegate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    return {
        env: env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: _program.RuntimeProgramImpl.hydrate(program)
    };
}
// TODO: There are a lot of variants here. Some are here for transitional purposes
// and some might be GCable once the design stabilizes.
function CustomJitRuntime(resolver, context, env) {
    var program = new _program.RuntimeProgramImpl(context.program.constants, context.program.heap);
    return {
        env: env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: program
    };
}
function JitRuntime(document) {
    var resolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var delegate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    var constants = new _program.Constants();
    var heap = new _program.HeapImpl();
    var program = new _program.RuntimeProgramImpl(constants, heap);
    return {
        env: env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: program
    };
}
function JitRuntimeFromProgram(document, program) {
    var resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var delegate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    return {
        env: env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: program
    };
}
var RuntimeEnvironment = exports.RuntimeEnvironment = function (_EnvironmentImpl) {
    _inherits(RuntimeEnvironment, _EnvironmentImpl);

    function RuntimeEnvironment(document, delegate) {
        _classCallCheck(this, RuntimeEnvironment);

        var _this = _possibleConstructorReturn(this, _EnvironmentImpl.call(this, {
            appendOperations: new _helper.DOMTreeConstruction(document),
            updateOperations: new _helper.DOMChangesImpl(document)
        }));

        _this.delegate = new RuntimeEnvironmentDelegateImpl(delegate);
        return _this;
    }

    RuntimeEnvironment.prototype.protocolForURL = function protocolForURL(url) {
        return this.delegate.protocolForURL(url);
    };

    RuntimeEnvironment.prototype.iterableFor = function iterableFor(ref, inputKey) {
        var key = String(inputKey);
        var def = this.delegate.iterable;
        var keyFor = key in def.named ? def.named[key] : def.default(key);
        return new _reference.IterableImpl(ref, keyFor);
    };

    RuntimeEnvironment.prototype.toConditionalReference = function toConditionalReference(input) {
        return new _references.ConditionalReference(input, this.delegate.toBool);
    };

    RuntimeEnvironment.prototype.attributeFor = function attributeFor(element, attr, isTrusting, namespace) {
        return this.delegate.attributeFor(element, attr, isTrusting, namespace);
    };

    return RuntimeEnvironment;
}(EnvironmentImpl);
function inTransaction(env, cb) {
    if (!env[TRANSACTION]) {
        env.begin();
        try {
            cb();
        } finally {
            env.commit();
        }
    } else {
        cb();
    }
}
var DefaultEnvironment = exports.DefaultEnvironment = function (_EnvironmentImpl2) {
    _inherits(DefaultEnvironment, _EnvironmentImpl2);

    function DefaultEnvironment(options) {
        _classCallCheck(this, DefaultEnvironment);

        if (!options) {
            var _document = window.document;
            var appendOperations = new _helper.DOMTreeConstruction(_document);
            var updateOperations = new _helper.DOMChangesImpl(_document);
            options = { appendOperations: appendOperations, updateOperations: updateOperations };
        }
        return _possibleConstructorReturn(this, _EnvironmentImpl2.call(this, options));
    }

    return DefaultEnvironment;
}(EnvironmentImpl);
exports.default = EnvironmentImpl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2Vudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQW1ETSxnQixHQUFBLGdCO1FBMmFBLFUsR0FBQSxVO1FBMkJBLGdCLEdBQUEsZ0I7UUFnQkEsVSxHQUFBLFU7UUFrQkEscUIsR0FBQSxxQjtRQXNEQSxhLEdBQUEsYTs7QUE5aUJOOztBQVNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFTSxTQUFBLGdCQUFBLENBQUEsQ0FBQSxFQUF1QztBQUMzQyxRQUFJLE1BQUEsSUFBQSxJQUFjLE1BQUEsT0FBQSxDQUFsQixDQUFrQixDQUFsQixFQUFvQyxPQUFBLEtBQUE7QUFDcEMsV0FBQSxJQUFBO0FBQ0Q7QUFFRCxJQUFBLGdDQUFBLFlBQUE7QUFxQkUsYUFBQSxTQUFBO0FBQ0U7QUFERixTQUFBLEVBQUEsV0FBQTtBQUlFO0FBSkYsYUFBQTtBQU1FO0FBTkYsY0FBQSxFQU8wRDtBQUFBLHdCQUFBLElBQUEsRUFBQSxTQUFBOztBQUwvQyxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0QsYUFBQSxXQUFBLEdBQUEsV0FBQTtBQUVBLGFBQUEsU0FBQSxHQUFBLFNBQUE7QUFFQSxhQUFBLFVBQUEsR0FBQSxVQUFBO0FBQ047O0FBN0JOLGNBQUEsSUFBQSxHQUFBLFNBQUEsSUFBQSxDQUFBLElBQUEsRUFDNkU7QUFBQSxZQUFSLE9BQVEsVUFBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxHQUEzRSxDQUEyRTs7QUFDekUsWUFBSSxPQUFpQyxJQUFBLEtBQUEsQ0FBVSxPQUEvQyxDQUFxQyxDQUFyQztBQUVBLGFBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsS0FBaEIsSUFBQSxFQUFBLEdBQUEsRUFBZ0M7QUFDOUIsaUJBQUEsQ0FBQSxJQUFBLCtCQUFBO0FBQ0Q7QUFFRCxlQUFPLElBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQThDLEVBQXJELE1BQUEsSUFBcUQsRUFBOUMsQ0FBUDtBQVJKLEtBQUE7O0FBQUEsY0FBQSxLQUFBLEdBQUEsU0FBQSxLQUFBLEdBV2dEO0FBQUEsWUFBUixPQUFRLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FBOUMsQ0FBOEM7O0FBQzVDLFlBQUksT0FBaUMsSUFBQSxLQUFBLENBQVUsT0FBL0MsQ0FBcUMsQ0FBckM7QUFFQSxhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLEtBQWhCLElBQUEsRUFBQSxHQUFBLEVBQWdDO0FBQzlCLGlCQUFBLENBQUEsSUFBQSwrQkFBQTtBQUNEO0FBRUQsZUFBTyxJQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBUCxJQUFPLENBQVA7QUFsQkosS0FBQTs7QUFBQSxjQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsU0FBQSxJQUFBLENBQUEsSUFBQSxFQStCaUQ7QUFBQSxZQUEvQyxPQUErQyxLQUEvQyxJQUErQzs7QUFDN0MsYUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLElBQUE7QUFDQSxlQUFBLElBQUE7QUFqQ0osS0FBQTs7QUFBQSxjQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBb0NTO0FBQ0wsZUFBTyxLQUFBLEdBQUEsQ0FBUCxDQUFPLENBQVA7QUFyQ0osS0FBQTs7QUFBQSxjQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxTQUFBLENBQUEsTUFBQSxFQXdDMEI7QUFDdEIsZUFBTyxLQUFBLEdBQUEsQ0FBUCxNQUFPLENBQVA7QUF6Q0osS0FBQTs7QUFBQSxjQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLENBQUEsTUFBQSxFQTRDeUI7QUFDckIsWUFBSSxRQUFRLEtBQUEsR0FBQSxDQUFaLE1BQVksQ0FBWjtBQUNBLGVBQU8sVUFBQSwrQkFBQSxHQUFBLElBQUEsR0FBUCxLQUFBO0FBOUNKLEtBQUE7O0FBQUEsY0FBQSxTQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsWUFBQSxHQWlEYztBQUNWLGVBQU8sS0FBUCxTQUFBO0FBbERKLEtBQUE7O0FBQUEsY0FBQSxTQUFBLENBQUEsYUFBQSxHQUFBLFNBQUEsYUFBQSxHQXFEZTtBQUNYLGVBQU8sS0FBUCxVQUFBO0FBdERKLEtBQUE7O0FBQUEsY0FBQSxTQUFBLENBQUEsSUFBQSxHQUFBLFNBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxLQUFBLEVBeUQwQztBQUN0QyxhQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsS0FBQTtBQTFESixLQUFBOztBQUFBLGNBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsQ0FBQSxJQUFBLEVBNkR1QztBQUNuQyxhQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsSUFBQTtBQTlESixLQUFBOztBQUFBLGNBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLEVBQUEsS0FBQSxFQWlFMEQ7QUFDdEQsYUFBQSxHQUFBLENBQUEsTUFBQSxFQUFBLEtBQUE7QUFsRUosS0FBQTs7QUFBQSxjQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLEtBQUEsRUFxRXdEO0FBQ3BELGFBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxLQUFBO0FBdEVKLEtBQUE7O0FBQUEsY0FBQSxTQUFBLENBQUEsYUFBQSxHQUFBLFNBQUEsYUFBQSxDQUFBLEdBQUEsRUF5RStDO0FBQzNDLGFBQUEsU0FBQSxHQUFBLEdBQUE7QUExRUosS0FBQTs7QUFBQSxjQUFBLFNBQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxjQUFBLENBQUEsR0FBQSxFQTZFa0Q7QUFDOUMsYUFBQSxVQUFBLEdBQUEsR0FBQTtBQTlFSixLQUFBOztBQUFBLGNBQUEsU0FBQSxDQUFBLGVBQUEsR0FBQSxTQUFBLGVBQUEsQ0FBQSxLQUFBLEVBaUZ5QztBQUNyQyxhQUFBLFdBQUEsR0FBQSxLQUFBO0FBbEZKLEtBQUE7O0FBQUEsY0FBQSxTQUFBLENBQUEsY0FBQSxHQUFBLFNBQUEsY0FBQSxHQXFGZ0I7QUFDWixlQUFPLEtBQVAsV0FBQTtBQXRGSixLQUFBOztBQUFBLGNBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxTQUFBLEtBQUEsR0F5Rk87QUFDSCxlQUFPLElBQUEsU0FBQSxDQUFjLEtBQUEsS0FBQSxDQUFkLEtBQWMsRUFBZCxFQUFrQyxLQUFsQyxXQUFBLEVBQW9ELEtBQXBELFNBQUEsRUFBb0UsS0FBM0UsVUFBTyxDQUFQO0FBMUZKLEtBQUE7O0FBQUEsY0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFNBQUEsR0FBQSxDQUFBLEtBQUEsRUE2Rm1EO0FBQy9DLFlBQUksU0FBUyxLQUFBLEtBQUEsQ0FBYixNQUFBLEVBQWdDO0FBQzlCLGtCQUFNLElBQUEsVUFBQSxDQUFBLHNCQUFBLEtBQUEsR0FBQSxzQkFBQSxHQUErRCxLQUFBLEtBQUEsQ0FBckUsTUFBTSxDQUFOO0FBQ0Q7QUFFRCxlQUFPLEtBQUEsS0FBQSxDQUFQLEtBQU8sQ0FBUDtBQWxHSixLQUFBOztBQUFBLGNBQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxTQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxFQXFHNkQ7QUFDekQsWUFBSSxTQUFTLEtBQUEsS0FBQSxDQUFiLE1BQUEsRUFBZ0M7QUFDOUIsa0JBQU0sSUFBQSxVQUFBLENBQUEsc0JBQUEsS0FBQSxHQUFBLHNCQUFBLEdBQStELEtBQUEsS0FBQSxDQUFyRSxNQUFNLENBQU47QUFDRDtBQUVELGFBQUEsS0FBQSxDQUFBLEtBQUEsSUFBQSxLQUFBO0FBMUdKLEtBQUE7O0FBQUEsV0FBQSxTQUFBO0FBQUEsQ0FBQSxFQUFBO0FBOEdPLElBQU0sb0NBQU4sb0RBQUE7O0lBRVAsa0I7QUFBQSxhQUFBLGVBQUEsR0FBQTtBQUFBLHdCQUFBLElBQUEsRUFBQSxlQUFBOztBQUdTLGFBQUEsd0JBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSx5QkFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLCtCQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsd0JBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxpQkFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxpQkFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxXQUFBLEdBQUEsRUFBQTtBQWlFUjs7OEJBL0RDLFMsc0JBQUEsUyxFQUFBLE8sRUFBeUQ7QUFDdkQsYUFBQSxpQkFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBO0FBQ0EsYUFBQSxlQUFBLENBQUEsSUFBQSxDQUFBLE9BQUE7Ozs4QkFHRixTLHNCQUFBLFMsRUFBQSxPLEVBQXlEO0FBQ3ZELGFBQUEsaUJBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQTtBQUNBLGFBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBOzs7OEJBR0YsdUIsb0NBQUEsUSxFQUFBLE8sRUFBbUU7QUFDakUsYUFBQSx5QkFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0EsYUFBQSx3QkFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBOzs7OEJBR0Ysc0IsbUNBQUEsUSxFQUFBLE8sRUFBa0U7QUFDaEUsYUFBQSx3QkFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0EsYUFBQSwrQkFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBOzs7OEJBR0YsVSx1QkFBQSxDLEVBQWtCO0FBQ2hCLGFBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOzs7OEJBR0YsTSxxQkFBTTtBQUFBLFlBQUEsb0JBQUEsS0FBQSxpQkFBQTtBQUFBLFlBQUEsa0JBQUEsS0FBQSxlQUFBOztBQUdKLGFBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBSSxrQkFBcEIsTUFBQSxFQUFBLEdBQUEsRUFBbUQ7QUFDakQsZ0JBQUksWUFBWSxrQkFBaEIsQ0FBZ0IsQ0FBaEI7QUFDQSxnQkFBSSxVQUFVLGdCQUFkLENBQWMsQ0FBZDtBQUNBLG9CQUFBLFNBQUEsQ0FBQSxTQUFBO0FBQ0Q7QUFQRyxZQUFBLG9CQUFBLEtBQUEsaUJBQUE7QUFBQSxZQUFBLGtCQUFBLEtBQUEsZUFBQTs7QUFXSixhQUFLLElBQUksS0FBVCxDQUFBLEVBQWdCLEtBQUksa0JBQXBCLE1BQUEsRUFBQSxJQUFBLEVBQW1EO0FBQ2pELGdCQUFJLGFBQVksa0JBQWhCLEVBQWdCLENBQWhCO0FBQ0EsZ0JBQUksV0FBVSxnQkFBZCxFQUFjLENBQWQ7QUFDQSxxQkFBQSxTQUFBLENBQUEsVUFBQTtBQUNEO0FBZkcsWUFBQSxjQUFBLEtBQUEsV0FBQTs7QUFtQkosYUFBSyxJQUFJLE1BQVQsQ0FBQSxFQUFnQixNQUFJLFlBQXBCLE1BQUEsRUFBQSxLQUFBLEVBQTZDO0FBQzNDLHdCQUFBLEdBQUEsRUFBQSxVQUFBO0FBQ0Q7QUFyQkcsWUFBQSwyQkFBQSxLQUFBLHdCQUFBO0FBQUEsWUFBQSw0QkFBQSxLQUFBLHlCQUFBOztBQXlCSixhQUFLLElBQUksTUFBVCxDQUFBLEVBQWdCLE1BQUkseUJBQXBCLE1BQUEsRUFBQSxLQUFBLEVBQTBEO0FBQ3hELGdCQUFJLFdBQVcsMEJBQWYsR0FBZSxDQUFmO0FBQ0EsZ0JBQUksWUFBVSx5QkFBZCxHQUFjLENBQWQ7QUFDQSxzQkFBQSxPQUFBLENBQUEsUUFBQTtBQUNEO0FBN0JHLFlBQUEsa0NBQUEsS0FBQSwrQkFBQTtBQUFBLFlBQUEsMkJBQUEsS0FBQSx3QkFBQTs7QUFpQ0osYUFBSyxJQUFJLE1BQVQsQ0FBQSxFQUFnQixNQUFJLGdDQUFwQixNQUFBLEVBQUEsS0FBQSxFQUFpRTtBQUMvRCxnQkFBSSxZQUFXLHlCQUFmLEdBQWUsQ0FBZjtBQUNBLGdCQUFJLFlBQVUsZ0NBQWQsR0FBYyxDQUFkO0FBQ0Esc0JBQUEsTUFBQSxDQUFBLFNBQUE7QUFDRDs7Ozs7O0FBTUwsU0FBQSxNQUFBLENBQUEsS0FBQSxFQUE4QjtBQUM1QixXQUFPLENBQUMsQ0FBUixLQUFBO0FBQ0Q7QUFFRCxJQUFBLDRDQUFBLFlBQUE7QUFNRSxhQUFBLGVBQUEsQ0FBQSxLQUFBLEVBQXNFO0FBQUEsWUFBMUQsbUJBQTBELE1BQTFELGdCQUEwRDtBQUFBLFlBQXRFLG1CQUFzRSxNQUF0RSxnQkFBc0U7O0FBQUEsd0JBQUEsSUFBQSxFQUFBLGVBQUE7O0FBTHRFLGFBQUEsRUFBQSxJQUFBLElBQUE7QUFNRSxhQUFBLGdCQUFBLEdBQUEsZ0JBQUE7QUFDQSxhQUFBLGdCQUFBLEdBQUEsZ0JBQUE7QUFDRDs7QUFUSCxvQkFBQSxTQUFBLENBQUEsc0JBQUEsR0FBQSxTQUFBLHNCQUFBLENBQUEsU0FBQSxFQVc2QztBQUN6QyxlQUFPLElBQUEsZ0NBQUEsQ0FBQSxTQUFBLEVBQVAsTUFBTyxDQUFQO0FBWkosS0FBQTs7QUFBQSxvQkFBQSxTQUFBLENBQUEsbUJBQUEsR0FBQSxTQUFBLG1CQUFBLEdBa0JxQjtBQUNqQixlQUFPLEtBQVAsZ0JBQUE7QUFuQkosS0FBQTs7QUFBQSxvQkFBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsTUFBQSxHQXFCUTtBQUNKLGVBQU8sS0FBUCxnQkFBQTtBQXRCSixLQUFBOztBQUFBLG9CQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxLQUFBLEdBeUJPO0FBQUEsaUJBQ0gsa0JBQ0UsQ0FBQyxLQURILFdBQ0csQ0FESCxFQURHLHFPQUNILENBREc7O0FBTUgsYUFBQSxXQUFBLElBQW9CLElBQXBCLGVBQW9CLEVBQXBCO0FBL0JKLEtBQUE7O0FBQUEsb0JBQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsT0FBQSxFQXNDMkQ7QUFDdkQsYUFBQSxXQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxPQUFBO0FBdkNKLEtBQUE7O0FBQUEsb0JBQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsT0FBQSxFQTBDMkQ7QUFDdkQsYUFBQSxXQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxPQUFBO0FBM0NKLEtBQUE7O0FBQUEsb0JBQUEsU0FBQSxDQUFBLHVCQUFBLEdBQUEsU0FBQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBLEVBOENxRTtBQUNqRSxhQUFBLFdBQUEsQ0FBQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBO0FBL0NKLEtBQUE7O0FBQUEsb0JBQUEsU0FBQSxDQUFBLHNCQUFBLEdBQUEsU0FBQSxzQkFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBLEVBa0RvRTtBQUNoRSxhQUFBLFdBQUEsQ0FBQSxzQkFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBO0FBbkRKLEtBQUE7O0FBQUEsb0JBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsQ0FBQSxDQUFBLEVBc0RvQjtBQUNoQixhQUFBLFdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQXZESixLQUFBOztBQUFBLG9CQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsU0FBQSxNQUFBLEdBMERRO0FBQ0osWUFBSSxjQUFjLEtBQWxCLFdBQUE7QUFDQSxhQUFBLFdBQUEsSUFBQSxJQUFBO0FBQ0Esb0JBQUEsTUFBQTtBQTdESixLQUFBOztBQUFBLG9CQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxZQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBb0UyQztBQUFBLFlBQXZDLFlBQXVDLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FKekMsSUFJeUM7O0FBRXZDLGVBQU8sK0JBQUEsT0FBQSxFQUFBLElBQUEsRUFBUCxTQUFPLENBQVA7QUF0RUosS0FBQTs7QUFBQSxpQkFBQSxlQUFBLEVBQUEsQ0FBQTtBQUFBLGFBQUEsYUFBQTtBQUFBLGFBQUEsU0FBQSxHQUFBLEdBa0N5QjtBQUNyQixtQkFBYyxLQUFkLFdBQWMsQ0FBZDtBQUNEO0FBcENILEtBQUEsQ0FBQTs7QUFBQSxXQUFBLGVBQUE7QUFBQSxDQUFBLEVBQUE7S0FDRyxXO0FBcUZILElBQUEsMEVBQUEsWUFBQTtBQUdFLGFBQUEsOEJBQUEsR0FBMEQ7QUFBQSxZQUF0QyxRQUFzQyxVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQTFELEVBQTBEOztBQUFBLHdCQUFBLElBQUEsRUFBQSw4QkFBQTs7QUFBdEMsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQWlDWCxhQUFBLFFBQUEsR0FBbUM7QUFDMUMsbUJBQU87QUFDTCwwQkFBVSxTQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsTUFBQSxFQUFBO0FBQUEsMkJBQWMsT0FEbkIsTUFDbUIsQ0FBZDtBQURMLGlCQUFBO0FBRUwsOEJBQWMsU0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBO0FBQUEsMkJBQVEsT0FGakIsSUFFaUIsQ0FBUjtBQUZULGlCQUFBO0FBR0wsNkJBQWEsU0FBQSxRQUFBLENBQUEsSUFBQSxFQUFBO0FBQUEsMkJBQUEsSUFBQTtBQUFBO0FBSFIsYUFEbUM7QUFNMUMscUJBQVMsU0FBQSxRQUFBLENBQUEsR0FBQSxFQUFBO0FBQUEsdUJBQU8sVUFBQSxJQUFBLEVBQUE7QUFBQSwyQkFBUSxLQUFSLEdBQVEsQ0FBUjtBQUFQLGlCQUFBO0FBQUE7QUFOaUMsU0FBbkM7QUFoQ1AsWUFBSSxNQUFKLE1BQUEsRUFBa0I7QUFDaEIsaUJBQUEsTUFBQSxHQUFjLE1BQWQsTUFBQTtBQURGLFNBQUEsTUFFTztBQUNMLGlCQUFBLE1BQUEsR0FBYyxVQUFBLEtBQUEsRUFBQTtBQUFBLHVCQUFTLENBQUMsQ0FBeEIsS0FBYztBQUFkLGFBQUE7QUFDRDtBQUNGOztBQVRILG1DQUFBLFNBQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxjQUFBLENBQUEsR0FBQSxFQVc0QjtBQUN4QixZQUFJLEtBQUEsS0FBQSxDQUFKLGNBQUEsRUFBK0I7QUFDN0IsbUJBQU8sS0FBQSxLQUFBLENBQUEsY0FBQSxDQUFQLEdBQU8sQ0FBUDtBQURGLFNBQUEsTUFFTyxJQUFJLE9BQUEsR0FBQSxLQUFBLFFBQUEsSUFBMkIsT0FBQSxHQUFBLEtBQS9CLFdBQUEsRUFBMkQ7QUFDaEUsbUJBQU8scUJBQVAsR0FBTyxDQUFQO0FBREssU0FBQSxNQUVBLElBQUksT0FBQSxRQUFBLEtBQUosV0FBQSxFQUFxQztBQUMxQyxtQkFBTyxJQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQWEsU0FBYixPQUFBLEVBQVAsUUFBQTtBQURLLFNBQUEsTUFFQTtBQUNMLG1CQUFPLElBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSx5QkFBQSxFQUFQLFFBQUE7QUFDRDtBQXBCTCxLQUFBOztBQUFBLG1DQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxZQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQTJCb0M7QUFFaEMsWUFBSSxLQUFBLEtBQUEsQ0FBSixZQUFBLEVBQTZCO0FBQzNCLG1CQUFPLEtBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBUCxTQUFPLENBQVA7QUFERixTQUFBLE1BRU87QUFDTCxtQkFBTywrQkFBQSxPQUFBLEVBQUEsSUFBQSxFQUFQLFNBQU8sQ0FBUDtBQUNEO0FBakNMLEtBQUE7O0FBQUEsV0FBQSw4QkFBQTtBQUFBLENBQUEsRUFBQTtBQThDQSxTQUFBLG9CQUFBLENBQUEsR0FBQSxFQUF5QztBQUN2QyxRQUFJLE9BQUEsTUFBQSxLQUFKLFdBQUEsRUFBbUM7QUFDakMsWUFBSSxRQUFRLDBDQUFBLElBQUEsQ0FBWixHQUFZLENBQVo7QUFDQSxlQUFPLFNBQVMsTUFBVCxDQUFTLENBQVQsR0FBb0IsTUFBQSxDQUFBLEVBQXBCLFdBQW9CLEVBQXBCLEdBQVAsRUFBQTtBQUNEO0FBRUQsUUFBSSxTQUFTLE9BQUEsUUFBQSxDQUFBLGFBQUEsQ0FBYixHQUFhLENBQWI7QUFDQSxXQUFBLElBQUEsR0FBQSxHQUFBO0FBQ0EsV0FBTyxPQUFQLFFBQUE7QUFDRDtBQUVELElBQUEsMERBQUEsWUFBQTtBQUVFLGFBQUEsc0JBQUEsQ0FBQSxLQUFBLEVBQWtEO0FBQUEsd0JBQUEsSUFBQSxFQUFBLHNCQUFBOztBQUE5QixhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQWtDOztBQUZ4RCwyQkFBQSxTQUFBLENBQUEsZUFBQSxHQUFBLFNBQUEsZUFBQSxDQUFBLElBQUEsRUFBQSxRQUFBLEVBSWtEO0FBQzlDLFlBQUksS0FBQSxLQUFBLENBQUosZUFBQSxFQUFnQztBQUM5QixnQkFBSSxZQUFZLEtBQUEsS0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQWhCLFFBQWdCLENBQWhCO0FBRUEsZ0JBQUksY0FBSixTQUFBLEVBQTZCO0FBQzNCLHNCQUFNLElBQUEsS0FBQSxDQUFBLDBCQUFBLElBQUEsR0FBQSxTQUFBLEdBQU4sUUFBTSxHQUFOLHdDQUFNLENBQU47QUFHRDtBQUVELG1CQUFBLFNBQUE7QUFURixTQUFBLE1BVU87QUFDTCxrQkFBTSxJQUFBLEtBQUEsQ0FBTixxREFBTSxDQUFOO0FBQ0Q7QUFqQkwsS0FBQTs7QUFBQSwyQkFBQSxTQUFBLENBQUEsYUFBQSxHQUFBLFNBQUEsYUFBQSxDQUFBLElBQUEsRUFBQSxRQUFBLEVBb0JnRDtBQUM1QyxZQUFJLEtBQUEsS0FBQSxDQUFKLGFBQUEsRUFBOEI7QUFDNUIsZ0JBQUksVUFBVSxLQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxFQUFkLFFBQWMsQ0FBZDtBQUVBLGdCQUFJLFlBQUosU0FBQSxFQUEyQjtBQUN6QixzQkFBTSxJQUFBLEtBQUEsQ0FBQSx3QkFBQSxJQUFBLEdBQUEsU0FBQSxHQUFOLFFBQU0sR0FBTixzQ0FBTSxDQUFOO0FBR0Q7QUFFRCxtQkFBQSxPQUFBO0FBVEYsU0FBQSxNQVVPO0FBQ0wsa0JBQU0sSUFBQSxLQUFBLENBQU4sbURBQU0sQ0FBTjtBQUNEO0FBakNMLEtBQUE7O0FBQUEsMkJBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLE9BQUEsQ0FBQSxNQUFBLEVBb0NpRDtBQUM3QyxZQUFJLEtBQUEsS0FBQSxDQUFKLE9BQUEsRUFBd0I7QUFDdEIsZ0JBQUksV0FBVyxLQUFBLEtBQUEsQ0FBQSxPQUFBLENBQWYsTUFBZSxDQUFmO0FBRUEsZ0JBQUksYUFBSixTQUFBLEVBQTRCO0FBQzFCLHNCQUFNLElBQUEsS0FBQSxDQUFBLHVCQUFOLE1BQU0sR0FBTiwrQkFBTSxDQUFOO0FBQ0Q7QUFFRCxtQkFBQSxRQUFBO0FBUEYsU0FBQSxNQVFPO0FBQ0wsa0JBQU0sSUFBQSxLQUFBLENBQU4sNkNBQU0sQ0FBTjtBQUNEO0FBL0NMLEtBQUE7O0FBQUEsMkJBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsQ0FBQSxPQUFBLEVBa0R3QztBQUNwQyxZQUFJLEtBQUEsS0FBQSxDQUFKLFVBQUEsRUFBMkI7QUFDekIsZ0JBQUksV0FBVyxLQUFBLEtBQUEsQ0FBQSxVQUFBLENBQWYsT0FBZSxDQUFmO0FBRUEsZ0JBQUksYUFBSixTQUFBLEVBQTRCO0FBQzFCLHNCQUFNLElBQUEsS0FBQSxDQUFBLHVCQUFOLElBQU0sR0FBTixrQ0FBTSxDQUFOO0FBQ0Q7QUFFRCxtQkFBQSxRQUFBO0FBUEYsU0FBQSxNQVFPO0FBQ0wsa0JBQU0sSUFBQSxLQUFBLENBQU4sZ0RBQU0sQ0FBTjtBQUNEO0FBN0RMLEtBQUE7O0FBQUEsMkJBQUEsU0FBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLGFBQUEsQ0FBQSxPQUFBLEVBZ0UwQjtBQUN0QixZQUFJLEtBQUEsS0FBQSxDQUFKLGFBQUEsRUFBOEI7QUFDNUIsZ0JBQUksYUFBYSxLQUFBLEtBQUEsQ0FBQSxhQUFBLENBQWpCLE9BQWlCLENBQWpCO0FBRUEsZ0JBQUksZUFBSixTQUFBLEVBQThCO0FBQzVCLHNCQUFNLElBQUEsS0FBQSxDQUFBLGtDQUM0QixLQUFBLFNBQUEsQ0FEbEMsT0FDa0MsQ0FENUIsR0FBTixxQ0FBTSxDQUFOO0FBS0Q7QUFFRCxtQkFBQSxVQUFBO0FBWEYsU0FBQSxNQVlPO0FBQ0wsa0JBQU0sSUFBQSxLQUFBLENBQU4sbURBQU0sQ0FBTjtBQUNEO0FBL0VMLEtBQUE7O0FBQUEsV0FBQSxzQkFBQTtBQUFBLENBQUEsRUFBQTtBQW1GTSxTQUFBLFVBQUEsQ0FBQSxRQUFBLEVBQUEsT0FBQSxFQUlxQztBQUFBLFFBRHpDLFdBQ3lDLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FKckMsRUFJcUM7QUFBQSxRQUF6QyxXQUF5QyxVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBSnJDLEVBSXFDOztBQUV6QyxRQUFJLE1BQU0sSUFBQSxrQkFBQSxDQUFBLFFBQUEsRUFBaUMsSUFBQSw4QkFBQSxDQUEzQyxRQUEyQyxDQUFqQyxDQUFWO0FBRUEsV0FBTztBQUFBLGFBQUEsR0FBQTtBQUVMLGtCQUFVLElBQUEsc0JBQUEsQ0FGTCxRQUVLLENBRkw7QUFHTCxpQkFBUyw0QkFBQSxPQUFBLENBQUEsT0FBQTtBQUhKLEtBQVA7QUFLRDtBQVlEO0FBQ0E7QUFDTSxTQUFBLGdCQUFBLENBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBS1k7QUFFaEIsUUFBSSxVQUFVLElBQUEsMkJBQUEsQ0FBdUIsUUFBQSxPQUFBLENBQXZCLFNBQUEsRUFBa0QsUUFBQSxPQUFBLENBQWhFLElBQWMsQ0FBZDtBQUVBLFdBQU87QUFBQSxhQUFBLEdBQUE7QUFFTCxrQkFBVSxJQUFBLHNCQUFBLENBRkwsUUFFSyxDQUZMO0FBR0wsaUJBQUE7QUFISyxLQUFQO0FBS0Q7QUFFSyxTQUFBLFVBQUEsQ0FBQSxRQUFBLEVBR3FDO0FBQUEsUUFEekMsV0FDeUMsVUFBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxHQUhyQyxFQUdxQztBQUFBLFFBQXpDLFdBQXlDLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FIckMsRUFHcUM7O0FBRXpDLFFBQUksTUFBTSxJQUFBLGtCQUFBLENBQUEsUUFBQSxFQUFpQyxJQUFBLDhCQUFBLENBQTNDLFFBQTJDLENBQWpDLENBQVY7QUFFQSxRQUFJLFlBQVksSUFBaEIsa0JBQWdCLEVBQWhCO0FBQ0EsUUFBSSxPQUFPLElBQVgsaUJBQVcsRUFBWDtBQUNBLFFBQUksVUFBVSxJQUFBLDJCQUFBLENBQUEsU0FBQSxFQUFkLElBQWMsQ0FBZDtBQUVBLFdBQU87QUFBQSxhQUFBLEdBQUE7QUFFTCxrQkFBVSxJQUFBLHNCQUFBLENBRkwsUUFFSyxDQUZMO0FBR0wsaUJBQUE7QUFISyxLQUFQO0FBS0Q7QUFFSyxTQUFBLHFCQUFBLENBQUEsUUFBQSxFQUFBLE9BQUEsRUFJcUM7QUFBQSxRQUR6QyxXQUN5QyxVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBSnJDLEVBSXFDO0FBQUEsUUFBekMsV0FBeUMsVUFBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxHQUpyQyxFQUlxQzs7QUFFekMsUUFBSSxNQUFNLElBQUEsa0JBQUEsQ0FBQSxRQUFBLEVBQWlDLElBQUEsOEJBQUEsQ0FBM0MsUUFBMkMsQ0FBakMsQ0FBVjtBQUVBLFdBQU87QUFBQSxhQUFBLEdBQUE7QUFFTCxrQkFBVSxJQUFBLHNCQUFBLENBRkwsUUFFSyxDQUZMO0FBR0wsaUJBQUE7QUFISyxLQUFQO0FBS0Q7QUFFRCxJQUFBLGtEQUFBLFVBQUEsZ0JBQUEsRUFBQTtBQUFBLGNBQUEsa0JBQUEsRUFBQSxnQkFBQTs7QUFHRSxhQUFBLGtCQUFBLENBQUEsUUFBQSxFQUFBLFFBQUEsRUFBOEU7QUFBQSx3QkFBQSxJQUFBLEVBQUEsa0JBQUE7O0FBQUEsWUFBQSxRQUFBLDJCQUFBLElBQUEsRUFDNUUsaUJBQUEsSUFBQSxDQUFBLElBQUEsRUFBTTtBQUNKLDhCQUFrQixJQUFBLDJCQUFBLENBRGQsUUFDYyxDQURkO0FBRUosOEJBQWtCLElBQUEsc0JBQUEsQ0FBQSxRQUFBO0FBRmQsU0FBTixDQUQ0RSxDQUFBOztBQU01RSxjQUFBLFFBQUEsR0FBZ0IsSUFBQSw4QkFBQSxDQUFoQixRQUFnQixDQUFoQjtBQU40RSxlQUFBLEtBQUE7QUFPN0U7O0FBVkgsdUJBQUEsU0FBQSxDQUFBLGNBQUEsR0FBQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLEVBWTRCO0FBQ3hCLGVBQU8sS0FBQSxRQUFBLENBQUEsY0FBQSxDQUFQLEdBQU8sQ0FBUDtBQWJKLEtBQUE7O0FBQUEsdUJBQUEsU0FBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUEsUUFBQSxFQWdCK0M7QUFDM0MsWUFBSSxNQUFNLE9BQVYsUUFBVSxDQUFWO0FBQ0EsWUFBSSxNQUFNLEtBQUEsUUFBQSxDQUFWLFFBQUE7QUFFQSxZQUFJLFNBQVMsT0FBTyxJQUFQLEtBQUEsR0FBbUIsSUFBQSxLQUFBLENBQW5CLEdBQW1CLENBQW5CLEdBQW9DLElBQUEsT0FBQSxDQUFqRCxHQUFpRCxDQUFqRDtBQUVBLGVBQU8sSUFBQSx1QkFBQSxDQUFBLEdBQUEsRUFBUCxNQUFPLENBQVA7QUF0QkosS0FBQTs7QUFBQSx1QkFBQSxTQUFBLENBQUEsc0JBQUEsR0FBQSxTQUFBLHNCQUFBLENBQUEsS0FBQSxFQXlCc0Q7QUFDbEQsZUFBTyxJQUFBLGdDQUFBLENBQUEsS0FBQSxFQUFnQyxLQUFBLFFBQUEsQ0FBdkMsTUFBTyxDQUFQO0FBMUJKLEtBQUE7O0FBQUEsdUJBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBaUNvQztBQUVoQyxlQUFPLEtBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBUCxTQUFPLENBQVA7QUFuQ0osS0FBQTs7QUFBQSxXQUFBLGtCQUFBO0FBQUEsQ0FBQSxDQUFBLGVBQUEsQ0FBQTtBQXVDTSxTQUFBLGFBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxFQUF3RDtBQUM1RCxRQUFJLENBQUMsSUFBTCxXQUFLLENBQUwsRUFBdUI7QUFDckIsWUFBQSxLQUFBO0FBQ0EsWUFBSTtBQUNGO0FBREYsU0FBQSxTQUVVO0FBQ1IsZ0JBQUEsTUFBQTtBQUNEO0FBTkgsS0FBQSxNQU9PO0FBQ0w7QUFDRDtBQUNGO0FBRUQsSUFBQSxrREFBQSxVQUFBLGlCQUFBLEVBQUE7QUFBQSxjQUFBLGtCQUFBLEVBQUEsaUJBQUE7O0FBQ0UsYUFBQSxrQkFBQSxDQUFBLE9BQUEsRUFBd0M7QUFBQSx3QkFBQSxJQUFBLEVBQUEsa0JBQUE7O0FBQ3RDLFlBQUksQ0FBSixPQUFBLEVBQWM7QUFDWixnQkFBSSxZQUFXLE9BQWYsUUFBQTtBQUNBLGdCQUFJLG1CQUFtQixJQUFBLDJCQUFBLENBQXZCLFNBQXVCLENBQXZCO0FBQ0EsZ0JBQUksbUJBQW1CLElBQUEsc0JBQUEsQ0FBdkIsU0FBdUIsQ0FBdkI7QUFDQSxzQkFBVSxFQUFBLGtCQUFBLGdCQUFBLEVBQVYsa0JBQUEsZ0JBQVUsRUFBVjtBQUNEO0FBTnFDLGVBQUEsMkJBQUEsSUFBQSxFQVF0QyxrQkFBQSxJQUFBLENBQUEsSUFBQSxFQVJzQyxPQVF0QyxDQVJzQyxDQUFBO0FBU3ZDOztBQVZILFdBQUEsa0JBQUE7QUFBQSxDQUFBLENBQUEsZUFBQSxDQUFBO2tCQWFBLGUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEaWN0LFxuICBEcm9wLFxuICBFbnZpcm9ubWVudCxcbiAgRW52aXJvbm1lbnRPcHRpb25zLFxuICBHbGltbWVyVHJlZUNoYW5nZXMsXG4gIEdsaW1tZXJUcmVlQ29uc3RydWN0aW9uLFxuICBKaXRPckFvdEJsb2NrLFxuICBQYXJ0aWFsU2NvcGUsXG4gIFNjb3BlLFxuICBTY29wZUJsb2NrLFxuICBTY29wZVNsb3QsXG4gIFRyYW5zYWN0aW9uLFxuICBUcmFuc2FjdGlvblN5bWJvbCxcbiAgQ29tcGlsZXJBcnRpZmFjdHMsXG4gIFdpdGhDcmVhdGVJbnN0YW5jZSxcbiAgUmVzb2x2ZWRWYWx1ZSxcbiAgUnVudGltZVJlc29sdmVyRGVsZWdhdGUsXG4gIFJ1bnRpbWVQcm9ncmFtLFxuICBNb2RpZmllck1hbmFnZXIsXG4gIFRlbXBsYXRlLFxuICBBb3RSdW50aW1lUmVzb2x2ZXIsXG4gIEludm9jYXRpb24sXG4gIEppdFJ1bnRpbWVDb250ZXh0LFxuICBBb3RSdW50aW1lQ29udGV4dCxcbiAgSml0UnVudGltZVJlc29sdmVyLFxuICBSdW50aW1lUmVzb2x2ZXIsXG4gIFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCxcbiAgUnVudGltZUNvbnN0YW50cyxcbiAgUnVudGltZUhlYXAsXG4gIFdob2xlUHJvZ3JhbUNvbXBpbGF0aW9uQ29udGV4dCxcbiAgQ29tcGlsZVRpbWVDb25zdGFudHMsXG4gIENvbXBpbGVUaW1lSGVhcCxcbiAgTWFjcm9zLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7XG4gIEl0ZXJhYmxlSW1wbCxcbiAgSXRlcmFibGVLZXlEZWZpbml0aW9ucyxcbiAgT3BhcXVlSXRlcmFibGUsXG4gIFBhdGhSZWZlcmVuY2UsXG4gIFJlZmVyZW5jZSxcbiAgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSxcbiAgVmVyc2lvbmVkUmVmZXJlbmNlLFxufSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgYXNzZXJ0LCBEUk9QLCBleHBlY3QsIE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgQXR0ck5hbWVzcGFjZSwgU2ltcGxlRG9jdW1lbnQsIFNpbXBsZUVsZW1lbnQgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgRE9NQ2hhbmdlc0ltcGwsIERPTVRyZWVDb25zdHJ1Y3Rpb24gfSBmcm9tICcuL2RvbS9oZWxwZXInO1xuaW1wb3J0IHsgQ29uZGl0aW9uYWxSZWZlcmVuY2UsIFVOREVGSU5FRF9SRUZFUkVOQ0UgfSBmcm9tICcuL3JlZmVyZW5jZXMnO1xuaW1wb3J0IHsgRHluYW1pY0F0dHJpYnV0ZSwgZHluYW1pY0F0dHJpYnV0ZSB9IGZyb20gJy4vdm0vYXR0cmlidXRlcy9keW5hbWljJztcbmltcG9ydCB7IFJ1bnRpbWVQcm9ncmFtSW1wbCwgQ29uc3RhbnRzLCBIZWFwSW1wbCB9IGZyb20gJ0BnbGltbWVyL3Byb2dyYW0nO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNTY29wZVJlZmVyZW5jZShzOiBTY29wZVNsb3QpOiBzIGlzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICBpZiAocyA9PT0gbnVsbCB8fCBBcnJheS5pc0FycmF5KHMpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgY2xhc3MgU2NvcGVJbXBsPEMgZXh0ZW5kcyBKaXRPckFvdEJsb2NrPiBpbXBsZW1lbnRzIFBhcnRpYWxTY29wZTxDPiB7XG4gIHN0YXRpYyByb290PEMgZXh0ZW5kcyBKaXRPckFvdEJsb2NrPihzZWxmOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LCBzaXplID0gMCk6IFBhcnRpYWxTY29wZTxDPiB7XG4gICAgbGV0IHJlZnM6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj5bXSA9IG5ldyBBcnJheShzaXplICsgMSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBzaXplOyBpKyspIHtcbiAgICAgIHJlZnNbaV0gPSBVTkRFRklORURfUkVGRVJFTkNFO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgU2NvcGVJbXBsPEM+KHJlZnMsIG51bGwsIG51bGwsIG51bGwpLmluaXQoeyBzZWxmIH0pO1xuICB9XG5cbiAgc3RhdGljIHNpemVkPEMgZXh0ZW5kcyBKaXRPckFvdEJsb2NrPihzaXplID0gMCk6IFNjb3BlPEM+IHtcbiAgICBsZXQgcmVmczogUGF0aFJlZmVyZW5jZTx1bmtub3duPltdID0gbmV3IEFycmF5KHNpemUgKyAxKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHNpemU7IGkrKykge1xuICAgICAgcmVmc1tpXSA9IFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTY29wZUltcGwocmVmcywgbnVsbCwgbnVsbCwgbnVsbCk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICAvLyB0aGUgMHRoIHNsb3QgaXMgYHNlbGZgXG4gICAgcmVhZG9ubHkgc2xvdHM6IEFycmF5PFNjb3BlU2xvdDxDPj4sXG4gICAgcHJpdmF0ZSBjYWxsZXJTY29wZTogT3B0aW9uPFNjb3BlPEM+PixcbiAgICAvLyBuYW1lZCBhcmd1bWVudHMgYW5kIGJsb2NrcyBwYXNzZWQgdG8gYSBsYXlvdXQgdGhhdCB1c2VzIGV2YWxcbiAgICBwcml2YXRlIGV2YWxTY29wZTogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEM+Pj4sXG4gICAgLy8gbG9jYWxzIGluIHNjb3BlIHdoZW4gdGhlIHBhcnRpYWwgd2FzIGludm9rZWRcbiAgICBwcml2YXRlIHBhcnRpYWxNYXA6IE9wdGlvbjxEaWN0PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+PlxuICApIHt9XG5cbiAgaW5pdCh7IHNlbGYgfTogeyBzZWxmOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IH0pOiB0aGlzIHtcbiAgICB0aGlzLnNsb3RzWzBdID0gc2VsZjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldFNlbGYoKTogUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KDApO1xuICB9XG5cbiAgZ2V0U3ltYm9sKHN5bWJvbDogbnVtYmVyKTogUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KHN5bWJvbCk7XG4gIH1cblxuICBnZXRCbG9jayhzeW1ib2w6IG51bWJlcik6IE9wdGlvbjxTY29wZUJsb2NrPEM+PiB7XG4gICAgbGV0IGJsb2NrID0gdGhpcy5nZXQoc3ltYm9sKTtcbiAgICByZXR1cm4gYmxvY2sgPT09IFVOREVGSU5FRF9SRUZFUkVOQ0UgPyBudWxsIDogKGJsb2NrIGFzIFNjb3BlQmxvY2s8Qz4pO1xuICB9XG5cbiAgZ2V0RXZhbFNjb3BlKCk6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxDPj4+IHtcbiAgICByZXR1cm4gdGhpcy5ldmFsU2NvcGU7XG4gIH1cblxuICBnZXRQYXJ0aWFsTWFwKCk6IE9wdGlvbjxEaWN0PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+PiB7XG4gICAgcmV0dXJuIHRoaXMucGFydGlhbE1hcDtcbiAgfVxuXG4gIGJpbmQoc3ltYm9sOiBudW1iZXIsIHZhbHVlOiBTY29wZVNsb3Q8Qz4pIHtcbiAgICB0aGlzLnNldChzeW1ib2wsIHZhbHVlKTtcbiAgfVxuXG4gIGJpbmRTZWxmKHNlbGY6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4pIHtcbiAgICB0aGlzLnNldDxQYXRoUmVmZXJlbmNlPHVua25vd24+PigwLCBzZWxmKTtcbiAgfVxuXG4gIGJpbmRTeW1ib2woc3ltYm9sOiBudW1iZXIsIHZhbHVlOiBQYXRoUmVmZXJlbmNlPHVua25vd24+KSB7XG4gICAgdGhpcy5zZXQoc3ltYm9sLCB2YWx1ZSk7XG4gIH1cblxuICBiaW5kQmxvY2soc3ltYm9sOiBudW1iZXIsIHZhbHVlOiBPcHRpb248U2NvcGVCbG9jazxDPj4pIHtcbiAgICB0aGlzLnNldDxPcHRpb248U2NvcGVCbG9jazxDPj4+KHN5bWJvbCwgdmFsdWUpO1xuICB9XG5cbiAgYmluZEV2YWxTY29wZShtYXA6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxDPj4+KSB7XG4gICAgdGhpcy5ldmFsU2NvcGUgPSBtYXA7XG4gIH1cblxuICBiaW5kUGFydGlhbE1hcChtYXA6IERpY3Q8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4pIHtcbiAgICB0aGlzLnBhcnRpYWxNYXAgPSBtYXA7XG4gIH1cblxuICBiaW5kQ2FsbGVyU2NvcGUoc2NvcGU6IE9wdGlvbjxTY29wZTxDPj4pOiB2b2lkIHtcbiAgICB0aGlzLmNhbGxlclNjb3BlID0gc2NvcGU7XG4gIH1cblxuICBnZXRDYWxsZXJTY29wZSgpOiBPcHRpb248U2NvcGU8Qz4+IHtcbiAgICByZXR1cm4gdGhpcy5jYWxsZXJTY29wZTtcbiAgfVxuXG4gIGNoaWxkKCk6IFNjb3BlPEM+IHtcbiAgICByZXR1cm4gbmV3IFNjb3BlSW1wbCh0aGlzLnNsb3RzLnNsaWNlKCksIHRoaXMuY2FsbGVyU2NvcGUsIHRoaXMuZXZhbFNjb3BlLCB0aGlzLnBhcnRpYWxNYXApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQ8VCBleHRlbmRzIFNjb3BlU2xvdDxDPj4oaW5kZXg6IG51bWJlcik6IFQge1xuICAgIGlmIChpbmRleCA+PSB0aGlzLnNsb3RzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEJVRzogY2Fubm90IGdldCAkJHtpbmRleH0gZnJvbSBzY29wZTsgbGVuZ3RoPSR7dGhpcy5zbG90cy5sZW5ndGh9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc2xvdHNbaW5kZXhdIGFzIFQ7XG4gIH1cblxuICBwcml2YXRlIHNldDxUIGV4dGVuZHMgU2NvcGVTbG90PEM+PihpbmRleDogbnVtYmVyLCB2YWx1ZTogVCk6IHZvaWQge1xuICAgIGlmIChpbmRleCA+PSB0aGlzLnNsb3RzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEJVRzogY2Fubm90IGdldCAkJHtpbmRleH0gZnJvbSBzY29wZTsgbGVuZ3RoPSR7dGhpcy5zbG90cy5sZW5ndGh9YCk7XG4gICAgfVxuXG4gICAgdGhpcy5zbG90c1tpbmRleF0gPSB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVFJBTlNBQ1RJT046IFRyYW5zYWN0aW9uU3ltYm9sID0gJ1RSQU5TQUNUSU9OIFtjMzkzODg4NS1hYmEwLTQyMmYtYjU0MC0zZmQzNDMxYzc4YjVdJztcblxuY2xhc3MgVHJhbnNhY3Rpb25JbXBsIGltcGxlbWVudHMgVHJhbnNhY3Rpb24ge1xuICByZWFkb25seSBbVFJBTlNBQ1RJT05dOiBPcHRpb248VHJhbnNhY3Rpb25JbXBsPjtcblxuICBwdWJsaWMgc2NoZWR1bGVkSW5zdGFsbE1hbmFnZXJzOiBNb2RpZmllck1hbmFnZXJbXSA9IFtdO1xuICBwdWJsaWMgc2NoZWR1bGVkSW5zdGFsbE1vZGlmaWVyczogdW5rbm93bltdID0gW107XG4gIHB1YmxpYyBzY2hlZHVsZWRVcGRhdGVNb2RpZmllck1hbmFnZXJzOiBNb2RpZmllck1hbmFnZXJbXSA9IFtdO1xuICBwdWJsaWMgc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJzOiB1bmtub3duW10gPSBbXTtcbiAgcHVibGljIGNyZWF0ZWRDb21wb25lbnRzOiB1bmtub3duW10gPSBbXTtcbiAgcHVibGljIGNyZWF0ZWRNYW5hZ2VyczogV2l0aENyZWF0ZUluc3RhbmNlPHVua25vd24+W10gPSBbXTtcbiAgcHVibGljIHVwZGF0ZWRDb21wb25lbnRzOiB1bmtub3duW10gPSBbXTtcbiAgcHVibGljIHVwZGF0ZWRNYW5hZ2VyczogV2l0aENyZWF0ZUluc3RhbmNlPHVua25vd24+W10gPSBbXTtcbiAgcHVibGljIGRlc3RydWN0b3JzOiBEcm9wW10gPSBbXTtcblxuICBkaWRDcmVhdGUoY29tcG9uZW50OiB1bmtub3duLCBtYW5hZ2VyOiBXaXRoQ3JlYXRlSW5zdGFuY2UpIHtcbiAgICB0aGlzLmNyZWF0ZWRDb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICB0aGlzLmNyZWF0ZWRNYW5hZ2Vycy5wdXNoKG1hbmFnZXIpO1xuICB9XG5cbiAgZGlkVXBkYXRlKGNvbXBvbmVudDogdW5rbm93biwgbWFuYWdlcjogV2l0aENyZWF0ZUluc3RhbmNlKSB7XG4gICAgdGhpcy51cGRhdGVkQ29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgdGhpcy51cGRhdGVkTWFuYWdlcnMucHVzaChtYW5hZ2VyKTtcbiAgfVxuXG4gIHNjaGVkdWxlSW5zdGFsbE1vZGlmaWVyKG1vZGlmaWVyOiB1bmtub3duLCBtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXIpIHtcbiAgICB0aGlzLnNjaGVkdWxlZEluc3RhbGxNb2RpZmllcnMucHVzaChtb2RpZmllcik7XG4gICAgdGhpcy5zY2hlZHVsZWRJbnN0YWxsTWFuYWdlcnMucHVzaChtYW5hZ2VyKTtcbiAgfVxuXG4gIHNjaGVkdWxlVXBkYXRlTW9kaWZpZXIobW9kaWZpZXI6IHVua25vd24sIG1hbmFnZXI6IE1vZGlmaWVyTWFuYWdlcikge1xuICAgIHRoaXMuc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpO1xuICAgIHRoaXMuc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJNYW5hZ2Vycy5wdXNoKG1hbmFnZXIpO1xuICB9XG5cbiAgZGlkRGVzdHJveShkOiBEcm9wKSB7XG4gICAgdGhpcy5kZXN0cnVjdG9ycy5wdXNoKGQpO1xuICB9XG5cbiAgY29tbWl0KCkge1xuICAgIGxldCB7IGNyZWF0ZWRDb21wb25lbnRzLCBjcmVhdGVkTWFuYWdlcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNyZWF0ZWRDb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgY29tcG9uZW50ID0gY3JlYXRlZENvbXBvbmVudHNbaV07XG4gICAgICBsZXQgbWFuYWdlciA9IGNyZWF0ZWRNYW5hZ2Vyc1tpXTtcbiAgICAgIG1hbmFnZXIuZGlkQ3JlYXRlKGNvbXBvbmVudCk7XG4gICAgfVxuXG4gICAgbGV0IHsgdXBkYXRlZENvbXBvbmVudHMsIHVwZGF0ZWRNYW5hZ2VycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdXBkYXRlZENvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjb21wb25lbnQgPSB1cGRhdGVkQ29tcG9uZW50c1tpXTtcbiAgICAgIGxldCBtYW5hZ2VyID0gdXBkYXRlZE1hbmFnZXJzW2ldO1xuICAgICAgbWFuYWdlci5kaWRVcGRhdGUoY29tcG9uZW50KTtcbiAgICB9XG5cbiAgICBsZXQgeyBkZXN0cnVjdG9ycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVzdHJ1Y3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGRlc3RydWN0b3JzW2ldW0RST1BdKCk7XG4gICAgfVxuXG4gICAgbGV0IHsgc2NoZWR1bGVkSW5zdGFsbE1hbmFnZXJzLCBzY2hlZHVsZWRJbnN0YWxsTW9kaWZpZXJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2hlZHVsZWRJbnN0YWxsTWFuYWdlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBtb2RpZmllciA9IHNjaGVkdWxlZEluc3RhbGxNb2RpZmllcnNbaV07XG4gICAgICBsZXQgbWFuYWdlciA9IHNjaGVkdWxlZEluc3RhbGxNYW5hZ2Vyc1tpXTtcbiAgICAgIG1hbmFnZXIuaW5zdGFsbChtb2RpZmllcik7XG4gICAgfVxuXG4gICAgbGV0IHsgc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJNYW5hZ2Vycywgc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2hlZHVsZWRVcGRhdGVNb2RpZmllck1hbmFnZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbW9kaWZpZXIgPSBzY2hlZHVsZWRVcGRhdGVNb2RpZmllcnNbaV07XG4gICAgICBsZXQgbWFuYWdlciA9IHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnNbaV07XG4gICAgICBtYW5hZ2VyLnVwZGF0ZShtb2RpZmllcik7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRvQm9vbCA9ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbjtcblxuZnVuY3Rpb24gdG9Cb29sKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiAhIXZhbHVlO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW52aXJvbm1lbnRJbXBsIGltcGxlbWVudHMgRW52aXJvbm1lbnQge1xuICBbVFJBTlNBQ1RJT05dOiBPcHRpb248VHJhbnNhY3Rpb25JbXBsPiA9IG51bGw7XG5cbiAgcHJvdGVjdGVkIHVwZGF0ZU9wZXJhdGlvbnM6IEdsaW1tZXJUcmVlQ2hhbmdlcztcbiAgcHJvdGVjdGVkIGFwcGVuZE9wZXJhdGlvbnM6IEdsaW1tZXJUcmVlQ29uc3RydWN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHsgYXBwZW5kT3BlcmF0aW9ucywgdXBkYXRlT3BlcmF0aW9ucyB9OiBFbnZpcm9ubWVudE9wdGlvbnMpIHtcbiAgICB0aGlzLmFwcGVuZE9wZXJhdGlvbnMgPSBhcHBlbmRPcGVyYXRpb25zO1xuICAgIHRoaXMudXBkYXRlT3BlcmF0aW9ucyA9IHVwZGF0ZU9wZXJhdGlvbnM7XG4gIH1cblxuICB0b0NvbmRpdGlvbmFsUmVmZXJlbmNlKHJlZmVyZW5jZTogUmVmZXJlbmNlKTogUmVmZXJlbmNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsUmVmZXJlbmNlKHJlZmVyZW5jZSwgdG9Cb29sKTtcbiAgfVxuXG4gIGFic3RyYWN0IGl0ZXJhYmxlRm9yKHJlZmVyZW5jZTogUmVmZXJlbmNlLCBrZXk6IHVua25vd24pOiBPcGFxdWVJdGVyYWJsZTtcbiAgYWJzdHJhY3QgcHJvdG9jb2xGb3JVUkwoczogc3RyaW5nKTogc3RyaW5nO1xuXG4gIGdldEFwcGVuZE9wZXJhdGlvbnMoKTogR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZE9wZXJhdGlvbnM7XG4gIH1cbiAgZ2V0RE9NKCk6IEdsaW1tZXJUcmVlQ2hhbmdlcyB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlT3BlcmF0aW9ucztcbiAgfVxuXG4gIGJlZ2luKCkge1xuICAgIGFzc2VydChcbiAgICAgICF0aGlzW1RSQU5TQUNUSU9OXSxcbiAgICAgICdBIGdsaW1tZXIgdHJhbnNhY3Rpb24gd2FzIGJlZ3VuLCBidXQgb25lIGFscmVhZHkgZXhpc3RzLiBZb3UgbWF5IGhhdmUgYSBuZXN0ZWQgdHJhbnNhY3Rpb24sIHBvc3NpYmx5IGNhdXNlZCBieSBhbiBlYXJsaWVyIHJ1bnRpbWUgZXhjZXB0aW9uIHdoaWxlIHJlbmRlcmluZy4gUGxlYXNlIGNoZWNrIHlvdXIgY29uc29sZSBmb3IgdGhlIHN0YWNrIHRyYWNlIG9mIGFueSBwcmlvciBleGNlcHRpb25zLidcbiAgICApO1xuXG4gICAgdGhpc1tUUkFOU0FDVElPTl0gPSBuZXcgVHJhbnNhY3Rpb25JbXBsKCk7XG4gIH1cblxuICBwcml2YXRlIGdldCB0cmFuc2FjdGlvbigpOiBUcmFuc2FjdGlvbkltcGwge1xuICAgIHJldHVybiBleHBlY3QodGhpc1tUUkFOU0FDVElPTl0hLCAnbXVzdCBiZSBpbiBhIHRyYW5zYWN0aW9uJyk7XG4gIH1cblxuICBkaWRDcmVhdGUoY29tcG9uZW50OiB1bmtub3duLCBtYW5hZ2VyOiBXaXRoQ3JlYXRlSW5zdGFuY2UpIHtcbiAgICB0aGlzLnRyYW5zYWN0aW9uLmRpZENyZWF0ZShjb21wb25lbnQsIG1hbmFnZXIpO1xuICB9XG5cbiAgZGlkVXBkYXRlKGNvbXBvbmVudDogdW5rbm93biwgbWFuYWdlcjogV2l0aENyZWF0ZUluc3RhbmNlKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5kaWRVcGRhdGUoY29tcG9uZW50LCBtYW5hZ2VyKTtcbiAgfVxuXG4gIHNjaGVkdWxlSW5zdGFsbE1vZGlmaWVyKG1vZGlmaWVyOiB1bmtub3duLCBtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXIpIHtcbiAgICB0aGlzLnRyYW5zYWN0aW9uLnNjaGVkdWxlSW5zdGFsbE1vZGlmaWVyKG1vZGlmaWVyLCBtYW5hZ2VyKTtcbiAgfVxuXG4gIHNjaGVkdWxlVXBkYXRlTW9kaWZpZXIobW9kaWZpZXI6IHVua25vd24sIG1hbmFnZXI6IE1vZGlmaWVyTWFuYWdlcikge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uc2NoZWR1bGVVcGRhdGVNb2RpZmllcihtb2RpZmllciwgbWFuYWdlcik7XG4gIH1cblxuICBkaWREZXN0cm95KGQ6IERyb3ApIHtcbiAgICB0aGlzLnRyYW5zYWN0aW9uLmRpZERlc3Ryb3koZCk7XG4gIH1cblxuICBjb21taXQoKSB7XG4gICAgbGV0IHRyYW5zYWN0aW9uID0gdGhpcy50cmFuc2FjdGlvbjtcbiAgICB0aGlzW1RSQU5TQUNUSU9OXSA9IG51bGw7XG4gICAgdHJhbnNhY3Rpb24uY29tbWl0KCk7XG4gIH1cblxuICBhdHRyaWJ1dGVGb3IoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBhdHRyOiBzdHJpbmcsXG4gICAgX2lzVHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT4gPSBudWxsXG4gICk6IER5bmFtaWNBdHRyaWJ1dGUge1xuICAgIHJldHVybiBkeW5hbWljQXR0cmlidXRlKGVsZW1lbnQsIGF0dHIsIG5hbWVzcGFjZSk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSB7XG4gIHByb3RvY29sRm9yVVJMPyh1cmw6IHN0cmluZyk6IHN0cmluZztcbiAgaXRlcmFibGU/OiBJdGVyYWJsZUtleURlZmluaXRpb25zO1xuICB0b0Jvb2w/KHZhbHVlOiB1bmtub3duKTogYm9vbGVhbjtcbiAgYXR0cmlidXRlRm9yPyhcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIGF0dHI6IHN0cmluZyxcbiAgICBpc1RydXN0aW5nOiBib29sZWFuLFxuICAgIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+XG4gICk6IER5bmFtaWNBdHRyaWJ1dGU7XG59XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGwgaW1wbGVtZW50cyBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSB7XG4gIHJlYWRvbmx5IHRvQm9vbDogKHZhbHVlOiB1bmtub3duKSA9PiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlID0ge30pIHtcbiAgICBpZiAoaW5uZXIudG9Cb29sKSB7XG4gICAgICB0aGlzLnRvQm9vbCA9IGlubmVyLnRvQm9vbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b0Jvb2wgPSB2YWx1ZSA9PiAhIXZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHByb3RvY29sRm9yVVJMKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5pbm5lci5wcm90b2NvbEZvclVSTCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5uZXIucHJvdG9jb2xGb3JVUkwodXJsKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBVUkwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBVUkwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gbGVnYWN5UHJvdG9jb2xGb3JVUkwodXJsKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBuZXcgVVJMKHVybCwgZG9jdW1lbnQuYmFzZVVSSSkucHJvdG9jb2w7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgVVJMKHVybCwgJ2h0dHBzOi8vd3d3LmV4YW1wbGUuY29tJykucHJvdG9jb2w7XG4gICAgfVxuICB9XG5cbiAgYXR0cmlidXRlRm9yKFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgYXR0cjogc3RyaW5nLFxuICAgIGlzVHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbiAgKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gICAgaWYgKHRoaXMuaW5uZXIuYXR0cmlidXRlRm9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbm5lci5hdHRyaWJ1dGVGb3IoZWxlbWVudCwgYXR0ciwgaXNUcnVzdGluZywgbmFtZXNwYWNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGR5bmFtaWNBdHRyaWJ1dGUoZWxlbWVudCwgYXR0ciwgbmFtZXNwYWNlKTtcbiAgICB9XG4gIH1cblxuICByZWFkb25seSBpdGVyYWJsZTogSXRlcmFibGVLZXlEZWZpbml0aW9ucyA9IHtcbiAgICBuYW1lZDoge1xuICAgICAgJ0BpbmRleCc6IChfLCBpbmRleCkgPT4gU3RyaW5nKGluZGV4KSxcbiAgICAgICdAcHJpbWl0aXZlJzogaXRlbSA9PiBTdHJpbmcoaXRlbSksXG4gICAgICAnQGlkZW50aXR5JzogaXRlbSA9PiBpdGVtLFxuICAgIH0sXG4gICAgZGVmYXVsdDoga2V5ID0+IGl0ZW0gPT4gaXRlbVtrZXldLFxuICB9O1xufVxuXG5mdW5jdGlvbiBsZWdhY3lQcm90b2NvbEZvclVSTCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIGxldCBtYXRjaCA9IC9eKFthLXpdW2EtejAtOS4rLV0qOik/KFxcL1xcLyk/KFtcXFNcXHNdKikvaS5leGVjKHVybCk7XG4gICAgcmV0dXJuIG1hdGNoICYmIG1hdGNoWzFdID8gbWF0Y2hbMV0udG9Mb3dlckNhc2UoKSA6ICcnO1xuICB9XG5cbiAgbGV0IGFuY2hvciA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGFuY2hvci5ocmVmID0gdXJsO1xuICByZXR1cm4gYW5jaG9yLnByb3RvY29sO1xufVxuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFJ1bnRpbWVSZXNvbHZlcjxSIGV4dGVuZHMgeyBtb2R1bGU6IHN0cmluZyB9PlxuICBpbXBsZW1lbnRzIEppdFJ1bnRpbWVSZXNvbHZlcjxSPiwgQW90UnVudGltZVJlc29sdmVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogUnVudGltZVJlc29sdmVyRGVsZWdhdGUpIHt9XG5cbiAgbG9va3VwQ29tcG9uZW50KG5hbWU6IHN0cmluZywgcmVmZXJyZXI/OiB1bmtub3duKTogT3B0aW9uPGFueT4ge1xuICAgIGlmICh0aGlzLmlubmVyLmxvb2t1cENvbXBvbmVudCkge1xuICAgICAgbGV0IGNvbXBvbmVudCA9IHRoaXMuaW5uZXIubG9va3VwQ29tcG9uZW50KG5hbWUsIHJlZmVycmVyKTtcblxuICAgICAgaWYgKGNvbXBvbmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5leHBlY3RlZCBjb21wb25lbnQgJHtuYW1lfSAoZnJvbSAke3JlZmVycmVyfSkgKGxvb2t1cENvbXBvbmVudCByZXR1cm5lZCB1bmRlZmluZWQpYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvb2t1cENvbXBvbmVudCBub3QgaW1wbGVtZW50ZWQgb24gUnVudGltZVJlc29sdmVyLicpO1xuICAgIH1cbiAgfVxuXG4gIGxvb2t1cFBhcnRpYWwobmFtZTogc3RyaW5nLCByZWZlcnJlcj86IHVua25vd24pOiBPcHRpb248bnVtYmVyPiB7XG4gICAgaWYgKHRoaXMuaW5uZXIubG9va3VwUGFydGlhbCkge1xuICAgICAgbGV0IHBhcnRpYWwgPSB0aGlzLmlubmVyLmxvb2t1cFBhcnRpYWwobmFtZSwgcmVmZXJyZXIpO1xuXG4gICAgICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5leHBlY3RlZCBwYXJ0aWFsICR7bmFtZX0gKGZyb20gJHtyZWZlcnJlcn0pIChsb29rdXBQYXJ0aWFsIHJldHVybmVkIHVuZGVmaW5lZClgXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJ0aWFsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvb2t1cFBhcnRpYWwgbm90IGltcGxlbWVudGVkIG9uIFJ1bnRpbWVSZXNvbHZlci4nKTtcbiAgICB9XG4gIH1cblxuICByZXNvbHZlPFUgZXh0ZW5kcyBSZXNvbHZlZFZhbHVlPihoYW5kbGU6IG51bWJlcik6IFUge1xuICAgIGlmICh0aGlzLmlubmVyLnJlc29sdmUpIHtcbiAgICAgIGxldCByZXNvbHZlZCA9IHRoaXMuaW5uZXIucmVzb2x2ZShoYW5kbGUpO1xuXG4gICAgICBpZiAocmVzb2x2ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgaGFuZGxlICR7aGFuZGxlfSAocmVzb2x2ZSByZXR1cm5lZCB1bmRlZmluZWQpYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNvbHZlZCBhcyBVO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc29sdmUgbm90IGltcGxlbWVudGVkIG9uIFJ1bnRpbWVSZXNvbHZlci4nKTtcbiAgICB9XG4gIH1cblxuICBjb21waWxhYmxlKGxvY2F0b3I6IHsgbW9kdWxlOiBzdHJpbmcgfSk6IFRlbXBsYXRlIHtcbiAgICBpZiAodGhpcy5pbm5lci5jb21waWxhYmxlKSB7XG4gICAgICBsZXQgcmVzb2x2ZWQgPSB0aGlzLmlubmVyLmNvbXBpbGFibGUobG9jYXRvcik7XG5cbiAgICAgIGlmIChyZXNvbHZlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNvbXBpbGUgJHtuYW1lfSAoY29tcGlsYWJsZSByZXR1cm5lZCB1bmRlZmluZWQpYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb21waWxhYmxlIG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0SW52b2NhdGlvbihsb2NhdG9yOiBSKTogSW52b2NhdGlvbiB7XG4gICAgaWYgKHRoaXMuaW5uZXIuZ2V0SW52b2NhdGlvbikge1xuICAgICAgbGV0IGludm9jYXRpb24gPSB0aGlzLmlubmVyLmdldEludm9jYXRpb24obG9jYXRvcik7XG5cbiAgICAgIGlmIChpbnZvY2F0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gZ2V0IGludm9jYXRpb24gZm9yICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICBsb2NhdG9yXG4gICAgICAgICAgKX0gKGdldEludm9jYXRpb24gcmV0dXJuZWQgdW5kZWZpbmVkKWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGludm9jYXRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0SW52b2NhdGlvbiBub3QgaW1wbGVtZW50ZWQgb24gUnVudGltZVJlc29sdmVyLicpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQW90UnVudGltZShcbiAgZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50LFxuICBwcm9ncmFtOiBDb21waWxlckFydGlmYWN0cyxcbiAgcmVzb2x2ZXI6IFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlID0ge30sXG4gIGRlbGVnYXRlOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSA9IHt9XG4pOiBBb3RSdW50aW1lQ29udGV4dCB7XG4gIGxldCBlbnYgPSBuZXcgUnVudGltZUVudmlyb25tZW50KGRvY3VtZW50LCBuZXcgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKGRlbGVnYXRlKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBlbnYsXG4gICAgcmVzb2x2ZXI6IG5ldyBEZWZhdWx0UnVudGltZVJlc29sdmVyKHJlc29sdmVyKSxcbiAgICBwcm9ncmFtOiBSdW50aW1lUHJvZ3JhbUltcGwuaHlkcmF0ZShwcm9ncmFtKSxcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKaXRQcm9ncmFtQ29tcGlsYXRpb25Db250ZXh0IGV4dGVuZHMgV2hvbGVQcm9ncmFtQ29tcGlsYXRpb25Db250ZXh0IHtcbiAgcmVhZG9ubHkgY29uc3RhbnRzOiBDb21waWxlVGltZUNvbnN0YW50cyAmIFJ1bnRpbWVDb25zdGFudHM7XG4gIHJlYWRvbmx5IGhlYXA6IENvbXBpbGVUaW1lSGVhcCAmIFJ1bnRpbWVIZWFwO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEppdFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCBleHRlbmRzIFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCB7XG4gIHJlYWRvbmx5IHByb2dyYW06IEppdFByb2dyYW1Db21waWxhdGlvbkNvbnRleHQ7XG4gIHJlYWRvbmx5IG1hY3JvczogTWFjcm9zO1xufVxuXG4vLyBUT0RPOiBUaGVyZSBhcmUgYSBsb3Qgb2YgdmFyaWFudHMgaGVyZS4gU29tZSBhcmUgaGVyZSBmb3IgdHJhbnNpdGlvbmFsIHB1cnBvc2VzXG4vLyBhbmQgc29tZSBtaWdodCBiZSBHQ2FibGUgb25jZSB0aGUgZGVzaWduIHN0YWJpbGl6ZXMuXG5leHBvcnQgZnVuY3Rpb24gQ3VzdG9tSml0UnVudGltZShcbiAgcmVzb2x2ZXI6IFJ1bnRpbWVSZXNvbHZlcixcbiAgY29udGV4dDogU3ludGF4Q29tcGlsYXRpb25Db250ZXh0ICYge1xuICAgIHByb2dyYW06IHsgY29uc3RhbnRzOiBSdW50aW1lQ29uc3RhbnRzOyBoZWFwOiBSdW50aW1lSGVhcCB9O1xuICB9LFxuICBlbnY6IEVudmlyb25tZW50XG4pOiBKaXRSdW50aW1lQ29udGV4dCB7XG4gIGxldCBwcm9ncmFtID0gbmV3IFJ1bnRpbWVQcm9ncmFtSW1wbChjb250ZXh0LnByb2dyYW0uY29uc3RhbnRzLCBjb250ZXh0LnByb2dyYW0uaGVhcCk7XG5cbiAgcmV0dXJuIHtcbiAgICBlbnYsXG4gICAgcmVzb2x2ZXI6IG5ldyBEZWZhdWx0UnVudGltZVJlc29sdmVyKHJlc29sdmVyKSxcbiAgICBwcm9ncmFtLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSml0UnVudGltZShcbiAgZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50LFxuICByZXNvbHZlcjogUnVudGltZVJlc29sdmVyRGVsZWdhdGUgPSB7fSxcbiAgZGVsZWdhdGU6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlID0ge31cbik6IEppdFJ1bnRpbWVDb250ZXh0IHtcbiAgbGV0IGVudiA9IG5ldyBSdW50aW1lRW52aXJvbm1lbnQoZG9jdW1lbnQsIG5ldyBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGwoZGVsZWdhdGUpKTtcblxuICBsZXQgY29uc3RhbnRzID0gbmV3IENvbnN0YW50cygpO1xuICBsZXQgaGVhcCA9IG5ldyBIZWFwSW1wbCgpO1xuICBsZXQgcHJvZ3JhbSA9IG5ldyBSdW50aW1lUHJvZ3JhbUltcGwoY29uc3RhbnRzLCBoZWFwKTtcblxuICByZXR1cm4ge1xuICAgIGVudixcbiAgICByZXNvbHZlcjogbmV3IERlZmF1bHRSdW50aW1lUmVzb2x2ZXIocmVzb2x2ZXIpLFxuICAgIHByb2dyYW0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBKaXRSdW50aW1lRnJvbVByb2dyYW0oXG4gIGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCxcbiAgcHJvZ3JhbTogUnVudGltZVByb2dyYW0sXG4gIHJlc29sdmVyOiBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSA9IHt9LFxuICBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUgPSB7fVxuKTogSml0UnVudGltZUNvbnRleHQge1xuICBsZXQgZW52ID0gbmV3IFJ1bnRpbWVFbnZpcm9ubWVudChkb2N1bWVudCwgbmV3IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbChkZWxlZ2F0ZSkpO1xuXG4gIHJldHVybiB7XG4gICAgZW52LFxuICAgIHJlc29sdmVyOiBuZXcgRGVmYXVsdFJ1bnRpbWVSZXNvbHZlcihyZXNvbHZlciksXG4gICAgcHJvZ3JhbSxcbiAgfTtcbn1cblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVFbnZpcm9ubWVudCBleHRlbmRzIEVudmlyb25tZW50SW1wbCB7XG4gIHByaXZhdGUgZGVsZWdhdGU6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbDtcblxuICBjb25zdHJ1Y3Rvcihkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQsIGRlbGVnYXRlOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGwpIHtcbiAgICBzdXBlcih7XG4gICAgICBhcHBlbmRPcGVyYXRpb25zOiBuZXcgRE9NVHJlZUNvbnN0cnVjdGlvbihkb2N1bWVudCksXG4gICAgICB1cGRhdGVPcGVyYXRpb25zOiBuZXcgRE9NQ2hhbmdlc0ltcGwoZG9jdW1lbnQpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5kZWxlZ2F0ZSA9IG5ldyBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGwoZGVsZWdhdGUpO1xuICB9XG5cbiAgcHJvdG9jb2xGb3JVUkwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLnByb3RvY29sRm9yVVJMKHVybCk7XG4gIH1cblxuICBpdGVyYWJsZUZvcihyZWY6IFJlZmVyZW5jZSwgaW5wdXRLZXk6IHVua25vd24pOiBPcGFxdWVJdGVyYWJsZSB7XG4gICAgbGV0IGtleSA9IFN0cmluZyhpbnB1dEtleSk7XG4gICAgbGV0IGRlZiA9IHRoaXMuZGVsZWdhdGUuaXRlcmFibGU7XG5cbiAgICBsZXQga2V5Rm9yID0ga2V5IGluIGRlZi5uYW1lZCA/IGRlZi5uYW1lZFtrZXldIDogZGVmLmRlZmF1bHQoa2V5KTtcblxuICAgIHJldHVybiBuZXcgSXRlcmFibGVJbXBsKHJlZiwga2V5Rm9yKTtcbiAgfVxuXG4gIHRvQ29uZGl0aW9uYWxSZWZlcmVuY2UoaW5wdXQ6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UpOiBWZXJzaW9uZWRSZWZlcmVuY2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxSZWZlcmVuY2UoaW5wdXQsIHRoaXMuZGVsZWdhdGUudG9Cb29sKTtcbiAgfVxuXG4gIGF0dHJpYnV0ZUZvcihcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIGF0dHI6IHN0cmluZyxcbiAgICBpc1RydXN0aW5nOiBib29sZWFuLFxuICAgIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+XG4gICk6IER5bmFtaWNBdHRyaWJ1dGUge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLmF0dHJpYnV0ZUZvcihlbGVtZW50LCBhdHRyLCBpc1RydXN0aW5nLCBuYW1lc3BhY2UpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpblRyYW5zYWN0aW9uKGVudjogRW52aXJvbm1lbnQsIGNiOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gIGlmICghZW52W1RSQU5TQUNUSU9OXSkge1xuICAgIGVudi5iZWdpbigpO1xuICAgIHRyeSB7XG4gICAgICBjYigpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBlbnYuY29tbWl0KCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNiKCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERlZmF1bHRFbnZpcm9ubWVudCBleHRlbmRzIEVudmlyb25tZW50SW1wbCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBFbnZpcm9ubWVudE9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIGxldCBkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudCBhcyBTaW1wbGVEb2N1bWVudDtcbiAgICAgIGxldCBhcHBlbmRPcGVyYXRpb25zID0gbmV3IERPTVRyZWVDb25zdHJ1Y3Rpb24oZG9jdW1lbnQpO1xuICAgICAgbGV0IHVwZGF0ZU9wZXJhdGlvbnMgPSBuZXcgRE9NQ2hhbmdlc0ltcGwoZG9jdW1lbnQpO1xuICAgICAgb3B0aW9ucyA9IHsgYXBwZW5kT3BlcmF0aW9ucywgdXBkYXRlT3BlcmF0aW9ucyB9O1xuICAgIH1cblxuICAgIHN1cGVyKG9wdGlvbnMpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEVudmlyb25tZW50SW1wbDtcbiJdLCJzb3VyY2VSb290IjoiIn0=