'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JitVM = exports.AotVM = undefined;

var _reference = require('@glimmer/reference');

var _util = require('@glimmer/util');

var _vm = require('@glimmer/vm');

var _vm2 = require('../compiled/opcodes/vm');

var _environment = require('../environment');

var _opcodes = require('../opcodes');

var _references = require('../references');

var _symbols = require('../symbols');

var _arguments = require('./arguments');

var _lowLevel = require('./low-level');

var _lowLevel2 = _interopRequireDefault(_lowLevel);

var _renderResult = require('./render-result');

var _renderResult2 = _interopRequireDefault(_renderResult);

var _stack = require('./stack');

var _stack2 = _interopRequireDefault(_stack);

var _update = require('./update');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _a, _b;

class Stacks {
    constructor() {
        this.scope = new _util.Stack();
        this.dynamicScope = new _util.Stack();
        this.updating = new _util.Stack();
        this.cache = new _util.Stack();
        this.list = new _util.Stack();
    }
}
class VM {
    /**
     * End of migrated.
     */
    constructor(runtime, { pc, scope, dynamicScope, stack }, elementStack) {
        this.runtime = runtime;
        this.elementStack = elementStack;
        this[_a] = new Stacks();
        this[_b] = new _util.Stack();
        this.s0 = null;
        this.s1 = null;
        this.t0 = null;
        this.t1 = null;
        this.v0 = null;
        let evalStack = _stack2.default.restore(stack);
        false && (0, _util.assert)(typeof pc === 'number', 'pc is a number');

        evalStack[_symbols.REGISTERS][_vm.$pc] = pc;
        evalStack[_symbols.REGISTERS][_vm.$sp] = stack.length - 1;
        evalStack[_symbols.REGISTERS][_vm.$fp] = -1;
        this[_symbols.HEAP] = this.program.heap;
        this[_symbols.CONSTANTS] = this.program.constants;
        this.elementStack = elementStack;
        this[_symbols.STACKS].scope.push(scope);
        this[_symbols.STACKS].dynamicScope.push(dynamicScope);
        this[_symbols.ARGS] = new _arguments.VMArgumentsImpl();
        this[_symbols.INNER_VM] = new _lowLevel2.default(evalStack, this[_symbols.HEAP], runtime.program, {
            debugBefore: opcode => {
                return _opcodes.APPEND_OPCODES.debugBefore(this, opcode);
            },
            debugAfter: state => {
                _opcodes.APPEND_OPCODES.debugAfter(this, state);
            }
        }, evalStack[_symbols.REGISTERS]);
        this.destructor = {};
        this[_symbols.DESTRUCTOR_STACK].push(this.destructor);
    }
    get stack() {
        return this[_symbols.INNER_VM].stack;
    }
    currentBlock() {
        return this.elements().block();
    }
    /* Registers */
    get pc() {
        return this[_symbols.INNER_VM].fetchRegister(_vm.$pc);
    }
    // Fetch a value from a register onto the stack
    fetch(register) {
        this.stack.push(this.fetchValue(register));
    }
    // Load a value from the stack into a register
    load(register) {
        let value = this.stack.pop();
        this.loadValue(register, value);
    }
    fetchValue(register) {
        if ((0, _vm.isLowLevelRegister)(register)) {
            return this[_symbols.INNER_VM].fetchRegister(register);
        }
        switch (register) {
            case _vm.$s0:
                return this.s0;
            case _vm.$s1:
                return this.s1;
            case _vm.$t0:
                return this.t0;
            case _vm.$t1:
                return this.t1;
            case _vm.$v0:
                return this.v0;
        }
    }
    // Load a value into a register
    loadValue(register, value) {
        if ((0, _vm.isLowLevelRegister)(register)) {
            this[_symbols.INNER_VM].loadRegister(register, value);
        }
        switch (register) {
            case _vm.$s0:
                this.s0 = value;
                break;
            case _vm.$s1:
                this.s1 = value;
                break;
            case _vm.$t0:
                this.t0 = value;
                break;
            case _vm.$t1:
                this.t1 = value;
                break;
            case _vm.$v0:
                this.v0 = value;
                break;
        }
    }
    /**
     * Migrated to Inner
     */
    // Start a new frame and save $ra and $fp on the stack
    pushFrame() {
        this[_symbols.INNER_VM].pushFrame();
    }
    // Restore $ra, $sp and $fp
    popFrame() {
        this[_symbols.INNER_VM].popFrame();
    }
    // Jump to an address in `program`
    goto(offset) {
        this[_symbols.INNER_VM].goto(offset);
    }
    // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)
    call(handle) {
        this[_symbols.INNER_VM].call(handle);
    }
    // Put a specific `program` address in $ra
    returnTo(offset) {
        this[_symbols.INNER_VM].returnTo(offset);
    }
    // Return to the `program` address stored in $ra
    return() {
        this[_symbols.INNER_VM].return();
    }
    get program() {
        return this.runtime.program;
    }
    get env() {
        return this.runtime.env;
    }
    captureState(args, pc = this[_symbols.INNER_VM].fetchRegister(_vm.$pc)) {
        return {
            pc,
            dynamicScope: this.dynamicScope(),
            scope: this.scope(),
            stack: this.stack.capture(args)
        };
    }
    beginCacheGroup() {
        this[_symbols.STACKS].cache.push(this.updating().tail());
    }
    commitCacheGroup() {
        let END = new _vm2.LabelOpcode('END');
        let opcodes = this.updating();
        let marker = this[_symbols.STACKS].cache.pop();
        let head = marker ? opcodes.nextNode(marker) : opcodes.head();
        let tail = opcodes.tail();
        let tag = (0, _reference.combineSlice)(new _util.ListSlice(head, tail));
        let guard = new _vm2.JumpIfNotModifiedOpcode(tag, END);
        opcodes.insertBefore(guard, head);
        opcodes.append(new _vm2.DidModifyOpcode(guard));
        opcodes.append(END);
    }
    enter(args) {
        let updating = new _util.LinkedList();
        let state = this.capture(args);
        let block = this.elements().pushUpdatableBlock();
        let tryOpcode = new _update.TryOpcode(state, this.runtime, block, updating);
        this.didEnter(tryOpcode);
    }
    iterate(memo, value) {
        let stack = this.stack;
        stack.push(value);
        stack.push(memo);
        let state = this.capture(2);
        let block = this.elements().pushUpdatableBlock();
        // let ip = this.ip;
        // this.ip = end + 4;
        // this.frames.push(ip);
        return new _update.TryOpcode(state, this.runtime, block, new _util.LinkedList());
    }
    enterItem(key, opcode) {
        this.listBlock().map.set(key, opcode);
        this.didEnter(opcode);
    }
    enterList(offset) {
        let updating = new _util.LinkedList();
        let addr = this[_symbols.INNER_VM].target(offset);
        let state = this.capture(0, addr);
        let list = this.elements().pushBlockList(updating);
        let artifacts = this.stack.peek().artifacts;
        let opcode = new _update.ListBlockOpcode(state, this.runtime, list, updating, artifacts);
        this[_symbols.STACKS].list.push(opcode);
        this.didEnter(opcode);
    }
    didEnter(opcode) {
        this.associateDestructor((0, _util.destructor)(opcode));
        this[_symbols.DESTRUCTOR_STACK].push(opcode);
        this.updateWith(opcode);
        this.pushUpdating(opcode.children);
    }
    exit() {
        this[_symbols.DESTRUCTOR_STACK].pop();
        this.elements().popBlock();
        this.popUpdating();
        let parent = this.updating().tail();
        parent.didInitializeChildren();
    }
    exitList() {
        this.exit();
        this[_symbols.STACKS].list.pop();
    }
    pushUpdating(list = new _util.LinkedList()) {
        this[_symbols.STACKS].updating.push(list);
    }
    popUpdating() {
        return this[_symbols.STACKS].updating.pop();
    }
    updateWith(opcode) {
        this.updating().append(opcode);
    }
    listBlock() {
        return this[_symbols.STACKS].list.current;
    }
    associateDestructor(child) {
        if (!(0, _util.isDrop)(child)) return;
        let parent = this[_symbols.DESTRUCTOR_STACK].current;
        (0, _util.associateDestructor)(parent, child);
    }
    associateDestroyable(child) {
        this.associateDestructor((0, _util.destructor)(child));
    }
    tryUpdating() {
        return this[_symbols.STACKS].updating.current;
    }
    updating() {
        return this[_symbols.STACKS].updating.current;
    }
    elements() {
        return this.elementStack;
    }
    scope() {
        return this[_symbols.STACKS].scope.current;
    }
    dynamicScope() {
        return this[_symbols.STACKS].dynamicScope.current;
    }
    pushChildScope() {
        this[_symbols.STACKS].scope.push(this.scope().child());
    }
    pushDynamicScope() {
        let child = this.dynamicScope().child();
        this[_symbols.STACKS].dynamicScope.push(child);
        return child;
    }
    pushRootScope(size) {
        let scope = _environment.ScopeImpl.sized(size);
        this[_symbols.STACKS].scope.push(scope);
        return scope;
    }
    pushScope(scope) {
        this[_symbols.STACKS].scope.push(scope);
    }
    popScope() {
        this[_symbols.STACKS].scope.pop();
    }
    popDynamicScope() {
        this[_symbols.STACKS].dynamicScope.pop();
    }
    /// SCOPE HELPERS
    getSelf() {
        return this.scope().getSelf();
    }
    referenceForSymbol(symbol) {
        return this.scope().getSymbol(symbol);
    }
    /// EXECUTION
    execute(initialize) {
        if (false) {
            console.log(`EXECUTING FROM ${this[_symbols.INNER_VM].fetchRegister(_vm.$pc)}`);
        }
        if (initialize) initialize(this);
        let result;
        while (true) {
            result = this.next();
            if (result.done) break;
        }
        return result.value;
    }
    next() {
        let { env, elementStack } = this;
        let opcode = this[_symbols.INNER_VM].nextStatement();
        let result;
        if (opcode !== null) {
            this[_symbols.INNER_VM].evaluateOuter(opcode, this);
            result = { done: false, value: null };
        } else {
            // Unload the stack
            this.stack.reset();
            result = {
                done: true,
                value: new _renderResult2.default(env, this.popUpdating(), elementStack.popBlock(), this.destructor)
            };
        }
        return result;
    }
    bindDynamicScope(names) {
        let scope = this.dynamicScope();
        for (let i = names.length - 1; i >= 0; i--) {
            let name = this[_symbols.CONSTANTS].getString(names[i]);
            scope.set(name, this.stack.pop());
        }
    }
}
exports.default = VM;
_a = _symbols.STACKS, _b = _symbols.DESTRUCTOR_STACK;
function vmState(pc, scope = _environment.ScopeImpl.root(_references.UNDEFINED_REFERENCE, 0), dynamicScope) {
    return {
        pc,
        scope,
        dynamicScope,
        stack: []
    };
}
class AotVM extends VM {
    static empty(runtime, { handle, treeBuilder, dynamicScope }) {
        let vm = initAOT(runtime, vmState(runtime.program.heap.getaddr(handle), _environment.ScopeImpl.root(_references.UNDEFINED_REFERENCE, 0), dynamicScope), treeBuilder);
        vm.pushUpdating();
        return vm;
    }
    static initial(runtime, { handle, self, treeBuilder, dynamicScope }) {
        let scopeSize = runtime.program.heap.scopesizeof(handle);
        let scope = _environment.ScopeImpl.root(self, scopeSize);
        let pc = runtime.program.heap.getaddr(handle);
        let state = vmState(pc, scope, dynamicScope);
        let vm = initAOT(runtime, state, treeBuilder);
        vm.pushUpdating();
        return vm;
    }
    capture(args, pc = this[_symbols.INNER_VM].fetchRegister(_vm.$pc)) {
        return new _update.ResumableVMStateImpl(this.captureState(args, pc), initAOT);
    }
}
exports.AotVM = AotVM;
function initAOT(runtime, state, builder) {
    return new AotVM(runtime, state, builder);
}
function initJIT(context) {
    return (runtime, state, builder) => new JitVM(runtime, state, builder, context);
}
class JitVM extends VM {
    constructor(runtime, state, elementStack, context) {
        super(runtime, state, elementStack);
        this.context = context;
        this.resume = initJIT(this.context);
    }
    static initial(runtime, context, { handle, self, dynamicScope, treeBuilder }) {
        let scopeSize = runtime.program.heap.scopesizeof(handle);
        let scope = _environment.ScopeImpl.root(self, scopeSize);
        let state = vmState(runtime.program.heap.getaddr(handle), scope, dynamicScope);
        let vm = initJIT(context)(runtime, state, treeBuilder);
        vm.pushUpdating();
        return vm;
    }
    static empty(runtime, { handle, treeBuilder, dynamicScope }, context) {
        let vm = initJIT(context)(runtime, vmState(runtime.program.heap.getaddr(handle), _environment.ScopeImpl.root(_references.UNDEFINED_REFERENCE, 0), dynamicScope), treeBuilder);
        vm.pushUpdating();
        return vm;
    }
    capture(args, pc = this[_symbols.INNER_VM].fetchRegister(_vm.$pc)) {
        return new _update.ResumableVMStateImpl(this.captureState(args, pc), this.resume);
    }
    compile(block) {
        return block.compile(this.context);
    }
}
exports.JitVM = JitVM;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2FwcGVuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBMEJBOztBQU1BOztBQVdBOztBQWNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFtRkEsTUFBQSxNQUFBLENBQVk7QUFBWixrQkFBQTtBQUNXLGFBQUEsS0FBQSxHQUFRLElBQVIsV0FBUSxFQUFSO0FBQ0EsYUFBQSxZQUFBLEdBQWUsSUFBZixXQUFlLEVBQWY7QUFDQSxhQUFBLFFBQUEsR0FBVyxJQUFYLFdBQVcsRUFBWDtBQUNBLGFBQUEsS0FBQSxHQUFRLElBQVIsV0FBUSxFQUFSO0FBQ0EsYUFBQSxJQUFBLEdBQU8sSUFBUCxXQUFPLEVBQVA7QUFDVjtBQU5XO0FBUUUsTUFBQSxFQUFBLENBQWtCO0FBMkg5Qjs7O0FBSUEsZ0JBQUEsT0FBQSxFQUVFLEVBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBRkYsS0FFRSxFQUZGLEVBQUEsWUFBQSxFQUcrQztBQUZwQyxhQUFBLE9BQUEsR0FBQSxPQUFBO0FBRVEsYUFBQSxZQUFBLEdBQUEsWUFBQTtBQWpJRixhQUFBLEVBQUEsSUFBVyxJQUFYLE1BQVcsRUFBWDtBQUdBLGFBQUEsRUFBQSxJQUFxQixJQUFyQixXQUFxQixFQUFyQjtBQW1CVixhQUFBLEVBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsSUFBQTtBQXlHTCxZQUFJLFlBQVksZ0JBQUEsT0FBQSxDQUFoQixLQUFnQixDQUFoQjtBQUY2QyxpQkFJN0Msa0JBQU8sT0FBQSxFQUFBLEtBQVAsUUFBQSxFQUo2QyxnQkFJN0MsQ0FKNkM7O0FBTTdDLGtCQUFB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Q0FBeUIsS0FBQSxZQUFBLENBQUEsSUFBQSxFQUF6QixFQUF5QixDQUF6QixFQUFzRCxLQUE3RCxNQUFPLENBQVA7QUFDRDtBQUlELFlBQUEsS0FBQSxFQUFpQztBQUMvQixlQUFPLE1BQUEsT0FBQSxDQUFjLEtBQXJCLE9BQU8sQ0FBUDtBQUNEO0FBbkQyQztRQUF4QyxLLEdBQUEsSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBpbGFibGVCbG9jayxcbiAgQ29tcGlsYWJsZVRlbXBsYXRlLFxuICBEZXN0cm95YWJsZSxcbiAgRHJvcCxcbiAgRHluYW1pY1Njb3BlLFxuICBFbnZpcm9ubWVudCxcbiAgSml0T3JBb3RCbG9jayxcbiAgUGFydGlhbFNjb3BlLFxuICBSZW5kZXJSZXN1bHQsXG4gIFJpY2hJdGVyYXRvclJlc3VsdCxcbiAgUnVudGltZUNvbnRleHQsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG4gIFJ1bnRpbWVIZWFwLFxuICBSdW50aW1lUHJvZ3JhbSxcbiAgU2NvcGUsXG4gIFN5bWJvbERlc3Ryb3lhYmxlLFxuICBTeW50YXhDb21waWxhdGlvbkNvbnRleHQsXG4gIFZNIGFzIFB1YmxpY1ZNLFxuICBKaXRSdW50aW1lQ29udGV4dCxcbiAgQW90UnVudGltZUNvbnRleHQsXG4gIExpdmVCbG9jayxcbiAgRWxlbWVudEJ1aWxkZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5pbXBvcnQgeyBSdW50aW1lT3BJbXBsIH0gZnJvbSAnQGdsaW1tZXIvcHJvZ3JhbSc7XG5pbXBvcnQge1xuICBjb21iaW5lU2xpY2UsXG4gIFBhdGhSZWZlcmVuY2UsXG4gIFJlZmVyZW5jZUl0ZXJhdG9yLFxuICBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLFxufSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHtcbiAgYXNzb2NpYXRlRGVzdHJ1Y3RvcixcbiAgZGVzdHJ1Y3RvcixcbiAgZXhwZWN0LFxuICBpc0Ryb3AsXG4gIExpbmtlZExpc3QsXG4gIExpc3RTbGljZSxcbiAgT3B0aW9uLFxuICBTdGFjayxcbiAgYXNzZXJ0LFxufSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gICRmcCxcbiAgJHBjLFxuICAkczAsXG4gICRzMSxcbiAgJHNwLFxuICAkdDAsXG4gICR0MSxcbiAgJHYwLFxuICBpc0xvd0xldmVsUmVnaXN0ZXIsXG4gIE1hY2hpbmVSZWdpc3RlcixcbiAgUmVnaXN0ZXIsXG4gIFN5c2NhbGxSZWdpc3Rlcixcbn0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHsgRGlkTW9kaWZ5T3Bjb2RlLCBKdW1wSWZOb3RNb2RpZmllZE9wY29kZSwgTGFiZWxPcGNvZGUgfSBmcm9tICcuLi9jb21waWxlZC9vcGNvZGVzL3ZtJztcbmltcG9ydCB7IFNjb3BlSW1wbCB9IGZyb20gJy4uL2Vudmlyb25tZW50JztcbmltcG9ydCB7IEFQUEVORF9PUENPREVTLCBEZWJ1Z1N0YXRlLCBVcGRhdGluZ09wY29kZSB9IGZyb20gJy4uL29wY29kZXMnO1xuaW1wb3J0IHsgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4uL3JlZmVyZW5jZXMnO1xuaW1wb3J0IHsgQVJHUywgQ09OU1RBTlRTLCBERVNUUlVDVE9SX1NUQUNLLCBIRUFQLCBJTk5FUl9WTSwgUkVHSVNURVJTLCBTVEFDS1MgfSBmcm9tICcuLi9zeW1ib2xzJztcbmltcG9ydCB7IFZNQXJndW1lbnRzSW1wbCB9IGZyb20gJy4vYXJndW1lbnRzJztcbmltcG9ydCBMb3dMZXZlbFZNIGZyb20gJy4vbG93LWxldmVsJztcbmltcG9ydCBSZW5kZXJSZXN1bHRJbXBsIGZyb20gJy4vcmVuZGVyLXJlc3VsdCc7XG5pbXBvcnQgRXZhbHVhdGlvblN0YWNrSW1wbCwgeyBFdmFsdWF0aW9uU3RhY2sgfSBmcm9tICcuL3N0YWNrJztcbmltcG9ydCB7XG4gIEJsb2NrT3Bjb2RlLFxuICBMaXN0QmxvY2tPcGNvZGUsXG4gIFJlc3VtYWJsZVZNU3RhdGUsXG4gIFJlc3VtYWJsZVZNU3RhdGVJbXBsLFxuICBUcnlPcGNvZGUsXG4gIFZNU3RhdGUsXG59IGZyb20gJy4vdXBkYXRlJztcbmltcG9ydCB7IENoZWNrTnVtYmVyLCBjaGVjayB9IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcblxuLyoqXG4gKiBUaGlzIGludGVyZmFjZSBpcyB1c2VkIGJ5IGludGVybmFsIG9wY29kZXMsIGFuZCBpcyBtb3JlIHN0YWJsZSB0aGFuXG4gKiB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIEFwcGVuZCBWTSBpdHNlbGYuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJuYWxWTTxDIGV4dGVuZHMgSml0T3JBb3RCbG9jayA9IEppdE9yQW90QmxvY2s+IHtcbiAgcmVhZG9ubHkgW0NPTlNUQU5UU106IFJ1bnRpbWVDb25zdGFudHM7XG4gIHJlYWRvbmx5IFtBUkdTXTogVk1Bcmd1bWVudHNJbXBsO1xuXG4gIHJlYWRvbmx5IGVudjogRW52aXJvbm1lbnQ7XG4gIHJlYWRvbmx5IHN0YWNrOiBFdmFsdWF0aW9uU3RhY2s7XG4gIHJlYWRvbmx5IHJ1bnRpbWU6IFJ1bnRpbWVDb250ZXh0O1xuXG4gIGxvYWRWYWx1ZShyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyLCB2YWx1ZTogbnVtYmVyKTogdm9pZDtcbiAgbG9hZFZhbHVlKHJlZ2lzdGVyOiBSZWdpc3RlciwgdmFsdWU6IHVua25vd24pOiB2b2lkO1xuICBsb2FkVmFsdWUocmVnaXN0ZXI6IFJlZ2lzdGVyIHwgTWFjaGluZVJlZ2lzdGVyLCB2YWx1ZTogdW5rbm93bik6IHZvaWQ7XG5cbiAgZmV0Y2hWYWx1ZShyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyLnJhIHwgTWFjaGluZVJlZ2lzdGVyLnBjKTogbnVtYmVyO1xuICAvLyBUT0RPOiBTb21ldGhpbmcgYmV0dGVyIHRoYW4gYSB0eXBlIGFzc2VydGlvbj9cbiAgZmV0Y2hWYWx1ZTxUPihyZWdpc3RlcjogUmVnaXN0ZXIpOiBUO1xuICBmZXRjaFZhbHVlKHJlZ2lzdGVyOiBSZWdpc3Rlcik6IHVua25vd247XG5cbiAgbG9hZChyZWdpc3RlcjogUmVnaXN0ZXIpOiB2b2lkO1xuICBmZXRjaChyZWdpc3RlcjogUmVnaXN0ZXIpOiB2b2lkO1xuXG4gIHNjb3BlKCk6IFNjb3BlPEM+O1xuICBlbGVtZW50cygpOiBFbGVtZW50QnVpbGRlcjtcblxuICBnZXRTZWxmKCk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG5cbiAgdXBkYXRlV2l0aChvcGNvZGU6IFVwZGF0aW5nT3Bjb2RlKTogdm9pZDtcblxuICBhc3NvY2lhdGVEZXN0cm95YWJsZShkOiBTeW1ib2xEZXN0cm95YWJsZSB8IERlc3Ryb3lhYmxlKTogdm9pZDtcblxuICBiZWdpbkNhY2hlR3JvdXAoKTogdm9pZDtcbiAgY29tbWl0Q2FjaGVHcm91cCgpOiB2b2lkO1xuXG4gIC8vLyBJdGVyYXRpb24gLy8vXG5cbiAgZW50ZXJMaXN0KG9mZnNldDogbnVtYmVyKTogdm9pZDtcbiAgZXhpdExpc3QoKTogdm9pZDtcbiAgaXRlcmF0ZShtZW1vOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LCBpdGVtOiBQYXRoUmVmZXJlbmNlPHVua25vd24+KTogVHJ5T3Bjb2RlO1xuICBlbnRlckl0ZW0oa2V5OiB1bmtub3duLCBvcGNvZGU6IFRyeU9wY29kZSk6IHZvaWQ7XG5cbiAgcHVzaFJvb3RTY29wZShzaXplOiBudW1iZXIpOiBQYXJ0aWFsU2NvcGU8Qz47XG4gIHB1c2hDaGlsZFNjb3BlKCk6IHZvaWQ7XG4gIHBvcFNjb3BlKCk6IHZvaWQ7XG4gIHB1c2hTY29wZShzY29wZTogU2NvcGU8Qz4pOiB2b2lkO1xuXG4gIGR5bmFtaWNTY29wZSgpOiBEeW5hbWljU2NvcGU7XG4gIGJpbmREeW5hbWljU2NvcGUobmFtZXM6IG51bWJlcltdKTogdm9pZDtcbiAgcHVzaER5bmFtaWNTY29wZSgpOiB2b2lkO1xuICBwb3BEeW5hbWljU2NvcGUoKTogdm9pZDtcblxuICBlbnRlcihhcmdzOiBudW1iZXIpOiB2b2lkO1xuICBleGl0KCk6IHZvaWQ7XG5cbiAgZ290byhwYzogbnVtYmVyKTogdm9pZDtcbiAgY2FsbChoYW5kbGU6IG51bWJlcik6IHZvaWQ7XG4gIHB1c2hGcmFtZSgpOiB2b2lkO1xuXG4gIHJlZmVyZW5jZUZvclN5bWJvbChzeW1ib2w6IG51bWJlcik6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG5cbiAgZXhlY3V0ZShpbml0aWFsaXplPzogKHZtOiB0aGlzKSA9PiB2b2lkKTogUmVuZGVyUmVzdWx0O1xuICBwdXNoVXBkYXRpbmcobGlzdD86IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KTogdm9pZDtcbiAgbmV4dCgpOiBSaWNoSXRlcmF0b3JSZXN1bHQ8bnVsbCwgUmVuZGVyUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcm5hbEppdFZNIGV4dGVuZHMgSW50ZXJuYWxWTTxDb21waWxhYmxlQmxvY2s+IHtcbiAgY29tcGlsZShibG9jazogQ29tcGlsYWJsZVRlbXBsYXRlKTogbnVtYmVyO1xuICByZWFkb25seSBydW50aW1lOiBKaXRSdW50aW1lQ29udGV4dDtcbiAgcmVhZG9ubHkgY29udGV4dDogU3ludGF4Q29tcGlsYXRpb25Db250ZXh0O1xufVxuXG5jbGFzcyBTdGFja3M8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IHtcbiAgcmVhZG9ubHkgc2NvcGUgPSBuZXcgU3RhY2s8U2NvcGU8Qz4+KCk7XG4gIHJlYWRvbmx5IGR5bmFtaWNTY29wZSA9IG5ldyBTdGFjazxEeW5hbWljU2NvcGU+KCk7XG4gIHJlYWRvbmx5IHVwZGF0aW5nID0gbmV3IFN0YWNrPExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+PigpO1xuICByZWFkb25seSBjYWNoZSA9IG5ldyBTdGFjazxPcHRpb248VXBkYXRpbmdPcGNvZGU+PigpO1xuICByZWFkb25seSBsaXN0ID0gbmV3IFN0YWNrPExpc3RCbG9ja09wY29kZT4oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgVk08QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IGltcGxlbWVudHMgUHVibGljVk0sIEludGVybmFsVk08Qz4ge1xuICBwcml2YXRlIHJlYWRvbmx5IFtTVEFDS1NdID0gbmV3IFN0YWNrczxDPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IFtIRUFQXTogUnVudGltZUhlYXA7XG4gIHByaXZhdGUgcmVhZG9ubHkgZGVzdHJ1Y3Rvcjogb2JqZWN0O1xuICBwcml2YXRlIHJlYWRvbmx5IFtERVNUUlVDVE9SX1NUQUNLXSA9IG5ldyBTdGFjazxvYmplY3Q+KCk7XG4gIHJlYWRvbmx5IFtDT05TVEFOVFNdOiBSdW50aW1lQ29uc3RhbnRzO1xuICByZWFkb25seSBbQVJHU106IFZNQXJndW1lbnRzSW1wbDtcbiAgcmVhZG9ubHkgW0lOTkVSX1ZNXTogTG93TGV2ZWxWTTtcblxuICBnZXQgc3RhY2soKTogRXZhbHVhdGlvblN0YWNrIHtcbiAgICByZXR1cm4gdGhpc1tJTk5FUl9WTV0uc3RhY2sgYXMgRXZhbHVhdGlvblN0YWNrO1xuICB9XG5cbiAgY3VycmVudEJsb2NrKCk6IExpdmVCbG9jayB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHMoKS5ibG9jaygpO1xuICB9XG5cbiAgLyogUmVnaXN0ZXJzICovXG5cbiAgZ2V0IHBjKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXNbSU5ORVJfVk1dLmZldGNoUmVnaXN0ZXIoJHBjKTtcbiAgfVxuXG4gIHB1YmxpYyBzMDogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyBzMTogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB0MDogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB0MTogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB2MDogdW5rbm93biA9IG51bGw7XG5cbiAgLy8gRmV0Y2ggYSB2YWx1ZSBmcm9tIGEgcmVnaXN0ZXIgb250byB0aGUgc3RhY2tcbiAgZmV0Y2gocmVnaXN0ZXI6IFN5c2NhbGxSZWdpc3Rlcik6IHZvaWQge1xuICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLmZldGNoVmFsdWUocmVnaXN0ZXIpKTtcbiAgfVxuXG4gIC8vIExvYWQgYSB2YWx1ZSBmcm9tIHRoZSBzdGFjayBpbnRvIGEgcmVnaXN0ZXJcbiAgbG9hZChyZWdpc3RlcjogU3lzY2FsbFJlZ2lzdGVyKSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5zdGFjay5wb3AoKTtcblxuICAgIHRoaXMubG9hZFZhbHVlKHJlZ2lzdGVyLCB2YWx1ZSk7XG4gIH1cblxuICAvLyBGZXRjaCBhIHZhbHVlIGZyb20gYSByZWdpc3RlclxuICBmZXRjaFZhbHVlKHJlZ2lzdGVyOiBNYWNoaW5lUmVnaXN0ZXIpOiBudW1iZXI7XG4gIGZldGNoVmFsdWU8VD4ocmVnaXN0ZXI6IFJlZ2lzdGVyKTogVDtcbiAgZmV0Y2hWYWx1ZShyZWdpc3RlcjogUmVnaXN0ZXIgfCBNYWNoaW5lUmVnaXN0ZXIpOiB1bmtub3duIHtcbiAgICBpZiAoaXNMb3dMZXZlbFJlZ2lzdGVyKHJlZ2lzdGVyKSkge1xuICAgICAgcmV0dXJuIHRoaXNbSU5ORVJfVk1dLmZldGNoUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIH1cblxuICAgIHN3aXRjaCAocmVnaXN0ZXIpIHtcbiAgICAgIGNhc2UgJHMwOlxuICAgICAgICByZXR1cm4gdGhpcy5zMDtcbiAgICAgIGNhc2UgJHMxOlxuICAgICAgICByZXR1cm4gdGhpcy5zMTtcbiAgICAgIGNhc2UgJHQwOlxuICAgICAgICByZXR1cm4gdGhpcy50MDtcbiAgICAgIGNhc2UgJHQxOlxuICAgICAgICByZXR1cm4gdGhpcy50MTtcbiAgICAgIGNhc2UgJHYwOlxuICAgICAgICByZXR1cm4gdGhpcy52MDtcbiAgICB9XG4gIH1cblxuICAvLyBMb2FkIGEgdmFsdWUgaW50byBhIHJlZ2lzdGVyXG5cbiAgbG9hZFZhbHVlPFQ+KHJlZ2lzdGVyOiBSZWdpc3RlciB8IE1hY2hpbmVSZWdpc3RlciwgdmFsdWU6IFQpOiB2b2lkIHtcbiAgICBpZiAoaXNMb3dMZXZlbFJlZ2lzdGVyKHJlZ2lzdGVyKSkge1xuICAgICAgdGhpc1tJTk5FUl9WTV0ubG9hZFJlZ2lzdGVyKHJlZ2lzdGVyLCAodmFsdWUgYXMgYW55KSBhcyBudW1iZXIpO1xuICAgIH1cblxuICAgIHN3aXRjaCAocmVnaXN0ZXIpIHtcbiAgICAgIGNhc2UgJHMwOlxuICAgICAgICB0aGlzLnMwID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAkczE6XG4gICAgICAgIHRoaXMuczEgPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICR0MDpcbiAgICAgICAgdGhpcy50MCA9IHZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJHQxOlxuICAgICAgICB0aGlzLnQxID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAkdjA6XG4gICAgICAgIHRoaXMudjAgPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1pZ3JhdGVkIHRvIElubmVyXG4gICAqL1xuXG4gIC8vIFN0YXJ0IGEgbmV3IGZyYW1lIGFuZCBzYXZlICRyYSBhbmQgJGZwIG9uIHRoZSBzdGFja1xuICBwdXNoRnJhbWUoKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucHVzaEZyYW1lKCk7XG4gIH1cblxuICAvLyBSZXN0b3JlICRyYSwgJHNwIGFuZCAkZnBcbiAgcG9wRnJhbWUoKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucG9wRnJhbWUoKTtcbiAgfVxuXG4gIC8vIEp1bXAgdG8gYW4gYWRkcmVzcyBpbiBgcHJvZ3JhbWBcbiAgZ290byhvZmZzZXQ6IG51bWJlcikge1xuICAgIHRoaXNbSU5ORVJfVk1dLmdvdG8ob2Zmc2V0KTtcbiAgfVxuXG4gIC8vIFNhdmUgJHBjIGludG8gJHJhLCB0aGVuIGp1bXAgdG8gYSBuZXcgYWRkcmVzcyBpbiBgcHJvZ3JhbWAgKGphbCBpbiBNSVBTKVxuICBjYWxsKGhhbmRsZTogbnVtYmVyKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0uY2FsbChoYW5kbGUpO1xuICB9XG5cbiAgLy8gUHV0IGEgc3BlY2lmaWMgYHByb2dyYW1gIGFkZHJlc3MgaW4gJHJhXG4gIHJldHVyblRvKG9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucmV0dXJuVG8ob2Zmc2V0KTtcbiAgfVxuXG4gIC8vIFJldHVybiB0byB0aGUgYHByb2dyYW1gIGFkZHJlc3Mgc3RvcmVkIGluICRyYVxuICByZXR1cm4oKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucmV0dXJuKCk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIG9mIG1pZ3JhdGVkLlxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBydW50aW1lOiBSdW50aW1lQ29udGV4dCxcbiAgICB7IHBjLCBzY29wZSwgZHluYW1pY1Njb3BlLCBzdGFjayB9OiBWTVN0YXRlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZWxlbWVudFN0YWNrOiBFbGVtZW50QnVpbGRlclxuICApIHtcbiAgICBsZXQgZXZhbFN0YWNrID0gRXZhbHVhdGlvblN0YWNrSW1wbC5yZXN0b3JlKHN0YWNrKTtcblxuICAgIGFzc2VydCh0eXBlb2YgcGMgPT09ICdudW1iZXInLCAncGMgaXMgYSBudW1iZXInKTtcblxuICAgIGV2YWxTdGFja1tSRUdJU1RFUlNdWyRwY10gPSBwYztcbiAgICBldmFsU3RhY2tbUkVHSVNURVJTXVskc3BdID0gc3RhY2subGVuZ3RoIC0gMTtcbiAgICBldmFsU3RhY2tbUkVHSVNURVJTXVskZnBdID0gLTE7XG5cbiAgICB0aGlzW0hFQVBdID0gdGhpcy5wcm9ncmFtLmhlYXA7XG4gICAgdGhpc1tDT05TVEFOVFNdID0gdGhpcy5wcm9ncmFtLmNvbnN0YW50cztcbiAgICB0aGlzLmVsZW1lbnRTdGFjayA9IGVsZW1lbnRTdGFjaztcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaChzY29wZSk7XG4gICAgdGhpc1tTVEFDS1NdLmR5bmFtaWNTY29wZS5wdXNoKGR5bmFtaWNTY29wZSk7XG4gICAgdGhpc1tBUkdTXSA9IG5ldyBWTUFyZ3VtZW50c0ltcGwoKTtcbiAgICB0aGlzW0lOTkVSX1ZNXSA9IG5ldyBMb3dMZXZlbFZNKFxuICAgICAgZXZhbFN0YWNrLFxuICAgICAgdGhpc1tIRUFQXSxcbiAgICAgIHJ1bnRpbWUucHJvZ3JhbSxcbiAgICAgIHtcbiAgICAgICAgZGVidWdCZWZvcmU6IChvcGNvZGU6IFJ1bnRpbWVPcEltcGwpOiBEZWJ1Z1N0YXRlID0+IHtcbiAgICAgICAgICByZXR1cm4gQVBQRU5EX09QQ09ERVMuZGVidWdCZWZvcmUodGhpcywgb3Bjb2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWJ1Z0FmdGVyOiAoc3RhdGU6IERlYnVnU3RhdGUpOiB2b2lkID0+IHtcbiAgICAgICAgICBBUFBFTkRfT1BDT0RFUy5kZWJ1Z0FmdGVyKHRoaXMsIHN0YXRlKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBldmFsU3RhY2tbUkVHSVNURVJTXVxuICAgICk7XG5cbiAgICB0aGlzLmRlc3RydWN0b3IgPSB7fTtcbiAgICB0aGlzW0RFU1RSVUNUT1JfU1RBQ0tdLnB1c2godGhpcy5kZXN0cnVjdG9yKTtcbiAgfVxuXG4gIGdldCBwcm9ncmFtKCk6IFJ1bnRpbWVQcm9ncmFtIHtcbiAgICByZXR1cm4gdGhpcy5ydW50aW1lLnByb2dyYW07XG4gIH1cblxuICBnZXQgZW52KCk6IEVudmlyb25tZW50IHtcbiAgICByZXR1cm4gdGhpcy5ydW50aW1lLmVudjtcbiAgfVxuXG4gIGNhcHR1cmVTdGF0ZShhcmdzOiBudW1iZXIsIHBjID0gdGhpc1tJTk5FUl9WTV0uZmV0Y2hSZWdpc3RlcigkcGMpKTogVk1TdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBjLFxuICAgICAgZHluYW1pY1Njb3BlOiB0aGlzLmR5bmFtaWNTY29wZSgpLFxuICAgICAgc2NvcGU6IHRoaXMuc2NvcGUoKSxcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLmNhcHR1cmUoYXJncyksXG4gICAgfTtcbiAgfVxuXG4gIGFic3RyYWN0IGNhcHR1cmUoYXJnczogbnVtYmVyLCBwYz86IG51bWJlcik6IFJlc3VtYWJsZVZNU3RhdGU8SW50ZXJuYWxWTT47XG5cbiAgYmVnaW5DYWNoZUdyb3VwKCkge1xuICAgIHRoaXNbU1RBQ0tTXS5jYWNoZS5wdXNoKHRoaXMudXBkYXRpbmcoKS50YWlsKCkpO1xuICB9XG5cbiAgY29tbWl0Q2FjaGVHcm91cCgpIHtcbiAgICBsZXQgRU5EID0gbmV3IExhYmVsT3Bjb2RlKCdFTkQnKTtcblxuICAgIGxldCBvcGNvZGVzID0gdGhpcy51cGRhdGluZygpO1xuICAgIGxldCBtYXJrZXIgPSB0aGlzW1NUQUNLU10uY2FjaGUucG9wKCk7XG4gICAgbGV0IGhlYWQgPSBtYXJrZXIgPyBvcGNvZGVzLm5leHROb2RlKG1hcmtlcikgOiBvcGNvZGVzLmhlYWQoKTtcbiAgICBsZXQgdGFpbCA9IG9wY29kZXMudGFpbCgpO1xuICAgIGxldCB0YWcgPSBjb21iaW5lU2xpY2UobmV3IExpc3RTbGljZShoZWFkLCB0YWlsKSk7XG5cbiAgICBsZXQgZ3VhcmQgPSBuZXcgSnVtcElmTm90TW9kaWZpZWRPcGNvZGUodGFnLCBFTkQpO1xuXG4gICAgb3Bjb2Rlcy5pbnNlcnRCZWZvcmUoZ3VhcmQsIGhlYWQpO1xuICAgIG9wY29kZXMuYXBwZW5kKG5ldyBEaWRNb2RpZnlPcGNvZGUoZ3VhcmQpKTtcbiAgICBvcGNvZGVzLmFwcGVuZChFTkQpO1xuICB9XG5cbiAgZW50ZXIoYXJnczogbnVtYmVyKSB7XG4gICAgbGV0IHVwZGF0aW5nID0gbmV3IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KCk7XG5cbiAgICBsZXQgc3RhdGUgPSB0aGlzLmNhcHR1cmUoYXJncyk7XG4gICAgbGV0IGJsb2NrID0gdGhpcy5lbGVtZW50cygpLnB1c2hVcGRhdGFibGVCbG9jaygpO1xuXG4gICAgbGV0IHRyeU9wY29kZSA9IG5ldyBUcnlPcGNvZGUoc3RhdGUsIHRoaXMucnVudGltZSwgYmxvY2ssIHVwZGF0aW5nKTtcblxuICAgIHRoaXMuZGlkRW50ZXIodHJ5T3Bjb2RlKTtcbiAgfVxuXG4gIGl0ZXJhdGUoXG4gICAgbWVtbzogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICB2YWx1ZTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPlxuICApOiBUcnlPcGNvZGUge1xuICAgIGxldCBzdGFjayA9IHRoaXMuc3RhY2s7XG4gICAgc3RhY2sucHVzaCh2YWx1ZSk7XG4gICAgc3RhY2sucHVzaChtZW1vKTtcblxuICAgIGxldCBzdGF0ZSA9IHRoaXMuY2FwdHVyZSgyKTtcbiAgICBsZXQgYmxvY2sgPSB0aGlzLmVsZW1lbnRzKCkucHVzaFVwZGF0YWJsZUJsb2NrKCk7XG5cbiAgICAvLyBsZXQgaXAgPSB0aGlzLmlwO1xuICAgIC8vIHRoaXMuaXAgPSBlbmQgKyA0O1xuICAgIC8vIHRoaXMuZnJhbWVzLnB1c2goaXApO1xuXG4gICAgcmV0dXJuIG5ldyBUcnlPcGNvZGUoc3RhdGUsIHRoaXMucnVudGltZSwgYmxvY2ssIG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpKTtcbiAgfVxuXG4gIGVudGVySXRlbShrZXk6IHN0cmluZywgb3Bjb2RlOiBUcnlPcGNvZGUpIHtcbiAgICB0aGlzLmxpc3RCbG9jaygpLm1hcC5zZXQoa2V5LCBvcGNvZGUpO1xuICAgIHRoaXMuZGlkRW50ZXIob3Bjb2RlKTtcbiAgfVxuXG4gIGVudGVyTGlzdChvZmZzZXQ6IG51bWJlcikge1xuICAgIGxldCB1cGRhdGluZyA9IG5ldyBMaW5rZWRMaXN0PEJsb2NrT3Bjb2RlPigpO1xuXG4gICAgbGV0IGFkZHIgPSB0aGlzW0lOTkVSX1ZNXS50YXJnZXQob2Zmc2V0KTtcbiAgICBsZXQgc3RhdGUgPSB0aGlzLmNhcHR1cmUoMCwgYWRkcik7XG4gICAgbGV0IGxpc3QgPSB0aGlzLmVsZW1lbnRzKCkucHVzaEJsb2NrTGlzdCh1cGRhdGluZyk7XG4gICAgbGV0IGFydGlmYWN0cyA9IHRoaXMuc3RhY2sucGVlazxSZWZlcmVuY2VJdGVyYXRvcj4oKS5hcnRpZmFjdHM7XG5cbiAgICBsZXQgb3Bjb2RlID0gbmV3IExpc3RCbG9ja09wY29kZShzdGF0ZSwgdGhpcy5ydW50aW1lLCBsaXN0LCB1cGRhdGluZywgYXJ0aWZhY3RzKTtcblxuICAgIHRoaXNbU1RBQ0tTXS5saXN0LnB1c2gob3Bjb2RlKTtcblxuICAgIHRoaXMuZGlkRW50ZXIob3Bjb2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgZGlkRW50ZXIob3Bjb2RlOiBCbG9ja09wY29kZSkge1xuICAgIHRoaXMuYXNzb2NpYXRlRGVzdHJ1Y3RvcihkZXN0cnVjdG9yKG9wY29kZSkpO1xuICAgIHRoaXNbREVTVFJVQ1RPUl9TVEFDS10ucHVzaChvcGNvZGUpO1xuICAgIHRoaXMudXBkYXRlV2l0aChvcGNvZGUpO1xuICAgIHRoaXMucHVzaFVwZGF0aW5nKG9wY29kZS5jaGlsZHJlbik7XG4gIH1cblxuICBleGl0KCkge1xuICAgIHRoaXNbREVTVFJVQ1RPUl9TVEFDS10ucG9wKCk7XG4gICAgdGhpcy5lbGVtZW50cygpLnBvcEJsb2NrKCk7XG4gICAgdGhpcy5wb3BVcGRhdGluZygpO1xuXG4gICAgbGV0IHBhcmVudCA9IHRoaXMudXBkYXRpbmcoKS50YWlsKCkgYXMgQmxvY2tPcGNvZGU7XG5cbiAgICBwYXJlbnQuZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKCk7XG4gIH1cblxuICBleGl0TGlzdCgpIHtcbiAgICB0aGlzLmV4aXQoKTtcbiAgICB0aGlzW1NUQUNLU10ubGlzdC5wb3AoKTtcbiAgfVxuXG4gIHB1c2hVcGRhdGluZyhsaXN0ID0gbmV3IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KCkpOiB2b2lkIHtcbiAgICB0aGlzW1NUQUNLU10udXBkYXRpbmcucHVzaChsaXN0KTtcbiAgfVxuXG4gIHBvcFVwZGF0aW5nKCk6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+IHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXNbU1RBQ0tTXS51cGRhdGluZy5wb3AoKSwgXCJjYW4ndCBwb3AgYW4gZW1wdHkgc3RhY2tcIik7XG4gIH1cblxuICB1cGRhdGVXaXRoKG9wY29kZTogVXBkYXRpbmdPcGNvZGUpIHtcbiAgICB0aGlzLnVwZGF0aW5nKCkuYXBwZW5kKG9wY29kZSk7XG4gIH1cblxuICBsaXN0QmxvY2soKTogTGlzdEJsb2NrT3Bjb2RlIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXNbU1RBQ0tTXS5saXN0LmN1cnJlbnQsICdleHBlY3RlZCBhIGxpc3QgYmxvY2snKTtcbiAgfVxuXG4gIGFzc29jaWF0ZURlc3RydWN0b3IoY2hpbGQ6IERyb3ApOiB2b2lkIHtcbiAgICBpZiAoIWlzRHJvcChjaGlsZCkpIHJldHVybjtcbiAgICBsZXQgcGFyZW50ID0gZXhwZWN0KHRoaXNbREVTVFJVQ1RPUl9TVEFDS10uY3VycmVudCwgJ0V4cGVjdGVkIGRlc3RydWN0b3IgcGFyZW50Jyk7XG4gICAgYXNzb2NpYXRlRGVzdHJ1Y3RvcihwYXJlbnQsIGNoaWxkKTtcbiAgfVxuXG4gIGFzc29jaWF0ZURlc3Ryb3lhYmxlKGNoaWxkOiBTeW1ib2xEZXN0cm95YWJsZSB8IERlc3Ryb3lhYmxlKTogdm9pZCB7XG4gICAgdGhpcy5hc3NvY2lhdGVEZXN0cnVjdG9yKGRlc3RydWN0b3IoY2hpbGQpKTtcbiAgfVxuXG4gIHRyeVVwZGF0aW5nKCk6IE9wdGlvbjxMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPj4ge1xuICAgIHJldHVybiB0aGlzW1NUQUNLU10udXBkYXRpbmcuY3VycmVudDtcbiAgfVxuXG4gIHVwZGF0aW5nKCk6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+IHtcbiAgICByZXR1cm4gZXhwZWN0KFxuICAgICAgdGhpc1tTVEFDS1NdLnVwZGF0aW5nLmN1cnJlbnQsXG4gICAgICAnZXhwZWN0ZWQgdXBkYXRpbmcgb3Bjb2RlIG9uIHRoZSB1cGRhdGluZyBvcGNvZGUgc3RhY2snXG4gICAgKTtcbiAgfVxuXG4gIGVsZW1lbnRzKCk6IEVsZW1lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2s7XG4gIH1cblxuICBzY29wZSgpOiBTY29wZTxDPiB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzW1NUQUNLU10uc2NvcGUuY3VycmVudCwgJ2V4cGVjdGVkIHNjb3BlIG9uIHRoZSBzY29wZSBzdGFjaycpO1xuICB9XG5cbiAgZHluYW1pY1Njb3BlKCk6IER5bmFtaWNTY29wZSB7XG4gICAgcmV0dXJuIGV4cGVjdChcbiAgICAgIHRoaXNbU1RBQ0tTXS5keW5hbWljU2NvcGUuY3VycmVudCxcbiAgICAgICdleHBlY3RlZCBkeW5hbWljIHNjb3BlIG9uIHRoZSBkeW5hbWljIHNjb3BlIHN0YWNrJ1xuICAgICk7XG4gIH1cblxuICBwdXNoQ2hpbGRTY29wZSgpIHtcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaCh0aGlzLnNjb3BlKCkuY2hpbGQoKSk7XG4gIH1cblxuICBwdXNoRHluYW1pY1Njb3BlKCk6IER5bmFtaWNTY29wZSB7XG4gICAgbGV0IGNoaWxkID0gdGhpcy5keW5hbWljU2NvcGUoKS5jaGlsZCgpO1xuICAgIHRoaXNbU1RBQ0tTXS5keW5hbWljU2NvcGUucHVzaChjaGlsZCk7XG4gICAgcmV0dXJuIGNoaWxkO1xuICB9XG5cbiAgcHVzaFJvb3RTY29wZShzaXplOiBudW1iZXIpOiBQYXJ0aWFsU2NvcGU8Qz4ge1xuICAgIGxldCBzY29wZSA9IFNjb3BlSW1wbC5zaXplZDxDPihzaXplKTtcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaChzY29wZSk7XG4gICAgcmV0dXJuIHNjb3BlO1xuICB9XG5cbiAgcHVzaFNjb3BlKHNjb3BlOiBTY29wZTxDPikge1xuICAgIHRoaXNbU1RBQ0tTXS5zY29wZS5wdXNoKHNjb3BlKTtcbiAgfVxuXG4gIHBvcFNjb3BlKCkge1xuICAgIHRoaXNbU1RBQ0tTXS5zY29wZS5wb3AoKTtcbiAgfVxuXG4gIHBvcER5bmFtaWNTY29wZSgpIHtcbiAgICB0aGlzW1NUQUNLU10uZHluYW1pY1Njb3BlLnBvcCgpO1xuICB9XG5cbiAgLy8vIFNDT1BFIEhFTFBFUlNcblxuICBnZXRTZWxmKCk6IFBhdGhSZWZlcmVuY2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc2NvcGUoKS5nZXRTZWxmKCk7XG4gIH1cblxuICByZWZlcmVuY2VGb3JTeW1ib2woc3ltYm9sOiBudW1iZXIpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5zY29wZSgpLmdldFN5bWJvbChzeW1ib2wpO1xuICB9XG5cbiAgLy8vIEVYRUNVVElPTlxuXG4gIGV4ZWN1dGUoaW5pdGlhbGl6ZT86ICh2bTogdGhpcykgPT4gdm9pZCk6IFJlbmRlclJlc3VsdCB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zb2xlLmxvZyhgRVhFQ1VUSU5HIEZST00gJHt0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYyl9YCk7XG4gICAgfVxuXG4gICAgaWYgKGluaXRpYWxpemUpIGluaXRpYWxpemUodGhpcyk7XG5cbiAgICBsZXQgcmVzdWx0OiBSaWNoSXRlcmF0b3JSZXN1bHQ8bnVsbCwgUmVuZGVyUmVzdWx0PjtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLm5leHQoKTtcbiAgICAgIGlmIChyZXN1bHQuZG9uZSkgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfVxuXG4gIG5leHQoKTogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD4ge1xuICAgIGxldCB7IGVudiwgZWxlbWVudFN0YWNrIH0gPSB0aGlzO1xuICAgIGxldCBvcGNvZGUgPSB0aGlzW0lOTkVSX1ZNXS5uZXh0U3RhdGVtZW50KCk7XG4gICAgbGV0IHJlc3VsdDogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD47XG4gICAgaWYgKG9wY29kZSAhPT0gbnVsbCkge1xuICAgICAgdGhpc1tJTk5FUl9WTV0uZXZhbHVhdGVPdXRlcihvcGNvZGUsIHRoaXMpO1xuICAgICAgcmVzdWx0ID0geyBkb25lOiBmYWxzZSwgdmFsdWU6IG51bGwgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVW5sb2FkIHRoZSBzdGFja1xuICAgICAgdGhpcy5zdGFjay5yZXNldCgpO1xuXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIGRvbmU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgUmVuZGVyUmVzdWx0SW1wbChcbiAgICAgICAgICBlbnYsXG4gICAgICAgICAgdGhpcy5wb3BVcGRhdGluZygpLFxuICAgICAgICAgIGVsZW1lbnRTdGFjay5wb3BCbG9jaygpLFxuICAgICAgICAgIHRoaXMuZGVzdHJ1Y3RvclxuICAgICAgICApLFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGJpbmREeW5hbWljU2NvcGUobmFtZXM6IG51bWJlcltdKSB7XG4gICAgbGV0IHNjb3BlID0gdGhpcy5keW5hbWljU2NvcGUoKTtcblxuICAgIGZvciAobGV0IGkgPSBuYW1lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IG5hbWUgPSB0aGlzW0NPTlNUQU5UU10uZ2V0U3RyaW5nKG5hbWVzW2ldKTtcbiAgICAgIHNjb3BlLnNldChuYW1lLCB0aGlzLnN0YWNrLnBvcDxWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+PigpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdm1TdGF0ZTxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4oXG4gIHBjOiBudW1iZXIsXG4gIHNjb3BlOiBTY29wZTxDPiA9IFNjb3BlSW1wbC5yb290PEM+KFVOREVGSU5FRF9SRUZFUkVOQ0UsIDApLFxuICBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZVxuKSB7XG4gIHJldHVybiB7XG4gICAgcGMsXG4gICAgc2NvcGUsXG4gICAgZHluYW1pY1Njb3BlLFxuICAgIHN0YWNrOiBbXSxcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNaW5pbWFsSW5pdE9wdGlvbnMge1xuICBoYW5kbGU6IG51bWJlcjtcbiAgdHJlZUJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyO1xuICBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbml0T3B0aW9ucyBleHRlbmRzIE1pbmltYWxJbml0T3B0aW9ucyB7XG4gIHNlbGY6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG59XG5cbmV4cG9ydCBjbGFzcyBBb3RWTSBleHRlbmRzIFZNPG51bWJlcj4gaW1wbGVtZW50cyBJbnRlcm5hbFZNPG51bWJlcj4ge1xuICBzdGF0aWMgZW1wdHkoXG4gICAgcnVudGltZTogQW90UnVudGltZUNvbnRleHQsXG4gICAgeyBoYW5kbGUsIHRyZWVCdWlsZGVyLCBkeW5hbWljU2NvcGUgfTogTWluaW1hbEluaXRPcHRpb25zXG4gICk6IEludGVybmFsVk08bnVtYmVyPiB7XG4gICAgbGV0IHZtID0gaW5pdEFPVChcbiAgICAgIHJ1bnRpbWUsXG4gICAgICB2bVN0YXRlKFxuICAgICAgICBydW50aW1lLnByb2dyYW0uaGVhcC5nZXRhZGRyKGhhbmRsZSksXG4gICAgICAgIFNjb3BlSW1wbC5yb290PG51bWJlcj4oVU5ERUZJTkVEX1JFRkVSRU5DRSwgMCksXG4gICAgICAgIGR5bmFtaWNTY29wZVxuICAgICAgKSxcbiAgICAgIHRyZWVCdWlsZGVyXG4gICAgKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICBzdGF0aWMgaW5pdGlhbChcbiAgICBydW50aW1lOiBBb3RSdW50aW1lQ29udGV4dCxcbiAgICB7IGhhbmRsZSwgc2VsZiwgdHJlZUJ1aWxkZXIsIGR5bmFtaWNTY29wZSB9OiBJbml0T3B0aW9uc1xuICApIHtcbiAgICBsZXQgc2NvcGVTaXplID0gcnVudGltZS5wcm9ncmFtLmhlYXAuc2NvcGVzaXplb2YoaGFuZGxlKTtcbiAgICBsZXQgc2NvcGUgPSBTY29wZUltcGwucm9vdChzZWxmLCBzY29wZVNpemUpO1xuICAgIGxldCBwYyA9IGNoZWNrKHJ1bnRpbWUucHJvZ3JhbS5oZWFwLmdldGFkZHIoaGFuZGxlKSwgQ2hlY2tOdW1iZXIpO1xuICAgIGxldCBzdGF0ZSA9IHZtU3RhdGUocGMsIHNjb3BlLCBkeW5hbWljU2NvcGUpO1xuICAgIGxldCB2bSA9IGluaXRBT1QocnVudGltZSwgc3RhdGUsIHRyZWVCdWlsZGVyKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICBjYXB0dXJlKGFyZ3M6IG51bWJlciwgcGMgPSB0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYykpOiBSZXN1bWFibGVWTVN0YXRlPEFvdFZNPiB7XG4gICAgcmV0dXJuIG5ldyBSZXN1bWFibGVWTVN0YXRlSW1wbCh0aGlzLmNhcHR1cmVTdGF0ZShhcmdzLCBwYyksIGluaXRBT1QpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFZtSW5pdENhbGxiYWNrPFYgZXh0ZW5kcyBJbnRlcm5hbFZNID0gSW50ZXJuYWxWTT4gPSAoXG4gIHRoaXM6IHZvaWQsXG4gIHJ1bnRpbWU6IFYgZXh0ZW5kcyBKaXRWTSA/IEppdFJ1bnRpbWVDb250ZXh0IDogQW90UnVudGltZUNvbnRleHQsXG4gIHN0YXRlOiBWTVN0YXRlLFxuICBidWlsZGVyOiBFbGVtZW50QnVpbGRlclxuKSA9PiBWO1xuXG5leHBvcnQgdHlwZSBKaXRWbUluaXRDYWxsYmFjazxWIGV4dGVuZHMgSW50ZXJuYWxWTT4gPSAoXG4gIHRoaXM6IHZvaWQsXG4gIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICBzdGF0ZTogVk1TdGF0ZSxcbiAgYnVpbGRlcjogRWxlbWVudEJ1aWxkZXJcbikgPT4gVjtcblxuZnVuY3Rpb24gaW5pdEFPVChydW50aW1lOiBBb3RSdW50aW1lQ29udGV4dCwgc3RhdGU6IFZNU3RhdGUsIGJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyKTogQW90Vk0ge1xuICByZXR1cm4gbmV3IEFvdFZNKHJ1bnRpbWUsIHN0YXRlLCBidWlsZGVyKTtcbn1cblxuZnVuY3Rpb24gaW5pdEpJVChjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHQpOiBKaXRWbUluaXRDYWxsYmFjazxKaXRWTT4ge1xuICByZXR1cm4gKHJ1bnRpbWUsIHN0YXRlLCBidWlsZGVyKSA9PiBuZXcgSml0Vk0ocnVudGltZSwgc3RhdGUsIGJ1aWxkZXIsIGNvbnRleHQpO1xufVxuXG5leHBvcnQgY2xhc3MgSml0Vk0gZXh0ZW5kcyBWTTxDb21waWxhYmxlQmxvY2s+IGltcGxlbWVudHMgSW50ZXJuYWxKaXRWTSB7XG4gIHN0YXRpYyBpbml0aWFsKFxuICAgIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICAgIGNvbnRleHQ6IFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCxcbiAgICB7IGhhbmRsZSwgc2VsZiwgZHluYW1pY1Njb3BlLCB0cmVlQnVpbGRlciB9OiBJbml0T3B0aW9uc1xuICApIHtcbiAgICBsZXQgc2NvcGVTaXplID0gcnVudGltZS5wcm9ncmFtLmhlYXAuc2NvcGVzaXplb2YoaGFuZGxlKTtcbiAgICBsZXQgc2NvcGUgPSBTY29wZUltcGwucm9vdChzZWxmLCBzY29wZVNpemUpO1xuICAgIGxldCBzdGF0ZSA9IHZtU3RhdGUocnVudGltZS5wcm9ncmFtLmhlYXAuZ2V0YWRkcihoYW5kbGUpLCBzY29wZSwgZHluYW1pY1Njb3BlKTtcbiAgICBsZXQgdm0gPSBpbml0SklUKGNvbnRleHQpKHJ1bnRpbWUsIHN0YXRlLCB0cmVlQnVpbGRlcik7XG4gICAgdm0ucHVzaFVwZGF0aW5nKCk7XG4gICAgcmV0dXJuIHZtO1xuICB9XG5cbiAgc3RhdGljIGVtcHR5KFxuICAgIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICAgIHsgaGFuZGxlLCB0cmVlQnVpbGRlciwgZHluYW1pY1Njb3BlIH06IE1pbmltYWxJbml0T3B0aW9ucyxcbiAgICBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHRcbiAgKSB7XG4gICAgbGV0IHZtID0gaW5pdEpJVChjb250ZXh0KShcbiAgICAgIHJ1bnRpbWUsXG4gICAgICB2bVN0YXRlKFxuICAgICAgICBydW50aW1lLnByb2dyYW0uaGVhcC5nZXRhZGRyKGhhbmRsZSksXG4gICAgICAgIFNjb3BlSW1wbC5yb290PENvbXBpbGFibGVCbG9jaz4oVU5ERUZJTkVEX1JFRkVSRU5DRSwgMCksXG4gICAgICAgIGR5bmFtaWNTY29wZVxuICAgICAgKSxcbiAgICAgIHRyZWVCdWlsZGVyXG4gICAgKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICByZWFkb25seSBydW50aW1lITogSml0UnVudGltZUNvbnRleHQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcnVudGltZTogSml0UnVudGltZUNvbnRleHQsXG4gICAgc3RhdGU6IFZNU3RhdGUsXG4gICAgZWxlbWVudFN0YWNrOiBFbGVtZW50QnVpbGRlcixcbiAgICByZWFkb25seSBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHRcbiAgKSB7XG4gICAgc3VwZXIocnVudGltZSwgc3RhdGUsIGVsZW1lbnRTdGFjayk7XG4gIH1cblxuICBjYXB0dXJlKGFyZ3M6IG51bWJlciwgcGMgPSB0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYykpOiBSZXN1bWFibGVWTVN0YXRlPEppdFZNPiB7XG4gICAgcmV0dXJuIG5ldyBSZXN1bWFibGVWTVN0YXRlSW1wbCh0aGlzLmNhcHR1cmVTdGF0ZShhcmdzLCBwYyksIHRoaXMucmVzdW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdW1lOiBWbUluaXRDYWxsYmFjazxKaXRWTT4gPSBpbml0SklUKHRoaXMuY29udGV4dCk7XG5cbiAgY29tcGlsZShibG9jazogQ29tcGlsYWJsZVRlbXBsYXRlKTogbnVtYmVyIHtcbiAgICByZXR1cm4gYmxvY2suY29tcGlsZSh0aGlzLmNvbnRleHQpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9