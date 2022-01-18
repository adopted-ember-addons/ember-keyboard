function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _a, _b;

import { combineSlice } from '@glimmer/reference';
import { associateDestructor as _associateDestructor, destructor, isDrop, LinkedList, ListSlice, Stack, assert } from '@glimmer/util';
import { $fp, $pc, $s0, $s1, $sp, $t0, $t1, $v0, isLowLevelRegister } from '@glimmer/vm';
import { DidModifyOpcode, JumpIfNotModifiedOpcode, LabelOpcode } from '../compiled/opcodes/vm';
import { ScopeImpl } from '../environment';
import { APPEND_OPCODES } from '../opcodes';
import { UNDEFINED_REFERENCE } from '../references';
import { ARGS, CONSTANTS, DESTRUCTOR_STACK, HEAP, INNER_VM, REGISTERS, STACKS } from '../symbols';
import { VMArgumentsImpl } from './arguments';
import LowLevelVM from './low-level';
import RenderResultImpl from './render-result';
import EvaluationStackImpl from './stack';
import { ListBlockOpcode, ResumableVMStateImpl, TryOpcode } from './update';

var Stacks = function Stacks() {
    _classCallCheck(this, Stacks);

    this.scope = new Stack();
    this.dynamicScope = new Stack();
    this.updating = new Stack();
    this.cache = new Stack();
    this.list = new Stack();
};

var VM = function () {
    /**
     * End of migrated.
     */
    function VM(runtime, _ref, elementStack) {
        var _this = this;

        var pc = _ref.pc,
            scope = _ref.scope,
            dynamicScope = _ref.dynamicScope,
            stack = _ref.stack;

        _classCallCheck(this, VM);

        this.runtime = runtime;
        this.elementStack = elementStack;
        this[_a] = new Stacks();
        this[_b] = new Stack();
        this.s0 = null;
        this.s1 = null;
        this.t0 = null;
        this.t1 = null;
        this.v0 = null;
        var evalStack = EvaluationStackImpl.restore(stack);
        false && assert(typeof pc === 'number', 'pc is a number');

        evalStack[REGISTERS][$pc] = pc;
        evalStack[REGISTERS][$sp] = stack.length - 1;
        evalStack[REGISTERS][$fp] = -1;
        this[HEAP] = this.program.heap;
        this[CONSTANTS] = this.program.constants;
        this.elementStack = elementStack;
        this[STACKS].scope.push(scope);
        this[STACKS].dynamicScope.push(dynamicScope);
        this[ARGS] = new VMArgumentsImpl();
        this[INNER_VM] = new LowLevelVM(evalStack, this[HEAP], runtime.program, {
            debugBefore: function debugBefore(opcode) {
                return APPEND_OPCODES.debugBefore(_this, opcode);
            },
            debugAfter: function debugAfter(state) {
                APPEND_OPCODES.debugAfter(_this, state);
            }
        }, evalStack[REGISTERS]);
        this.destructor = {};
        this[DESTRUCTOR_STACK].push(this.destructor);
    }

    VM.prototype.currentBlock = function currentBlock() {
        return this.elements().block();
    };
    /* Registers */


    // Fetch a value from a register onto the stack
    VM.prototype.fetch = function fetch(register) {
        this.stack.push(this.fetchValue(register));
    };
    // Load a value from the stack into a register


    VM.prototype.load = function load(register) {
        var value = this.stack.pop();
        this.loadValue(register, value);
    };

    VM.prototype.fetchValue = function fetchValue(register) {
        if (isLowLevelRegister(register)) {
            return this[INNER_VM].fetchRegister(register);
        }
        switch (register) {
            case $s0:
                return this.s0;
            case $s1:
                return this.s1;
            case $t0:
                return this.t0;
            case $t1:
                return this.t1;
            case $v0:
                return this.v0;
        }
    };
    // Load a value into a register


    VM.prototype.loadValue = function loadValue(register, value) {
        if (isLowLevelRegister(register)) {
            this[INNER_VM].loadRegister(register, value);
        }
        switch (register) {
            case $s0:
                this.s0 = value;
                break;
            case $s1:
                this.s1 = value;
                break;
            case $t0:
                this.t0 = value;
                break;
            case $t1:
                this.t1 = value;
                break;
            case $v0:
                this.v0 = value;
                break;
        }
    };
    /**
     * Migrated to Inner
     */
    // Start a new frame and save $ra and $fp on the stack


    VM.prototype.pushFrame = function pushFrame() {
        this[INNER_VM].pushFrame();
    };
    // Restore $ra, $sp and $fp


    VM.prototype.popFrame = function popFrame() {
        this[INNER_VM].popFrame();
    };
    // Jump to an address in `program`


    VM.prototype.goto = function goto(offset) {
        this[INNER_VM].goto(offset);
    };
    // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)


    VM.prototype.call = function call(handle) {
        this[INNER_VM].call(handle);
    };
    // Put a specific `program` address in $ra


    VM.prototype.returnTo = function returnTo(offset) {
        this[INNER_VM].returnTo(offset);
    };
    // Return to the `program` address stored in $ra


    VM.prototype.return = function _return() {
        this[INNER_VM].return();
    };

    VM.prototype.captureState = function captureState(args) {
        var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[INNER_VM].fetchRegister($pc);

        return {
            pc: pc,
            dynamicScope: this.dynamicScope(),
            scope: this.scope(),
            stack: this.stack.capture(args)
        };
    };

    VM.prototype.beginCacheGroup = function beginCacheGroup() {
        this[STACKS].cache.push(this.updating().tail());
    };

    VM.prototype.commitCacheGroup = function commitCacheGroup() {
        var END = new LabelOpcode('END');
        var opcodes = this.updating();
        var marker = this[STACKS].cache.pop();
        var head = marker ? opcodes.nextNode(marker) : opcodes.head();
        var tail = opcodes.tail();
        var tag = combineSlice(new ListSlice(head, tail));
        var guard = new JumpIfNotModifiedOpcode(tag, END);
        opcodes.insertBefore(guard, head);
        opcodes.append(new DidModifyOpcode(guard));
        opcodes.append(END);
    };

    VM.prototype.enter = function enter(args) {
        var updating = new LinkedList();
        var state = this.capture(args);
        var block = this.elements().pushUpdatableBlock();
        var tryOpcode = new TryOpcode(state, this.runtime, block, updating);
        this.didEnter(tryOpcode);
    };

    VM.prototype.iterate = function iterate(memo, value) {
        var stack = this.stack;
        stack.push(value);
        stack.push(memo);
        var state = this.capture(2);
        var block = this.elements().pushUpdatableBlock();
        // let ip = this.ip;
        // this.ip = end + 4;
        // this.frames.push(ip);
        return new TryOpcode(state, this.runtime, block, new LinkedList());
    };

    VM.prototype.enterItem = function enterItem(key, opcode) {
        this.listBlock().map.set(key, opcode);
        this.didEnter(opcode);
    };

    VM.prototype.enterList = function enterList(offset) {
        var updating = new LinkedList();
        var addr = this[INNER_VM].target(offset);
        var state = this.capture(0, addr);
        var list = this.elements().pushBlockList(updating);
        var artifacts = this.stack.peek().artifacts;
        var opcode = new ListBlockOpcode(state, this.runtime, list, updating, artifacts);
        this[STACKS].list.push(opcode);
        this.didEnter(opcode);
    };

    VM.prototype.didEnter = function didEnter(opcode) {
        this.associateDestructor(destructor(opcode));
        this[DESTRUCTOR_STACK].push(opcode);
        this.updateWith(opcode);
        this.pushUpdating(opcode.children);
    };

    VM.prototype.exit = function exit() {
        this[DESTRUCTOR_STACK].pop();
        this.elements().popBlock();
        this.popUpdating();
        var parent = this.updating().tail();
        parent.didInitializeChildren();
    };

    VM.prototype.exitList = function exitList() {
        this.exit();
        this[STACKS].list.pop();
    };

    VM.prototype.pushUpdating = function pushUpdating() {
        var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new LinkedList();

        this[STACKS].updating.push(list);
    };

    VM.prototype.popUpdating = function popUpdating() {
        return this[STACKS].updating.pop();
    };

    VM.prototype.updateWith = function updateWith(opcode) {
        this.updating().append(opcode);
    };

    VM.prototype.listBlock = function listBlock() {
        return this[STACKS].list.current;
    };

    VM.prototype.associateDestructor = function associateDestructor(child) {
        if (!isDrop(child)) return;
        var parent = this[DESTRUCTOR_STACK].current;
        _associateDestructor(parent, child);
    };

    VM.prototype.associateDestroyable = function associateDestroyable(child) {
        this.associateDestructor(destructor(child));
    };

    VM.prototype.tryUpdating = function tryUpdating() {
        return this[STACKS].updating.current;
    };

    VM.prototype.updating = function updating() {
        return this[STACKS].updating.current;
    };

    VM.prototype.elements = function elements() {
        return this.elementStack;
    };

    VM.prototype.scope = function scope() {
        return this[STACKS].scope.current;
    };

    VM.prototype.dynamicScope = function dynamicScope() {
        return this[STACKS].dynamicScope.current;
    };

    VM.prototype.pushChildScope = function pushChildScope() {
        this[STACKS].scope.push(this.scope().child());
    };

    VM.prototype.pushDynamicScope = function pushDynamicScope() {
        var child = this.dynamicScope().child();
        this[STACKS].dynamicScope.push(child);
        return child;
    };

    VM.prototype.pushRootScope = function pushRootScope(size) {
        var scope = ScopeImpl.sized(size);
        this[STACKS].scope.push(scope);
        return scope;
    };

    VM.prototype.pushScope = function pushScope(scope) {
        this[STACKS].scope.push(scope);
    };

    VM.prototype.popScope = function popScope() {
        this[STACKS].scope.pop();
    };

    VM.prototype.popDynamicScope = function popDynamicScope() {
        this[STACKS].dynamicScope.pop();
    };
    /// SCOPE HELPERS


    VM.prototype.getSelf = function getSelf() {
        return this.scope().getSelf();
    };

    VM.prototype.referenceForSymbol = function referenceForSymbol(symbol) {
        return this.scope().getSymbol(symbol);
    };
    /// EXECUTION


    VM.prototype.execute = function execute(initialize) {
        if (false) {
            console.log('EXECUTING FROM ' + this[INNER_VM].fetchRegister($pc));
        }
        if (initialize) initialize(this);
        var result = void 0;
        while (true) {
            result = this.next();
            if (result.done) break;
        }
        return result.value;
    };

    VM.prototype.next = function next() {
        var env = this.env,
            elementStack = this.elementStack;

        var opcode = this[INNER_VM].nextStatement();
        var result = void 0;
        if (opcode !== null) {
            this[INNER_VM].evaluateOuter(opcode, this);
            result = { done: false, value: null };
        } else {
            // Unload the stack
            this.stack.reset();
            result = {
                done: true,
                value: new RenderResultImpl(env, this.popUpdating(), elementStack.popBlock(), this.destructor)
            };
        }
        return result;
    };

    VM.prototype.bindDynamicScope = function bindDynamicScope(names) {
        var scope = this.dynamicScope();
        for (var i = names.length - 1; i >= 0; i--) {
            var name = this[CONSTANTS].getString(names[i]);
            scope.set(name, this.stack.pop());
        }
    };

    _createClass(VM, [{
        key: 'stack',
        get: function get() {
            return this[INNER_VM].stack;
        }
    }, {
        key: 'pc',
        get: function get() {
            return this[INNER_VM].fetchRegister($pc);
        }
    }, {
        key: 'program',
        get: function get() {
            return this.runtime.program;
        }
    }, {
        key: 'env',
        get: function get() {
            return this.runtime.env;
        }
    }]);

    return VM;
}();

