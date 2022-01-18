function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { CONSTANT_TAG, isConst, isConstTag } from '@glimmer/reference';
import { assert, dict, unreachable } from '@glimmer/util';
import { $t0, $t1, $v0 } from '@glimmer/vm';
import { capabilityFlagsFrom, managerHasCapability, hasCapability } from '../../capabilities';
import { isCurriedComponentDefinition } from '../../component/curried-component';
import { resolveComponent } from '../../component/resolve';
import { APPEND_OPCODES, UpdatingOpcode } from '../../opcodes';
import ClassListReference from '../../references/class-list';
import CurryComponentReference from '../../references/curry-component';
import { ARGS, CONSTANTS } from '../../symbols';

import { ContentTypeReference } from './content';
import { UpdateDynamicAttributeOpcode } from './dom';
import { ConditionalReference } from '../../references';
/**
 * The VM creates a new ComponentInstance data structure for every component
 * invocation it encounters.
 *
 * Similar to how a ComponentDefinition contains state about all components of a
 * particular type, a ComponentInstance contains state specific to a particular
 * instance of a component type. It also contains a pointer back to its
 * component type's ComponentDefinition.
 */
export var COMPONENT_INSTANCE = 'COMPONENT_INSTANCE [c56c57de-e73a-4ef0-b137-07661da17029]';
APPEND_OPCODES.add(76 /* IsComponent */, function (vm) {
    var stack = vm.stack;
    var ref = stack.pop();
    stack.push(new ConditionalReference(ref, isCurriedComponentDefinition));
});
APPEND_OPCODES.add(77 /* ContentType */, function (vm) {
    var stack = vm.stack;
    var ref = stack.peek();
    stack.push(new ContentTypeReference(ref));
});
APPEND_OPCODES.add(78 /* CurryComponent */, function (vm, _ref) {
    var _meta = _ref.op1;

    var stack = vm.stack;
    var definition = stack.pop();
    var capturedArgs = stack.pop();
    var meta = vm[CONSTANTS].getTemplateMeta(_meta);
    var resolver = vm.runtime.resolver;
    vm.loadValue($v0, new CurryComponentReference(definition, resolver, meta, capturedArgs));
    // expectStackChange(vm.stack, -args.length - 1, 'CurryComponent');
});
APPEND_OPCODES.add(79 /* PushComponentDefinition */, function (vm, _ref2) {
    var _instance;

    var handle = _ref2.op1;

    var definition = vm.runtime.resolver.resolve(handle);
    false && assert(!!definition, 'Missing component for ' + handle);

    var manager = definition.manager;

    var capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    var instance = (_instance = {}, _instance[COMPONENT_INSTANCE] = true, _instance.definition = definition, _instance.manager = manager, _instance.capabilities = capabilities, _instance.state = null, _instance.handle = null, _instance.table = null, _instance.lookup = null, _instance);
    vm.stack.push(instance);
});
APPEND_OPCODES.add(82 /* ResolveDynamicComponent */, function (vm, _ref3) {
    var _meta = _ref3.op1;

    var stack = vm.stack;
    var component = stack.pop().value();
    var meta = vm[CONSTANTS].getTemplateMeta(_meta);
    vm.loadValue($t1, null); // Clear the temp register
    var definition = void 0;
    if (typeof component === 'string') {
        var resolvedDefinition = resolveComponent(vm.runtime.resolver, component, meta);
        definition = resolvedDefinition;
    } else if (isCurriedComponentDefinition(component)) {
        definition = component;
    } else {
        throw unreachable();
    }
    stack.push(definition);
});
APPEND_OPCODES.add(80 /* PushDynamicComponentInstance */, function (vm) {
    var stack = vm.stack;

    var definition = stack.pop();
    var capabilities = void 0,
        manager = void 0;
    if (isCurriedComponentDefinition(definition)) {
        manager = capabilities = null;
    } else {
        manager = definition.manager;
        capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    }
    stack.push({ definition: definition, capabilities: capabilities, manager: manager, state: null, handle: null, table: null });
});
APPEND_OPCODES.add(81 /* PushCurriedComponent */, function (vm) {
    var stack = vm.stack;
    var component = stack.pop().value();
    var definition = void 0;
    if (isCurriedComponentDefinition(component)) {
        definition = component;
    } else {
        throw unreachable();
    }
    stack.push(definition);
});
APPEND_OPCODES.add(83 /* PushArgs */, function (vm, _ref4) {
    var _names = _ref4.op1,
        flags = _ref4.op2;

    var stack = vm.stack;
    var names = vm[CONSTANTS].getStringArray(_names);
    var positionalCount = flags >> 4;
    var atNames = flags & 8;
    var blockNames = [];
    if (flags & 4) blockNames.push('main');
    if (flags & 2) blockNames.push('else');
    if (flags & 1) blockNames.push('attrs');
    vm[ARGS].setup(stack, names, blockNames, positionalCount, !!atNames);
    stack.push(vm[ARGS]);
});
APPEND_OPCODES.add(84 /* PushEmptyArgs */, function (vm) {
    var stack = vm.stack;

    stack.push(vm[ARGS].empty(stack));
});
APPEND_OPCODES.add(87 /* CaptureArgs */, function (vm) {
    var stack = vm.stack;
    var args = stack.pop();
    var capturedArgs = args.capture();
    stack.push(capturedArgs);
});
APPEND_OPCODES.add(86 /* PrepareArgs */, function (vm, _ref5) {
    var _state = _ref5.op1;

    var stack = vm.stack;
    var instance = vm.fetchValue(_state);
    var args = stack.pop();
    var definition = instance.definition;

    if (isCurriedComponentDefinition(definition)) {
        false && assert(!definition.manager, "If the component definition was curried, we don't yet have a manager");

        definition = resolveCurriedComponentDefinition(instance, definition, args);
    }
    var _definition = definition,
        manager = _definition.manager,
        state = _definition.state;

    var capabilities = instance.capabilities;
    if (!managerHasCapability(manager, capabilities, 4 /* PrepareArgs */)) {
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

    false && assert(instance.manager === null, 'component instance manager should not be populated yet');
    false && assert(instance.capabilities === null, 'component instance manager should not be populated yet');

    instance.manager = manager;
    instance.capabilities = capabilityFlagsFrom(manager.getCapabilities(state));
    return unwrappedDefinition;
}
APPEND_OPCODES.add(88 /* CreateComponent */, function (vm, _ref6) {
    var flags = _ref6.op1,
        _state = _ref6.op2;

    var instance = vm.fetchValue(_state);
    var definition = instance.definition,
        manager = instance.manager;

    var capabilities = instance.capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    if (!managerHasCapability(manager, capabilities, 512 /* CreateInstance */)) {
        throw new Error('BUG');
    }
    var dynamicScope = null;
    if (managerHasCapability(manager, capabilities, 64 /* DynamicScope */)) {
        dynamicScope = vm.dynamicScope();
    }
    var hasDefaultBlock = flags & 1;
    var args = null;
    if (managerHasCapability(manager, capabilities, 8 /* CreateArgs */)) {
        args = vm.stack.peek();
    }
    var self = null;
    if (managerHasCapability(manager, capabilities, 128 /* CreateCaller */)) {
        self = vm.getSelf();
    }
    var state = manager.create(vm.env, definition.state, args, dynamicScope, self, !!hasDefaultBlock);
    // We want to reuse the `state` POJO here, because we know that the opcodes
    // only transition at exactly one place.
    instance.state = state;
    var tag = manager.getTag(state);
    if (managerHasCapability(manager, capabilities, 256 /* UpdateHook */) && !isConstTag(tag)) {
        vm.updateWith(new UpdateComponentOpcode(tag, state, manager, dynamicScope));
    }
});
APPEND_OPCODES.add(89 /* RegisterComponentDestructor */, function (vm, _ref7) {
    var _state = _ref7.op1;

    var _vm$fetchValue = vm.fetchValue(_state),
        manager = _vm$fetchValue.manager,
        state = _vm$fetchValue.state;

    var d = manager.getDestructor(state);
    if (d) vm.associateDestroyable(d);
});
APPEND_OPCODES.add(99 /* BeginComponentTransaction */, function (vm) {
    vm.beginCacheGroup();
    vm.elements().pushSimpleBlock();
});
APPEND_OPCODES.add(90 /* PutComponentOperations */, function (vm) {
    vm.loadValue($t0, new ComponentElementOperations());
});
APPEND_OPCODES.add(52 /* ComponentAttr */, function (vm, _ref8) {
    var _name = _ref8.op1,
        trusting = _ref8.op2,
        _namespace = _ref8.op3;

    var name = vm[CONSTANTS].getString(_name);
    var reference = vm.stack.pop();
    var namespace = _namespace ? vm[CONSTANTS].getString(_namespace) : null;
    vm.fetchValue($t0).setAttribute(name, reference, !!trusting, namespace);
});
export var ComponentElementOperations = function () {
    function ComponentElementOperations() {
        _classCallCheck(this, ComponentElementOperations);

        this.attributes = dict();
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
                reference = new ClassListReference(this.classes);
            }
            if (name === 'type') {
                continue;
            }
            var attribute = vm.elements().setDynamicAttribute(name, reference.value(), trusting, namespace);
            if (!isConst(reference)) {
                vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
            }
        }
        if ('type' in this.attributes) {
            var type = this.attributes.type;
            var _reference = type.value,
                _namespace2 = type.namespace,
                _trusting = type.trusting;

            var _attribute = vm.elements().setDynamicAttribute('type', _reference.value(), _trusting, _namespace2);
            if (!isConst(_reference)) {
                vm.updateWith(new UpdateDynamicAttributeOpcode(_reference, _attribute));
            }
        }
        return this.modifiers;
    };

    return ComponentElementOperations;
}();
APPEND_OPCODES.add(101 /* DidCreateElement */, function (vm, _ref9) {
    var _state = _ref9.op1;

    var _vm$fetchValue2 = vm.fetchValue(_state),
        definition = _vm$fetchValue2.definition,
        state = _vm$fetchValue2.state;

    var manager = definition.manager;

    var operations = vm.fetchValue($t0);
    manager.didCreateElement(state, vm.elements().constructing, operations);
});
APPEND_OPCODES.add(91 /* GetComponentSelf */, function (vm, _ref10) {
    var _state = _ref10.op1;

    var _vm$fetchValue3 = vm.fetchValue(_state),
        definition = _vm$fetchValue3.definition,
        state = _vm$fetchValue3.state;

    var manager = definition.manager;

    vm.stack.push(manager.getSelf(state));
});
APPEND_OPCODES.add(92 /* GetComponentTagName */, function (vm, _ref11) {
    var _state = _ref11.op1;

    var _vm$fetchValue4 = vm.fetchValue(_state),
        definition = _vm$fetchValue4.definition,
        state = _vm$fetchValue4.state;

    var manager = definition.manager;

    vm.stack.push(manager.getTagName(state));
});
// Dynamic Invocation Only
APPEND_OPCODES.add(94 /* GetJitComponentLayout */, function (vm, _ref12) {
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
        if (hasCapability(capabilities, 1024 /* Wrapped */)) {
            layout = template.asWrappedLayout();
        } else {
            layout = template.asLayout();
        }
    } else {
        throw unreachable();
    }
    var handle = layout.compile(vm.context);
    stack.push(layout.symbolTable);
    stack.push(handle);
}, 'jit');
// Dynamic Invocation Only
APPEND_OPCODES.add(93 /* GetAotComponentLayout */, function (vm, _ref13) {
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
        throw unreachable();
    }
    stack.push(invoke.symbolTable);
    stack.push(invoke.handle);
});
// These types are absurd here
export function hasStaticLayoutCapability(capabilities, _manager) {
    return managerHasCapability(_manager, capabilities, 1 /* DynamicLayout */) === false;
}
export function hasJitStaticLayoutCapability(capabilities, _manager) {
    return managerHasCapability(_manager, capabilities, 1 /* DynamicLayout */) === false;
}
export function hasDynamicLayoutCapability(capabilities, _manager) {
    return managerHasCapability(_manager, capabilities, 1 /* DynamicLayout */) === true;
}
APPEND_OPCODES.add(75 /* Main */, function (vm, _ref14) {
    var _state2;

    var register = _ref14.op1;

    var definition = vm.stack.pop();
    var invocation = vm.stack.pop();
    var manager = definition.manager;

    var capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    var state = (_state2 = {}, _state2[COMPONENT_INSTANCE] = true, _state2.definition = definition, _state2.manager = manager, _state2.capabilities = capabilities, _state2.state = null, _state2.handle = invocation.handle, _state2.table = invocation.symbolTable, _state2.lookup = null, _state2);
    vm.loadValue(register, state);
});
APPEND_OPCODES.add(97 /* PopulateLayout */, function (vm, _ref15) {
    var _state = _ref15.op1;
    var stack = vm.stack;

    var handle = stack.pop();
    var table = stack.pop();
    var state = vm.fetchValue(_state);
    state.handle = handle;
    state.table = table;
});
APPEND_OPCODES.add(37 /* VirtualRootScope */, function (vm, _ref16) {
    var _state = _ref16.op1;
    var symbols = vm.fetchValue(_state).table.symbols;

    vm.pushRootScope(symbols.length + 1);
});
APPEND_OPCODES.add(96 /* SetupForEval */, function (vm, _ref17) {
    var _state = _ref17.op1;

    var state = vm.fetchValue(_state);
    if (state.table.hasEval) {
        var lookup = state.lookup = dict();
        vm.scope().bindEvalScope(lookup);
    }
});
APPEND_OPCODES.add(17 /* SetNamedVariables */, function (vm, _ref18) {
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
APPEND_OPCODES.add(18 /* SetBlocks */, function (vm, _ref19) {
    var _state = _ref19.op1;

    var state = vm.fetchValue(_state);

    var _vm$stack$peek = vm.stack.peek(),
        blocks = _vm$stack$peek.blocks;

    bindBlock('&attrs', 'attrs', state, blocks, vm);
    bindBlock('&else', 'else', state, blocks, vm);
    bindBlock('&default', 'main', state, blocks, vm);
});
// Dynamic Invocation Only
APPEND_OPCODES.add(98 /* InvokeComponentLayout */, function (vm, _ref20) {
    var _state = _ref20.op1;

    var state = vm.fetchValue(_state);
    vm.call(state.handle);
});
APPEND_OPCODES.add(102 /* DidRenderLayout */, function (vm, _ref21) {
    var _state = _ref21.op1;

    var _vm$fetchValue5 = vm.fetchValue(_state),
        manager = _vm$fetchValue5.manager,
        state = _vm$fetchValue5.state,
        capabilities = _vm$fetchValue5.capabilities;

    var bounds = vm.elements().popBlock();
    if (!managerHasCapability(manager, capabilities, 512 /* CreateInstance */)) {
        throw new Error('BUG');
    }
    var mgr = manager;
    mgr.didRenderLayout(state, bounds);
    vm.env.didCreate(state, manager);
    vm.updateWith(new DidUpdateLayoutOpcode(manager, state, bounds));
});
APPEND_OPCODES.add(100 /* CommitComponentTransaction */, function (vm) {
    vm.commitCacheGroup();
});
export var UpdateComponentOpcode = function (_UpdatingOpcode) {
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
}(UpdatingOpcode);
export var DidUpdateLayoutOpcode = function (_UpdatingOpcode2) {
    _inherits(DidUpdateLayoutOpcode, _UpdatingOpcode2);

    function DidUpdateLayoutOpcode(manager, component, bounds) {
        _classCallCheck(this, DidUpdateLayoutOpcode);

        var _this2 = _possibleConstructorReturn(this, _UpdatingOpcode2.call(this));

        _this2.manager = manager;
        _this2.component = component;
        _this2.bounds = bounds;
        _this2.type = 'did-update-layout';
        _this2.tag = CONSTANT_TAG;
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
}(UpdatingOpcode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBdUNBLFNBQUEsWUFBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLFFBQUEsb0JBQUE7QUFRQSxTQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxRQUFBLGVBQUE7QUFDQSxTQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxRQUFBLGFBQUE7QUFDQSxTQUFBLG1CQUFBLEVBQUEsb0JBQUEsRUFBQSxhQUFBLFFBQUEsb0JBQUE7QUFNQSxTQUFBLDRCQUFBLFFBQUEsbUNBQUE7QUFJQSxTQUFBLGdCQUFBLFFBQUEseUJBQUE7QUFDQSxTQUFBLGNBQUEsRUFBQSxjQUFBLFFBQUEsZUFBQTtBQUNBLE9BQUEsa0JBQUEsTUFBQSw2QkFBQTtBQUNBLE9BQUEsdUJBQUEsTUFBQSxrQ0FBQTtBQUNBLFNBQUEsSUFBQSxFQUFBLFNBQUEsUUFBQSxlQUFBOztBQWNBLFNBQUEsb0JBQUEsUUFBQSxXQUFBO0FBQ0EsU0FBQSw0QkFBQSxRQUFBLE9BQUE7QUFDQSxTQUFBLG9CQUFBLFFBQUEsa0JBQUE7QUFFQTs7Ozs7Ozs7O0FBVUEsT0FBTyxJQUFNLHFCQUFOLDJEQUFBO0FBd0NQLGVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxpQkFBQSxFQUFtQyxjQUFLO0FBQ3RDLFFBQUksUUFBUSxHQUFaLEtBQUE7QUFDQSxRQUFJLE1BQVksTUFBaEIsR0FBZ0IsRUFBaEI7QUFFQSxVQUFBLElBQUEsQ0FBVyxJQUFBLG9CQUFBLENBQUEsR0FBQSxFQUFYLDRCQUFXLENBQVg7QUFKRixDQUFBO0FBT0EsZUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLEVBQW1DLGNBQUs7QUFDdEMsUUFBSSxRQUFRLEdBQVosS0FBQTtBQUNBLFFBQUksTUFBWSxNQUFoQixJQUFnQixFQUFoQjtB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QUFBLFlBQUE7QUFLaUI7QUFHdkI7O0FBVkgsb0NBWUUsUUFaRixxQkFZRSxFQVpGLEVBWXlCO0FBQUEsWUFDakIsT0FEaUIsR0FDckIsSUFEcUIsQ0FDakIsT0FEaUI7QUFBQSxZQUNqQixTQURpQixHQUNyQixJQURxQixDQUNqQixTQURpQjtBQUFBLFlBQ2pCLE1BRGlCLEdBQ3JCLElBRHFCLENBQ2pCLE1BRGlCOztBQUdyQixnQkFBQSxlQUFBLENBQUEsU0FBQSxFQUFBLE1BQUE7QUFFQSxXQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxFQUFBLE9BQUE7QUFDRCxLQWxCSDs7QUFBQTtBQUFBLEVBQU0sY0FBTiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGNoZWNrLFxuICBDaGVja0Z1bmN0aW9uLFxuICBDaGVja0hhbmRsZSxcbiAgQ2hlY2tJbnN0YW5jZW9mLFxuICBDaGVja0ludGVyZmFjZSxcbiAgQ2hlY2tQcm9ncmFtU3ltYm9sVGFibGUsXG59IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcbmltcG9ydCB7XG4gIEJvdW5kcyxcbiAgQ29tcGlsYWJsZVRlbXBsYXRlLFxuICBDb21wb25lbnREZWZpbml0aW9uLFxuICBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gIENvbXBvbmVudEluc3RhbmNlU3RhdGUsXG4gIENvbXBvbmVudE1hbmFnZXIsXG4gIERpY3QsXG4gIER5bmFtaWNTY29wZSxcbiAgRWxlbWVudE9wZXJhdGlvbnMsXG4gIEludGVybmFsQ29tcG9uZW50TWFuYWdlcixcbiAgSml0T3JBb3RCbG9jayxcbiAgTWF5YmUsXG4gIE9wLFxuICBQcm9ncmFtU3ltYm9sVGFibGUsXG4gIFJlY2FzdCxcbiAgUnVudGltZVJlc29sdmVyRGVsZWdhdGUsXG4gIFNjb3BlU2xvdCxcbiAgVk1Bcmd1bWVudHMsXG4gIFdpdGhBb3REeW5hbWljTGF5b3V0LFxuICBXaXRoQW90U3RhdGljTGF5b3V0LFxuICBXaXRoRHluYW1pY1RhZ05hbWUsXG4gIFdpdGhFbGVtZW50SG9vayxcbiAgV2l0aEppdER5bmFtaWNMYXlvdXQsXG4gIFdpdGhKaXRTdGF0aWNMYXlvdXQsXG4gIFdpdGhVcGRhdGVIb29rLFxuICBXaXRoQ3JlYXRlSW5zdGFuY2UsXG4gIEppdFJ1bnRpbWVSZXNvbHZlcixcbiAgUnVudGltZVJlc29sdmVyLFxuICBNb2RpZmllck1hbmFnZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgQ09OU1RBTlRfVEFHLFxuICBpc0NvbnN0LFxuICBpc0NvbnN0VGFnLFxuICBUYWcsXG4gIFZlcnNpb25lZFBhdGhSZWZlcmVuY2UsXG4gIFZlcnNpb25lZFJlZmVyZW5jZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGFzc2VydCwgZGljdCwgZXhwZWN0LCBPcHRpb24sIHVucmVhY2hhYmxlIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyAkdDAsICR0MSwgJHYwIH0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHtcbiAgQ2FwYWJpbGl0eSxcbiAgY2FwYWJpbGl0eUZsYWdzRnJvbSxcbiAgbWFuYWdlckhhc0NhcGFiaWxpdHksXG4gIGhhc0NhcGFiaWxpdHksXG59IGZyb20gJy4uLy4uL2NhcGFiaWxpdGllcyc7XG5pbXBvcnQge1xuICBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2N1cnJpZWQtY29tcG9uZW50JztcbmltcG9ydCB7IHJlc29sdmVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvcmVzb2x2ZSc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUywgVXBkYXRpbmdPcGNvZGUgfSBmcm9tICcuLi8uLi9vcGNvZGVzJztcbmltcG9ydCBDbGFzc0xpc3RSZWZlcmVuY2UgZnJvbSAnLi4vLi4vcmVmZXJlbmNlcy9jbGFzcy1saXN0JztcbmltcG9ydCBDdXJyeUNvbXBvbmVudFJlZmVyZW5jZSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzL2N1cnJ5LWNvbXBvbmVudCc7XG5pbXBvcnQgeyBBUkdTLCBDT05TVEFOVFMgfSBmcm9tICcuLi8uLi9zeW1ib2xzJztcbmltcG9ydCB7IFVwZGF0aW5nVk0gfSBmcm9tICcuLi8uLi92bSc7XG5pbXBvcnQgeyBJbnRlcm5hbFZNIH0gZnJvbSAnLi4vLi4vdm0vYXBwZW5kJztcbmltcG9ydCB7IEJsb2NrQXJndW1lbnRzSW1wbCwgVk1Bcmd1bWVudHNJbXBsIH0gZnJvbSAnLi4vLi4vdm0vYXJndW1lbnRzJztcbmltcG9ydCB7XG4gIENoZWNrQXJndW1lbnRzLFxuICBDaGVja0NhcHR1cmVkQXJndW1lbnRzLFxuICBDaGVja0NvbXBvbmVudERlZmluaXRpb24sXG4gIENoZWNrQ29tcG9uZW50SW5zdGFuY2UsXG4gIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSxcbiAgQ2hlY2tJbnZvY2F0aW9uLFxuICBDaGVja1BhdGhSZWZlcmVuY2UsXG4gIENoZWNrUmVmZXJlbmNlLFxufSBmcm9tICcuLy1kZWJ1Zy1zdHJpcCc7XG5pbXBvcnQgeyBDb250ZW50VHlwZVJlZmVyZW5jZSB9IGZyb20gJy4vY29udGVudCc7XG5pbXBvcnQgeyBVcGRhdGVEeW5hbWljQXR0cmlidXRlT3Bjb2RlIH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHsgQ29uZGl0aW9uYWxSZWZlcmVuY2UgfSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzJztcblxuLyoqXG4gKiBUaGUgVk0gY3JlYXRlcyBhIG5ldyBDb21wb25lbnRJbnN0YW5jZSBkYXRhIHN0cnVjdHVyZSBmb3IgZXZlcnkgY29tcG9uZW50XG4gKiBpbnZvY2F0aW9uIGl0IGVuY291bnRlcnMuXG4gKlxuICogU2ltaWxhciB0byBob3cgYSBDb21wb25lbnREZWZpbml0aW9uIGNvbnRhaW5zIHN0YXRlIGFib3V0IGFsbCBjb21wb25lbnRzIG9mIGFcbiAqIHBhcnRpY3VsYXIgdHlwZSwgYSBDb21wb25lbnRJbnN0YW5jZSBjb250YWlucyBzdGF0ZSBzcGVjaWZpYyB0byBhIHBhcnRpY3VsYXJcbiAqIGluc3RhbmNlIG9mIGEgY29tcG9uZW50IHR5cGUuIEl0IGFsc28gY29udGFpbnMgYSBwb2ludGVyIGJhY2sgdG8gaXRzXG4gKiBjb21wb25lbnQgdHlwZSdzIENvbXBvbmVudERlZmluaXRpb24uXG4gKi9cblxuZXhwb3J0IGNvbnN0IENPTVBPTkVOVF9JTlNUQU5DRSA9ICdDT01QT05FTlRfSU5TVEFOQ0UgW2M1NmM1N2RlLWU3M2EtNGVmMC1iMTM3LTA3NjYxZGExNzAyOV0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEluc3RhbmNlIHtcbiAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWU7XG4gIGRlZmluaXRpb246IENvbXBvbmVudERlZmluaXRpb247XG4gIG1hbmFnZXI6IENvbXBvbmVudE1hbmFnZXI7XG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eTtcbiAgc3RhdGU6IENvbXBvbmVudEluc3RhbmNlU3RhdGU7XG4gIGhhbmRsZTogbnVtYmVyO1xuICB0YWJsZTogUHJvZ3JhbVN5bWJvbFRhYmxlO1xuICBsb29rdXA6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxKaXRPckFvdEJsb2NrPj4+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluaXRpYWxDb21wb25lbnRJbnN0YW5jZSB7XG4gIFtDT01QT05FTlRfSU5TVEFOQ0VdOiB0cnVlO1xuICBkZWZpbml0aW9uOiBQYXJ0aWFsQ29tcG9uZW50RGVmaW5pdGlvbjtcbiAgbWFuYWdlcjogT3B0aW9uPEludGVybmFsQ29tcG9uZW50TWFuYWdlcj47XG4gIGNhcGFiaWxpdGllczogT3B0aW9uPENhcGFiaWxpdHk+O1xuICBzdGF0ZTogbnVsbDtcbiAgaGFuZGxlOiBPcHRpb248bnVtYmVyPjtcbiAgdGFibGU6IE9wdGlvbjxQcm9ncmFtU3ltYm9sVGFibGU+O1xuICBsb29rdXA6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxKaXRPckFvdEJsb2NrPj4+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBvcHVsYXRlZENvbXBvbmVudEluc3RhbmNlIHtcbiAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWU7XG4gIGRlZmluaXRpb246IENvbXBvbmVudERlZmluaXRpb247XG4gIG1hbmFnZXI6IENvbXBvbmVudE1hbmFnZXI8dW5rbm93bj47XG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eTtcbiAgc3RhdGU6IG51bGw7XG4gIGhhbmRsZTogbnVtYmVyO1xuICB0YWJsZTogT3B0aW9uPFByb2dyYW1TeW1ib2xUYWJsZT47XG4gIGxvb2t1cDogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEppdE9yQW90QmxvY2s+Pj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFydGlhbENvbXBvbmVudERlZmluaXRpb24ge1xuICBzdGF0ZTogT3B0aW9uPENvbXBvbmVudERlZmluaXRpb25TdGF0ZT47XG4gIG1hbmFnZXI6IEludGVybmFsQ29tcG9uZW50TWFuYWdlcjtcbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLklzQ29tcG9uZW50LCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgcmVmID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKTtcblxuICBzdGFjay5wdXNoKG5ldyBDb25kaXRpb25hbFJlZmVyZW5jZShyZWYsIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24pKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ29udGVudFR5cGUsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCByZWYgPSBjaGVjayhzdGFjay5wZWVrKCksIENoZWNrUmVmZXJlbmNlKTtcblxuICBzdGFjay5wdXNoKG5ldyBDb250ZW50VHlwZVJlZmVyZW5jZShyZWYpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ3VycnlDb21wb25lbnQsICh2bSwgeyBvcDE6IF9tZXRhIH0pID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG5cbiAgbGV0IGRlZmluaXRpb24gPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuICBsZXQgY2FwdHVyZWRBcmdzID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrQ2FwdHVyZWRBcmd1bWVudHMpO1xuXG4gIGxldCBtZXRhID0gdm1bQ09OU1RBTlRTXS5nZXRUZW1wbGF0ZU1ldGEoX21ldGEpO1xuICBsZXQgcmVzb2x2ZXIgPSB2bS5ydW50aW1lLnJlc29sdmVyO1xuXG4gIHZtLmxvYWRWYWx1ZSgkdjAsIG5ldyBDdXJyeUNvbXBvbmVudFJlZmVyZW5jZShkZWZpbml0aW9uLCByZXNvbHZlciwgbWV0YSwgY2FwdHVyZWRBcmdzKSk7XG5cbiAgLy8gZXhwZWN0U3RhY2tDaGFuZ2Uodm0uc3RhY2ssIC1hcmdzLmxlbmd0aCAtIDEsICdDdXJyeUNvbXBvbmVudCcpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoQ29tcG9uZW50RGVmaW5pdGlvbiwgKHZtLCB7IG9wMTogaGFuZGxlIH0pID0+IHtcbiAgbGV0IGRlZmluaXRpb24gPSB2bS5ydW50aW1lLnJlc29sdmVyLnJlc29sdmU8Q29tcG9uZW50RGVmaW5pdGlvbj4oaGFuZGxlKTtcbiAgYXNzZXJ0KCEhZGVmaW5pdGlvbiwgYE1pc3NpbmcgY29tcG9uZW50IGZvciAke2hhbmRsZX1gKTtcblxuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKSk7XG5cbiAgbGV0IGluc3RhbmNlOiBJbml0aWFsQ29tcG9uZW50SW5zdGFuY2UgPSB7XG4gICAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWUsXG4gICAgZGVmaW5pdGlvbixcbiAgICBtYW5hZ2VyLFxuICAgIGNhcGFiaWxpdGllcyxcbiAgICBzdGF0ZTogbnVsbCxcbiAgICBoYW5kbGU6IG51bGwsXG4gICAgdGFibGU6IG51bGwsXG4gICAgbG9va3VwOiBudWxsLFxuICB9O1xuXG4gIHZtLnN0YWNrLnB1c2goaW5zdGFuY2UpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5SZXNvbHZlRHluYW1pY0NvbXBvbmVudCwgKHZtLCB7IG9wMTogX21ldGEgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IGNvbXBvbmVudCA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpLnZhbHVlKCkgYXMgTWF5YmU8RGljdD47XG4gIGxldCBtZXRhID0gdm1bQ09OU1RBTlRTXS5nZXRUZW1wbGF0ZU1ldGEoX21ldGEpO1xuXG4gIHZtLmxvYWRWYWx1ZSgkdDEsIG51bGwpOyAvLyBDbGVhciB0aGUgdGVtcCByZWdpc3RlclxuXG4gIGxldCBkZWZpbml0aW9uOiBDb21wb25lbnREZWZpbml0aW9uIHwgQ3VycmllZENvbXBvbmVudERlZmluaXRpb247XG5cbiAgaWYgKHR5cGVvZiBjb21wb25lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgbGV0IHJlc29sdmVkRGVmaW5pdGlvbiA9IHJlc29sdmVDb21wb25lbnQodm0ucnVudGltZS5yZXNvbHZlciwgY29tcG9uZW50LCBtZXRhKTtcblxuICAgIGRlZmluaXRpb24gPSBleHBlY3QocmVzb2x2ZWREZWZpbml0aW9uLCBgQ291bGQgbm90IGZpbmQgYSBjb21wb25lbnQgbmFtZWQgXCIke2NvbXBvbmVudH1cImApO1xuICB9IGVsc2UgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oY29tcG9uZW50KSkge1xuICAgIGRlZmluaXRpb24gPSBjb21wb25lbnQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goZGVmaW5pdGlvbik7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hEeW5hbWljQ29tcG9uZW50SW5zdGFuY2UsIHZtID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuICBsZXQgZGVmaW5pdGlvbiA9IHN0YWNrLnBvcDxDb21wb25lbnREZWZpbml0aW9uPigpO1xuXG4gIGxldCBjYXBhYmlsaXRpZXMsIG1hbmFnZXI7XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oZGVmaW5pdGlvbikpIHtcbiAgICBtYW5hZ2VyID0gY2FwYWJpbGl0aWVzID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICBtYW5hZ2VyID0gZGVmaW5pdGlvbi5tYW5hZ2VyO1xuICAgIGNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdHlGbGFnc0Zyb20obWFuYWdlci5nZXRDYXBhYmlsaXRpZXMoZGVmaW5pdGlvbi5zdGF0ZSkpO1xuICB9XG5cbiAgc3RhY2sucHVzaCh7IGRlZmluaXRpb24sIGNhcGFiaWxpdGllcywgbWFuYWdlciwgc3RhdGU6IG51bGwsIGhhbmRsZTogbnVsbCwgdGFibGU6IG51bGwgfSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hDdXJyaWVkQ29tcG9uZW50LCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuXG4gIGxldCBjb21wb25lbnQgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKS52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuICBsZXQgZGVmaW5pdGlvbjogQ3VycmllZENvbXBvbmVudERlZmluaXRpb247XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oY29tcG9uZW50KSkge1xuICAgIGRlZmluaXRpb24gPSBjb21wb25lbnQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goZGVmaW5pdGlvbik7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hBcmdzLCAodm0sIHsgb3AxOiBfbmFtZXMsIG9wMjogZmxhZ3MgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IG5hbWVzID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmdBcnJheShfbmFtZXMpO1xuXG4gIGxldCBwb3NpdGlvbmFsQ291bnQgPSBmbGFncyA+PiA0O1xuICBsZXQgYXROYW1lcyA9IGZsYWdzICYgMGIxMDAwO1xuICBsZXQgYmxvY2tOYW1lczogc3RyaW5nW10gPSBbXTtcblxuICBpZiAoZmxhZ3MgJiAwYjAxMDApIGJsb2NrTmFtZXMucHVzaCgnbWFpbicpO1xuICBpZiAoZmxhZ3MgJiAwYjAwMTApIGJsb2NrTmFtZXMucHVzaCgnZWxzZScpO1xuICBpZiAoZmxhZ3MgJiAwYjAwMDEpIGJsb2NrTmFtZXMucHVzaCgnYXR0cnMnKTtcblxuICB2bVtBUkdTXS5zZXR1cChzdGFjaywgbmFtZXMsIGJsb2NrTmFtZXMsIHBvc2l0aW9uYWxDb3VudCwgISFhdE5hbWVzKTtcbiAgc3RhY2sucHVzaCh2bVtBUkdTXSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hFbXB0eUFyZ3MsIHZtID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gIHN0YWNrLnB1c2godm1bQVJHU10uZW1wdHkoc3RhY2spKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ2FwdHVyZUFyZ3MsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG5cbiAgbGV0IGFyZ3MgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tJbnN0YW5jZW9mKFZNQXJndW1lbnRzSW1wbCkpO1xuICBsZXQgY2FwdHVyZWRBcmdzID0gYXJncy5jYXB0dXJlKCk7XG4gIHN0YWNrLnB1c2goY2FwdHVyZWRBcmdzKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHJlcGFyZUFyZ3MsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgaW5zdGFuY2UgPSB2bS5mZXRjaFZhbHVlPENvbXBvbmVudEluc3RhbmNlPihfc3RhdGUpO1xuICBsZXQgYXJncyA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja0luc3RhbmNlb2YoVk1Bcmd1bWVudHNJbXBsKSk7XG5cbiAgbGV0IHsgZGVmaW5pdGlvbiB9ID0gaW5zdGFuY2U7XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oZGVmaW5pdGlvbikpIHtcbiAgICBhc3NlcnQoXG4gICAgICAhZGVmaW5pdGlvbi5tYW5hZ2VyLFxuICAgICAgXCJJZiB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gd2FzIGN1cnJpZWQsIHdlIGRvbid0IHlldCBoYXZlIGEgbWFuYWdlclwiXG4gICAgKTtcbiAgICBkZWZpbml0aW9uID0gcmVzb2x2ZUN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGluc3RhbmNlLCBkZWZpbml0aW9uLCBhcmdzKTtcbiAgfVxuXG4gIGxldCB7IG1hbmFnZXIsIHN0YXRlIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gaW5zdGFuY2UuY2FwYWJpbGl0aWVzO1xuXG4gIGlmICghbWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LlByZXBhcmVBcmdzKSkge1xuICAgIHN0YWNrLnB1c2goYXJncyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGJsb2NrcyA9IGFyZ3MuYmxvY2tzLnZhbHVlcztcbiAgbGV0IGJsb2NrTmFtZXMgPSBhcmdzLmJsb2Nrcy5uYW1lcztcbiAgbGV0IHByZXBhcmVkQXJncyA9IG1hbmFnZXIucHJlcGFyZUFyZ3Moc3RhdGUsIGFyZ3MpO1xuXG4gIGlmIChwcmVwYXJlZEFyZ3MpIHtcbiAgICBhcmdzLmNsZWFyKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgc3RhY2sucHVzaChibG9ja3NbaV0pO1xuICAgIH1cblxuICAgIGxldCB7IHBvc2l0aW9uYWwsIG5hbWVkIH0gPSBwcmVwYXJlZEFyZ3M7XG5cbiAgICBsZXQgcG9zaXRpb25hbENvdW50ID0gcG9zaXRpb25hbC5sZW5ndGg7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9uYWxDb3VudDsgaSsrKSB7XG4gICAgICBzdGFjay5wdXNoKHBvc2l0aW9uYWxbaV0pO1xuICAgIH1cblxuICAgIGxldCBuYW1lcyA9IE9iamVjdC5rZXlzKG5hbWVkKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHN0YWNrLnB1c2gobmFtZWRbbmFtZXNbaV1dKTtcbiAgICB9XG5cbiAgICBhcmdzLnNldHVwKHN0YWNrLCBuYW1lcywgYmxvY2tOYW1lcywgcG9zaXRpb25hbENvdW50LCBmYWxzZSk7XG4gIH1cblxuICBzdGFjay5wdXNoKGFyZ3MpO1xufSk7XG5cbmZ1bmN0aW9uIHJlc29sdmVDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihcbiAgaW5zdGFuY2U6IENvbXBvbmVudEluc3RhbmNlLFxuICBkZWZpbml0aW9uOiBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgYXJnczogVk1Bcmd1bWVudHNJbXBsXG4pOiBDb21wb25lbnREZWZpbml0aW9uIHtcbiAgbGV0IHVud3JhcHBlZERlZmluaXRpb24gPSAoaW5zdGFuY2UuZGVmaW5pdGlvbiA9IGRlZmluaXRpb24udW53cmFwKGFyZ3MpKTtcbiAgbGV0IHsgbWFuYWdlciwgc3RhdGUgfSA9IHVud3JhcHBlZERlZmluaXRpb247XG5cbiAgYXNzZXJ0KGluc3RhbmNlLm1hbmFnZXIgPT09IG51bGwsICdjb21wb25lbnQgaW5zdGFuY2UgbWFuYWdlciBzaG91bGQgbm90IGJlIHBvcHVsYXRlZCB5ZXQnKTtcbiAgYXNzZXJ0KGluc3RhbmNlLmNhcGFiaWxpdGllcyA9PT0gbnVsbCwgJ2NvbXBvbmVudCBpbnN0YW5jZSBtYW5hZ2VyIHNob3VsZCBub3QgYmUgcG9wdWxhdGVkIHlldCcpO1xuXG4gIGluc3RhbmNlLm1hbmFnZXIgPSBtYW5hZ2VyO1xuICBpbnN0YW5jZS5jYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXR5RmxhZ3NGcm9tKG1hbmFnZXIuZ2V0Q2FwYWJpbGl0aWVzKHN0YXRlKSk7XG5cbiAgcmV0dXJuIHVud3JhcHBlZERlZmluaXRpb247XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5DcmVhdGVDb21wb25lbnQsICh2bSwgeyBvcDE6IGZsYWdzLCBvcDI6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBpbnN0YW5jZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IGRlZmluaXRpb24sIG1hbmFnZXIgfSA9IGluc3RhbmNlO1xuXG4gIGxldCBjYXBhYmlsaXRpZXMgPSAoaW5zdGFuY2UuY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShcbiAgICBtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKVxuICApKTtcblxuICBpZiAoIW1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5DcmVhdGVJbnN0YW5jZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJVR2ApO1xuICB9XG5cbiAgbGV0IGR5bmFtaWNTY29wZTogT3B0aW9uPER5bmFtaWNTY29wZT4gPSBudWxsO1xuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkR5bmFtaWNTY29wZSkpIHtcbiAgICBkeW5hbWljU2NvcGUgPSB2bS5keW5hbWljU2NvcGUoKTtcbiAgfVxuXG4gIGxldCBoYXNEZWZhdWx0QmxvY2sgPSBmbGFncyAmIDE7XG4gIGxldCBhcmdzOiBPcHRpb248Vk1Bcmd1bWVudHM+ID0gbnVsbDtcblxuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkNyZWF0ZUFyZ3MpKSB7XG4gICAgYXJncyA9IGNoZWNrKHZtLnN0YWNrLnBlZWsoKSwgQ2hlY2tBcmd1bWVudHMpO1xuICB9XG5cbiAgbGV0IHNlbGY6IE9wdGlvbjxWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+PiA9IG51bGw7XG4gIGlmIChtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuQ3JlYXRlQ2FsbGVyKSkge1xuICAgIHNlbGYgPSB2bS5nZXRTZWxmKCk7XG4gIH1cblxuICBsZXQgc3RhdGUgPSBtYW5hZ2VyLmNyZWF0ZSh2bS5lbnYsIGRlZmluaXRpb24uc3RhdGUsIGFyZ3MsIGR5bmFtaWNTY29wZSwgc2VsZiwgISFoYXNEZWZhdWx0QmxvY2spO1xuXG4gIC8vIFdlIHdhbnQgdG8gcmV1c2UgdGhlIGBzdGF0ZWAgUE9KTyBoZXJlLCBiZWNhdXNlIHdlIGtub3cgdGhhdCB0aGUgb3Bjb2Rlc1xuICAvLyBvbmx5IHRyYW5zaXRpb24gYXQgZXhhY3RseSBvbmUgcGxhY2UuXG4gIGluc3RhbmNlLnN0YXRlID0gc3RhdGU7XG5cbiAgbGV0IHRhZyA9IG1hbmFnZXIuZ2V0VGFnKHN0YXRlKTtcblxuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LlVwZGF0ZUhvb2spICYmICFpc0NvbnN0VGFnKHRhZykpIHtcbiAgICB2bS51cGRhdGVXaXRoKG5ldyBVcGRhdGVDb21wb25lbnRPcGNvZGUodGFnLCBzdGF0ZSwgbWFuYWdlciwgZHluYW1pY1Njb3BlKSk7XG4gIH1cbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUmVnaXN0ZXJDb21wb25lbnREZXN0cnVjdG9yLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBtYW5hZ2VyLCBzdGF0ZSB9ID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcblxuICBsZXQgZCA9IG1hbmFnZXIuZ2V0RGVzdHJ1Y3RvcihzdGF0ZSk7XG4gIGlmIChkKSB2bS5hc3NvY2lhdGVEZXN0cm95YWJsZShkKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQmVnaW5Db21wb25lbnRUcmFuc2FjdGlvbiwgdm0gPT4ge1xuICB2bS5iZWdpbkNhY2hlR3JvdXAoKTtcbiAgdm0uZWxlbWVudHMoKS5wdXNoU2ltcGxlQmxvY2soKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHV0Q29tcG9uZW50T3BlcmF0aW9ucywgdm0gPT4ge1xuICB2bS5sb2FkVmFsdWUoJHQwLCBuZXcgQ29tcG9uZW50RWxlbWVudE9wZXJhdGlvbnMoKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNvbXBvbmVudEF0dHIsICh2bSwgeyBvcDE6IF9uYW1lLCBvcDI6IHRydXN0aW5nLCBvcDM6IF9uYW1lc3BhY2UgfSkgPT4ge1xuICBsZXQgbmFtZSA9IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lKTtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG4gIGxldCBuYW1lc3BhY2UgPSBfbmFtZXNwYWNlID8gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcoX25hbWVzcGFjZSkgOiBudWxsO1xuXG4gIGNoZWNrKHZtLmZldGNoVmFsdWUoJHQwKSwgQ2hlY2tJbnN0YW5jZW9mKENvbXBvbmVudEVsZW1lbnRPcGVyYXRpb25zKSkuc2V0QXR0cmlidXRlKFxuICAgIG5hbWUsXG4gICAgcmVmZXJlbmNlLFxuICAgICEhdHJ1c3RpbmcsXG4gICAgbmFtZXNwYWNlXG4gICk7XG59KTtcblxuaW50ZXJmYWNlIERlZmVycmVkQXR0cmlidXRlIHtcbiAgdmFsdWU6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPjtcbiAgbmFtZXNwYWNlOiBPcHRpb248c3RyaW5nPjtcbiAgdHJ1c3Rpbmc6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRFbGVtZW50T3BlcmF0aW9ucyBpbXBsZW1lbnRzIEVsZW1lbnRPcGVyYXRpb25zIHtcbiAgcHJpdmF0ZSBhdHRyaWJ1dGVzID0gZGljdDxEZWZlcnJlZEF0dHJpYnV0ZT4oKTtcbiAgcHJpdmF0ZSBjbGFzc2VzOiBWZXJzaW9uZWRSZWZlcmVuY2U8dW5rbm93bj5bXSA9IFtdO1xuICBwcml2YXRlIG1vZGlmaWVyczogW01vZGlmaWVyTWFuYWdlcjx1bmtub3duPiwgdW5rbm93bl1bXSA9IFtdO1xuXG4gIHNldEF0dHJpYnV0ZShcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPixcbiAgICB0cnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxzdHJpbmc+XG4gICkge1xuICAgIGxldCBkZWZlcnJlZCA9IHsgdmFsdWUsIG5hbWVzcGFjZSwgdHJ1c3RpbmcgfTtcblxuICAgIGlmIChuYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICB0aGlzLmNsYXNzZXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gZGVmZXJyZWQ7XG4gIH1cblxuICBhZGRNb2RpZmllcjxTPihtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXI8Uz4sIHN0YXRlOiBTKTogdm9pZCB7XG4gICAgdGhpcy5tb2RpZmllcnMucHVzaChbbWFuYWdlciwgc3RhdGVdKTtcbiAgfVxuXG4gIGZsdXNoKHZtOiBJbnRlcm5hbFZNPEppdE9yQW90QmxvY2s+KTogW01vZGlmaWVyTWFuYWdlcjx1bmtub3duPiwgdW5rbm93bl1bXSB7XG4gICAgZm9yIChsZXQgbmFtZSBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgIGxldCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgbGV0IHsgdmFsdWU6IHJlZmVyZW5jZSwgbmFtZXNwYWNlLCB0cnVzdGluZyB9ID0gYXR0cjtcblxuICAgICAgaWYgKG5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgcmVmZXJlbmNlID0gbmV3IENsYXNzTGlzdFJlZmVyZW5jZSh0aGlzLmNsYXNzZXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PT0gJ3R5cGUnKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBsZXQgYXR0cmlidXRlID0gdm1cbiAgICAgICAgLmVsZW1lbnRzKClcbiAgICAgICAgLnNldER5bmFtaWNBdHRyaWJ1dGUobmFtZSwgcmVmZXJlbmNlLnZhbHVlKCksIHRydXN0aW5nLCBuYW1lc3BhY2UpO1xuXG4gICAgICBpZiAoIWlzQ29uc3QocmVmZXJlbmNlKSkge1xuICAgICAgICB2bS51cGRhdGVXaXRoKG5ldyBVcGRhdGVEeW5hbWljQXR0cmlidXRlT3Bjb2RlKHJlZmVyZW5jZSwgYXR0cmlidXRlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCd0eXBlJyBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgIGxldCB0eXBlID0gdGhpcy5hdHRyaWJ1dGVzLnR5cGU7XG4gICAgICBsZXQgeyB2YWx1ZTogcmVmZXJlbmNlLCBuYW1lc3BhY2UsIHRydXN0aW5nIH0gPSB0eXBlO1xuXG4gICAgICBsZXQgYXR0cmlidXRlID0gdm1cbiAgICAgICAgLmVsZW1lbnRzKClcbiAgICAgICAgLnNldER5bmFtaWNBdHRyaWJ1dGUoJ3R5cGUnLCByZWZlcmVuY2UudmFsdWUoKSwgdHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG5cbiAgICAgIGlmICghaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgICAgIHZtLnVwZGF0ZVdpdGgobmV3IFVwZGF0ZUR5bmFtaWNBdHRyaWJ1dGVPcGNvZGUocmVmZXJlbmNlLCBhdHRyaWJ1dGUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5tb2RpZmllcnM7XG4gIH1cbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkRpZENyZWF0ZUVsZW1lbnQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IGRlZmluaXRpb24sIHN0YXRlIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuXG4gIGxldCBvcGVyYXRpb25zID0gY2hlY2sodm0uZmV0Y2hWYWx1ZSgkdDApLCBDaGVja0luc3RhbmNlb2YoQ29tcG9uZW50RWxlbWVudE9wZXJhdGlvbnMpKTtcblxuICAobWFuYWdlciBhcyBXaXRoRWxlbWVudEhvb2s8dW5rbm93bj4pLmRpZENyZWF0ZUVsZW1lbnQoXG4gICAgc3RhdGUsXG4gICAgZXhwZWN0KHZtLmVsZW1lbnRzKCkuY29uc3RydWN0aW5nLCBgRXhwZWN0ZWQgYSBjb25zdHJ1Y3RpbmcgZWxlbWV0IGluIERpZENyZWF0ZU9wY29kZWApLFxuICAgIG9wZXJhdGlvbnNcbiAgKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuR2V0Q29tcG9uZW50U2VsZiwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgZGVmaW5pdGlvbiwgc3RhdGUgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG5cbiAgdm0uc3RhY2sucHVzaChtYW5hZ2VyLmdldFNlbGYoc3RhdGUpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuR2V0Q29tcG9uZW50VGFnTmFtZSwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgZGVmaW5pdGlvbiwgc3RhdGUgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG5cbiAgdm0uc3RhY2sucHVzaChcbiAgICAobWFuYWdlciBhcyBSZWNhc3Q8SW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyLCBXaXRoRHluYW1pY1RhZ05hbWU8dW5rbm93bj4+KS5nZXRUYWdOYW1lKHN0YXRlKVxuICApO1xufSk7XG5cbi8vIER5bmFtaWMgSW52b2NhdGlvbiBPbmx5XG5BUFBFTkRfT1BDT0RFUy5hZGQoXG4gIE9wLkdldEppdENvbXBvbmVudExheW91dCxcbiAgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgICBsZXQgaW5zdGFuY2UgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuXG4gICAgbGV0IG1hbmFnZXIgPSBpbnN0YW5jZS5tYW5hZ2VyIGFzIFdpdGhKaXRTdGF0aWNMYXlvdXQgfCBXaXRoSml0RHluYW1pY0xheW91dDtcbiAgICBsZXQgeyBkZWZpbml0aW9uIH0gPSBpbnN0YW5jZTtcbiAgICBsZXQgeyBzdGFjayB9ID0gdm07XG5cbiAgICBsZXQgeyBjYXBhYmlsaXRpZXMgfSA9IGluc3RhbmNlO1xuXG4gICAgLy8gbGV0IGludm9rZTogeyBoYW5kbGU6IG51bWJlcjsgc3ltYm9sVGFibGU6IFByb2dyYW1TeW1ib2xUYWJsZSB9O1xuXG4gICAgbGV0IGxheW91dDogQ29tcGlsYWJsZVRlbXBsYXRlO1xuXG4gICAgaWYgKGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBtYW5hZ2VyKSkge1xuICAgICAgbGF5b3V0ID0gbWFuYWdlci5nZXRKaXRTdGF0aWNMYXlvdXQoZGVmaW5pdGlvbi5zdGF0ZSwgdm0ucnVudGltZS5yZXNvbHZlcik7XG4gICAgfSBlbHNlIGlmIChoYXNEeW5hbWljTGF5b3V0Q2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIG1hbmFnZXIpKSB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBtYW5hZ2VyLmdldEppdER5bmFtaWNMYXlvdXQoaW5zdGFuY2Uuc3RhdGUsIHZtLnJ1bnRpbWUucmVzb2x2ZXIsIHZtLmNvbnRleHQpO1xuXG4gICAgICBpZiAoaGFzQ2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuV3JhcHBlZCkpIHtcbiAgICAgICAgbGF5b3V0ID0gdGVtcGxhdGUuYXNXcmFwcGVkTGF5b3V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXlvdXQgPSB0ZW1wbGF0ZS5hc0xheW91dCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICAgIH1cblxuICAgIGxldCBoYW5kbGUgPSBsYXlvdXQuY29tcGlsZSh2bS5jb250ZXh0KTtcblxuICAgIHN0YWNrLnB1c2gobGF5b3V0LnN5bWJvbFRhYmxlKTtcbiAgICBzdGFjay5wdXNoKGhhbmRsZSk7XG4gIH0sXG4gICdqaXQnXG4pO1xuXG4vLyBEeW5hbWljIEludm9jYXRpb24gT25seVxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkdldEFvdENvbXBvbmVudExheW91dCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IGluc3RhbmNlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgbWFuYWdlciwgZGVmaW5pdGlvbiB9ID0gaW5zdGFuY2U7XG4gIGxldCB7IHN0YWNrIH0gPSB2bTtcblxuICBsZXQgeyBzdGF0ZTogaW5zdGFuY2VTdGF0ZSwgY2FwYWJpbGl0aWVzIH0gPSBpbnN0YW5jZTtcbiAgbGV0IHsgc3RhdGU6IGRlZmluaXRpb25TdGF0ZSB9ID0gZGVmaW5pdGlvbjtcblxuICBsZXQgaW52b2tlOiB7IGhhbmRsZTogbnVtYmVyOyBzeW1ib2xUYWJsZTogUHJvZ3JhbVN5bWJvbFRhYmxlIH07XG5cbiAgaWYgKGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBtYW5hZ2VyKSkge1xuICAgIGludm9rZSA9IChtYW5hZ2VyIGFzIFdpdGhBb3RTdGF0aWNMYXlvdXQ8XG4gICAgICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgICAgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLFxuICAgICAgUnVudGltZVJlc29sdmVyRGVsZWdhdGVcbiAgICA+KS5nZXRBb3RTdGF0aWNMYXlvdXQoZGVmaW5pdGlvblN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgfSBlbHNlIGlmIChoYXNEeW5hbWljTGF5b3V0Q2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIG1hbmFnZXIpKSB7XG4gICAgaW52b2tlID0gKG1hbmFnZXIgYXMgV2l0aEFvdER5bmFtaWNMYXlvdXQ8XG4gICAgICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgICAgUnVudGltZVJlc29sdmVyXG4gICAgPikuZ2V0QW90RHluYW1pY0xheW91dChpbnN0YW5jZVN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICB9XG5cbiAgc3RhY2sucHVzaChpbnZva2Uuc3ltYm9sVGFibGUpO1xuICBzdGFjay5wdXNoKGludm9rZS5oYW5kbGUpO1xufSk7XG5cbi8vIFRoZXNlIHR5cGVzIGFyZSBhYnN1cmQgaGVyZVxuZXhwb3J0IGZ1bmN0aW9uIGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoXG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eSxcbiAgX21hbmFnZXI6IEludGVybmFsQ29tcG9uZW50TWFuYWdlclxuKTogX21hbmFnZXIgaXNcbiAgfCBXaXRoSml0U3RhdGljTGF5b3V0PENvbXBvbmVudEluc3RhbmNlU3RhdGUsIENvbXBvbmVudERlZmluaXRpb25TdGF0ZSwgSml0UnVudGltZVJlc29sdmVyPlxuICB8IFdpdGhBb3RTdGF0aWNMYXlvdXQ8Q29tcG9uZW50SW5zdGFuY2VTdGF0ZSwgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLCBSdW50aW1lUmVzb2x2ZXI+IHtcbiAgcmV0dXJuIG1hbmFnZXJIYXNDYXBhYmlsaXR5KF9tYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuRHluYW1pY0xheW91dCkgPT09IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzSml0U3RhdGljTGF5b3V0Q2FwYWJpbGl0eShcbiAgY2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5LFxuICBfbWFuYWdlcjogSW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyXG4pOiBfbWFuYWdlciBpcyBXaXRoSml0U3RhdGljTGF5b3V0PFxuICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gIEppdFJ1bnRpbWVSZXNvbHZlclxuPiB7XG4gIHJldHVybiBtYW5hZ2VySGFzQ2FwYWJpbGl0eShfbWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkR5bmFtaWNMYXlvdXQpID09PSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0R5bmFtaWNMYXlvdXRDYXBhYmlsaXR5KFxuICBjYXBhYmlsaXRpZXM6IENhcGFiaWxpdHksXG4gIF9tYW5hZ2VyOiBJbnRlcm5hbENvbXBvbmVudE1hbmFnZXJcbik6IF9tYW5hZ2VyIGlzXG4gIHwgV2l0aEppdER5bmFtaWNMYXlvdXQ8Q29tcG9uZW50SW5zdGFuY2VTdGF0ZSwgSml0UnVudGltZVJlc29sdmVyPlxuICB8IFdpdGhBb3REeW5hbWljTGF5b3V0PENvbXBvbmVudEluc3RhbmNlU3RhdGUsIFJ1bnRpbWVSZXNvbHZlcj4ge1xuICByZXR1cm4gbWFuYWdlckhhc0NhcGFiaWxpdHkoX21hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5EeW5hbWljTGF5b3V0KSA9PT0gdHJ1ZTtcbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLk1haW4sICh2bSwgeyBvcDE6IHJlZ2lzdGVyIH0pID0+IHtcbiAgbGV0IGRlZmluaXRpb24gPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tDb21wb25lbnREZWZpbml0aW9uKTtcbiAgbGV0IGludm9jYXRpb24gPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tJbnZvY2F0aW9uKTtcblxuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKSk7XG5cbiAgbGV0IHN0YXRlOiBQb3B1bGF0ZWRDb21wb25lbnRJbnN0YW5jZSA9IHtcbiAgICBbQ09NUE9ORU5UX0lOU1RBTkNFXTogdHJ1ZSxcbiAgICBkZWZpbml0aW9uLFxuICAgIG1hbmFnZXIsXG4gICAgY2FwYWJpbGl0aWVzLFxuICAgIHN0YXRlOiBudWxsLFxuICAgIGhhbmRsZTogaW52b2NhdGlvbi5oYW5kbGUsXG4gICAgdGFibGU6IGludm9jYXRpb24uc3ltYm9sVGFibGUsXG4gICAgbG9va3VwOiBudWxsLFxuICB9O1xuXG4gIHZtLmxvYWRWYWx1ZShyZWdpc3Rlciwgc3RhdGUpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Qb3B1bGF0ZUxheW91dCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gIGxldCBoYW5kbGUgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tIYW5kbGUpO1xuICBsZXQgdGFibGUgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tQcm9ncmFtU3ltYm9sVGFibGUpO1xuXG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG5cbiAgc3RhdGUuaGFuZGxlID0gaGFuZGxlO1xuICBzdGF0ZS50YWJsZSA9IHRhYmxlO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5WaXJ0dWFsUm9vdFNjb3BlLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBzeW1ib2xzIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSkudGFibGU7XG5cbiAgdm0ucHVzaFJvb3RTY29wZShzeW1ib2xzLmxlbmd0aCArIDEpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXR1cEZvckV2YWwsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcblxuICBpZiAoc3RhdGUudGFibGUuaGFzRXZhbCkge1xuICAgIGxldCBsb29rdXAgPSAoc3RhdGUubG9va3VwID0gZGljdDxTY29wZVNsb3Q8Sml0T3JBb3RCbG9jaz4+KCkpO1xuICAgIHZtLnNjb3BlKCkuYmluZEV2YWxTY29wZShsb29rdXApO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlNldE5hbWVkVmFyaWFibGVzLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgc3RhdGUgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCBzY29wZSA9IHZtLnNjb3BlKCk7XG5cbiAgbGV0IGFyZ3MgPSBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrQXJndW1lbnRzKTtcbiAgbGV0IGNhbGxlck5hbWVzID0gYXJncy5uYW1lZC5hdE5hbWVzO1xuXG4gIGZvciAobGV0IGkgPSBjYWxsZXJOYW1lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGxldCBhdE5hbWUgPSBjYWxsZXJOYW1lc1tpXTtcbiAgICBsZXQgc3ltYm9sID0gc3RhdGUudGFibGUuc3ltYm9scy5pbmRleE9mKGNhbGxlck5hbWVzW2ldKTtcbiAgICBsZXQgdmFsdWUgPSBhcmdzLm5hbWVkLmdldChhdE5hbWUsIHRydWUpO1xuXG4gICAgaWYgKHN5bWJvbCAhPT0gLTEpIHNjb3BlLmJpbmRTeW1ib2woc3ltYm9sICsgMSwgdmFsdWUpO1xuICAgIGlmIChzdGF0ZS5sb29rdXApIHN0YXRlLmxvb2t1cFthdE5hbWVdID0gdmFsdWU7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBiaW5kQmxvY2s8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KFxuICBzeW1ib2xOYW1lOiBzdHJpbmcsXG4gIGJsb2NrTmFtZTogc3RyaW5nLFxuICBzdGF0ZTogQ29tcG9uZW50SW5zdGFuY2UsXG4gIGJsb2NrczogQmxvY2tBcmd1bWVudHNJbXBsPEM+LFxuICB2bTogSW50ZXJuYWxWTTxDPlxuKSB7XG4gIGxldCBzeW1ib2wgPSBzdGF0ZS50YWJsZS5zeW1ib2xzLmluZGV4T2Yoc3ltYm9sTmFtZSk7XG5cbiAgbGV0IGJsb2NrID0gYmxvY2tzLmdldChibG9ja05hbWUpO1xuXG4gIGlmIChzeW1ib2wgIT09IC0xKSB7XG4gICAgdm0uc2NvcGUoKS5iaW5kQmxvY2soc3ltYm9sICsgMSwgYmxvY2spO1xuICB9XG5cbiAgaWYgKHN0YXRlLmxvb2t1cCkgc3RhdGUubG9va3VwW3N5bWJvbE5hbWVdID0gYmxvY2s7XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXRCbG9ja3MsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgYmxvY2tzIH0gPSBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrQXJndW1lbnRzKTtcblxuICBiaW5kQmxvY2soJyZhdHRycycsICdhdHRycycsIHN0YXRlLCBibG9ja3MsIHZtKTtcbiAgYmluZEJsb2NrKCcmZWxzZScsICdlbHNlJywgc3RhdGUsIGJsb2Nrcywgdm0pO1xuICBiaW5kQmxvY2soJyZkZWZhdWx0JywgJ21haW4nLCBzdGF0ZSwgYmxvY2tzLCB2bSk7XG59KTtcblxuLy8gRHluYW1pYyBJbnZvY2F0aW9uIE9ubHlcbkFQUEVORF9PUENPREVTLmFkZChPcC5JbnZva2VDb21wb25lbnRMYXlvdXQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcblxuICB2bS5jYWxsKHN0YXRlLmhhbmRsZSEpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5EaWRSZW5kZXJMYXlvdXQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IG1hbmFnZXIsIHN0YXRlLCBjYXBhYmlsaXRpZXMgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCBib3VuZHMgPSB2bS5lbGVtZW50cygpLnBvcEJsb2NrKCk7XG5cbiAgaWYgKCFtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuQ3JlYXRlSW5zdGFuY2UpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCVUdgKTtcbiAgfVxuXG4gIGxldCBtZ3IgPSBjaGVjayhtYW5hZ2VyLCBDaGVja0ludGVyZmFjZSh7IGRpZFJlbmRlckxheW91dDogQ2hlY2tGdW5jdGlvbiB9KSk7XG5cbiAgbWdyLmRpZFJlbmRlckxheW91dChzdGF0ZSwgYm91bmRzKTtcblxuICB2bS5lbnYuZGlkQ3JlYXRlKHN0YXRlLCBtYW5hZ2VyKTtcblxuICB2bS51cGRhdGVXaXRoKG5ldyBEaWRVcGRhdGVMYXlvdXRPcGNvZGUobWFuYWdlciwgc3RhdGUsIGJvdW5kcykpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Db21taXRDb21wb25lbnRUcmFuc2FjdGlvbiwgdm0gPT4ge1xuICB2bS5jb21taXRDYWNoZUdyb3VwKCk7XG59KTtcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZUNvbXBvbmVudE9wY29kZSBleHRlbmRzIFVwZGF0aW5nT3Bjb2RlIHtcbiAgcHVibGljIHR5cGUgPSAndXBkYXRlLWNvbXBvbmVudCc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRhZzogVGFnLFxuICAgIHByaXZhdGUgY29tcG9uZW50OiBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgIHByaXZhdGUgbWFuYWdlcjogV2l0aFVwZGF0ZUhvb2ssXG4gICAgcHJpdmF0ZSBkeW5hbWljU2NvcGU6IE9wdGlvbjxEeW5hbWljU2NvcGU+XG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBldmFsdWF0ZShfdm06IFVwZGF0aW5nVk0pIHtcbiAgICBsZXQgeyBjb21wb25lbnQsIG1hbmFnZXIsIGR5bmFtaWNTY29wZSB9ID0gdGhpcztcblxuICAgIG1hbmFnZXIudXBkYXRlKGNvbXBvbmVudCwgZHluYW1pY1Njb3BlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlkVXBkYXRlTGF5b3V0T3Bjb2RlIGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdkaWQtdXBkYXRlLWxheW91dCc7XG4gIHB1YmxpYyB0YWc6IFRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSxcbiAgICBwcml2YXRlIGNvbXBvbmVudDogQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgICBwcml2YXRlIGJvdW5kczogQm91bmRzXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IG1hbmFnZXIsIGNvbXBvbmVudCwgYm91bmRzIH0gPSB0aGlzO1xuXG4gICAgbWFuYWdlci5kaWRVcGRhdGVMYXlvdXQoY29tcG9uZW50LCBib3VuZHMpO1xuXG4gICAgdm0uZW52LmRpZFVwZGF0ZShjb21wb25lbnQsIG1hbmFnZXIpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9