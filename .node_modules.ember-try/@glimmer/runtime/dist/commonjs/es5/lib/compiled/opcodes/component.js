"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DidUpdateLayoutOpcode = exports.UpdateComponentOpcode = exports.ComponentElementOperations = exports.COMPONENT_INSTANCE = undefined;
exports.hasStaticLayoutCapability = hasStaticLayoutCapability;
exports.hasJitStaticLayoutCapability = hasJitStaticLayoutCapability;
exports.hasDynamicLayoutCapability = hasDynamicLayoutCapability;

var _reference2 = require("@glimmer/reference");

var _util = require("@glimmer/util");

var _vm2 = require("@glimmer/vm");

var _capabilities = require("../../capabilities");

var _curriedComponent = require("../../component/curried-component");

var _resolve = require("../../component/resolve");

var _opcodes = require("../../opcodes");

var _classList = require("../../references/class-list");

var _classList2 = _interopRequireDefault(_classList);

var _curryComponent = require("../../references/curry-component");

var _curryComponent2 = _interopRequireDefault(_curryComponent);

var _symbols = require("../../symbols");

var _content = require("./content");

var _dom = require("./dom");

var _references = require("../../references");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * The VM creates a new ComponentInstance data structure for every component
 * invocation it encounters.
 *
 * Similar to how a ComponentDefinition contains state about all components of a
 * particular type, a ComponentInstance contains state specific to a particular
 * instance of a component type. It also contains a pointer back to its
 * component type's ComponentDefinition.
 */
