var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _a;
import { IterableImpl } from '@glimmer/reference';
import { assert, DROP } from '@glimmer/util';
import { DOMChangesImpl, DOMTreeConstruction } from './dom/helper';
import { ConditionalReference, UNDEFINED_REFERENCE } from './references';
import { dynamicAttribute } from './vm/attributes/dynamic';
import { RuntimeProgramImpl, Constants, HeapImpl } from '@glimmer/program';
export function isScopeReference(s) {
    if (s === null || Array.isArray(s)) return false;
    return true;
}
export var ScopeImpl = function () {
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
            refs[i] = UNDEFINED_REFERENCE;
        }
        return new ScopeImpl(refs, null, null, null).init({ self: self });
    };

    ScopeImpl.sized = function sized() {
        var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        var refs = new Array(size + 1);
        for (var i = 0; i <= size; i++) {
            refs[i] = UNDEFINED_REFERENCE;
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
        return block === UNDEFINED_REFERENCE ? null : block;
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
export var TRANSACTION = 'TRANSACTION [c3938885-aba0-422f-b540-3fd3431c78b5]';

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
            destructors[_i2][DROP]();
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
export var EnvironmentImpl = function () {
    function EnvironmentImpl(_ref2) {
        var appendOperations = _ref2.appendOperations,
            updateOperations = _ref2.updateOperations;

        _classCallCheck(this, EnvironmentImpl);

        this[_a] = null;
        this.appendOperations = appendOperations;
        this.updateOperations = updateOperations;
    }

    EnvironmentImpl.prototype.toConditionalReference = function toConditionalReference(reference) {
        return new ConditionalReference(reference, toBool);
    };

    EnvironmentImpl.prototype.getAppendOperations = function getAppendOperations() {
        return this.appendOperations;
    };

    EnvironmentImpl.prototype.getDOM = function getDOM() {
        return this.updateOperations;
    };

    EnvironmentImpl.prototype.begin = function begin() {
        false && assert(!this[TRANSACTION], 'A glimmer transaction was begun, but one already exists. You may have a nested transaction, possibly caused by an earlier runtime exception while rendering. Please check your console for the stack trace of any prior exceptions.');

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

        return dynamicAttribute(element, attr, namespace);
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
export var RuntimeEnvironmentDelegateImpl = function () {
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
            return dynamicAttribute(element, attr, namespace);
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
export var DefaultRuntimeResolver = function () {
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
export function AotRuntime(document, program) {
    var resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var delegate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    return {
        env: env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: RuntimeProgramImpl.hydrate(program)
    };
}
// TODO: There are a lot of variants here. Some are here for transitional purposes
// and some might be GCable once the design stabilizes.
export function CustomJitRuntime(resolver, context, env) {
    var program = new RuntimeProgramImpl(context.program.constants, context.program.heap);
    return {
        env: env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: program
    };
}
export function JitRuntime(document) {
    var resolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var delegate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    var constants = new Constants();
    var heap = new HeapImpl();
    var program = new RuntimeProgramImpl(constants, heap);
    return {
        env: env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: program
    };
}
export function JitRuntimeFromProgram(document, program) {
    var resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var delegate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    return {
        env: env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: program
    };
}
export var RuntimeEnvironment = function (_EnvironmentImpl) {
    _inherits(RuntimeEnvironment, _EnvironmentImpl);

    function RuntimeEnvironment(document, delegate) {
        _classCallCheck(this, RuntimeEnvironment);

        var _this = _possibleConstructorReturn(this, _EnvironmentImpl.call(this, {
            appendOperations: new DOMTreeConstruction(document),
            updateOperations: new DOMChangesImpl(document)
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
        return new IterableImpl(ref, keyFor);
    };

    RuntimeEnvironment.prototype.toConditionalReference = function toConditionalReference(input) {
        return new ConditionalReference(input, this.delegate.toBool);
    };

    RuntimeEnvironment.prototype.attributeFor = function attributeFor(element, attr, isTrusting, namespace) {
        return this.delegate.attributeFor(element, attr, isTrusting, namespace);
    };

    return RuntimeEnvironment;
}(EnvironmentImpl);
export function inTransaction(env, cb) {
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
export var DefaultEnvironment = function (_EnvironmentImpl2) {
    _inherits(DefaultEnvironment, _EnvironmentImpl2);

    function DefaultEnvironment(options) {
        _classCallCheck(this, DefaultEnvironment);

        if (!options) {
            var _document = window.document;
            var appendOperations = new DOMTreeConstruction(_document);
            var updateOperations = new DOMChangesImpl(_document);
            options = { appendOperations: appendOperations, updateOperations: updateOperations };
        }
        return _possibleConstructorReturn(this, _EnvironmentImpl2.call(this, options));
    }

    return DefaultEnvironment;
}(EnvironmentImpl);
export default EnvironmentImpl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2Vudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBbUNBLFNBQUEsWUFBQSxRQUFBLG9CQUFBO0FBU0EsU0FBQSxNQUFBLEVBQUEsSUFBQSxRQUFBLGVBQUE7QUFFQSxTQUFBLGNBQUEsRUFBQSxtQkFBQSxRQUFBLGNBQUE7QUFDQSxTQUFBLG9CQUFBLEVBQUEsbUJBQUEsUUFBQSxjQUFBO0FBQ0EsU0FBQSxnQkFBQSxRQUFBLHlCQUFBO0FBQ0EsU0FBQSxrQkFBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLFFBQUEsa0JBQUE7QUFFQSxPQUFNLFNBQUEsZ0JBQUEsQ0FBQSxDQUFBLEVBQXVDO0FBQzNDLFFBQUksTUFBQSxJQUFBLElBQWMsTUFBQSxPQUFBLENBQWxCLENBQWtCLENBQWxCLEVBQW9DLE9BQUEsS0FBQTtBQUNwQyxXQUFBLElBQUE7QUFDRDtBQUVELFdBQU0sU0FBTjtBQXFCRTtBQUNFO0FBREYsU0FBQSxFQUFBLFdBQUE7QUFJRTtBQUpGLGFBQUE7QUFNRTtBQU5GLGNBQUEsRUFPMEQ7QUFBQTs7QUFML0MsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNELGFBQUEsV0FBQSxHQUFBLFdBQUE7QUFFQSxhQUFBLFNBQUEsR0FBQSxTQUFBO0FBRUEsYUFBQSxVQUFBLEdBQUEsVUFBQTtBQUNOOztBQTdCTixjQUNFLElBREYsaUJBQ0UsSUFERixFQUM2RTtBQUFBLFlBQVIsSUFBUSx1RUFBM0UsQ0FBMkU7O0FBQ3pFLFlBQUksT0FBaUMsSUFBQSxLQUFBLENBQVUsT0FBL0MsQ0FBcUMsQ0FBckM7QUFFQSxhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLEtBQWhCLElBQUEsRUFBQSxHQUFBLEVBQWdDO0FBQzlCLGlCQUFBLENBQUEsSUFBQSxtQkFBQTtBQUNEO0FBRUQsZUFBTyxJQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElB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QUFDdEMsWUFBSSxDQUFKLE9BQUEsRUFBYztBQUNaLGdCQUFJLFlBQVcsT0FBZixRQUFBO0FBQ0EsZ0JBQUksbUJBQW1CLElBQUEsbUJBQUEsQ0FBdkIsU0FBdUIsQ0FBdkI7QUFDQSxnQkFBSSxtQkFBbUIsSUFBQSxjQUFBLENBQXZCLFNBQXVCLENBQXZCO0FBQ0Esc0JBQVUsRUFBQSxrQ0FBQSxFQUFWLGtDQUFVLEVBQVY7QUFDRDtBQU5xQyxnREFRdEMsNkJBQUEsT0FBQSxDQVJzQztBQVN2Qzs7QUFWSDtBQUFBLEVBQU0sZUFBTjtBQWFBLGVBQUEsZUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERpY3QsXG4gIERyb3AsXG4gIEVudmlyb25tZW50LFxuICBFbnZpcm9ubWVudE9wdGlvbnMsXG4gIEdsaW1tZXJUcmVlQ2hhbmdlcyxcbiAgR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb24sXG4gIEppdE9yQW90QmxvY2ssXG4gIFBhcnRpYWxTY29wZSxcbiAgU2NvcGUsXG4gIFNjb3BlQmxvY2ssXG4gIFNjb3BlU2xvdCxcbiAgVHJhbnNhY3Rpb24sXG4gIFRyYW5zYWN0aW9uU3ltYm9sLFxuICBDb21waWxlckFydGlmYWN0cyxcbiAgV2l0aENyZWF0ZUluc3RhbmNlLFxuICBSZXNvbHZlZFZhbHVlLFxuICBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSxcbiAgUnVudGltZVByb2dyYW0sXG4gIE1vZGlmaWVyTWFuYWdlcixcbiAgVGVtcGxhdGUsXG4gIEFvdFJ1bnRpbWVSZXNvbHZlcixcbiAgSW52b2NhdGlvbixcbiAgSml0UnVudGltZUNvbnRleHQsXG4gIEFvdFJ1bnRpbWVDb250ZXh0LFxuICBKaXRSdW50aW1lUmVzb2x2ZXIsXG4gIFJ1bnRpbWVSZXNvbHZlcixcbiAgU3ludGF4Q29tcGlsYXRpb25Db250ZXh0LFxuICBSdW50aW1lQ29uc3RhbnRzLFxuICBSdW50aW1lSGVhcCxcbiAgV2hvbGVQcm9ncmFtQ29tcGlsYXRpb25Db250ZXh0LFxuICBDb21waWxlVGltZUNvbnN0YW50cyxcbiAgQ29tcGlsZVRpbWVIZWFwLFxuICBNYWNyb3MsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgSXRlcmFibGVJbXBsLFxuICBJdGVyYWJsZUtleURlZmluaXRpb25zLFxuICBPcGFxdWVJdGVyYWJsZSxcbiAgUGF0aFJlZmVyZW5jZSxcbiAgUmVmZXJlbmNlLFxuICBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLFxuICBWZXJzaW9uZWRSZWZlcmVuY2UsXG59IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBhc3NlcnQsIERST1AsIGV4cGVjdCwgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBBdHRyTmFtZXNwYWNlLCBTaW1wbGVEb2N1bWVudCwgU2ltcGxlRWxlbWVudCB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBET01DaGFuZ2VzSW1wbCwgRE9NVHJlZUNvbnN0cnVjdGlvbiB9IGZyb20gJy4vZG9tL2hlbHBlcic7XG5pbXBvcnQgeyBDb25kaXRpb25hbFJlZmVyZW5jZSwgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4vcmVmZXJlbmNlcyc7XG5pbXBvcnQgeyBEeW5hbWljQXR0cmlidXRlLCBkeW5hbWljQXR0cmlidXRlIH0gZnJvbSAnLi92bS9hdHRyaWJ1dGVzL2R5bmFtaWMnO1xuaW1wb3J0IHsgUnVudGltZVByb2dyYW1JbXBsLCBDb25zdGFudHMsIEhlYXBJbXBsIH0gZnJvbSAnQGdsaW1tZXIvcHJvZ3JhbSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Njb3BlUmVmZXJlbmNlKHM6IFNjb3BlU2xvdCk6IHMgaXMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gIGlmIChzID09PSBudWxsIHx8IEFycmF5LmlzQXJyYXkocykpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBjbGFzcyBTY29wZUltcGw8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IGltcGxlbWVudHMgUGFydGlhbFNjb3BlPEM+IHtcbiAgc3RhdGljIHJvb3Q8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KHNlbGY6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sIHNpemUgPSAwKTogUGFydGlhbFNjb3BlPEM+IHtcbiAgICBsZXQgcmVmczogUGF0aFJlZmVyZW5jZTx1bmtub3duPltdID0gbmV3IEFycmF5KHNpemUgKyAxKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHNpemU7IGkrKykge1xuICAgICAgcmVmc1tpXSA9IFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTY29wZUltcGw8Qz4ocmVmcywgbnVsbCwgbnVsbCwgbnVsbCkuaW5pdCh7IHNlbGYgfSk7XG4gIH1cblxuICBzdGF0aWMgc2l6ZWQ8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KHNpemUgPSAwKTogU2NvcGU8Qz4ge1xuICAgIGxldCByZWZzOiBQYXRoUmVmZXJlbmNlPHVua25vd24+W10gPSBuZXcgQXJyYXkoc2l6ZSArIDEpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gc2l6ZTsgaSsrKSB7XG4gICAgICByZWZzW2ldID0gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFNjb3BlSW1wbChyZWZzLCBudWxsLCBudWxsLCBudWxsKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8vIHRoZSAwdGggc2xvdCBpcyBgc2VsZmBcbiAgICByZWFkb25seSBzbG90czogQXJyYXk8U2NvcGVTbG90PEM+PixcbiAgICBwcml2YXRlIGNhbGxlclNjb3BlOiBPcHRpb248U2NvcGU8Qz4+LFxuICAgIC8vIG5hbWVkIGFyZ3VtZW50cyBhbmQgYmxvY2tzIHBhc3NlZCB0byBhIGxheW91dCB0aGF0IHVzZXMgZXZhbFxuICAgIHByaXZhdGUgZXZhbFNjb3BlOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Qz4+PixcbiAgICAvLyBsb2NhbHMgaW4gc2NvcGUgd2hlbiB0aGUgcGFydGlhbCB3YXMgaW52b2tlZFxuICAgIHByaXZhdGUgcGFydGlhbE1hcDogT3B0aW9uPERpY3Q8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4+XG4gICkge31cblxuICBpbml0KHsgc2VsZiB9OiB7IHNlbGY6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4gfSk6IHRoaXMge1xuICAgIHRoaXMuc2xvdHNbMF0gPSBzZWxmO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0U2VsZigpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5nZXQ8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4oMCk7XG4gIH1cblxuICBnZXRTeW1ib2woc3ltYm9sOiBudW1iZXIpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5nZXQ8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4oc3ltYm9sKTtcbiAgfVxuXG4gIGdldEJsb2NrKHN5bWJvbDogbnVtYmVyKTogT3B0aW9uPFNjb3BlQmxvY2s8Qz4+IHtcbiAgICBsZXQgYmxvY2sgPSB0aGlzLmdldChzeW1ib2wpO1xuICAgIHJldHVybiBibG9jayA9PT0gVU5ERUZJTkVEX1JFRkVSRU5DRSA/IG51bGwgOiAoYmxvY2sgYXMgU2NvcGVCbG9jazxDPik7XG4gIH1cblxuICBnZXRFdmFsU2NvcGUoKTogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEM+Pj4ge1xuICAgIHJldHVybiB0aGlzLmV2YWxTY29wZTtcbiAgfVxuXG4gIGdldFBhcnRpYWxNYXAoKTogT3B0aW9uPERpY3Q8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4+IHtcbiAgICByZXR1cm4gdGhpcy5wYXJ0aWFsTWFwO1xuICB9XG5cbiAgYmluZChzeW1ib2w6IG51bWJlciwgdmFsdWU6IFNjb3BlU2xvdDxDPikge1xuICAgIHRoaXMuc2V0KHN5bWJvbCwgdmFsdWUpO1xuICB9XG5cbiAgYmluZFNlbGYoc2VsZjogUGF0aFJlZmVyZW5jZTx1bmtub3duPikge1xuICAgIHRoaXMuc2V0PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KDAsIHNlbGYpO1xuICB9XG5cbiAgYmluZFN5bWJvbChzeW1ib2w6IG51bWJlciwgdmFsdWU6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4pIHtcbiAgICB0aGlzLnNldChzeW1ib2wsIHZhbHVlKTtcbiAgfVxuXG4gIGJpbmRCbG9jayhzeW1ib2w6IG51bWJlciwgdmFsdWU6IE9wdGlvbjxTY29wZUJsb2NrPEM+Pikge1xuICAgIHRoaXMuc2V0PE9wdGlvbjxTY29wZUJsb2NrPEM+Pj4oc3ltYm9sLCB2YWx1ZSk7XG4gIH1cblxuICBiaW5kRXZhbFNjb3BlKG1hcDogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEM+Pj4pIHtcbiAgICB0aGlzLmV2YWxTY29wZSA9IG1hcDtcbiAgfVxuXG4gIGJpbmRQYXJ0aWFsTWFwKG1hcDogRGljdDxQYXRoUmVmZXJlbmNlPHVua25vd24+Pikge1xuICAgIHRoaXMucGFydGlhbE1hcCA9IG1hcDtcbiAgfVxuXG4gIGJpbmRDYWxsZXJTY29wZShzY29wZTogT3B0aW9uPFNjb3BlPEM+Pik6IHZvaWQge1xuICAgIHRoaXMuY2FsbGVyU2NvcGUgPSBzY29wZTtcbiAgfVxuXG4gIGdldENhbGxlclNjb3BlKCk6IE9wdGlvbjxTY29wZTxDPj4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxlclNjb3BlO1xuICB9XG5cbiAgY2hpbGQoKTogU2NvcGU8Qz4ge1xuICAgIHJldHVybiBuZXcgU2NvcGVJbXBsKHRoaXMuc2xvdHMuc2xpY2UoKSwgdGhpcy5jYWxsZXJTY29wZSwgdGhpcy5ldmFsU2NvcGUsIHRoaXMucGFydGlhbE1hcCk7XG4gIH1cblxuICBwcml2YXRlIGdldDxUIGV4dGVuZHMgU2NvcGVTbG90PEM+PihpbmRleDogbnVtYmVyKTogVCB7XG4gICAgaWYgKGluZGV4ID49IHRoaXMuc2xvdHMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgQlVHOiBjYW5ub3QgZ2V0ICQke2luZGV4fSBmcm9tIHNjb3BlOyBsZW5ndGg9JHt0aGlzLnNsb3RzLmxlbmd0aH1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zbG90c1tpbmRleF0gYXMgVDtcbiAgfVxuXG4gIHByaXZhdGUgc2V0PFQgZXh0ZW5kcyBTY29wZVNsb3Q8Qz4+KGluZGV4OiBudW1iZXIsIHZhbHVlOiBUKTogdm9pZCB7XG4gICAgaWYgKGluZGV4ID49IHRoaXMuc2xvdHMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgQlVHOiBjYW5ub3QgZ2V0ICQke2luZGV4fSBmcm9tIHNjb3BlOyBsZW5ndGg9JHt0aGlzLnNsb3RzLmxlbmd0aH1gKTtcbiAgICB9XG5cbiAgICB0aGlzLnNsb3RzW2luZGV4XSA9IHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBUUkFOU0FDVElPTjogVHJhbnNhY3Rpb25TeW1ib2wgPSAnVFJBTlNBQ1RJT04gW2MzOTM4ODg1LWFiYTAtNDIyZi1iNTQwLTNmZDM0MzFjNzhiNV0nO1xuXG5jbGFzcyBUcmFuc2FjdGlvbkltcGwgaW1wbGVtZW50cyBUcmFuc2FjdGlvbiB7XG4gIHJlYWRvbmx5IFtUUkFOU0FDVElPTl06IE9wdGlvbjxUcmFuc2FjdGlvbkltcGw+O1xuXG4gIHB1YmxpYyBzY2hlZHVsZWRJbnN0YWxsTWFuYWdlcnM6IE1vZGlmaWVyTWFuYWdlcltdID0gW107XG4gIHB1YmxpYyBzY2hlZHVsZWRJbnN0YWxsTW9kaWZpZXJzOiB1bmtub3duW10gPSBbXTtcbiAgcHVibGljIHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnM6IE1vZGlmaWVyTWFuYWdlcltdID0gW107XG4gIHB1YmxpYyBzY2hlZHVsZWRVcGRhdGVNb2RpZmllcnM6IHVua25vd25bXSA9IFtdO1xuICBwdWJsaWMgY3JlYXRlZENvbXBvbmVudHM6IHVua25vd25bXSA9IFtdO1xuICBwdWJsaWMgY3JlYXRlZE1hbmFnZXJzOiBXaXRoQ3JlYXRlSW5zdGFuY2U8dW5rbm93bj5bXSA9IFtdO1xuICBwdWJsaWMgdXBkYXRlZENvbXBvbmVudHM6IHVua25vd25bXSA9IFtdO1xuICBwdWJsaWMgdXBkYXRlZE1hbmFnZXJzOiBXaXRoQ3JlYXRlSW5zdGFuY2U8dW5rbm93bj5bXSA9IFtdO1xuICBwdWJsaWMgZGVzdHJ1Y3RvcnM6IERyb3BbXSA9IFtdO1xuXG4gIGRpZENyZWF0ZShjb21wb25lbnQ6IHVua25vd24sIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSkge1xuICAgIHRoaXMuY3JlYXRlZENvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIHRoaXMuY3JlYXRlZE1hbmFnZXJzLnB1c2gobWFuYWdlcik7XG4gIH1cblxuICBkaWRVcGRhdGUoY29tcG9uZW50OiB1bmtub3duLCBtYW5hZ2VyOiBXaXRoQ3JlYXRlSW5zdGFuY2UpIHtcbiAgICB0aGlzLnVwZGF0ZWRDb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICB0aGlzLnVwZGF0ZWRNYW5hZ2Vycy5wdXNoKG1hbmFnZXIpO1xuICB9XG5cbiAgc2NoZWR1bGVJbnN0YWxsTW9kaWZpZXIobW9kaWZpZXI6IHVua25vd24sIG1hbmFnZXI6IE1vZGlmaWVyTWFuYWdlcikge1xuICAgIHRoaXMuc2NoZWR1bGVkSW5zdGFsbE1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbiAgICB0aGlzLnNjaGVkdWxlZEluc3RhbGxNYW5hZ2Vycy5wdXNoKG1hbmFnZXIpO1xuICB9XG5cbiAgc2NoZWR1bGVVcGRhdGVNb2RpZmllcihtb2RpZmllcjogdW5rbm93biwgbWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyKSB7XG4gICAgdGhpcy5zY2hlZHVsZWRVcGRhdGVNb2RpZmllcnMucHVzaChtb2RpZmllcik7XG4gICAgdGhpcy5zY2hlZHVsZWRVcGRhdGVNb2RpZmllck1hbmFnZXJzLnB1c2gobWFuYWdlcik7XG4gIH1cblxuICBkaWREZXN0cm95KGQ6IERyb3ApIHtcbiAgICB0aGlzLmRlc3RydWN0b3JzLnB1c2goZCk7XG4gIH1cblxuICBjb21taXQoKSB7XG4gICAgbGV0IHsgY3JlYXRlZENvbXBvbmVudHMsIGNyZWF0ZWRNYW5hZ2VycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3JlYXRlZENvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjb21wb25lbnQgPSBjcmVhdGVkQ29tcG9uZW50c1tpXTtcbiAgICAgIGxldCBtYW5hZ2VyID0gY3JlYXRlZE1hbmFnZXJzW2ldO1xuICAgICAgbWFuYWdlci5kaWRDcmVhdGUoY29tcG9uZW50KTtcbiAgICB9XG5cbiAgICBsZXQgeyB1cGRhdGVkQ29tcG9uZW50cywgdXBkYXRlZE1hbmFnZXJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1cGRhdGVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGNvbXBvbmVudCA9IHVwZGF0ZWRDb21wb25lbnRzW2ldO1xuICAgICAgbGV0IG1hbmFnZXIgPSB1cGRhdGVkTWFuYWdlcnNbaV07XG4gICAgICBtYW5hZ2VyLmRpZFVwZGF0ZShjb21wb25lbnQpO1xuICAgIH1cblxuICAgIGxldCB7IGRlc3RydWN0b3JzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXN0cnVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgZGVzdHJ1Y3RvcnNbaV1bRFJPUF0oKTtcbiAgICB9XG5cbiAgICBsZXQgeyBzY2hlZHVsZWRJbnN0YWxsTWFuYWdlcnMsIHNjaGVkdWxlZEluc3RhbGxNb2RpZmllcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjaGVkdWxlZEluc3RhbGxNYW5hZ2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG1vZGlmaWVyID0gc2NoZWR1bGVkSW5zdGFsbE1vZGlmaWVyc1tpXTtcbiAgICAgIGxldCBtYW5hZ2VyID0gc2NoZWR1bGVkSW5zdGFsbE1hbmFnZXJzW2ldO1xuICAgICAgbWFuYWdlci5pbnN0YWxsKG1vZGlmaWVyKTtcbiAgICB9XG5cbiAgICBsZXQgeyBzY2hlZHVsZWRVcGRhdGVNb2RpZmllck1hbmFnZXJzLCBzY2hlZHVsZWRVcGRhdGVNb2RpZmllcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBtb2RpZmllciA9IHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyc1tpXTtcbiAgICAgIGxldCBtYW5hZ2VyID0gc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJNYW5hZ2Vyc1tpXTtcbiAgICAgIG1hbmFnZXIudXBkYXRlKG1vZGlmaWVyKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVG9Cb29sID0gKHZhbHVlOiB1bmtub3duKSA9PiBib29sZWFuO1xuXG5mdW5jdGlvbiB0b0Jvb2wodmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuICEhdmFsdWU7XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnZpcm9ubWVudEltcGwgaW1wbGVtZW50cyBFbnZpcm9ubWVudCB7XG4gIFtUUkFOU0FDVElPTl06IE9wdGlvbjxUcmFuc2FjdGlvbkltcGw+ID0gbnVsbDtcblxuICBwcm90ZWN0ZWQgdXBkYXRlT3BlcmF0aW9uczogR2xpbW1lclRyZWVDaGFuZ2VzO1xuICBwcm90ZWN0ZWQgYXBwZW5kT3BlcmF0aW9uczogR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb247XG5cbiAgY29uc3RydWN0b3IoeyBhcHBlbmRPcGVyYXRpb25zLCB1cGRhdGVPcGVyYXRpb25zIH06IEVudmlyb25tZW50T3B0aW9ucykge1xuICAgIHRoaXMuYXBwZW5kT3BlcmF0aW9ucyA9IGFwcGVuZE9wZXJhdGlvbnM7XG4gICAgdGhpcy51cGRhdGVPcGVyYXRpb25zID0gdXBkYXRlT3BlcmF0aW9ucztcbiAgfVxuXG4gIHRvQ29uZGl0aW9uYWxSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiBSZWZlcmVuY2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxSZWZlcmVuY2UocmVmZXJlbmNlLCB0b0Jvb2wpO1xuICB9XG5cbiAgYWJzdHJhY3QgaXRlcmFibGVGb3IocmVmZXJlbmNlOiBSZWZlcmVuY2UsIGtleTogdW5rbm93bik6IE9wYXF1ZUl0ZXJhYmxlO1xuICBhYnN0cmFjdCBwcm90b2NvbEZvclVSTChzOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgZ2V0QXBwZW5kT3BlcmF0aW9ucygpOiBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kT3BlcmF0aW9ucztcbiAgfVxuICBnZXRET00oKTogR2xpbW1lclRyZWVDaGFuZ2VzIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVPcGVyYXRpb25zO1xuICB9XG5cbiAgYmVnaW4oKSB7XG4gICAgYXNzZXJ0KFxuICAgICAgIXRoaXNbVFJBTlNBQ1RJT05dLFxuICAgICAgJ0EgZ2xpbW1lciB0cmFuc2FjdGlvbiB3YXMgYmVndW4sIGJ1dCBvbmUgYWxyZWFkeSBleGlzdHMuIFlvdSBtYXkgaGF2ZSBhIG5lc3RlZCB0cmFuc2FjdGlvbiwgcG9zc2libHkgY2F1c2VkIGJ5IGFuIGVhcmxpZXIgcnVudGltZSBleGNlcHRpb24gd2hpbGUgcmVuZGVyaW5nLiBQbGVhc2UgY2hlY2sgeW91ciBjb25zb2xlIGZvciB0aGUgc3RhY2sgdHJhY2Ugb2YgYW55IHByaW9yIGV4Y2VwdGlvbnMuJ1xuICAgICk7XG5cbiAgICB0aGlzW1RSQU5TQUNUSU9OXSA9IG5ldyBUcmFuc2FjdGlvbkltcGwoKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHRyYW5zYWN0aW9uKCk6IFRyYW5zYWN0aW9uSW1wbCB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzW1RSQU5TQUNUSU9OXSEsICdtdXN0IGJlIGluIGEgdHJhbnNhY3Rpb24nKTtcbiAgfVxuXG4gIGRpZENyZWF0ZShjb21wb25lbnQ6IHVua25vd24sIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSkge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uZGlkQ3JlYXRlKGNvbXBvbmVudCwgbWFuYWdlcik7XG4gIH1cblxuICBkaWRVcGRhdGUoY29tcG9uZW50OiB1bmtub3duLCBtYW5hZ2VyOiBXaXRoQ3JlYXRlSW5zdGFuY2UpIHtcbiAgICB0aGlzLnRyYW5zYWN0aW9uLmRpZFVwZGF0ZShjb21wb25lbnQsIG1hbmFnZXIpO1xuICB9XG5cbiAgc2NoZWR1bGVJbnN0YWxsTW9kaWZpZXIobW9kaWZpZXI6IHVua25vd24sIG1hbmFnZXI6IE1vZGlmaWVyTWFuYWdlcikge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uc2NoZWR1bGVJbnN0YWxsTW9kaWZpZXIobW9kaWZpZXIsIG1hbmFnZXIpO1xuICB9XG5cbiAgc2NoZWR1bGVVcGRhdGVNb2RpZmllcihtb2RpZmllcjogdW5rbm93biwgbWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5zY2hlZHVsZVVwZGF0ZU1vZGlmaWVyKG1vZGlmaWVyLCBtYW5hZ2VyKTtcbiAgfVxuXG4gIGRpZERlc3Ryb3koZDogRHJvcCkge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uZGlkRGVzdHJveShkKTtcbiAgfVxuXG4gIGNvbW1pdCgpIHtcbiAgICBsZXQgdHJhbnNhY3Rpb24gPSB0aGlzLnRyYW5zYWN0aW9uO1xuICAgIHRoaXNbVFJBTlNBQ1RJT05dID0gbnVsbDtcbiAgICB0cmFuc2FjdGlvbi5jb21taXQoKTtcbiAgfVxuXG4gIGF0dHJpYnV0ZUZvcihcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIGF0dHI6IHN0cmluZyxcbiAgICBfaXNUcnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPiA9IG51bGxcbiAgKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIGR5bmFtaWNBdHRyaWJ1dGUoZWxlbWVudCwgYXR0ciwgbmFtZXNwYWNlKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlIHtcbiAgcHJvdG9jb2xGb3JVUkw/KHVybDogc3RyaW5nKTogc3RyaW5nO1xuICBpdGVyYWJsZT86IEl0ZXJhYmxlS2V5RGVmaW5pdGlvbnM7XG4gIHRvQm9vbD8odmFsdWU6IHVua25vd24pOiBib29sZWFuO1xuICBhdHRyaWJ1dGVGb3I/KFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgYXR0cjogc3RyaW5nLFxuICAgIGlzVHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbiAgKTogRHluYW1pY0F0dHJpYnV0ZTtcbn1cblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlIHtcbiAgcmVhZG9ubHkgdG9Cb29sOiAodmFsdWU6IHVua25vd24pID0+IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUgPSB7fSkge1xuICAgIGlmIChpbm5lci50b0Jvb2wpIHtcbiAgICAgIHRoaXMudG9Cb29sID0gaW5uZXIudG9Cb29sO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRvQm9vbCA9IHZhbHVlID0+ICEhdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHJvdG9jb2xGb3JVUkwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmlubmVyLnByb3RvY29sRm9yVVJMKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbm5lci5wcm90b2NvbEZvclVSTCh1cmwpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIFVSTCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIFVSTCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBsZWdhY3lQcm90b2NvbEZvclVSTCh1cmwpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIG5ldyBVUkwodXJsLCBkb2N1bWVudC5iYXNlVVJJKS5wcm90b2NvbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBVUkwodXJsLCAnaHR0cHM6Ly93d3cuZXhhbXBsZS5jb20nKS5wcm90b2NvbDtcbiAgICB9XG4gIH1cblxuICBhdHRyaWJ1dGVGb3IoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBhdHRyOiBzdHJpbmcsXG4gICAgaXNUcnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPlxuICApOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgICBpZiAodGhpcy5pbm5lci5hdHRyaWJ1dGVGb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmlubmVyLmF0dHJpYnV0ZUZvcihlbGVtZW50LCBhdHRyLCBpc1RydXN0aW5nLCBuYW1lc3BhY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZHluYW1pY0F0dHJpYnV0ZShlbGVtZW50LCBhdHRyLCBuYW1lc3BhY2UpO1xuICAgIH1cbiAgfVxuXG4gIHJlYWRvbmx5IGl0ZXJhYmxlOiBJdGVyYWJsZUtleURlZmluaXRpb25zID0ge1xuICAgIG5hbWVkOiB7XG4gICAgICAnQGluZGV4JzogKF8sIGluZGV4KSA9PiBTdHJpbmcoaW5kZXgpLFxuICAgICAgJ0BwcmltaXRpdmUnOiBpdGVtID0+IFN0cmluZyhpdGVtKSxcbiAgICAgICdAaWRlbnRpdHknOiBpdGVtID0+IGl0ZW0sXG4gICAgfSxcbiAgICBkZWZhdWx0OiBrZXkgPT4gaXRlbSA9PiBpdGVtW2tleV0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGxlZ2FjeVByb3RvY29sRm9yVVJMKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbGV0IG1hdGNoID0gL14oW2Etel1bYS16MC05ListXSo6KT8oXFwvXFwvKT8oW1xcU1xcc10qKS9pLmV4ZWModXJsKTtcbiAgICByZXR1cm4gbWF0Y2ggJiYgbWF0Y2hbMV0gPyBtYXRjaFsxXS50b0xvd2VyQ2FzZSgpIDogJyc7XG4gIH1cblxuICBsZXQgYW5jaG9yID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgYW5jaG9yLmhyZWYgPSB1cmw7XG4gIHJldHVybiBhbmNob3IucHJvdG9jb2w7XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UnVudGltZVJlc29sdmVyPFIgZXh0ZW5kcyB7IG1vZHVsZTogc3RyaW5nIH0+XG4gIGltcGxlbWVudHMgSml0UnVudGltZVJlc29sdmVyPFI+LCBBb3RSdW50aW1lUmVzb2x2ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSkge31cblxuICBsb29rdXBDb21wb25lbnQobmFtZTogc3RyaW5nLCByZWZlcnJlcj86IHVua25vd24pOiBPcHRpb248YW55PiB7XG4gICAgaWYgKHRoaXMuaW5uZXIubG9va3VwQ29tcG9uZW50KSB7XG4gICAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5pbm5lci5sb29rdXBDb21wb25lbnQobmFtZSwgcmVmZXJyZXIpO1xuXG4gICAgICBpZiAoY29tcG9uZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIGNvbXBvbmVudCAke25hbWV9IChmcm9tICR7cmVmZXJyZXJ9KSAobG9va3VwQ29tcG9uZW50IHJldHVybmVkIHVuZGVmaW5lZClgXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbG9va3VwQ29tcG9uZW50IG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG5cbiAgbG9va3VwUGFydGlhbChuYW1lOiBzdHJpbmcsIHJlZmVycmVyPzogdW5rbm93bik6IE9wdGlvbjxudW1iZXI+IHtcbiAgICBpZiAodGhpcy5pbm5lci5sb29rdXBQYXJ0aWFsKSB7XG4gICAgICBsZXQgcGFydGlhbCA9IHRoaXMuaW5uZXIubG9va3VwUGFydGlhbChuYW1lLCByZWZlcnJlcik7XG5cbiAgICAgIGlmIChwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIHBhcnRpYWwgJHtuYW1lfSAoZnJvbSAke3JlZmVycmVyfSkgKGxvb2t1cFBhcnRpYWwgcmV0dXJuZWQgdW5kZWZpbmVkKWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnRpYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbG9va3VwUGFydGlhbCBub3QgaW1wbGVtZW50ZWQgb24gUnVudGltZVJlc29sdmVyLicpO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmU8VSBleHRlbmRzIFJlc29sdmVkVmFsdWU+KGhhbmRsZTogbnVtYmVyKTogVSB7XG4gICAgaWYgKHRoaXMuaW5uZXIucmVzb2x2ZSkge1xuICAgICAgbGV0IHJlc29sdmVkID0gdGhpcy5pbm5lci5yZXNvbHZlKGhhbmRsZSk7XG5cbiAgICAgIGlmIChyZXNvbHZlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBoYW5kbGUgJHtoYW5kbGV9IChyZXNvbHZlIHJldHVybmVkIHVuZGVmaW5lZClgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdmVkIGFzIFU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVzb2x2ZSBub3QgaW1wbGVtZW50ZWQgb24gUnVudGltZVJlc29sdmVyLicpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBpbGFibGUobG9jYXRvcjogeyBtb2R1bGU6IHN0cmluZyB9KTogVGVtcGxhdGUge1xuICAgIGlmICh0aGlzLmlubmVyLmNvbXBpbGFibGUpIHtcbiAgICAgIGxldCByZXNvbHZlZCA9IHRoaXMuaW5uZXIuY29tcGlsYWJsZShsb2NhdG9yKTtcblxuICAgICAgaWYgKHJlc29sdmVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY29tcGlsZSAke25hbWV9IChjb21waWxhYmxlIHJldHVybmVkIHVuZGVmaW5lZClgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbXBpbGFibGUgbm90IGltcGxlbWVudGVkIG9uIFJ1bnRpbWVSZXNvbHZlci4nKTtcbiAgICB9XG4gIH1cblxuICBnZXRJbnZvY2F0aW9uKGxvY2F0b3I6IFIpOiBJbnZvY2F0aW9uIHtcbiAgICBpZiAodGhpcy5pbm5lci5nZXRJbnZvY2F0aW9uKSB7XG4gICAgICBsZXQgaW52b2NhdGlvbiA9IHRoaXMuaW5uZXIuZ2V0SW52b2NhdGlvbihsb2NhdG9yKTtcblxuICAgICAgaWYgKGludm9jYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBnZXQgaW52b2NhdGlvbiBmb3IgJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgIGxvY2F0b3JcbiAgICAgICAgICApfSAoZ2V0SW52b2NhdGlvbiByZXR1cm5lZCB1bmRlZmluZWQpYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW52b2NhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXRJbnZvY2F0aW9uIG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBb3RSdW50aW1lKFxuICBkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQsXG4gIHByb2dyYW06IENvbXBpbGVyQXJ0aWZhY3RzLFxuICByZXNvbHZlcjogUnVudGltZVJlc29sdmVyRGVsZWdhdGUgPSB7fSxcbiAgZGVsZWdhdGU6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlID0ge31cbik6IEFvdFJ1bnRpbWVDb250ZXh0IHtcbiAgbGV0IGVudiA9IG5ldyBSdW50aW1lRW52aXJvbm1lbnQoZG9jdW1lbnQsIG5ldyBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGwoZGVsZWdhdGUpKTtcblxuICByZXR1cm4ge1xuICAgIGVudixcbiAgICByZXNvbHZlcjogbmV3IERlZmF1bHRSdW50aW1lUmVzb2x2ZXIocmVzb2x2ZXIpLFxuICAgIHByb2dyYW06IFJ1bnRpbWVQcm9ncmFtSW1wbC5oeWRyYXRlKHByb2dyYW0pLFxuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEppdFByb2dyYW1Db21waWxhdGlvbkNvbnRleHQgZXh0ZW5kcyBXaG9sZVByb2dyYW1Db21waWxhdGlvbkNvbnRleHQge1xuICByZWFkb25seSBjb25zdGFudHM6IENvbXBpbGVUaW1lQ29uc3RhbnRzICYgUnVudGltZUNvbnN0YW50cztcbiAgcmVhZG9ubHkgaGVhcDogQ29tcGlsZVRpbWVIZWFwICYgUnVudGltZUhlYXA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSml0U3ludGF4Q29tcGlsYXRpb25Db250ZXh0IGV4dGVuZHMgU3ludGF4Q29tcGlsYXRpb25Db250ZXh0IHtcbiAgcmVhZG9ubHkgcHJvZ3JhbTogSml0UHJvZ3JhbUNvbXBpbGF0aW9uQ29udGV4dDtcbiAgcmVhZG9ubHkgbWFjcm9zOiBNYWNyb3M7XG59XG5cbi8vIFRPRE86IFRoZXJlIGFyZSBhIGxvdCBvZiB2YXJpYW50cyBoZXJlLiBTb21lIGFyZSBoZXJlIGZvciB0cmFuc2l0aW9uYWwgcHVycG9zZXNcbi8vIGFuZCBzb21lIG1pZ2h0IGJlIEdDYWJsZSBvbmNlIHRoZSBkZXNpZ24gc3RhYmlsaXplcy5cbmV4cG9ydCBmdW5jdGlvbiBDdXN0b21KaXRSdW50aW1lKFxuICByZXNvbHZlcjogUnVudGltZVJlc29sdmVyLFxuICBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHQgJiB7XG4gICAgcHJvZ3JhbTogeyBjb25zdGFudHM6IFJ1bnRpbWVDb25zdGFudHM7IGhlYXA6IFJ1bnRpbWVIZWFwIH07XG4gIH0sXG4gIGVudjogRW52aXJvbm1lbnRcbik6IEppdFJ1bnRpbWVDb250ZXh0IHtcbiAgbGV0IHByb2dyYW0gPSBuZXcgUnVudGltZVByb2dyYW1JbXBsKGNvbnRleHQucHJvZ3JhbS5jb25zdGFudHMsIGNvbnRleHQucHJvZ3JhbS5oZWFwKTtcblxuICByZXR1cm4ge1xuICAgIGVudixcbiAgICByZXNvbHZlcjogbmV3IERlZmF1bHRSdW50aW1lUmVzb2x2ZXIocmVzb2x2ZXIpLFxuICAgIHByb2dyYW0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBKaXRSdW50aW1lKFxuICBkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQsXG4gIHJlc29sdmVyOiBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSA9IHt9LFxuICBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUgPSB7fVxuKTogSml0UnVudGltZUNvbnRleHQge1xuICBsZXQgZW52ID0gbmV3IFJ1bnRpbWVFbnZpcm9ubWVudChkb2N1bWVudCwgbmV3IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbChkZWxlZ2F0ZSkpO1xuXG4gIGxldCBjb25zdGFudHMgPSBuZXcgQ29uc3RhbnRzKCk7XG4gIGxldCBoZWFwID0gbmV3IEhlYXBJbXBsKCk7XG4gIGxldCBwcm9ncmFtID0gbmV3IFJ1bnRpbWVQcm9ncmFtSW1wbChjb25zdGFudHMsIGhlYXApO1xuXG4gIHJldHVybiB7XG4gICAgZW52LFxuICAgIHJlc29sdmVyOiBuZXcgRGVmYXVsdFJ1bnRpbWVSZXNvbHZlcihyZXNvbHZlciksXG4gICAgcHJvZ3JhbSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEppdFJ1bnRpbWVGcm9tUHJvZ3JhbShcbiAgZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50LFxuICBwcm9ncmFtOiBSdW50aW1lUHJvZ3JhbSxcbiAgcmVzb2x2ZXI6IFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlID0ge30sXG4gIGRlbGVnYXRlOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSA9IHt9XG4pOiBKaXRSdW50aW1lQ29udGV4dCB7XG4gIGxldCBlbnYgPSBuZXcgUnVudGltZUVudmlyb25tZW50KGRvY3VtZW50LCBuZXcgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKGRlbGVnYXRlKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBlbnYsXG4gICAgcmVzb2x2ZXI6IG5ldyBEZWZhdWx0UnVudGltZVJlc29sdmVyKHJlc29sdmVyKSxcbiAgICBwcm9ncmFtLFxuICB9O1xufVxuXG5leHBvcnQgY2xhc3MgUnVudGltZUVudmlyb25tZW50IGV4dGVuZHMgRW52aXJvbm1lbnRJbXBsIHtcbiAgcHJpdmF0ZSBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsO1xuXG4gIGNvbnN0cnVjdG9yKGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCwgZGVsZWdhdGU6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbCkge1xuICAgIHN1cGVyKHtcbiAgICAgIGFwcGVuZE9wZXJhdGlvbnM6IG5ldyBET01UcmVlQ29uc3RydWN0aW9uKGRvY3VtZW50KSxcbiAgICAgIHVwZGF0ZU9wZXJhdGlvbnM6IG5ldyBET01DaGFuZ2VzSW1wbChkb2N1bWVudCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmRlbGVnYXRlID0gbmV3IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbChkZWxlZ2F0ZSk7XG4gIH1cblxuICBwcm90b2NvbEZvclVSTCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUucHJvdG9jb2xGb3JVUkwodXJsKTtcbiAgfVxuXG4gIGl0ZXJhYmxlRm9yKHJlZjogUmVmZXJlbmNlLCBpbnB1dEtleTogdW5rbm93bik6IE9wYXF1ZUl0ZXJhYmxlIHtcbiAgICBsZXQga2V5ID0gU3RyaW5nKGlucHV0S2V5KTtcbiAgICBsZXQgZGVmID0gdGhpcy5kZWxlZ2F0ZS5pdGVyYWJsZTtcblxuICAgIGxldCBrZXlGb3IgPSBrZXkgaW4gZGVmLm5hbWVkID8gZGVmLm5hbWVkW2tleV0gOiBkZWYuZGVmYXVsdChrZXkpO1xuXG4gICAgcmV0dXJuIG5ldyBJdGVyYWJsZUltcGwocmVmLCBrZXlGb3IpO1xuICB9XG5cbiAgdG9Db25kaXRpb25hbFJlZmVyZW5jZShpbnB1dDogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSk6IFZlcnNpb25lZFJlZmVyZW5jZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBDb25kaXRpb25hbFJlZmVyZW5jZShpbnB1dCwgdGhpcy5kZWxlZ2F0ZS50b0Jvb2wpO1xuICB9XG5cbiAgYXR0cmlidXRlRm9yKFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgYXR0cjogc3RyaW5nLFxuICAgIGlzVHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbiAgKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUuYXR0cmlidXRlRm9yKGVsZW1lbnQsIGF0dHIsIGlzVHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluVHJhbnNhY3Rpb24oZW52OiBFbnZpcm9ubWVudCwgY2I6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgaWYgKCFlbnZbVFJBTlNBQ1RJT05dKSB7XG4gICAgZW52LmJlZ2luKCk7XG4gICAgdHJ5IHtcbiAgICAgIGNiKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGVudi5jb21taXQoKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY2IoKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRGVmYXVsdEVudmlyb25tZW50IGV4dGVuZHMgRW52aXJvbm1lbnRJbXBsIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IEVudmlyb25tZW50T3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgbGV0IGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50IGFzIFNpbXBsZURvY3VtZW50O1xuICAgICAgbGV0IGFwcGVuZE9wZXJhdGlvbnMgPSBuZXcgRE9NVHJlZUNvbnN0cnVjdGlvbihkb2N1bWVudCk7XG4gICAgICBsZXQgdXBkYXRlT3BlcmF0aW9ucyA9IG5ldyBET01DaGFuZ2VzSW1wbChkb2N1bWVudCk7XG4gICAgICBvcHRpb25zID0geyBhcHBlbmRPcGVyYXRpb25zLCB1cGRhdGVPcGVyYXRpb25zIH07XG4gICAgfVxuXG4gICAgc3VwZXIob3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRW52aXJvbm1lbnRJbXBsO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==