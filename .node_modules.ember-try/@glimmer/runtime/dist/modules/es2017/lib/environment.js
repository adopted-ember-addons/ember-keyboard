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
export class ScopeImpl {
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
            refs[i] = UNDEFINED_REFERENCE;
        }
        return new ScopeImpl(refs, null, null, null).init({ self });
    }
    static sized(size = 0) {
        let refs = new Array(size + 1);
        for (let i = 0; i <= size; i++) {
            refs[i] = UNDEFINED_REFERENCE;
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
        return block === UNDEFINED_REFERENCE ? null : block;
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
export const TRANSACTION = 'TRANSACTION [c3938885-aba0-422f-b540-3fd3431c78b5]';
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
            destructors[i][DROP]();
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
export class EnvironmentImpl {
    constructor({ appendOperations, updateOperations }) {
        this[_a] = null;
        this.appendOperations = appendOperations;
        this.updateOperations = updateOperations;
    }
    toConditionalReference(reference) {
        return new ConditionalReference(reference, toBool);
    }
    getAppendOperations() {
        return this.appendOperations;
    }
    getDOM() {
        return this.updateOperations;
    }
    begin() {
        (false && assert(!this[TRANSACTION], 'A glimmer transaction was begun, but one already exists. You may have a nested transaction, possibly caused by an earlier runtime exception while rendering. Please check your console for the stack trace of any prior exceptions.'));

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
        return dynamicAttribute(element, attr, namespace);
    }
}
_a = TRANSACTION;
export class RuntimeEnvironmentDelegateImpl {
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
            return dynamicAttribute(element, attr, namespace);
        }
    }
}
function legacyProtocolForURL(url) {
    if (typeof window === 'undefined') {
        let match = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i.exec(url);
        return match && match[1] ? match[1].toLowerCase() : '';
    }
    let anchor = window.document.createElement('a');
    anchor.href = url;
    return anchor.protocol;
}
export class DefaultRuntimeResolver {
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
export function AotRuntime(document, program, resolver = {}, delegate = {}) {
    let env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    return {
        env,
        resolver: new DefaultRuntimeResolver(resolver),
        program: RuntimeProgramImpl.hydrate(program)
    };
}
// TODO: There are a lot of variants here. Some are here for transitional purposes
// and some might be GCable once the design stabilizes.
export function CustomJitRuntime(resolver, context, env) {
    let program = new RuntimeProgramImpl(context.program.constants, context.program.heap);
    return {
        env,
        resolver: new DefaultRuntimeResolver(resolver),
        program
    };
}
export function JitRuntime(document, resolver = {}, delegate = {}) {
    let env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    let constants = new Constants();
    let heap = new HeapImpl();
    let program = new RuntimeProgramImpl(constants, heap);
    return {
        env,
        resolver: new DefaultRuntimeResolver(resolver),
        program
    };
}
export function JitRuntimeFromProgram(document, program, resolver = {}, delegate = {}) {
    let env = new RuntimeEnvironment(document, new RuntimeEnvironmentDelegateImpl(delegate));
    return {
        env,
        resolver: new DefaultRuntimeResolver(resolver),
        program
    };
}
export class RuntimeEnvironment extends EnvironmentImpl {
    constructor(document, delegate) {
        super({
            appendOperations: new DOMTreeConstruction(document),
            updateOperations: new DOMChangesImpl(document)
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
        return new IterableImpl(ref, keyFor);
    }
    toConditionalReference(input) {
        return new ConditionalReference(input, this.delegate.toBool);
    }
    attributeFor(element, attr, isTrusting, namespace) {
        return this.delegate.attributeFor(element, attr, isTrusting, namespace);
    }
}
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
export class DefaultEnvironment extends EnvironmentImpl {
    constructor(options) {
        if (!options) {
            let document = window.document;
            let appendOperations = new DOMTreeConstruction(document);
            let updateOperations = new DOMChangesImpl(document);
            options = { appendOperations, updateOperations };
        }
        super(options);
    }
}
export default EnvironmentImpl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2Vudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFtQ0EsU0FDRSxZQURGLFFBUU8sb0JBUlA7QUFTQSxTQUFTLE1BQVQsRUFBaUIsSUFBakIsUUFBNkMsZUFBN0M7QUFFQSxTQUFTLGNBQVQsRUFBeUIsbUJBQXpCLFFBQW9ELGNBQXBEO0FBQ0EsU0FBUyxvQkFBVCxFQUErQixtQkFBL0IsUUFBMEQsY0FBMUQ7QUFDQSxTQUEyQixnQkFBM0IsUUFBbUQseUJBQW5EO0FBQ0EsU0FBUyxrQkFBVCxFQUE2QixTQUE3QixFQUF3QyxRQUF4QyxRQUF3RCxrQkFBeEQ7QUFFQSxPQUFNLFNBQVUsZ0JBQVYsQ0FBMkIsQ0FBM0IsRUFBdUM7QUFDM0MsUUFBSSxNQUFNLElBQU4sSUFBYyxNQUFNLE9BQU4sQ0FBYyxDQUFkLENBQWxCLEVBQW9DLE9BQU8sS0FBUDtBQUNwQyxXQUFPLElBQVA7QUFDRDtBQUVELE9BQU0sTUFBTyxTQUFQLENBQWdCO0FBcUJwQjtBQUNFO0FBQ1MsU0FGWCxFQUdVLFdBSFY7QUFJRTtBQUNRLGFBTFY7QUFNRTtBQUNRLGNBUFYsRUFPMEQ7QUFML0MsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNELGFBQUEsV0FBQSxHQUFBLFdBQUE7QUFFQSxhQUFBLFNBQUEsR0FBQSxTQUFBO0FBRUEsYUFBQSxVQUFBLEdBQUEsVUFBQTtBQUNOO0FBNUJKLFdBQU8sSUFBUCxDQUFxQyxJQUFyQyxFQUFtRSxPQUFPLENBQTFFLEVBQTJFO0FBQ3pFLFlBQUksT0FBaUMsSUFBSSxLQUFKLENBQVUsT0FBTyxDQUFqQixDQUFyQztBQUVBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsS0FBSyxJQUFyQixFQUEyQixHQUEzQixFQUFnQztBQUM5QixpQkFBSyxDQUFMLElBQVUsbUJBQVY7QUFDRDtBQUVELGVBQU8sSUFBSSxTQUFKLENBQWlCLElBQWpCLEVBQXVCLElBQXZCLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLEVBQXlDLElBQXpDLENBQThDLEVBQUUsSUFBRixFQUE5QyxDQUFQO0FBQ0Q7QUFFRCxXQUFPLEtBQVAsQ0FBc0MsT0FBTyxDQUE3QyxFQUE4QztBQUM1QyxZQUFJLE9BQWlDLElBQUksS0FBSixDQUFVLE9BQU8sQ0FBakIsQ0FBckM7QUFFQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLEtBQUssSUFBckIsRUFBMkIsR0FBM0IsRUFBZ0M7QUFDOUIsaUJBQUssQ0FBTCxJQUFVLG1CQUFWO0FBQ0Q7QUFFRCxlQUFPLElBQUksU0FBSixDQUFjLElBQWQsRUFBb0IsSUFBcEIsRUFBMEIsSUFBMUIsRUFBZ0MsSUFBaEMsQ0FBUDtBQUNEO0FBWUQsU0FBSyxFQUFFLElBQUYsRUFBTCxFQUErQztBQUM3QyxhQUFLLEtBQUwsQ0FBVyxDQUFYLElBQWdCLElBQWhCO0FBQ0EsZUFBTyxJQUFQO0FBQ0Q7QUFFRCxjQUFPO0FBQ0wsZUFBTyxLQUFLLEdBQUwsQ0FBaUMsQ0FBakMsQ0FBUDtBQUNEO0FBRUQsY0FBVSxNQUFWLEVBQXdCO0FBQ3RCLGVBQU8sS0FBSyxHQUFMLENBQWlDLE1BQWpDLENBQVA7QUFDRDtBQUVELGFBQVMsTUFBVCxFQUF1QjtBQUNyQixZQUFJLFFBQVEsS0FBSyxHQUFMLENBQVMsTUFBVCxDQUFaO0FBQ0EsZUFBTyxVQUFVLG1CQUFWLEdBQWdDLElBQWhDLEdBQXdDLEtBQS9DO0FBQ0Q7QUFFRCxtQkFBWTtBQUNWLGVBQU8sS0FBSyxTQUFaO0FBQ0Q7QUFFRCxvQkFBYTtBQUNYLGVBQU8sS0FBSyxVQUFaO0FBQ0Q7QUFFRCxTQUFLLE1BQUwsRUFBcUIsS0FBckIsRUFBd0M7QUFDdEMsYUFBSyxHQUFMLENBQVMsTUFBVCxFQUFpQixLQUFqQjtBQUNEO0FBRUQsYUFBUyxJQUFULEVBQXFDO0FBQ25DLGFBQUssR0FBTCxDQUFpQyxDQUFqQyxFQUFvQyxJQUFwQztBQUNEO0FBRUQsZUFBVyxNQUFYLEVBQTJCLEtBQTNCLEVBQXdEO0FBQ3RELGFBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsS0FBakI7QUFDRDtBQUVELGNBQVUsTUFBVixFQUEwQixLQUExQixFQUFzRDtBQUNwRCxhQUFLLEdBQUwsQ0FBZ0MsTUFBaEMsRUFBd0MsS0FBeEM7QUFDRDtBQUVELGtCQUFjLEdBQWQsRUFBNkM7QUFDM0MsYUFBSyxTQUFMLEdBQWlCLEdBQWpCO0FBQ0Q7QUFFRCxtQkFBZSxHQUFmLEVBQWdEO0FBQzlDLGFBQUssVUFBTCxHQUFrQixHQUFsQjtBQUNEO0FBRUQsb0JBQWdCLEtBQWhCLEVBQXVDO0FBQ3JDLGFBQUssV0FBTCxHQUFtQixLQUFuQjtBQUNEO0FBRUQscUJBQWM7QUFDWixlQUFPLEtBQUssV0FBWjtBQUNEO0FBRUQsWUFBSztBQUNILGVBQU8sSUFBSSxTQUFKLENBQWMsS0FBSyxLQUFMLENBQVcsS0FBWCxFQUFkLEVBQWtDLEtBQUssV0FBdkMsRUFBb0QsS0FBSyxTQUF6RCxFQUFvRSxLQUFLLFVBQXpFLENBQVA7QUFDRDtBQUVPLFFBQTRCLEtBQTVCLEVBQXlDO0FBQy9DLFlBQUksU0FBUyxLQUFLLEtBQUwsQ0FBVyxNQUF4QixFQUFnQztBQUM5QixrQkFBTSxJQUFJLFVBQUosQ0FBZSxvQkFBb0IsS0FBSyx1QkFBdUIsS0FBSyxLQUFMLENBQVcsTUFBTSxFQUFoRixDQUFOO0FBQ0Q7QUFFRCxlQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBUDtBQUNEO0FBRU8sUUFBNEIsS0FBNUIsRUFBMkMsS0FBM0MsRUFBbUQ7QUFDekQsWUFBSSxTQUFTLEtBQUssS0FBTCxDQUFXLE1BQXhCLEVBQWdDO0FBQzlCLGtCQUFNLElBQUksVUFBSixDQUFlLG9CQUFvQixLQUFLLHVCQUF1QixLQUFLLEtBQUwsQ0FBVyxNQUFNLEVBQWhGLENBQU47QUFDRDtBQUVELGFBQUssS0FBTCxDQUFXLEtBQVgsSUFBb0IsS0FBcEI7QUFDRDtBQTNHbUI7QUE4R3RCLE9BQU8sTUFBTSxjQUFpQyxvREFBdkM7QUFFUCxNQUFNLGVBQU4sQ0FBcUI7QUFBckIsa0JBQUE7QUFHUyxhQUFBLHdCQUFBLEdBQThDLEVBQTlDO0FBQ0EsYUFBQSx5QkFBQSxHQUF1QyxFQUF2QztBQUNBLGFBQUEsK0JBQUEsR0FBcUQsRUFBckQ7QUFDQSxhQUFBLHdCQUFBLEdBQXNDLEVBQXRDO0FBQ0EsYUFBQSxpQkFBQSxHQUErQixFQUEvQjtBQUNBLGFBQUEsZUFBQSxHQUFpRCxFQUFqRDtBQUNBLGFBQUEsaUJBQUEsR0FBK0IsRUFBL0I7QUFDQSxhQUFBLGVBQUEsR0FBaUQsRUFBakQ7QUFDQSxhQUFBLFdBQUEsR0FBc0IsRUFBdEI7QUFpRVI7QUEvREMsY0FBVSxTQUFWLEVBQThCLE9BQTlCLEVBQXlEO0FBQ3ZELGFBQUssaUJBQUwsQ0FBdUIsSUFBdkIsQ0FBNEIsU0FBNUI7QUFDQSxhQUFLLGVBQUwsQ0FBcUIsSUFBckIsQ0FBMEIsT0FBMUI7QUFDRDtBQUVELGNBQVUsU0FBVixFQUE4QixPQUE5QixFQUF5RDtBQUN2RCxhQUFLLGlCQUFMLENBQXVCLElBQXZCLENBQTRCLFNBQTVCO0FBQ0EsYUFBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLE9BQTFCO0FBQ0Q7QUFFRCw0QkFBd0IsUUFBeEIsRUFBMkMsT0FBM0MsRUFBbUU7QUFDakUsYUFBSyx5QkFBTCxDQUErQixJQUEvQixDQUFvQyxRQUFwQztBQUNBLGFBQUssd0JBQUwsQ0FBOEIsSUFBOUIsQ0FBbUMsT0FBbkM7QUFDRDtBQUVELDJCQUF1QixRQUF2QixFQUEwQyxPQUExQyxFQUFrRTtBQUNoRSxhQUFLLHdCQUFMLENBQThCLElBQTlCLENBQW1DLFFBQW5DO0FBQ0EsYUFBSywrQkFBTCxDQUFxQyxJQUFyQyxDQUEwQyxPQUExQztBQUNEO0FBRUQsZUFBVyxDQUFYLEVBQWtCO0FBQ2hCLGFBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixDQUF0QjtBQUNEO0FBRUQsYUFBTTtBQUNKLFlBQUksRUFBRSxpQkFBRixFQUFxQixlQUFyQixLQUF5QyxJQUE3QztBQUVBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxrQkFBa0IsTUFBdEMsRUFBOEMsR0FBOUMsRUFBbUQ7QUFDakQsZ0JBQUksWUFBWSxrQkFBa0IsQ0FBbEIsQ0FBaEI7QUFDQSxnQkFBSSxVQUFVLGdCQUFnQixDQUFoQixDQUFkO0FBQ0Esb0JBQVEsU0FBUixDQUFrQixTQUFsQjtBQUNEO0FBRUQsWUFBSSxFQUFFLGlCQUFGLEVBQXFCLGVBQXJCLEtBQXlDLElBQTdDO0FBRUEsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLGtCQUFrQixNQUF0QyxFQUE4QyxHQUE5QyxFQUFtRDtBQUNqRCxnQkFBSSxZQUFZLGtCQUFrQixDQUFsQixDQUFoQjtBQUNBLGdCQUFJLFVBQVUsZ0JBQWdCLENBQWhCLENBQWQ7QUFDQSxvQkFBUSxTQUFSLENBQWtCLFNBQWxCO0FBQ0Q7QUFFRCxZQUFJLEVBQUUsV0FBRixLQUFrQixJQUF0QjtBQUVBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxZQUFZLE1BQWhDLEVBQXdDLEdBQXhDLEVBQTZDO0FBQzNDLHdCQUFZLENBQVosRUFBZSxJQUFmO0FBQ0Q7QUFFRCxZQUFJLEVBQUUsd0JBQUYsRUFBNEIseUJBQTVCLEtBQTBELElBQTlEO0FBRUEsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLHlCQUF5QixNQUE3QyxFQUFxRCxHQUFyRCxFQUEwRDtBQUN4RCxnQkFBSSxXQUFXLDBCQUEwQixDQUExQixDQUFmO0FBQ0EsZ0JBQUksVUFBVSx5QkFBeUIsQ0FBekIsQ0FBZDtBQUNBLG9CQUFRLE9BQVIsQ0FBZ0IsUUFBaEI7QUFDRDtBQUVELFlBQUksRUFBRSwrQkFBRixFQUFtQyx3QkFBbkMsS0FBZ0UsSUFBcEU7QUFFQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksZ0NBQWdDLE1BQXBELEVBQTRELEdBQTVELEVBQWlFO0FBQy9ELGdCQUFJLFdBQVcseUJBQXlCLENBQXpCLENBQWY7QUFDQSxnQkFBSSxVQUFVLGdDQUFnQyxDQUFoQyxDQUFkO0FBQ0Esb0JBQVEsTUFBUixDQUFlLFFBQWY7QUFDRDtBQUNGO0FBM0VrQjtBQWdGckIsU0FBUyxNQUFULENBQWdCLEtBQWhCLEVBQThCO0FBQzVCLFdBQU8sQ0FBQyxDQUFDLEtBQVQ7QUFDRDtBQUVELE9BQU0sTUFBZ0IsZUFBaEIsQ0FBK0I7QUFNbkMsZ0JBQVksRUFBRSxnQkFBRixFQUFvQixnQkFBcEIsRUFBWixFQUFzRTtBQUx0RSxhQUFBLEVBQUEsSUFBeUMsSUFBekM7QUFNRSxhQUFLLGdCQUFMLEdBQXdCLGdCQUF4QjtBQUNBLGFBQUssZ0JBQUwsR0FBd0IsZ0JBQXhCO0FBQ0Q7QUFFRCwyQkFBdUIsU0FBdkIsRUFBMkM7QUFDekMsZUFBTyxJQUFJLG9CQUFKLENBQXlCLFNBQXpCLEVBQW9DLE1BQXBDLENBQVA7QUFDRDtBQUtELDBCQUFtQjtBQUNqQixlQUFPLEtBQUssZ0JBQVo7QUFDRDtBQUNELGFBQU07QUFDSixlQUFPLEtBQUssZ0JBQVo7QUFDRDtBQUVELFlBQUs7QUFBQSxrQkFDSCxPQUNFLENBQUMsS0FBSyxXQUFMLENBREgsRUFFRSxxT0FGRixDQURHOztBQU1ILGFBQUssV0FBTCxJQUFvQixJQUFJLGVBQUosRUFBcEI7QUFDRDtBQUVELFFBQVksV0FBWixHQUF1QjtBQUNyQixlQUFjLEtBQUssV0FBTCxDQUFkO0FBQ0Q7QUFFRCxjQUFVLFNBQVYsRUFBOEIsT0FBOUIsRUFBeUQ7QUFDdkQsYUFBSyxXQUFMLENBQWlCLFNBQWpCLENBQTJCLFNBQTNCLEVBQXNDLE9BQXRDO0FBQ0Q7QUFFRCxjQUFVLFNBQVYsRUFBOEIsT0FBOUIsRUFBeUQ7QUFDdkQsYUFBSyxXQUFMLENBQWlCLFNBQWpCLENBQTJCLFNBQTNCLEVBQXNDLE9BQXRDO0FBQ0Q7QUFFRCw0QkFBd0IsUUFBeEIsRUFBMkMsT0FBM0MsRUFBbUU7QUFDakUsYUFBSyxXQUFMLENBQWlCLHVCQUFqQixDQUF5QyxRQUF6QyxFQUFtRCxPQUFuRDtBQUNEO0FBRUQsMkJBQXVCLFFBQXZCLEVBQTBDLE9BQTFDLEVBQWtFO0FBQ2hFLGFBQUssV0FBTCxDQUFpQixzQkFBakIsQ0FBd0MsUUFBeEMsRUFBa0QsT0FBbEQ7QUFDRDtBQUVELGVBQVcsQ0FBWCxFQUFrQjtBQUNoQixhQUFLLFdBQUwsQ0FBaUIsVUFBakIsQ0FBNEIsQ0FBNUI7QUFDRDtBQUVELGFBQU07QUFDSixZQUFJLGNBQWMsS0FBSyxXQUF2QjtBQUNBLGFBQUssV0FBTCxJQUFvQixJQUFwQjtBQUNBLG9CQUFZLE1BQVo7QUFDRDtBQUVELGlCQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsV0FIRixFQUlFLFlBQW1DLElBSnJDLEVBSXlDO0FBRXZDLGVBQU8saUJBQWlCLE9BQWpCLEVBQTBCLElBQTFCLEVBQWdDLFNBQWhDLENBQVA7QUFDRDtBQXZFa0M7S0FDbEMsVztBQXFGSCxPQUFNLE1BQU8sOEJBQVAsQ0FBcUM7QUFHekMsZ0JBQW9CLFFBQW9DLEVBQXhELEVBQTBEO0FBQXRDLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFpQ1gsYUFBQSxRQUFBLEdBQW1DO0FBQzFDLG1CQUFPO0FBQ0wsMEJBQVUsQ0FBQyxDQUFELEVBQUksS0FBSixLQUFjLE9BQU8sS0FBUCxDQURuQjtBQUVMLDhCQUFjLFFBQVEsT0FBTyxJQUFQLENBRmpCO0FBR0wsNkJBQWEsUUFBUTtBQUhoQixhQURtQztBQU0xQyxxQkFBUyxPQUFPLFFBQVEsS0FBSyxHQUFMO0FBTmtCLFNBQW5DO0FBaENQLFlBQUksTUFBTSxNQUFWLEVBQWtCO0FBQ2hCLGlCQUFLLE1BQUwsR0FBYyxNQUFNLE1BQXBCO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsaUJBQUssTUFBTCxHQUFjLFNBQVMsQ0FBQyxDQUFDLEtBQXpCO0FBQ0Q7QUFDRjtBQUVELG1CQUFlLEdBQWYsRUFBMEI7QUFDeEIsWUFBSSxLQUFLLEtBQUwsQ0FBVyxjQUFmLEVBQStCO0FBQzdCLG1CQUFPLEtBQUssS0FBTCxDQUFXLGNBQVgsQ0FBMEIsR0FBMUIsQ0FBUDtBQUNELFNBRkQsTUFFTyxJQUFJLE9BQU8sR0FBUCxLQUFlLFFBQWYsSUFBMkIsT0FBTyxHQUFQLEtBQWUsV0FBOUMsRUFBMkQ7QUFDaEUsbUJBQU8scUJBQXFCLEdBQXJCLENBQVA7QUFDRCxTQUZNLE1BRUEsSUFBSSxPQUFPLFFBQVAsS0FBb0IsV0FBeEIsRUFBcUM7QUFDMUMsbUJBQU8sSUFBSSxHQUFKLENBQVEsR0FBUixFQUFhLFNBQVMsT0FBdEIsRUFBK0IsUUFBdEM7QUFDRCxTQUZNLE1BRUE7QUFDTCxtQkFBTyxJQUFJLEdBQUosQ0FBUSxHQUFSLEVBQWEseUJBQWIsRUFBd0MsUUFBL0M7QUFDRDtBQUNGO0FBRUQsaUJBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxVQUhGLEVBSUUsU0FKRixFQUlrQztBQUVoQyxZQUFJLEtBQUssS0FBTCxDQUFXLFlBQWYsRUFBNkI7QUFDM0IsbUJBQU8sS0FBSyxLQUFMLENBQVcsWUFBWCxDQUF3QixPQUF4QixFQUFpQyxJQUFqQyxFQUF1QyxVQUF2QyxFQUFtRCxTQUFuRCxDQUFQO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsbUJBQU8saUJBQWlCLE9BQWpCLEVBQTBCLElBQTFCLEVBQWdDLFNBQWhDLENBQVA7QUFDRDtBQUNGO0FBbEN3QztBQThDM0MsU0FBUyxvQkFBVCxDQUE4QixHQUE5QixFQUF5QztBQUN2QyxRQUFJLE9BQU8sTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNqQyxZQUFJLFFBQVEsMENBQTBDLElBQTFDLENBQStDLEdBQS9DLENBQVo7QUFDQSxlQUFPLFNBQVMsTUFBTSxDQUFOLENBQVQsR0FBb0IsTUFBTSxDQUFOLEVBQVMsV0FBVCxFQUFwQixHQUE2QyxFQUFwRDtBQUNEO0FBRUQsUUFBSSxTQUFTLE9BQU8sUUFBUCxDQUFnQixhQUFoQixDQUE4QixHQUE5QixDQUFiO0FBQ0EsV0FBTyxJQUFQLEdBQWMsR0FBZDtBQUNBLFdBQU8sT0FBTyxRQUFkO0FBQ0Q7QUFFRCxPQUFNLE1BQU8sc0JBQVAsQ0FBNkI7QUFFakMsZ0JBQW9CLEtBQXBCLEVBQWtEO0FBQTlCLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFBa0M7QUFFdEQsb0JBQWdCLElBQWhCLEVBQThCLFFBQTlCLEVBQWdEO0FBQzlDLFlBQUksS0FBSyxLQUFMLENBQVcsZUFBZixFQUFnQztBQUM5QixnQkFBSSxZQUFZLEtBQUssS0FBTCxDQUFXLGVBQVgsQ0FBMkIsSUFBM0IsRUFBaUMsUUFBakMsQ0FBaEI7QUFFQSxnQkFBSSxjQUFjLFNBQWxCLEVBQTZCO0FBQzNCLHNCQUFNLElBQUksS0FBSixDQUNKLHdCQUF3QixJQUFJLFVBQVUsUUFBUSx3Q0FEMUMsQ0FBTjtBQUdEO0FBRUQsbUJBQU8sU0FBUDtBQUNELFNBVkQsTUFVTztBQUNMLGtCQUFNLElBQUksS0FBSixDQUFVLHFEQUFWLENBQU47QUFDRDtBQUNGO0FBRUQsa0JBQWMsSUFBZCxFQUE0QixRQUE1QixFQUE4QztBQUM1QyxZQUFJLEtBQUssS0FBTCxDQUFXLGFBQWYsRUFBOEI7QUFDNUIsZ0JBQUksVUFBVSxLQUFLLEtBQUwsQ0FBVyxhQUFYLENBQXlCLElBQXpCLEVBQStCLFFBQS9CLENBQWQ7QUFFQSxnQkFBSSxZQUFZLFNBQWhCLEVBQTJCO0FBQ3pCLHNCQUFNLElBQUksS0FBSixDQUNKLHNCQUFzQixJQUFJLFVBQVUsUUFBUSxzQ0FEeEMsQ0FBTjtBQUdEO0FBRUQsbUJBQU8sT0FBUDtBQUNELFNBVkQsTUFVTztBQUNMLGtCQUFNLElBQUksS0FBSixDQUFVLG1EQUFWLENBQU47QUFDRDtBQUNGO0FBRUQsWUFBaUMsTUFBakMsRUFBK0M7QUFDN0MsWUFBSSxLQUFLLEtBQUwsQ0FBVyxPQUFmLEVBQXdCO0FBQ3RCLGdCQUFJLFdBQVcsS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixNQUFuQixDQUFmO0FBRUEsZ0JBQUksYUFBYSxTQUFqQixFQUE0QjtBQUMxQixzQkFBTSxJQUFJLEtBQUosQ0FBVSxxQkFBcUIsTUFBTSwrQkFBckMsQ0FBTjtBQUNEO0FBRUQsbUJBQU8sUUFBUDtBQUNELFNBUkQsTUFRTztBQUNMLGtCQUFNLElBQUksS0FBSixDQUFVLDZDQUFWLENBQU47QUFDRDtBQUNGO0FBRUQsZUFBVyxPQUFYLEVBQXNDO0FBQ3BDLFlBQUksS0FBSyxLQUFMLENBQVcsVUFBZixFQUEyQjtBQUN6QixnQkFBSSxXQUFXLEtBQUssS0FBTCxDQUFXLFVBQVgsQ0FBc0IsT0FBdEIsQ0FBZjtBQUVBLGdCQUFJLGFBQWEsU0FBakIsRUFBNEI7QUFDMUIsc0JBQU0sSUFBSSxLQUFKLENBQVUscUJBQXFCLElBQUksa0NBQW5DLENBQU47QUFDRDtBQUVELG1CQUFPLFFBQVA7QUFDRCxTQVJELE1BUU87QUFDTCxrQkFBTSxJQUFJLEtBQUosQ0FBVSxnREFBVixDQUFOO0FBQ0Q7QUFDRjtBQUVELGtCQUFjLE9BQWQsRUFBd0I7QUFDdEIsWUFBSSxLQUFLLEtBQUwsQ0FBVyxhQUFmLEVBQThCO0FBQzVCLGdCQUFJLGFBQWEsS0FBSyxLQUFMLENBQVcsYUFBWCxDQUF5QixPQUF6QixDQUFqQjtBQUVBLGdCQUFJLGVBQWUsU0FBbkIsRUFBOEI7QUFDNUIsc0JBQU0sSUFBSSxLQUFKLENBQ0osZ0NBQWdDLEtBQUssU0FBTCxDQUM5QixPQUQ4QixDQUUvQixxQ0FIRyxDQUFOO0FBS0Q7QUFFRCxtQkFBTyxVQUFQO0FBQ0QsU0FaRCxNQVlPO0FBQ0wsa0JBQU0sSUFBSSxLQUFKLENBQVUsbURBQVYsQ0FBTjtBQUNEO0FBQ0Y7QUFoRmdDO0FBbUZuQyxPQUFNLFNBQVUsVUFBVixDQUNKLFFBREksRUFFSixPQUZJLEVBR0osV0FBb0MsRUFIaEMsRUFJSixXQUF1QyxFQUpuQyxFQUlxQztBQUV6QyxRQUFJLE1BQU0sSUFBSSxrQkFBSixDQUF1QixRQUF2QixFQUFpQyxJQUFJLDhCQUFKLENBQW1DLFFBQW5DLENBQWpDLENBQVY7QUFFQSxXQUFPO0FBQ0wsV0FESztBQUVMLGtCQUFVLElBQUksc0JBQUosQ0FBMkIsUUFBM0IsQ0FGTDtBQUdMLGlCQUFTLG1CQUFtQixPQUFuQixDQUEyQixPQUEzQjtBQUhKLEtBQVA7QUFLRDtBQVlEO0FBQ0E7QUFDQSxPQUFNLFNBQVUsZ0JBQVYsQ0FDSixRQURJLEVBRUosT0FGSSxFQUtKLEdBTEksRUFLWTtBQUVoQixRQUFJLFVBQVUsSUFBSSxrQkFBSixDQUF1QixRQUFRLE9BQVIsQ0FBZ0IsU0FBdkMsRUFBa0QsUUFBUSxPQUFSLENBQWdCLElBQWxFLENBQWQ7QUFFQSxXQUFPO0FBQ0wsV0FESztBQUVMLGtCQUFVLElBQUksc0JBQUosQ0FBMkIsUUFBM0IsQ0FGTDtBQUdMO0FBSEssS0FBUDtBQUtEO0FBRUQsT0FBTSxTQUFVLFVBQVYsQ0FDSixRQURJLEVBRUosV0FBb0MsRUFGaEMsRUFHSixXQUF1QyxFQUhuQyxFQUdxQztBQUV6QyxRQUFJLE1BQU0sSUFBSSxrQkFBSixDQUF1QixRQUF2QixFQUFpQyxJQUFJLDhCQUFKLENBQW1DLFFBQW5DLENBQWpDLENBQVY7QUFFQSxRQUFJLFlBQVksSUFBSSxTQUFKLEVBQWhCO0FBQ0EsUUFBSSxPQUFPLElBQUksUUFBSixFQUFYO0FBQ0EsUUFBSSxVQUFVLElBQUksa0JBQUosQ0FBdUIsU0FBdkIsRUFBa0MsSUFBbEMsQ0FBZDtBQUVBLFdBQU87QUFDTCxXQURLO0FBRUwsa0JBQVUsSUFBSSxzQkFBSixDQUEyQixRQUEzQixDQUZMO0FBR0w7QUFISyxLQUFQO0FBS0Q7QUFFRCxPQUFNLFNBQVUscUJBQVYsQ0FDSixRQURJLEVBRUosT0FGSSxFQUdKLFdBQW9DLEVBSGhDLEVBSUosV0FBdUMsRUFKbkMsRUFJcUM7QUFFekMsUUFBSSxNQUFNLElBQUksa0JBQUosQ0FBdUIsUUFBdkIsRUFBaUMsSUFBSSw4QkFBSixDQUFtQyxRQUFuQyxDQUFqQyxDQUFWO0FBRUEsV0FBTztBQUNMLFdBREs7QUFFTCxrQkFBVSxJQUFJLHNCQUFKLENBQTJCLFFBQTNCLENBRkw7QUFHTDtBQUhLLEtBQVA7QUFLRDtBQUVELE9BQU0sTUFBTyxrQkFBUCxTQUFrQyxlQUFsQyxDQUFpRDtBQUdyRCxnQkFBWSxRQUFaLEVBQXNDLFFBQXRDLEVBQThFO0FBQzVFLGNBQU07QUFDSiw4QkFBa0IsSUFBSSxtQkFBSixDQUF3QixRQUF4QixDQURkO0FBRUosOEJBQWtCLElBQUksY0FBSixDQUFtQixRQUFuQjtBQUZkLFNBQU47QUFLQSxhQUFLLFFBQUwsR0FBZ0IsSUFBSSw4QkFBSixDQUFtQyxRQUFuQyxDQUFoQjtBQUNEO0FBRUQsbUJBQWUsR0FBZixFQUEwQjtBQUN4QixlQUFPLEtBQUssUUFBTCxDQUFjLGNBQWQsQ0FBNkIsR0FBN0IsQ0FBUDtBQUNEO0FBRUQsZ0JBQVksR0FBWixFQUE0QixRQUE1QixFQUE2QztBQUMzQyxZQUFJLE1BQU0sT0FBTyxRQUFQLENBQVY7QUFDQSxZQUFJLE1BQU0sS0FBSyxRQUFMLENBQWMsUUFBeEI7QUFFQSxZQUFJLFNBQVMsT0FBTyxJQUFJLEtBQVgsR0FBbUIsSUFBSSxLQUFKLENBQVUsR0FBVixDQUFuQixHQUFvQyxJQUFJLE9BQUosQ0FBWSxHQUFaLENBQWpEO0FBRUEsZUFBTyxJQUFJLFlBQUosQ0FBaUIsR0FBakIsRUFBc0IsTUFBdEIsQ0FBUDtBQUNEO0FBRUQsMkJBQXVCLEtBQXZCLEVBQW9EO0FBQ2xELGVBQU8sSUFBSSxvQkFBSixDQUF5QixLQUF6QixFQUFnQyxLQUFLLFFBQUwsQ0FBYyxNQUE5QyxDQUFQO0FBQ0Q7QUFFRCxpQkFDRSxPQURGLEVBRUUsSUFGRixFQUdFLFVBSEYsRUFJRSxTQUpGLEVBSWtDO0FBRWhDLGVBQU8sS0FBSyxRQUFMLENBQWMsWUFBZCxDQUEyQixPQUEzQixFQUFvQyxJQUFwQyxFQUEwQyxVQUExQyxFQUFzRCxTQUF0RCxDQUFQO0FBQ0Q7QUFwQ29EO0FBdUN2RCxPQUFNLFNBQVUsYUFBVixDQUF3QixHQUF4QixFQUEwQyxFQUExQyxFQUF3RDtBQUM1RCxRQUFJLENBQUMsSUFBSSxXQUFKLENBQUwsRUFBdUI7QUFDckIsWUFBSSxLQUFKO0FBQ0EsWUFBSTtBQUNGO0FBQ0QsU0FGRCxTQUVVO0FBQ1IsZ0JBQUksTUFBSjtBQUNEO0FBQ0YsS0FQRCxNQU9PO0FBQ0w7QUFDRDtBQUNGO0FBRUQsT0FBTSxNQUFnQixrQkFBaEIsU0FBMkMsZUFBM0MsQ0FBMEQ7QUFDOUQsZ0JBQVksT0FBWixFQUF3QztBQUN0QyxZQUFJLENBQUMsT0FBTCxFQUFjO0FBQ1osZ0JBQUksV0FBVyxPQUFPLFFBQXRCO0FBQ0EsZ0JBQUksbUJBQW1CLElBQUksbUJBQUosQ0FBd0IsUUFBeEIsQ0FBdkI7QUFDQSxnQkFBSSxtQkFBbUIsSUFBSSxjQUFKLENBQW1CLFFBQW5CLENBQXZCO0FBQ0Esc0JBQVUsRUFBRSxnQkFBRixFQUFvQixnQkFBcEIsRUFBVjtBQUNEO0FBRUQsY0FBTSxPQUFOO0FBQ0Q7QUFWNkQ7QUFhaEUsZUFBZSxlQUFmIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGljdCxcbiAgRHJvcCxcbiAgRW52aXJvbm1lbnQsXG4gIEVudmlyb25tZW50T3B0aW9ucyxcbiAgR2xpbW1lclRyZWVDaGFuZ2VzLFxuICBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbixcbiAgSml0T3JBb3RCbG9jayxcbiAgUGFydGlhbFNjb3BlLFxuICBTY29wZSxcbiAgU2NvcGVCbG9jayxcbiAgU2NvcGVTbG90LFxuICBUcmFuc2FjdGlvbixcbiAgVHJhbnNhY3Rpb25TeW1ib2wsXG4gIENvbXBpbGVyQXJ0aWZhY3RzLFxuICBXaXRoQ3JlYXRlSW5zdGFuY2UsXG4gIFJlc29sdmVkVmFsdWUsXG4gIFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlLFxuICBSdW50aW1lUHJvZ3JhbSxcbiAgTW9kaWZpZXJNYW5hZ2VyLFxuICBUZW1wbGF0ZSxcbiAgQW90UnVudGltZVJlc29sdmVyLFxuICBJbnZvY2F0aW9uLFxuICBKaXRSdW50aW1lQ29udGV4dCxcbiAgQW90UnVudGltZUNvbnRleHQsXG4gIEppdFJ1bnRpbWVSZXNvbHZlcixcbiAgUnVudGltZVJlc29sdmVyLFxuICBTeW50YXhDb21waWxhdGlvbkNvbnRleHQsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG4gIFJ1bnRpbWVIZWFwLFxuICBXaG9sZVByb2dyYW1Db21waWxhdGlvbkNvbnRleHQsXG4gIENvbXBpbGVUaW1lQ29uc3RhbnRzLFxuICBDb21waWxlVGltZUhlYXAsXG4gIE1hY3Jvcyxcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1xuICBJdGVyYWJsZUltcGwsXG4gIEl0ZXJhYmxlS2V5RGVmaW5pdGlvbnMsXG4gIE9wYXF1ZUl0ZXJhYmxlLFxuICBQYXRoUmVmZXJlbmNlLFxuICBSZWZlcmVuY2UsXG4gIFZlcnNpb25lZFBhdGhSZWZlcmVuY2UsXG4gIFZlcnNpb25lZFJlZmVyZW5jZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGFzc2VydCwgRFJPUCwgZXhwZWN0LCBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IEF0dHJOYW1lc3BhY2UsIFNpbXBsZURvY3VtZW50LCBTaW1wbGVFbGVtZW50IH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcbmltcG9ydCB7IERPTUNoYW5nZXNJbXBsLCBET01UcmVlQ29uc3RydWN0aW9uIH0gZnJvbSAnLi9kb20vaGVscGVyJztcbmltcG9ydCB7IENvbmRpdGlvbmFsUmVmZXJlbmNlLCBVTkRFRklORURfUkVGRVJFTkNFIH0gZnJvbSAnLi9yZWZlcmVuY2VzJztcbmltcG9ydCB7IER5bmFtaWNBdHRyaWJ1dGUsIGR5bmFtaWNBdHRyaWJ1dGUgfSBmcm9tICcuL3ZtL2F0dHJpYnV0ZXMvZHluYW1pYyc7XG5pbXBvcnQgeyBSdW50aW1lUHJvZ3JhbUltcGwsIENvbnN0YW50cywgSGVhcEltcGwgfSBmcm9tICdAZ2xpbW1lci9wcm9ncmFtJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2NvcGVSZWZlcmVuY2UoczogU2NvcGVTbG90KTogcyBpcyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgaWYgKHMgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheShzKSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGNsYXNzIFNjb3BlSW1wbDxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4gaW1wbGVtZW50cyBQYXJ0aWFsU2NvcGU8Qz4ge1xuICBzdGF0aWMgcm9vdDxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4oc2VsZjogUGF0aFJlZmVyZW5jZTx1bmtub3duPiwgc2l6ZSA9IDApOiBQYXJ0aWFsU2NvcGU8Qz4ge1xuICAgIGxldCByZWZzOiBQYXRoUmVmZXJlbmNlPHVua25vd24+W10gPSBuZXcgQXJyYXkoc2l6ZSArIDEpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gc2l6ZTsgaSsrKSB7XG4gICAgICByZWZzW2ldID0gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFNjb3BlSW1wbDxDPihyZWZzLCBudWxsLCBudWxsLCBudWxsKS5pbml0KHsgc2VsZiB9KTtcbiAgfVxuXG4gIHN0YXRpYyBzaXplZDxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4oc2l6ZSA9IDApOiBTY29wZTxDPiB7XG4gICAgbGV0IHJlZnM6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj5bXSA9IG5ldyBBcnJheShzaXplICsgMSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBzaXplOyBpKyspIHtcbiAgICAgIHJlZnNbaV0gPSBVTkRFRklORURfUkVGRVJFTkNFO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgU2NvcGVJbXBsKHJlZnMsIG51bGwsIG51bGwsIG51bGwpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLy8gdGhlIDB0aCBzbG90IGlzIGBzZWxmYFxuICAgIHJlYWRvbmx5IHNsb3RzOiBBcnJheTxTY29wZVNsb3Q8Qz4+LFxuICAgIHByaXZhdGUgY2FsbGVyU2NvcGU6IE9wdGlvbjxTY29wZTxDPj4sXG4gICAgLy8gbmFtZWQgYXJndW1lbnRzIGFuZCBibG9ja3MgcGFzc2VkIHRvIGEgbGF5b3V0IHRoYXQgdXNlcyBldmFsXG4gICAgcHJpdmF0ZSBldmFsU2NvcGU6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxDPj4+LFxuICAgIC8vIGxvY2FscyBpbiBzY29wZSB3aGVuIHRoZSBwYXJ0aWFsIHdhcyBpbnZva2VkXG4gICAgcHJpdmF0ZSBwYXJ0aWFsTWFwOiBPcHRpb248RGljdDxQYXRoUmVmZXJlbmNlPHVua25vd24+Pj5cbiAgKSB7fVxuXG4gIGluaXQoeyBzZWxmIH06IHsgc2VsZjogUGF0aFJlZmVyZW5jZTx1bmtub3duPiB9KTogdGhpcyB7XG4gICAgdGhpcy5zbG90c1swXSA9IHNlbGY7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRTZWxmKCk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIHJldHVybiB0aGlzLmdldDxQYXRoUmVmZXJlbmNlPHVua25vd24+PigwKTtcbiAgfVxuXG4gIGdldFN5bWJvbChzeW1ib2w6IG51bWJlcik6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj4ge1xuICAgIHJldHVybiB0aGlzLmdldDxQYXRoUmVmZXJlbmNlPHVua25vd24+PihzeW1ib2wpO1xuICB9XG5cbiAgZ2V0QmxvY2soc3ltYm9sOiBudW1iZXIpOiBPcHRpb248U2NvcGVCbG9jazxDPj4ge1xuICAgIGxldCBibG9jayA9IHRoaXMuZ2V0KHN5bWJvbCk7XG4gICAgcmV0dXJuIGJsb2NrID09PSBVTkRFRklORURfUkVGRVJFTkNFID8gbnVsbCA6IChibG9jayBhcyBTY29wZUJsb2NrPEM+KTtcbiAgfVxuXG4gIGdldEV2YWxTY29wZSgpOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Qz4+PiB7XG4gICAgcmV0dXJuIHRoaXMuZXZhbFNjb3BlO1xuICB9XG5cbiAgZ2V0UGFydGlhbE1hcCgpOiBPcHRpb248RGljdDxQYXRoUmVmZXJlbmNlPHVua25vd24+Pj4ge1xuICAgIHJldHVybiB0aGlzLnBhcnRpYWxNYXA7XG4gIH1cblxuICBiaW5kKHN5bWJvbDogbnVtYmVyLCB2YWx1ZTogU2NvcGVTbG90PEM+KSB7XG4gICAgdGhpcy5zZXQoc3ltYm9sLCB2YWx1ZSk7XG4gIH1cblxuICBiaW5kU2VsZihzZWxmOiBQYXRoUmVmZXJlbmNlPHVua25vd24+KSB7XG4gICAgdGhpcy5zZXQ8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4oMCwgc2VsZik7XG4gIH1cblxuICBiaW5kU3ltYm9sKHN5bWJvbDogbnVtYmVyLCB2YWx1ZTogUGF0aFJlZmVyZW5jZTx1bmtub3duPikge1xuICAgIHRoaXMuc2V0KHN5bWJvbCwgdmFsdWUpO1xuICB9XG5cbiAgYmluZEJsb2NrKHN5bWJvbDogbnVtYmVyLCB2YWx1ZTogT3B0aW9uPFNjb3BlQmxvY2s8Qz4+KSB7XG4gICAgdGhpcy5zZXQ8T3B0aW9uPFNjb3BlQmxvY2s8Qz4+PihzeW1ib2wsIHZhbHVlKTtcbiAgfVxuXG4gIGJpbmRFdmFsU2NvcGUobWFwOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Qz4+Pikge1xuICAgIHRoaXMuZXZhbFNjb3BlID0gbWFwO1xuICB9XG5cbiAgYmluZFBhcnRpYWxNYXAobWFwOiBEaWN0PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KSB7XG4gICAgdGhpcy5wYXJ0aWFsTWFwID0gbWFwO1xuICB9XG5cbiAgYmluZENhbGxlclNjb3BlKHNjb3BlOiBPcHRpb248U2NvcGU8Qz4+KTogdm9pZCB7XG4gICAgdGhpcy5jYWxsZXJTY29wZSA9IHNjb3BlO1xuICB9XG5cbiAgZ2V0Q2FsbGVyU2NvcGUoKTogT3B0aW9uPFNjb3BlPEM+PiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbGVyU2NvcGU7XG4gIH1cblxuICBjaGlsZCgpOiBTY29wZTxDPiB7XG4gICAgcmV0dXJuIG5ldyBTY29wZUltcGwodGhpcy5zbG90cy5zbGljZSgpLCB0aGlzLmNhbGxlclNjb3BlLCB0aGlzLmV2YWxTY29wZSwgdGhpcy5wYXJ0aWFsTWFwKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0PFQgZXh0ZW5kcyBTY29wZVNsb3Q8Qz4+KGluZGV4OiBudW1iZXIpOiBUIHtcbiAgICBpZiAoaW5kZXggPj0gdGhpcy5zbG90cy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBCVUc6IGNhbm5vdCBnZXQgJCR7aW5kZXh9IGZyb20gc2NvcGU7IGxlbmd0aD0ke3RoaXMuc2xvdHMubGVuZ3RofWApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNsb3RzW2luZGV4XSBhcyBUO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXQ8VCBleHRlbmRzIFNjb3BlU2xvdDxDPj4oaW5kZXg6IG51bWJlciwgdmFsdWU6IFQpOiB2b2lkIHtcbiAgICBpZiAoaW5kZXggPj0gdGhpcy5zbG90cy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBCVUc6IGNhbm5vdCBnZXQgJCR7aW5kZXh9IGZyb20gc2NvcGU7IGxlbmd0aD0ke3RoaXMuc2xvdHMubGVuZ3RofWApO1xuICAgIH1cblxuICAgIHRoaXMuc2xvdHNbaW5kZXhdID0gdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFRSQU5TQUNUSU9OOiBUcmFuc2FjdGlvblN5bWJvbCA9ICdUUkFOU0FDVElPTiBbYzM5Mzg4ODUtYWJhMC00MjJmLWI1NDAtM2ZkMzQzMWM3OGI1XSc7XG5cbmNsYXNzIFRyYW5zYWN0aW9uSW1wbCBpbXBsZW1lbnRzIFRyYW5zYWN0aW9uIHtcbiAgcmVhZG9ubHkgW1RSQU5TQUNUSU9OXTogT3B0aW9uPFRyYW5zYWN0aW9uSW1wbD47XG5cbiAgcHVibGljIHNjaGVkdWxlZEluc3RhbGxNYW5hZ2VyczogTW9kaWZpZXJNYW5hZ2VyW10gPSBbXTtcbiAgcHVibGljIHNjaGVkdWxlZEluc3RhbGxNb2RpZmllcnM6IHVua25vd25bXSA9IFtdO1xuICBwdWJsaWMgc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJNYW5hZ2VyczogTW9kaWZpZXJNYW5hZ2VyW10gPSBbXTtcbiAgcHVibGljIHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyczogdW5rbm93bltdID0gW107XG4gIHB1YmxpYyBjcmVhdGVkQ29tcG9uZW50czogdW5rbm93bltdID0gW107XG4gIHB1YmxpYyBjcmVhdGVkTWFuYWdlcnM6IFdpdGhDcmVhdGVJbnN0YW5jZTx1bmtub3duPltdID0gW107XG4gIHB1YmxpYyB1cGRhdGVkQ29tcG9uZW50czogdW5rbm93bltdID0gW107XG4gIHB1YmxpYyB1cGRhdGVkTWFuYWdlcnM6IFdpdGhDcmVhdGVJbnN0YW5jZTx1bmtub3duPltdID0gW107XG4gIHB1YmxpYyBkZXN0cnVjdG9yczogRHJvcFtdID0gW107XG5cbiAgZGlkQ3JlYXRlKGNvbXBvbmVudDogdW5rbm93biwgbWFuYWdlcjogV2l0aENyZWF0ZUluc3RhbmNlKSB7XG4gICAgdGhpcy5jcmVhdGVkQ29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgdGhpcy5jcmVhdGVkTWFuYWdlcnMucHVzaChtYW5hZ2VyKTtcbiAgfVxuXG4gIGRpZFVwZGF0ZShjb21wb25lbnQ6IHVua25vd24sIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSkge1xuICAgIHRoaXMudXBkYXRlZENvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIHRoaXMudXBkYXRlZE1hbmFnZXJzLnB1c2gobWFuYWdlcik7XG4gIH1cblxuICBzY2hlZHVsZUluc3RhbGxNb2RpZmllcihtb2RpZmllcjogdW5rbm93biwgbWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyKSB7XG4gICAgdGhpcy5zY2hlZHVsZWRJbnN0YWxsTW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpO1xuICAgIHRoaXMuc2NoZWR1bGVkSW5zdGFsbE1hbmFnZXJzLnB1c2gobWFuYWdlcik7XG4gIH1cblxuICBzY2hlZHVsZVVwZGF0ZU1vZGlmaWVyKG1vZGlmaWVyOiB1bmtub3duLCBtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXIpIHtcbiAgICB0aGlzLnNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbiAgICB0aGlzLnNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnMucHVzaChtYW5hZ2VyKTtcbiAgfVxuXG4gIGRpZERlc3Ryb3koZDogRHJvcCkge1xuICAgIHRoaXMuZGVzdHJ1Y3RvcnMucHVzaChkKTtcbiAgfVxuXG4gIGNvbW1pdCgpIHtcbiAgICBsZXQgeyBjcmVhdGVkQ29tcG9uZW50cywgY3JlYXRlZE1hbmFnZXJzIH0gPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjcmVhdGVkQ29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGNvbXBvbmVudCA9IGNyZWF0ZWRDb21wb25lbnRzW2ldO1xuICAgICAgbGV0IG1hbmFnZXIgPSBjcmVhdGVkTWFuYWdlcnNbaV07XG4gICAgICBtYW5hZ2VyLmRpZENyZWF0ZShjb21wb25lbnQpO1xuICAgIH1cblxuICAgIGxldCB7IHVwZGF0ZWRDb21wb25lbnRzLCB1cGRhdGVkTWFuYWdlcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVwZGF0ZWRDb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgY29tcG9uZW50ID0gdXBkYXRlZENvbXBvbmVudHNbaV07XG4gICAgICBsZXQgbWFuYWdlciA9IHVwZGF0ZWRNYW5hZ2Vyc1tpXTtcbiAgICAgIG1hbmFnZXIuZGlkVXBkYXRlKGNvbXBvbmVudCk7XG4gICAgfVxuXG4gICAgbGV0IHsgZGVzdHJ1Y3RvcnMgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlc3RydWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZXN0cnVjdG9yc1tpXVtEUk9QXSgpO1xuICAgIH1cblxuICAgIGxldCB7IHNjaGVkdWxlZEluc3RhbGxNYW5hZ2Vycywgc2NoZWR1bGVkSW5zdGFsbE1vZGlmaWVycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NoZWR1bGVkSW5zdGFsbE1hbmFnZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbW9kaWZpZXIgPSBzY2hlZHVsZWRJbnN0YWxsTW9kaWZpZXJzW2ldO1xuICAgICAgbGV0IG1hbmFnZXIgPSBzY2hlZHVsZWRJbnN0YWxsTWFuYWdlcnNbaV07XG4gICAgICBtYW5hZ2VyLmluc3RhbGwobW9kaWZpZXIpO1xuICAgIH1cblxuICAgIGxldCB7IHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVyTWFuYWdlcnMsIHNjaGVkdWxlZFVwZGF0ZU1vZGlmaWVycyB9ID0gdGhpcztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJNYW5hZ2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IG1vZGlmaWVyID0gc2NoZWR1bGVkVXBkYXRlTW9kaWZpZXJzW2ldO1xuICAgICAgbGV0IG1hbmFnZXIgPSBzY2hlZHVsZWRVcGRhdGVNb2RpZmllck1hbmFnZXJzW2ldO1xuICAgICAgbWFuYWdlci51cGRhdGUobW9kaWZpZXIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUb0Jvb2wgPSAodmFsdWU6IHVua25vd24pID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIHRvQm9vbCh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gISF2YWx1ZTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVudmlyb25tZW50SW1wbCBpbXBsZW1lbnRzIEVudmlyb25tZW50IHtcbiAgW1RSQU5TQUNUSU9OXTogT3B0aW9uPFRyYW5zYWN0aW9uSW1wbD4gPSBudWxsO1xuXG4gIHByb3RlY3RlZCB1cGRhdGVPcGVyYXRpb25zOiBHbGltbWVyVHJlZUNoYW5nZXM7XG4gIHByb3RlY3RlZCBhcHBlbmRPcGVyYXRpb25zOiBHbGltbWVyVHJlZUNvbnN0cnVjdGlvbjtcblxuICBjb25zdHJ1Y3Rvcih7IGFwcGVuZE9wZXJhdGlvbnMsIHVwZGF0ZU9wZXJhdGlvbnMgfTogRW52aXJvbm1lbnRPcHRpb25zKSB7XG4gICAgdGhpcy5hcHBlbmRPcGVyYXRpb25zID0gYXBwZW5kT3BlcmF0aW9ucztcbiAgICB0aGlzLnVwZGF0ZU9wZXJhdGlvbnMgPSB1cGRhdGVPcGVyYXRpb25zO1xuICB9XG5cbiAgdG9Db25kaXRpb25hbFJlZmVyZW5jZShyZWZlcmVuY2U6IFJlZmVyZW5jZSk6IFJlZmVyZW5jZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBDb25kaXRpb25hbFJlZmVyZW5jZShyZWZlcmVuY2UsIHRvQm9vbCk7XG4gIH1cblxuICBhYnN0cmFjdCBpdGVyYWJsZUZvcihyZWZlcmVuY2U6IFJlZmVyZW5jZSwga2V5OiB1bmtub3duKTogT3BhcXVlSXRlcmFibGU7XG4gIGFic3RyYWN0IHByb3RvY29sRm9yVVJMKHM6IHN0cmluZyk6IHN0cmluZztcblxuICBnZXRBcHBlbmRPcGVyYXRpb25zKCk6IEdsaW1tZXJUcmVlQ29uc3RydWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRPcGVyYXRpb25zO1xuICB9XG4gIGdldERPTSgpOiBHbGltbWVyVHJlZUNoYW5nZXMge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZU9wZXJhdGlvbnM7XG4gIH1cblxuICBiZWdpbigpIHtcbiAgICBhc3NlcnQoXG4gICAgICAhdGhpc1tUUkFOU0FDVElPTl0sXG4gICAgICAnQSBnbGltbWVyIHRyYW5zYWN0aW9uIHdhcyBiZWd1biwgYnV0IG9uZSBhbHJlYWR5IGV4aXN0cy4gWW91IG1heSBoYXZlIGEgbmVzdGVkIHRyYW5zYWN0aW9uLCBwb3NzaWJseSBjYXVzZWQgYnkgYW4gZWFybGllciBydW50aW1lIGV4Y2VwdGlvbiB3aGlsZSByZW5kZXJpbmcuIFBsZWFzZSBjaGVjayB5b3VyIGNvbnNvbGUgZm9yIHRoZSBzdGFjayB0cmFjZSBvZiBhbnkgcHJpb3IgZXhjZXB0aW9ucy4nXG4gICAgKTtcblxuICAgIHRoaXNbVFJBTlNBQ1RJT05dID0gbmV3IFRyYW5zYWN0aW9uSW1wbCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgdHJhbnNhY3Rpb24oKTogVHJhbnNhY3Rpb25JbXBsIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXNbVFJBTlNBQ1RJT05dISwgJ211c3QgYmUgaW4gYSB0cmFuc2FjdGlvbicpO1xuICB9XG5cbiAgZGlkQ3JlYXRlKGNvbXBvbmVudDogdW5rbm93biwgbWFuYWdlcjogV2l0aENyZWF0ZUluc3RhbmNlKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5kaWRDcmVhdGUoY29tcG9uZW50LCBtYW5hZ2VyKTtcbiAgfVxuXG4gIGRpZFVwZGF0ZShjb21wb25lbnQ6IHVua25vd24sIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSkge1xuICAgIHRoaXMudHJhbnNhY3Rpb24uZGlkVXBkYXRlKGNvbXBvbmVudCwgbWFuYWdlcik7XG4gIH1cblxuICBzY2hlZHVsZUluc3RhbGxNb2RpZmllcihtb2RpZmllcjogdW5rbm93biwgbWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5zY2hlZHVsZUluc3RhbGxNb2RpZmllcihtb2RpZmllciwgbWFuYWdlcik7XG4gIH1cblxuICBzY2hlZHVsZVVwZGF0ZU1vZGlmaWVyKG1vZGlmaWVyOiB1bmtub3duLCBtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXIpIHtcbiAgICB0aGlzLnRyYW5zYWN0aW9uLnNjaGVkdWxlVXBkYXRlTW9kaWZpZXIobW9kaWZpZXIsIG1hbmFnZXIpO1xuICB9XG5cbiAgZGlkRGVzdHJveShkOiBEcm9wKSB7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5kaWREZXN0cm95KGQpO1xuICB9XG5cbiAgY29tbWl0KCkge1xuICAgIGxldCB0cmFuc2FjdGlvbiA9IHRoaXMudHJhbnNhY3Rpb247XG4gICAgdGhpc1tUUkFOU0FDVElPTl0gPSBudWxsO1xuICAgIHRyYW5zYWN0aW9uLmNvbW1pdCgpO1xuICB9XG5cbiAgYXR0cmlidXRlRm9yKFxuICAgIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsXG4gICAgYXR0cjogc3RyaW5nLFxuICAgIF9pc1RydXN0aW5nOiBib29sZWFuLFxuICAgIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+ID0gbnVsbFxuICApOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgICByZXR1cm4gZHluYW1pY0F0dHJpYnV0ZShlbGVtZW50LCBhdHRyLCBuYW1lc3BhY2UpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUge1xuICBwcm90b2NvbEZvclVSTD8odXJsOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGl0ZXJhYmxlPzogSXRlcmFibGVLZXlEZWZpbml0aW9ucztcbiAgdG9Cb29sPyh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW47XG4gIGF0dHJpYnV0ZUZvcj8oXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBhdHRyOiBzdHJpbmcsXG4gICAgaXNUcnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPlxuICApOiBEeW5hbWljQXR0cmlidXRlO1xufVxuXG5leHBvcnQgY2xhc3MgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsIGltcGxlbWVudHMgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUge1xuICByZWFkb25seSB0b0Jvb2w6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSA9IHt9KSB7XG4gICAgaWYgKGlubmVyLnRvQm9vbCkge1xuICAgICAgdGhpcy50b0Jvb2wgPSBpbm5lci50b0Jvb2w7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudG9Cb29sID0gdmFsdWUgPT4gISF2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBwcm90b2NvbEZvclVSTCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuaW5uZXIucHJvdG9jb2xGb3JVUkwpIHtcbiAgICAgIHJldHVybiB0aGlzLmlubmVyLnByb3RvY29sRm9yVVJMKHVybCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgVVJMID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgVVJMID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGxlZ2FjeVByb3RvY29sRm9yVVJMKHVybCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gbmV3IFVSTCh1cmwsIGRvY3VtZW50LmJhc2VVUkkpLnByb3RvY29sO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFVSTCh1cmwsICdodHRwczovL3d3dy5leGFtcGxlLmNvbScpLnByb3RvY29sO1xuICAgIH1cbiAgfVxuXG4gIGF0dHJpYnV0ZUZvcihcbiAgICBlbGVtZW50OiBTaW1wbGVFbGVtZW50LFxuICAgIGF0dHI6IHN0cmluZyxcbiAgICBpc1RydXN0aW5nOiBib29sZWFuLFxuICAgIG5hbWVzcGFjZTogT3B0aW9uPEF0dHJOYW1lc3BhY2U+XG4gICk6IER5bmFtaWNBdHRyaWJ1dGUge1xuICAgIGlmICh0aGlzLmlubmVyLmF0dHJpYnV0ZUZvcikge1xuICAgICAgcmV0dXJuIHRoaXMuaW5uZXIuYXR0cmlidXRlRm9yKGVsZW1lbnQsIGF0dHIsIGlzVHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkeW5hbWljQXR0cmlidXRlKGVsZW1lbnQsIGF0dHIsIG5hbWVzcGFjZSk7XG4gICAgfVxuICB9XG5cbiAgcmVhZG9ubHkgaXRlcmFibGU6IEl0ZXJhYmxlS2V5RGVmaW5pdGlvbnMgPSB7XG4gICAgbmFtZWQ6IHtcbiAgICAgICdAaW5kZXgnOiAoXywgaW5kZXgpID0+IFN0cmluZyhpbmRleCksXG4gICAgICAnQHByaW1pdGl2ZSc6IGl0ZW0gPT4gU3RyaW5nKGl0ZW0pLFxuICAgICAgJ0BpZGVudGl0eSc6IGl0ZW0gPT4gaXRlbSxcbiAgICB9LFxuICAgIGRlZmF1bHQ6IGtleSA9PiBpdGVtID0+IGl0ZW1ba2V5XSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbGVnYWN5UHJvdG9jb2xGb3JVUkwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsZXQgbWF0Y2ggPSAvXihbYS16XVthLXowLTkuKy1dKjopPyhcXC9cXC8pPyhbXFxTXFxzXSopL2kuZXhlYyh1cmwpO1xuICAgIHJldHVybiBtYXRjaCAmJiBtYXRjaFsxXSA/IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgfVxuXG4gIGxldCBhbmNob3IgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhbmNob3IuaHJlZiA9IHVybDtcbiAgcmV0dXJuIGFuY2hvci5wcm90b2NvbDtcbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRSdW50aW1lUmVzb2x2ZXI8UiBleHRlbmRzIHsgbW9kdWxlOiBzdHJpbmcgfT5cbiAgaW1wbGVtZW50cyBKaXRSdW50aW1lUmVzb2x2ZXI8Uj4sIEFvdFJ1bnRpbWVSZXNvbHZlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlKSB7fVxuXG4gIGxvb2t1cENvbXBvbmVudChuYW1lOiBzdHJpbmcsIHJlZmVycmVyPzogdW5rbm93bik6IE9wdGlvbjxhbnk+IHtcbiAgICBpZiAodGhpcy5pbm5lci5sb29rdXBDb21wb25lbnQpIHtcbiAgICAgIGxldCBjb21wb25lbnQgPSB0aGlzLmlubmVyLmxvb2t1cENvbXBvbmVudChuYW1lLCByZWZlcnJlcik7XG5cbiAgICAgIGlmIChjb21wb25lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgY29tcG9uZW50ICR7bmFtZX0gKGZyb20gJHtyZWZlcnJlcn0pIChsb29rdXBDb21wb25lbnQgcmV0dXJuZWQgdW5kZWZpbmVkKWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb29rdXBDb21wb25lbnQgbm90IGltcGxlbWVudGVkIG9uIFJ1bnRpbWVSZXNvbHZlci4nKTtcbiAgICB9XG4gIH1cblxuICBsb29rdXBQYXJ0aWFsKG5hbWU6IHN0cmluZywgcmVmZXJyZXI/OiB1bmtub3duKTogT3B0aW9uPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLmlubmVyLmxvb2t1cFBhcnRpYWwpIHtcbiAgICAgIGxldCBwYXJ0aWFsID0gdGhpcy5pbm5lci5sb29rdXBQYXJ0aWFsKG5hbWUsIHJlZmVycmVyKTtcblxuICAgICAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgcGFydGlhbCAke25hbWV9IChmcm9tICR7cmVmZXJyZXJ9KSAobG9va3VwUGFydGlhbCByZXR1cm5lZCB1bmRlZmluZWQpYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFydGlhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb29rdXBQYXJ0aWFsIG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZTxVIGV4dGVuZHMgUmVzb2x2ZWRWYWx1ZT4oaGFuZGxlOiBudW1iZXIpOiBVIHtcbiAgICBpZiAodGhpcy5pbm5lci5yZXNvbHZlKSB7XG4gICAgICBsZXQgcmVzb2x2ZWQgPSB0aGlzLmlubmVyLnJlc29sdmUoaGFuZGxlKTtcblxuICAgICAgaWYgKHJlc29sdmVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIGhhbmRsZSAke2hhbmRsZX0gKHJlc29sdmUgcmV0dXJuZWQgdW5kZWZpbmVkKWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzb2x2ZWQgYXMgVTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZXNvbHZlIG5vdCBpbXBsZW1lbnRlZCBvbiBSdW50aW1lUmVzb2x2ZXIuJyk7XG4gICAgfVxuICB9XG5cbiAgY29tcGlsYWJsZShsb2NhdG9yOiB7IG1vZHVsZTogc3RyaW5nIH0pOiBUZW1wbGF0ZSB7XG4gICAgaWYgKHRoaXMuaW5uZXIuY29tcGlsYWJsZSkge1xuICAgICAgbGV0IHJlc29sdmVkID0gdGhpcy5pbm5lci5jb21waWxhYmxlKGxvY2F0b3IpO1xuXG4gICAgICBpZiAocmVzb2x2ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjb21waWxlICR7bmFtZX0gKGNvbXBpbGFibGUgcmV0dXJuZWQgdW5kZWZpbmVkKWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY29tcGlsYWJsZSBub3QgaW1wbGVtZW50ZWQgb24gUnVudGltZVJlc29sdmVyLicpO1xuICAgIH1cbiAgfVxuXG4gIGdldEludm9jYXRpb24obG9jYXRvcjogUik6IEludm9jYXRpb24ge1xuICAgIGlmICh0aGlzLmlubmVyLmdldEludm9jYXRpb24pIHtcbiAgICAgIGxldCBpbnZvY2F0aW9uID0gdGhpcy5pbm5lci5nZXRJbnZvY2F0aW9uKGxvY2F0b3IpO1xuXG4gICAgICBpZiAoaW52b2NhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGdldCBpbnZvY2F0aW9uIGZvciAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgbG9jYXRvclxuICAgICAgICAgICl9IChnZXRJbnZvY2F0aW9uIHJldHVybmVkIHVuZGVmaW5lZClgXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpbnZvY2F0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldEludm9jYXRpb24gbm90IGltcGxlbWVudGVkIG9uIFJ1bnRpbWVSZXNvbHZlci4nKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFvdFJ1bnRpbWUoXG4gIGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCxcbiAgcHJvZ3JhbTogQ29tcGlsZXJBcnRpZmFjdHMsXG4gIHJlc29sdmVyOiBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSA9IHt9LFxuICBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGUgPSB7fVxuKTogQW90UnVudGltZUNvbnRleHQge1xuICBsZXQgZW52ID0gbmV3IFJ1bnRpbWVFbnZpcm9ubWVudChkb2N1bWVudCwgbmV3IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlSW1wbChkZWxlZ2F0ZSkpO1xuXG4gIHJldHVybiB7XG4gICAgZW52LFxuICAgIHJlc29sdmVyOiBuZXcgRGVmYXVsdFJ1bnRpbWVSZXNvbHZlcihyZXNvbHZlciksXG4gICAgcHJvZ3JhbTogUnVudGltZVByb2dyYW1JbXBsLmh5ZHJhdGUocHJvZ3JhbSksXG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSml0UHJvZ3JhbUNvbXBpbGF0aW9uQ29udGV4dCBleHRlbmRzIFdob2xlUHJvZ3JhbUNvbXBpbGF0aW9uQ29udGV4dCB7XG4gIHJlYWRvbmx5IGNvbnN0YW50czogQ29tcGlsZVRpbWVDb25zdGFudHMgJiBSdW50aW1lQ29uc3RhbnRzO1xuICByZWFkb25seSBoZWFwOiBDb21waWxlVGltZUhlYXAgJiBSdW50aW1lSGVhcDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKaXRTeW50YXhDb21waWxhdGlvbkNvbnRleHQgZXh0ZW5kcyBTeW50YXhDb21waWxhdGlvbkNvbnRleHQge1xuICByZWFkb25seSBwcm9ncmFtOiBKaXRQcm9ncmFtQ29tcGlsYXRpb25Db250ZXh0O1xuICByZWFkb25seSBtYWNyb3M6IE1hY3Jvcztcbn1cblxuLy8gVE9ETzogVGhlcmUgYXJlIGEgbG90IG9mIHZhcmlhbnRzIGhlcmUuIFNvbWUgYXJlIGhlcmUgZm9yIHRyYW5zaXRpb25hbCBwdXJwb3Nlc1xuLy8gYW5kIHNvbWUgbWlnaHQgYmUgR0NhYmxlIG9uY2UgdGhlIGRlc2lnbiBzdGFiaWxpemVzLlxuZXhwb3J0IGZ1bmN0aW9uIEN1c3RvbUppdFJ1bnRpbWUoXG4gIHJlc29sdmVyOiBSdW50aW1lUmVzb2x2ZXIsXG4gIGNvbnRleHQ6IFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCAmIHtcbiAgICBwcm9ncmFtOiB7IGNvbnN0YW50czogUnVudGltZUNvbnN0YW50czsgaGVhcDogUnVudGltZUhlYXAgfTtcbiAgfSxcbiAgZW52OiBFbnZpcm9ubWVudFxuKTogSml0UnVudGltZUNvbnRleHQge1xuICBsZXQgcHJvZ3JhbSA9IG5ldyBSdW50aW1lUHJvZ3JhbUltcGwoY29udGV4dC5wcm9ncmFtLmNvbnN0YW50cywgY29udGV4dC5wcm9ncmFtLmhlYXApO1xuXG4gIHJldHVybiB7XG4gICAgZW52LFxuICAgIHJlc29sdmVyOiBuZXcgRGVmYXVsdFJ1bnRpbWVSZXNvbHZlcihyZXNvbHZlciksXG4gICAgcHJvZ3JhbSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEppdFJ1bnRpbWUoXG4gIGRvY3VtZW50OiBTaW1wbGVEb2N1bWVudCxcbiAgcmVzb2x2ZXI6IFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlID0ge30sXG4gIGRlbGVnYXRlOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZSA9IHt9XG4pOiBKaXRSdW50aW1lQ29udGV4dCB7XG4gIGxldCBlbnYgPSBuZXcgUnVudGltZUVudmlyb25tZW50KGRvY3VtZW50LCBuZXcgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKGRlbGVnYXRlKSk7XG5cbiAgbGV0IGNvbnN0YW50cyA9IG5ldyBDb25zdGFudHMoKTtcbiAgbGV0IGhlYXAgPSBuZXcgSGVhcEltcGwoKTtcbiAgbGV0IHByb2dyYW0gPSBuZXcgUnVudGltZVByb2dyYW1JbXBsKGNvbnN0YW50cywgaGVhcCk7XG5cbiAgcmV0dXJuIHtcbiAgICBlbnYsXG4gICAgcmVzb2x2ZXI6IG5ldyBEZWZhdWx0UnVudGltZVJlc29sdmVyKHJlc29sdmVyKSxcbiAgICBwcm9ncmFtLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSml0UnVudGltZUZyb21Qcm9ncmFtKFxuICBkb2N1bWVudDogU2ltcGxlRG9jdW1lbnQsXG4gIHByb2dyYW06IFJ1bnRpbWVQcm9ncmFtLFxuICByZXNvbHZlcjogUnVudGltZVJlc29sdmVyRGVsZWdhdGUgPSB7fSxcbiAgZGVsZWdhdGU6IFJ1bnRpbWVFbnZpcm9ubWVudERlbGVnYXRlID0ge31cbik6IEppdFJ1bnRpbWVDb250ZXh0IHtcbiAgbGV0IGVudiA9IG5ldyBSdW50aW1lRW52aXJvbm1lbnQoZG9jdW1lbnQsIG5ldyBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGwoZGVsZWdhdGUpKTtcblxuICByZXR1cm4ge1xuICAgIGVudixcbiAgICByZXNvbHZlcjogbmV3IERlZmF1bHRSdW50aW1lUmVzb2x2ZXIocmVzb2x2ZXIpLFxuICAgIHByb2dyYW0sXG4gIH07XG59XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lRW52aXJvbm1lbnQgZXh0ZW5kcyBFbnZpcm9ubWVudEltcGwge1xuICBwcml2YXRlIGRlbGVnYXRlOiBSdW50aW1lRW52aXJvbm1lbnREZWxlZ2F0ZUltcGw7XG5cbiAgY29uc3RydWN0b3IoZG9jdW1lbnQ6IFNpbXBsZURvY3VtZW50LCBkZWxlZ2F0ZTogUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKSB7XG4gICAgc3VwZXIoe1xuICAgICAgYXBwZW5kT3BlcmF0aW9uczogbmV3IERPTVRyZWVDb25zdHJ1Y3Rpb24oZG9jdW1lbnQpLFxuICAgICAgdXBkYXRlT3BlcmF0aW9uczogbmV3IERPTUNoYW5nZXNJbXBsKGRvY3VtZW50KSxcbiAgICB9KTtcblxuICAgIHRoaXMuZGVsZWdhdGUgPSBuZXcgUnVudGltZUVudmlyb25tZW50RGVsZWdhdGVJbXBsKGRlbGVnYXRlKTtcbiAgfVxuXG4gIHByb3RvY29sRm9yVVJMKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5wcm90b2NvbEZvclVSTCh1cmwpO1xuICB9XG5cbiAgaXRlcmFibGVGb3IocmVmOiBSZWZlcmVuY2UsIGlucHV0S2V5OiB1bmtub3duKTogT3BhcXVlSXRlcmFibGUge1xuICAgIGxldCBrZXkgPSBTdHJpbmcoaW5wdXRLZXkpO1xuICAgIGxldCBkZWYgPSB0aGlzLmRlbGVnYXRlLml0ZXJhYmxlO1xuXG4gICAgbGV0IGtleUZvciA9IGtleSBpbiBkZWYubmFtZWQgPyBkZWYubmFtZWRba2V5XSA6IGRlZi5kZWZhdWx0KGtleSk7XG5cbiAgICByZXR1cm4gbmV3IEl0ZXJhYmxlSW1wbChyZWYsIGtleUZvcik7XG4gIH1cblxuICB0b0NvbmRpdGlvbmFsUmVmZXJlbmNlKGlucHV0OiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlKTogVmVyc2lvbmVkUmVmZXJlbmNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsUmVmZXJlbmNlKGlucHV0LCB0aGlzLmRlbGVnYXRlLnRvQm9vbCk7XG4gIH1cblxuICBhdHRyaWJ1dGVGb3IoXG4gICAgZWxlbWVudDogU2ltcGxlRWxlbWVudCxcbiAgICBhdHRyOiBzdHJpbmcsXG4gICAgaXNUcnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxBdHRyTmFtZXNwYWNlPlxuICApOiBEeW5hbWljQXR0cmlidXRlIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5hdHRyaWJ1dGVGb3IoZWxlbWVudCwgYXR0ciwgaXNUcnVzdGluZywgbmFtZXNwYWNlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5UcmFuc2FjdGlvbihlbnY6IEVudmlyb25tZW50LCBjYjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICBpZiAoIWVudltUUkFOU0FDVElPTl0pIHtcbiAgICBlbnYuYmVnaW4oKTtcbiAgICB0cnkge1xuICAgICAgY2IoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZW52LmNvbW1pdCgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjYigpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEZWZhdWx0RW52aXJvbm1lbnQgZXh0ZW5kcyBFbnZpcm9ubWVudEltcGwge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogRW52aXJvbm1lbnRPcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBsZXQgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQgYXMgU2ltcGxlRG9jdW1lbnQ7XG4gICAgICBsZXQgYXBwZW5kT3BlcmF0aW9ucyA9IG5ldyBET01UcmVlQ29uc3RydWN0aW9uKGRvY3VtZW50KTtcbiAgICAgIGxldCB1cGRhdGVPcGVyYXRpb25zID0gbmV3IERPTUNoYW5nZXNJbXBsKGRvY3VtZW50KTtcbiAgICAgIG9wdGlvbnMgPSB7IGFwcGVuZE9wZXJhdGlvbnMsIHVwZGF0ZU9wZXJhdGlvbnMgfTtcbiAgICB9XG5cbiAgICBzdXBlcihvcHRpb25zKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFbnZpcm9ubWVudEltcGw7XG4iXSwic291cmNlUm9vdCI6IiJ9