'use strict';

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

var _reference = require('@glimmer/reference');

var _util = require('@glimmer/util');

var _helper = require('./dom/helper');

var _references = require('./references');

var _dynamic = require('./vm/attributes/dynamic');

var _program = require('@glimmer/program');

var _a;
function isScopeReference(s) {
    if (s === null || Array.isArray(s)) return false;
    return true;
}
class ScopeImpl {
    constructor(
    // the 0th slot is `self`
    slots, callerScope,
    // named arguments and blocks passed to a layout that uses eval
    evalScope,
    // locals in scope when the partial was invoked
    partialMap) {
        this.slots = slots;
        this.callerScope = callerScope;
        this.evalScope = evalScope;
        this.partialMap = partialMap;
    }
    static root(self, size = 0) {
        let refs = new Array(size + 1);
        for (let i = 0; i <= size; i++) {
            refs[i] = _references.UNDEFINED_REFERENCE;
        }
        return new ScopeImpl(refs, null, null, null).init({ self });
    }
    static sized(size = 0) {
        let refs = new Array(size + 1);
        for (let i = 0; i <= size; i++) {
            refs[i] = _references.UNDEFINED_REFERENCE;
        }
        return new ScopeImpl(refs, null, null, null);
    }
    init({ self }) {
        this.slots[0] = self;
        return this;
    }
    getSelf() {
        return this.get(0);
    }
    getSymbol(symbol) {
        return this.get(symbol);
    }
    getBlock(symbol) {
        let block = this.get(symbol);
        return block === _references.UNDEFINED_REFERENCE ? null : block;
    }
    getEvalScope() {
        return this.evalScope;
    }
    getPartialMap() {
        return this.partialMap;
    }
    bind(symbol, value) {
        this.set(symbol, value);
    }
    bindSelf(self) {
        this.set(0, self);
    }
    bindSymbol(symbol, value) {
        this.set(symbol, value);
    }
    bindBlock(symbol, value) {
        this.set(symbol, value);
    }
    bindEvalScope(map) {
        this.evalScope = map;
    }
    bindPartialMap(map) {
        this.partialMap = map;
    }
    bindCallerScope(scope) {
        this.callerScope = scope;
    }
    getCallerScope() {
        return this.callerScope;
    }
    child() {
        return new ScopeImpl(this.slots.slice(), this.callerScope, this.evalScope, this.partialMap);
    }
    get(index) {
        if (index >= this.slots.length) {
            throw new RangeError(`BUG: cannot get $${index} from scope; length=${this.slots.length}`);
        }
        return this.slots[index];
    }
    set(index, value) {
        if (index >= this.slots.length) {
            throw new RangeError(`BUG: cannot get $${index} from scope; length=${this.slots.length}`);
        }
        this.slots[index] = value;
    }
}
exports.ScopeImpl = ScopeImpl;
const TRANSACTION = exports.TRANSACTION = 'TRANSACTION [c3938885-aba0-422f-b540-3fd3431c78b5]';
class TransactionImpl {
    constructor() {
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
    didCreate(component, manager) {
        this.createdComponents.push(component);
        this.createdManagers.push(manager);
    }
    didUpdate(component, manager) {
        this.updatedComponents.push(component);
        this.updatedManagers.push(manager);
    }
    scheduleInstallModifier(modifier, manager) {
        this.scheduledInstallModifiers.push(modifier);
        this.scheduledInstallManagers.push(manager);
    }
    scheduleUpdateModifier(modifier, manager) {
        this.scheduledUpdateModifiers.push(modifier);
        this.scheduledUpdateModifierManagers.push(manager);
    }
    didDestroy(d) {
        this.destructors.push(d);
    }
    commit() {
        let { createdComponents, createdManagers } = this;
        for (let i = 0; i < createdComponents.length; i++) {
            let component = createdComponents[i];
            let manager = createdManagers[i];
            manager.didCreate(component);
        }
        let { updatedComponents, updatedManagers } = this;
        for (let i = 0; i < updatedComponents.length; i++) {
            let component = updatedComponents[i];
            let manager = updatedManagers[i];
            manager.didUpdate(component);
        }
        let { destructors } = this;
        for (let i = 0; i < destructors.length; i++) {
            destructors[i][_util.DROP]();
        }
        let { scheduledInstallManagers, scheduledInstallModifiers } = this;
        for (let i = 0; i < scheduledInstallManagers.length; i++) {
            let modifier = scheduledInstallModifiers[i];
            let manager = scheduledInstallManagers[i];
            manager.install(modifier);
        }
        let { scheduledUpdateModifierManagers, scheduledUpdateModifiers } = this;
        for (let i = 0; i < scheduledUpdateModifierManagers.length; i++) {
            let modifier = scheduledUpdateModifiers[i];
            let manager = scheduledUpdateModifierManagers[i];
            manager.update(modifier);
        }
    }
}
function toBool(value) {
    return !!value;
}
class EnvironmentImpl {
    constructor({ appendOperations, updateOperations }) {
        this[_a] = null;
        this.appendOperations = appendOperations;
        this.updateOperations = updateOperations;
    }
    toConditionalReference(reference) {
        return new _references.ConditionalReference(reference, toBool);
    }
    getAppendOperations() {
        return this.appendOperations;
    }
    getDOM() {
        return this.updateOperations;
    }
    begin() {
        false && (0, _util.assert)(!this[TRANSACTION], 'A glimmer transaction was begun, but one already exists. You may have a nested transaction, possibly caused by an earlier runtime exception while rendering. Please check your console for the stack trace of any prior exceptions.');

        this[TRANSACTION] = new TransactionImpl();
    }
    get transaction() {
        return this[TRANSACTION];
    }
    didCreate(component, manager) {
        this.transaction.didCreate(component, manager);
    }
    didUpdate(component, manager) {
        this.transaction.didUpdate(component, manager);
    }
    scheduleInstallModifier(modifier, manager) {
        this.transaction.scheduleInstallModifier(modifier, manager);
    }
    scheduleUpdateModifier(modifier, manager) {
        this.transaction.scheduleUpdateModifier(modifier, manager);
    }
    didDestroy(d) {
        this.transaction.didDestroy(d);
    }
    commit() {
        let transaction = this.transaction;
        this[TRANSACTION] = null;
        transaction.commit();
    }
    attributeFor(element, attr, _isTrusting, namespace = null) {
        return (0, _dynamic.dynamicAttribute)(element, attr, namespace);
    }
}
exports.EnvironmentImpl = EnvironmentImpl;
_a = TRANSACTION;
class RuntimeEnvironmentDelegateImpl {
    constructor(inner = {}) {
        this.inner = inner;
        this.iterable = {
            named: {
                '@index': (_, index) => String(index),
                '@primitive': item => String(item),
                '@identity': item => item
            },
            default: key => item => item[key]
        };
        if (inner.toBool) {
            this.toBool = inner.toBool;
        } else {
            this.toBool = value => !!value;
        }
    }
    protocolForURL(url) {
        if (this.inner.protocolForURL) {
            return this.inner.protocolForURL(url);
        } else if (typeof URL === 'object' || typeof URL === 'undefined') {
            return legacyProtocolForURL(url);
        } else if (typeof document !== 'undefined') {
            return new URL(url, document.baseURI).protocol;
        } else {
            return new URL(url, 'https://www.example.com').protocol;
        }
    }
    attributeFor(element, attr, isTrusting, namespace) {
        if (this.inner.attributeFor) {
            return this.inner.attributeFor(element, attr, isTrusting, namespace);
        } else {
            return (0, _dynamic.dynamicAttribute)(element, attr, namespace);
        }
    }
}
exports.RuntimeEnvironmentDelegateImpl = RuntimeEnvironmentDelegateImpl;
function legacyProtocolForURL(url) {
    if (typeof window === 'undefined') {
        let match = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i.exec(url);
        return match && match[1] ? match[1].toLowerCase() : '';
    }
    let anchor = window.document.createElement('a');
    anchor.href = url;
    return anchor.protocol;
}
class DefaultRuntimeResolver {
    constructor(inner) {
        this.inner = inner;
    }
    lookupComponent(name, referrer) {
        if (this.inner.lookupComponent) {
            let component = this.inner.lookupComponent(name, referrer);
            if (component === undefined) {
                throw new Error(`Unexpected component ${name} (from ${referrer}) (lookupComponent returned undefined)`);
            }
            return component;
        } else {
            throw new Error('lookupComponent not implemented on RuntimeResolver.');
        }
    }
    lookupPartial(name, referrer) {
        if (this.inner.lookupPartial) {
            let partial = this.inner.lookupPartial(name, referrer);
            if (partial === undefined) {
                throw new Error(`Unexpected partial ${name} (from ${referrer}) (lookupPartial returned undefined)`);
            }
            return partial;
        } else {
            throw new Error('lookupPartial not implemented on RuntimeResolver.');
        }
    }
    resolve(handle) {
        if (this.inner.resolve) {
            let resolved = this.inner.resolve(handle);
            if (resolved === undefined) {
                throw new Error(`Unexpected handle ${handle} (resolve returned undefined)`);
            }
            return resolved;
        } else {
            throw new Error('resolve not implemented on RuntimeResolver.');
        }
    }
    compilable(locator) {
        if (this.inner.compilable) {
            let resolved = this.inner.compilable(locator);
            if (resolved === undefined) {
                throw new Error(`Unable to compile ${name} (compilable returned undefined)`);
            }
            return resolved;
        } else {
            throw new Error('compilable not implemented on RuntimeResolver.');
        }
    }
    getInvocation(locator) {
        if (this.inner.getInvocation) {
            let invocation = this.inner.getInvocation(locator);
            if (invocation === undefined) {
                throw new Error(`Unable to get invocation for ${JSON.stringify(locator)} (getInvocation returned undefined)`);
            }
            return invocation;
        } else {
            throw new Error('getInvocation not implemented on RuntimeResolver.');
        }
    }
}
exports.DefaultRuntimeResolver = DefaultRuntimeResolver;
function AotRuntime(document, program, resolver = {}, delegate = {}) {
    let env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    return {
        env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: _program.RuntimeProgramImpl.hydrate(program)
    };
}
// TODO: There are a lot of variants here. Some are here for transitional purposes
// and some might be GCable once the design stabilizes.
function CustomJitRuntime(resolver, context, env) {
    let program = new _program.RuntimeProgramImpl(context.program.constants, context.program.heap);
    return {
        env,
        resolver: new DefaultRuntimeResolver(resolver),
        program
    };
}
function JitRuntime(document, resolver = {}, delegate = {}) {
    let env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    let constants = new _program.Constants();
    let heap = new _program.HeapImpl();
    let program = new _program.RuntimeProgramImpl(constants, heap);
    return {
        env,
        resolver: new DefaultRuntimeResolver(resolver),
        program
    };
}
function JitRuntimeFromProgram(document, program, resolver = {}, delegate = {}) {
    let env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    return {
        env,
        resolver: new DefaultRuntimeResolver(resolver),
        program
    };
}
class RuntimeEnvironment extends EnvironmentImpl {
    constructor(document, delegate) {
        super({
            appendOperations: new _helper.DOMTreeConstruction(document),
            updateOperations: new _helper.DOMChangesImpl(document)
        });
        this.delegate = new RuntimeEnvironmentDelegateImpl(delegate);
    }
    protocolForURL(url) {
        return this.delegate.protocolForURL(url);
    }
    iterableFor(ref, inputKey) {
        let key = String(inputKey);
        let def = this.delegate.iterable;
        let keyFor = key in def.named ? def.named[key] : def.default(key);
        return new _reference.IterableImpl(ref, keyFor);
    }
    toConditionalReference(input) {
        return new _references.ConditionalReference(input, this.delegate.toBool);
    }
    attributeFor(element, attr, isTrusting, namespace) {
        return this.delegate.attributeFor(element, attr, isTrusting, namespace);
    }
}
exports.RuntimeEnvironment = RuntimeEnvironment;
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
class DefaultEnvironment extends EnvironmentImpl {
    constructor(options) {
        if (!options) {
            let document = window.document;
            let appendOperations = new _helper.DOMTreeConstruction(document);
            let updateOperations = new _helper.DOMChangesImpl(document);
            options = { appendOperations, updateOperations };
        }
        super(options);
    }
}
exports.DefaultEnvironment = DefaultEnvironment;
exports.default = EnvironmentImpl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2Vudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQW1ETSxnQixHQUFBLGdCO1FBMmFBLFUsR0FBQSxVO1FBMkJBLGdCLEdBQUEsZ0I7UUFnQkEsVSxHQUFBLFU7UUFrQkEscUIsR0FBQSxxQjtRQXNEQSxhLEdBQUEsYTs7QUE5aUJOOztBQVNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7QUFFTSxTQUFBLGdCQUFBLENBQUEsQ0FBQSxFQUF1QztBQUMzQyxRQUFJLE1BQUEsSUFBQSxJQUFjLE1BQUEsT0FBQSxDQUFsQixDQUFrQixDQUFsQixFQUFvQyxPQUFBLEtBQUE7QUFDcEMsV0FBQSxJQUFBO0FBQ0Q7QUFFSyxNQUFBLFNBQUEsQ0FBZ0I7QUFxQnBCO0FBQ0U7QUFERixTQUFBLEVBQUEsV0FBQTtBQUlFO0FBSkYsYUFBQTtBQU1FO0FBTkYsY0FBQSxFQU8wRDtBQUwvQyxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0QsYUFBQSxXQUFBLEdBQUEsV0FBQTtBQUVBLGFBQUEsU0FBQSxHQUFBLFNBQUE7QUFFQSxhQUFBLFVBQUEsR0FBQSxVQUFBO0FBQ047QUE1QkosV0FBQSxJQUFBLENBQUEsSUFBQSxFQUFtRSxPQUFuRSxDQUFBLEVBQTJFO0FBQ3pFLFlBQUksT0FBaUMsSUFBQSxLQUFBLENBQVUsT0FBL0MsQ0FBcUMsQ0FBckM7QUFFQSxhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLEtBQWhCLElBQUEsRUFBQSxHQUFBLEVBQWdDO0FBQzlCLGlCQUFBLENBQUEsSUFBQSwrQkFBQTtBQUNEO0FBRUQsZUFBTyxJQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxDQUE4QyxFQUFyRCxJQUFxRCxFQUE5QyxDQUFQO0FBQ0Q7QUFFRCxXQUFBLEtBQUEsQ0FBc0MsT0FBdEMsQ0FBQSxFQUE4QztBQUM1QyxZQUFJLE9BQWlDLElBQUEsS0FBQSxDQUFVLE9BQS9DLENBQXFDLENBQXJDO0FBRUEsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixLQUFoQixJQUFBLEVBQUEsR0FBQSxFQUFnQztBQUM5QixpQkFBQSxDQUFBLElBQUEsK0JBQUE7QUFDRDtBQUVELGVBQU8sSUFBQSxTQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFZRCxTQUFLLEVBQUwsSUFBSyxFQUFMLEVBQStDO0FBQzdDLGFBQUEsS0FBQSxDQUFBLENBQUEsSUFBQSxJQUFBO0FBQ0EsZUFBQSxJQUFBO0FBQ0Q7QUFFRCxjQUFPO0FBQ0wsZUFBTyxLQUFBLEdBQUEsQ0FBUCxDQUFPLENBQVA7QUFDRDtBQUVELGNBQUEsTUFBQSxFQUF3QjtBQUN0QixlQUFPLEtBQUEsR0FBQSxDQUFQLE1BQU8sQ0FBUDtBQUNEO0FBRUQsYUFBQSxNQUFBLEVBQXVCO0FBQ3JCLFlBQUksUUFBUSxLQUFBLEdBQUEsQ0FBWixNQUFZLENBQVo7QUFDQSxlQUFPLFVBQUEsK0JBQUEsR0FBQSxJQUFBLEdBQVAsS0FBQTtBQUNEO0FBRUQsbUJBQVk7QUFDVixlQUFPLEtBQVAsU0FBQTtBQUNEO0FBRUQsb0JBQWE7QUFDWCxlQUFPLEtBQVAsVUFBQTtBQUNEO0FBRUQsU0FBQSxNQUFBLEVBQUEsS0FBQSxFQUF3QztBQUN0QyxhQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsS0FBQTtBQUNEO0FBRUQsYUFBQSxJQUFBLEVBQXFDO0FBQ25DLGFBQUEsR0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBO0FBQ0Q7QUFFRCxlQUFBLE1BQUEsRUFBQSxLQUFBLEVBQXdEO0FBQ3RELGFBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxLQUFBO0FBQ0Q7QUFFRCxjQUFBLE1BQUEsRUFBQSxLQUFBLEVBQXNEO0FBQ3BELGFBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxLQUFBO0FBQ0Q7QUFFRCxrQkFBQSxHQUFBLEVBQTZDO0FBQzNDLGFBQUEsU0FBQSxHQUFBLEdBQUE7QUFDRDtBQUVELG1CQUFBLEdBQUEsRUFBZ0Q7QUFDOUMsYUFBQSxVQUFBLEdBQUEsR0FBQTtBQUNEO0FBRUQsb0JBQUEsS0FBQSxFQUF1QztBQUNyQyxhQUFBLFdBQUEsR0FBQSxLQUFBO0FBQ0Q7QUFFRCxxQkFBYztBQUNaLGVBQU8sS0FBUCxXQUFBO0FBQ0Q7QUFFRCxZQUFLO0FBQ0gsZUFBTyxJQUFBLFNBQUEsQ0FBYyxLQUFBLEtBQUEsQ0FBZCxLQUFjLEVBQWQsRUFBa0MsS0FBbEMsV0FBQSxFQUFvRCxLQUFwRCxTQUFBLEVBQW9FLEtBQTNFLFVBQU8sQ0FBUDtBQUNEO0FBRU8sUUFBQSxLQUFBLEVBQXlDO0FBQy9DLFlBQUksU0FBUyxLQUFBLEtBQUEsQ0FBYixNQUFBLEVBQWdDO0FBQzlCLGtCQUFNLElBQUEsVUFBQSxDQUFlLG9CQUFvQixLQUFLLHVCQUF1QixLQUFBLEtBQUEsQ0FBVyxNQUFoRixFQUFNLENBQU47QUFDRDtBQUVELGVBQU8sS0FBQSxLQUFBLENBQVAsS0FBTyxDQUFQO0FBQ0Q7QUFFTyxRQUFBLEtBQUEsRUFBQSxLQUFBLEVBQW1EO0FBQ3pELFlBQUksU0FBUyxLQUFBLEtBQUEsQ0FBYixNQUFBLEVBQWdDO0FBQzlCLGtCQUFNLElBQUEsVUFBQSxDQUFlLG9CQUFvQixLQUFLLHVCQUF1QixLQUFBLEtBQUEsQ0FBVyxNQUFoRixFQUFNLENBQU47QUFDRDtBQUVELGFBQUEsS0FBQSxDQUFBLEtBQUEsSUFBQSxLQUFBO0FBQ0Q7QUEzR21CO1FBQWhCLFMsR0FBQSxTO0FBOEdDLE1BQU0sb0NBQU4sb0RBQUE7QUFFUCxNQUFBLGVBQUEsQ0FBcUI7QUFBckIsa0JBQUE7QUFHUyxhQUFBLHdCQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEseUJBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSwrQkFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLHdCQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsaUJBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxlQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsaUJBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxlQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsV0FBQSxHQUFBLEVBQUE7QUFpRVI7QUEvREMsY0FBQSxTQUFBLEVBQUEsT0FBQSxFQUF5RDtBQUN2RCxhQUFBLGlCQUFBLENBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQSxhQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQTtBQUNEO0FBRUQsY0FBQSxTQUFBLEVBQUEsT0FBQSxFQUF5RDtBQUN2RCxhQUFBLGlCQUFBLENBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQSxhQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQTtBQUNEO0FBRUQsNEJBQUEsUUFBQSxFQUFBLE9BQUEsRUFBbUU7QUFDakUsYUFBQSx5QkFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0EsYUFBQSx3QkFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0Q7QUFFRCwyQkFBQSxRQUFBLEVBQUEsT0FBQSxFQUFrRTtBQUNoRSxhQUFBLHdCQUFBLENBQUEsSUFBQSxDQUFBLFFBQUE7QUFDQSxhQUFBLCtCQUFBLENBQUEsSUFBQSxDQUFBLE9BQUE7QUFDRDtBQUVELGVBQUEsQ0FBQSxFQUFrQjtBQUNoQixhQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNEO0FBRUQsYUFBTTtBQUNKLFlBQUksRUFBQSxpQkFBQSxFQUFBLGVBQUEsS0FBSixJQUFBO0FBRUEsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLGtCQUFwQixNQUFBLEVBQUEsR0FBQSxFQUFtRDtBQUNqRCxnQkFBSSxZQUFZLGtCQUFoQixDQUFnQixDQUFoQjtBQUNBLGdCQUFJLFVBQVUsZ0JBQWQsQ0FBYyxDQUFkO0FBQ0Esb0JBQUEsU0FBQSxDQUFBLFNBQUE7QUFDRDtBQUVELFlBQUksRUFBQSxpQkFBQSxFQUFBLGVBQUEsS0FBSixJQUFBO0FBRUEsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLGtCQUFwQixNQUFBLEVBQUEsR0FBQSxFQUFtRDtBQUNqRCxnQkFBSSxZQUFZLGtCQUFoQixDQUFnQixDQUFoQjtBQUNBLGdCQUFJLFVBQVUsZ0JBQWQsQ0FBYyxDQUFkO0FBQ0Esb0JBQUEsU0FBQSxDQUFBLFNBQUE7QUFDRDtBQUVELFlBQUksRUFBQSxXQUFBLEtBQUosSUFBQTtBQUVBLGFBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBSSxZQUFwQixNQUFBLEVBQUEsR0FBQSxFQUE2QztBQUMzQyx3QkFBQSxDQUFBLEVBQUEsVUFBQTtBQUNEO0FBRUQsWUFBSSxFQUFBLHdCQUFBLEVBQUEseUJBQUEsS0FBSixJQUFBO0FBRUEsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLHlCQUFwQixNQUFBLEVBQUEsR0FBQSxFQUEwRDtBQUN4RCxnQkFBSSxXQUFXLDBCQUFmLENBQWUsQ0FBZjtBQUNBLGdCQUFJLFVBQVUseUJBQWQsQ0FBYyxDQUFkO0FBQ0Esb0JBQUEsT0FBQSxDQUFBLFFBQUE7QUFDRDtBQUVELFlBQUksRUFBQSwrQkFBQSxFQUFBLHdCQUFBLEtBQUosSUFBQTtBQUVBLGFBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBSSxnQ0FBcEIsTUFBQSxFQUFBLEdBQUEsRUFBaUU7QUFDL0QsZ0JBQUksV0FBVyx5QkFBZixDQUFlLENBQWY7QUFDQSxnQkFBSSxVQUFVLGdDQUFkLENBQWMsQ0FBZDtBQUNBLG9CQUFBLE1BQUEsQ0FBQSxRQUFBO0FBQ0Q7QUFDRjtBQTNFa0I7QUFnRnJCLFNBQUEsTUFBQSxDQUFBLEtBQUEsRUFBOEI7QUFDNUIsV0FBTyxDQUFDLENBQVIsS0FBQTtBQUNEO0FBRUssTUFBQSxlQUFBLENBQStCO0FBTW5DLGdCQUFZLEVBQUEsZ0JBQUEsRUFBWixnQkFBWSxFQUFaLEVBQXNFO0FBTHRFLGFBQUEsRUFBQSxJQUFBLElBQUE7QUFNRSxhQUFBLGdCQUFBLEdBQUEsZ0JBQUE7QUFDQSxhQUFBLGdCQUFBLEdBQUEsZ0JBQUE7QUFDRDtBQUVELDJCQUFBLFNBQUEsRUFBMkM7QUFDekMsZUFBTyxJQUFBLGdDQUFBLENBQUEsU0FBQSxFQUFQLE1BQU8sQ0FBUDtBQUNEO0FBS0QsMEJBQW1CO0FBQ2pCLGVBQU8sS0FBUCxnQkFBQTtBQUNEO0FBQ0QsYUFBTTtBQUNKLGVBQU8sS0FBUCxnQkFBQTtBQUNEO0FBRUQsWUFBSztBQUFBLGlCQUNILGtCQUNFLENBQUMsS0FESCxXQUNHLENBREgsRUFERyxxT0FDSCxDQURHOztBQU1ILGFBQUEsV0FBQSxJQUFvQixJQUFwQixlQUFvQixFQUFwQjtBQUNEO0FBRUQsUUFBQSxXQUFBLEdBQXVCO0FBQ3JCLGVBQWMsS0FBZCxXQUFjLENBQWQ7QUFDRDtBQUVELGNBQUEsU0FBQSxFQUFBLE9BQUEsRUFBeUQ7QUFDdkQsYUFBQSxXQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxPQUFBO0FBQ0Q7QUFFRCxjQUFBLFNBQUEsRUFBQSxPQUFBLEVBQXlEO0FBQ3ZELGFBQUEsV0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsT0FBQTtBQUNEO0FBRUQsNEJBQUEsUUFBQSxFQUFBLE9BQUEsRUFBbUU7QUFDakUsYUFBQSxXQUFBLENBQUEsdUJBQUEsQ0FBQSxRQUFBLEVBQUEsT0FBQTtBQUNEO0FBRUQsMkJBQUEsUUFBQSxFQUFBLE9BQUEsRUFBa0U7QUFDaEUsYUFBQSxXQUFBLENBQUEsc0JBQUEsQ0FBQSxRQUFBLEVBQUEsT0FBQTtBQUNEO0FBRUQsZUFBQSxDQUFBLEVBQWtCO0FBQ2hCLGFBQUEsV0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Q7QUFFRCxhQUFNO0FBQ0osWUFBSSxjQUFjLEtBQWxCLFdBQUE7QUFDQSxhQUFBLFdBQUEsSUFBQSxJQUFBO0FBQ0Esb0JBQUEsTUFBQTtBQUNEO0FBRUQsaUJBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBSUUsWUFKRixJQUFBLEVBSXlDO0FBRXZDLGVBQU8sK0JBQUEsT0FBQSxFQUFBLElBQUEsRUFBUCxTQUFPLENBQVA7QUFDRDtBQXZFa0M7UUFBL0IsZSxHQUFBLGU7S0FDSCxXO0FBcUZHLE1BQUEsOEJBQUEsQ0FBcUM7QUFHekMsZ0JBQW9CLFFBQXBCLEVBQUEsRUFBMEQ7QUFBdEMsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQWlDWCxhQUFBLFFBQUEsR0FBbUM7QUFDMUMsbUJBQU87QUFDTCwwQkFBVSxDQUFBLENBQUEsRUFBQSxLQUFBLEtBQWMsT0FEbkIsS0FDbUIsQ0FEbkI7QUFFTCw4QkFBYyxRQUFRLE9BRmpCLElBRWlCLENBRmpCO0FBR0wsNkJBQWEsUUFBUTtBQUhoQixhQURtQztBQU0xQyxxQkFBUyxPQUFPLFFBQVEsS0FBQSxHQUFBO0FBTmtCLFNBQW5DO0FBaENQLFlBQUksTUFBSixNQUFBLEVBQWtCO0FBQ2hCLGlCQUFBLE1BQUEsR0FBYyxNQUFkLE1BQUE7QUFERixTQUFBLE1BRU87QUFDTCxpQkFBQSxNQUFBLEdBQWMsU0FBUyxDQUFDLENBQXhCLEtBQUE7QUFDRDtBQUNGO0FBRUQsbUJBQUEsR0FBQSxFQUEwQjtBQUN4QixZQUFJLEtBQUEsS0FBQSxDQUFKLGNBQUEsRUFBK0I7QUFDN0IsbUJBQU8sS0FBQSxLQUFBLENBQUEsY0FBQSxDQUFQLEdBQU8sQ0FBUDtBQURGLFNBQUEsTUFFTyxJQUFJLE9BQUEsR0FBQSxLQUFBLFFBQUEsSUFBMkIsT0FBQSxHQUFBLEtBQS9CLFdBQUEsRUFBMkQ7QUFDaEUsbUJBQU8scUJBQVAsR0FBTyxDQUFQO0FBREssU0FBQSxNQUVBLElBQUksT0FBQSxRQUFBLEtBQUosV0FBQSxFQUFxQztBQUMxQyxtQkFBTyxJQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQWEsU0FBYixPQUFBLEVBQVAsUUFBQTtBQURLLFNBQUEsTUFFQTtBQUNMLG1CQUFPLElBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSx5QkFBQSxFQUFQLFFBQUE7QUFDRDtBQUNGO0FBRUQsaUJBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUlrQztBQUVoQyxZQUFJLEtBQUEsS0FBQSxDQUFKLFlBQUEsRUFBNkI7QUFDM0IsbUJBQU8sS0FBQSxLQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFQLFNBQU8sQ0FBUDtBQURGLFNBQUEsTUFFTztBQUNMLG1CQUFPLCtCQUFBLE9BQUEsRUFBQSxJQUFBLEVBQVAsU0FBTyxDQUFQO0FBQ0Q7QUFDRjtBQWxDd0M7UUFBckMsOEIsR0FBQSw4QjtBQThDTixTQUFBLG9CQUFBLENBQUEsR0FBQSxFQUF5QztBQUN2QyxRQUFJLE9BQUEsTUFBQSxLQUFKLFdBQUEsRUFBbUM7QUFDakMsWUFBSSxRQUFRLDBDQUFBLElBQUEsQ0FBWixHQUFZLENBQVo7QUFDQSxlQUFPLFNBQVMsTUFBVCxDQUFTLENBQVQsR0FBb0IsTUFBQSxDQUFBLEVBQXBCLFdBQW9CLEVBQXBCLEdBQVAsRUFBQTtBQUNEO0FBRUQsUUFBSSxTQUFTLE9BQUEsUUFBQSxDQUFBLGFBQUEsQ0FBYixHQUFhLENBQWI7QUFDQSxXQUFBLElBQUEsR0FBQSxHQUFBO0FBQ0EsV0FBTyxPQUFQLFFBQUE7QUFDRDtBQUVLLE1BQUEsc0JBQUEsQ0FBNkI7QUFFakMsZ0JBQUEsS0FBQSxFQUFrRDtBQUE5QixhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQWtDO0FBRXRELG9CQUFBLElBQUEsRUFBQSxRQUFBLEVBQWdEO0FBQzlDLFlBQUksS0FBQSxLQUFBLENBQUosZUFBQSxFQUFnQztBQUM5QixnQkFBSSxZQUFZLEtBQUEsS0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQWhCLFFBQWdCLENBQWhCO0FBRUEsZ0JBQUksY0FBSixTQUFBLEVBQTZCO0FBQzNCLHNCQUFNLElBQUEsS0FBQSxDQUNKLHdCQUF3QixJQUFJLFVBQVUsUUFEeEMsd0NBQU0sQ0FBTjtBQUdEO0FBRUQsbUJBQUEsU0FBQTtBQVRGLFNBQUEsTUFVTztBQUNMLGtCQUFNLElBQUEsS0FBQSxDQUFOLHFEQUFNLENBQU47QUFDRDtBQUNGO0FBRUQsa0JBQUEsSUFBQSxFQUFBLFFBQUEsRUFBOEM7QUFDNUMsWUFBSSxLQUFBLEtBQUEsQ0FBSixhQUFBLEVBQThCO0FBQzVCLGdCQUFJLFVBQVUsS0FBQSxLQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsRUFBZCxRQUFjLENBQWQ7QUFFQSxnQkFBSSxZQUFKLFNBQUEsRUFBMkI7QUFDekIsc0JBQU0sSUFBQSxLQUFBLENBQ0osc0JBQXNCLElBQUksVUFBVSxRQUR0QyxzQ0FBTSxDQUFOO0FBR0Q7QUFFRCxtQkFBQSxPQUFBO0FBVEYsU0FBQSxNQVVPO0FBQ0wsa0JBQU0sSUFBQSxLQUFBLENBQU4sbURBQU0sQ0FBTjtBQUNEO0FBQ0Y7QUFFRCxZQUFBLE1BQUEsRUFBK0M7QUFDN0MsWUFBSSxLQUFBLEtBQUEsQ0FBSixPQUFBLEVBQXdCO0FBQ3RCLGdCQUFJLFdBQVcsS0FBQSxLQUFBLENBQUEsT0FBQSxDQUFmLE1BQWUsQ0FBZjtBQUVBLGdCQUFJLGFBQUosU0FBQSxFQUE0QjtBQUMxQixzQkFBTSxJQUFBLEtBQUEsQ0FBVSxxQkFBcUIsTUFBckMsK0JBQU0sQ0FBTjtBQUNEO0FBRUQsbUJBQUEsUUFBQTtBQVBGLFNBQUEsTUFRTztBQUNMLGtCQUFNLElBQUEsS0FBQSxDQUFOLDZDQUFNLENBQU47QUFDRDtBQUNGO0FBRUQsZUFBQSxPQUFBLEVBQXNDO0FBQ3BDLFlBQUksS0FBQSxLQUFBLENBQUosVUFBQSxFQUEyQjtBQUN6QixnQkFBSSxXQUFXLEtBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBZixPQUFlLENBQWY7QUFFQSxnQkFBSSxhQUFKLFNBQUEsRUFBNEI7QUFDMUIsc0JBQU0sSUFBQSxLQUFBLENBQVUscUJBQXFCLElBQXJDLGtDQUFNLENBQU47QUFDRDtBQUVELG1CQUFBLFFBQUE7QUFQRixTQUFBLE1BUU87QUFDTCxrQkFBTSxJQUFBLEtBQUEsQ0FBTixnREFBTSxDQUFOO0FBQ0Q7QUFDRjtBQUVELGtCQUFBLE9BQUEsRUFBd0I7QUFDdEIsWUFBSSxLQUFBLEtBQUEsQ0FBSixhQUFBLEVBQThCO0FBQzVCLGdCQUFJLGFBQWEsS0FBQSxLQUFBLENBQUEsYUFBQSxDQUFqQixPQUFpQixDQUFqQjtBQUVBLGdCQUFJLGVBQUosU0FBQSxFQUE4QjtBQUM1QixzQkFBTSxJQUFBLEtBQUEsQ0FDSixnQ0FBZ0MsS0FBQSxTQUFBLENBQUEsT0FBQSxDQURsQyxxQ0FBTSxDQUFOO0FBS0Q7QUFFRCxtQkFBQSxVQUFBO0FBWEYsU0FBQSxNQVlPO0FBQ0wsa0JBQU0sSUFBQSxLQUFBLENBQU4sbURBQU0sQ0FBTjtBQUNEO0FBQ0Y7QUFoRmdDO1FBQTdCLHNCLEdBQUEsc0I7QUFtRkEsU0FBQSxVQUFBLENBQUEsUUFBQSxFQUFBLE9BQUEsRUFHSixXQUhJLEVBQUEsRUFJSixXQUpJLEVBQUEsRUFJcUM7QUFFekMsUUFBSSxNQUFNLElBQUEsa0JBQUEsQ0FBQSxRQUFBLEVBQWlDLElBQUEsOEJBQUEsQ0FBM0MsUUFBMkMsQ0FBakMsQ0FBVjtBQUVBLFdBQU87QUFBQSxXQUFBO0FBRUwsa0JBQVUsSUFBQSxzQkFBQSxDQUZMLFFBRUssQ0FGTDtBQUdMLGlCQUFTLDRCQUFBLE9BQUEsQ0FBQSxPQUFBO0FBSEosS0FBUDtBQUtEO0FBWUQ7QUFDQTtBQUNNLFNBQUEsZ0JBQUEsQ0FBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFLWTtBQUVoQixRQUFJLFVBQVUsSUFBQSwyQkFBQSxDQUF1QixRQUFBLE9BQUEsQ0FBdkIsU0FBQSxFQUFrRCxRQUFBLE9BQUEsQ0FBaEUsSUFBYyxDQUFkO0FBRUEsV0FBTztBQUFBLFdBQUE7QUFFTCxrQkFBVSxJQUFBLHNCQUFBLENBRkwsUUFFSyxDQUZMO0FBR0w7QUFISyxLQUFQO0FBS0Q7QUFFSyxTQUFBLFVBQUEsQ0FBQSxRQUFBLEVBRUosV0FGSSxFQUFBLEVBR0osV0FISSxFQUFBLEVBR3FDO0FBRXpDLFFBQUksTUFBTSxJQUFBLGtCQUFBLENBQUEsUUFBQSxFQUFpQyxJQUFBLDhCQUFBLENBQTNDLFFBQTJDLENBQWpDLENBQVY7QUFFQSxRQUFJLFlBQVksSUFBaEIsa0JBQWdCLEVBQWhCO0FBQ0EsUUFBSSxPQUFPLElBQVgsaUJBQVcsRUFBWDtBQUNBLFFBQUksVUFBVSxJQUFBLDJCQUFBLENBQUEsU0FBQSxFQUFkLElBQWMsQ0FBZDtBQUVBLFdBQU87QUFBQSxXQUFBO0FBRUwsa0JBQVUsSUFBQSxzQkFBQSxDQUZMLFFBRUssQ0FGTDtBQUdMO0FBSEssS0FBUDtBQUtEO0FBRUssU0FBQSxxQkFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBLEVBR0osV0FISSxFQUFBLEVBSUosV0FKSSxFQUFBLEVBSXFDO0FBRXpDLFFBQUksTUFBTSxJQUFBLGtCQUFBLENBQUEsUUFBQSxFQUFpQyxJQUFBLDhCQUFBLENBQTNDLFFBQTJDLENBQWpDLENBQVY7QUFFQSxXQUFPO0FBQUEsV0FBQTtBQUVMLGtCQUFVLElBQUEsc0JBQUEsQ0FGTCxRQUVLLENBRkw7QUFHTDtBQUhLLEtBQVA7QUFLRDtBQUVLLE1BQUEsa0JBQUEsU0FBQSxlQUFBLENBQWlEO0FBR3JELGdCQUFBLFFBQUEsRUFBQSxRQUFBLEVBQThFO0FBQzVFLGNBQU07QUFDSiw4QkFBa0IsSUFBQSwyQkFBQSxDQURkLFFBQ2MsQ0FEZDtBQUVKLDhCQUFrQixJQUFBLHNCQUFBLENBQUEsUUFBQTtBQUZkLFNBQU47QUFLQSxhQUFBLFFBQUEsR0FBZ0IsSUFBQSw4QkFBQSxDQUFoQixRQUFnQixDQUFoQjtBQUNEO0FBRUQsbUJBQUEsR0FBQSxFQUEwQjtBQUN4QixlQUFPLEtBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBUCxHQUFPLENBQVA7QUFDRDtBQUVELGdCQUFBLEdBQUEsRUFBQSxRQUFBLEVBQTZDO0FBQzNDLFlBQUksTUFBTSxPQUFWLFFBQVUsQ0FBVjtBQUNBLFlBQUksTUFBTSxLQUFBLFFBQUEsQ0FBVixRQUFBO0FBRUEsWUFBSSxTQUFTLE9BQU8sSUFBUCxLQUFBLEdBQW1CLElBQUEsS0FBQSxDQUFuQixHQUFtQixDQUFuQixHQUFvQyxJQUFBLE9BQUEsQ0FBakQsR0FBaUQsQ0FBakQ7QUFFQSxlQUFPLElBQUEsdUJBQUEsQ0FBQSxHQUFBLEVBQVAsTUFBTyxDQUFQO0FBQ0Q7QUFFRCwyQkFBQSxLQUFBLEVBQW9EO0FBQ2xELGVBQU8sSUFBQSxnQ0FBQSxDQUFBLEtBQUEsRUFBZ0MsS0FBQSxRQUFBLENBQXZDLE1BQU8sQ0FBUDtBQUNEO0FBRUQsaUJBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUlrQztBQUVoQyxlQUFPLEtBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBUCxTQUFPLENBQVA7QUFDRDtBQXBDb0Q7UUFBakQsa0IsR0FBQSxrQjtBQXVDQSxTQUFBLGFBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxFQUF3RDtBQUM1RCxRQUFJLENBQUMsSUFBTCxXQUFLLENBQUwsRUFBdUI7QUFDckIsWUFBQSxLQUFBO0FBQ0EsWUFBSTtBQUNGO0FBREYsU0FBQSxTQUVVO0FBQ1IsZ0JBQUEsTUFBQTtBQUNEO0FBTkgsS0FBQSxNQU9PO0FBQ0w7QUFDRDtBQUNGO0FBRUssTUFBQSxrQkFBQSxTQUFBLGVBQUEsQ0FBMEQ7QUFDOUQsZ0JBQUEsT0FBQSxFQUF3QztBQUN0QyxZQUFJLENBQUosT0FBQSxFQUFjO0FBQ1osZ0JBQUksV0FBVyxPQUFmLFFBQUE7QUFDQSxnQkFBSSxtQkFBbUIsSUFBQSwyQkFBQSxDQUF2QixRQUF1QixDQUF2QjtBQUNBLGdCQUFJLG1CQUFtQixJQUFBLHNCQUFBLENBQXZCLFFBQXVCLENBQXZCO0FBQ0Esc0JBQVUsRUFBQSxnQkFBQSxFQUFWLGdCQUFVLEVBQVY7QUFDRDtBQUVELGNBQUEsT0FBQTtBQUNEO0FBVjZEO1FBQTFELGtCLEdBQUEsa0I7a0JBYU4sZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERpY3QsXG4gIERyb3AsXG4gIEVudmlyb25tZW50LFxuICBFbnZpcm9ubWVudE9wdGlvbnMsXG4gIEdsaW1tZXJUcmVlQ2hhbmdlcyxcbiAgR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb24sXG4gIEppdE9yQW90QmxvY2ssXG4gIFBhcnRpYWxTY29wZSxcbiAgU2NvcGUsXG4gIFNjb3BlQmxvY2ssXG4gIFNjb3BlU2xvdCxcbiAgVHJhbnNhY3Rpb24sXG4gIFRyYW5zYWN0aW9uU3ltYm9sLFxuICBDb21waWxlckFydGlmYWN0cyxcbiAgV2l0aENyZWF0ZUluc3RhbmNlLFxuICBSZXNvbHZlZFZhbHVlLFxuICBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSxcbiAgUnVudGltZVByb2dyYW0sXG4gIE1vZGlmaWVyTWFuYWdlcixcbiAgVGVtcGxhdGUsXG4gIEFvdFJ1bnRpbWVSZXNvbHZlcixcbiAgSW52b2NhdGlvbixcbiAgSml0UnVudGltZUNvbnRleHQsXG4gIEFvdFJ1bnRpbWVDb250ZXh0LFxuICBKaXRSdW50aW1lUmVzb2x2ZXIsXG4gIFJ1bnRpbWVSZXNvbHZlcixcbiAgU3ludGF4Q29tcGlsYXRpb25Db250ZXh0LFxuICBSdW50aW1lQ29uc3RhbnRzLFxuICBSdW50aW1lSGVhcCxcbiAgV2hvbGVQcm9ncmFtQ29tcGlsYXRpb25Db250ZXh0LFxuICBDb21waWxlVGltZUNvbnN0YW50cyxcbiAgQ29tcGlsZVRpbWVIZWFwLFxuICBNYWNyb3MsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgSXRlcmFibGVJbXBsLFxuICBJdGVyYWJsZUtleURlZmluaXRpb25zLFxuICBPcGFxdWVJdGVyYWJsZSxcbiAgUGF0aFJlZmVyZW5jZSxcbiAgUmVmZXJlbmNlLFxuICBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLFxuICBWZXJzaW9uZWRSZWZlcmVuY2UsXG59IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBhc3NlcnQsIERST1AsIGV4cGVjdCwgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBBdHRyTmFtZXNwYWNlLCBTaW1wbGVEb2N1bWVudCwgU2ltcGxlRWxlbWVudCB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBET01DaGFuZ2VzSW1wbCwgRE9NVHJlZUNvbnN0cnVjdGlvbiB9IGZyb20gJy4vZG9tL2hlbHBlcic7XG5pbXBvcnQgeyBDb25kaXRpb25hbFJlZmVyZW5jZSwgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4vcmVmZXJlbmNlcyc7XG5pbXBvcnQgeyBEeW5hbWljQXR0cmlidXRlLCBkeW5hbWljQXR0cmlidXRlIH0gZnJvbSAnLi92bS9hdHRyaWJ1dGVzL2R5bmFtaWMnO1xuaW1wb3J0IHsgUnVudGltZVByb2dyYW1JbXBsLCBDb25zdGFudHMsIEhlYXBJbXBsIH0gZnJvbSAnQGdsaW1tZXIvcHJvZ3JhbSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Njb3BlUmVmZXJlbmNlKHM6IFNjb3BlU2xvdCk6IHMgaXMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gIGlmIChzID09PSBudWxsIHx8IEFycmF5LmlzQXJyYXkocykpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBjbGFzcyBTY29wZUltcGw8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IGltcGxlbWVudHMgUGFydGlhbFNjb3BlPEM+IHtcbiAgc3RhdGljIHJvb3Q8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KHNlbGY6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sIHNpemUgPSAwKTogUGFydGlhbFNjb3BlPEM+IHtcbiAgICBsZXQgcmVmczogUGF0aFJlZmVyZW5jZTx1bmtub3duPltdID0gbmV3IEFycmF5KHNpemUgKyAxKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHNpemU7IGkrKykge1xuICAgICAgcmVmc1tpXSA9IFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTY29wZUltcGw8Qz4ocmVmcywgbnVsbCwgbnVsbCwgbnVsbCkuaW5pdCh7IHNlbGYgfSk7XG4gIH1cblxuICBzdGF0aWMgc2l6ZWQ8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KHNpemUgPSAwKTogU2NvcGU8Qz4ge1xuICAgIGxldCByZWZzOiBQYXRoUmVmZXJlbmNlPHVua25vd24+W10gPSBuZXcgQXJyYXkoc2l6ZSArIDEpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gc2l6ZTsgaSsrKSB7XG4gICAgICByZWZzW2ldID0gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFNjb3BlSW1wbChyZWZzLCBudWxsLCBudWxsLCBudWxsKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8vIHRoZSAwdGggc2xvdCBpcyBgc2VsZmBcbiAgICByZWFkb25seSBzbG90czogQXJyYXk8U2NvcGVTbG90PEM+PixcbiAgICBwcml2YXRlIGNhbGxlclNjb3BlOiBPcHRpb248U2NvcGU8Qz4+LFxuICAgIC8vIG5hbWVkIGFyZ3VtZW50cyBhbmQgYmxvY2tzIHBhc3NlZCB0byBhIGxheW91dCB0aGF0IHVzZXMgZXZhbFxuICAgIHByaXZhdGUgZXZhbFNjb3BlOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Qz4+PixcbiAgICAvLyBsb2NhbHMgaW4gc2NvcGUgd2hlbiB0aGUgcGFydGlhbCB3YXMgaW52b2tlZFxuICAgIHByaXZhdGUgcGFydGlhbE1hcDogT3B0aW9uPERpY3Q8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4+XG4gICkge31cblxuICBpbml0KHsgc2VsZiB9OiB7IHNlbGY6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4gfSk6IHRoaXMge1xuICAgIHRoaXMuc2xvdHNbMF0gPSBzZWxmO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0U2VsZigpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5nZXQ8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4oMCk7XG4gIH1cblxuICBnZXRTeW1ib2woc3ltYm9sOiBudW1iZXIpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5nZXQ8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4oc3ltYm9sKTtcbiAgfVxuXG4gIGdldEJsb2NrKHN5bWJvbDogbnVtYmVyKTogT3B0aW9uPFNjb3BlQmxvY2s8Qz4+IHtcbiAgICBsZXQgYmxvY2sgPSB0aGlzLmdldChzeW1ib2wpO1xuICAgIHJldHVybiBibG9jayA9PT0gVU5ERUZJTkVEX1JFRkVSRU5DRSA/IG51bGwgOiAoYmxvY2sgYXMgU2NvcGVCbG9jazxDPik7XG4gIH1cblxuICBnZXRFdmFsU2NvcGUoKTogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEM+Pj4ge1xuICAgIHJldHVybiB0aGlzLmV2YWxTY29wZTtcbiAgfVxuXG4gIGdldFBhcnRpYWxNYXAoKTogT3B0aW9uPERpY3Q8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4+IHtcbiAgICByZXR1cm4gdGhpcy5wYXJ0aWFsTWFwO1xuICB9XG5cbiAgYmluZChzeW1ib2w6IG51bWJlciwgdmFsdWU6IFNjb3BlU2xvdDxDPikge1xuICAgIHRoaXMuc2V0KHN5bWJvbCwgdmFsdWUpO1xuICB9XG5cbiAgYmluZFNlbGYoc2VsZjogUGF0aFJlZmVyZW5jZTx1bmtub3duPikge1xuICAgIHRoaXMuc2V0PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KDAsIHNlbGYpO1xuICB9XG5cbiAgYmluZFN5bWJvbChzeW1ib2w6IG51bWJlciwgdmFsdWU6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4pIHtcbiAgICB0aGlzLnNldChzeW1ib2wsIHZhbHVlKTtcbiAgfVxuXG4gIGJpbmRCbG9jayhzeW1ib2w6IG51bWJlciwgdmFsdWU6IE9wdGlvbjxTY29wZUJsb2NrPEM+Pikge1xuICAgIHRoaXMuc2V0PE9wdGlvbjxTY29wZUJsb2NrPEM+Pj4oc3ltYm9sLCB2YWx1ZSk7XG4gIH1cblxuICBiaW5kRXZhbFNjb3BlKG1hcDogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEM+Pj4pIHtcbiAgICB0aGlzLmV2YWxTY29wZSA9IG1hcDtcbiAgfVxuXG4gIGJpbmRQYXJ0aWFsTWFwKG1hcDogRGljdDxQYXRoUmVmZXJlbmNlPHVua25vd24+Pikge1xuICAgIHRoaXMucGFydGlhbE1hcCA9IG1hcDtcbiAgfVxuXG4gIGJpbmRDYWxsZXJTY29wZShzY29wZTogT3B0aW9uPFNjb3BlPEM+Pik6IHZvaWQge1xuICAgIHRoaXMuY2FsbGVyU2NvcGUgPSBzY29wZTtcbiAgfVxuXG4gIGdldENhbGxlclNjb3BlKCk6IE9wdGlvbjxTY29wZTxDPj4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxlclNjb3BlO1xuICB9XG5cbiAgY2hpbGQoKTogU2NvcGU8Qz4ge1xuICAgIHJldHVybiBuZXcgU2NvcGVJbXBsKHRoaXMuc2xvdHMuc2xpY2UoKSwgdGhpcy5jYWxsZXJTY29wZSwgdGhpcy5ldmFsU2NvcGUsIHRoaXMucGFydGlhbE1hcCk7XG4gIH1cblxuICBwcml2YXRlIGdldDxUIGV4dGVuZHMgU2NvcGVTbG90PEM+PihpbmRleDogbnVtYmVyKTogVCB7XG4gICAgaWYgKGluZGV4ID49IHRoaXMuc2xvdHMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgQlVHOiBjYW5ub3QgZ2V0ICQke2luZGV4fSBmcm9tIHNjb3BlOyBsZW5ndGg9JHt0aGlzLnNsb3RzLmxlbmd0aH1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zbG90c1tpbmRleF0gYXMgVDtcbiAgfVxuXG4gIHByaXZhdGUgc2V0PFQgZXh0ZW5kcyBTY29wZVNsb3Q8Qz4+KGluZGV4OiBudW1iZXIsIHZhbHVlOiBUKTogdm9pZCB7XG4gICAgaWYgKGluZGV4ID49IHRoaXMuc2xvdHMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgQlVHOiBjYW5ub3QgZ2V0ICQke2luZGV4fSBmcm9tIHNjb3BlOyBsZW5ndGg9JHt0aGlzLnNsb3RzLmxlbmd0aH1gKTtcbiAgICB9XG5cbiAgICB0aGlzLnNsb3RzW2luZGV4XSA9IHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBUUkFOU0FDVElPTjogVHJhbnNhY3Rpb25TeW1ib2wgPSAnVFJBTlNBQ1RJT04gW2MzOTM4ODg1LWFiYTAtNDIyZi1iNTQwLTNmZDM0MzFjNzhiNV0nO1xuXG5jbGFzcyBUcmFuc2FjdGlvbkltcGwgaW1wbGVtZW50cyBUcmFuc2FjdGlvbiB7XG4gIHJlYWRvbmx5IFtUUkFOU0FDVElPTl06IE9wdGlvbjxUcmFuc2FjdGlvbkltcGw+O1xuXG4gIHB1YmxpYyBzY2hlZHVsZWRJbnN0YWxsTWFuYWdlcnM6IE1vZGlmaWVyTWFuYWdlcltdID0gW107XG4gIHB1YmxpYyBzY2hlZHVsZWRJbnN0YWxsTW9kaWZpZXJzOiB1bmtub3duW10gPSBbXTtcbiAgcHVibGljIHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnM6IE1vZGlmaWVyTWFuYWdlcltdID0gW107XG4gIHB1YmxpYyBzY2hlZHVsZWRVcGRhdGVNb2RpZmllcnM6IHVua25vd25bXSA9IFtdO1xuICBwdWJsaWMgY3JlYXRlZENvbXBvbmVudHM6IHVua25vd25bXSA9IFtdO1xuICBwdWJsaWMgY3JlYXRlZE1hbmFnZXJzOiBXaXRoQ3JlYXRlSW5zdGFuY2U8dW5rbm93bj5bXSA9IFtdO1xuICBwdWJsaWMgdXBkYXRlZENvbXBvbmVudHM6IHVua25vd25bXSA9IFtdO1xuICBwdWJsaWMgdXBkYXRlZE1hbmFnZXJzOiBXaXRoQ3JlYXRlSW5zdGFuY2U8dW5rbm93bj5bXSA9IFtdO1xuICBwdWJsaWMgZGVzdHJ1Y3RvcnM6IERyb3BbXSA9IFtdO1xuXG4gIGRpZENyZWF0ZShjb21wb25lbnQ6IHVua25vd24sIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSkge1xuICAgIHRoaXMuY3JlYXRlZENvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIHRoaXMuY3JlYXRlZE1hbmFnZXJzLnB1c2gobWFuYWdlcik7XG4gIH1cblxuICBkaWRVcGRhdGUoY29tcG9uZW50OiB1bmtub3duLCBtYW5hZ2VyOiBXaXRoQ3JlYXRlSW5zdGFuY2UpIHtcbiAgICB0aGlzLnVwZGF0ZWRDb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICB0aGlzLnVwZGF0ZWRNYW5hZ2Vycy5wdXNoKG1hbmFnZXIpO1xuICB9XG5cbiAgc2NoZWR1bGVJbnN0YWxsTW9kaWZpZXIobW9kaWZpZXI6IHVua25vd24sIG1hbmFnZXI6IE1vZGlmaWVyTWFuYWdlcikge1xuICAgIHRoaXMuc2NoZWR1bGVkSW5zdGFsbE1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbiAgICB0aGlzLnNjaGVkdWxlZEluc3RhbGxNYW5hZ2Vycy5wdXNoKG1hbmFnZXIpO1xuICB9XG5cbiAgc2NoZWR1bGVVcGRhdGVNb2RpZmllcihtb2RpZmllcjogdW5rbm93biwgbWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyKSB7XG4gICAgdGhpcy5zY2hlZHVsZWRVcGRhdGVNb2RpZmllcnMucHVzaChtb2RpZmllcik7XG4gICAgdGhpcy5zY2hlZHVsZWRVcGRhdGVNb2RpZmllck1hbmFnZXJzLnB1c2gobWFuYWdlcik7XG4gIH1cblxuICBkaWREZXN0cm95KGQ6IERyb3ApIHtcbiAgICB0aGlzLmRlc3RydWN0b3JzLnB1c2goZCk7XG4gIH1cblxuICBjb21taXQoKSB7XG4gICAgbGV0IHsgY3JlYXRlZENvbXBvbmVudHMsIGNyZWF0ZWRNYW5hZ2VycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3JlYXRlZENvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjb21wb25lbnQgPSBjcmVhdGVkQ29tcG9uZW50c1tpXTtcbiAgICAgIGxldCBtYW5hZ2VyID0gY3JlYXRlZE1hbmFnZXJzW2ldO1xuICAgICAgbWFuYWdlci5kaWRDcmVhdGUoY29tcG9uZW50KTtcbiAgICB9XG5cbiAgICBsZXQgeyB1cGRhdGVkQ29tcG9uZW50cywgdXBkYXRlZE1hbmFnZXJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1cGRhdGVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGNvbXBvbmVudCA9IHVwZGF0ZWRDb21wb25lbnRzW2ldO1xuICAgICAgbGV0IG1hbmFnZXIgPSB1cGRhdGVkTWFuYWdlcnNbaV07XG4gICAgICBtYW5hZ2VyLmRpZFVwZGF0ZShjb21wb25lbnQpO1xuICAgIH1cblxuICAgIGxldCB7IGRlc3RydWN0b3JzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXN0cnVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgZGVzdHJ1Y3RvcnNbaV1bRFJPUF0oKTtcbiAgICB9XG5cbiAgICBsZXQgeyBzY2hlZHVsZWRJbnN0YWxsTWFuYWdlcnMsIHNjaGVkdWxlZEluc3RhbGxNb2RpZmllcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjaGVkdWxlZEluc3RhbGxNYW5hZ2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG1vZGlmaWVyID0gc2NoZWR1bGVkSW5zdGFsbE1vZGlmaWVyc1tpXTtcbiAgICAgIGxldCBtYW5hZ2VyID0gc2NoZWR1bGVkSW5zdGFsbE1hbmFnZXJzW2ldO1xuICAgICAgbWFuYWdlci5pbnN0YWxsKG1vZGlmaWVyKTtcbiAgICB9XG5cbiAgICBsZXQgeyBzY2hlZHVsZWRVcGRhdGVNb2RpZmllck1hbmFnZXJzLCBzY2hlZHVsZWRVcGRhdGVNb2RpZmllcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBtb2RpZmllciA9IHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyc1tpXTtcbiAgICAgIGxldCBtYW5hZ2VyID0gc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJNYW5hZ2Vyc1tpXTtcbiAgICAgIG1hbmFnZXIudXBkYXRlKG1vZGlmaWVyKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVG9Cb29sID0gKHZhbHVlOiB1bmtub3duKSA9PiBib29sZWFuO1xuXG5mdW5jdGlvbiB0b0Jvb2wodmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuICEhdmFsdWU7XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbnZpcm9ubWVudEltcGwgaW1wbGVtZW50cyBFbnZpcm9ubWVudCB7XG4gIFtUUkFOU0FDVElPTl06IE9wdGlvbjxUcmFuc2FjdGlvbkltcGw+ID0gbnVsbDtcblxuICBwcm90ZWN0ZWQgdXBkYXRlT3BlcmF0aW9uczogR2xpbW1lclRyZWVDaGFuZ2VzO1xuICBwcm90ZWN0ZWQgYXBwZW5kT3BlcmF0aW9uczogR2xpbW1lclRyZWVDb25zdHJ1Y3Rpb247XG5cbiAgY29uc3RydWN0b3IoeyBhcHBlbmRPcGVyYXRpb25zLCB1cGRhdGVPcGVyYXRpb25zIH06IEVudmlyb25tZW50T3B0aW9ucykge1xuICAgIHRoaXMuYXBwZW5kT3BlcmF0aW9ucyA9IGFwcGVuZE9wZXJhdGlvbnM7XG4gICAgdGhpcy51cGRhdGVPcGVyYXRpb25zID0gdXBkYXRlT3BlcmF0aW9ucztcbiAgfVxuXG4gIHRvQ29uZGl0aW9uYWxSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiBSZWZlcmVuY2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxSZWZlcmVuY2UocmVmZXJlbmNlLCB0b0Jvb2wpO1xuICB9XG5cbiAgYWJzdHJhY3QgaXRlcmFibGVGb3IocmVmZXJlbmNlOiBSZWZlcmVuY2UsIGtleTogdW5rbm93bik6IE9wYXF1ZUl0ZXJhYmxlO1xuICBhYnN0cmFjdCBwcm90b2NvbEZvclVSTChzOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgZ2V0QXBwZW5kT3BlcmF0aW9ucygpOiBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kT3BlcmF0aW9ucztcbiAgfVxuICBnZXRET00oKTogR2xpbW1lclRyZWVDaGFuZ2VzIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVPcGVyYXRpb25zO1xuICB9XG5cbiAgYmVnaW4oKSB7XG4gICAgYXNzZXJ0KFxuICAgICAgIXRoaXNbVFJBTlNBQ1RJT05dLFxuICAgICAgJ0EgZ2xpbW1lciB0cmFuc2FjdGlvbiB3YXMgYmVndW4sIGJ1dCBvbmUgYWxyZWFkeSBleGlzdHMuIFlvdSBtYXkgaGF2ZSBhIG5lc3RlZCB0cmFuc2FjdGlvbiwgcG9zc2libHkgY2F1c2VkIGJ5IGFuIGVhcmxpZXIgcnVudGltZSBleGNlcHRpb24gd2hpbGUgcmVuZGVyaW5nLiBQbGVhc2UgY2hlY2sgeW91ciBjb25zb2xlIGZvciB0aGUgc3RhY2sgdHJhY2Ugb2YgYW55IHByaW9yIGV4Y2VwdGlvbnMuJ1xuICAgICk7XG5cbiAgICB0aGlzW1RSQU5TQUNUSU9OXSA9IG5ldyBUcmFuc2FjdGlvbkltcGwoKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHRyYW5zYWN0aW9uKCk6IFRyYW5zYWN0aW9uSW1wbCB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzW1RSQU5TQUNUSU9OXSEsICdtdXN0IGJlIGluIGEgdHJhbnNhY3Rpb24nKTtcbiAgfVxuXG4gIGRpZENyZWF0ZShjb21wb25lbnQ6IHVua25vd24sIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSkge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uZGlkQ3JlYXRlKGNvbXBvbmVudCwgbWFuYWdlcik7XG4gIH1cblxuICBkaWRVcGRhdGUoY29tcG9uZW50OiB1bmtub3duLCBtYW5hZ2VyOiBXaXRoQ3JlYXRlSW5zdGFuY2UpIHtcbiAgICB0aGlzLnRyYW5zYWN0aW9uLmRpZFVwZGF0ZShjb21wb25lbnQsIG1hbmFnZXIpO1xuICB9XG5cbiAgc2NoZWR1bGVJbnN0YWxsTW9kaWZpZXIobW9kaWZpZXI6IHVua25vd24sIG1hbmFnZXI6IE1vZGlmaWVyTWFuYWdlcikge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uc2NoZWR1bGVJbnN0YWxsTW9kaWZpZXIobW9kaWZpZXIsIG1hbmFnZXIpO1xuICB9XG5cbiAgc2NoZWR1bGVVcGRhdGVNb2RpZmllcihtb2RpZmllcjogdW5rbm93biwgbWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5zY2hlZHVsZVVwZGF0ZU1vZGlmaWVyKG1vZGlmaWVyLCBtYW5hZ2VyKTtcbiAgfVxuXG4gIGRpZERlc3Ryb3koZDogRHJvcCkge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uZGlkRGVzdHJveShkKTtcbiAgfVxuXG4gIGNvbW1pdCgpIHtcbiAgICBsZXQgdHJhbnNhY3Rpb24gPSB0aGlzLnRyYW5zYWN0aW9uO1xuICAgIHRoaXNbVFJBTlNBQ1RJT05dID0gbnVsbDtcbiAgICB0cmFuc2FjdGlvbi5jb21taXQoKTtcbiAgfVxuXG4gIGF0dHJpYnV0ZUZvcihcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIGF0dHI6IHN0cmluZyxcbiAgICBfaXNUcnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPiA9IG51bGxcbiAgKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIGR5bmFtaWNBdHRyaWJ1dGUoZWxlbWVudCwgYXR0ciwgbmFtZXNwYWNlKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlIHtcbiAgcHJvdG9jb2xGb3JVUkw/KHVybDogc3RyaW5nKTogc3RyaW5nO1xuICBpdGVyYWJsZT86IEl0ZXJhYmxlS2V5RGVmaW5pdGlvbnM7XG4gIHRvQm9vbD8odmFsdWU6IHVua25vd24pOiBib29sZWFuO1xuICBhdHRyaWJ1dGVGb3I/KFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgYXR0cjogc3RyaW5nLFxuICAgIGlzVHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbiAgKTogRHluYW1pY0F0dHJpYnV0ZTtcbn1cblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbCBpbXBsZW1lbnRzIFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlIHtcbiAgcmVhZG9ubHkgdG9Cb29sOiAodmFsdWU6IHVua25vd24pID0+IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUgPSB7fSkge1xuICAgIGlmIChpbm5lci50b0Jvb2wpIHtcbiAgICAgIHRoaXMudG9Cb29sID0gaW5uZXIudG9Cb29sO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRvQm9vbCA9IHZhbHVlID0+ICEhdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHJvdG9jb2xGb3JVUkwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmlubmVyLnByb3RvY29sRm9yVVJMKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbm5lci5wcm90b2NvbEZvclVSTCh1cmwpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIFVSTCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIFVSTCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBsZWdhY3lQcm90b2NvbEZvclVSTCh1cmwpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIG5ldyBVUkwodXJsLCBkb2N1bWVudC5iYXNlVVJJKS5wcm90b2NvbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBVUkwodXJsLCAnaHR0cHM6Ly93d3cuZXhhbXBsZS5jb20nKS5wcm90b2NvbDtcbiAgICB9XG4gIH1cblxuICBhdHRyaWJ1dGVGb3IoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBhdHRyOiBzdHJpbmcsXG4gICAgaXNUcnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPlxuICApOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgICBpZiAodGhpcy5pbm5lci5hdHRyaWJ1dGVGb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmlubmVyLmF0dHJpYnV0ZUZvcihlbGVtZW50LCBhdHRyLCBpc1RydXN0aW5nLCBuYW1lc3BhY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZHluYW1pY0F0dHJpYnV0ZShlbGVtZW50LCBhdHRyLCBuYW1lc3BhY2UpO1xuICAgIH1cbiAgfVxuXG4gIHJlYWRvbmx5IGl0ZXJhYmxlOiBJdGVyYWJsZUtleURlZmluaXRpb25zID0ge1xuICAgIG5hbWVkOiB7XG4gICAgICAnQGluZGV4JzogKF8sIGluZGV4KSA9PiBTdHJpbmcoaW5kZXgpLFxuICAgICAgJ0BwcmltaXRpdmUnOiBpdGVtID0+IFN0cmluZyhpdGVtKSxcbiAgICAgICdAaWRlbnRpdHknOiBpdGVtID0+IGl0ZW0sXG4gICAgfSxcbiAgICBkZWZhdWx0OiBrZXkgPT4gaXRlbSA9PiBpdGVtW2tleV0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGxlZ2FjeVByb3RvY29sRm9yVVJMKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbGV0IG1hdGNoID0gL14oW2Etel1bYS16MC05ListXSo6KT8oXFwvXFwvKT8oW1xcU1xcc10qKS9pLmV4ZWModXJsKTtcbiAgICByZXR1cm4gbWF0Y2ggJiYgbWF0Y2hbMV0gPyBtYXRjaFsxXS50b0xvd2VyQ2FzZSgpIDogJyc7XG4gIH1cblxuICBsZXQgYW5jaG9yID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgYW5jaG9yLmhyZWYgPSB1cmw7XG4gIHJldHVybiBhbmNob3IucHJvdG9jb2w7XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UnVudGltZVJlc29sdmVyPFIgZXh0ZW5kcyB7IG1vZHVsZTogc3RyaW5nIH0+XG4gIGltcGxlbWVudHMgSml0UnVudGltZVJlc29sdmVyPFI+LCBBb3RSdW50aW1lUmVzb2x2ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSkge31cblxuICBsb29rdXBDb21wb25lbnQobmFtZTogc3RyaW5nLCByZWZlcnJlcj86IHVua25vd24pOiBPcHRpb248YW55PiB7XG4gICAgaWYgKHRoaXMuaW5uZXIubG9va3VwQ29tcG9uZW50KSB7XG4gICAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5pbm5lci5sb29rdXBDb21wb25lbnQobmFtZSwgcmVmZXJyZXIpO1xuXG4gICAgICBpZiAoY29tcG9uZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIGNvbXBvbmVudCAke25hbWV9IChmcm9tICR7cmVmZXJyZXJ9KSAobG9va3VwQ29tcG9uZW50IHJldHVybmVkIHVuZGVmaW5lZClgXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbG9va3VwQ29tcG9uZW50IG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG5cbiAgbG9va3VwUGFydGlhbChuYW1lOiBzdHJpbmcsIHJlZmVycmVyPzogdW5rbm93bik6IE9wdGlvbjxudW1iZXI+IHtcbiAgICBpZiAodGhpcy5pbm5lci5sb29rdXBQYXJ0aWFsKSB7XG4gICAgICBsZXQgcGFydGlhbCA9IHRoaXMuaW5uZXIubG9va3VwUGFydGlhbChuYW1lLCByZWZlcnJlcik7XG5cbiAgICAgIGlmIChwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIHBhcnRpYWwgJHtuYW1lfSAoZnJvbSAke3JlZmVycmVyfSkgKGxvb2t1cFBhcnRpYWwgcmV0dXJuZWQgdW5kZWZpbmVkKWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnRpYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbG9va3VwUGFydGlhbCBub3QgaW1wbGVtZW50ZWQgb24gUnVudGltZVJlc29sdmVyLicpO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmU8VSBleHRlbmRzIFJlc29sdmVkVmFsdWU+KGhhbmRsZTogbnVtYmVyKTogVSB7XG4gICAgaWYgKHRoaXMuaW5uZXIucmVzb2x2ZSkge1xuICAgICAgbGV0IHJlc29sdmVkID0gdGhpcy5pbm5lci5yZXNvbHZlKGhhbmRsZSk7XG5cbiAgICAgIGlmIChyZXNvbHZlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBoYW5kbGUgJHtoYW5kbGV9IChyZXNvbHZlIHJldHVybmVkIHVuZGVmaW5lZClgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdmVkIGFzIFU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVzb2x2ZSBub3QgaW1wbGVtZW50ZWQgb24gUnVudGltZVJlc29sdmVyLicpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBpbGFibGUobG9jYXRvcjogeyBtb2R1bGU6IHN0cmluZyB9KTogVGVtcGxhdGUge1xuICAgIGlmICh0aGlzLmlubmVyLmNvbXBpbGFibGUpIHtcbiAgICAgIGxldCByZXNvbHZlZCA9IHRoaXMuaW5uZXIuY29tcGlsYWJsZShsb2NhdG9yKTtcblxuICAgICAgaWYgKHJlc29sdmVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY29tcGlsZSAke25hbWV9IChjb21waWxhYmxlIHJldHVybmVkIHVuZGVmaW5lZClgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbXBpbGFibGUgbm90IGltcGxlbWVudGVkIG9uIFJ1bnRpbWVSZXNvbHZlci4nKTtcbiAgICB9XG4gIH1cblxuICBnZXRJbnZvY2F0aW9uKGxvY2F0b3I6IFIpOiBJbnZvY2F0aW9uIHtcbiAgICBpZiAodGhpcy5pbm5lci5nZXRJbnZvY2F0aW9uKSB7XG4gICAgICBsZXQgaW52b2NhdGlvbiA9IHRoaXMuaW5uZXIuZ2V0SW52b2NhdGlvbihsb2NhdG9yKTtcblxuICAgICAgaWYgKGludm9jYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBnZXQgaW52b2NhdGlvbiBmb3IgJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgIGxvY2F0b3JcbiAgICAgICAgICApfSAoZ2V0SW52b2NhdGlvbiByZXR1cm5lZCB1bmRlZmluZWQpYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW52b2NhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXRJbnZvY2F0aW9uIG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBb3RSdW50aW1lKFxuICBkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQsXG4gIHByb2dyYW06IENvbXBpbGVyQXJ0aWZhY3RzLFxuICByZXNvbHZlcjogUnVudGltZVJlc29sdmVyRGVsZWdhdGUgPSB7fSxcbiAgZGVsZWdhdGU6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlID0ge31cbik6IEFvdFJ1bnRpbWVDb250ZXh0IHtcbiAgbGV0IGVudiA9IG5ldyBSdW50aW1lRW52aXJvbm1lbnQoZG9jdW1lbnQsIG5ldyBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGwoZGVsZWdhdGUpKTtcblxuICByZXR1cm4ge1xuICAgIGVudixcbiAgICByZXNvbHZlcjogbmV3IERlZmF1bHRSdW50aW1lUmVzb2x2ZXIocmVzb2x2ZXIpLFxuICAgIHByb2dyYW06IFJ1bnRpbWVQcm9ncmFtSW1wbC5oeWRyYXRlKHByb2dyYW0pLFxuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEppdFByb2dyYW1Db21waWxhdGlvbkNvbnRleHQgZXh0ZW5kcyBXaG9sZVByb2dyYW1Db21waWxhdGlvbkNvbnRleHQge1xuICByZWFkb25seSBjb25zdGFudHM6IENvbXBpbGVUaW1lQ29uc3RhbnRzICYgUnVudGltZUNvbnN0YW50cztcbiAgcmVhZG9ubHkgaGVhcDogQ29tcGlsZVRpbWVIZWFwICYgUnVudGltZUhlYXA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSml0U3ludGF4Q29tcGlsYXRpb25Db250ZXh0IGV4dGVuZHMgU3ludGF4Q29tcGlsYXRpb25Db250ZXh0IHtcbiAgcmVhZG9ubHkgcHJvZ3JhbTogSml0UHJvZ3JhbUNvbXBpbGF0aW9uQ29udGV4dDtcbiAgcmVhZG9ubHkgbWFjcm9zOiBNYWNyb3M7XG59XG5cbi8vIFRPRE86IFRoZXJlIGFyZSBhIGxvdCBvZiB2YXJpYW50cyBoZXJlLiBTb21lIGFyZSBoZXJlIGZvciB0cmFuc2l0aW9uYWwgcHVycG9zZXNcbi8vIGFuZCBzb21lIG1pZ2h0IGJlIEdDYWJsZSBvbmNlIHRoZSBkZXNpZ24gc3RhYmlsaXplcy5cbmV4cG9ydCBmdW5jdGlvbiBDdXN0b21KaXRSdW50aW1lKFxuICByZXNvbHZlcjogUnVudGltZVJlc29sdmVyLFxuICBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHQgJiB7XG4gICAgcHJvZ3JhbTogeyBjb25zdGFudHM6IFJ1bnRpbWVDb25zdGFudHM7IGhlYXA6IFJ1bnRpbWVIZWFwIH07XG4gIH0sXG4gIGVudjogRW52aXJvbm1lbnRcbik6IEppdFJ1bnRpbWVDb250ZXh0IHtcbiAgbGV0IHByb2dyYW0gPSBuZXcgUnVudGltZVByb2dyYW1JbXBsKGNvbnRleHQucHJvZ3JhbS5jb25zdGFudHMsIGNvbnRleHQucHJvZ3JhbS5oZWFwKTtcblxuICByZXR1cm4ge1xuICAgIGVudixcbiAgICByZXNvbHZlcjogbmV3IERlZmF1bHRSdW50aW1lUmVzb2x2ZXIocmVzb2x2ZXIpLFxuICAgIHByb2dyYW0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBKaXRSdW50aW1lKFxuICBkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQsXG4gIHJlc29sdmVyOiBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSA9IHt9LFxuICBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUgPSB7fVxuKTogSml0UnVudGltZUNvbnRleHQge1xuICBsZXQgZW52ID0gbmV3IFJ1bnRpbWVFbnZpcm9ubWVudChkb2N1bWVudCwgbmV3IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbChkZWxlZ2F0ZSkpO1xuXG4gIGxldCBjb25zdGFudHMgPSBuZXcgQ29uc3RhbnRzKCk7XG4gIGxldCBoZWFwID0gbmV3IEhlYXBJbXBsKCk7XG4gIGxldCBwcm9ncmFtID0gbmV3IFJ1bnRpbWVQcm9ncmFtSW1wbChjb25zdGFudHMsIGhlYXApO1xuXG4gIHJldHVybiB7XG4gICAgZW52LFxuICAgIHJlc29sdmVyOiBuZXcgRGVmYXVsdFJ1bnRpbWVSZXNvbHZlcihyZXNvbHZlciksXG4gICAgcHJvZ3JhbSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEppdFJ1bnRpbWVGcm9tUHJvZ3JhbShcbiAgZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50LFxuICBwcm9ncmFtOiBSdW50aW1lUHJvZ3JhbSxcbiAgcmVzb2x2ZXI6IFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlID0ge30sXG4gIGRlbGVnYXRlOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSA9IHt9XG4pOiBKaXRSdW50aW1lQ29udGV4dCB7XG4gIGxldCBlbnYgPSBuZXcgUnVudGltZUVudmlyb25tZW50KGRvY3VtZW50LCBuZXcgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKGRlbGVnYXRlKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBlbnYsXG4gICAgcmVzb2x2ZXI6IG5ldyBEZWZhdWx0UnVudGltZVJlc29sdmVyKHJlc29sdmVyKSxcbiAgICBwcm9ncmFtLFxuICB9O1xufVxuXG5leHBvcnQgY2xhc3MgUnVudGltZUVudmlyb25tZW50IGV4dGVuZHMgRW52aXJvbm1lbnRJbXBsIHtcbiAgcHJpdmF0ZSBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsO1xuXG4gIGNvbnN0cnVjdG9yKGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCwgZGVsZWdhdGU6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbCkge1xuICAgIHN1cGVyKHtcbiAgICAgIGFwcGVuZE9wZXJhdGlvbnM6IG5ldyBET01UcmVlQ29uc3RydWN0aW9uKGRvY3VtZW50KSxcbiAgICAgIHVwZGF0ZU9wZXJhdGlvbnM6IG5ldyBET01DaGFuZ2VzSW1wbChkb2N1bWVudCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmRlbGVnYXRlID0gbmV3IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbChkZWxlZ2F0ZSk7XG4gIH1cblxuICBwcm90b2NvbEZvclVSTCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUucHJvdG9jb2xGb3JVUkwodXJsKTtcbiAgfVxuXG4gIGl0ZXJhYmxlRm9yKHJlZjogUmVmZXJlbmNlLCBpbnB1dEtleTogdW5rbm93bik6IE9wYXF1ZUl0ZXJhYmxlIHtcbiAgICBsZXQga2V5ID0gU3RyaW5nKGlucHV0S2V5KTtcbiAgICBsZXQgZGVmID0gdGhpcy5kZWxlZ2F0ZS5pdGVyYWJsZTtcblxuICAgIGxldCBrZXlGb3IgPSBrZXkgaW4gZGVmLm5hbWVkID8gZGVmLm5hbWVkW2tleV0gOiBkZWYuZGVmYXVsdChrZXkpO1xuXG4gICAgcmV0dXJuIG5ldyBJdGVyYWJsZUltcGwocmVmLCBrZXlGb3IpO1xuICB9XG5cbiAgdG9Db25kaXRpb25hbFJlZmVyZW5jZShpbnB1dDogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSk6IFZlcnNpb25lZFJlZmVyZW5jZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBDb25kaXRpb25hbFJlZmVyZW5jZShpbnB1dCwgdGhpcy5kZWxlZ2F0ZS50b0Jvb2wpO1xuICB9XG5cbiAgYXR0cmlidXRlRm9yKFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgYXR0cjogc3RyaW5nLFxuICAgIGlzVHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248QXR0ck5hbWVzcGFjZT5cbiAgKTogRHluYW1pY0F0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUuYXR0cmlidXRlRm9yKGVsZW1lbnQsIGF0dHIsIGlzVHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluVHJhbnNhY3Rpb24oZW52OiBFbnZpcm9ubWVudCwgY2I6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgaWYgKCFlbnZbVFJBTlNBQ1RJT05dKSB7XG4gICAgZW52LmJlZ2luKCk7XG4gICAgdHJ5IHtcbiAgICAgIGNiKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGVudi5jb21taXQoKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY2IoKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRGVmYXVsdEVudmlyb25tZW50IGV4dGVuZHMgRW52aXJvbm1lbnRJbXBsIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IEVudmlyb25tZW50T3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgbGV0IGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50IGFzIFNpbXBsZURvY3VtZW50O1xuICAgICAgbGV0IGFwcGVuZE9wZXJhdGlvbnMgPSBuZXcgRE9NVHJlZUNvbnN0cnVjdGlvbihkb2N1bWVudCk7XG4gICAgICBsZXQgdXBkYXRlT3BlcmF0aW9ucyA9IG5ldyBET01DaGFuZ2VzSW1wbChkb2N1bWVudCk7XG4gICAgICBvcHRpb25zID0geyBhcHBlbmRPcGVyYXRpb25zLCB1cGRhdGVPcGVyYXRpb25zIH07XG4gICAgfVxuXG4gICAgc3VwZXIob3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRW52aXJvbm1lbnRJbXBsO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==