var COMPONENT_INSTANCE = exports.COMPONENT_INSTANCE = 'COMPONENT_INSTANCE [c56c57de-e73a-4ef0-b137-07661da17029]';
_opcodes.APPEND_OPCODES.add(76 /* IsComponent */, function (vm) {
    var stack = vm.stack;
    var ref = stack.pop();
    stack.push(new _references.ConditionalReference(ref, _curriedComponent.isCurriedComponentDefinition));
});
_opcodes.APPEND_OPCODES.add(77 /* ContentType */, function (vm) {
    var stack = vm.stack;
    var ref = stack.peek();
    stack.push(new _content.ContentTypeReference(ref));
});
_opcodes.APPEND_OPCODES.add(78 /* CurryComponent */, function (vm, _ref) {
    var _meta = _ref.op1;

    var stack = vm.stack;
    var definition = stack.pop();
    var capturedArgs = stack.pop();
    var meta = vm[_symbols.CONSTANTS].getTemplateMeta(_meta);
    var resolver = vm.runtime.resolver;
    vm.loadValue(_vm2.$v0, new _curryComponent2.default(definition, resolver, meta, capturedArgs));
    // expectStackChange(vm.stack, -args.length - 1, 'CurryComponent');
});
_opcodes.APPEND_OPCODES.add(79 /* PushComponentDefinition */, function (vm, _ref2) {
    var _instance;

    var handle = _ref2.op1;

    var definition = vm.runtime.resolver.resolve(handle);
    false && (0, _util.assert)(!!definition, 'Missing component for ' + handle);

    var manager = definition.manager;

    var capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(definition.state));
    var instance = (_instance = {}, _instance[COMPONENT_INSTANCE] = true, _instance.definition = definition, _instance.manager = manager, _instance.capabilities = capabilities, _instance.state = null, _instance.handle = null, _instance.table = null, _instance.lookup = null, _instance);
    vm.stack.push(instance);
});
_opcodes.APPEND_OPCODES.add(82 /* ResolveDynamicComponent */, function (vm, _ref3) {
    var _meta = _ref3.op1;

    var stack = vm.stack;
    var component = stack.pop().value();
    var meta = vm[_symbols.CONSTANTS].getTemplateMeta(_meta);
    vm.loadValue(_vm2.$t1, null); // Clear the temp register
    var definition = void 0;
    if (typeof component === 'string') {
        var resolvedDefinition = (0, _resolve.resolveComponent)(vm.runtime.resolver, component, meta);
        definition = resolvedDefinition;
    } else if ((0, _curriedComponent.isCurriedComponentDefinition)(component)) {
        definition = component;
    } else {
        throw (0, _util.unreachable)();
    }
    stack.push(definition);
});
_opcodes.APPEND_OPCODES.add(80 /* PushDynamicComponentInstance */, function (vm) {
    var stack = vm.stack;

    var definition = stack.pop();
    var capabilities = void 0,
        manager = void 0;
    if ((0, _curriedComponent.isCurriedComponentDefinition)(definition)) {
        manager = capabilities = null;
    } else {
        manager = definition.manager;
        capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(definition.state));
    }
    stack.push({ definition: definition, capabilities: capabilities, manager: manager, state: null, handle: null, table: null });
});
_opcodes.APPEND_OPCODES.add(81 /* PushCurriedComponent */, function (vm) {
    var stack = vm.stack;
    var component = stack.pop().value();
    var definition = void 0;
    if ((0, _curriedComponent.isCurriedComponentDefinition)(component)) {
        definition = component;
    } else {
        throw (0, _util.unreachable)();
    }
    stack.push(definition);
});
_opcodes.APPEND_OPCODES.add(83 /* PushArgs */, function (vm, _ref4) {
    var _names = _ref4.op1,
        flags = _ref4.op2;

    var stack = vm.stack;
    var names = vm[_symbols.CONSTANTS].getStringArray(_names);
    var positionalCount = flags >> 4;
    var atNames = flags & 8;
    var blockNames = [];
    if (flags & 4) blockNames.push('main');
    if (flags & 2) blockNames.push('else');
    if (flags & 1) blockNames.push('attrs');
    vm[_symbols.ARGS].setup(stack, names, blockNames, positionalCount, !!atNames);
    stack.push(vm[_symbols.ARGS]);
});
_opcodes.APPEND_OPCODES.add(84 /* PushEmptyArgs */, function (vm) {
    var stack = vm.stack;

    stack.push(vm[_symbols.ARGS].empty(stack));
});
_opcodes.APPEND_OPCODES.add(87 /* CaptureArgs */, function (vm) {
    var stack = vm.stack;
    var args = stack.pop();
    var capturedArgs = args.capture();
    stack.push(capturedArgs);
});
_opcodes.APPEND_OPCODES.add(86 /* PrepareArgs */, function (vm, _ref5) {
    var _state = _ref5.op1;

    var stack = vm.stack;
    var instance = vm.fetchValue(_state);
    var args = stack.pop();
    var definition = instance.definition;

    if ((0, _curriedComponent.isCurriedComponentDefinition)(definition)) {
        false && (0, _util.assert)(!definition.manager, "If the component definition was curried, we don't yet have a manager");

        definition = resolveCurriedComponentDefinition(instance, definition, args);
    }
    var _definition = definition,
        manager = _definition.manager,
        state = _definition.state;

    var capabilities = instance.capabilities;
    if (!(0, _capabilities.managerHasCapability)(manager, capabilities, 4 /* PrepareArgs */)) {
        stack.push(args);
        return;
    }
    var blocks = args.blocks.values;
    var blockNames = args.blocks.names;
    var preparedArgs = manager.prepareArgs(state, args);
    if (preparedArgs) {
        args.clear();
        for (var i = 0; i < blocks.length; i++) {
            stack.push(blocks[i]);
        }
        var positional = preparedArgs.positional,
            named = preparedArgs.named;

        var positionalCount = positional.length;
        for (var _i = 0; _i < positionalCount; _i++) {
            stack.push(positional[_i]);
        }
        var names = Object.keys(named);
        for (var _i2 = 0; _i2 < names.length; _i2++) {
            stack.push(named[names[_i2]]);
        }
        args.setup(stack, names, blockNames, positionalCount, false);
    }
    stack.push(args);
});
function resolveCurriedComponentDefinition(instance, definition, args) {
    var unwrappedDefinition = instance.definition = definition.unwrap(args);
    var manager = unwrappedDefinition.manager,
        state = unwrappedDefinition.state;

    false && (0, _util.assert)(instance.manager === null, 'component instance manager should not be populated yet');
    false && (0, _util.assert)(instance.capabilities === null, 'component instance manager should not be populated yet');

    instance.manager = manager;
    instance.capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(state));
    return unwrappedDefinition;
}
_opcodes.APPEND_OPCODES.add(88 /* CreateComponent */, function (vm, _ref6) {
    var flags = _ref6.op1,
        _state = _ref6.op2;

    var instance = vm.fetchValue(_state);
    var definition = instance.definition,
        manager = instance.manager;

    var capabilities = instance.capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(definition.state));
    if (!(0, _capabilities.managerHasCapability)(manager, capabilities, 512 /* CreateInstance */)) {
        throw new Error('BUG');
    }
    var dynamicScope = null;
    if ((0, _capabilities.managerHasCapability)(manager, capabilities, 64 /* DynamicScope */)) {
        dynamicScope = vm.dynamicScope();
    }
    var hasDefaultBlock = flags & 1;
    var args = null;
    if ((0, _capabilities.managerHasCapability)(manager, capabilities, 8 /* CreateArgs */)) {
        args = vm.stack.peek();
    }
    var self = null;
    if ((0, _capabilities.managerHasCapability)(manager, capabilities, 128 /* CreateCaller */)) {
        self = vm.getSelf();
    }
    var state = manager.create(vm.env, definition.state, args, dynamicScope, self, !!hasDefaultBlock);
    // We want to reuse the `state` POJO here, because we know that the opcodes
    // only transition at exactly one place.
    instance.state = state;
    var tag = manager.getTag(state);
    if ((0, _capabilities.managerHasCapability)(manager, capabilities, 256 /* UpdateHook */) && !(0, _reference2.isConstTag)(tag)) {
        vm.updateWith(new UpdateComponentOpcode(tag, state, manager, dynamicScope));
    }
});
_opcodes.APPEND_OPCODES.add(89 /* RegisterComponentDestructor */, function (vm, _ref7) {
    var _state = _ref7.op1;

    var _vm$fetchValue = vm.fetchValue(_state),
        manager = _vm$fetchValue.manager,
        state = _vm$fetchValue.state;

    var d = manager.getDestructor(state);
    if (d) vm.associateDestroyable(d);
});
_opcodes.APPEND_OPCODES.add(99 /* BeginComponentTransaction */, function (vm) {
    vm.beginCacheGroup();
    vm.elements().pushSimpleBlock();
});
_opcodes.APPEND_OPCODES.add(90 /* PutComponentOperations */, function (vm) {
    vm.loadValue(_vm2.$t0, new ComponentElementOperations());
});
_opcodes.APPEND_OPCODES.add(52 /* ComponentAttr */, function (vm, _ref8) {
    var _name = _ref8.op1,
        trusting = _ref8.op2,
        _namespace = _ref8.op3;

    var name = vm[_symbols.CONSTANTS].getString(_name);
    var reference = vm.stack.pop();
    var namespace = _namespace ? vm[_symbols.CONSTANTS].getString(_namespace) : null;
    vm.fetchValue(_vm2.$t0).setAttribute(name, reference, !!trusting, namespace);
});
var ComponentElementOperations = exports.ComponentElementOperations = function () {
    function ComponentElementOperations() {
        _classCallCheck(this, ComponentElementOperations);

        this.attributes = (0, _util.dict)();
        this.classes = [];
        this.modifiers = [];
    }

    ComponentElementOperations.prototype.setAttribute = function setAttribute(name, value, trusting, namespace) {
        var deferred = { value: value, namespace: namespace, trusting: trusting };
        if (name === 'class') {
            this.classes.push(value);
        }
        this.attributes[name] = deferred;
    };

    ComponentElementOperations.prototype.addModifier = function addModifier(manager, state) {
        this.modifiers.push([manager, state]);
    };

    ComponentElementOperations.prototype.flush = function flush(vm) {
        for (var name in this.attributes) {
            var attr = this.attributes[name];
            var reference = attr.value,
                namespace = attr.namespace,
                trusting = attr.trusting;

            if (name === 'class') {
                reference = new _classList2.default(this.classes);
            }
            if (name === 'type') {
                continue;
            }
            var attribute = vm.elements().setDynamicAttribute(name, reference.value(), trusting, namespace);
            if (!(0, _reference2.isConst)(reference)) {
                vm.updateWith(new _dom.UpdateDynamicAttributeOpcode(reference, attribute));
            }
        }
        if ('type' in this.attributes) {
            var type = this.attributes.type;
            var _reference = type.value,
                _namespace2 = type.namespace,
                _trusting = type.trusting;

            var _attribute = vm.elements().setDynamicAttribute('type', _reference.value(), _trusting, _namespace2);
            if (!(0, _reference2.isConst)(_reference)) {
                vm.updateWith(new _dom.UpdateDynamicAttributeOpcode(_reference, _attribute));
            }
        }
        return this.modifiers;
    };

    return ComponentElementOperations;
}();
_opcodes.APPEND_OPCODES.add(101 /* DidCreateElement */, function (vm, _ref9) {
    var _state = _ref9.op1;

    var _vm$fetchValue2 = vm.fetchValue(_state),
        definition = _vm$fetchValue2.definition,
        state = _vm$fetchValue2.state;

    var manager = definition.manager;

    var operations = vm.fetchValue(_vm2.$t0);
    manager.didCreateElement(state, vm.elements().constructing, operations);
});
_opcodes.APPEND_OPCODES.add(91 /* GetComponentSelf */, function (vm, _ref10) {
    var _state = _ref10.op1;

    var _vm$fetchValue3 = vm.fetchValue(_state),
        definition = _vm$fetchValue3.definition,
        state = _vm$fetchValue3.state;

    var manager = definition.manager;

    vm.stack.push(manager.getSelf(state));
});
_opcodes.APPEND_OPCODES.add(92 /* GetComponentTagName */, function (vm, _ref11) {
    var _state = _ref11.op1;

    var _vm$fetchValue4 = vm.fetchValue(_state),
        definition = _vm$fetchValue4.definition,
        state = _vm$fetchValue4.state;

    var manager = definition.manager;

    vm.stack.push(manager.getTagName(state));
});
// Dynamic Invocation Only
_opcodes.APPEND_OPCODES.add(94 /* GetJitComponentLayout */, function (vm, _ref12) {
    var _state = _ref12.op1;

    var instance = vm.fetchValue(_state);
    var manager = instance.manager;
    var definition = instance.definition;
    var stack = vm.stack;
    var capabilities = instance.capabilities;
    // let invoke: { handle: number; symbolTable: ProgramSymbolTable };

    var layout = void 0;
    if (hasStaticLayoutCapability(capabilities, manager)) {
        layout = manager.getJitStaticLayout(definition.state, vm.runtime.resolver);
    } else if (hasDynamicLayoutCapability(capabilities, manager)) {
        var template = manager.getJitDynamicLayout(instance.state, vm.runtime.resolver, vm.context);
        if ((0, _capabilities.hasCapability)(capabilities, 1024 /* Wrapped */)) {
            layout = template.asWrappedLayout();
        } else {
            layout = template.asLayout();
        }
    } else {
        throw (0, _util.unreachable)();
    }
    var handle = layout.compile(vm.context);
    stack.push(layout.symbolTable);
    stack.push(handle);
}, 'jit');
// Dynamic Invocation Only
_opcodes.APPEND_OPCODES.add(93 /* GetAotComponentLayout */, function (vm, _ref13) {
    var _state = _ref13.op1;

    var instance = vm.fetchValue(_state);
    var manager = instance.manager,
        definition = instance.definition;
    var stack = vm.stack;
    var instanceState = instance.state,
        capabilities = instance.capabilities;
    var definitionState = definition.state;

    var invoke = void 0;
    if (hasStaticLayoutCapability(capabilities, manager)) {
        invoke = manager.getAotStaticLayout(definitionState, vm.runtime.resolver);
    } else if (hasDynamicLayoutCapability(capabilities, manager)) {
        invoke = manager.getAotDynamicLayout(instanceState, vm.runtime.resolver);
    } else {
        throw (0, _util.unreachable)();
    }
    stack.push(invoke.symbolTable);
    stack.push(invoke.handle);
});
// These types are absurd here
function hasStaticLayoutCapability(capabilities, _manager) {
    return (0, _capabilities.managerHasCapability)(_manager, capabilities, 1 /* DynamicLayout */) === false;
}
function hasJitStaticLayoutCapability(capabilities, _manager) {
    return (0, _capabilities.managerHasCapability)(_manager, capabilities, 1 /* DynamicLayout */) === false;
}
function hasDynamicLayoutCapability(capabilities, _manager) {
    return (0, _capabilities.managerHasCapability)(_manager, capabilities, 1 /* DynamicLayout */) === true;
}
_opcodes.APPEND_OPCODES.add(75 /* Main */, function (vm, _ref14) {
    var _state2;

    var register = _ref14.op1;

    var definition = vm.stack.pop();
    var invocation = vm.stack.pop();
    var manager = definition.manager;

    var capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(definition.state));
    var state = (_state2 = {}, _state2[COMPONENT_INSTANCE] = true, _state2.definition = definition, _state2.manager = manager, _state2.capabilities = capabilities, _state2.state = null, _state2.handle = invocation.handle, _state2.table = invocation.symbolTable, _state2.lookup = null, _state2);
    vm.loadValue(register, state);
});
_opcodes.APPEND_OPCODES.add(97 /* PopulateLayout */, function (vm, _ref15) {
    var _state = _ref15.op1;
    var stack = vm.stack;

    var handle = stack.pop();
    var table = stack.pop();
    var state = vm.fetchValue(_state);
    state.handle = handle;
    state.table = table;
});
_opcodes.APPEND_OPCODES.add(37 /* VirtualRootScope */, function (vm, _ref16) {
    var _state = _ref16.op1;
    var symbols = vm.fetchValue(_state).table.symbols;

    vm.pushRootScope(symbols.length + 1);
});
_opcodes.APPEND_OPCODES.add(96 /* SetupForEval */, function (vm, _ref17) {
    var _state = _ref17.op1;

    var state = vm.fetchValue(_state);
    if (state.table.hasEval) {
        var lookup = state.lookup = (0, _util.dict)();
        vm.scope().bindEvalScope(lookup);
    }
});
_opcodes.APPEND_OPCODES.add(17 /* SetNamedVariables */, function (vm, _ref18) {
    var _state = _ref18.op1;

    var state = vm.fetchValue(_state);
    var scope = vm.scope();
    var args = vm.stack.peek();
    var callerNames = args.named.atNames;
    for (var i = callerNames.length - 1; i >= 0; i--) {
        var atName = callerNames[i];
        var symbol = state.table.symbols.indexOf(callerNames[i]);
        var value = args.named.get(atName, true);
        if (symbol !== -1) scope.bindSymbol(symbol + 1, value);
        if (state.lookup) state.lookup[atName] = value;
    }
});
function bindBlock(symbolName, blockName, state, blocks, vm) {
    var symbol = state.table.symbols.indexOf(symbolName);
    var block = blocks.get(blockName);
    if (symbol !== -1) {
        vm.scope().bindBlock(symbol + 1, block);
    }
    if (state.lookup) state.lookup[symbolName] = block;
}
_opcodes.APPEND_OPCODES.add(18 /* SetBlocks */, function (vm, _ref19) {
    var _state = _ref19.op1;

    var state = vm.fetchValue(_state);

    var _vm$stack$peek = vm.stack.peek(),
        blocks = _vm$stack$peek.blocks;

    bindBlock('&attrs', 'attrs', state, blocks, vm);
    bindBlock('&else', 'else', state, blocks, vm);
    bindBlock('&default', 'main', state, blocks, vm);
});
// Dynamic Invocation Only
_opcodes.APPEND_OPCODES.add(98 /* InvokeComponentLayout */, function (vm, _ref20) {
    var _state = _ref20.op1;

    var state = vm.fetchValue(_state);
    vm.call(state.handle);
});
_opcodes.APPEND_OPCODES.add(102 /* DidRenderLayout */, function (vm, _ref21) {
    var _state = _ref21.op1;

    var _vm$fetchValue5 = vm.fetchValue(_state),
        manager = _vm$fetchValue5.manager,
        state = _vm$fetchValue5.state,
        capabilities = _vm$fetchValue5.capabilities;

    var bounds = vm.elements().popBlock();
    if (!(0, _capabilities.managerHasCapability)(manager, capabilities, 512 /* CreateInstance */)) {
        throw new Error('BUG');
    }
    var mgr = manager;
    mgr.didRenderLayout(state, bounds);
    vm.env.didCreate(state, manager);
    vm.updateWith(new DidUpdateLayoutOpcode(manager, state, bounds));
});
_opcodes.APPEND_OPCODES.add(100 /* CommitComponentTransaction */, function (vm) {
    vm.commitCacheGroup();
});
var UpdateComponentOpcode = exports.UpdateComponentOpcode = function (_UpdatingOpcode) {
    _inherits(UpdateComponentOpcode, _UpdatingOpcode);

    function UpdateComponentOpcode(tag, component, manager, dynamicScope) {
        _classCallCheck(this, UpdateComponentOpcode);

        var _this = _possibleConstructorReturn(this, _UpdatingOpcode.call(this));

        _this.tag = tag;
        _this.component = component;
        _this.manager = manager;
        _this.dynamicScope = dynamicScope;
        _this.type = 'update-component';
        return _this;
    }

    UpdateComponentOpcode.prototype.evaluate = function evaluate(_vm) {
        var component = this.component,
            manager = this.manager,
            dynamicScope = this.dynamicScope;

        manager.update(component, dynamicScope);
    };

    return UpdateComponentOpcode;
}(_opcodes.UpdatingOpcode);
var DidUpdateLayoutOpcode = exports.DidUpdateLayoutOpcode = function (_UpdatingOpcode2) {
    _inherits(DidUpdateLayoutOpcode, _UpdatingOpcode2);

    function DidUpdateLayoutOpcode(manager, component, bounds) {
        _classCallCheck(this, DidUpdateLayoutOpcode);

        var _this2 = _possibleConstructorReturn(this, _UpdatingOpcode2.call(this));

        _this2.manager = manager;
        _this2.component = component;
        _this2.bounds = bounds;
        _this2.type = 'did-update-layout';
        _this2.tag = _reference2.CONSTANT_TAG;
        return _this2;
    }

    DidUpdateLayoutOpcode.prototype.evaluate = function evaluate(vm) {
        var manager = this.manager,
            component = this.component,
            bounds = this.bounds;

        manager.didUpdateLayout(component, bounds);
        vm.env.didUpdate(component, manager);
    };

    return DidUpdateLayoutOpcode;
}(_opcodes.UpdatingOpcode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQTRqQk0seUIsR0FBQSx5QjtRQVNBLDRCLEdBQUEsNEI7UUFXQSwwQixHQUFBLDBCOztBQXppQk47O0FBUUE7O0FBQ0E7O0FBQ0E7O0FBTUE7O0FBSUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQWNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7Ozs7O0FBVU8sSUFBTSxrREFBTiwyREFBQTtBQXdDUCx3QkFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLEVBQW1DLFVBQUEsRUFBQSxFQUFLO0FBQ3RDLFFBQUksUUFBUSxHQUFaLEtBQUE7QUFDQSxRQUFJLE1BQVksTUFBaEIsR0FBZ0IsRUFBaEI7QUFFQSxVQUFBLElBQUEsQ0FBVyxJQUFBLGdDQUFBLENBQUEsR0FBQSxFQUFYLDhDQUFXLENBQVg7QUFKRixDQUFBO0FBT0Esd0JBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxpQkFBQSxFQUFtQyxVQUFBLEVBQUEsRUFBSztBQUN0QyxRQUFJLFFBQVEsR0FBWixLQUFBO0FBQ0EsUUFBSSxNQUFZLE1BQWhCLElBQWdCLEVBQWhCO0FBRUEsVUFBQSxJQUFBLENBQVcsSUFBQSw2QkFBQSxDQUFYLEdBQVcsQ0FBWDtBQUpGLENBQUE7QUFPQSx3QkFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLG9CQUFBLEVBQXNDLFVBQUEsRUFBQSxFQUFBLElBQUEsRUFBdUI7QUFBQSxRQUF2QixRQUF1QixLQUFoQixHQUFnQjs7QUFDM0QsUUFBSSxRQUFRLEdBQVosS0FBQTtBQUVBLFFBQUksYUFBbUIsTUFBdkIsR0FBdUIsRUFBdkI7QUFDQSxRQUFJLGVBQXFCLE1BQXpCLEdBQXlCLEVBQXpCO0FBRUEsUUFBSSxPQUFPLEdB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RmQsZUFBQSxPQUFBLEdBQUEsT0FBQTtBQUNBLGVBQUEsU0FBQSxHQUFBLFNBQUE7QUFDQSxlQUFBLE1BQUEsR0FBQSxNQUFBO0FBTkgsZUFBQSxJQUFBLEdBQUEsbUJBQUE7QUFDQSxlQUFBLEdBQUEsR0FBQSx3QkFBQTtBQUtpQixlQUFBLE1BQUE7QUFHdkI7O0FBVkgsMEJBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsQ0FBQSxFQUFBLEVBWXlCO0FBQUEsWUFBQSxVQUFBLEtBQUEsT0FBQTtBQUFBLFlBQUEsWUFBQSxLQUFBLFNBQUE7QUFBQSxZQUFBLFNBQUEsS0FBQSxNQUFBOztBQUdyQixnQkFBQSxlQUFBLENBQUEsU0FBQSxFQUFBLE1BQUE7QUFFQSxXQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxFQUFBLE9BQUE7QUFqQkosS0FBQTs7QUFBQSxXQUFBLHFCQUFBO0FBQUEsQ0FBQSxDQUFBLHVCQUFBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBjaGVjayxcbiAgQ2hlY2tGdW5jdGlvbixcbiAgQ2hlY2tIYW5kbGUsXG4gIENoZWNrSW5zdGFuY2VvZixcbiAgQ2hlY2tJbnRlcmZhY2UsXG4gIENoZWNrUHJvZ3JhbVN5bWJvbFRhYmxlLFxufSBmcm9tICdAZ2xpbW1lci9kZWJ1Zyc7XG5pbXBvcnQge1xuICBCb3VuZHMsXG4gIENvbXBpbGFibGVUZW1wbGF0ZSxcbiAgQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLFxuICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICBDb21wb25lbnRNYW5hZ2VyLFxuICBEaWN0LFxuICBEeW5hbWljU2NvcGUsXG4gIEVsZW1lbnRPcGVyYXRpb25zLFxuICBJbnRlcm5hbENvbXBvbmVudE1hbmFnZXIsXG4gIEppdE9yQW90QmxvY2ssXG4gIE1heWJlLFxuICBPcCxcbiAgUHJvZ3JhbVN5bWJvbFRhYmxlLFxuICBSZWNhc3QsXG4gIFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlLFxuICBTY29wZVNsb3QsXG4gIFZNQXJndW1lbnRzLFxuICBXaXRoQW90RHluYW1pY0xheW91dCxcbiAgV2l0aEFvdFN0YXRpY0xheW91dCxcbiAgV2l0aER5bmFtaWNUYWdOYW1lLFxuICBXaXRoRWxlbWVudEhvb2ssXG4gIFdpdGhKaXREeW5hbWljTGF5b3V0LFxuICBXaXRoSml0U3RhdGljTGF5b3V0LFxuICBXaXRoVXBkYXRlSG9vayxcbiAgV2l0aENyZWF0ZUluc3RhbmNlLFxuICBKaXRSdW50aW1lUmVzb2x2ZXIsXG4gIFJ1bnRpbWVSZXNvbHZlcixcbiAgTW9kaWZpZXJNYW5hZ2VyLFxufSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7XG4gIENPTlNUQU5UX1RBRyxcbiAgaXNDb25zdCxcbiAgaXNDb25zdFRhZyxcbiAgVGFnLFxuICBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLFxuICBWZXJzaW9uZWRSZWZlcmVuY2UsXG59IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBhc3NlcnQsIGRpY3QsIGV4cGVjdCwgT3B0aW9uLCB1bnJlYWNoYWJsZSB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgJHQwLCAkdDEsICR2MCB9IGZyb20gJ0BnbGltbWVyL3ZtJztcbmltcG9ydCB7XG4gIENhcGFiaWxpdHksXG4gIGNhcGFiaWxpdHlGbGFnc0Zyb20sXG4gIG1hbmFnZXJIYXNDYXBhYmlsaXR5LFxuICBoYXNDYXBhYmlsaXR5LFxufSBmcm9tICcuLi8uLi9jYXBhYmlsaXRpZXMnO1xuaW1wb3J0IHtcbiAgQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG4gIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG59IGZyb20gJy4uLy4uL2NvbXBvbmVudC9jdXJyaWVkLWNvbXBvbmVudCc7XG5pbXBvcnQgeyByZXNvbHZlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3Jlc29sdmUnO1xuaW1wb3J0IHsgQVBQRU5EX09QQ09ERVMsIFVwZGF0aW5nT3Bjb2RlIH0gZnJvbSAnLi4vLi4vb3Bjb2Rlcyc7XG5pbXBvcnQgQ2xhc3NMaXN0UmVmZXJlbmNlIGZyb20gJy4uLy4uL3JlZmVyZW5jZXMvY2xhc3MtbGlzdCc7XG5pbXBvcnQgQ3VycnlDb21wb25lbnRSZWZlcmVuY2UgZnJvbSAnLi4vLi4vcmVmZXJlbmNlcy9jdXJyeS1jb21wb25lbnQnO1xuaW1wb3J0IHsgQVJHUywgQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vc3ltYm9scyc7XG5pbXBvcnQgeyBVcGRhdGluZ1ZNIH0gZnJvbSAnLi4vLi4vdm0nO1xuaW1wb3J0IHsgSW50ZXJuYWxWTSB9IGZyb20gJy4uLy4uL3ZtL2FwcGVuZCc7XG5pbXBvcnQgeyBCbG9ja0FyZ3VtZW50c0ltcGwsIFZNQXJndW1lbnRzSW1wbCB9IGZyb20gJy4uLy4uL3ZtL2FyZ3VtZW50cyc7XG5pbXBvcnQge1xuICBDaGVja0FyZ3VtZW50cyxcbiAgQ2hlY2tDYXB0dXJlZEFyZ3VtZW50cyxcbiAgQ2hlY2tDb21wb25lbnREZWZpbml0aW9uLFxuICBDaGVja0NvbXBvbmVudEluc3RhbmNlLFxuICBDaGVja0ZpbmlzaGVkQ29tcG9uZW50SW5zdGFuY2UsXG4gIENoZWNrSW52b2NhdGlvbixcbiAgQ2hlY2tQYXRoUmVmZXJlbmNlLFxuICBDaGVja1JlZmVyZW5jZSxcbn0gZnJvbSAnLi8tZGVidWctc3RyaXAnO1xuaW1wb3J0IHsgQ29udGVudFR5cGVSZWZlcmVuY2UgfSBmcm9tICcuL2NvbnRlbnQnO1xuaW1wb3J0IHsgVXBkYXRlRHluYW1pY0F0dHJpYnV0ZU9wY29kZSB9IGZyb20gJy4vZG9tJztcbmltcG9ydCB7IENvbmRpdGlvbmFsUmVmZXJlbmNlIH0gZnJvbSAnLi4vLi4vcmVmZXJlbmNlcyc7XG5cbi8qKlxuICogVGhlIFZNIGNyZWF0ZXMgYSBuZXcgQ29tcG9uZW50SW5zdGFuY2UgZGF0YSBzdHJ1Y3R1cmUgZm9yIGV2ZXJ5IGNvbXBvbmVudFxuICogaW52b2NhdGlvbiBpdCBlbmNvdW50ZXJzLlxuICpcbiAqIFNpbWlsYXIgdG8gaG93IGEgQ29tcG9uZW50RGVmaW5pdGlvbiBjb250YWlucyBzdGF0ZSBhYm91dCBhbGwgY29tcG9uZW50cyBvZiBhXG4gKiBwYXJ0aWN1bGFyIHR5cGUsIGEgQ29tcG9uZW50SW5zdGFuY2UgY29udGFpbnMgc3RhdGUgc3BlY2lmaWMgdG8gYSBwYXJ0aWN1bGFyXG4gKiBpbnN0YW5jZSBvZiBhIGNvbXBvbmVudCB0eXBlLiBJdCBhbHNvIGNvbnRhaW5zIGEgcG9pbnRlciBiYWNrIHRvIGl0c1xuICogY29tcG9uZW50IHR5cGUncyBDb21wb25lbnREZWZpbml0aW9uLlxuICovXG5cbmV4cG9ydCBjb25zdCBDT01QT05FTlRfSU5TVEFOQ0UgPSAnQ09NUE9ORU5UX0lOU1RBTkNFIFtjNTZjNTdkZS1lNzNhLTRlZjAtYjEzNy0wNzY2MWRhMTcwMjldJztcblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRJbnN0YW5jZSB7XG4gIFtDT01QT05FTlRfSU5TVEFOQ0VdOiB0cnVlO1xuICBkZWZpbml0aW9uOiBDb21wb25lbnREZWZpbml0aW9uO1xuICBtYW5hZ2VyOiBDb21wb25lbnRNYW5hZ2VyO1xuICBjYXBhYmlsaXRpZXM6IENhcGFiaWxpdHk7XG4gIHN0YXRlOiBDb21wb25lbnRJbnN0YW5jZVN0YXRlO1xuICBoYW5kbGU6IG51bWJlcjtcbiAgdGFibGU6IFByb2dyYW1TeW1ib2xUYWJsZTtcbiAgbG9va3VwOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Sml0T3JBb3RCbG9jaz4+Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbml0aWFsQ29tcG9uZW50SW5zdGFuY2Uge1xuICBbQ09NUE9ORU5UX0lOU1RBTkNFXTogdHJ1ZTtcbiAgZGVmaW5pdGlvbjogUGFydGlhbENvbXBvbmVudERlZmluaXRpb247XG4gIG1hbmFnZXI6IE9wdGlvbjxJbnRlcm5hbENvbXBvbmVudE1hbmFnZXI+O1xuICBjYXBhYmlsaXRpZXM6IE9wdGlvbjxDYXBhYmlsaXR5PjtcbiAgc3RhdGU6IG51bGw7XG4gIGhhbmRsZTogT3B0aW9uPG51bWJlcj47XG4gIHRhYmxlOiBPcHRpb248UHJvZ3JhbVN5bWJvbFRhYmxlPjtcbiAgbG9va3VwOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Sml0T3JBb3RCbG9jaz4+Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb3B1bGF0ZWRDb21wb25lbnRJbnN0YW5jZSB7XG4gIFtDT01QT05FTlRfSU5TVEFOQ0VdOiB0cnVlO1xuICBkZWZpbml0aW9uOiBDb21wb25lbnREZWZpbml0aW9uO1xuICBtYW5hZ2VyOiBDb21wb25lbnRNYW5hZ2VyPHVua25vd24+O1xuICBjYXBhYmlsaXRpZXM6IENhcGFiaWxpdHk7XG4gIHN0YXRlOiBudWxsO1xuICBoYW5kbGU6IG51bWJlcjtcbiAgdGFibGU6IE9wdGlvbjxQcm9ncmFtU3ltYm9sVGFibGU+O1xuICBsb29rdXA6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxKaXRPckFvdEJsb2NrPj4+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhcnRpYWxDb21wb25lbnREZWZpbml0aW9uIHtcbiAgc3RhdGU6IE9wdGlvbjxDb21wb25lbnREZWZpbml0aW9uU3RhdGU+O1xuICBtYW5hZ2VyOiBJbnRlcm5hbENvbXBvbmVudE1hbmFnZXI7XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Jc0NvbXBvbmVudCwgdm0gPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IHJlZiA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG5cbiAgc3RhY2sucHVzaChuZXcgQ29uZGl0aW9uYWxSZWZlcmVuY2UocmVmLCBpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNvbnRlbnRUeXBlLCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgcmVmID0gY2hlY2soc3RhY2sucGVlaygpLCBDaGVja1JlZmVyZW5jZSk7XG5cbiAgc3RhY2sucHVzaChuZXcgQ29udGVudFR5cGVSZWZlcmVuY2UocmVmKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkN1cnJ5Q29tcG9uZW50LCAodm0sIHsgb3AxOiBfbWV0YSB9KSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuXG4gIGxldCBkZWZpbml0aW9uID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKTtcbiAgbGV0IGNhcHR1cmVkQXJncyA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja0NhcHR1cmVkQXJndW1lbnRzKTtcblxuICBsZXQgbWV0YSA9IHZtW0NPTlNUQU5UU10uZ2V0VGVtcGxhdGVNZXRhKF9tZXRhKTtcbiAgbGV0IHJlc29sdmVyID0gdm0ucnVudGltZS5yZXNvbHZlcjtcblxuICB2bS5sb2FkVmFsdWUoJHYwLCBuZXcgQ3VycnlDb21wb25lbnRSZWZlcmVuY2UoZGVmaW5pdGlvbiwgcmVzb2x2ZXIsIG1ldGEsIGNhcHR1cmVkQXJncykpO1xuXG4gIC8vIGV4cGVjdFN0YWNrQ2hhbmdlKHZtLnN0YWNrLCAtYXJncy5sZW5ndGggLSAxLCAnQ3VycnlDb21wb25lbnQnKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHVzaENvbXBvbmVudERlZmluaXRpb24sICh2bSwgeyBvcDE6IGhhbmRsZSB9KSA9PiB7XG4gIGxldCBkZWZpbml0aW9uID0gdm0ucnVudGltZS5yZXNvbHZlci5yZXNvbHZlPENvbXBvbmVudERlZmluaXRpb24+KGhhbmRsZSk7XG4gIGFzc2VydCghIWRlZmluaXRpb24sIGBNaXNzaW5nIGNvbXBvbmVudCBmb3IgJHtoYW5kbGV9YCk7XG5cbiAgbGV0IHsgbWFuYWdlciB9ID0gZGVmaW5pdGlvbjtcbiAgbGV0IGNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdHlGbGFnc0Zyb20obWFuYWdlci5nZXRDYXBhYmlsaXRpZXMoZGVmaW5pdGlvbi5zdGF0ZSkpO1xuXG4gIGxldCBpbnN0YW5jZTogSW5pdGlhbENvbXBvbmVudEluc3RhbmNlID0ge1xuICAgIFtDT01QT05FTlRfSU5TVEFOQ0VdOiB0cnVlLFxuICAgIGRlZmluaXRpb24sXG4gICAgbWFuYWdlcixcbiAgICBjYXBhYmlsaXRpZXMsXG4gICAgc3RhdGU6IG51bGwsXG4gICAgaGFuZGxlOiBudWxsLFxuICAgIHRhYmxlOiBudWxsLFxuICAgIGxvb2t1cDogbnVsbCxcbiAgfTtcblxuICB2bS5zdGFjay5wdXNoKGluc3RhbmNlKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUmVzb2x2ZUR5bmFtaWNDb21wb25lbnQsICh2bSwgeyBvcDE6IF9tZXRhIH0pID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCBjb21wb25lbnQgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKS52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuICBsZXQgbWV0YSA9IHZtW0NPTlNUQU5UU10uZ2V0VGVtcGxhdGVNZXRhKF9tZXRhKTtcblxuICB2bS5sb2FkVmFsdWUoJHQxLCBudWxsKTsgLy8gQ2xlYXIgdGhlIHRlbXAgcmVnaXN0ZXJcblxuICBsZXQgZGVmaW5pdGlvbjogQ29tcG9uZW50RGVmaW5pdGlvbiB8IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uO1xuXG4gIGlmICh0eXBlb2YgY29tcG9uZW50ID09PSAnc3RyaW5nJykge1xuICAgIGxldCByZXNvbHZlZERlZmluaXRpb24gPSByZXNvbHZlQ29tcG9uZW50KHZtLnJ1bnRpbWUucmVzb2x2ZXIsIGNvbXBvbmVudCwgbWV0YSk7XG5cbiAgICBkZWZpbml0aW9uID0gZXhwZWN0KHJlc29sdmVkRGVmaW5pdGlvbiwgYENvdWxkIG5vdCBmaW5kIGEgY29tcG9uZW50IG5hbWVkIFwiJHtjb21wb25lbnR9XCJgKTtcbiAgfSBlbHNlIGlmIChpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGNvbXBvbmVudCkpIHtcbiAgICBkZWZpbml0aW9uID0gY29tcG9uZW50O1xuICB9IGVsc2Uge1xuICAgIHRocm93IHVucmVhY2hhYmxlKCk7XG4gIH1cblxuICBzdGFjay5wdXNoKGRlZmluaXRpb24pO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoRHluYW1pY0NvbXBvbmVudEluc3RhbmNlLCB2bSA9PiB7XG4gIGxldCB7IHN0YWNrIH0gPSB2bTtcbiAgbGV0IGRlZmluaXRpb24gPSBzdGFjay5wb3A8Q29tcG9uZW50RGVmaW5pdGlvbj4oKTtcblxuICBsZXQgY2FwYWJpbGl0aWVzLCBtYW5hZ2VyO1xuXG4gIGlmIChpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGRlZmluaXRpb24pKSB7XG4gICAgbWFuYWdlciA9IGNhcGFiaWxpdGllcyA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgbWFuYWdlciA9IGRlZmluaXRpb24ubWFuYWdlcjtcbiAgICBjYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXR5RmxhZ3NGcm9tKG1hbmFnZXIuZ2V0Q2FwYWJpbGl0aWVzKGRlZmluaXRpb24uc3RhdGUpKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goeyBkZWZpbml0aW9uLCBjYXBhYmlsaXRpZXMsIG1hbmFnZXIsIHN0YXRlOiBudWxsLCBoYW5kbGU6IG51bGwsIHRhYmxlOiBudWxsIH0pO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoQ3VycmllZENvbXBvbmVudCwgdm0gPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcblxuICBsZXQgY29tcG9uZW50ID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUGF0aFJlZmVyZW5jZSkudmFsdWUoKSBhcyBNYXliZTxEaWN0PjtcbiAgbGV0IGRlZmluaXRpb246IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uO1xuXG4gIGlmIChpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGNvbXBvbmVudCkpIHtcbiAgICBkZWZpbml0aW9uID0gY29tcG9uZW50O1xuICB9IGVsc2Uge1xuICAgIHRocm93IHVucmVhY2hhYmxlKCk7XG4gIH1cblxuICBzdGFjay5wdXNoKGRlZmluaXRpb24pO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoQXJncywgKHZtLCB7IG9wMTogX25hbWVzLCBvcDI6IGZsYWdzIH0pID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCBuYW1lcyA9IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nQXJyYXkoX25hbWVzKTtcblxuICBsZXQgcG9zaXRpb25hbENvdW50ID0gZmxhZ3MgPj4gNDtcbiAgbGV0IGF0TmFtZXMgPSBmbGFncyAmIDBiMTAwMDtcbiAgbGV0IGJsb2NrTmFtZXM6IHN0cmluZ1tdID0gW107XG5cbiAgaWYgKGZsYWdzICYgMGIwMTAwKSBibG9ja05hbWVzLnB1c2goJ21haW4nKTtcbiAgaWYgKGZsYWdzICYgMGIwMDEwKSBibG9ja05hbWVzLnB1c2goJ2Vsc2UnKTtcbiAgaWYgKGZsYWdzICYgMGIwMDAxKSBibG9ja05hbWVzLnB1c2goJ2F0dHJzJyk7XG5cbiAgdm1bQVJHU10uc2V0dXAoc3RhY2ssIG5hbWVzLCBibG9ja05hbWVzLCBwb3NpdGlvbmFsQ291bnQsICEhYXROYW1lcyk7XG4gIHN0YWNrLnB1c2godm1bQVJHU10pO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoRW1wdHlBcmdzLCB2bSA9PiB7XG4gIGxldCB7IHN0YWNrIH0gPSB2bTtcblxuICBzdGFjay5wdXNoKHZtW0FSR1NdLmVtcHR5KHN0YWNrKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNhcHR1cmVBcmdzLCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuXG4gIGxldCBhcmdzID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrSW5zdGFuY2VvZihWTUFyZ3VtZW50c0ltcGwpKTtcbiAgbGV0IGNhcHR1cmVkQXJncyA9IGFyZ3MuY2FwdHVyZSgpO1xuICBzdGFjay5wdXNoKGNhcHR1cmVkQXJncyk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlByZXBhcmVBcmdzLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IGluc3RhbmNlID0gdm0uZmV0Y2hWYWx1ZTxDb21wb25lbnRJbnN0YW5jZT4oX3N0YXRlKTtcbiAgbGV0IGFyZ3MgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tJbnN0YW5jZW9mKFZNQXJndW1lbnRzSW1wbCkpO1xuXG4gIGxldCB7IGRlZmluaXRpb24gfSA9IGluc3RhbmNlO1xuXG4gIGlmIChpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGRlZmluaXRpb24pKSB7XG4gICAgYXNzZXJ0KFxuICAgICAgIWRlZmluaXRpb24ubWFuYWdlcixcbiAgICAgIFwiSWYgdGhlIGNvbXBvbmVudCBkZWZpbml0aW9uIHdhcyBjdXJyaWVkLCB3ZSBkb24ndCB5ZXQgaGF2ZSBhIG1hbmFnZXJcIlxuICAgICk7XG4gICAgZGVmaW5pdGlvbiA9IHJlc29sdmVDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihpbnN0YW5jZSwgZGVmaW5pdGlvbiwgYXJncyk7XG4gIH1cblxuICBsZXQgeyBtYW5hZ2VyLCBzdGF0ZSB9ID0gZGVmaW5pdGlvbjtcbiAgbGV0IGNhcGFiaWxpdGllcyA9IGluc3RhbmNlLmNhcGFiaWxpdGllcztcblxuICBpZiAoIW1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5QcmVwYXJlQXJncykpIHtcbiAgICBzdGFjay5wdXNoKGFyZ3MpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBibG9ja3MgPSBhcmdzLmJsb2Nrcy52YWx1ZXM7XG4gIGxldCBibG9ja05hbWVzID0gYXJncy5ibG9ja3MubmFtZXM7XG4gIGxldCBwcmVwYXJlZEFyZ3MgPSBtYW5hZ2VyLnByZXBhcmVBcmdzKHN0YXRlLCBhcmdzKTtcblxuICBpZiAocHJlcGFyZWRBcmdzKSB7XG4gICAgYXJncy5jbGVhcigpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBibG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHN0YWNrLnB1c2goYmxvY2tzW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgeyBwb3NpdGlvbmFsLCBuYW1lZCB9ID0gcHJlcGFyZWRBcmdzO1xuXG4gICAgbGV0IHBvc2l0aW9uYWxDb3VudCA9IHBvc2l0aW9uYWwubGVuZ3RoO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbmFsQ291bnQ7IGkrKykge1xuICAgICAgc3RhY2sucHVzaChwb3NpdGlvbmFsW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgbmFtZXMgPSBPYmplY3Qua2V5cyhuYW1lZCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzdGFjay5wdXNoKG5hbWVkW25hbWVzW2ldXSk7XG4gICAgfVxuXG4gICAgYXJncy5zZXR1cChzdGFjaywgbmFtZXMsIGJsb2NrTmFtZXMsIHBvc2l0aW9uYWxDb3VudCwgZmFsc2UpO1xuICB9XG5cbiAgc3RhY2sucHVzaChhcmdzKTtcbn0pO1xuXG5mdW5jdGlvbiByZXNvbHZlQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oXG4gIGluc3RhbmNlOiBDb21wb25lbnRJbnN0YW5jZSxcbiAgZGVmaW5pdGlvbjogQ3VycmllZENvbXBvbmVudERlZmluaXRpb24sXG4gIGFyZ3M6IFZNQXJndW1lbnRzSW1wbFxuKTogQ29tcG9uZW50RGVmaW5pdGlvbiB7XG4gIGxldCB1bndyYXBwZWREZWZpbml0aW9uID0gKGluc3RhbmNlLmRlZmluaXRpb24gPSBkZWZpbml0aW9uLnVud3JhcChhcmdzKSk7XG4gIGxldCB7IG1hbmFnZXIsIHN0YXRlIH0gPSB1bndyYXBwZWREZWZpbml0aW9uO1xuXG4gIGFzc2VydChpbnN0YW5jZS5tYW5hZ2VyID09PSBudWxsLCAnY29tcG9uZW50IGluc3RhbmNlIG1hbmFnZXIgc2hvdWxkIG5vdCBiZSBwb3B1bGF0ZWQgeWV0Jyk7XG4gIGFzc2VydChpbnN0YW5jZS5jYXBhYmlsaXRpZXMgPT09IG51bGwsICdjb21wb25lbnQgaW5zdGFuY2UgbWFuYWdlciBzaG91bGQgbm90IGJlIHBvcHVsYXRlZCB5ZXQnKTtcblxuICBpbnN0YW5jZS5tYW5hZ2VyID0gbWFuYWdlcjtcbiAgaW5zdGFuY2UuY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhzdGF0ZSkpO1xuXG4gIHJldHVybiB1bndyYXBwZWREZWZpbml0aW9uO1xufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ3JlYXRlQ29tcG9uZW50LCAodm0sIHsgb3AxOiBmbGFncywgb3AyOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgaW5zdGFuY2UgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgeyBkZWZpbml0aW9uLCBtYW5hZ2VyIH0gPSBpbnN0YW5jZTtcblxuICBsZXQgY2FwYWJpbGl0aWVzID0gKGluc3RhbmNlLmNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdHlGbGFnc0Zyb20oXG4gICAgbWFuYWdlci5nZXRDYXBhYmlsaXRpZXMoZGVmaW5pdGlvbi5zdGF0ZSlcbiAgKSk7XG5cbiAgaWYgKCFtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuQ3JlYXRlSW5zdGFuY2UpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCVUdgKTtcbiAgfVxuXG4gIGxldCBkeW5hbWljU2NvcGU6IE9wdGlvbjxEeW5hbWljU2NvcGU+ID0gbnVsbDtcbiAgaWYgKG1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5EeW5hbWljU2NvcGUpKSB7XG4gICAgZHluYW1pY1Njb3BlID0gdm0uZHluYW1pY1Njb3BlKCk7XG4gIH1cblxuICBsZXQgaGFzRGVmYXVsdEJsb2NrID0gZmxhZ3MgJiAxO1xuICBsZXQgYXJnczogT3B0aW9uPFZNQXJndW1lbnRzPiA9IG51bGw7XG5cbiAgaWYgKG1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5DcmVhdGVBcmdzKSkge1xuICAgIGFyZ3MgPSBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrQXJndW1lbnRzKTtcbiAgfVxuXG4gIGxldCBzZWxmOiBPcHRpb248VmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPj4gPSBudWxsO1xuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkNyZWF0ZUNhbGxlcikpIHtcbiAgICBzZWxmID0gdm0uZ2V0U2VsZigpO1xuICB9XG5cbiAgbGV0IHN0YXRlID0gbWFuYWdlci5jcmVhdGUodm0uZW52LCBkZWZpbml0aW9uLnN0YXRlLCBhcmdzLCBkeW5hbWljU2NvcGUsIHNlbGYsICEhaGFzRGVmYXVsdEJsb2NrKTtcblxuICAvLyBXZSB3YW50IHRvIHJldXNlIHRoZSBgc3RhdGVgIFBPSk8gaGVyZSwgYmVjYXVzZSB3ZSBrbm93IHRoYXQgdGhlIG9wY29kZXNcbiAgLy8gb25seSB0cmFuc2l0aW9uIGF0IGV4YWN0bHkgb25lIHBsYWNlLlxuICBpbnN0YW5jZS5zdGF0ZSA9IHN0YXRlO1xuXG4gIGxldCB0YWcgPSBtYW5hZ2VyLmdldFRhZyhzdGF0ZSk7XG5cbiAgaWYgKG1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5VcGRhdGVIb29rKSAmJiAhaXNDb25zdFRhZyh0YWcpKSB7XG4gICAgdm0udXBkYXRlV2l0aChuZXcgVXBkYXRlQ29tcG9uZW50T3Bjb2RlKHRhZywgc3RhdGUsIG1hbmFnZXIsIGR5bmFtaWNTY29wZSkpO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlJlZ2lzdGVyQ29tcG9uZW50RGVzdHJ1Y3RvciwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgbWFuYWdlciwgc3RhdGUgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG5cbiAgbGV0IGQgPSBtYW5hZ2VyLmdldERlc3RydWN0b3Ioc3RhdGUpO1xuICBpZiAoZCkgdm0uYXNzb2NpYXRlRGVzdHJveWFibGUoZCk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkJlZ2luQ29tcG9uZW50VHJhbnNhY3Rpb24sIHZtID0+IHtcbiAgdm0uYmVnaW5DYWNoZUdyb3VwKCk7XG4gIHZtLmVsZW1lbnRzKCkucHVzaFNpbXBsZUJsb2NrKCk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1dENvbXBvbmVudE9wZXJhdGlvbnMsIHZtID0+IHtcbiAgdm0ubG9hZFZhbHVlKCR0MCwgbmV3IENvbXBvbmVudEVsZW1lbnRPcGVyYXRpb25zKCkpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Db21wb25lbnRBdHRyLCAodm0sIHsgb3AxOiBfbmFtZSwgb3AyOiB0cnVzdGluZywgb3AzOiBfbmFtZXNwYWNlIH0pID0+IHtcbiAgbGV0IG5hbWUgPSB2bVtDT05TVEFOVFNdLmdldFN0cmluZyhfbmFtZSk7XG4gIGxldCByZWZlcmVuY2UgPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuICBsZXQgbmFtZXNwYWNlID0gX25hbWVzcGFjZSA/IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lc3BhY2UpIDogbnVsbDtcblxuICBjaGVjayh2bS5mZXRjaFZhbHVlKCR0MCksIENoZWNrSW5zdGFuY2VvZihDb21wb25lbnRFbGVtZW50T3BlcmF0aW9ucykpLnNldEF0dHJpYnV0ZShcbiAgICBuYW1lLFxuICAgIHJlZmVyZW5jZSxcbiAgICAhIXRydXN0aW5nLFxuICAgIG5hbWVzcGFjZVxuICApO1xufSk7XG5cbmludGVyZmFjZSBEZWZlcnJlZEF0dHJpYnV0ZSB7XG4gIHZhbHVlOiBWZXJzaW9uZWRSZWZlcmVuY2U8dW5rbm93bj47XG4gIG5hbWVzcGFjZTogT3B0aW9uPHN0cmluZz47XG4gIHRydXN0aW5nOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RWxlbWVudE9wZXJhdGlvbnMgaW1wbGVtZW50cyBFbGVtZW50T3BlcmF0aW9ucyB7XG4gIHByaXZhdGUgYXR0cmlidXRlcyA9IGRpY3Q8RGVmZXJyZWRBdHRyaWJ1dGU+KCk7XG4gIHByaXZhdGUgY2xhc3NlczogVmVyc2lvbmVkUmVmZXJlbmNlPHVua25vd24+W10gPSBbXTtcbiAgcHJpdmF0ZSBtb2RpZmllcnM6IFtNb2RpZmllck1hbmFnZXI8dW5rbm93bj4sIHVua25vd25dW10gPSBbXTtcblxuICBzZXRBdHRyaWJ1dGUoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHZhbHVlOiBWZXJzaW9uZWRSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgdHJ1c3Rpbmc6IGJvb2xlYW4sXG4gICAgbmFtZXNwYWNlOiBPcHRpb248c3RyaW5nPlxuICApIHtcbiAgICBsZXQgZGVmZXJyZWQgPSB7IHZhbHVlLCBuYW1lc3BhY2UsIHRydXN0aW5nIH07XG5cbiAgICBpZiAobmFtZSA9PT0gJ2NsYXNzJykge1xuICAgICAgdGhpcy5jbGFzc2VzLnB1c2godmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuYXR0cmlidXRlc1tuYW1lXSA9IGRlZmVycmVkO1xuICB9XG5cbiAgYWRkTW9kaWZpZXI8Uz4obWFuYWdlcjogTW9kaWZpZXJNYW5hZ2VyPFM+LCBzdGF0ZTogUyk6IHZvaWQge1xuICAgIHRoaXMubW9kaWZpZXJzLnB1c2goW21hbmFnZXIsIHN0YXRlXSk7XG4gIH1cblxuICBmbHVzaCh2bTogSW50ZXJuYWxWTTxKaXRPckFvdEJsb2NrPik6IFtNb2RpZmllck1hbmFnZXI8dW5rbm93bj4sIHVua25vd25dW10ge1xuICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICBsZXQgYXR0ciA9IHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgIGxldCB7IHZhbHVlOiByZWZlcmVuY2UsIG5hbWVzcGFjZSwgdHJ1c3RpbmcgfSA9IGF0dHI7XG5cbiAgICAgIGlmIChuYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICAgIHJlZmVyZW5jZSA9IG5ldyBDbGFzc0xpc3RSZWZlcmVuY2UodGhpcy5jbGFzc2VzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgPT09ICd0eXBlJykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHZtXG4gICAgICAgIC5lbGVtZW50cygpXG4gICAgICAgIC5zZXREeW5hbWljQXR0cmlidXRlKG5hbWUsIHJlZmVyZW5jZS52YWx1ZSgpLCB0cnVzdGluZywgbmFtZXNwYWNlKTtcblxuICAgICAgaWYgKCFpc0NvbnN0KHJlZmVyZW5jZSkpIHtcbiAgICAgICAgdm0udXBkYXRlV2l0aChuZXcgVXBkYXRlRHluYW1pY0F0dHJpYnV0ZU9wY29kZShyZWZlcmVuY2UsIGF0dHJpYnV0ZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICgndHlwZScgaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICBsZXQgdHlwZSA9IHRoaXMuYXR0cmlidXRlcy50eXBlO1xuICAgICAgbGV0IHsgdmFsdWU6IHJlZmVyZW5jZSwgbmFtZXNwYWNlLCB0cnVzdGluZyB9ID0gdHlwZTtcblxuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHZtXG4gICAgICAgIC5lbGVtZW50cygpXG4gICAgICAgIC5zZXREeW5hbWljQXR0cmlidXRlKCd0eXBlJywgcmVmZXJlbmNlLnZhbHVlKCksIHRydXN0aW5nLCBuYW1lc3BhY2UpO1xuXG4gICAgICBpZiAoIWlzQ29uc3QocmVmZXJlbmNlKSkge1xuICAgICAgICB2bS51cGRhdGVXaXRoKG5ldyBVcGRhdGVEeW5hbWljQXR0cmlidXRlT3Bjb2RlKHJlZmVyZW5jZSwgYXR0cmlidXRlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubW9kaWZpZXJzO1xuICB9XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5EaWRDcmVhdGVFbGVtZW50LCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBkZWZpbml0aW9uLCBzdGF0ZSB9ID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgbWFuYWdlciB9ID0gZGVmaW5pdGlvbjtcblxuICBsZXQgb3BlcmF0aW9ucyA9IGNoZWNrKHZtLmZldGNoVmFsdWUoJHQwKSwgQ2hlY2tJbnN0YW5jZW9mKENvbXBvbmVudEVsZW1lbnRPcGVyYXRpb25zKSk7XG5cbiAgKG1hbmFnZXIgYXMgV2l0aEVsZW1lbnRIb29rPHVua25vd24+KS5kaWRDcmVhdGVFbGVtZW50KFxuICAgIHN0YXRlLFxuICAgIGV4cGVjdCh2bS5lbGVtZW50cygpLmNvbnN0cnVjdGluZywgYEV4cGVjdGVkIGEgY29uc3RydWN0aW5nIGVsZW1ldCBpbiBEaWRDcmVhdGVPcGNvZGVgKSxcbiAgICBvcGVyYXRpb25zXG4gICk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkdldENvbXBvbmVudFNlbGYsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IGRlZmluaXRpb24sIHN0YXRlIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuXG4gIHZtLnN0YWNrLnB1c2gobWFuYWdlci5nZXRTZWxmKHN0YXRlKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkdldENvbXBvbmVudFRhZ05hbWUsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IGRlZmluaXRpb24sIHN0YXRlIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuXG4gIHZtLnN0YWNrLnB1c2goXG4gICAgKG1hbmFnZXIgYXMgUmVjYXN0PEludGVybmFsQ29tcG9uZW50TWFuYWdlciwgV2l0aER5bmFtaWNUYWdOYW1lPHVua25vd24+PikuZ2V0VGFnTmFtZShzdGF0ZSlcbiAgKTtcbn0pO1xuXG4vLyBEeW5hbWljIEludm9jYXRpb24gT25seVxuQVBQRU5EX09QQ09ERVMuYWRkKFxuICBPcC5HZXRKaXRDb21wb25lbnRMYXlvdXQsXG4gICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gICAgbGV0IGluc3RhbmNlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcblxuICAgIGxldCBtYW5hZ2VyID0gaW5zdGFuY2UubWFuYWdlciBhcyBXaXRoSml0U3RhdGljTGF5b3V0IHwgV2l0aEppdER5bmFtaWNMYXlvdXQ7XG4gICAgbGV0IHsgZGVmaW5pdGlvbiB9ID0gaW5zdGFuY2U7XG4gICAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gICAgbGV0IHsgY2FwYWJpbGl0aWVzIH0gPSBpbnN0YW5jZTtcblxuICAgIC8vIGxldCBpbnZva2U6IHsgaGFuZGxlOiBudW1iZXI7IHN5bWJvbFRhYmxlOiBQcm9ncmFtU3ltYm9sVGFibGUgfTtcblxuICAgIGxldCBsYXlvdXQ6IENvbXBpbGFibGVUZW1wbGF0ZTtcblxuICAgIGlmIChoYXNTdGF0aWNMYXlvdXRDYXBhYmlsaXR5KGNhcGFiaWxpdGllcywgbWFuYWdlcikpIHtcbiAgICAgIGxheW91dCA9IG1hbmFnZXIuZ2V0Sml0U3RhdGljTGF5b3V0KGRlZmluaXRpb24uc3RhdGUsIHZtLnJ1bnRpbWUucmVzb2x2ZXIpO1xuICAgIH0gZWxzZSBpZiAoaGFzRHluYW1pY0xheW91dENhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBtYW5hZ2VyKSkge1xuICAgICAgbGV0IHRlbXBsYXRlID0gbWFuYWdlci5nZXRKaXREeW5hbWljTGF5b3V0KGluc3RhbmNlLnN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyLCB2bS5jb250ZXh0KTtcblxuICAgICAgaWYgKGhhc0NhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LldyYXBwZWQpKSB7XG4gICAgICAgIGxheW91dCA9IHRlbXBsYXRlLmFzV3JhcHBlZExheW91dCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGF5b3V0ID0gdGVtcGxhdGUuYXNMYXlvdXQoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlID0gbGF5b3V0LmNvbXBpbGUodm0uY29udGV4dCk7XG5cbiAgICBzdGFjay5wdXNoKGxheW91dC5zeW1ib2xUYWJsZSk7XG4gICAgc3RhY2sucHVzaChoYW5kbGUpO1xuICB9LFxuICAnaml0J1xuKTtcblxuLy8gRHluYW1pYyBJbnZvY2F0aW9uIE9ubHlcbkFQUEVORF9PUENPREVTLmFkZChPcC5HZXRBb3RDb21wb25lbnRMYXlvdXQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBpbnN0YW5jZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IG1hbmFnZXIsIGRlZmluaXRpb24gfSA9IGluc3RhbmNlO1xuICBsZXQgeyBzdGFjayB9ID0gdm07XG5cbiAgbGV0IHsgc3RhdGU6IGluc3RhbmNlU3RhdGUsIGNhcGFiaWxpdGllcyB9ID0gaW5zdGFuY2U7XG4gIGxldCB7IHN0YXRlOiBkZWZpbml0aW9uU3RhdGUgfSA9IGRlZmluaXRpb247XG5cbiAgbGV0IGludm9rZTogeyBoYW5kbGU6IG51bWJlcjsgc3ltYm9sVGFibGU6IFByb2dyYW1TeW1ib2xUYWJsZSB9O1xuXG4gIGlmIChoYXNTdGF0aWNMYXlvdXRDYXBhYmlsaXR5KGNhcGFiaWxpdGllcywgbWFuYWdlcikpIHtcbiAgICBpbnZva2UgPSAobWFuYWdlciBhcyBXaXRoQW90U3RhdGljTGF5b3V0PFxuICAgICAgQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgICAgIENvbXBvbmVudERlZmluaXRpb25TdGF0ZSxcbiAgICAgIFJ1bnRpbWVSZXNvbHZlckRlbGVnYXRlXG4gICAgPikuZ2V0QW90U3RhdGljTGF5b3V0KGRlZmluaXRpb25TdGF0ZSwgdm0ucnVudGltZS5yZXNvbHZlcik7XG4gIH0gZWxzZSBpZiAoaGFzRHluYW1pY0xheW91dENhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBtYW5hZ2VyKSkge1xuICAgIGludm9rZSA9IChtYW5hZ2VyIGFzIFdpdGhBb3REeW5hbWljTGF5b3V0PFxuICAgICAgQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgICAgIFJ1bnRpbWVSZXNvbHZlclxuICAgID4pLmdldEFvdER5bmFtaWNMYXlvdXQoaW5zdGFuY2VTdGF0ZSwgdm0ucnVudGltZS5yZXNvbHZlcik7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goaW52b2tlLnN5bWJvbFRhYmxlKTtcbiAgc3RhY2sucHVzaChpbnZva2UuaGFuZGxlKTtcbn0pO1xuXG4vLyBUaGVzZSB0eXBlcyBhcmUgYWJzdXJkIGhlcmVcbmV4cG9ydCBmdW5jdGlvbiBoYXNTdGF0aWNMYXlvdXRDYXBhYmlsaXR5KFxuICBjYXBhYmlsaXRpZXM6IENhcGFiaWxpdHksXG4gIF9tYW5hZ2VyOiBJbnRlcm5hbENvbXBvbmVudE1hbmFnZXJcbik6IF9tYW5hZ2VyIGlzXG4gIHwgV2l0aEppdFN0YXRpY0xheW91dDxDb21wb25lbnRJbnN0YW5jZVN0YXRlLCBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsIEppdFJ1bnRpbWVSZXNvbHZlcj5cbiAgfCBXaXRoQW90U3RhdGljTGF5b3V0PENvbXBvbmVudEluc3RhbmNlU3RhdGUsIENvbXBvbmVudERlZmluaXRpb25TdGF0ZSwgUnVudGltZVJlc29sdmVyPiB7XG4gIHJldHVybiBtYW5hZ2VySGFzQ2FwYWJpbGl0eShfbWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkR5bmFtaWNMYXlvdXQpID09PSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0ppdFN0YXRpY0xheW91dENhcGFiaWxpdHkoXG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eSxcbiAgX21hbmFnZXI6IEludGVybmFsQ29tcG9uZW50TWFuYWdlclxuKTogX21hbmFnZXIgaXMgV2l0aEppdFN0YXRpY0xheW91dDxcbiAgQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLFxuICBKaXRSdW50aW1lUmVzb2x2ZXJcbj4ge1xuICByZXR1cm4gbWFuYWdlckhhc0NhcGFiaWxpdHkoX21hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5EeW5hbWljTGF5b3V0KSA9PT0gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNEeW5hbWljTGF5b3V0Q2FwYWJpbGl0eShcbiAgY2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5LFxuICBfbWFuYWdlcjogSW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyXG4pOiBfbWFuYWdlciBpc1xuICB8IFdpdGhKaXREeW5hbWljTGF5b3V0PENvbXBvbmVudEluc3RhbmNlU3RhdGUsIEppdFJ1bnRpbWVSZXNvbHZlcj5cbiAgfCBXaXRoQW90RHluYW1pY0xheW91dDxDb21wb25lbnRJbnN0YW5jZVN0YXRlLCBSdW50aW1lUmVzb2x2ZXI+IHtcbiAgcmV0dXJuIG1hbmFnZXJIYXNDYXBhYmlsaXR5KF9tYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuRHluYW1pY0xheW91dCkgPT09IHRydWU7XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5NYWluLCAodm0sIHsgb3AxOiByZWdpc3RlciB9KSA9PiB7XG4gIGxldCBkZWZpbml0aW9uID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrQ29tcG9uZW50RGVmaW5pdGlvbik7XG4gIGxldCBpbnZvY2F0aW9uID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrSW52b2NhdGlvbik7XG5cbiAgbGV0IHsgbWFuYWdlciB9ID0gZGVmaW5pdGlvbjtcbiAgbGV0IGNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdHlGbGFnc0Zyb20obWFuYWdlci5nZXRDYXBhYmlsaXRpZXMoZGVmaW5pdGlvbi5zdGF0ZSkpO1xuXG4gIGxldCBzdGF0ZTogUG9wdWxhdGVkQ29tcG9uZW50SW5zdGFuY2UgPSB7XG4gICAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWUsXG4gICAgZGVmaW5pdGlvbixcbiAgICBtYW5hZ2VyLFxuICAgIGNhcGFiaWxpdGllcyxcbiAgICBzdGF0ZTogbnVsbCxcbiAgICBoYW5kbGU6IGludm9jYXRpb24uaGFuZGxlLFxuICAgIHRhYmxlOiBpbnZvY2F0aW9uLnN5bWJvbFRhYmxlLFxuICAgIGxvb2t1cDogbnVsbCxcbiAgfTtcblxuICB2bS5sb2FkVmFsdWUocmVnaXN0ZXIsIHN0YXRlKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUG9wdWxhdGVMYXlvdXQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IHN0YWNrIH0gPSB2bTtcblxuICBsZXQgaGFuZGxlID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrSGFuZGxlKTtcbiAgbGV0IHRhYmxlID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUHJvZ3JhbVN5bWJvbFRhYmxlKTtcblxuICBsZXQgc3RhdGUgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuXG4gIHN0YXRlLmhhbmRsZSA9IGhhbmRsZTtcbiAgc3RhdGUudGFibGUgPSB0YWJsZTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuVmlydHVhbFJvb3RTY29wZSwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgc3ltYm9scyB9ID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0ZpbmlzaGVkQ29tcG9uZW50SW5zdGFuY2UpLnRhYmxlO1xuXG4gIHZtLnB1c2hSb290U2NvcGUoc3ltYm9scy5sZW5ndGggKyAxKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuU2V0dXBGb3JFdmFsLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgc3RhdGUgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSk7XG5cbiAgaWYgKHN0YXRlLnRhYmxlLmhhc0V2YWwpIHtcbiAgICBsZXQgbG9va3VwID0gKHN0YXRlLmxvb2t1cCA9IGRpY3Q8U2NvcGVTbG90PEppdE9yQW90QmxvY2s+PigpKTtcbiAgICB2bS5zY29wZSgpLmJpbmRFdmFsU2NvcGUobG9va3VwKTtcbiAgfVxufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXROYW1lZFZhcmlhYmxlcywgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHN0YXRlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0ZpbmlzaGVkQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgc2NvcGUgPSB2bS5zY29wZSgpO1xuXG4gIGxldCBhcmdzID0gY2hlY2sodm0uc3RhY2sucGVlaygpLCBDaGVja0FyZ3VtZW50cyk7XG4gIGxldCBjYWxsZXJOYW1lcyA9IGFyZ3MubmFtZWQuYXROYW1lcztcblxuICBmb3IgKGxldCBpID0gY2FsbGVyTmFtZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBsZXQgYXROYW1lID0gY2FsbGVyTmFtZXNbaV07XG4gICAgbGV0IHN5bWJvbCA9IHN0YXRlLnRhYmxlLnN5bWJvbHMuaW5kZXhPZihjYWxsZXJOYW1lc1tpXSk7XG4gICAgbGV0IHZhbHVlID0gYXJncy5uYW1lZC5nZXQoYXROYW1lLCB0cnVlKTtcblxuICAgIGlmIChzeW1ib2wgIT09IC0xKSBzY29wZS5iaW5kU3ltYm9sKHN5bWJvbCArIDEsIHZhbHVlKTtcbiAgICBpZiAoc3RhdGUubG9va3VwKSBzdGF0ZS5sb29rdXBbYXROYW1lXSA9IHZhbHVlO1xuICB9XG59KTtcblxuZnVuY3Rpb24gYmluZEJsb2NrPEMgZXh0ZW5kcyBKaXRPckFvdEJsb2NrPihcbiAgc3ltYm9sTmFtZTogc3RyaW5nLFxuICBibG9ja05hbWU6IHN0cmluZyxcbiAgc3RhdGU6IENvbXBvbmVudEluc3RhbmNlLFxuICBibG9ja3M6IEJsb2NrQXJndW1lbnRzSW1wbDxDPixcbiAgdm06IEludGVybmFsVk08Qz5cbikge1xuICBsZXQgc3ltYm9sID0gc3RhdGUudGFibGUuc3ltYm9scy5pbmRleE9mKHN5bWJvbE5hbWUpO1xuXG4gIGxldCBibG9jayA9IGJsb2Nrcy5nZXQoYmxvY2tOYW1lKTtcblxuICBpZiAoc3ltYm9sICE9PSAtMSkge1xuICAgIHZtLnNjb3BlKCkuYmluZEJsb2NrKHN5bWJvbCArIDEsIGJsb2NrKTtcbiAgfVxuXG4gIGlmIChzdGF0ZS5sb29rdXApIHN0YXRlLmxvb2t1cFtzeW1ib2xOYW1lXSA9IGJsb2NrO1xufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuU2V0QmxvY2tzLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgc3RhdGUgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IGJsb2NrcyB9ID0gY2hlY2sodm0uc3RhY2sucGVlaygpLCBDaGVja0FyZ3VtZW50cyk7XG5cbiAgYmluZEJsb2NrKCcmYXR0cnMnLCAnYXR0cnMnLCBzdGF0ZSwgYmxvY2tzLCB2bSk7XG4gIGJpbmRCbG9jaygnJmVsc2UnLCAnZWxzZScsIHN0YXRlLCBibG9ja3MsIHZtKTtcbiAgYmluZEJsb2NrKCcmZGVmYXVsdCcsICdtYWluJywgc3RhdGUsIGJsb2Nrcywgdm0pO1xufSk7XG5cbi8vIER5bmFtaWMgSW52b2NhdGlvbiBPbmx5XG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuSW52b2tlQ29tcG9uZW50TGF5b3V0LCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgc3RhdGUgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSk7XG5cbiAgdm0uY2FsbChzdGF0ZS5oYW5kbGUhKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRGlkUmVuZGVyTGF5b3V0LCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBtYW5hZ2VyLCBzdGF0ZSwgY2FwYWJpbGl0aWVzIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgYm91bmRzID0gdm0uZWxlbWVudHMoKS5wb3BCbG9jaygpO1xuXG4gIGlmICghbWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkNyZWF0ZUluc3RhbmNlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQlVHYCk7XG4gIH1cblxuICBsZXQgbWdyID0gY2hlY2sobWFuYWdlciwgQ2hlY2tJbnRlcmZhY2UoeyBkaWRSZW5kZXJMYXlvdXQ6IENoZWNrRnVuY3Rpb24gfSkpO1xuXG4gIG1nci5kaWRSZW5kZXJMYXlvdXQoc3RhdGUsIGJvdW5kcyk7XG5cbiAgdm0uZW52LmRpZENyZWF0ZShzdGF0ZSwgbWFuYWdlcik7XG5cbiAgdm0udXBkYXRlV2l0aChuZXcgRGlkVXBkYXRlTGF5b3V0T3Bjb2RlKG1hbmFnZXIsIHN0YXRlLCBib3VuZHMpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ29tbWl0Q29tcG9uZW50VHJhbnNhY3Rpb24sIHZtID0+IHtcbiAgdm0uY29tbWl0Q2FjaGVHcm91cCgpO1xufSk7XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVDb21wb25lbnRPcGNvZGUgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ3VwZGF0ZS1jb21wb25lbnQnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB0YWc6IFRhZyxcbiAgICBwcml2YXRlIGNvbXBvbmVudDogQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgICBwcml2YXRlIG1hbmFnZXI6IFdpdGhVcGRhdGVIb29rLFxuICAgIHByaXZhdGUgZHluYW1pY1Njb3BlOiBPcHRpb248RHluYW1pY1Njb3BlPlxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZXZhbHVhdGUoX3ZtOiBVcGRhdGluZ1ZNKSB7XG4gICAgbGV0IHsgY29tcG9uZW50LCBtYW5hZ2VyLCBkeW5hbWljU2NvcGUgfSA9IHRoaXM7XG5cbiAgICBtYW5hZ2VyLnVwZGF0ZShjb21wb25lbnQsIGR5bmFtaWNTY29wZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERpZFVwZGF0ZUxheW91dE9wY29kZSBleHRlbmRzIFVwZGF0aW5nT3Bjb2RlIHtcbiAgcHVibGljIHR5cGUgPSAnZGlkLXVwZGF0ZS1sYXlvdXQnO1xuICBwdWJsaWMgdGFnOiBUYWcgPSBDT05TVEFOVF9UQUc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBtYW5hZ2VyOiBXaXRoQ3JlYXRlSW5zdGFuY2UsXG4gICAgcHJpdmF0ZSBjb21wb25lbnQ6IENvbXBvbmVudEluc3RhbmNlU3RhdGUsXG4gICAgcHJpdmF0ZSBib3VuZHM6IEJvdW5kc1xuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZXZhbHVhdGUodm06IFVwZGF0aW5nVk0pIHtcbiAgICBsZXQgeyBtYW5hZ2VyLCBjb21wb25lbnQsIGJvdW5kcyB9ID0gdGhpcztcblxuICAgIG1hbmFnZXIuZGlkVXBkYXRlTGF5b3V0KGNvbXBvbmVudCwgYm91bmRzKTtcblxuICAgIHZtLmVudi5kaWRVcGRhdGUoY29tcG9uZW50LCBtYW5hZ2VyKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==