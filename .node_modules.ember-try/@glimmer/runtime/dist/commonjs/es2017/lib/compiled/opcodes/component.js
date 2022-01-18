'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DidUpdateLayoutOpcode = exports.UpdateComponentOpcode = exports.ComponentElementOperations = exports.COMPONENT_INSTANCE = undefined;
exports.hasStaticLayoutCapability = hasStaticLayoutCapability;
exports.hasJitStaticLayoutCapability = hasJitStaticLayoutCapability;
exports.hasDynamicLayoutCapability = hasDynamicLayoutCapability;

var _reference = require('@glimmer/reference');

var _util = require('@glimmer/util');

var _vm2 = require('@glimmer/vm');

var _capabilities = require('../../capabilities');

var _curriedComponent = require('../../component/curried-component');

var _resolve = require('../../component/resolve');

var _opcodes = require('../../opcodes');

var _classList = require('../../references/class-list');

var _classList2 = _interopRequireDefault(_classList);

var _curryComponent = require('../../references/curry-component');

var _curryComponent2 = _interopRequireDefault(_curryComponent);

var _symbols = require('../../symbols');

var _content = require('./content');

var _dom = require('./dom');

var _references = require('../../references');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The VM creates a new ComponentInstance data structure for every component
 * invocation it encounters.
 *
 * Similar to how a ComponentDefinition contains state about all components of a
 * particular type, a ComponentInstance contains state specific to a particular
 * instance of a component type. It also contains a pointer back to its
 * component type's ComponentDefinition.
 */