export default VM;

_a = STACKS, _b = DESTRUCTOR_STACK;
function vmState(pc) {
    var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ScopeImpl.root(UNDEFINED_REFERENCE, 0);
    var dynamicScope = arguments[2];

    return {
        pc: pc,
        scope: scope,
        dynamicScope: dynamicScope,
        stack: []
    };
}
export var AotVM = function (_VM) {
    _inherits(AotVM, _VM);

    function AotVM() {
        _classCallCheck(this, AotVM);

        return _possibleConstructorReturn(this, _VM.apply(this, arguments));
    }

    AotVM.empty = function empty(runtime, _ref2) {
        var handle = _ref2.handle,
            treeBuilder = _ref2.treeBuilder,
            dynamicScope = _ref2.dynamicScope;

        var vm = initAOT(runtime, vmState(runtime.program.heap.getaddr(handle), ScopeImpl.root(UNDEFINED_REFERENCE, 0), dynamicScope), treeBuilder);
        vm.pushUpdating();
        return vm;
    };

    AotVM.initial = function initial(runtime, _ref3) {
        var handle = _ref3.handle,
            self = _ref3.self,
            treeBuilder = _ref3.treeBuilder,
            dynamicScope = _ref3.dynamicScope;

        var scopeSize = runtime.program.heap.scopesizeof(handle);
        var scope = ScopeImpl.root(self, scopeSize);
        var pc = runtime.program.heap.getaddr(handle);
        var state = vmState(pc, scope, dynamicScope);
        var vm = initAOT(runtime, state, treeBuilder);
        vm.pushUpdating();
        return vm;
    };

    AotVM.prototype.capture = function capture(args) {
        var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[INNER_VM].fetchRegister($pc);

        return new ResumableVMStateImpl(this.captureState(args, pc), initAOT);
    };

    return AotVM;
}(VM);
function initAOT(runtime, state, builder) {
    return new AotVM(runtime, state, builder);
}
function initJIT(context) {
    return function (runtime, state, builder) {
        return new JitVM(runtime, state, builder, context);
    };
}
export var JitVM = function (_VM2) {
    _inherits(JitVM, _VM2);

    function JitVM(runtime, state, elementStack, context) {
        _classCallCheck(this, JitVM);

        var _this3 = _possibleConstructorReturn(this, _VM2.call(this, runtime, state, elementStack));

        _this3.context = context;
        _this3.resume = initJIT(_this3.context);
        return _this3;
    }

    JitVM.initial = function initial(runtime, context, _ref4) {
        var handle = _ref4.handle,
            self = _ref4.self,
            dynamicScope = _ref4.dynamicScope,
            treeBuilder = _ref4.treeBuilder;

        var scopeSize = runtime.program.heap.scopesizeof(handle);
        var scope = ScopeImpl.root(self, scopeSize);
        var state = vmState(runtime.program.heap.getaddr(handle), scope, dynamicScope);
        var vm = initJIT(context)(runtime, state, treeBuilder);
        vm.pushUpdating();
        return vm;
    };

    JitVM.empty = function empty(runtime, _ref5, context) {
        var handle = _ref5.handle,
            treeBuilder = _ref5.treeBuilder,
            dynamicScope = _ref5.dynamicScope;

        var vm = initJIT(context)(runtime, vmState(runtime.program.heap.getaddr(handle), ScopeImpl.root(UNDEFINED_REFERENCE, 0), dynamicScope), treeBuilder);
        vm.pushUpdating();
        return vm;
    };

    JitVM.prototype.capture = function capture(args) {
        var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[INNER_VM].fetchRegister($pc);

        return new ResumableVMStateImpl(this.captureState(args, pc), this.resume);
    };

    JitVM.prototype.compile = function compile(block) {
        return block.compile(this.context);
    };

    return JitVM;
}(VM);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2FwcGVuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUEwQkEsU0FBQSxZQUFBLFFBQUEsb0JBQUE7QUFNQSxTQUFBLDJDQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLFFBQUEsZUFBQTtBQVdBLFNBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxrQkFBQSxRQUFBLGFBQUE7QUFjQSxTQUFBLGVBQUEsRUFBQSx1QkFBQSxFQUFBLFdBQUEsUUFBQSx3QkFBQTtBQUNBLFNBQUEsU0FBQSxRQUFBLGdCQUFBO0FBQ0EsU0FBQSxjQUFBLFFBQUEsWUFBQTtBQUNBLFNBQUEsbUJBQUEsUUFBQSxlQUFBO0FBQ0EsU0FBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLGdCQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsTUFBQSxRQUFBLFlBQUE7QUFDQSxTQUFBLGVBQUEsUUFBQSxhQUFBO0FBQ0EsT0FBQSxVQUFBLE1BQUEsYUFBQTtBQUNBLE9BQUEsZ0JBQUEsTUFBQSxpQkFBQTtBQUNBLE9BQUEsbUJBQUEsTUFBQSxTQUFBO0FBQ0EsU0FBQSxlQUFBLEVBQUEsb0JBQUEsRUFBQSxTQUFBLFFBQUEsVUFBQTs7SUFtRkEsTSxHQUFBLGtCQUFBO0FBQUE7O0FBQ1csU0FBQSxLQUFBLEdBQVEsSUFBUixLQUFRLEVBQVI7QUFDQSxTQUFBLFlBQUEsR0FBZSxJQUFmLEtBQWUsRUFBZjtBQUNBLFNBQUEsUUFBQSxHQUFXLElBQVgsS0FBVyxFQUFYO0FBQ0EsU0FBQSxLQUFBLEdBQVEsSUFBUixLQUFRLEVBQVI7QUFDQSxTQUFBLElBQUEsR0FBTyxJQUFQLEtBQU8sRUFBUDtB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Q0FERixFQUVFLFVBQUEsSUFBQSxDQUFBLG1CQUFBLEVBRkYsQ0FFRSxDQUZGLEVBRk8sWUFFUCxDQUZPLEVBQVQsV0FBUyxDQUFUO0FBU0EsV0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0QsS0E5Qkg7O0FBQUEsb0JBMkNFLE9BM0NGLG9CQTJDRSxJQTNDRixFQTJDOEQ7QUFBQSxZQUF0QyxFQUFzQyx1RUFBakMsS0FBQSxRQUFBLEVBQUEsYUFBQSxDQUEzQixHQUEyQixDQUFpQzs7QUFDMUQsZUFBTyxJQUFBLG9CQUFBLENBQXlCLEtBQUEsWUFBQSxDQUFBLElBQUEsRUFBekIsRUFBeUIsQ0FBekIsRUFBc0QsS0FBN0QsTUFBTyxDQUFQO0FBQ0QsS0E3Q0g7O0FBQUEsb0JBaURFLE9BakRGLG9CQWlERSxLQWpERixFQWlEbUM7QUFDL0IsZUFBTyxNQUFBLE9BQUEsQ0FBYyxLQUFyQixPQUFPLENBQVA7QUFDRCxLQW5ESDs7QUFBQTtBQUFBLEVBQU0sRUFBTiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBpbGFibGVCbG9jayxcbiAgQ29tcGlsYWJsZVRlbXBsYXRlLFxuICBEZXN0cm95YWJsZSxcbiAgRHJvcCxcbiAgRHluYW1pY1Njb3BlLFxuICBFbnZpcm9ubWVudCxcbiAgSml0T3JBb3RCbG9jayxcbiAgUGFydGlhbFNjb3BlLFxuICBSZW5kZXJSZXN1bHQsXG4gIFJpY2hJdGVyYXRvclJlc3VsdCxcbiAgUnVudGltZUNvbnRleHQsXG4gIFJ1bnRpbWVDb25zdGFudHMsXG4gIFJ1bnRpbWVIZWFwLFxuICBSdW50aW1lUHJvZ3JhbSxcbiAgU2NvcGUsXG4gIFN5bWJvbERlc3Ryb3lhYmxlLFxuICBTeW50YXhDb21waWxhdGlvbkNvbnRleHQsXG4gIFZNIGFzIFB1YmxpY1ZNLFxuICBKaXRSdW50aW1lQ29udGV4dCxcbiAgQW90UnVudGltZUNvbnRleHQsXG4gIExpdmVCbG9jayxcbiAgRWxlbWVudEJ1aWxkZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5pbXBvcnQgeyBSdW50aW1lT3BJbXBsIH0gZnJvbSAnQGdsaW1tZXIvcHJvZ3JhbSc7XG5pbXBvcnQge1xuICBjb21iaW5lU2xpY2UsXG4gIFBhdGhSZWZlcmVuY2UsXG4gIFJlZmVyZW5jZUl0ZXJhdG9yLFxuICBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLFxufSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHtcbiAgYXNzb2NpYXRlRGVzdHJ1Y3RvcixcbiAgZGVzdHJ1Y3RvcixcbiAgZXhwZWN0LFxuICBpc0Ryb3AsXG4gIExpbmtlZExpc3QsXG4gIExpc3RTbGljZSxcbiAgT3B0aW9uLFxuICBTdGFjayxcbiAgYXNzZXJ0LFxufSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gICRmcCxcbiAgJHBjLFxuICAkczAsXG4gICRzMSxcbiAgJHNwLFxuICAkdDAsXG4gICR0MSxcbiAgJHYwLFxuICBpc0xvd0xldmVsUmVnaXN0ZXIsXG4gIE1hY2hpbmVSZWdpc3RlcixcbiAgUmVnaXN0ZXIsXG4gIFN5c2NhbGxSZWdpc3Rlcixcbn0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHsgRGlkTW9kaWZ5T3Bjb2RlLCBKdW1wSWZOb3RNb2RpZmllZE9wY29kZSwgTGFiZWxPcGNvZGUgfSBmcm9tICcuLi9jb21waWxlZC9vcGNvZGVzL3ZtJztcbmltcG9ydCB7IFNjb3BlSW1wbCB9IGZyb20gJy4uL2Vudmlyb25tZW50JztcbmltcG9ydCB7IEFQUEVORF9PUENPREVTLCBEZWJ1Z1N0YXRlLCBVcGRhdGluZ09wY29kZSB9IGZyb20gJy4uL29wY29kZXMnO1xuaW1wb3J0IHsgVU5ERUZJTkVEX1JFRkVSRU5DRSB9IGZyb20gJy4uL3JlZmVyZW5jZXMnO1xuaW1wb3J0IHsgQVJHUywgQ09OU1RBTlRTLCBERVNUUlVDVE9SX1NUQUNLLCBIRUFQLCBJTk5FUl9WTSwgUkVHSVNURVJTLCBTVEFDS1MgfSBmcm9tICcuLi9zeW1ib2xzJztcbmltcG9ydCB7IFZNQXJndW1lbnRzSW1wbCB9IGZyb20gJy4vYXJndW1lbnRzJztcbmltcG9ydCBMb3dMZXZlbFZNIGZyb20gJy4vbG93LWxldmVsJztcbmltcG9ydCBSZW5kZXJSZXN1bHRJbXBsIGZyb20gJy4vcmVuZGVyLXJlc3VsdCc7XG5pbXBvcnQgRXZhbHVhdGlvblN0YWNrSW1wbCwgeyBFdmFsdWF0aW9uU3RhY2sgfSBmcm9tICcuL3N0YWNrJztcbmltcG9ydCB7XG4gIEJsb2NrT3Bjb2RlLFxuICBMaXN0QmxvY2tPcGNvZGUsXG4gIFJlc3VtYWJsZVZNU3RhdGUsXG4gIFJlc3VtYWJsZVZNU3RhdGVJbXBsLFxuICBUcnlPcGNvZGUsXG4gIFZNU3RhdGUsXG59IGZyb20gJy4vdXBkYXRlJztcbmltcG9ydCB7IENoZWNrTnVtYmVyLCBjaGVjayB9IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcblxuLyoqXG4gKiBUaGlzIGludGVyZmFjZSBpcyB1c2VkIGJ5IGludGVybmFsIG9wY29kZXMsIGFuZCBpcyBtb3JlIHN0YWJsZSB0aGFuXG4gKiB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIEFwcGVuZCBWTSBpdHNlbGYuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJuYWxWTTxDIGV4dGVuZHMgSml0T3JBb3RCbG9jayA9IEppdE9yQW90QmxvY2s+IHtcbiAgcmVhZG9ubHkgW0NPTlNUQU5UU106IFJ1bnRpbWVDb25zdGFudHM7XG4gIHJlYWRvbmx5IFtBUkdTXTogVk1Bcmd1bWVudHNJbXBsO1xuXG4gIHJlYWRvbmx5IGVudjogRW52aXJvbm1lbnQ7XG4gIHJlYWRvbmx5IHN0YWNrOiBFdmFsdWF0aW9uU3RhY2s7XG4gIHJlYWRvbmx5IHJ1bnRpbWU6IFJ1bnRpbWVDb250ZXh0O1xuXG4gIGxvYWRWYWx1ZShyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyLCB2YWx1ZTogbnVtYmVyKTogdm9pZDtcbiAgbG9hZFZhbHVlKHJlZ2lzdGVyOiBSZWdpc3RlciwgdmFsdWU6IHVua25vd24pOiB2b2lkO1xuICBsb2FkVmFsdWUocmVnaXN0ZXI6IFJlZ2lzdGVyIHwgTWFjaGluZVJlZ2lzdGVyLCB2YWx1ZTogdW5rbm93bik6IHZvaWQ7XG5cbiAgZmV0Y2hWYWx1ZShyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyLnJhIHwgTWFjaGluZVJlZ2lzdGVyLnBjKTogbnVtYmVyO1xuICAvLyBUT0RPOiBTb21ldGhpbmcgYmV0dGVyIHRoYW4gYSB0eXBlIGFzc2VydGlvbj9cbiAgZmV0Y2hWYWx1ZTxUPihyZWdpc3RlcjogUmVnaXN0ZXIpOiBUO1xuICBmZXRjaFZhbHVlKHJlZ2lzdGVyOiBSZWdpc3Rlcik6IHVua25vd247XG5cbiAgbG9hZChyZWdpc3RlcjogUmVnaXN0ZXIpOiB2b2lkO1xuICBmZXRjaChyZWdpc3RlcjogUmVnaXN0ZXIpOiB2b2lkO1xuXG4gIHNjb3BlKCk6IFNjb3BlPEM+O1xuICBlbGVtZW50cygpOiBFbGVtZW50QnVpbGRlcjtcblxuICBnZXRTZWxmKCk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG5cbiAgdXBkYXRlV2l0aChvcGNvZGU6IFVwZGF0aW5nT3Bjb2RlKTogdm9pZDtcblxuICBhc3NvY2lhdGVEZXN0cm95YWJsZShkOiBTeW1ib2xEZXN0cm95YWJsZSB8IERlc3Ryb3lhYmxlKTogdm9pZDtcblxuICBiZWdpbkNhY2hlR3JvdXAoKTogdm9pZDtcbiAgY29tbWl0Q2FjaGVHcm91cCgpOiB2b2lkO1xuXG4gIC8vLyBJdGVyYXRpb24gLy8vXG5cbiAgZW50ZXJMaXN0KG9mZnNldDogbnVtYmVyKTogdm9pZDtcbiAgZXhpdExpc3QoKTogdm9pZDtcbiAgaXRlcmF0ZShtZW1vOiBQYXRoUmVmZXJlbmNlPHVua25vd24+LCBpdGVtOiBQYXRoUmVmZXJlbmNlPHVua25vd24+KTogVHJ5T3Bjb2RlO1xuICBlbnRlckl0ZW0oa2V5OiB1bmtub3duLCBvcGNvZGU6IFRyeU9wY29kZSk6IHZvaWQ7XG5cbiAgcHVzaFJvb3RTY29wZShzaXplOiBudW1iZXIpOiBQYXJ0aWFsU2NvcGU8Qz47XG4gIHB1c2hDaGlsZFNjb3BlKCk6IHZvaWQ7XG4gIHBvcFNjb3BlKCk6IHZvaWQ7XG4gIHB1c2hTY29wZShzY29wZTogU2NvcGU8Qz4pOiB2b2lkO1xuXG4gIGR5bmFtaWNTY29wZSgpOiBEeW5hbWljU2NvcGU7XG4gIGJpbmREeW5hbWljU2NvcGUobmFtZXM6IG51bWJlcltdKTogdm9pZDtcbiAgcHVzaER5bmFtaWNTY29wZSgpOiB2b2lkO1xuICBwb3BEeW5hbWljU2NvcGUoKTogdm9pZDtcblxuICBlbnRlcihhcmdzOiBudW1iZXIpOiB2b2lkO1xuICBleGl0KCk6IHZvaWQ7XG5cbiAgZ290byhwYzogbnVtYmVyKTogdm9pZDtcbiAgY2FsbChoYW5kbGU6IG51bWJlcik6IHZvaWQ7XG4gIHB1c2hGcmFtZSgpOiB2b2lkO1xuXG4gIHJlZmVyZW5jZUZvclN5bWJvbChzeW1ib2w6IG51bWJlcik6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG5cbiAgZXhlY3V0ZShpbml0aWFsaXplPzogKHZtOiB0aGlzKSA9PiB2b2lkKTogUmVuZGVyUmVzdWx0O1xuICBwdXNoVXBkYXRpbmcobGlzdD86IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KTogdm9pZDtcbiAgbmV4dCgpOiBSaWNoSXRlcmF0b3JSZXN1bHQ8bnVsbCwgUmVuZGVyUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcm5hbEppdFZNIGV4dGVuZHMgSW50ZXJuYWxWTTxDb21waWxhYmxlQmxvY2s+IHtcbiAgY29tcGlsZShibG9jazogQ29tcGlsYWJsZVRlbXBsYXRlKTogbnVtYmVyO1xuICByZWFkb25seSBydW50aW1lOiBKaXRSdW50aW1lQ29udGV4dDtcbiAgcmVhZG9ubHkgY29udGV4dDogU3ludGF4Q29tcGlsYXRpb25Db250ZXh0O1xufVxuXG5jbGFzcyBTdGFja3M8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IHtcbiAgcmVhZG9ubHkgc2NvcGUgPSBuZXcgU3RhY2s8U2NvcGU8Qz4+KCk7XG4gIHJlYWRvbmx5IGR5bmFtaWNTY29wZSA9IG5ldyBTdGFjazxEeW5hbWljU2NvcGU+KCk7XG4gIHJlYWRvbmx5IHVwZGF0aW5nID0gbmV3IFN0YWNrPExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+PigpO1xuICByZWFkb25seSBjYWNoZSA9IG5ldyBTdGFjazxPcHRpb248VXBkYXRpbmdPcGNvZGU+PigpO1xuICByZWFkb25seSBsaXN0ID0gbmV3IFN0YWNrPExpc3RCbG9ja09wY29kZT4oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgVk08QyBleHRlbmRzIEppdE9yQW90QmxvY2s+IGltcGxlbWVudHMgUHVibGljVk0sIEludGVybmFsVk08Qz4ge1xuICBwcml2YXRlIHJlYWRvbmx5IFtTVEFDS1NdID0gbmV3IFN0YWNrczxDPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IFtIRUFQXTogUnVudGltZUhlYXA7XG4gIHByaXZhdGUgcmVhZG9ubHkgZGVzdHJ1Y3Rvcjogb2JqZWN0O1xuICBwcml2YXRlIHJlYWRvbmx5IFtERVNUUlVDVE9SX1NUQUNLXSA9IG5ldyBTdGFjazxvYmplY3Q+KCk7XG4gIHJlYWRvbmx5IFtDT05TVEFOVFNdOiBSdW50aW1lQ29uc3RhbnRzO1xuICByZWFkb25seSBbQVJHU106IFZNQXJndW1lbnRzSW1wbDtcbiAgcmVhZG9ubHkgW0lOTkVSX1ZNXTogTG93TGV2ZWxWTTtcblxuICBnZXQgc3RhY2soKTogRXZhbHVhdGlvblN0YWNrIHtcbiAgICByZXR1cm4gdGhpc1tJTk5FUl9WTV0uc3RhY2sgYXMgRXZhbHVhdGlvblN0YWNrO1xuICB9XG5cbiAgY3VycmVudEJsb2NrKCk6IExpdmVCbG9jayB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHMoKS5ibG9jaygpO1xuICB9XG5cbiAgLyogUmVnaXN0ZXJzICovXG5cbiAgZ2V0IHBjKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXNbSU5ORVJfVk1dLmZldGNoUmVnaXN0ZXIoJHBjKTtcbiAgfVxuXG4gIHB1YmxpYyBzMDogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyBzMTogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB0MDogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB0MTogdW5rbm93biA9IG51bGw7XG4gIHB1YmxpYyB2MDogdW5rbm93biA9IG51bGw7XG5cbiAgLy8gRmV0Y2ggYSB2YWx1ZSBmcm9tIGEgcmVnaXN0ZXIgb250byB0aGUgc3RhY2tcbiAgZmV0Y2gocmVnaXN0ZXI6IFN5c2NhbGxSZWdpc3Rlcik6IHZvaWQge1xuICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLmZldGNoVmFsdWUocmVnaXN0ZXIpKTtcbiAgfVxuXG4gIC8vIExvYWQgYSB2YWx1ZSBmcm9tIHRoZSBzdGFjayBpbnRvIGEgcmVnaXN0ZXJcbiAgbG9hZChyZWdpc3RlcjogU3lzY2FsbFJlZ2lzdGVyKSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5zdGFjay5wb3AoKTtcblxuICAgIHRoaXMubG9hZFZhbHVlKHJlZ2lzdGVyLCB2YWx1ZSk7XG4gIH1cblxuICAvLyBGZXRjaCBhIHZhbHVlIGZyb20gYSByZWdpc3RlclxuICBmZXRjaFZhbHVlKHJlZ2lzdGVyOiBNYWNoaW5lUmVnaXN0ZXIpOiBudW1iZXI7XG4gIGZldGNoVmFsdWU8VD4ocmVnaXN0ZXI6IFJlZ2lzdGVyKTogVDtcbiAgZmV0Y2hWYWx1ZShyZWdpc3RlcjogUmVnaXN0ZXIgfCBNYWNoaW5lUmVnaXN0ZXIpOiB1bmtub3duIHtcbiAgICBpZiAoaXNMb3dMZXZlbFJlZ2lzdGVyKHJlZ2lzdGVyKSkge1xuICAgICAgcmV0dXJuIHRoaXNbSU5ORVJfVk1dLmZldGNoUmVnaXN0ZXIocmVnaXN0ZXIpO1xuICAgIH1cblxuICAgIHN3aXRjaCAocmVnaXN0ZXIpIHtcbiAgICAgIGNhc2UgJHMwOlxuICAgICAgICByZXR1cm4gdGhpcy5zMDtcbiAgICAgIGNhc2UgJHMxOlxuICAgICAgICByZXR1cm4gdGhpcy5zMTtcbiAgICAgIGNhc2UgJHQwOlxuICAgICAgICByZXR1cm4gdGhpcy50MDtcbiAgICAgIGNhc2UgJHQxOlxuICAgICAgICByZXR1cm4gdGhpcy50MTtcbiAgICAgIGNhc2UgJHYwOlxuICAgICAgICByZXR1cm4gdGhpcy52MDtcbiAgICB9XG4gIH1cblxuICAvLyBMb2FkIGEgdmFsdWUgaW50byBhIHJlZ2lzdGVyXG5cbiAgbG9hZFZhbHVlPFQ+KHJlZ2lzdGVyOiBSZWdpc3RlciB8IE1hY2hpbmVSZWdpc3RlciwgdmFsdWU6IFQpOiB2b2lkIHtcbiAgICBpZiAoaXNMb3dMZXZlbFJlZ2lzdGVyKHJlZ2lzdGVyKSkge1xuICAgICAgdGhpc1tJTk5FUl9WTV0ubG9hZFJlZ2lzdGVyKHJlZ2lzdGVyLCAodmFsdWUgYXMgYW55KSBhcyBudW1iZXIpO1xuICAgIH1cblxuICAgIHN3aXRjaCAocmVnaXN0ZXIpIHtcbiAgICAgIGNhc2UgJHMwOlxuICAgICAgICB0aGlzLnMwID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAkczE6XG4gICAgICAgIHRoaXMuczEgPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICR0MDpcbiAgICAgICAgdGhpcy50MCA9IHZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJHQxOlxuICAgICAgICB0aGlzLnQxID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAkdjA6XG4gICAgICAgIHRoaXMudjAgPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1pZ3JhdGVkIHRvIElubmVyXG4gICAqL1xuXG4gIC8vIFN0YXJ0IGEgbmV3IGZyYW1lIGFuZCBzYXZlICRyYSBhbmQgJGZwIG9uIHRoZSBzdGFja1xuICBwdXNoRnJhbWUoKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucHVzaEZyYW1lKCk7XG4gIH1cblxuICAvLyBSZXN0b3JlICRyYSwgJHNwIGFuZCAkZnBcbiAgcG9wRnJhbWUoKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucG9wRnJhbWUoKTtcbiAgfVxuXG4gIC8vIEp1bXAgdG8gYW4gYWRkcmVzcyBpbiBgcHJvZ3JhbWBcbiAgZ290byhvZmZzZXQ6IG51bWJlcikge1xuICAgIHRoaXNbSU5ORVJfVk1dLmdvdG8ob2Zmc2V0KTtcbiAgfVxuXG4gIC8vIFNhdmUgJHBjIGludG8gJHJhLCB0aGVuIGp1bXAgdG8gYSBuZXcgYWRkcmVzcyBpbiBgcHJvZ3JhbWAgKGphbCBpbiBNSVBTKVxuICBjYWxsKGhhbmRsZTogbnVtYmVyKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0uY2FsbChoYW5kbGUpO1xuICB9XG5cbiAgLy8gUHV0IGEgc3BlY2lmaWMgYHByb2dyYW1gIGFkZHJlc3MgaW4gJHJhXG4gIHJldHVyblRvKG9mZnNldDogbnVtYmVyKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucmV0dXJuVG8ob2Zmc2V0KTtcbiAgfVxuXG4gIC8vIFJldHVybiB0byB0aGUgYHByb2dyYW1gIGFkZHJlc3Mgc3RvcmVkIGluICRyYVxuICByZXR1cm4oKSB7XG4gICAgdGhpc1tJTk5FUl9WTV0ucmV0dXJuKCk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIG9mIG1pZ3JhdGVkLlxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBydW50aW1lOiBSdW50aW1lQ29udGV4dCxcbiAgICB7IHBjLCBzY29wZSwgZHluYW1pY1Njb3BlLCBzdGFjayB9OiBWTVN0YXRlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZWxlbWVudFN0YWNrOiBFbGVtZW50QnVpbGRlclxuICApIHtcbiAgICBsZXQgZXZhbFN0YWNrID0gRXZhbHVhdGlvblN0YWNrSW1wbC5yZXN0b3JlKHN0YWNrKTtcblxuICAgIGFzc2VydCh0eXBlb2YgcGMgPT09ICdudW1iZXInLCAncGMgaXMgYSBudW1iZXInKTtcblxuICAgIGV2YWxTdGFja1tSRUdJU1RFUlNdWyRwY10gPSBwYztcbiAgICBldmFsU3RhY2tbUkVHSVNURVJTXVskc3BdID0gc3RhY2subGVuZ3RoIC0gMTtcbiAgICBldmFsU3RhY2tbUkVHSVNURVJTXVskZnBdID0gLTE7XG5cbiAgICB0aGlzW0hFQVBdID0gdGhpcy5wcm9ncmFtLmhlYXA7XG4gICAgdGhpc1tDT05TVEFOVFNdID0gdGhpcy5wcm9ncmFtLmNvbnN0YW50cztcbiAgICB0aGlzLmVsZW1lbnRTdGFjayA9IGVsZW1lbnRTdGFjaztcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaChzY29wZSk7XG4gICAgdGhpc1tTVEFDS1NdLmR5bmFtaWNTY29wZS5wdXNoKGR5bmFtaWNTY29wZSk7XG4gICAgdGhpc1tBUkdTXSA9IG5ldyBWTUFyZ3VtZW50c0ltcGwoKTtcbiAgICB0aGlzW0lOTkVSX1ZNXSA9IG5ldyBMb3dMZXZlbFZNKFxuICAgICAgZXZhbFN0YWNrLFxuICAgICAgdGhpc1tIRUFQXSxcbiAgICAgIHJ1bnRpbWUucHJvZ3JhbSxcbiAgICAgIHtcbiAgICAgICAgZGVidWdCZWZvcmU6IChvcGNvZGU6IFJ1bnRpbWVPcEltcGwpOiBEZWJ1Z1N0YXRlID0+IHtcbiAgICAgICAgICByZXR1cm4gQVBQRU5EX09QQ09ERVMuZGVidWdCZWZvcmUodGhpcywgb3Bjb2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWJ1Z0FmdGVyOiAoc3RhdGU6IERlYnVnU3RhdGUpOiB2b2lkID0+IHtcbiAgICAgICAgICBBUFBFTkRfT1BDT0RFUy5kZWJ1Z0FmdGVyKHRoaXMsIHN0YXRlKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBldmFsU3RhY2tbUkVHSVNURVJTXVxuICAgICk7XG5cbiAgICB0aGlzLmRlc3RydWN0b3IgPSB7fTtcbiAgICB0aGlzW0RFU1RSVUNUT1JfU1RBQ0tdLnB1c2godGhpcy5kZXN0cnVjdG9yKTtcbiAgfVxuXG4gIGdldCBwcm9ncmFtKCk6IFJ1bnRpbWVQcm9ncmFtIHtcbiAgICByZXR1cm4gdGhpcy5ydW50aW1lLnByb2dyYW07XG4gIH1cblxuICBnZXQgZW52KCk6IEVudmlyb25tZW50IHtcbiAgICByZXR1cm4gdGhpcy5ydW50aW1lLmVudjtcbiAgfVxuXG4gIGNhcHR1cmVTdGF0ZShhcmdzOiBudW1iZXIsIHBjID0gdGhpc1tJTk5FUl9WTV0uZmV0Y2hSZWdpc3RlcigkcGMpKTogVk1TdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBjLFxuICAgICAgZHluYW1pY1Njb3BlOiB0aGlzLmR5bmFtaWNTY29wZSgpLFxuICAgICAgc2NvcGU6IHRoaXMuc2NvcGUoKSxcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLmNhcHR1cmUoYXJncyksXG4gICAgfTtcbiAgfVxuXG4gIGFic3RyYWN0IGNhcHR1cmUoYXJnczogbnVtYmVyLCBwYz86IG51bWJlcik6IFJlc3VtYWJsZVZNU3RhdGU8SW50ZXJuYWxWTT47XG5cbiAgYmVnaW5DYWNoZUdyb3VwKCkge1xuICAgIHRoaXNbU1RBQ0tTXS5jYWNoZS5wdXNoKHRoaXMudXBkYXRpbmcoKS50YWlsKCkpO1xuICB9XG5cbiAgY29tbWl0Q2FjaGVHcm91cCgpIHtcbiAgICBsZXQgRU5EID0gbmV3IExhYmVsT3Bjb2RlKCdFTkQnKTtcblxuICAgIGxldCBvcGNvZGVzID0gdGhpcy51cGRhdGluZygpO1xuICAgIGxldCBtYXJrZXIgPSB0aGlzW1NUQUNLU10uY2FjaGUucG9wKCk7XG4gICAgbGV0IGhlYWQgPSBtYXJrZXIgPyBvcGNvZGVzLm5leHROb2RlKG1hcmtlcikgOiBvcGNvZGVzLmhlYWQoKTtcbiAgICBsZXQgdGFpbCA9IG9wY29kZXMudGFpbCgpO1xuICAgIGxldCB0YWcgPSBjb21iaW5lU2xpY2UobmV3IExpc3RTbGljZShoZWFkLCB0YWlsKSk7XG5cbiAgICBsZXQgZ3VhcmQgPSBuZXcgSnVtcElmTm90TW9kaWZpZWRPcGNvZGUodGFnLCBFTkQpO1xuXG4gICAgb3Bjb2Rlcy5pbnNlcnRCZWZvcmUoZ3VhcmQsIGhlYWQpO1xuICAgIG9wY29kZXMuYXBwZW5kKG5ldyBEaWRNb2RpZnlPcGNvZGUoZ3VhcmQpKTtcbiAgICBvcGNvZGVzLmFwcGVuZChFTkQpO1xuICB9XG5cbiAgZW50ZXIoYXJnczogbnVtYmVyKSB7XG4gICAgbGV0IHVwZGF0aW5nID0gbmV3IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KCk7XG5cbiAgICBsZXQgc3RhdGUgPSB0aGlzLmNhcHR1cmUoYXJncyk7XG4gICAgbGV0IGJsb2NrID0gdGhpcy5lbGVtZW50cygpLnB1c2hVcGRhdGFibGVCbG9jaygpO1xuXG4gICAgbGV0IHRyeU9wY29kZSA9IG5ldyBUcnlPcGNvZGUoc3RhdGUsIHRoaXMucnVudGltZSwgYmxvY2ssIHVwZGF0aW5nKTtcblxuICAgIHRoaXMuZGlkRW50ZXIodHJ5T3Bjb2RlKTtcbiAgfVxuXG4gIGl0ZXJhdGUoXG4gICAgbWVtbzogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPixcbiAgICB2YWx1ZTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPlxuICApOiBUcnlPcGNvZGUge1xuICAgIGxldCBzdGFjayA9IHRoaXMuc3RhY2s7XG4gICAgc3RhY2sucHVzaCh2YWx1ZSk7XG4gICAgc3RhY2sucHVzaChtZW1vKTtcblxuICAgIGxldCBzdGF0ZSA9IHRoaXMuY2FwdHVyZSgyKTtcbiAgICBsZXQgYmxvY2sgPSB0aGlzLmVsZW1lbnRzKCkucHVzaFVwZGF0YWJsZUJsb2NrKCk7XG5cbiAgICAvLyBsZXQgaXAgPSB0aGlzLmlwO1xuICAgIC8vIHRoaXMuaXAgPSBlbmQgKyA0O1xuICAgIC8vIHRoaXMuZnJhbWVzLnB1c2goaXApO1xuXG4gICAgcmV0dXJuIG5ldyBUcnlPcGNvZGUoc3RhdGUsIHRoaXMucnVudGltZSwgYmxvY2ssIG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpKTtcbiAgfVxuXG4gIGVudGVySXRlbShrZXk6IHN0cmluZywgb3Bjb2RlOiBUcnlPcGNvZGUpIHtcbiAgICB0aGlzLmxpc3RCbG9jaygpLm1hcC5zZXQoa2V5LCBvcGNvZGUpO1xuICAgIHRoaXMuZGlkRW50ZXIob3Bjb2RlKTtcbiAgfVxuXG4gIGVudGVyTGlzdChvZmZzZXQ6IG51bWJlcikge1xuICAgIGxldCB1cGRhdGluZyA9IG5ldyBMaW5rZWRMaXN0PEJsb2NrT3Bjb2RlPigpO1xuXG4gICAgbGV0IGFkZHIgPSB0aGlzW0lOTkVSX1ZNXS50YXJnZXQob2Zmc2V0KTtcbiAgICBsZXQgc3RhdGUgPSB0aGlzLmNhcHR1cmUoMCwgYWRkcik7XG4gICAgbGV0IGxpc3QgPSB0aGlzLmVsZW1lbnRzKCkucHVzaEJsb2NrTGlzdCh1cGRhdGluZyk7XG4gICAgbGV0IGFydGlmYWN0cyA9IHRoaXMuc3RhY2sucGVlazxSZWZlcmVuY2VJdGVyYXRvcj4oKS5hcnRpZmFjdHM7XG5cbiAgICBsZXQgb3Bjb2RlID0gbmV3IExpc3RCbG9ja09wY29kZShzdGF0ZSwgdGhpcy5ydW50aW1lLCBsaXN0LCB1cGRhdGluZywgYXJ0aWZhY3RzKTtcblxuICAgIHRoaXNbU1RBQ0tTXS5saXN0LnB1c2gob3Bjb2RlKTtcblxuICAgIHRoaXMuZGlkRW50ZXIob3Bjb2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgZGlkRW50ZXIob3Bjb2RlOiBCbG9ja09wY29kZSkge1xuICAgIHRoaXMuYXNzb2NpYXRlRGVzdHJ1Y3RvcihkZXN0cnVjdG9yKG9wY29kZSkpO1xuICAgIHRoaXNbREVTVFJVQ1RPUl9TVEFDS10ucHVzaChvcGNvZGUpO1xuICAgIHRoaXMudXBkYXRlV2l0aChvcGNvZGUpO1xuICAgIHRoaXMucHVzaFVwZGF0aW5nKG9wY29kZS5jaGlsZHJlbik7XG4gIH1cblxuICBleGl0KCkge1xuICAgIHRoaXNbREVTVFJVQ1RPUl9TVEFDS10ucG9wKCk7XG4gICAgdGhpcy5lbGVtZW50cygpLnBvcEJsb2NrKCk7XG4gICAgdGhpcy5wb3BVcGRhdGluZygpO1xuXG4gICAgbGV0IHBhcmVudCA9IHRoaXMudXBkYXRpbmcoKS50YWlsKCkgYXMgQmxvY2tPcGNvZGU7XG5cbiAgICBwYXJlbnQuZGlkSW5pdGlhbGl6ZUNoaWxkcmVuKCk7XG4gIH1cblxuICBleGl0TGlzdCgpIHtcbiAgICB0aGlzLmV4aXQoKTtcbiAgICB0aGlzW1NUQUNLU10ubGlzdC5wb3AoKTtcbiAgfVxuXG4gIHB1c2hVcGRhdGluZyhsaXN0ID0gbmV3IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+KCkpOiB2b2lkIHtcbiAgICB0aGlzW1NUQUNLU10udXBkYXRpbmcucHVzaChsaXN0KTtcbiAgfVxuXG4gIHBvcFVwZGF0aW5nKCk6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+IHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXNbU1RBQ0tTXS51cGRhdGluZy5wb3AoKSwgXCJjYW4ndCBwb3AgYW4gZW1wdHkgc3RhY2tcIik7XG4gIH1cblxuICB1cGRhdGVXaXRoKG9wY29kZTogVXBkYXRpbmdPcGNvZGUpIHtcbiAgICB0aGlzLnVwZGF0aW5nKCkuYXBwZW5kKG9wY29kZSk7XG4gIH1cblxuICBsaXN0QmxvY2soKTogTGlzdEJsb2NrT3Bjb2RlIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXNbU1RBQ0tTXS5saXN0LmN1cnJlbnQsICdleHBlY3RlZCBhIGxpc3QgYmxvY2snKTtcbiAgfVxuXG4gIGFzc29jaWF0ZURlc3RydWN0b3IoY2hpbGQ6IERyb3ApOiB2b2lkIHtcbiAgICBpZiAoIWlzRHJvcChjaGlsZCkpIHJldHVybjtcbiAgICBsZXQgcGFyZW50ID0gZXhwZWN0KHRoaXNbREVTVFJVQ1RPUl9TVEFDS10uY3VycmVudCwgJ0V4cGVjdGVkIGRlc3RydWN0b3IgcGFyZW50Jyk7XG4gICAgYXNzb2NpYXRlRGVzdHJ1Y3RvcihwYXJlbnQsIGNoaWxkKTtcbiAgfVxuXG4gIGFzc29jaWF0ZURlc3Ryb3lhYmxlKGNoaWxkOiBTeW1ib2xEZXN0cm95YWJsZSB8IERlc3Ryb3lhYmxlKTogdm9pZCB7XG4gICAgdGhpcy5hc3NvY2lhdGVEZXN0cnVjdG9yKGRlc3RydWN0b3IoY2hpbGQpKTtcbiAgfVxuXG4gIHRyeVVwZGF0aW5nKCk6IE9wdGlvbjxMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPj4ge1xuICAgIHJldHVybiB0aGlzW1NUQUNLU10udXBkYXRpbmcuY3VycmVudDtcbiAgfVxuXG4gIHVwZGF0aW5nKCk6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+IHtcbiAgICByZXR1cm4gZXhwZWN0KFxuICAgICAgdGhpc1tTVEFDS1NdLnVwZGF0aW5nLmN1cnJlbnQsXG4gICAgICAnZXhwZWN0ZWQgdXBkYXRpbmcgb3Bjb2RlIG9uIHRoZSB1cGRhdGluZyBvcGNvZGUgc3RhY2snXG4gICAgKTtcbiAgfVxuXG4gIGVsZW1lbnRzKCk6IEVsZW1lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2s7XG4gIH1cblxuICBzY29wZSgpOiBTY29wZTxDPiB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzW1NUQUNLU10uc2NvcGUuY3VycmVudCwgJ2V4cGVjdGVkIHNjb3BlIG9uIHRoZSBzY29wZSBzdGFjaycpO1xuICB9XG5cbiAgZHluYW1pY1Njb3BlKCk6IER5bmFtaWNTY29wZSB7XG4gICAgcmV0dXJuIGV4cGVjdChcbiAgICAgIHRoaXNbU1RBQ0tTXS5keW5hbWljU2NvcGUuY3VycmVudCxcbiAgICAgICdleHBlY3RlZCBkeW5hbWljIHNjb3BlIG9uIHRoZSBkeW5hbWljIHNjb3BlIHN0YWNrJ1xuICAgICk7XG4gIH1cblxuICBwdXNoQ2hpbGRTY29wZSgpIHtcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaCh0aGlzLnNjb3BlKCkuY2hpbGQoKSk7XG4gIH1cblxuICBwdXNoRHluYW1pY1Njb3BlKCk6IER5bmFtaWNTY29wZSB7XG4gICAgbGV0IGNoaWxkID0gdGhpcy5keW5hbWljU2NvcGUoKS5jaGlsZCgpO1xuICAgIHRoaXNbU1RBQ0tTXS5keW5hbWljU2NvcGUucHVzaChjaGlsZCk7XG4gICAgcmV0dXJuIGNoaWxkO1xuICB9XG5cbiAgcHVzaFJvb3RTY29wZShzaXplOiBudW1iZXIpOiBQYXJ0aWFsU2NvcGU8Qz4ge1xuICAgIGxldCBzY29wZSA9IFNjb3BlSW1wbC5zaXplZDxDPihzaXplKTtcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaChzY29wZSk7XG4gICAgcmV0dXJuIHNjb3BlO1xuICB9XG5cbiAgcHVzaFNjb3BlKHNjb3BlOiBTY29wZTxDPikge1xuICAgIHRoaXNbU1RBQ0tTXS5zY29wZS5wdXNoKHNjb3BlKTtcbiAgfVxuXG4gIHBvcFNjb3BlKCkge1xuICAgIHRoaXNbU1RBQ0tTXS5zY29wZS5wb3AoKTtcbiAgfVxuXG4gIHBvcER5bmFtaWNTY29wZSgpIHtcbiAgICB0aGlzW1NUQUNLU10uZHluYW1pY1Njb3BlLnBvcCgpO1xuICB9XG5cbiAgLy8vIFNDT1BFIEhFTFBFUlNcblxuICBnZXRTZWxmKCk6IFBhdGhSZWZlcmVuY2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc2NvcGUoKS5nZXRTZWxmKCk7XG4gIH1cblxuICByZWZlcmVuY2VGb3JTeW1ib2woc3ltYm9sOiBudW1iZXIpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+IHtcbiAgICByZXR1cm4gdGhpcy5zY29wZSgpLmdldFN5bWJvbChzeW1ib2wpO1xuICB9XG5cbiAgLy8vIEVYRUNVVElPTlxuXG4gIGV4ZWN1dGUoaW5pdGlhbGl6ZT86ICh2bTogdGhpcykgPT4gdm9pZCk6IFJlbmRlclJlc3VsdCB7XG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjb25zb2xlLmxvZyhgRVhFQ1VUSU5HIEZST00gJHt0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYyl9YCk7XG4gICAgfVxuXG4gICAgaWYgKGluaXRpYWxpemUpIGluaXRpYWxpemUodGhpcyk7XG5cbiAgICBsZXQgcmVzdWx0OiBSaWNoSXRlcmF0b3JSZXN1bHQ8bnVsbCwgUmVuZGVyUmVzdWx0PjtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLm5leHQoKTtcbiAgICAgIGlmIChyZXN1bHQuZG9uZSkgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfVxuXG4gIG5leHQoKTogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD4ge1xuICAgIGxldCB7IGVudiwgZWxlbWVudFN0YWNrIH0gPSB0aGlzO1xuICAgIGxldCBvcGNvZGUgPSB0aGlzW0lOTkVSX1ZNXS5uZXh0U3RhdGVtZW50KCk7XG4gICAgbGV0IHJlc3VsdDogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD47XG4gICAgaWYgKG9wY29kZSAhPT0gbnVsbCkge1xuICAgICAgdGhpc1tJTk5FUl9WTV0uZXZhbHVhdGVPdXRlcihvcGNvZGUsIHRoaXMpO1xuICAgICAgcmVzdWx0ID0geyBkb25lOiBmYWxzZSwgdmFsdWU6IG51bGwgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVW5sb2FkIHRoZSBzdGFja1xuICAgICAgdGhpcy5zdGFjay5yZXNldCgpO1xuXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIGRvbmU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgUmVuZGVyUmVzdWx0SW1wbChcbiAgICAgICAgICBlbnYsXG4gICAgICAgICAgdGhpcy5wb3BVcGRhdGluZygpLFxuICAgICAgICAgIGVsZW1lbnRTdGFjay5wb3BCbG9jaygpLFxuICAgICAgICAgIHRoaXMuZGVzdHJ1Y3RvclxuICAgICAgICApLFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGJpbmREeW5hbWljU2NvcGUobmFtZXM6IG51bWJlcltdKSB7XG4gICAgbGV0IHNjb3BlID0gdGhpcy5keW5hbWljU2NvcGUoKTtcblxuICAgIGZvciAobGV0IGkgPSBuYW1lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IG5hbWUgPSB0aGlzW0NPTlNUQU5UU10uZ2V0U3RyaW5nKG5hbWVzW2ldKTtcbiAgICAgIHNjb3BlLnNldChuYW1lLCB0aGlzLnN0YWNrLnBvcDxWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+PigpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdm1TdGF0ZTxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4oXG4gIHBjOiBudW1iZXIsXG4gIHNjb3BlOiBTY29wZTxDPiA9IFNjb3BlSW1wbC5yb290PEM+KFVOREVGSU5FRF9SRUZFUkVOQ0UsIDApLFxuICBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZVxuKSB7XG4gIHJldHVybiB7XG4gICAgcGMsXG4gICAgc2NvcGUsXG4gICAgZHluYW1pY1Njb3BlLFxuICAgIHN0YWNrOiBbXSxcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNaW5pbWFsSW5pdE9wdGlvbnMge1xuICBoYW5kbGU6IG51bWJlcjtcbiAgdHJlZUJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyO1xuICBkeW5hbWljU2NvcGU6IER5bmFtaWNTY29wZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbml0T3B0aW9ucyBleHRlbmRzIE1pbmltYWxJbml0T3B0aW9ucyB7XG4gIHNlbGY6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG59XG5cbmV4cG9ydCBjbGFzcyBBb3RWTSBleHRlbmRzIFZNPG51bWJlcj4gaW1wbGVtZW50cyBJbnRlcm5hbFZNPG51bWJlcj4ge1xuICBzdGF0aWMgZW1wdHkoXG4gICAgcnVudGltZTogQW90UnVudGltZUNvbnRleHQsXG4gICAgeyBoYW5kbGUsIHRyZWVCdWlsZGVyLCBkeW5hbWljU2NvcGUgfTogTWluaW1hbEluaXRPcHRpb25zXG4gICk6IEludGVybmFsVk08bnVtYmVyPiB7XG4gICAgbGV0IHZtID0gaW5pdEFPVChcbiAgICAgIHJ1bnRpbWUsXG4gICAgICB2bVN0YXRlKFxuICAgICAgICBydW50aW1lLnByb2dyYW0uaGVhcC5nZXRhZGRyKGhhbmRsZSksXG4gICAgICAgIFNjb3BlSW1wbC5yb290PG51bWJlcj4oVU5ERUZJTkVEX1JFRkVSRU5DRSwgMCksXG4gICAgICAgIGR5bmFtaWNTY29wZVxuICAgICAgKSxcbiAgICAgIHRyZWVCdWlsZGVyXG4gICAgKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICBzdGF0aWMgaW5pdGlhbChcbiAgICBydW50aW1lOiBBb3RSdW50aW1lQ29udGV4dCxcbiAgICB7IGhhbmRsZSwgc2VsZiwgdHJlZUJ1aWxkZXIsIGR5bmFtaWNTY29wZSB9OiBJbml0T3B0aW9uc1xuICApIHtcbiAgICBsZXQgc2NvcGVTaXplID0gcnVudGltZS5wcm9ncmFtLmhlYXAuc2NvcGVzaXplb2YoaGFuZGxlKTtcbiAgICBsZXQgc2NvcGUgPSBTY29wZUltcGwucm9vdChzZWxmLCBzY29wZVNpemUpO1xuICAgIGxldCBwYyA9IGNoZWNrKHJ1bnRpbWUucHJvZ3JhbS5oZWFwLmdldGFkZHIoaGFuZGxlKSwgQ2hlY2tOdW1iZXIpO1xuICAgIGxldCBzdGF0ZSA9IHZtU3RhdGUocGMsIHNjb3BlLCBkeW5hbWljU2NvcGUpO1xuICAgIGxldCB2bSA9IGluaXRBT1QocnVudGltZSwgc3RhdGUsIHRyZWVCdWlsZGVyKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICBjYXB0dXJlKGFyZ3M6IG51bWJlciwgcGMgPSB0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYykpOiBSZXN1bWFibGVWTVN0YXRlPEFvdFZNPiB7XG4gICAgcmV0dXJuIG5ldyBSZXN1bWFibGVWTVN0YXRlSW1wbCh0aGlzLmNhcHR1cmVTdGF0ZShhcmdzLCBwYyksIGluaXRBT1QpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFZtSW5pdENhbGxiYWNrPFYgZXh0ZW5kcyBJbnRlcm5hbFZNID0gSW50ZXJuYWxWTT4gPSAoXG4gIHRoaXM6IHZvaWQsXG4gIHJ1bnRpbWU6IFYgZXh0ZW5kcyBKaXRWTSA/IEppdFJ1bnRpbWVDb250ZXh0IDogQW90UnVudGltZUNvbnRleHQsXG4gIHN0YXRlOiBWTVN0YXRlLFxuICBidWlsZGVyOiBFbGVtZW50QnVpbGRlclxuKSA9PiBWO1xuXG5leHBvcnQgdHlwZSBKaXRWbUluaXRDYWxsYmFjazxWIGV4dGVuZHMgSW50ZXJuYWxWTT4gPSAoXG4gIHRoaXM6IHZvaWQsXG4gIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICBzdGF0ZTogVk1TdGF0ZSxcbiAgYnVpbGRlcjogRWxlbWVudEJ1aWxkZXJcbikgPT4gVjtcblxuZnVuY3Rpb24gaW5pdEFPVChydW50aW1lOiBBb3RSdW50aW1lQ29udGV4dCwgc3RhdGU6IFZNU3RhdGUsIGJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyKTogQW90Vk0ge1xuICByZXR1cm4gbmV3IEFvdFZNKHJ1bnRpbWUsIHN0YXRlLCBidWlsZGVyKTtcbn1cblxuZnVuY3Rpb24gaW5pdEpJVChjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHQpOiBKaXRWbUluaXRDYWxsYmFjazxKaXRWTT4ge1xuICByZXR1cm4gKHJ1bnRpbWUsIHN0YXRlLCBidWlsZGVyKSA9PiBuZXcgSml0Vk0ocnVudGltZSwgc3RhdGUsIGJ1aWxkZXIsIGNvbnRleHQpO1xufVxuXG5leHBvcnQgY2xhc3MgSml0Vk0gZXh0ZW5kcyBWTTxDb21waWxhYmxlQmxvY2s+IGltcGxlbWVudHMgSW50ZXJuYWxKaXRWTSB7XG4gIHN0YXRpYyBpbml0aWFsKFxuICAgIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICAgIGNvbnRleHQ6IFN5bnRheENvbXBpbGF0aW9uQ29udGV4dCxcbiAgICB7IGhhbmRsZSwgc2VsZiwgZHluYW1pY1Njb3BlLCB0cmVlQnVpbGRlciB9OiBJbml0T3B0aW9uc1xuICApIHtcbiAgICBsZXQgc2NvcGVTaXplID0gcnVudGltZS5wcm9ncmFtLmhlYXAuc2NvcGVzaXplb2YoaGFuZGxlKTtcbiAgICBsZXQgc2NvcGUgPSBTY29wZUltcGwucm9vdChzZWxmLCBzY29wZVNpemUpO1xuICAgIGxldCBzdGF0ZSA9IHZtU3RhdGUocnVudGltZS5wcm9ncmFtLmhlYXAuZ2V0YWRkcihoYW5kbGUpLCBzY29wZSwgZHluYW1pY1Njb3BlKTtcbiAgICBsZXQgdm0gPSBpbml0SklUKGNvbnRleHQpKHJ1bnRpbWUsIHN0YXRlLCB0cmVlQnVpbGRlcik7XG4gICAgdm0ucHVzaFVwZGF0aW5nKCk7XG4gICAgcmV0dXJuIHZtO1xuICB9XG5cbiAgc3RhdGljIGVtcHR5KFxuICAgIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICAgIHsgaGFuZGxlLCB0cmVlQnVpbGRlciwgZHluYW1pY1Njb3BlIH06IE1pbmltYWxJbml0T3B0aW9ucyxcbiAgICBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHRcbiAgKSB7XG4gICAgbGV0IHZtID0gaW5pdEpJVChjb250ZXh0KShcbiAgICAgIHJ1bnRpbWUsXG4gICAgICB2bVN0YXRlKFxuICAgICAgICBydW50aW1lLnByb2dyYW0uaGVhcC5nZXRhZGRyKGhhbmRsZSksXG4gICAgICAgIFNjb3BlSW1wbC5yb290PENvbXBpbGFibGVCbG9jaz4oVU5ERUZJTkVEX1JFRkVSRU5DRSwgMCksXG4gICAgICAgIGR5bmFtaWNTY29wZVxuICAgICAgKSxcbiAgICAgIHRyZWVCdWlsZGVyXG4gICAgKTtcbiAgICB2bS5wdXNoVXBkYXRpbmcoKTtcbiAgICByZXR1cm4gdm07XG4gIH1cblxuICByZWFkb25seSBydW50aW1lITogSml0UnVudGltZUNvbnRleHQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcnVudGltZTogSml0UnVudGltZUNvbnRleHQsXG4gICAgc3RhdGU6IFZNU3RhdGUsXG4gICAgZWxlbWVudFN0YWNrOiBFbGVtZW50QnVpbGRlcixcbiAgICByZWFkb25seSBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHRcbiAgKSB7XG4gICAgc3VwZXIocnVudGltZSwgc3RhdGUsIGVsZW1lbnRTdGFjayk7XG4gIH1cblxuICBjYXB0dXJlKGFyZ3M6IG51bWJlciwgcGMgPSB0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYykpOiBSZXN1bWFibGVWTVN0YXRlPEppdFZNPiB7XG4gICAgcmV0dXJuIG5ldyBSZXN1bWFibGVWTVN0YXRlSW1wbCh0aGlzLmNhcHR1cmVTdGF0ZShhcmdzLCBwYyksIHRoaXMucmVzdW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdW1lOiBWbUluaXRDYWxsYmFjazxKaXRWTT4gPSBpbml0SklUKHRoaXMuY29udGV4dCk7XG5cbiAgY29tcGlsZShibG9jazogQ29tcGlsYWJsZVRlbXBsYXRlKTogbnVtYmVyIHtcbiAgICByZXR1cm4gYmxvY2suY29tcGlsZSh0aGlzLmNvbnRleHQpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9