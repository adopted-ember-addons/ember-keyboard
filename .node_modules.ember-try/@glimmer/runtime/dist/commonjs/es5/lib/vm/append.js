"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JitVM = exports.AotVM = undefined;

var _reference = require("@glimmer/reference");

var _util = require("@glimmer/util");

var _vm = require("@glimmer/vm");

var _vm2 = require("../compiled/opcodes/vm");

var _environment = require("../environment");

var _opcodes = require("../opcodes");

var _references = require("../references");

var _symbols = require("../symbols");

var _arguments = require("./arguments");

var _lowLevel = require("./low-level");

var _lowLevel2 = _interopRequireDefault(_lowLevel);

var _renderResult = require("./render-result");

var _renderResult2 = _interopRequireDefault(_renderResult);

var _stack = require("./stack");

var _stack2 = _interopRequireDefault(_stack);

var _update = require("./update");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
}

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

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

var _a, _b;

var Stacks = function Stacks() {
    _classCallCheck(this, Stacks);

    this.scope = new _util.Stack();
    this.dynamicScope = new _util.Stack();
    this.updating = new _util.Stack();
    this.cache = new _util.Stack();
    this.list = new _util.Stack();
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
        this[_b] = new _util.Stack();
        this.s0 = null;
        this.s1 = null;
        this.t0 = null;
        this.t1 = null;
        this.v0 = null;
        var evalStack = _stack2.default.restore(stack);
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
            debugBefore: function debugBefore(opcode) {
                return _opcodes.APPEND_OPCODES.debugBefore(_this, opcode);
            },
            debugAfter: function debugAfter(state) {
                _opcodes.APPEND_OPCODES.debugAfter(_this, state);
            }
        }, evalStack[_symbols.REGISTERS]);
        this.destructor = {};
        this[_symbols.DESTRUCTOR_STACK].push(this.destructor);
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
    };
    // Load a value into a register


    VM.prototype.loadValue = function loadValue(register, value) {
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
    };
    /**
     * Migrated to Inner
     */
    // Start a new frame and save $ra and $fp on the stack


    VM.prototype.pushFrame = function pushFrame() {
        this[_symbols.INNER_VM].pushFrame();
    };
    // Restore $ra, $sp and $fp


    VM.prototype.popFrame = function popFrame() {
        this[_symbols.INNER_VM].popFrame();
    };
    // Jump to an address in `program`


    VM.prototype.goto = function goto(offset) {
        this[_symbols.INNER_VM].goto(offset);
    };
    // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)


    VM.prototype.call = function call(handle) {
        this[_symbols.INNER_VM].call(handle);
    };
    // Put a specific `program` address in $ra


    VM.prototype.returnTo = function returnTo(offset) {
        this[_symbols.INNER_VM].returnTo(offset);
    };
    // Return to the `program` address stored in $ra


    VM.prototype.return = function _return() {
        this[_symbols.INNER_VM].return();
    };

    VM.prototype.captureState = function captureState(args) {
        var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[_symbols.INNER_VM].fetchRegister(_vm.$pc);

        return {
            pc: pc,
            dynamicScope: this.dynamicScope(),
            scope: this.scope(),
            stack: this.stack.capture(args)
        };
    };

    VM.prototype.beginCacheGroup = function beginCacheGroup() {
        this[_symbols.STACKS].cache.push(this.updating().tail());
    };

    VM.prototype.commitCacheGroup = function commitCacheGroup() {
        var END = new _vm2.LabelOpcode('END');
        var opcodes = this.updating();
        var marker = this[_symbols.STACKS].cache.pop();
        var head = marker ? opcodes.nextNode(marker) : opcodes.head();
        var tail = opcodes.tail();
        var tag = (0, _reference.combineSlice)(new _util.ListSlice(head, tail));
        var guard = new _vm2.JumpIfNotModifiedOpcode(tag, END);
        opcodes.insertBefore(guard, head);
        opcodes.append(new _vm2.DidModifyOpcode(guard));
        opcodes.append(END);
    };

    VM.prototype.enter = function enter(args) {
        var updating = new _util.LinkedList();
        var state = this.capture(args);
        var block = this.elements().pushUpdatableBlock();
        var tryOpcode = new _update.TryOpcode(state, this.runtime, block, updating);
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
        return new _update.TryOpcode(state, this.runtime, block, new _util.LinkedList());
    };

    VM.prototype.enterItem = function enterItem(key, opcode) {
        this.listBlock().map.set(key, opcode);
        this.didEnter(opcode);
    };

    VM.prototype.enterList = function enterList(offset) {
        var updating = new _util.LinkedList();
        var addr = this[_symbols.INNER_VM].target(offset);
        var state = this.capture(0, addr);
        var list = this.elements().pushBlockList(updating);
        var artifacts = this.stack.peek().artifacts;
        var opcode = new _update.ListBlockOpcode(state, this.runtime, list, updating, artifacts);
        this[_symbols.STACKS].list.push(opcode);
        this.didEnter(opcode);
    };

    VM.prototype.didEnter = function didEnter(opcode) {
        this.associateDestructor((0, _util.destructor)(opcode));
        this[_symbols.DESTRUCTOR_STACK].push(opcode);
        this.updateWith(opcode);
        this.pushUpdating(opcode.children);
    };

    VM.prototype.exit = function exit() {
        this[_symbols.DESTRUCTOR_STACK].pop();
        this.elements().popBlock();
        this.popUpdating();
        var parent = this.updating().tail();
        parent.didInitializeChildren();
    };

    VM.prototype.exitList = function exitList() {
        this.exit();
        this[_symbols.STACKS].list.pop();
    };

    VM.prototype.pushUpdating = function pushUpdating() {
        var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _util.LinkedList();

        this[_symbols.STACKS].updating.push(list);
    };

    VM.prototype.popUpdating = function popUpdating() {
        return this[_symbols.STACKS].updating.pop();
    };

    VM.prototype.updateWith = function updateWith(opcode) {
        this.updating().append(opcode);
    };

    VM.prototype.listBlock = function listBlock() {
        return this[_symbols.STACKS].list.current;
    };

    VM.prototype.associateDestructor = function associateDestructor(child) {
        if (!(0, _util.isDrop)(child)) return;
        var parent = this[_symbols.DESTRUCTOR_STACK].current;
        (0, _util.associateDestructor)(parent, child);
    };

    VM.prototype.associateDestroyable = function associateDestroyable(child) {
        this.associateDestructor((0, _util.destructor)(child));
    };

    VM.prototype.tryUpdating = function tryUpdating() {
        return this[_symbols.STACKS].updating.current;
    };

    VM.prototype.updating = function updating() {
        return this[_symbols.STACKS].updating.current;
    };

    VM.prototype.elements = function elements() {
        return this.elementStack;
    };

    VM.prototype.scope = function scope() {
        return this[_symbols.STACKS].scope.current;
    };

    VM.prototype.dynamicScope = function dynamicScope() {
        return this[_symbols.STACKS].dynamicScope.current;
    };

    VM.prototype.pushChildScope = function pushChildScope() {
        this[_symbols.STACKS].scope.push(this.scope().child());
    };

    VM.prototype.pushDynamicScope = function pushDynamicScope() {
        var child = this.dynamicScope().child();
        this[_symbols.STACKS].dynamicScope.push(child);
        return child;
    };

    VM.prototype.pushRootScope = function pushRootScope(size) {
        var scope = _environment.ScopeImpl.sized(size);
        this[_symbols.STACKS].scope.push(scope);
        return scope;
    };

    VM.prototype.pushScope = function pushScope(scope) {
        this[_symbols.STACKS].scope.push(scope);
    };

    VM.prototype.popScope = function popScope() {
        this[_symbols.STACKS].scope.pop();
    };

    VM.prototype.popDynamicScope = function popDynamicScope() {
        this[_symbols.STACKS].dynamicScope.pop();
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
            console.log('EXECUTING FROM ' + this[_symbols.INNER_VM].fetchRegister(_vm.$pc));
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

        var opcode = this[_symbols.INNER_VM].nextStatement();
        var result = void 0;
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
    };

    VM.prototype.bindDynamicScope = function bindDynamicScope(names) {
        var scope = this.dynamicScope();
        for (var i = names.length - 1; i >= 0; i--) {
            var name = this[_symbols.CONSTANTS].getString(names[i]);
            scope.set(name, this.stack.pop());
        }
    };

    _createClass(VM, [{
        key: 'stack',
        get: function get() {
            return this[_symbols.INNER_VM].stack;
        }
    }, {
        key: 'pc',
        get: function get() {
            return this[_symbols.INNER_VM].fetchRegister(_vm.$pc);
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

exports.default = VM;


_a = _symbols.STACKS, _b = _symbols.DESTRUCTOR_STACK;
function vmState(pc) {
    var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _environment.ScopeImpl.root(_references.UNDEFINED_REFERENCE, 0);
    var dynamicScope = arguments[2];

    return {
        pc: pc,
        scope: scope,
        dynamicScope: dynamicScope,
        stack: []
    };
}
var AotVM = exports.AotVM = function (_VM) {
    _inherits(AotVM, _VM);

    function AotVM() {
        _classCallCheck(this, AotVM);

        return _possibleConstructorReturn(this, _VM.apply(this, arguments));
    }

    AotVM.empty = function empty(runtime, _ref2) {
        var handle = _ref2.handle,
            treeBuilder = _ref2.treeBuilder,
            dynamicScope = _ref2.dynamicScope;

        var vm = initAOT(runtime, vmState(runtime.program.heap.getaddr(handle), _environment.ScopeImpl.root(_references.UNDEFINED_REFERENCE, 0), dynamicScope), treeBuilder);
        vm.pushUpdating();
        return vm;
    };

    AotVM.initial = function initial(runtime, _ref3) {
        var handle = _ref3.handle,
            self = _ref3.self,
            treeBuilder = _ref3.treeBuilder,
            dynamicScope = _ref3.dynamicScope;

        var scopeSize = runtime.program.heap.scopesizeof(handle);
        var scope = _environment.ScopeImpl.root(self, scopeSize);
        var pc = runtime.program.heap.getaddr(handle);
        var state = vmState(pc, scope, dynamicScope);
        var vm = initAOT(runtime, state, treeBuilder);
        vm.pushUpdating();
        return vm;
    };

    AotVM.prototype.capture = function capture(args) {
        var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[_symbols.INNER_VM].fetchRegister(_vm.$pc);

        return new _update.ResumableVMStateImpl(this.captureState(args, pc), initAOT);
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
var JitVM = exports.JitVM = function (_VM2) {
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
        var scope = _environment.ScopeImpl.root(self, scopeSize);
        var state = vmState(runtime.program.heap.getaddr(handle), scope, dynamicScope);
        var vm = initJIT(context)(runtime, state, treeBuilder);
        vm.pushUpdating();
        return vm;
    };

    JitVM.empty = function empty(runtime, _ref5, context) {
        var handle = _ref5.handle,
            treeBuilder = _ref5.treeBuilder,
            dynamicScope = _ref5.dynamicScope;

        var vm = initJIT(context)(runtime, vmState(runtime.program.heap.getaddr(handle), _environment.ScopeImpl.root(_references.UNDEFINED_REFERENCE, 0), dynamicScope), treeBuilder);
        vm.pushUpdating();
        return vm;
    };

    JitVM.prototype.capture = function capture(args) {
        var pc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this[_symbols.INNER_VM].fetchRegister(_vm.$pc);

        return new _update.ResumableVMStateImpl(this.captureState(args, pc), this.resume);
    };

    JitVM.prototype.compile = function compile(block) {
        return block.compile(this.context);
    };

    return JitVM;
}(VM);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL2FwcGVuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBMEJBOztBQU1BOztBQVdBOztBQWNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtRkEsU0FBQSxTQUFBLE1BQUEsR0FBQTtBQUFBLG9CQUFBLElBQUEsRUFBQSxNQUFBOztBQUNXLFNBQUEsS0FBQSxHQUFRLElBQVIsV0FBUSxFQUFSO0FBQ0EsU0FBQSxZQUFBLEdBQWUsSUFBZixXQUFlLEVBQWY7QUFDQSxTQUFBLFFBQUEsR0FBVyxJQUFYLFdBQVcsRUFBWDtBQUNBLFNBQUEsS0FBQSxHQUFRLElBQVIsV0FBUSxFQUFSO0FBQ0EsU0FBQSxJQUFBLEdBQU8sSUFBUCxXQUFPLEVBQVA7OztJQUdHLEs7QUEySFo7OztBQUlBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsWUFBQSxFQUcrQztBQUFBLFlBQUEsUUFBQSxJQUFBOztBQUFBLFlBRDdDLEtBQzZDLEtBRDdDLEVBQzZDO0FBQUEsWUFEN0MsUUFDNkMsS0FEN0MsS0FDNkM7QUFBQSxZQUQ3QyxlQUM2QyxLQUQ3QyxZQUM2QztBQUFBLFlBSC9DLFFBRytDLEtBSC9DLEtBRytDOztBQUFBLHdCQUFBLElBQUEsRUFBQSxFQUFBOztBQUZwQyxhQUFBLE9BQUEsR0FBQSxPQUFBO0FBRVEsYUFBQSxZQUFBLEdBQUEsWUFBQTtBQWpJRixhQUFBLEVBQUEsSUFBVyxJQUFYLE1BQVcsRUFBWDtBQUdBLGFBQUEsRUFBQSxJQUFxQixJQUFyQixXQUFxQixFQUFyQjtBQW1CVixhQUFBLEVBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLElB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LE1BRGpDLFdBQ2lDO0FBQUEsWUFIbkMsZUFHbUMsTUFIbkMsWUFHbUM7O0FBRWpDLFlBQUksS0FBSyxRQUFBLE9BQUEsRUFBQSxPQUFBLEVBRVAsUUFDRSxRQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQURGLE1BQ0UsQ0FERixFQUVFLHVCQUFBLElBQUEsQ0FBQSwrQkFBQSxFQUZGLENBRUUsQ0FGRixFQUZPLFlBRVAsQ0FGTyxFQUFULFdBQVMsQ0FBVDtBQVNBLFdBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQTtBQTdCSixLQUFBOztBQUFBLFVBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLE9BQUEsQ0FBQSxJQUFBLEVBMkM4RDtBQUFBLFlBQXRDLEtBQXNDLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FBakMsS0FBQSxpQkFBQSxFQUFBLGFBQUEsQ0FBM0IsT0FBMkIsQ0FBaUM7O0FBQzFELGVBQU8sSUFBQSw0QkFBQSxDQUF5QixLQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQXpCLEVBQXlCLENBQXpCLEVBQXNELEtBQTdELE1BQU8sQ0FBUDtBQTVDSixLQUFBOztBQUFBLFVBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLE9BQUEsQ0FBQSxLQUFBLEVBaURtQztBQUMvQixlQUFPLE1BQUEsT0FBQSxDQUFjLEtBQXJCLE9BQU8sQ0FBUDtBQWxESixLQUFBOztBQUFBLFdBQUEsS0FBQTtBQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21waWxhYmxlQmxvY2ssXG4gIENvbXBpbGFibGVUZW1wbGF0ZSxcbiAgRGVzdHJveWFibGUsXG4gIERyb3AsXG4gIER5bmFtaWNTY29wZSxcbiAgRW52aXJvbm1lbnQsXG4gIEppdE9yQW90QmxvY2ssXG4gIFBhcnRpYWxTY29wZSxcbiAgUmVuZGVyUmVzdWx0LFxuICBSaWNoSXRlcmF0b3JSZXN1bHQsXG4gIFJ1bnRpbWVDb250ZXh0LFxuICBSdW50aW1lQ29uc3RhbnRzLFxuICBSdW50aW1lSGVhcCxcbiAgUnVudGltZVByb2dyYW0sXG4gIFNjb3BlLFxuICBTeW1ib2xEZXN0cm95YWJsZSxcbiAgU3ludGF4Q29tcGlsYXRpb25Db250ZXh0LFxuICBWTSBhcyBQdWJsaWNWTSxcbiAgSml0UnVudGltZUNvbnRleHQsXG4gIEFvdFJ1bnRpbWVDb250ZXh0LFxuICBMaXZlQmxvY2ssXG4gIEVsZW1lbnRCdWlsZGVyLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuaW1wb3J0IHsgUnVudGltZU9wSW1wbCB9IGZyb20gJ0BnbGltbWVyL3Byb2dyYW0nO1xuaW1wb3J0IHtcbiAgY29tYmluZVNsaWNlLFxuICBQYXRoUmVmZXJlbmNlLFxuICBSZWZlcmVuY2VJdGVyYXRvcixcbiAgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7XG4gIGFzc29jaWF0ZURlc3RydWN0b3IsXG4gIGRlc3RydWN0b3IsXG4gIGV4cGVjdCxcbiAgaXNEcm9wLFxuICBMaW5rZWRMaXN0LFxuICBMaXN0U2xpY2UsXG4gIE9wdGlvbixcbiAgU3RhY2ssXG4gIGFzc2VydCxcbn0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQge1xuICAkZnAsXG4gICRwYyxcbiAgJHMwLFxuICAkczEsXG4gICRzcCxcbiAgJHQwLFxuICAkdDEsXG4gICR2MCxcbiAgaXNMb3dMZXZlbFJlZ2lzdGVyLFxuICBNYWNoaW5lUmVnaXN0ZXIsXG4gIFJlZ2lzdGVyLFxuICBTeXNjYWxsUmVnaXN0ZXIsXG59IGZyb20gJ0BnbGltbWVyL3ZtJztcbmltcG9ydCB7IERpZE1vZGlmeU9wY29kZSwgSnVtcElmTm90TW9kaWZpZWRPcGNvZGUsIExhYmVsT3Bjb2RlIH0gZnJvbSAnLi4vY29tcGlsZWQvb3Bjb2Rlcy92bSc7XG5pbXBvcnQgeyBTY29wZUltcGwgfSBmcm9tICcuLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUywgRGVidWdTdGF0ZSwgVXBkYXRpbmdPcGNvZGUgfSBmcm9tICcuLi9vcGNvZGVzJztcbmltcG9ydCB7IFVOREVGSU5FRF9SRUZFUkVOQ0UgfSBmcm9tICcuLi9yZWZlcmVuY2VzJztcbmltcG9ydCB7IEFSR1MsIENPTlNUQU5UUywgREVTVFJVQ1RPUl9TVEFDSywgSEVBUCwgSU5ORVJfVk0sIFJFR0lTVEVSUywgU1RBQ0tTIH0gZnJvbSAnLi4vc3ltYm9scyc7XG5pbXBvcnQgeyBWTUFyZ3VtZW50c0ltcGwgfSBmcm9tICcuL2FyZ3VtZW50cyc7XG5pbXBvcnQgTG93TGV2ZWxWTSBmcm9tICcuL2xvdy1sZXZlbCc7XG5pbXBvcnQgUmVuZGVyUmVzdWx0SW1wbCBmcm9tICcuL3JlbmRlci1yZXN1bHQnO1xuaW1wb3J0IEV2YWx1YXRpb25TdGFja0ltcGwsIHsgRXZhbHVhdGlvblN0YWNrIH0gZnJvbSAnLi9zdGFjayc7XG5pbXBvcnQge1xuICBCbG9ja09wY29kZSxcbiAgTGlzdEJsb2NrT3Bjb2RlLFxuICBSZXN1bWFibGVWTVN0YXRlLFxuICBSZXN1bWFibGVWTVN0YXRlSW1wbCxcbiAgVHJ5T3Bjb2RlLFxuICBWTVN0YXRlLFxufSBmcm9tICcuL3VwZGF0ZSc7XG5pbXBvcnQgeyBDaGVja051bWJlciwgY2hlY2sgfSBmcm9tICdAZ2xpbW1lci9kZWJ1Zyc7XG5cbi8qKlxuICogVGhpcyBpbnRlcmZhY2UgaXMgdXNlZCBieSBpbnRlcm5hbCBvcGNvZGVzLCBhbmQgaXMgbW9yZSBzdGFibGUgdGhhblxuICogdGhlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBBcHBlbmQgVk0gaXRzZWxmLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEludGVybmFsVk08QyBleHRlbmRzIEppdE9yQW90QmxvY2sgPSBKaXRPckFvdEJsb2NrPiB7XG4gIHJlYWRvbmx5IFtDT05TVEFOVFNdOiBSdW50aW1lQ29uc3RhbnRzO1xuICByZWFkb25seSBbQVJHU106IFZNQXJndW1lbnRzSW1wbDtcblxuICByZWFkb25seSBlbnY6IEVudmlyb25tZW50O1xuICByZWFkb25seSBzdGFjazogRXZhbHVhdGlvblN0YWNrO1xuICByZWFkb25seSBydW50aW1lOiBSdW50aW1lQ29udGV4dDtcblxuICBsb2FkVmFsdWUocmVnaXN0ZXI6IE1hY2hpbmVSZWdpc3RlciwgdmFsdWU6IG51bWJlcik6IHZvaWQ7XG4gIGxvYWRWYWx1ZShyZWdpc3RlcjogUmVnaXN0ZXIsIHZhbHVlOiB1bmtub3duKTogdm9pZDtcbiAgbG9hZFZhbHVlKHJlZ2lzdGVyOiBSZWdpc3RlciB8IE1hY2hpbmVSZWdpc3RlciwgdmFsdWU6IHVua25vd24pOiB2b2lkO1xuXG4gIGZldGNoVmFsdWUocmVnaXN0ZXI6IE1hY2hpbmVSZWdpc3Rlci5yYSB8IE1hY2hpbmVSZWdpc3Rlci5wYyk6IG51bWJlcjtcbiAgLy8gVE9ETzogU29tZXRoaW5nIGJldHRlciB0aGFuIGEgdHlwZSBhc3NlcnRpb24/XG4gIGZldGNoVmFsdWU8VD4ocmVnaXN0ZXI6IFJlZ2lzdGVyKTogVDtcbiAgZmV0Y2hWYWx1ZShyZWdpc3RlcjogUmVnaXN0ZXIpOiB1bmtub3duO1xuXG4gIGxvYWQocmVnaXN0ZXI6IFJlZ2lzdGVyKTogdm9pZDtcbiAgZmV0Y2gocmVnaXN0ZXI6IFJlZ2lzdGVyKTogdm9pZDtcblxuICBzY29wZSgpOiBTY29wZTxDPjtcbiAgZWxlbWVudHMoKTogRWxlbWVudEJ1aWxkZXI7XG5cbiAgZ2V0U2VsZigpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+O1xuXG4gIHVwZGF0ZVdpdGgob3Bjb2RlOiBVcGRhdGluZ09wY29kZSk6IHZvaWQ7XG5cbiAgYXNzb2NpYXRlRGVzdHJveWFibGUoZDogU3ltYm9sRGVzdHJveWFibGUgfCBEZXN0cm95YWJsZSk6IHZvaWQ7XG5cbiAgYmVnaW5DYWNoZUdyb3VwKCk6IHZvaWQ7XG4gIGNvbW1pdENhY2hlR3JvdXAoKTogdm9pZDtcblxuICAvLy8gSXRlcmF0aW9uIC8vL1xuXG4gIGVudGVyTGlzdChvZmZzZXQ6IG51bWJlcik6IHZvaWQ7XG4gIGV4aXRMaXN0KCk6IHZvaWQ7XG4gIGl0ZXJhdGUobWVtbzogUGF0aFJlZmVyZW5jZTx1bmtub3duPiwgaXRlbTogUGF0aFJlZmVyZW5jZTx1bmtub3duPik6IFRyeU9wY29kZTtcbiAgZW50ZXJJdGVtKGtleTogdW5rbm93biwgb3Bjb2RlOiBUcnlPcGNvZGUpOiB2b2lkO1xuXG4gIHB1c2hSb290U2NvcGUoc2l6ZTogbnVtYmVyKTogUGFydGlhbFNjb3BlPEM+O1xuICBwdXNoQ2hpbGRTY29wZSgpOiB2b2lkO1xuICBwb3BTY29wZSgpOiB2b2lkO1xuICBwdXNoU2NvcGUoc2NvcGU6IFNjb3BlPEM+KTogdm9pZDtcblxuICBkeW5hbWljU2NvcGUoKTogRHluYW1pY1Njb3BlO1xuICBiaW5kRHluYW1pY1Njb3BlKG5hbWVzOiBudW1iZXJbXSk6IHZvaWQ7XG4gIHB1c2hEeW5hbWljU2NvcGUoKTogdm9pZDtcbiAgcG9wRHluYW1pY1Njb3BlKCk6IHZvaWQ7XG5cbiAgZW50ZXIoYXJnczogbnVtYmVyKTogdm9pZDtcbiAgZXhpdCgpOiB2b2lkO1xuXG4gIGdvdG8ocGM6IG51bWJlcik6IHZvaWQ7XG4gIGNhbGwoaGFuZGxlOiBudW1iZXIpOiB2b2lkO1xuICBwdXNoRnJhbWUoKTogdm9pZDtcblxuICByZWZlcmVuY2VGb3JTeW1ib2woc3ltYm9sOiBudW1iZXIpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+O1xuXG4gIGV4ZWN1dGUoaW5pdGlhbGl6ZT86ICh2bTogdGhpcykgPT4gdm9pZCk6IFJlbmRlclJlc3VsdDtcbiAgcHVzaFVwZGF0aW5nKGxpc3Q/OiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPik6IHZvaWQ7XG4gIG5leHQoKTogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJuYWxKaXRWTSBleHRlbmRzIEludGVybmFsVk08Q29tcGlsYWJsZUJsb2NrPiB7XG4gIGNvbXBpbGUoYmxvY2s6IENvbXBpbGFibGVUZW1wbGF0ZSk6IG51bWJlcjtcbiAgcmVhZG9ubHkgcnVudGltZTogSml0UnVudGltZUNvbnRleHQ7XG4gIHJlYWRvbmx5IGNvbnRleHQ6IFN5bnRheENvbXBpbGF0aW9uQ29udGV4dDtcbn1cblxuY2xhc3MgU3RhY2tzPEMgZXh0ZW5kcyBKaXRPckFvdEJsb2NrPiB7XG4gIHJlYWRvbmx5IHNjb3BlID0gbmV3IFN0YWNrPFNjb3BlPEM+PigpO1xuICByZWFkb25seSBkeW5hbWljU2NvcGUgPSBuZXcgU3RhY2s8RHluYW1pY1Njb3BlPigpO1xuICByZWFkb25seSB1cGRhdGluZyA9IG5ldyBTdGFjazxMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPj4oKTtcbiAgcmVhZG9ubHkgY2FjaGUgPSBuZXcgU3RhY2s8T3B0aW9uPFVwZGF0aW5nT3Bjb2RlPj4oKTtcbiAgcmVhZG9ubHkgbGlzdCA9IG5ldyBTdGFjazxMaXN0QmxvY2tPcGNvZGU+KCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIFZNPEMgZXh0ZW5kcyBKaXRPckFvdEJsb2NrPiBpbXBsZW1lbnRzIFB1YmxpY1ZNLCBJbnRlcm5hbFZNPEM+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBbU1RBQ0tTXSA9IG5ldyBTdGFja3M8Qz4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBbSEVBUF06IFJ1bnRpbWVIZWFwO1xuICBwcml2YXRlIHJlYWRvbmx5IGRlc3RydWN0b3I6IG9iamVjdDtcbiAgcHJpdmF0ZSByZWFkb25seSBbREVTVFJVQ1RPUl9TVEFDS10gPSBuZXcgU3RhY2s8b2JqZWN0PigpO1xuICByZWFkb25seSBbQ09OU1RBTlRTXTogUnVudGltZUNvbnN0YW50cztcbiAgcmVhZG9ubHkgW0FSR1NdOiBWTUFyZ3VtZW50c0ltcGw7XG4gIHJlYWRvbmx5IFtJTk5FUl9WTV06IExvd0xldmVsVk07XG5cbiAgZ2V0IHN0YWNrKCk6IEV2YWx1YXRpb25TdGFjayB7XG4gICAgcmV0dXJuIHRoaXNbSU5ORVJfVk1dLnN0YWNrIGFzIEV2YWx1YXRpb25TdGFjaztcbiAgfVxuXG4gIGN1cnJlbnRCbG9jaygpOiBMaXZlQmxvY2sge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzKCkuYmxvY2soKTtcbiAgfVxuXG4gIC8qIFJlZ2lzdGVycyAqL1xuXG4gIGdldCBwYygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKCRwYyk7XG4gIH1cblxuICBwdWJsaWMgczA6IHVua25vd24gPSBudWxsO1xuICBwdWJsaWMgczE6IHVua25vd24gPSBudWxsO1xuICBwdWJsaWMgdDA6IHVua25vd24gPSBudWxsO1xuICBwdWJsaWMgdDE6IHVua25vd24gPSBudWxsO1xuICBwdWJsaWMgdjA6IHVua25vd24gPSBudWxsO1xuXG4gIC8vIEZldGNoIGEgdmFsdWUgZnJvbSBhIHJlZ2lzdGVyIG9udG8gdGhlIHN0YWNrXG4gIGZldGNoKHJlZ2lzdGVyOiBTeXNjYWxsUmVnaXN0ZXIpOiB2b2lkIHtcbiAgICB0aGlzLnN0YWNrLnB1c2godGhpcy5mZXRjaFZhbHVlKHJlZ2lzdGVyKSk7XG4gIH1cblxuICAvLyBMb2FkIGEgdmFsdWUgZnJvbSB0aGUgc3RhY2sgaW50byBhIHJlZ2lzdGVyXG4gIGxvYWQocmVnaXN0ZXI6IFN5c2NhbGxSZWdpc3Rlcikge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuc3RhY2sucG9wKCk7XG5cbiAgICB0aGlzLmxvYWRWYWx1ZShyZWdpc3RlciwgdmFsdWUpO1xuICB9XG5cbiAgLy8gRmV0Y2ggYSB2YWx1ZSBmcm9tIGEgcmVnaXN0ZXJcbiAgZmV0Y2hWYWx1ZShyZWdpc3RlcjogTWFjaGluZVJlZ2lzdGVyKTogbnVtYmVyO1xuICBmZXRjaFZhbHVlPFQ+KHJlZ2lzdGVyOiBSZWdpc3Rlcik6IFQ7XG4gIGZldGNoVmFsdWUocmVnaXN0ZXI6IFJlZ2lzdGVyIHwgTWFjaGluZVJlZ2lzdGVyKTogdW5rbm93biB7XG4gICAgaWYgKGlzTG93TGV2ZWxSZWdpc3RlcihyZWdpc3RlcikpIHtcbiAgICAgIHJldHVybiB0aGlzW0lOTkVSX1ZNXS5mZXRjaFJlZ2lzdGVyKHJlZ2lzdGVyKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHJlZ2lzdGVyKSB7XG4gICAgICBjYXNlICRzMDpcbiAgICAgICAgcmV0dXJuIHRoaXMuczA7XG4gICAgICBjYXNlICRzMTpcbiAgICAgICAgcmV0dXJuIHRoaXMuczE7XG4gICAgICBjYXNlICR0MDpcbiAgICAgICAgcmV0dXJuIHRoaXMudDA7XG4gICAgICBjYXNlICR0MTpcbiAgICAgICAgcmV0dXJuIHRoaXMudDE7XG4gICAgICBjYXNlICR2MDpcbiAgICAgICAgcmV0dXJuIHRoaXMudjA7XG4gICAgfVxuICB9XG5cbiAgLy8gTG9hZCBhIHZhbHVlIGludG8gYSByZWdpc3RlclxuXG4gIGxvYWRWYWx1ZTxUPihyZWdpc3RlcjogUmVnaXN0ZXIgfCBNYWNoaW5lUmVnaXN0ZXIsIHZhbHVlOiBUKTogdm9pZCB7XG4gICAgaWYgKGlzTG93TGV2ZWxSZWdpc3RlcihyZWdpc3RlcikpIHtcbiAgICAgIHRoaXNbSU5ORVJfVk1dLmxvYWRSZWdpc3RlcihyZWdpc3RlciwgKHZhbHVlIGFzIGFueSkgYXMgbnVtYmVyKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHJlZ2lzdGVyKSB7XG4gICAgICBjYXNlICRzMDpcbiAgICAgICAgdGhpcy5zMCA9IHZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJHMxOlxuICAgICAgICB0aGlzLnMxID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAkdDA6XG4gICAgICAgIHRoaXMudDAgPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICR0MTpcbiAgICAgICAgdGhpcy50MSA9IHZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJHYwOlxuICAgICAgICB0aGlzLnYwID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNaWdyYXRlZCB0byBJbm5lclxuICAgKi9cblxuICAvLyBTdGFydCBhIG5ldyBmcmFtZSBhbmQgc2F2ZSAkcmEgYW5kICRmcCBvbiB0aGUgc3RhY2tcbiAgcHVzaEZyYW1lKCkge1xuICAgIHRoaXNbSU5ORVJfVk1dLnB1c2hGcmFtZSgpO1xuICB9XG5cbiAgLy8gUmVzdG9yZSAkcmEsICRzcCBhbmQgJGZwXG4gIHBvcEZyYW1lKCkge1xuICAgIHRoaXNbSU5ORVJfVk1dLnBvcEZyYW1lKCk7XG4gIH1cblxuICAvLyBKdW1wIHRvIGFuIGFkZHJlc3MgaW4gYHByb2dyYW1gXG4gIGdvdG8ob2Zmc2V0OiBudW1iZXIpIHtcbiAgICB0aGlzW0lOTkVSX1ZNXS5nb3RvKG9mZnNldCk7XG4gIH1cblxuICAvLyBTYXZlICRwYyBpbnRvICRyYSwgdGhlbiBqdW1wIHRvIGEgbmV3IGFkZHJlc3MgaW4gYHByb2dyYW1gIChqYWwgaW4gTUlQUylcbiAgY2FsbChoYW5kbGU6IG51bWJlcikge1xuICAgIHRoaXNbSU5ORVJfVk1dLmNhbGwoaGFuZGxlKTtcbiAgfVxuXG4gIC8vIFB1dCBhIHNwZWNpZmljIGBwcm9ncmFtYCBhZGRyZXNzIGluICRyYVxuICByZXR1cm5UbyhvZmZzZXQ6IG51bWJlcikge1xuICAgIHRoaXNbSU5ORVJfVk1dLnJldHVyblRvKG9mZnNldCk7XG4gIH1cblxuICAvLyBSZXR1cm4gdG8gdGhlIGBwcm9ncmFtYCBhZGRyZXNzIHN0b3JlZCBpbiAkcmFcbiAgcmV0dXJuKCkge1xuICAgIHRoaXNbSU5ORVJfVk1dLnJldHVybigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZCBvZiBtaWdyYXRlZC5cbiAgICovXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgcnVudGltZTogUnVudGltZUNvbnRleHQsXG4gICAgeyBwYywgc2NvcGUsIGR5bmFtaWNTY29wZSwgc3RhY2sgfTogVk1TdGF0ZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGVsZW1lbnRTdGFjazogRWxlbWVudEJ1aWxkZXJcbiAgKSB7XG4gICAgbGV0IGV2YWxTdGFjayA9IEV2YWx1YXRpb25TdGFja0ltcGwucmVzdG9yZShzdGFjayk7XG5cbiAgICBhc3NlcnQodHlwZW9mIHBjID09PSAnbnVtYmVyJywgJ3BjIGlzIGEgbnVtYmVyJyk7XG5cbiAgICBldmFsU3RhY2tbUkVHSVNURVJTXVskcGNdID0gcGM7XG4gICAgZXZhbFN0YWNrW1JFR0lTVEVSU11bJHNwXSA9IHN0YWNrLmxlbmd0aCAtIDE7XG4gICAgZXZhbFN0YWNrW1JFR0lTVEVSU11bJGZwXSA9IC0xO1xuXG4gICAgdGhpc1tIRUFQXSA9IHRoaXMucHJvZ3JhbS5oZWFwO1xuICAgIHRoaXNbQ09OU1RBTlRTXSA9IHRoaXMucHJvZ3JhbS5jb25zdGFudHM7XG4gICAgdGhpcy5lbGVtZW50U3RhY2sgPSBlbGVtZW50U3RhY2s7XG4gICAgdGhpc1tTVEFDS1NdLnNjb3BlLnB1c2goc2NvcGUpO1xuICAgIHRoaXNbU1RBQ0tTXS5keW5hbWljU2NvcGUucHVzaChkeW5hbWljU2NvcGUpO1xuICAgIHRoaXNbQVJHU10gPSBuZXcgVk1Bcmd1bWVudHNJbXBsKCk7XG4gICAgdGhpc1tJTk5FUl9WTV0gPSBuZXcgTG93TGV2ZWxWTShcbiAgICAgIGV2YWxTdGFjayxcbiAgICAgIHRoaXNbSEVBUF0sXG4gICAgICBydW50aW1lLnByb2dyYW0sXG4gICAgICB7XG4gICAgICAgIGRlYnVnQmVmb3JlOiAob3Bjb2RlOiBSdW50aW1lT3BJbXBsKTogRGVidWdTdGF0ZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIEFQUEVORF9PUENPREVTLmRlYnVnQmVmb3JlKHRoaXMsIG9wY29kZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVidWdBZnRlcjogKHN0YXRlOiBEZWJ1Z1N0YXRlKTogdm9pZCA9PiB7XG4gICAgICAgICAgQVBQRU5EX09QQ09ERVMuZGVidWdBZnRlcih0aGlzLCBzdGF0ZSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgZXZhbFN0YWNrW1JFR0lTVEVSU11cbiAgICApO1xuXG4gICAgdGhpcy5kZXN0cnVjdG9yID0ge307XG4gICAgdGhpc1tERVNUUlVDVE9SX1NUQUNLXS5wdXNoKHRoaXMuZGVzdHJ1Y3Rvcik7XG4gIH1cblxuICBnZXQgcHJvZ3JhbSgpOiBSdW50aW1lUHJvZ3JhbSB7XG4gICAgcmV0dXJuIHRoaXMucnVudGltZS5wcm9ncmFtO1xuICB9XG5cbiAgZ2V0IGVudigpOiBFbnZpcm9ubWVudCB7XG4gICAgcmV0dXJuIHRoaXMucnVudGltZS5lbnY7XG4gIH1cblxuICBjYXB0dXJlU3RhdGUoYXJnczogbnVtYmVyLCBwYyA9IHRoaXNbSU5ORVJfVk1dLmZldGNoUmVnaXN0ZXIoJHBjKSk6IFZNU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICBwYyxcbiAgICAgIGR5bmFtaWNTY29wZTogdGhpcy5keW5hbWljU2NvcGUoKSxcbiAgICAgIHNjb3BlOiB0aGlzLnNjb3BlKCksXG4gICAgICBzdGFjazogdGhpcy5zdGFjay5jYXB0dXJlKGFyZ3MpLFxuICAgIH07XG4gIH1cblxuICBhYnN0cmFjdCBjYXB0dXJlKGFyZ3M6IG51bWJlciwgcGM/OiBudW1iZXIpOiBSZXN1bWFibGVWTVN0YXRlPEludGVybmFsVk0+O1xuXG4gIGJlZ2luQ2FjaGVHcm91cCgpIHtcbiAgICB0aGlzW1NUQUNLU10uY2FjaGUucHVzaCh0aGlzLnVwZGF0aW5nKCkudGFpbCgpKTtcbiAgfVxuXG4gIGNvbW1pdENhY2hlR3JvdXAoKSB7XG4gICAgbGV0IEVORCA9IG5ldyBMYWJlbE9wY29kZSgnRU5EJyk7XG5cbiAgICBsZXQgb3Bjb2RlcyA9IHRoaXMudXBkYXRpbmcoKTtcbiAgICBsZXQgbWFya2VyID0gdGhpc1tTVEFDS1NdLmNhY2hlLnBvcCgpO1xuICAgIGxldCBoZWFkID0gbWFya2VyID8gb3Bjb2Rlcy5uZXh0Tm9kZShtYXJrZXIpIDogb3Bjb2Rlcy5oZWFkKCk7XG4gICAgbGV0IHRhaWwgPSBvcGNvZGVzLnRhaWwoKTtcbiAgICBsZXQgdGFnID0gY29tYmluZVNsaWNlKG5ldyBMaXN0U2xpY2UoaGVhZCwgdGFpbCkpO1xuXG4gICAgbGV0IGd1YXJkID0gbmV3IEp1bXBJZk5vdE1vZGlmaWVkT3Bjb2RlKHRhZywgRU5EKTtcblxuICAgIG9wY29kZXMuaW5zZXJ0QmVmb3JlKGd1YXJkLCBoZWFkKTtcbiAgICBvcGNvZGVzLmFwcGVuZChuZXcgRGlkTW9kaWZ5T3Bjb2RlKGd1YXJkKSk7XG4gICAgb3Bjb2Rlcy5hcHBlbmQoRU5EKTtcbiAgfVxuXG4gIGVudGVyKGFyZ3M6IG51bWJlcikge1xuICAgIGxldCB1cGRhdGluZyA9IG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpO1xuXG4gICAgbGV0IHN0YXRlID0gdGhpcy5jYXB0dXJlKGFyZ3MpO1xuICAgIGxldCBibG9jayA9IHRoaXMuZWxlbWVudHMoKS5wdXNoVXBkYXRhYmxlQmxvY2soKTtcblxuICAgIGxldCB0cnlPcGNvZGUgPSBuZXcgVHJ5T3Bjb2RlKHN0YXRlLCB0aGlzLnJ1bnRpbWUsIGJsb2NrLCB1cGRhdGluZyk7XG5cbiAgICB0aGlzLmRpZEVudGVyKHRyeU9wY29kZSk7XG4gIH1cblxuICBpdGVyYXRlKFxuICAgIG1lbW86IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgdmFsdWU6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj5cbiAgKTogVHJ5T3Bjb2RlIHtcbiAgICBsZXQgc3RhY2sgPSB0aGlzLnN0YWNrO1xuICAgIHN0YWNrLnB1c2godmFsdWUpO1xuICAgIHN0YWNrLnB1c2gobWVtbyk7XG5cbiAgICBsZXQgc3RhdGUgPSB0aGlzLmNhcHR1cmUoMik7XG4gICAgbGV0IGJsb2NrID0gdGhpcy5lbGVtZW50cygpLnB1c2hVcGRhdGFibGVCbG9jaygpO1xuXG4gICAgLy8gbGV0IGlwID0gdGhpcy5pcDtcbiAgICAvLyB0aGlzLmlwID0gZW5kICsgNDtcbiAgICAvLyB0aGlzLmZyYW1lcy5wdXNoKGlwKTtcblxuICAgIHJldHVybiBuZXcgVHJ5T3Bjb2RlKHN0YXRlLCB0aGlzLnJ1bnRpbWUsIGJsb2NrLCBuZXcgTGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT4oKSk7XG4gIH1cblxuICBlbnRlckl0ZW0oa2V5OiBzdHJpbmcsIG9wY29kZTogVHJ5T3Bjb2RlKSB7XG4gICAgdGhpcy5saXN0QmxvY2soKS5tYXAuc2V0KGtleSwgb3Bjb2RlKTtcbiAgICB0aGlzLmRpZEVudGVyKG9wY29kZSk7XG4gIH1cblxuICBlbnRlckxpc3Qob2Zmc2V0OiBudW1iZXIpIHtcbiAgICBsZXQgdXBkYXRpbmcgPSBuZXcgTGlua2VkTGlzdDxCbG9ja09wY29kZT4oKTtcblxuICAgIGxldCBhZGRyID0gdGhpc1tJTk5FUl9WTV0udGFyZ2V0KG9mZnNldCk7XG4gICAgbGV0IHN0YXRlID0gdGhpcy5jYXB0dXJlKDAsIGFkZHIpO1xuICAgIGxldCBsaXN0ID0gdGhpcy5lbGVtZW50cygpLnB1c2hCbG9ja0xpc3QodXBkYXRpbmcpO1xuICAgIGxldCBhcnRpZmFjdHMgPSB0aGlzLnN0YWNrLnBlZWs8UmVmZXJlbmNlSXRlcmF0b3I+KCkuYXJ0aWZhY3RzO1xuXG4gICAgbGV0IG9wY29kZSA9IG5ldyBMaXN0QmxvY2tPcGNvZGUoc3RhdGUsIHRoaXMucnVudGltZSwgbGlzdCwgdXBkYXRpbmcsIGFydGlmYWN0cyk7XG5cbiAgICB0aGlzW1NUQUNLU10ubGlzdC5wdXNoKG9wY29kZSk7XG5cbiAgICB0aGlzLmRpZEVudGVyKG9wY29kZSk7XG4gIH1cblxuICBwcml2YXRlIGRpZEVudGVyKG9wY29kZTogQmxvY2tPcGNvZGUpIHtcbiAgICB0aGlzLmFzc29jaWF0ZURlc3RydWN0b3IoZGVzdHJ1Y3RvcihvcGNvZGUpKTtcbiAgICB0aGlzW0RFU1RSVUNUT1JfU1RBQ0tdLnB1c2gob3Bjb2RlKTtcbiAgICB0aGlzLnVwZGF0ZVdpdGgob3Bjb2RlKTtcbiAgICB0aGlzLnB1c2hVcGRhdGluZyhvcGNvZGUuY2hpbGRyZW4pO1xuICB9XG5cbiAgZXhpdCgpIHtcbiAgICB0aGlzW0RFU1RSVUNUT1JfU1RBQ0tdLnBvcCgpO1xuICAgIHRoaXMuZWxlbWVudHMoKS5wb3BCbG9jaygpO1xuICAgIHRoaXMucG9wVXBkYXRpbmcoKTtcblxuICAgIGxldCBwYXJlbnQgPSB0aGlzLnVwZGF0aW5nKCkudGFpbCgpIGFzIEJsb2NrT3Bjb2RlO1xuXG4gICAgcGFyZW50LmRpZEluaXRpYWxpemVDaGlsZHJlbigpO1xuICB9XG5cbiAgZXhpdExpc3QoKSB7XG4gICAgdGhpcy5leGl0KCk7XG4gICAgdGhpc1tTVEFDS1NdLmxpc3QucG9wKCk7XG4gIH1cblxuICBwdXNoVXBkYXRpbmcobGlzdCA9IG5ldyBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPigpKTogdm9pZCB7XG4gICAgdGhpc1tTVEFDS1NdLnVwZGF0aW5nLnB1c2gobGlzdCk7XG4gIH1cblxuICBwb3BVcGRhdGluZygpOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPiB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzW1NUQUNLU10udXBkYXRpbmcucG9wKCksIFwiY2FuJ3QgcG9wIGFuIGVtcHR5IHN0YWNrXCIpO1xuICB9XG5cbiAgdXBkYXRlV2l0aChvcGNvZGU6IFVwZGF0aW5nT3Bjb2RlKSB7XG4gICAgdGhpcy51cGRhdGluZygpLmFwcGVuZChvcGNvZGUpO1xuICB9XG5cbiAgbGlzdEJsb2NrKCk6IExpc3RCbG9ja09wY29kZSB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzW1NUQUNLU10ubGlzdC5jdXJyZW50LCAnZXhwZWN0ZWQgYSBsaXN0IGJsb2NrJyk7XG4gIH1cblxuICBhc3NvY2lhdGVEZXN0cnVjdG9yKGNoaWxkOiBEcm9wKTogdm9pZCB7XG4gICAgaWYgKCFpc0Ryb3AoY2hpbGQpKSByZXR1cm47XG4gICAgbGV0IHBhcmVudCA9IGV4cGVjdCh0aGlzW0RFU1RSVUNUT1JfU1RBQ0tdLmN1cnJlbnQsICdFeHBlY3RlZCBkZXN0cnVjdG9yIHBhcmVudCcpO1xuICAgIGFzc29jaWF0ZURlc3RydWN0b3IocGFyZW50LCBjaGlsZCk7XG4gIH1cblxuICBhc3NvY2lhdGVEZXN0cm95YWJsZShjaGlsZDogU3ltYm9sRGVzdHJveWFibGUgfCBEZXN0cm95YWJsZSk6IHZvaWQge1xuICAgIHRoaXMuYXNzb2NpYXRlRGVzdHJ1Y3RvcihkZXN0cnVjdG9yKGNoaWxkKSk7XG4gIH1cblxuICB0cnlVcGRhdGluZygpOiBPcHRpb248TGlua2VkTGlzdDxVcGRhdGluZ09wY29kZT4+IHtcbiAgICByZXR1cm4gdGhpc1tTVEFDS1NdLnVwZGF0aW5nLmN1cnJlbnQ7XG4gIH1cblxuICB1cGRhdGluZygpOiBMaW5rZWRMaXN0PFVwZGF0aW5nT3Bjb2RlPiB7XG4gICAgcmV0dXJuIGV4cGVjdChcbiAgICAgIHRoaXNbU1RBQ0tTXS51cGRhdGluZy5jdXJyZW50LFxuICAgICAgJ2V4cGVjdGVkIHVwZGF0aW5nIG9wY29kZSBvbiB0aGUgdXBkYXRpbmcgb3Bjb2RlIHN0YWNrJ1xuICAgICk7XG4gIH1cblxuICBlbGVtZW50cygpOiBFbGVtZW50QnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFN0YWNrO1xuICB9XG5cbiAgc2NvcGUoKTogU2NvcGU8Qz4ge1xuICAgIHJldHVybiBleHBlY3QodGhpc1tTVEFDS1NdLnNjb3BlLmN1cnJlbnQsICdleHBlY3RlZCBzY29wZSBvbiB0aGUgc2NvcGUgc3RhY2snKTtcbiAgfVxuXG4gIGR5bmFtaWNTY29wZSgpOiBEeW5hbWljU2NvcGUge1xuICAgIHJldHVybiBleHBlY3QoXG4gICAgICB0aGlzW1NUQUNLU10uZHluYW1pY1Njb3BlLmN1cnJlbnQsXG4gICAgICAnZXhwZWN0ZWQgZHluYW1pYyBzY29wZSBvbiB0aGUgZHluYW1pYyBzY29wZSBzdGFjaydcbiAgICApO1xuICB9XG5cbiAgcHVzaENoaWxkU2NvcGUoKSB7XG4gICAgdGhpc1tTVEFDS1NdLnNjb3BlLnB1c2godGhpcy5zY29wZSgpLmNoaWxkKCkpO1xuICB9XG5cbiAgcHVzaER5bmFtaWNTY29wZSgpOiBEeW5hbWljU2NvcGUge1xuICAgIGxldCBjaGlsZCA9IHRoaXMuZHluYW1pY1Njb3BlKCkuY2hpbGQoKTtcbiAgICB0aGlzW1NUQUNLU10uZHluYW1pY1Njb3BlLnB1c2goY2hpbGQpO1xuICAgIHJldHVybiBjaGlsZDtcbiAgfVxuXG4gIHB1c2hSb290U2NvcGUoc2l6ZTogbnVtYmVyKTogUGFydGlhbFNjb3BlPEM+IHtcbiAgICBsZXQgc2NvcGUgPSBTY29wZUltcGwuc2l6ZWQ8Qz4oc2l6ZSk7XG4gICAgdGhpc1tTVEFDS1NdLnNjb3BlLnB1c2goc2NvcGUpO1xuICAgIHJldHVybiBzY29wZTtcbiAgfVxuXG4gIHB1c2hTY29wZShzY29wZTogU2NvcGU8Qz4pIHtcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucHVzaChzY29wZSk7XG4gIH1cblxuICBwb3BTY29wZSgpIHtcbiAgICB0aGlzW1NUQUNLU10uc2NvcGUucG9wKCk7XG4gIH1cblxuICBwb3BEeW5hbWljU2NvcGUoKSB7XG4gICAgdGhpc1tTVEFDS1NdLmR5bmFtaWNTY29wZS5wb3AoKTtcbiAgfVxuXG4gIC8vLyBTQ09QRSBIRUxQRVJTXG5cbiAgZ2V0U2VsZigpOiBQYXRoUmVmZXJlbmNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLnNjb3BlKCkuZ2V0U2VsZigpO1xuICB9XG5cbiAgcmVmZXJlbmNlRm9yU3ltYm9sKHN5bWJvbDogbnVtYmVyKTogUGF0aFJlZmVyZW5jZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIHRoaXMuc2NvcGUoKS5nZXRTeW1ib2woc3ltYm9sKTtcbiAgfVxuXG4gIC8vLyBFWEVDVVRJT05cblxuICBleGVjdXRlKGluaXRpYWxpemU/OiAodm06IHRoaXMpID0+IHZvaWQpOiBSZW5kZXJSZXN1bHQge1xuICAgIGlmIChERUJVRykge1xuICAgICAgY29uc29sZS5sb2coYEVYRUNVVElORyBGUk9NICR7dGhpc1tJTk5FUl9WTV0uZmV0Y2hSZWdpc3RlcigkcGMpfWApO1xuICAgIH1cblxuICAgIGlmIChpbml0aWFsaXplKSBpbml0aWFsaXplKHRoaXMpO1xuXG4gICAgbGV0IHJlc3VsdDogUmljaEl0ZXJhdG9yUmVzdWx0PG51bGwsIFJlbmRlclJlc3VsdD47XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5uZXh0KCk7XG4gICAgICBpZiAocmVzdWx0LmRvbmUpIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQudmFsdWU7XG4gIH1cblxuICBuZXh0KCk6IFJpY2hJdGVyYXRvclJlc3VsdDxudWxsLCBSZW5kZXJSZXN1bHQ+IHtcbiAgICBsZXQgeyBlbnYsIGVsZW1lbnRTdGFjayB9ID0gdGhpcztcbiAgICBsZXQgb3Bjb2RlID0gdGhpc1tJTk5FUl9WTV0ubmV4dFN0YXRlbWVudCgpO1xuICAgIGxldCByZXN1bHQ6IFJpY2hJdGVyYXRvclJlc3VsdDxudWxsLCBSZW5kZXJSZXN1bHQ+O1xuICAgIGlmIChvcGNvZGUgIT09IG51bGwpIHtcbiAgICAgIHRoaXNbSU5ORVJfVk1dLmV2YWx1YXRlT3V0ZXIob3Bjb2RlLCB0aGlzKTtcbiAgICAgIHJlc3VsdCA9IHsgZG9uZTogZmFsc2UsIHZhbHVlOiBudWxsIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVubG9hZCB0aGUgc3RhY2tcbiAgICAgIHRoaXMuc3RhY2sucmVzZXQoKTtcblxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBkb25lOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbmV3IFJlbmRlclJlc3VsdEltcGwoXG4gICAgICAgICAgZW52LFxuICAgICAgICAgIHRoaXMucG9wVXBkYXRpbmcoKSxcbiAgICAgICAgICBlbGVtZW50U3RhY2sucG9wQmxvY2soKSxcbiAgICAgICAgICB0aGlzLmRlc3RydWN0b3JcbiAgICAgICAgKSxcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBiaW5kRHluYW1pY1Njb3BlKG5hbWVzOiBudW1iZXJbXSkge1xuICAgIGxldCBzY29wZSA9IHRoaXMuZHluYW1pY1Njb3BlKCk7XG5cbiAgICBmb3IgKGxldCBpID0gbmFtZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGxldCBuYW1lID0gdGhpc1tDT05TVEFOVFNdLmdldFN0cmluZyhuYW1lc1tpXSk7XG4gICAgICBzY29wZS5zZXQobmFtZSwgdGhpcy5zdGFjay5wb3A8VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4oKSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHZtU3RhdGU8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KFxuICBwYzogbnVtYmVyLFxuICBzY29wZTogU2NvcGU8Qz4gPSBTY29wZUltcGwucm9vdDxDPihVTkRFRklORURfUkVGRVJFTkNFLCAwKSxcbiAgZHluYW1pY1Njb3BlOiBEeW5hbWljU2NvcGVcbikge1xuICByZXR1cm4ge1xuICAgIHBjLFxuICAgIHNjb3BlLFxuICAgIGR5bmFtaWNTY29wZSxcbiAgICBzdGFjazogW10sXG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWluaW1hbEluaXRPcHRpb25zIHtcbiAgaGFuZGxlOiBudW1iZXI7XG4gIHRyZWVCdWlsZGVyOiBFbGVtZW50QnVpbGRlcjtcbiAgZHluYW1pY1Njb3BlOiBEeW5hbWljU2NvcGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5pdE9wdGlvbnMgZXh0ZW5kcyBNaW5pbWFsSW5pdE9wdGlvbnMge1xuICBzZWxmOiBQYXRoUmVmZXJlbmNlPHVua25vd24+O1xufVxuXG5leHBvcnQgY2xhc3MgQW90Vk0gZXh0ZW5kcyBWTTxudW1iZXI+IGltcGxlbWVudHMgSW50ZXJuYWxWTTxudW1iZXI+IHtcbiAgc3RhdGljIGVtcHR5KFxuICAgIHJ1bnRpbWU6IEFvdFJ1bnRpbWVDb250ZXh0LFxuICAgIHsgaGFuZGxlLCB0cmVlQnVpbGRlciwgZHluYW1pY1Njb3BlIH06IE1pbmltYWxJbml0T3B0aW9uc1xuICApOiBJbnRlcm5hbFZNPG51bWJlcj4ge1xuICAgIGxldCB2bSA9IGluaXRBT1QoXG4gICAgICBydW50aW1lLFxuICAgICAgdm1TdGF0ZShcbiAgICAgICAgcnVudGltZS5wcm9ncmFtLmhlYXAuZ2V0YWRkcihoYW5kbGUpLFxuICAgICAgICBTY29wZUltcGwucm9vdDxudW1iZXI+KFVOREVGSU5FRF9SRUZFUkVOQ0UsIDApLFxuICAgICAgICBkeW5hbWljU2NvcGVcbiAgICAgICksXG4gICAgICB0cmVlQnVpbGRlclxuICAgICk7XG4gICAgdm0ucHVzaFVwZGF0aW5nKCk7XG4gICAgcmV0dXJuIHZtO1xuICB9XG5cbiAgc3RhdGljIGluaXRpYWwoXG4gICAgcnVudGltZTogQW90UnVudGltZUNvbnRleHQsXG4gICAgeyBoYW5kbGUsIHNlbGYsIHRyZWVCdWlsZGVyLCBkeW5hbWljU2NvcGUgfTogSW5pdE9wdGlvbnNcbiAgKSB7XG4gICAgbGV0IHNjb3BlU2l6ZSA9IHJ1bnRpbWUucHJvZ3JhbS5oZWFwLnNjb3Blc2l6ZW9mKGhhbmRsZSk7XG4gICAgbGV0IHNjb3BlID0gU2NvcGVJbXBsLnJvb3Qoc2VsZiwgc2NvcGVTaXplKTtcbiAgICBsZXQgcGMgPSBjaGVjayhydW50aW1lLnByb2dyYW0uaGVhcC5nZXRhZGRyKGhhbmRsZSksIENoZWNrTnVtYmVyKTtcbiAgICBsZXQgc3RhdGUgPSB2bVN0YXRlKHBjLCBzY29wZSwgZHluYW1pY1Njb3BlKTtcbiAgICBsZXQgdm0gPSBpbml0QU9UKHJ1bnRpbWUsIHN0YXRlLCB0cmVlQnVpbGRlcik7XG4gICAgdm0ucHVzaFVwZGF0aW5nKCk7XG4gICAgcmV0dXJuIHZtO1xuICB9XG5cbiAgY2FwdHVyZShhcmdzOiBudW1iZXIsIHBjID0gdGhpc1tJTk5FUl9WTV0uZmV0Y2hSZWdpc3RlcigkcGMpKTogUmVzdW1hYmxlVk1TdGF0ZTxBb3RWTT4ge1xuICAgIHJldHVybiBuZXcgUmVzdW1hYmxlVk1TdGF0ZUltcGwodGhpcy5jYXB0dXJlU3RhdGUoYXJncywgcGMpLCBpbml0QU9UKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBWbUluaXRDYWxsYmFjazxWIGV4dGVuZHMgSW50ZXJuYWxWTSA9IEludGVybmFsVk0+ID0gKFxuICB0aGlzOiB2b2lkLFxuICBydW50aW1lOiBWIGV4dGVuZHMgSml0Vk0gPyBKaXRSdW50aW1lQ29udGV4dCA6IEFvdFJ1bnRpbWVDb250ZXh0LFxuICBzdGF0ZTogVk1TdGF0ZSxcbiAgYnVpbGRlcjogRWxlbWVudEJ1aWxkZXJcbikgPT4gVjtcblxuZXhwb3J0IHR5cGUgSml0Vm1Jbml0Q2FsbGJhY2s8ViBleHRlbmRzIEludGVybmFsVk0+ID0gKFxuICB0aGlzOiB2b2lkLFxuICBydW50aW1lOiBKaXRSdW50aW1lQ29udGV4dCxcbiAgc3RhdGU6IFZNU3RhdGUsXG4gIGJ1aWxkZXI6IEVsZW1lbnRCdWlsZGVyXG4pID0+IFY7XG5cbmZ1bmN0aW9uIGluaXRBT1QocnVudGltZTogQW90UnVudGltZUNvbnRleHQsIHN0YXRlOiBWTVN0YXRlLCBidWlsZGVyOiBFbGVtZW50QnVpbGRlcik6IEFvdFZNIHtcbiAgcmV0dXJuIG5ldyBBb3RWTShydW50aW1lLCBzdGF0ZSwgYnVpbGRlcik7XG59XG5cbmZ1bmN0aW9uIGluaXRKSVQoY29udGV4dDogU3ludGF4Q29tcGlsYXRpb25Db250ZXh0KTogSml0Vm1Jbml0Q2FsbGJhY2s8Sml0Vk0+IHtcbiAgcmV0dXJuIChydW50aW1lLCBzdGF0ZSwgYnVpbGRlcikgPT4gbmV3IEppdFZNKHJ1bnRpbWUsIHN0YXRlLCBidWlsZGVyLCBjb250ZXh0KTtcbn1cblxuZXhwb3J0IGNsYXNzIEppdFZNIGV4dGVuZHMgVk08Q29tcGlsYWJsZUJsb2NrPiBpbXBsZW1lbnRzIEludGVybmFsSml0Vk0ge1xuICBzdGF0aWMgaW5pdGlhbChcbiAgICBydW50aW1lOiBKaXRSdW50aW1lQ29udGV4dCxcbiAgICBjb250ZXh0OiBTeW50YXhDb21waWxhdGlvbkNvbnRleHQsXG4gICAgeyBoYW5kbGUsIHNlbGYsIGR5bmFtaWNTY29wZSwgdHJlZUJ1aWxkZXIgfTogSW5pdE9wdGlvbnNcbiAgKSB7XG4gICAgbGV0IHNjb3BlU2l6ZSA9IHJ1bnRpbWUucHJvZ3JhbS5oZWFwLnNjb3Blc2l6ZW9mKGhhbmRsZSk7XG4gICAgbGV0IHNjb3BlID0gU2NvcGVJbXBsLnJvb3Qoc2VsZiwgc2NvcGVTaXplKTtcbiAgICBsZXQgc3RhdGUgPSB2bVN0YXRlKHJ1bnRpbWUucHJvZ3JhbS5oZWFwLmdldGFkZHIoaGFuZGxlKSwgc2NvcGUsIGR5bmFtaWNTY29wZSk7XG4gICAgbGV0IHZtID0gaW5pdEpJVChjb250ZXh0KShydW50aW1lLCBzdGF0ZSwgdHJlZUJ1aWxkZXIpO1xuICAgIHZtLnB1c2hVcGRhdGluZygpO1xuICAgIHJldHVybiB2bTtcbiAgfVxuXG4gIHN0YXRpYyBlbXB0eShcbiAgICBydW50aW1lOiBKaXRSdW50aW1lQ29udGV4dCxcbiAgICB7IGhhbmRsZSwgdHJlZUJ1aWxkZXIsIGR5bmFtaWNTY29wZSB9OiBNaW5pbWFsSW5pdE9wdGlvbnMsXG4gICAgY29udGV4dDogU3ludGF4Q29tcGlsYXRpb25Db250ZXh0XG4gICkge1xuICAgIGxldCB2bSA9IGluaXRKSVQoY29udGV4dCkoXG4gICAgICBydW50aW1lLFxuICAgICAgdm1TdGF0ZShcbiAgICAgICAgcnVudGltZS5wcm9ncmFtLmhlYXAuZ2V0YWRkcihoYW5kbGUpLFxuICAgICAgICBTY29wZUltcGwucm9vdDxDb21waWxhYmxlQmxvY2s+KFVOREVGSU5FRF9SRUZFUkVOQ0UsIDApLFxuICAgICAgICBkeW5hbWljU2NvcGVcbiAgICAgICksXG4gICAgICB0cmVlQnVpbGRlclxuICAgICk7XG4gICAgdm0ucHVzaFVwZGF0aW5nKCk7XG4gICAgcmV0dXJuIHZtO1xuICB9XG5cbiAgcmVhZG9ubHkgcnVudGltZSE6IEppdFJ1bnRpbWVDb250ZXh0O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHJ1bnRpbWU6IEppdFJ1bnRpbWVDb250ZXh0LFxuICAgIHN0YXRlOiBWTVN0YXRlLFxuICAgIGVsZW1lbnRTdGFjazogRWxlbWVudEJ1aWxkZXIsXG4gICAgcmVhZG9ubHkgY29udGV4dDogU3ludGF4Q29tcGlsYXRpb25Db250ZXh0XG4gICkge1xuICAgIHN1cGVyKHJ1bnRpbWUsIHN0YXRlLCBlbGVtZW50U3RhY2spO1xuICB9XG5cbiAgY2FwdHVyZShhcmdzOiBudW1iZXIsIHBjID0gdGhpc1tJTk5FUl9WTV0uZmV0Y2hSZWdpc3RlcigkcGMpKTogUmVzdW1hYmxlVk1TdGF0ZTxKaXRWTT4ge1xuICAgIHJldHVybiBuZXcgUmVzdW1hYmxlVk1TdGF0ZUltcGwodGhpcy5jYXB0dXJlU3RhdGUoYXJncywgcGMpLCB0aGlzLnJlc3VtZSk7XG4gIH1cblxuICBwcml2YXRlIHJlc3VtZTogVm1Jbml0Q2FsbGJhY2s8Sml0Vk0+ID0gaW5pdEpJVCh0aGlzLmNvbnRleHQpO1xuXG4gIGNvbXBpbGUoYmxvY2s6IENvbXBpbGFibGVUZW1wbGF0ZSk6IG51bWJlciB7XG4gICAgcmV0dXJuIGJsb2NrLmNvbXBpbGUodGhpcy5jb250ZXh0KTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==