const COMPONENT_INSTANCE = exports.COMPONENT_INSTANCE = 'COMPONENT_INSTANCE [c56c57de-e73a-4ef0-b137-07661da17029]';
_opcodes.APPEND_OPCODES.add(76 /* IsComponent */, vm => {
    let stack = vm.stack;
    let ref = stack.pop();
    stack.push(new _references.ConditionalReference(ref, _curriedComponent.isCurriedComponentDefinition));
});
_opcodes.APPEND_OPCODES.add(77 /* ContentType */, vm => {
    let stack = vm.stack;
    let ref = stack.peek();
    stack.push(new _content.ContentTypeReference(ref));
});
_opcodes.APPEND_OPCODES.add(78 /* CurryComponent */, (vm, { op1: _meta }) => {
    let stack = vm.stack;
    let definition = stack.pop();
    let capturedArgs = stack.pop();
    let meta = vm[_symbols.CONSTANTS].getTemplateMeta(_meta);
    let resolver = vm.runtime.resolver;
    vm.loadValue(_vm2.$v0, new _curryComponent2.default(definition, resolver, meta, capturedArgs));
    // expectStackChange(vm.stack, -args.length - 1, 'CurryComponent');
});
_opcodes.APPEND_OPCODES.add(79 /* PushComponentDefinition */, (vm, { op1: handle }) => {
    let definition = vm.runtime.resolver.resolve(handle);
    false && (0, _util.assert)(!!definition, `Missing component for ${handle}`);

    let { manager } = definition;
    let capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(definition.state));
    let instance = {
        [COMPONENT_INSTANCE]: true,
        definition,
        manager,
        capabilities,
        state: null,
        handle: null,
        table: null,
        lookup: null
    };
    vm.stack.push(instance);
});
_opcodes.APPEND_OPCODES.add(82 /* ResolveDynamicComponent */, (vm, { op1: _meta }) => {
    let stack = vm.stack;
    let component = stack.pop().value();
    let meta = vm[_symbols.CONSTANTS].getTemplateMeta(_meta);
    vm.loadValue(_vm2.$t1, null); // Clear the temp register
    let definition;
    if (typeof component === 'string') {
        let resolvedDefinition = (0, _resolve.resolveComponent)(vm.runtime.resolver, component, meta);
        definition = resolvedDefinition;
    } else if ((0, _curriedComponent.isCurriedComponentDefinition)(component)) {
        definition = component;
    } else {
        throw (0, _util.unreachable)();
    }
    stack.push(definition);
});
_opcodes.APPEND_OPCODES.add(80 /* PushDynamicComponentInstance */, vm => {
    let { stack } = vm;
    let definition = stack.pop();
    let capabilities, manager;
    if ((0, _curriedComponent.isCurriedComponentDefinition)(definition)) {
        manager = capabilities = null;
    } else {
        manager = definition.manager;
        capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(definition.state));
    }
    stack.push({ definition, capabilities, manager, state: null, handle: null, table: null });
});
_opcodes.APPEND_OPCODES.add(81 /* PushCurriedComponent */, vm => {
    let stack = vm.stack;
    let component = stack.pop().value();
    let definition;
    if ((0, _curriedComponent.isCurriedComponentDefinition)(component)) {
        definition = component;
    } else {
        throw (0, _util.unreachable)();
    }
    stack.push(definition);
});
_opcodes.APPEND_OPCODES.add(83 /* PushArgs */, (vm, { op1: _names, op2: flags }) => {
    let stack = vm.stack;
    let names = vm[_symbols.CONSTANTS].getStringArray(_names);
    let positionalCount = flags >> 4;
    let atNames = flags & 0b1000;
    let blockNames = [];
    if (flags & 0b0100) blockNames.push('main');
    if (flags & 0b0010) blockNames.push('else');
    if (flags & 0b0001) blockNames.push('attrs');
    vm[_symbols.ARGS].setup(stack, names, blockNames, positionalCount, !!atNames);
    stack.push(vm[_symbols.ARGS]);
});
_opcodes.APPEND_OPCODES.add(84 /* PushEmptyArgs */, vm => {
    let { stack } = vm;
    stack.push(vm[_symbols.ARGS].empty(stack));
});
_opcodes.APPEND_OPCODES.add(87 /* CaptureArgs */, vm => {
    let stack = vm.stack;
    let args = stack.pop();
    let capturedArgs = args.capture();
    stack.push(capturedArgs);
});
_opcodes.APPEND_OPCODES.add(86 /* PrepareArgs */, (vm, { op1: _state }) => {
    let stack = vm.stack;
    let instance = vm.fetchValue(_state);
    let args = stack.pop();
    let { definition } = instance;
    if ((0, _curriedComponent.isCurriedComponentDefinition)(definition)) {
        false && (0, _util.assert)(!definition.manager, "If the component definition was curried, we don't yet have a manager");

        definition = resolveCurriedComponentDefinition(instance, definition, args);
    }
    let { manager, state } = definition;
    let capabilities = instance.capabilities;
    if (!(0, _capabilities.managerHasCapability)(manager, capabilities, 4 /* PrepareArgs */)) {
        stack.push(args);
        return;
    }
    let blocks = args.blocks.values;
    let blockNames = args.blocks.names;
    let preparedArgs = manager.prepareArgs(state, args);
    if (preparedArgs) {
        args.clear();
        for (let i = 0; i < blocks.length; i++) {
            stack.push(blocks[i]);
        }
        let { positional, named } = preparedArgs;
        let positionalCount = positional.length;
        for (let i = 0; i < positionalCount; i++) {
            stack.push(positional[i]);
        }
        let names = Object.keys(named);
        for (let i = 0; i < names.length; i++) {
            stack.push(named[names[i]]);
        }
        args.setup(stack, names, blockNames, positionalCount, false);
    }
    stack.push(args);
});
function resolveCurriedComponentDefinition(instance, definition, args) {
    let unwrappedDefinition = instance.definition = definition.unwrap(args);
    let { manager, state } = unwrappedDefinition;
    false && (0, _util.assert)(instance.manager === null, 'component instance manager should not be populated yet');
    false && (0, _util.assert)(instance.capabilities === null, 'component instance manager should not be populated yet');

    instance.manager = manager;
    instance.capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(state));
    return unwrappedDefinition;
}
_opcodes.APPEND_OPCODES.add(88 /* CreateComponent */, (vm, { op1: flags, op2: _state }) => {
    let instance = vm.fetchValue(_state);
    let { definition, manager } = instance;
    let capabilities = instance.capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(definition.state));
    if (!(0, _capabilities.managerHasCapability)(manager, capabilities, 512 /* CreateInstance */)) {
        throw new Error(`BUG`);
    }
    let dynamicScope = null;
    if ((0, _capabilities.managerHasCapability)(manager, capabilities, 64 /* DynamicScope */)) {
        dynamicScope = vm.dynamicScope();
    }
    let hasDefaultBlock = flags & 1;
    let args = null;
    if ((0, _capabilities.managerHasCapability)(manager, capabilities, 8 /* CreateArgs */)) {
        args = vm.stack.peek();
    }
    let self = null;
    if ((0, _capabilities.managerHasCapability)(manager, capabilities, 128 /* CreateCaller */)) {
        self = vm.getSelf();
    }
    let state = manager.create(vm.env, definition.state, args, dynamicScope, self, !!hasDefaultBlock);
    // We want to reuse the `state` POJO here, because we know that the opcodes
    // only transition at exactly one place.
    instance.state = state;
    let tag = manager.getTag(state);
    if ((0, _capabilities.managerHasCapability)(manager, capabilities, 256 /* UpdateHook */) && !(0, _reference.isConstTag)(tag)) {
        vm.updateWith(new UpdateComponentOpcode(tag, state, manager, dynamicScope));
    }
});
_opcodes.APPEND_OPCODES.add(89 /* RegisterComponentDestructor */, (vm, { op1: _state }) => {
    let { manager, state } = vm.fetchValue(_state);
    let d = manager.getDestructor(state);
    if (d) vm.associateDestroyable(d);
});
_opcodes.APPEND_OPCODES.add(99 /* BeginComponentTransaction */, vm => {
    vm.beginCacheGroup();
    vm.elements().pushSimpleBlock();
});
_opcodes.APPEND_OPCODES.add(90 /* PutComponentOperations */, vm => {
    vm.loadValue(_vm2.$t0, new ComponentElementOperations());
});
_opcodes.APPEND_OPCODES.add(52 /* ComponentAttr */, (vm, { op1: _name, op2: trusting, op3: _namespace }) => {
    let name = vm[_symbols.CONSTANTS].getString(_name);
    let reference = vm.stack.pop();
    let namespace = _namespace ? vm[_symbols.CONSTANTS].getString(_namespace) : null;
    vm.fetchValue(_vm2.$t0).setAttribute(name, reference, !!trusting, namespace);
});
class ComponentElementOperations {
    constructor() {
        this.attributes = (0, _util.dict)();
        this.classes = [];
        this.modifiers = [];
    }
    setAttribute(name, value, trusting, namespace) {
        let deferred = { value, namespace, trusting };
        if (name === 'class') {
            this.classes.push(value);
        }
        this.attributes[name] = deferred;
    }
    addModifier(manager, state) {
        this.modifiers.push([manager, state]);
    }
    flush(vm) {
        for (let name in this.attributes) {
            let attr = this.attributes[name];
            let { value: reference, namespace, trusting } = attr;
            if (name === 'class') {
                reference = new _classList2.default(this.classes);
            }
            if (name === 'type') {
                continue;
            }
            let attribute = vm.elements().setDynamicAttribute(name, reference.value(), trusting, namespace);
            if (!(0, _reference.isConst)(reference)) {
                vm.updateWith(new _dom.UpdateDynamicAttributeOpcode(reference, attribute));
            }
        }
        if ('type' in this.attributes) {
            let type = this.attributes.type;
            let { value: reference, namespace, trusting } = type;
            let attribute = vm.elements().setDynamicAttribute('type', reference.value(), trusting, namespace);
            if (!(0, _reference.isConst)(reference)) {
                vm.updateWith(new _dom.UpdateDynamicAttributeOpcode(reference, attribute));
            }
        }
        return this.modifiers;
    }
}
exports.ComponentElementOperations = ComponentElementOperations;
_opcodes.APPEND_OPCODES.add(101 /* DidCreateElement */, (vm, { op1: _state }) => {
    let { definition, state } = vm.fetchValue(_state);
    let { manager } = definition;
    let operations = vm.fetchValue(_vm2.$t0);
    manager.didCreateElement(state, vm.elements().constructing, operations);
});
_opcodes.APPEND_OPCODES.add(91 /* GetComponentSelf */, (vm, { op1: _state }) => {
    let { definition, state } = vm.fetchValue(_state);
    let { manager } = definition;
    vm.stack.push(manager.getSelf(state));
});
_opcodes.APPEND_OPCODES.add(92 /* GetComponentTagName */, (vm, { op1: _state }) => {
    let { definition, state } = vm.fetchValue(_state);
    let { manager } = definition;
    vm.stack.push(manager.getTagName(state));
});
// Dynamic Invocation Only
_opcodes.APPEND_OPCODES.add(94 /* GetJitComponentLayout */, (vm, { op1: _state }) => {
    let instance = vm.fetchValue(_state);
    let manager = instance.manager;
    let { definition } = instance;
    let { stack } = vm;
    let { capabilities } = instance;
    // let invoke: { handle: number; symbolTable: ProgramSymbolTable };
    let layout;
    if (hasStaticLayoutCapability(capabilities, manager)) {
        layout = manager.getJitStaticLayout(definition.state, vm.runtime.resolver);
    } else if (hasDynamicLayoutCapability(capabilities, manager)) {
        let template = manager.getJitDynamicLayout(instance.state, vm.runtime.resolver, vm.context);
        if ((0, _capabilities.hasCapability)(capabilities, 1024 /* Wrapped */)) {
            layout = template.asWrappedLayout();
        } else {
            layout = template.asLayout();
        }
    } else {
        throw (0, _util.unreachable)();
    }
    let handle = layout.compile(vm.context);
    stack.push(layout.symbolTable);
    stack.push(handle);
}, 'jit');
// Dynamic Invocation Only
_opcodes.APPEND_OPCODES.add(93 /* GetAotComponentLayout */, (vm, { op1: _state }) => {
    let instance = vm.fetchValue(_state);
    let { manager, definition } = instance;
    let { stack } = vm;
    let { state: instanceState, capabilities } = instance;
    let { state: definitionState } = definition;
    let invoke;
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
_opcodes.APPEND_OPCODES.add(75 /* Main */, (vm, { op1: register }) => {
    let definition = vm.stack.pop();
    let invocation = vm.stack.pop();
    let { manager } = definition;
    let capabilities = (0, _capabilities.capabilityFlagsFrom)(manager.getCapabilities(definition.state));
    let state = {
        [COMPONENT_INSTANCE]: true,
        definition,
        manager,
        capabilities,
        state: null,
        handle: invocation.handle,
        table: invocation.symbolTable,
        lookup: null
    };
    vm.loadValue(register, state);
});
_opcodes.APPEND_OPCODES.add(97 /* PopulateLayout */, (vm, { op1: _state }) => {
    let { stack } = vm;
    let handle = stack.pop();
    let table = stack.pop();
    let state = vm.fetchValue(_state);
    state.handle = handle;
    state.table = table;
});
_opcodes.APPEND_OPCODES.add(37 /* VirtualRootScope */, (vm, { op1: _state }) => {
    let { symbols } = vm.fetchValue(_state).table;
    vm.pushRootScope(symbols.length + 1);
});
_opcodes.APPEND_OPCODES.add(96 /* SetupForEval */, (vm, { op1: _state }) => {
    let state = vm.fetchValue(_state);
    if (state.table.hasEval) {
        let lookup = state.lookup = (0, _util.dict)();
        vm.scope().bindEvalScope(lookup);
    }
});
_opcodes.APPEND_OPCODES.add(17 /* SetNamedVariables */, (vm, { op1: _state }) => {
    let state = vm.fetchValue(_state);
    let scope = vm.scope();
    let args = vm.stack.peek();
    let callerNames = args.named.atNames;
    for (let i = callerNames.length - 1; i >= 0; i--) {
        let atName = callerNames[i];
        let symbol = state.table.symbols.indexOf(callerNames[i]);
        let value = args.named.get(atName, true);
        if (symbol !== -1) scope.bindSymbol(symbol + 1, value);
        if (state.lookup) state.lookup[atName] = value;
    }
});
function bindBlock(symbolName, blockName, state, blocks, vm) {
    let symbol = state.table.symbols.indexOf(symbolName);
    let block = blocks.get(blockName);
    if (symbol !== -1) {
        vm.scope().bindBlock(symbol + 1, block);
    }
    if (state.lookup) state.lookup[symbolName] = block;
}
_opcodes.APPEND_OPCODES.add(18 /* SetBlocks */, (vm, { op1: _state }) => {
    let state = vm.fetchValue(_state);
    let { blocks } = vm.stack.peek();
    bindBlock('&attrs', 'attrs', state, blocks, vm);
    bindBlock('&else', 'else', state, blocks, vm);
    bindBlock('&default', 'main', state, blocks, vm);
});
// Dynamic Invocation Only
_opcodes.APPEND_OPCODES.add(98 /* InvokeComponentLayout */, (vm, { op1: _state }) => {
    let state = vm.fetchValue(_state);
    vm.call(state.handle);
});
_opcodes.APPEND_OPCODES.add(102 /* DidRenderLayout */, (vm, { op1: _state }) => {
    let { manager, state, capabilities } = vm.fetchValue(_state);
    let bounds = vm.elements().popBlock();
    if (!(0, _capabilities.managerHasCapability)(manager, capabilities, 512 /* CreateInstance */)) {
        throw new Error(`BUG`);
    }
    let mgr = manager;
    mgr.didRenderLayout(state, bounds);
    vm.env.didCreate(state, manager);
    vm.updateWith(new DidUpdateLayoutOpcode(manager, state, bounds));
});
_opcodes.APPEND_OPCODES.add(100 /* CommitComponentTransaction */, vm => {
    vm.commitCacheGroup();
});
class UpdateComponentOpcode extends _opcodes.UpdatingOpcode {
    constructor(tag, component, manager, dynamicScope) {
        super();
        this.tag = tag;
        this.component = component;
        this.manager = manager;
        this.dynamicScope = dynamicScope;
        this.type = 'update-component';
    }
    evaluate(_vm) {
        let { component, manager, dynamicScope } = this;
        manager.update(component, dynamicScope);
    }
}
exports.UpdateComponentOpcode = UpdateComponentOpcode;
class DidUpdateLayoutOpcode extends _opcodes.UpdatingOpcode {
    constructor(manager, component, bounds) {
        super();
        this.manager = manager;
        this.component = component;
        this.bounds = bounds;
        this.type = 'did-update-layout';
        this.tag = _reference.CONSTANT_TAG;
    }
    evaluate(vm) {
        let { manager, component, bounds } = this;
        manager.didUpdateLayout(component, bounds);
        vm.env.didUpdate(component, manager);
    }
}
exports.DidUpdateLayoutOpcode = DidUpdateLayoutOpcode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQTRqQk0seUIsR0FBQSx5QjtRQVNBLDRCLEdBQUEsNEI7UUFXQSwwQixHQUFBLDBCOzs7O0FBamlCTjs7QUFDQTs7QUFDQTs7QUFNQTs7QUFJQTs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBY0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTs7Ozs7Ozs7O0FBVU8sTUFBTSxrREFBTiwyREFBQTtBQXdDUCx3QkFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLEVBQW1DLE1BQUs7QUFDdEMsUUFBSSxRQUFRLEdBQVosS0FBQTtBQUNBLFFBQUksTUFBWSxNQUFoQixHQUFnQixFQUFoQjtBQUVBLFVBQUEsSUFBQSxDQUFXLElBQUEsZ0NBQUEsQ0FBQSxHQUFBLEVBQVgsOENBQVcsQ0FBWDtBQUpGLENBQUE7QUFPQSx3QkFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLEVBQW1DLE1BQUs7QUFDdEMsUUFBSSxRQUFRLEdBQVosS0FBQTtBQUNBLFFBQUksTUFBWSxNQUFoQixJQUFnQixFQUFoQjtBQUVBLFVBQUEsSUFBQSxDQUFXLElBQUEsNkJBQUEsQ0FBWCxHQUFXLENBQVg7QUFKRixDQUFBO0FBT0Esd0JBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxvQkFBQSxFQUFzQyxDQUFBLEVBQUEsRUFBSyxFQUFFLEtBQVAsS0FBSyxFQUFMLEtBQXVCO0FBQzNELFFBQUksUUFBUSxHQUFaLEtBQUE7QUFFQSxRQUFJLGFBQW1CLE1BQXZCLEdBQXVCLEVBQXZCO0FBQ0EsUUFBSSxlQUFxQixNQUF6QixHQUF5QixFQUF6QjtBQUVBLFFBQUksT0FBTyxHQUFBLGtCQUFBLEVBQUEsZUFBQSxDQUFYLEtBQVcsQ0FBWDtBQUNBLFFBQUksV0FBVyxHQUFBLE9BQUEsQ0FBZixR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O0FBQ3RCLFlBQUksRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFlBQUEsS0FBSixJQUFBO0FBRUEsZ0JBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxZQUFBO0FBQ0Q7QUFoQnNEO1FBQW5ELHFCLEdBQUEscUI7QUFtQkEsTUFBQSxxQkFBQSxTQUFBLHVCQUFBLENBQW1EO0FBSXZELGdCQUFBLE9BQUEsRUFBQSxTQUFBLEVBQUEsTUFBQSxFQUd3QjtBQUV0QjtBQUpRLGFBQUEsT0FBQSxHQUFBLE9BQUE7QUFDQSxhQUFBLFNBQUEsR0FBQSxTQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQU5ILGFBQUEsSUFBQSxHQUFBLG1CQUFBO0FBQ0EsYUFBQSxHQUFBLEdBQUEsdUJBQUE7QUFRTjtBQUVELGFBQUEsRUFBQSxFQUF1QjtBQUNyQixZQUFJLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxNQUFBLEtBQUosSUFBQTtBQUVBLGdCQUFBLGVBQUEsQ0FBQSxTQUFBLEVBQUEsTUFBQTtBQUVBLFdBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsT0FBQTtBQUNEO0FBbEJzRDtRQUFuRCxxQixHQUFBLHFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgY2hlY2ssXG4gIENoZWNrRnVuY3Rpb24sXG4gIENoZWNrSGFuZGxlLFxuICBDaGVja0luc3RhbmNlb2YsXG4gIENoZWNrSW50ZXJmYWNlLFxuICBDaGVja1Byb2dyYW1TeW1ib2xUYWJsZSxcbn0gZnJvbSAnQGdsaW1tZXIvZGVidWcnO1xuaW1wb3J0IHtcbiAgQm91bmRzLFxuICBDb21waWxhYmxlVGVtcGxhdGUsXG4gIENvbXBvbmVudERlZmluaXRpb24sXG4gIENvbXBvbmVudERlZmluaXRpb25TdGF0ZSxcbiAgQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgQ29tcG9uZW50TWFuYWdlcixcbiAgRGljdCxcbiAgRHluYW1pY1Njb3BlLFxuICBFbGVtZW50T3BlcmF0aW9ucyxcbiAgSW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyLFxuICBKaXRPckFvdEJsb2NrLFxuICBNYXliZSxcbiAgT3AsXG4gIFByb2dyYW1TeW1ib2xUYWJsZSxcbiAgUmVjYXN0LFxuICBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZSxcbiAgU2NvcGVTbG90LFxuICBWTUFyZ3VtZW50cyxcbiAgV2l0aEFvdER5bmFtaWNMYXlvdXQsXG4gIFdpdGhBb3RTdGF0aWNMYXlvdXQsXG4gIFdpdGhEeW5hbWljVGFnTmFtZSxcbiAgV2l0aEVsZW1lbnRIb29rLFxuICBXaXRoSml0RHluYW1pY0xheW91dCxcbiAgV2l0aEppdFN0YXRpY0xheW91dCxcbiAgV2l0aFVwZGF0ZUhvb2ssXG4gIFdpdGhDcmVhdGVJbnN0YW5jZSxcbiAgSml0UnVudGltZVJlc29sdmVyLFxuICBSdW50aW1lUmVzb2x2ZXIsXG4gIE1vZGlmaWVyTWFuYWdlcixcbn0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1xuICBDT05TVEFOVF9UQUcsXG4gIGlzQ29uc3QsXG4gIGlzQ29uc3RUYWcsXG4gIFRhZyxcbiAgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSxcbiAgVmVyc2lvbmVkUmVmZXJlbmNlLFxufSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgYXNzZXJ0LCBkaWN0LCBleHBlY3QsIE9wdGlvbiwgdW5yZWFjaGFibGUgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7ICR0MCwgJHQxLCAkdjAgfSBmcm9tICdAZ2xpbW1lci92bSc7XG5pbXBvcnQge1xuICBDYXBhYmlsaXR5LFxuICBjYXBhYmlsaXR5RmxhZ3NGcm9tLFxuICBtYW5hZ2VySGFzQ2FwYWJpbGl0eSxcbiAgaGFzQ2FwYWJpbGl0eSxcbn0gZnJvbSAnLi4vLi4vY2FwYWJpbGl0aWVzJztcbmltcG9ydCB7XG4gIEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uLFxuICBpc0N1cnJpZWRDb21wb25lbnREZWZpbml0aW9uLFxufSBmcm9tICcuLi8uLi9jb21wb25lbnQvY3VycmllZC1jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9yZXNvbHZlJztcbmltcG9ydCB7IEFQUEVORF9PUENPREVTLCBVcGRhdGluZ09wY29kZSB9IGZyb20gJy4uLy4uL29wY29kZXMnO1xuaW1wb3J0IENsYXNzTGlzdFJlZmVyZW5jZSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzL2NsYXNzLWxpc3QnO1xuaW1wb3J0IEN1cnJ5Q29tcG9uZW50UmVmZXJlbmNlIGZyb20gJy4uLy4uL3JlZmVyZW5jZXMvY3VycnktY29tcG9uZW50JztcbmltcG9ydCB7IEFSR1MsIENPTlNUQU5UUyB9IGZyb20gJy4uLy4uL3N5bWJvbHMnO1xuaW1wb3J0IHsgVXBkYXRpbmdWTSB9IGZyb20gJy4uLy4uL3ZtJztcbmltcG9ydCB7IEludGVybmFsVk0gfSBmcm9tICcuLi8uLi92bS9hcHBlbmQnO1xuaW1wb3J0IHsgQmxvY2tBcmd1bWVudHNJbXBsLCBWTUFyZ3VtZW50c0ltcGwgfSBmcm9tICcuLi8uLi92bS9hcmd1bWVudHMnO1xuaW1wb3J0IHtcbiAgQ2hlY2tBcmd1bWVudHMsXG4gIENoZWNrQ2FwdHVyZWRBcmd1bWVudHMsXG4gIENoZWNrQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSxcbiAgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlLFxuICBDaGVja0ludm9jYXRpb24sXG4gIENoZWNrUGF0aFJlZmVyZW5jZSxcbiAgQ2hlY2tSZWZlcmVuY2UsXG59IGZyb20gJy4vLWRlYnVnLXN0cmlwJztcbmltcG9ydCB7IENvbnRlbnRUeXBlUmVmZXJlbmNlIH0gZnJvbSAnLi9jb250ZW50JztcbmltcG9ydCB7IFVwZGF0ZUR5bmFtaWNBdHRyaWJ1dGVPcGNvZGUgfSBmcm9tICcuL2RvbSc7XG5pbXBvcnQgeyBDb25kaXRpb25hbFJlZmVyZW5jZSB9IGZyb20gJy4uLy4uL3JlZmVyZW5jZXMnO1xuXG4vKipcbiAqIFRoZSBWTSBjcmVhdGVzIGEgbmV3IENvbXBvbmVudEluc3RhbmNlIGRhdGEgc3RydWN0dXJlIGZvciBldmVyeSBjb21wb25lbnRcbiAqIGludm9jYXRpb24gaXQgZW5jb3VudGVycy5cbiAqXG4gKiBTaW1pbGFyIHRvIGhvdyBhIENvbXBvbmVudERlZmluaXRpb24gY29udGFpbnMgc3RhdGUgYWJvdXQgYWxsIGNvbXBvbmVudHMgb2YgYVxuICogcGFydGljdWxhciB0eXBlLCBhIENvbXBvbmVudEluc3RhbmNlIGNvbnRhaW5zIHN0YXRlIHNwZWNpZmljIHRvIGEgcGFydGljdWxhclxuICogaW5zdGFuY2Ugb2YgYSBjb21wb25lbnQgdHlwZS4gSXQgYWxzbyBjb250YWlucyBhIHBvaW50ZXIgYmFjayB0byBpdHNcbiAqIGNvbXBvbmVudCB0eXBlJ3MgQ29tcG9uZW50RGVmaW5pdGlvbi5cbiAqL1xuXG5leHBvcnQgY29uc3QgQ09NUE9ORU5UX0lOU1RBTkNFID0gJ0NPTVBPTkVOVF9JTlNUQU5DRSBbYzU2YzU3ZGUtZTczYS00ZWYwLWIxMzctMDc2NjFkYTE3MDI5XSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50SW5zdGFuY2Uge1xuICBbQ09NUE9ORU5UX0lOU1RBTkNFXTogdHJ1ZTtcbiAgZGVmaW5pdGlvbjogQ29tcG9uZW50RGVmaW5pdGlvbjtcbiAgbWFuYWdlcjogQ29tcG9uZW50TWFuYWdlcjtcbiAgY2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5O1xuICBzdGF0ZTogQ29tcG9uZW50SW5zdGFuY2VTdGF0ZTtcbiAgaGFuZGxlOiBudW1iZXI7XG4gIHRhYmxlOiBQcm9ncmFtU3ltYm9sVGFibGU7XG4gIGxvb2t1cDogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEppdE9yQW90QmxvY2s+Pj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5pdGlhbENvbXBvbmVudEluc3RhbmNlIHtcbiAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWU7XG4gIGRlZmluaXRpb246IFBhcnRpYWxDb21wb25lbnREZWZpbml0aW9uO1xuICBtYW5hZ2VyOiBPcHRpb248SW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyPjtcbiAgY2FwYWJpbGl0aWVzOiBPcHRpb248Q2FwYWJpbGl0eT47XG4gIHN0YXRlOiBudWxsO1xuICBoYW5kbGU6IE9wdGlvbjxudW1iZXI+O1xuICB0YWJsZTogT3B0aW9uPFByb2dyYW1TeW1ib2xUYWJsZT47XG4gIGxvb2t1cDogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEppdE9yQW90QmxvY2s+Pj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9wdWxhdGVkQ29tcG9uZW50SW5zdGFuY2Uge1xuICBbQ09NUE9ORU5UX0lOU1RBTkNFXTogdHJ1ZTtcbiAgZGVmaW5pdGlvbjogQ29tcG9uZW50RGVmaW5pdGlvbjtcbiAgbWFuYWdlcjogQ29tcG9uZW50TWFuYWdlcjx1bmtub3duPjtcbiAgY2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5O1xuICBzdGF0ZTogbnVsbDtcbiAgaGFuZGxlOiBudW1iZXI7XG4gIHRhYmxlOiBPcHRpb248UHJvZ3JhbVN5bWJvbFRhYmxlPjtcbiAgbG9va3VwOiBPcHRpb248RGljdDxTY29wZVNsb3Q8Sml0T3JBb3RCbG9jaz4+Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXJ0aWFsQ29tcG9uZW50RGVmaW5pdGlvbiB7XG4gIHN0YXRlOiBPcHRpb248Q29tcG9uZW50RGVmaW5pdGlvblN0YXRlPjtcbiAgbWFuYWdlcjogSW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyO1xufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuSXNDb21wb25lbnQsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCByZWYgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuXG4gIHN0YWNrLnB1c2gobmV3IENvbmRpdGlvbmFsUmVmZXJlbmNlKHJlZiwgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbikpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Db250ZW50VHlwZSwgdm0gPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IHJlZiA9IGNoZWNrKHN0YWNrLnBlZWsoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuXG4gIHN0YWNrLnB1c2gobmV3IENvbnRlbnRUeXBlUmVmZXJlbmNlKHJlZikpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5DdXJyeUNvbXBvbmVudCwgKHZtLCB7IG9wMTogX21ldGEgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcblxuICBsZXQgZGVmaW5pdGlvbiA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG4gIGxldCBjYXB0dXJlZEFyZ3MgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tDYXB0dXJlZEFyZ3VtZW50cyk7XG5cbiAgbGV0IG1ldGEgPSB2bVtDT05TVEFOVFNdLmdldFRlbXBsYXRlTWV0YShfbWV0YSk7XG4gIGxldCByZXNvbHZlciA9IHZtLnJ1bnRpbWUucmVzb2x2ZXI7XG5cbiAgdm0ubG9hZFZhbHVlKCR2MCwgbmV3IEN1cnJ5Q29tcG9uZW50UmVmZXJlbmNlKGRlZmluaXRpb24sIHJlc29sdmVyLCBtZXRhLCBjYXB0dXJlZEFyZ3MpKTtcblxuICAvLyBleHBlY3RTdGFja0NoYW5nZSh2bS5zdGFjaywgLWFyZ3MubGVuZ3RoIC0gMSwgJ0N1cnJ5Q29tcG9uZW50Jyk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hDb21wb25lbnREZWZpbml0aW9uLCAodm0sIHsgb3AxOiBoYW5kbGUgfSkgPT4ge1xuICBsZXQgZGVmaW5pdGlvbiA9IHZtLnJ1bnRpbWUucmVzb2x2ZXIucmVzb2x2ZTxDb21wb25lbnREZWZpbml0aW9uPihoYW5kbGUpO1xuICBhc3NlcnQoISFkZWZpbml0aW9uLCBgTWlzc2luZyBjb21wb25lbnQgZm9yICR7aGFuZGxlfWApO1xuXG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG4gIGxldCBjYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXR5RmxhZ3NGcm9tKG1hbmFnZXIuZ2V0Q2FwYWJpbGl0aWVzKGRlZmluaXRpb24uc3RhdGUpKTtcblxuICBsZXQgaW5zdGFuY2U6IEluaXRpYWxDb21wb25lbnRJbnN0YW5jZSA9IHtcbiAgICBbQ09NUE9ORU5UX0lOU1RBTkNFXTogdHJ1ZSxcbiAgICBkZWZpbml0aW9uLFxuICAgIG1hbmFnZXIsXG4gICAgY2FwYWJpbGl0aWVzLFxuICAgIHN0YXRlOiBudWxsLFxuICAgIGhhbmRsZTogbnVsbCxcbiAgICB0YWJsZTogbnVsbCxcbiAgICBsb29rdXA6IG51bGwsXG4gIH07XG5cbiAgdm0uc3RhY2sucHVzaChpbnN0YW5jZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlJlc29sdmVEeW5hbWljQ29tcG9uZW50LCAodm0sIHsgb3AxOiBfbWV0YSB9KSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgY29tcG9uZW50ID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUGF0aFJlZmVyZW5jZSkudmFsdWUoKSBhcyBNYXliZTxEaWN0PjtcbiAgbGV0IG1ldGEgPSB2bVtDT05TVEFOVFNdLmdldFRlbXBsYXRlTWV0YShfbWV0YSk7XG5cbiAgdm0ubG9hZFZhbHVlKCR0MSwgbnVsbCk7IC8vIENsZWFyIHRoZSB0ZW1wIHJlZ2lzdGVyXG5cbiAgbGV0IGRlZmluaXRpb246IENvbXBvbmVudERlZmluaXRpb24gfCBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbjtcblxuICBpZiAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ3N0cmluZycpIHtcbiAgICBsZXQgcmVzb2x2ZWREZWZpbml0aW9uID0gcmVzb2x2ZUNvbXBvbmVudCh2bS5ydW50aW1lLnJlc29sdmVyLCBjb21wb25lbnQsIG1ldGEpO1xuXG4gICAgZGVmaW5pdGlvbiA9IGV4cGVjdChyZXNvbHZlZERlZmluaXRpb24sIGBDb3VsZCBub3QgZmluZCBhIGNvbXBvbmVudCBuYW1lZCBcIiR7Y29tcG9uZW50fVwiYCk7XG4gIH0gZWxzZSBpZiAoaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihjb21wb25lbnQpKSB7XG4gICAgZGVmaW5pdGlvbiA9IGNvbXBvbmVudDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICB9XG5cbiAgc3RhY2sucHVzaChkZWZpbml0aW9uKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHVzaER5bmFtaWNDb21wb25lbnRJbnN0YW5jZSwgdm0gPT4ge1xuICBsZXQgeyBzdGFjayB9ID0gdm07XG4gIGxldCBkZWZpbml0aW9uID0gc3RhY2sucG9wPENvbXBvbmVudERlZmluaXRpb24+KCk7XG5cbiAgbGV0IGNhcGFiaWxpdGllcywgbWFuYWdlcjtcblxuICBpZiAoaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihkZWZpbml0aW9uKSkge1xuICAgIG1hbmFnZXIgPSBjYXBhYmlsaXRpZXMgPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIG1hbmFnZXIgPSBkZWZpbml0aW9uLm1hbmFnZXI7XG4gICAgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKSk7XG4gIH1cblxuICBzdGFjay5wdXNoKHsgZGVmaW5pdGlvbiwgY2FwYWJpbGl0aWVzLCBtYW5hZ2VyLCBzdGF0ZTogbnVsbCwgaGFuZGxlOiBudWxsLCB0YWJsZTogbnVsbCB9KTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHVzaEN1cnJpZWRDb21wb25lbnQsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG5cbiAgbGV0IGNvbXBvbmVudCA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpLnZhbHVlKCkgYXMgTWF5YmU8RGljdD47XG4gIGxldCBkZWZpbml0aW9uOiBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbjtcblxuICBpZiAoaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihjb21wb25lbnQpKSB7XG4gICAgZGVmaW5pdGlvbiA9IGNvbXBvbmVudDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICB9XG5cbiAgc3RhY2sucHVzaChkZWZpbml0aW9uKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHVzaEFyZ3MsICh2bSwgeyBvcDE6IF9uYW1lcywgb3AyOiBmbGFncyB9KSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgbmFtZXMgPSB2bVtDT05TVEFOVFNdLmdldFN0cmluZ0FycmF5KF9uYW1lcyk7XG5cbiAgbGV0IHBvc2l0aW9uYWxDb3VudCA9IGZsYWdzID4+IDQ7XG4gIGxldCBhdE5hbWVzID0gZmxhZ3MgJiAwYjEwMDA7XG4gIGxldCBibG9ja05hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGlmIChmbGFncyAmIDBiMDEwMCkgYmxvY2tOYW1lcy5wdXNoKCdtYWluJyk7XG4gIGlmIChmbGFncyAmIDBiMDAxMCkgYmxvY2tOYW1lcy5wdXNoKCdlbHNlJyk7XG4gIGlmIChmbGFncyAmIDBiMDAwMSkgYmxvY2tOYW1lcy5wdXNoKCdhdHRycycpO1xuXG4gIHZtW0FSR1NdLnNldHVwKHN0YWNrLCBuYW1lcywgYmxvY2tOYW1lcywgcG9zaXRpb25hbENvdW50LCAhIWF0TmFtZXMpO1xuICBzdGFjay5wdXNoKHZtW0FSR1NdKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHVzaEVtcHR5QXJncywgdm0gPT4ge1xuICBsZXQgeyBzdGFjayB9ID0gdm07XG5cbiAgc3RhY2sucHVzaCh2bVtBUkdTXS5lbXB0eShzdGFjaykpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5DYXB0dXJlQXJncywgdm0gPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcblxuICBsZXQgYXJncyA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja0luc3RhbmNlb2YoVk1Bcmd1bWVudHNJbXBsKSk7XG4gIGxldCBjYXB0dXJlZEFyZ3MgPSBhcmdzLmNhcHR1cmUoKTtcbiAgc3RhY2sucHVzaChjYXB0dXJlZEFyZ3MpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QcmVwYXJlQXJncywgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCBpbnN0YW5jZSA9IHZtLmZldGNoVmFsdWU8Q29tcG9uZW50SW5zdGFuY2U+KF9zdGF0ZSk7XG4gIGxldCBhcmdzID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrSW5zdGFuY2VvZihWTUFyZ3VtZW50c0ltcGwpKTtcblxuICBsZXQgeyBkZWZpbml0aW9uIH0gPSBpbnN0YW5jZTtcblxuICBpZiAoaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihkZWZpbml0aW9uKSkge1xuICAgIGFzc2VydChcbiAgICAgICFkZWZpbml0aW9uLm1hbmFnZXIsXG4gICAgICBcIklmIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbiB3YXMgY3VycmllZCwgd2UgZG9uJ3QgeWV0IGhhdmUgYSBtYW5hZ2VyXCJcbiAgICApO1xuICAgIGRlZmluaXRpb24gPSByZXNvbHZlQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oaW5zdGFuY2UsIGRlZmluaXRpb24sIGFyZ3MpO1xuICB9XG5cbiAgbGV0IHsgbWFuYWdlciwgc3RhdGUgfSA9IGRlZmluaXRpb247XG4gIGxldCBjYXBhYmlsaXRpZXMgPSBpbnN0YW5jZS5jYXBhYmlsaXRpZXM7XG5cbiAgaWYgKCFtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuUHJlcGFyZUFyZ3MpKSB7XG4gICAgc3RhY2sucHVzaChhcmdzKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgYmxvY2tzID0gYXJncy5ibG9ja3MudmFsdWVzO1xuICBsZXQgYmxvY2tOYW1lcyA9IGFyZ3MuYmxvY2tzLm5hbWVzO1xuICBsZXQgcHJlcGFyZWRBcmdzID0gbWFuYWdlci5wcmVwYXJlQXJncyhzdGF0ZSwgYXJncyk7XG5cbiAgaWYgKHByZXBhcmVkQXJncykge1xuICAgIGFyZ3MuY2xlYXIoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzdGFjay5wdXNoKGJsb2Nrc1tpXSk7XG4gICAgfVxuXG4gICAgbGV0IHsgcG9zaXRpb25hbCwgbmFtZWQgfSA9IHByZXBhcmVkQXJncztcblxuICAgIGxldCBwb3NpdGlvbmFsQ291bnQgPSBwb3NpdGlvbmFsLmxlbmd0aDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zaXRpb25hbENvdW50OyBpKyspIHtcbiAgICAgIHN0YWNrLnB1c2gocG9zaXRpb25hbFtpXSk7XG4gICAgfVxuXG4gICAgbGV0IG5hbWVzID0gT2JqZWN0LmtleXMobmFtZWQpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgc3RhY2sucHVzaChuYW1lZFtuYW1lc1tpXV0pO1xuICAgIH1cblxuICAgIGFyZ3Muc2V0dXAoc3RhY2ssIG5hbWVzLCBibG9ja05hbWVzLCBwb3NpdGlvbmFsQ291bnQsIGZhbHNlKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goYXJncyk7XG59KTtcblxuZnVuY3Rpb24gcmVzb2x2ZUN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKFxuICBpbnN0YW5jZTogQ29tcG9uZW50SW5zdGFuY2UsXG4gIGRlZmluaXRpb246IEN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uLFxuICBhcmdzOiBWTUFyZ3VtZW50c0ltcGxcbik6IENvbXBvbmVudERlZmluaXRpb24ge1xuICBsZXQgdW53cmFwcGVkRGVmaW5pdGlvbiA9IChpbnN0YW5jZS5kZWZpbml0aW9uID0gZGVmaW5pdGlvbi51bndyYXAoYXJncykpO1xuICBsZXQgeyBtYW5hZ2VyLCBzdGF0ZSB9ID0gdW53cmFwcGVkRGVmaW5pdGlvbjtcblxuICBhc3NlcnQoaW5zdGFuY2UubWFuYWdlciA9PT0gbnVsbCwgJ2NvbXBvbmVudCBpbnN0YW5jZSBtYW5hZ2VyIHNob3VsZCBub3QgYmUgcG9wdWxhdGVkIHlldCcpO1xuICBhc3NlcnQoaW5zdGFuY2UuY2FwYWJpbGl0aWVzID09PSBudWxsLCAnY29tcG9uZW50IGluc3RhbmNlIG1hbmFnZXIgc2hvdWxkIG5vdCBiZSBwb3B1bGF0ZWQgeWV0Jyk7XG5cbiAgaW5zdGFuY2UubWFuYWdlciA9IG1hbmFnZXI7XG4gIGluc3RhbmNlLmNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdHlGbGFnc0Zyb20obWFuYWdlci5nZXRDYXBhYmlsaXRpZXMoc3RhdGUpKTtcblxuICByZXR1cm4gdW53cmFwcGVkRGVmaW5pdGlvbjtcbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNyZWF0ZUNvbXBvbmVudCwgKHZtLCB7IG9wMTogZmxhZ3MsIG9wMjogX3N0YXRlIH0pID0+IHtcbiAgbGV0IGluc3RhbmNlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgZGVmaW5pdGlvbiwgbWFuYWdlciB9ID0gaW5zdGFuY2U7XG5cbiAgbGV0IGNhcGFiaWxpdGllcyA9IChpbnN0YW5jZS5jYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXR5RmxhZ3NGcm9tKFxuICAgIG1hbmFnZXIuZ2V0Q2FwYWJpbGl0aWVzKGRlZmluaXRpb24uc3RhdGUpXG4gICkpO1xuXG4gIGlmICghbWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkNyZWF0ZUluc3RhbmNlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQlVHYCk7XG4gIH1cblxuICBsZXQgZHluYW1pY1Njb3BlOiBPcHRpb248RHluYW1pY1Njb3BlPiA9IG51bGw7XG4gIGlmIChtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuRHluYW1pY1Njb3BlKSkge1xuICAgIGR5bmFtaWNTY29wZSA9IHZtLmR5bmFtaWNTY29wZSgpO1xuICB9XG5cbiAgbGV0IGhhc0RlZmF1bHRCbG9jayA9IGZsYWdzICYgMTtcbiAgbGV0IGFyZ3M6IE9wdGlvbjxWTUFyZ3VtZW50cz4gPSBudWxsO1xuXG4gIGlmIChtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuQ3JlYXRlQXJncykpIHtcbiAgICBhcmdzID0gY2hlY2sodm0uc3RhY2sucGVlaygpLCBDaGVja0FyZ3VtZW50cyk7XG4gIH1cblxuICBsZXQgc2VsZjogT3B0aW9uPFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+ID0gbnVsbDtcbiAgaWYgKG1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5DcmVhdGVDYWxsZXIpKSB7XG4gICAgc2VsZiA9IHZtLmdldFNlbGYoKTtcbiAgfVxuXG4gIGxldCBzdGF0ZSA9IG1hbmFnZXIuY3JlYXRlKHZtLmVudiwgZGVmaW5pdGlvbi5zdGF0ZSwgYXJncywgZHluYW1pY1Njb3BlLCBzZWxmLCAhIWhhc0RlZmF1bHRCbG9jayk7XG5cbiAgLy8gV2Ugd2FudCB0byByZXVzZSB0aGUgYHN0YXRlYCBQT0pPIGhlcmUsIGJlY2F1c2Ugd2Uga25vdyB0aGF0IHRoZSBvcGNvZGVzXG4gIC8vIG9ubHkgdHJhbnNpdGlvbiBhdCBleGFjdGx5IG9uZSBwbGFjZS5cbiAgaW5zdGFuY2Uuc3RhdGUgPSBzdGF0ZTtcblxuICBsZXQgdGFnID0gbWFuYWdlci5nZXRUYWcoc3RhdGUpO1xuXG4gIGlmIChtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuVXBkYXRlSG9vaykgJiYgIWlzQ29uc3RUYWcodGFnKSkge1xuICAgIHZtLnVwZGF0ZVdpdGgobmV3IFVwZGF0ZUNvbXBvbmVudE9wY29kZSh0YWcsIHN0YXRlLCBtYW5hZ2VyLCBkeW5hbWljU2NvcGUpKTtcbiAgfVxufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5SZWdpc3RlckNvbXBvbmVudERlc3RydWN0b3IsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IG1hbmFnZXIsIHN0YXRlIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuXG4gIGxldCBkID0gbWFuYWdlci5nZXREZXN0cnVjdG9yKHN0YXRlKTtcbiAgaWYgKGQpIHZtLmFzc29jaWF0ZURlc3Ryb3lhYmxlKGQpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5CZWdpbkNvbXBvbmVudFRyYW5zYWN0aW9uLCB2bSA9PiB7XG4gIHZtLmJlZ2luQ2FjaGVHcm91cCgpO1xuICB2bS5lbGVtZW50cygpLnB1c2hTaW1wbGVCbG9jaygpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXRDb21wb25lbnRPcGVyYXRpb25zLCB2bSA9PiB7XG4gIHZtLmxvYWRWYWx1ZSgkdDAsIG5ldyBDb21wb25lbnRFbGVtZW50T3BlcmF0aW9ucygpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ29tcG9uZW50QXR0ciwgKHZtLCB7IG9wMTogX25hbWUsIG9wMjogdHJ1c3RpbmcsIG9wMzogX25hbWVzcGFjZSB9KSA9PiB7XG4gIGxldCBuYW1lID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcoX25hbWUpO1xuICBsZXQgcmVmZXJlbmNlID0gY2hlY2sodm0uc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKTtcbiAgbGV0IG5hbWVzcGFjZSA9IF9uYW1lc3BhY2UgPyB2bVtDT05TVEFOVFNdLmdldFN0cmluZyhfbmFtZXNwYWNlKSA6IG51bGw7XG5cbiAgY2hlY2sodm0uZmV0Y2hWYWx1ZSgkdDApLCBDaGVja0luc3RhbmNlb2YoQ29tcG9uZW50RWxlbWVudE9wZXJhdGlvbnMpKS5zZXRBdHRyaWJ1dGUoXG4gICAgbmFtZSxcbiAgICByZWZlcmVuY2UsXG4gICAgISF0cnVzdGluZyxcbiAgICBuYW1lc3BhY2VcbiAgKTtcbn0pO1xuXG5pbnRlcmZhY2UgRGVmZXJyZWRBdHRyaWJ1dGUge1xuICB2YWx1ZTogVmVyc2lvbmVkUmVmZXJlbmNlPHVua25vd24+O1xuICBuYW1lc3BhY2U6IE9wdGlvbjxzdHJpbmc+O1xuICB0cnVzdGluZzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEVsZW1lbnRPcGVyYXRpb25zIGltcGxlbWVudHMgRWxlbWVudE9wZXJhdGlvbnMge1xuICBwcml2YXRlIGF0dHJpYnV0ZXMgPSBkaWN0PERlZmVycmVkQXR0cmlidXRlPigpO1xuICBwcml2YXRlIGNsYXNzZXM6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPltdID0gW107XG4gIHByaXZhdGUgbW9kaWZpZXJzOiBbTW9kaWZpZXJNYW5hZ2VyPHVua25vd24+LCB1bmtub3duXVtdID0gW107XG5cbiAgc2V0QXR0cmlidXRlKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB2YWx1ZTogVmVyc2lvbmVkUmVmZXJlbmNlPHVua25vd24+LFxuICAgIHRydXN0aW5nOiBib29sZWFuLFxuICAgIG5hbWVzcGFjZTogT3B0aW9uPHN0cmluZz5cbiAgKSB7XG4gICAgbGV0IGRlZmVycmVkID0geyB2YWx1ZSwgbmFtZXNwYWNlLCB0cnVzdGluZyB9O1xuXG4gICAgaWYgKG5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgIHRoaXMuY2xhc3Nlcy5wdXNoKHZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmF0dHJpYnV0ZXNbbmFtZV0gPSBkZWZlcnJlZDtcbiAgfVxuXG4gIGFkZE1vZGlmaWVyPFM+KG1hbmFnZXI6IE1vZGlmaWVyTWFuYWdlcjxTPiwgc3RhdGU6IFMpOiB2b2lkIHtcbiAgICB0aGlzLm1vZGlmaWVycy5wdXNoKFttYW5hZ2VyLCBzdGF0ZV0pO1xuICB9XG5cbiAgZmx1c2godm06IEludGVybmFsVk08Sml0T3JBb3RCbG9jaz4pOiBbTW9kaWZpZXJNYW5hZ2VyPHVua25vd24+LCB1bmtub3duXVtdIHtcbiAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgbGV0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG4gICAgICBsZXQgeyB2YWx1ZTogcmVmZXJlbmNlLCBuYW1lc3BhY2UsIHRydXN0aW5nIH0gPSBhdHRyO1xuXG4gICAgICBpZiAobmFtZSA9PT0gJ2NsYXNzJykge1xuICAgICAgICByZWZlcmVuY2UgPSBuZXcgQ2xhc3NMaXN0UmVmZXJlbmNlKHRoaXMuY2xhc3Nlcyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChuYW1lID09PSAndHlwZScpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGxldCBhdHRyaWJ1dGUgPSB2bVxuICAgICAgICAuZWxlbWVudHMoKVxuICAgICAgICAuc2V0RHluYW1pY0F0dHJpYnV0ZShuYW1lLCByZWZlcmVuY2UudmFsdWUoKSwgdHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG5cbiAgICAgIGlmICghaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgICAgIHZtLnVwZGF0ZVdpdGgobmV3IFVwZGF0ZUR5bmFtaWNBdHRyaWJ1dGVPcGNvZGUocmVmZXJlbmNlLCBhdHRyaWJ1dGUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoJ3R5cGUnIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgbGV0IHR5cGUgPSB0aGlzLmF0dHJpYnV0ZXMudHlwZTtcbiAgICAgIGxldCB7IHZhbHVlOiByZWZlcmVuY2UsIG5hbWVzcGFjZSwgdHJ1c3RpbmcgfSA9IHR5cGU7XG5cbiAgICAgIGxldCBhdHRyaWJ1dGUgPSB2bVxuICAgICAgICAuZWxlbWVudHMoKVxuICAgICAgICAuc2V0RHluYW1pY0F0dHJpYnV0ZSgndHlwZScsIHJlZmVyZW5jZS52YWx1ZSgpLCB0cnVzdGluZywgbmFtZXNwYWNlKTtcblxuICAgICAgaWYgKCFpc0NvbnN0KHJlZmVyZW5jZSkpIHtcbiAgICAgICAgdm0udXBkYXRlV2l0aChuZXcgVXBkYXRlRHluYW1pY0F0dHJpYnV0ZU9wY29kZShyZWZlcmVuY2UsIGF0dHJpYnV0ZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm1vZGlmaWVycztcbiAgfVxufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuRGlkQ3JlYXRlRWxlbWVudCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgZGVmaW5pdGlvbiwgc3RhdGUgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG5cbiAgbGV0IG9wZXJhdGlvbnMgPSBjaGVjayh2bS5mZXRjaFZhbHVlKCR0MCksIENoZWNrSW5zdGFuY2VvZihDb21wb25lbnRFbGVtZW50T3BlcmF0aW9ucykpO1xuXG4gIChtYW5hZ2VyIGFzIFdpdGhFbGVtZW50SG9vazx1bmtub3duPikuZGlkQ3JlYXRlRWxlbWVudChcbiAgICBzdGF0ZSxcbiAgICBleHBlY3Qodm0uZWxlbWVudHMoKS5jb25zdHJ1Y3RpbmcsIGBFeHBlY3RlZCBhIGNvbnN0cnVjdGluZyBlbGVtZXQgaW4gRGlkQ3JlYXRlT3Bjb2RlYCksXG4gICAgb3BlcmF0aW9uc1xuICApO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5HZXRDb21wb25lbnRTZWxmLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBkZWZpbml0aW9uLCBzdGF0ZSB9ID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgbWFuYWdlciB9ID0gZGVmaW5pdGlvbjtcblxuICB2bS5zdGFjay5wdXNoKG1hbmFnZXIuZ2V0U2VsZihzdGF0ZSkpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5HZXRDb21wb25lbnRUYWdOYW1lLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBkZWZpbml0aW9uLCBzdGF0ZSB9ID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgbWFuYWdlciB9ID0gZGVmaW5pdGlvbjtcblxuICB2bS5zdGFjay5wdXNoKFxuICAgIChtYW5hZ2VyIGFzIFJlY2FzdDxJbnRlcm5hbENvbXBvbmVudE1hbmFnZXIsIFdpdGhEeW5hbWljVGFnTmFtZTx1bmtub3duPj4pLmdldFRhZ05hbWUoc3RhdGUpXG4gICk7XG59KTtcblxuLy8gRHluYW1pYyBJbnZvY2F0aW9uIE9ubHlcbkFQUEVORF9PUENPREVTLmFkZChcbiAgT3AuR2V0Sml0Q29tcG9uZW50TGF5b3V0LFxuICAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICAgIGxldCBpbnN0YW5jZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG5cbiAgICBsZXQgbWFuYWdlciA9IGluc3RhbmNlLm1hbmFnZXIgYXMgV2l0aEppdFN0YXRpY0xheW91dCB8IFdpdGhKaXREeW5hbWljTGF5b3V0O1xuICAgIGxldCB7IGRlZmluaXRpb24gfSA9IGluc3RhbmNlO1xuICAgIGxldCB7IHN0YWNrIH0gPSB2bTtcblxuICAgIGxldCB7IGNhcGFiaWxpdGllcyB9ID0gaW5zdGFuY2U7XG5cbiAgICAvLyBsZXQgaW52b2tlOiB7IGhhbmRsZTogbnVtYmVyOyBzeW1ib2xUYWJsZTogUHJvZ3JhbVN5bWJvbFRhYmxlIH07XG5cbiAgICBsZXQgbGF5b3V0OiBDb21waWxhYmxlVGVtcGxhdGU7XG5cbiAgICBpZiAoaGFzU3RhdGljTGF5b3V0Q2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIG1hbmFnZXIpKSB7XG4gICAgICBsYXlvdXQgPSBtYW5hZ2VyLmdldEppdFN0YXRpY0xheW91dChkZWZpbml0aW9uLnN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgICB9IGVsc2UgaWYgKGhhc0R5bmFtaWNMYXlvdXRDYXBhYmlsaXR5KGNhcGFiaWxpdGllcywgbWFuYWdlcikpIHtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IG1hbmFnZXIuZ2V0Sml0RHluYW1pY0xheW91dChpbnN0YW5jZS5zdGF0ZSwgdm0ucnVudGltZS5yZXNvbHZlciwgdm0uY29udGV4dCk7XG5cbiAgICAgIGlmIChoYXNDYXBhYmlsaXR5KGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5XcmFwcGVkKSkge1xuICAgICAgICBsYXlvdXQgPSB0ZW1wbGF0ZS5hc1dyYXBwZWRMYXlvdXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxheW91dCA9IHRlbXBsYXRlLmFzTGF5b3V0KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHVucmVhY2hhYmxlKCk7XG4gICAgfVxuXG4gICAgbGV0IGhhbmRsZSA9IGxheW91dC5jb21waWxlKHZtLmNvbnRleHQpO1xuXG4gICAgc3RhY2sucHVzaChsYXlvdXQuc3ltYm9sVGFibGUpO1xuICAgIHN0YWNrLnB1c2goaGFuZGxlKTtcbiAgfSxcbiAgJ2ppdCdcbik7XG5cbi8vIER5bmFtaWMgSW52b2NhdGlvbiBPbmx5XG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuR2V0QW90Q29tcG9uZW50TGF5b3V0LCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgaW5zdGFuY2UgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgeyBtYW5hZ2VyLCBkZWZpbml0aW9uIH0gPSBpbnN0YW5jZTtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gIGxldCB7IHN0YXRlOiBpbnN0YW5jZVN0YXRlLCBjYXBhYmlsaXRpZXMgfSA9IGluc3RhbmNlO1xuICBsZXQgeyBzdGF0ZTogZGVmaW5pdGlvblN0YXRlIH0gPSBkZWZpbml0aW9uO1xuXG4gIGxldCBpbnZva2U6IHsgaGFuZGxlOiBudW1iZXI7IHN5bWJvbFRhYmxlOiBQcm9ncmFtU3ltYm9sVGFibGUgfTtcblxuICBpZiAoaGFzU3RhdGljTGF5b3V0Q2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIG1hbmFnZXIpKSB7XG4gICAgaW52b2tlID0gKG1hbmFnZXIgYXMgV2l0aEFvdFN0YXRpY0xheW91dDxcbiAgICAgIENvbXBvbmVudEluc3RhbmNlU3RhdGUsXG4gICAgICBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gICAgICBSdW50aW1lUmVzb2x2ZXJEZWxlZ2F0ZVxuICAgID4pLmdldEFvdFN0YXRpY0xheW91dChkZWZpbml0aW9uU3RhdGUsIHZtLnJ1bnRpbWUucmVzb2x2ZXIpO1xuICB9IGVsc2UgaWYgKGhhc0R5bmFtaWNMYXlvdXRDYXBhYmlsaXR5KGNhcGFiaWxpdGllcywgbWFuYWdlcikpIHtcbiAgICBpbnZva2UgPSAobWFuYWdlciBhcyBXaXRoQW90RHluYW1pY0xheW91dDxcbiAgICAgIENvbXBvbmVudEluc3RhbmNlU3RhdGUsXG4gICAgICBSdW50aW1lUmVzb2x2ZXJcbiAgICA+KS5nZXRBb3REeW5hbWljTGF5b3V0KGluc3RhbmNlU3RhdGUsIHZtLnJ1bnRpbWUucmVzb2x2ZXIpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IHVucmVhY2hhYmxlKCk7XG4gIH1cblxuICBzdGFjay5wdXNoKGludm9rZS5zeW1ib2xUYWJsZSk7XG4gIHN0YWNrLnB1c2goaW52b2tlLmhhbmRsZSk7XG59KTtcblxuLy8gVGhlc2UgdHlwZXMgYXJlIGFic3VyZCBoZXJlXG5leHBvcnQgZnVuY3Rpb24gaGFzU3RhdGljTGF5b3V0Q2FwYWJpbGl0eShcbiAgY2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5LFxuICBfbWFuYWdlcjogSW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyXG4pOiBfbWFuYWdlciBpc1xuICB8IFdpdGhKaXRTdGF0aWNMYXlvdXQ8Q29tcG9uZW50SW5zdGFuY2VTdGF0ZSwgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLCBKaXRSdW50aW1lUmVzb2x2ZXI+XG4gIHwgV2l0aEFvdFN0YXRpY0xheW91dDxDb21wb25lbnRJbnN0YW5jZVN0YXRlLCBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsIFJ1bnRpbWVSZXNvbHZlcj4ge1xuICByZXR1cm4gbWFuYWdlckhhc0NhcGFiaWxpdHkoX21hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5EeW5hbWljTGF5b3V0KSA9PT0gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNKaXRTdGF0aWNMYXlvdXRDYXBhYmlsaXR5KFxuICBjYXBhYmlsaXRpZXM6IENhcGFiaWxpdHksXG4gIF9tYW5hZ2VyOiBJbnRlcm5hbENvbXBvbmVudE1hbmFnZXJcbik6IF9tYW5hZ2VyIGlzIFdpdGhKaXRTdGF0aWNMYXlvdXQ8XG4gIENvbXBvbmVudEluc3RhbmNlU3RhdGUsXG4gIENvbXBvbmVudERlZmluaXRpb25TdGF0ZSxcbiAgSml0UnVudGltZVJlc29sdmVyXG4+IHtcbiAgcmV0dXJuIG1hbmFnZXJIYXNDYXBhYmlsaXR5KF9tYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuRHluYW1pY0xheW91dCkgPT09IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzRHluYW1pY0xheW91dENhcGFiaWxpdHkoXG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eSxcbiAgX21hbmFnZXI6IEludGVybmFsQ29tcG9uZW50TWFuYWdlclxuKTogX21hbmFnZXIgaXNcbiAgfCBXaXRoSml0RHluYW1pY0xheW91dDxDb21wb25lbnRJbnN0YW5jZVN0YXRlLCBKaXRSdW50aW1lUmVzb2x2ZXI+XG4gIHwgV2l0aEFvdER5bmFtaWNMYXlvdXQ8Q29tcG9uZW50SW5zdGFuY2VTdGF0ZSwgUnVudGltZVJlc29sdmVyPiB7XG4gIHJldHVybiBtYW5hZ2VySGFzQ2FwYWJpbGl0eShfbWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkR5bmFtaWNMYXlvdXQpID09PSB0cnVlO1xufVxuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuTWFpbiwgKHZtLCB7IG9wMTogcmVnaXN0ZXIgfSkgPT4ge1xuICBsZXQgZGVmaW5pdGlvbiA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja0NvbXBvbmVudERlZmluaXRpb24pO1xuICBsZXQgaW52b2NhdGlvbiA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja0ludm9jYXRpb24pO1xuXG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG4gIGxldCBjYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXR5RmxhZ3NGcm9tKG1hbmFnZXIuZ2V0Q2FwYWJpbGl0aWVzKGRlZmluaXRpb24uc3RhdGUpKTtcblxuICBsZXQgc3RhdGU6IFBvcHVsYXRlZENvbXBvbmVudEluc3RhbmNlID0ge1xuICAgIFtDT01QT05FTlRfSU5TVEFOQ0VdOiB0cnVlLFxuICAgIGRlZmluaXRpb24sXG4gICAgbWFuYWdlcixcbiAgICBjYXBhYmlsaXRpZXMsXG4gICAgc3RhdGU6IG51bGwsXG4gICAgaGFuZGxlOiBpbnZvY2F0aW9uLmhhbmRsZSxcbiAgICB0YWJsZTogaW52b2NhdGlvbi5zeW1ib2xUYWJsZSxcbiAgICBsb29rdXA6IG51bGwsXG4gIH07XG5cbiAgdm0ubG9hZFZhbHVlKHJlZ2lzdGVyLCBzdGF0ZSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlBvcHVsYXRlTGF5b3V0LCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBzdGFjayB9ID0gdm07XG5cbiAgbGV0IGhhbmRsZSA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja0hhbmRsZSk7XG4gIGxldCB0YWJsZSA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja1Byb2dyYW1TeW1ib2xUYWJsZSk7XG5cbiAgbGV0IHN0YXRlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcblxuICBzdGF0ZS5oYW5kbGUgPSBoYW5kbGU7XG4gIHN0YXRlLnRhYmxlID0gdGFibGU7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlZpcnR1YWxSb290U2NvcGUsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IHN5bWJvbHMgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKS50YWJsZTtcblxuICB2bS5wdXNoUm9vdFNjb3BlKHN5bWJvbHMubGVuZ3RoICsgMSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlNldHVwRm9yRXZhbCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHN0YXRlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0ZpbmlzaGVkQ29tcG9uZW50SW5zdGFuY2UpO1xuXG4gIGlmIChzdGF0ZS50YWJsZS5oYXNFdmFsKSB7XG4gICAgbGV0IGxvb2t1cCA9IChzdGF0ZS5sb29rdXAgPSBkaWN0PFNjb3BlU2xvdDxKaXRPckFvdEJsb2NrPj4oKSk7XG4gICAgdm0uc2NvcGUoKS5iaW5kRXZhbFNjb3BlKGxvb2t1cCk7XG4gIH1cbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuU2V0TmFtZWRWYXJpYWJsZXMsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHNjb3BlID0gdm0uc2NvcGUoKTtcblxuICBsZXQgYXJncyA9IGNoZWNrKHZtLnN0YWNrLnBlZWsoKSwgQ2hlY2tBcmd1bWVudHMpO1xuICBsZXQgY2FsbGVyTmFtZXMgPSBhcmdzLm5hbWVkLmF0TmFtZXM7XG5cbiAgZm9yIChsZXQgaSA9IGNhbGxlck5hbWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGV0IGF0TmFtZSA9IGNhbGxlck5hbWVzW2ldO1xuICAgIGxldCBzeW1ib2wgPSBzdGF0ZS50YWJsZS5zeW1ib2xzLmluZGV4T2YoY2FsbGVyTmFtZXNbaV0pO1xuICAgIGxldCB2YWx1ZSA9IGFyZ3MubmFtZWQuZ2V0KGF0TmFtZSwgdHJ1ZSk7XG5cbiAgICBpZiAoc3ltYm9sICE9PSAtMSkgc2NvcGUuYmluZFN5bWJvbChzeW1ib2wgKyAxLCB2YWx1ZSk7XG4gICAgaWYgKHN0YXRlLmxvb2t1cCkgc3RhdGUubG9va3VwW2F0TmFtZV0gPSB2YWx1ZTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGJpbmRCbG9jazxDIGV4dGVuZHMgSml0T3JBb3RCbG9jaz4oXG4gIHN5bWJvbE5hbWU6IHN0cmluZyxcbiAgYmxvY2tOYW1lOiBzdHJpbmcsXG4gIHN0YXRlOiBDb21wb25lbnRJbnN0YW5jZSxcbiAgYmxvY2tzOiBCbG9ja0FyZ3VtZW50c0ltcGw8Qz4sXG4gIHZtOiBJbnRlcm5hbFZNPEM+XG4pIHtcbiAgbGV0IHN5bWJvbCA9IHN0YXRlLnRhYmxlLnN5bWJvbHMuaW5kZXhPZihzeW1ib2xOYW1lKTtcblxuICBsZXQgYmxvY2sgPSBibG9ja3MuZ2V0KGJsb2NrTmFtZSk7XG5cbiAgaWYgKHN5bWJvbCAhPT0gLTEpIHtcbiAgICB2bS5zY29wZSgpLmJpbmRCbG9jayhzeW1ib2wgKyAxLCBibG9jayk7XG4gIH1cblxuICBpZiAoc3RhdGUubG9va3VwKSBzdGF0ZS5sb29rdXBbc3ltYm9sTmFtZV0gPSBibG9jaztcbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlNldEJsb2NrcywgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHN0YXRlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0ZpbmlzaGVkQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgeyBibG9ja3MgfSA9IGNoZWNrKHZtLnN0YWNrLnBlZWsoKSwgQ2hlY2tBcmd1bWVudHMpO1xuXG4gIGJpbmRCbG9jaygnJmF0dHJzJywgJ2F0dHJzJywgc3RhdGUsIGJsb2Nrcywgdm0pO1xuICBiaW5kQmxvY2soJyZlbHNlJywgJ2Vsc2UnLCBzdGF0ZSwgYmxvY2tzLCB2bSk7XG4gIGJpbmRCbG9jaygnJmRlZmF1bHQnLCAnbWFpbicsIHN0YXRlLCBibG9ja3MsIHZtKTtcbn0pO1xuXG4vLyBEeW5hbWljIEludm9jYXRpb24gT25seVxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkludm9rZUNvbXBvbmVudExheW91dCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHN0YXRlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0ZpbmlzaGVkQ29tcG9uZW50SW5zdGFuY2UpO1xuXG4gIHZtLmNhbGwoc3RhdGUuaGFuZGxlISk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkRpZFJlbmRlckxheW91dCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgbWFuYWdlciwgc3RhdGUsIGNhcGFiaWxpdGllcyB9ID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IGJvdW5kcyA9IHZtLmVsZW1lbnRzKCkucG9wQmxvY2soKTtcblxuICBpZiAoIW1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5DcmVhdGVJbnN0YW5jZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJVR2ApO1xuICB9XG5cbiAgbGV0IG1nciA9IGNoZWNrKG1hbmFnZXIsIENoZWNrSW50ZXJmYWNlKHsgZGlkUmVuZGVyTGF5b3V0OiBDaGVja0Z1bmN0aW9uIH0pKTtcblxuICBtZ3IuZGlkUmVuZGVyTGF5b3V0KHN0YXRlLCBib3VuZHMpO1xuXG4gIHZtLmVudi5kaWRDcmVhdGUoc3RhdGUsIG1hbmFnZXIpO1xuXG4gIHZtLnVwZGF0ZVdpdGgobmV3IERpZFVwZGF0ZUxheW91dE9wY29kZShtYW5hZ2VyLCBzdGF0ZSwgYm91bmRzKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNvbW1pdENvbXBvbmVudFRyYW5zYWN0aW9uLCB2bSA9PiB7XG4gIHZtLmNvbW1pdENhY2hlR3JvdXAoKTtcbn0pO1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlQ29tcG9uZW50T3Bjb2RlIGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICd1cGRhdGUtY29tcG9uZW50JztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdGFnOiBUYWcsXG4gICAgcHJpdmF0ZSBjb21wb25lbnQ6IENvbXBvbmVudEluc3RhbmNlU3RhdGUsXG4gICAgcHJpdmF0ZSBtYW5hZ2VyOiBXaXRoVXBkYXRlSG9vayxcbiAgICBwcml2YXRlIGR5bmFtaWNTY29wZTogT3B0aW9uPER5bmFtaWNTY29wZT5cbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGV2YWx1YXRlKF92bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IGNvbXBvbmVudCwgbWFuYWdlciwgZHluYW1pY1Njb3BlIH0gPSB0aGlzO1xuXG4gICAgbWFuYWdlci51cGRhdGUoY29tcG9uZW50LCBkeW5hbWljU2NvcGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaWRVcGRhdGVMYXlvdXRPcGNvZGUgZXh0ZW5kcyBVcGRhdGluZ09wY29kZSB7XG4gIHB1YmxpYyB0eXBlID0gJ2RpZC11cGRhdGUtbGF5b3V0JztcbiAgcHVibGljIHRhZzogVGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbWFuYWdlcjogV2l0aENyZWF0ZUluc3RhbmNlLFxuICAgIHByaXZhdGUgY29tcG9uZW50OiBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgIHByaXZhdGUgYm91bmRzOiBCb3VuZHNcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGV2YWx1YXRlKHZtOiBVcGRhdGluZ1ZNKSB7XG4gICAgbGV0IHsgbWFuYWdlciwgY29tcG9uZW50LCBib3VuZHMgfSA9IHRoaXM7XG5cbiAgICBtYW5hZ2VyLmRpZFVwZGF0ZUxheW91dChjb21wb25lbnQsIGJvdW5kcyk7XG5cbiAgICB2bS5lbnYuZGlkVXBkYXRlKGNvbXBvbmVudCwgbWFuYWdlcik7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=