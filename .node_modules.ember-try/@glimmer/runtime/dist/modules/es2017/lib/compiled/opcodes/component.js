
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
export const COMPONENT_INSTANCE = 'COMPONENT_INSTANCE [c56c57de-e73a-4ef0-b137-07661da17029]';
APPEND_OPCODES.add(76 /* IsComponent */, vm => {
    let stack = vm.stack;
    let ref = stack.pop();
    stack.push(new ConditionalReference(ref, isCurriedComponentDefinition));
});
APPEND_OPCODES.add(77 /* ContentType */, vm => {
    let stack = vm.stack;
    let ref = stack.peek();
    stack.push(new ContentTypeReference(ref));
});
APPEND_OPCODES.add(78 /* CurryComponent */, (vm, { op1: _meta }) => {
    let stack = vm.stack;
    let definition = stack.pop();
    let capturedArgs = stack.pop();
    let meta = vm[CONSTANTS].getTemplateMeta(_meta);
    let resolver = vm.runtime.resolver;
    vm.loadValue($v0, new CurryComponentReference(definition, resolver, meta, capturedArgs));
    // expectStackChange(vm.stack, -args.length - 1, 'CurryComponent');
});
APPEND_OPCODES.add(79 /* PushComponentDefinition */, (vm, { op1: handle }) => {
    let definition = vm.runtime.resolver.resolve(handle);
    (false && assert(!!definition, `Missing component for ${handle}`));

    let { manager } = definition;
    let capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
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
APPEND_OPCODES.add(82 /* ResolveDynamicComponent */, (vm, { op1: _meta }) => {
    let stack = vm.stack;
    let component = stack.pop().value();
    let meta = vm[CONSTANTS].getTemplateMeta(_meta);
    vm.loadValue($t1, null); // Clear the temp register
    let definition;
    if (typeof component === 'string') {
        let resolvedDefinition = resolveComponent(vm.runtime.resolver, component, meta);
        definition = resolvedDefinition;
    } else if (isCurriedComponentDefinition(component)) {
        definition = component;
    } else {
        throw unreachable();
    }
    stack.push(definition);
});
APPEND_OPCODES.add(80 /* PushDynamicComponentInstance */, vm => {
    let { stack } = vm;
    let definition = stack.pop();
    let capabilities, manager;
    if (isCurriedComponentDefinition(definition)) {
        manager = capabilities = null;
    } else {
        manager = definition.manager;
        capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    }
    stack.push({ definition, capabilities, manager, state: null, handle: null, table: null });
});
APPEND_OPCODES.add(81 /* PushCurriedComponent */, vm => {
    let stack = vm.stack;
    let component = stack.pop().value();
    let definition;
    if (isCurriedComponentDefinition(component)) {
        definition = component;
    } else {
        throw unreachable();
    }
    stack.push(definition);
});
APPEND_OPCODES.add(83 /* PushArgs */, (vm, { op1: _names, op2: flags }) => {
    let stack = vm.stack;
    let names = vm[CONSTANTS].getStringArray(_names);
    let positionalCount = flags >> 4;
    let atNames = flags & 0b1000;
    let blockNames = [];
    if (flags & 0b0100) blockNames.push('main');
    if (flags & 0b0010) blockNames.push('else');
    if (flags & 0b0001) blockNames.push('attrs');
    vm[ARGS].setup(stack, names, blockNames, positionalCount, !!atNames);
    stack.push(vm[ARGS]);
});
APPEND_OPCODES.add(84 /* PushEmptyArgs */, vm => {
    let { stack } = vm;
    stack.push(vm[ARGS].empty(stack));
});
APPEND_OPCODES.add(87 /* CaptureArgs */, vm => {
    let stack = vm.stack;
    let args = stack.pop();
    let capturedArgs = args.capture();
    stack.push(capturedArgs);
});
APPEND_OPCODES.add(86 /* PrepareArgs */, (vm, { op1: _state }) => {
    let stack = vm.stack;
    let instance = vm.fetchValue(_state);
    let args = stack.pop();
    let { definition } = instance;
    if (isCurriedComponentDefinition(definition)) {
        (false && assert(!definition.manager, "If the component definition was curried, we don't yet have a manager"));

        definition = resolveCurriedComponentDefinition(instance, definition, args);
    }
    let { manager, state } = definition;
    let capabilities = instance.capabilities;
    if (!managerHasCapability(manager, capabilities, 4 /* PrepareArgs */)) {
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
    (false && assert(instance.manager === null, 'component instance manager should not be populated yet'));
    (false && assert(instance.capabilities === null, 'component instance manager should not be populated yet'));

    instance.manager = manager;
    instance.capabilities = capabilityFlagsFrom(manager.getCapabilities(state));
    return unwrappedDefinition;
}
APPEND_OPCODES.add(88 /* CreateComponent */, (vm, { op1: flags, op2: _state }) => {
    let instance = vm.fetchValue(_state);
    let { definition, manager } = instance;
    let capabilities = instance.capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
    if (!managerHasCapability(manager, capabilities, 512 /* CreateInstance */)) {
        throw new Error(`BUG`);
    }
    let dynamicScope = null;
    if (managerHasCapability(manager, capabilities, 64 /* DynamicScope */)) {
        dynamicScope = vm.dynamicScope();
    }
    let hasDefaultBlock = flags & 1;
    let args = null;
    if (managerHasCapability(manager, capabilities, 8 /* CreateArgs */)) {
        args = vm.stack.peek();
    }
    let self = null;
    if (managerHasCapability(manager, capabilities, 128 /* CreateCaller */)) {
        self = vm.getSelf();
    }
    let state = manager.create(vm.env, definition.state, args, dynamicScope, self, !!hasDefaultBlock);
    // We want to reuse the `state` POJO here, because we know that the opcodes
    // only transition at exactly one place.
    instance.state = state;
    let tag = manager.getTag(state);
    if (managerHasCapability(manager, capabilities, 256 /* UpdateHook */) && !isConstTag(tag)) {
        vm.updateWith(new UpdateComponentOpcode(tag, state, manager, dynamicScope));
    }
});
APPEND_OPCODES.add(89 /* RegisterComponentDestructor */, (vm, { op1: _state }) => {
    let { manager, state } = vm.fetchValue(_state);
    let d = manager.getDestructor(state);
    if (d) vm.associateDestroyable(d);
});
APPEND_OPCODES.add(99 /* BeginComponentTransaction */, vm => {
    vm.beginCacheGroup();
    vm.elements().pushSimpleBlock();
});
APPEND_OPCODES.add(90 /* PutComponentOperations */, vm => {
    vm.loadValue($t0, new ComponentElementOperations());
});
APPEND_OPCODES.add(52 /* ComponentAttr */, (vm, { op1: _name, op2: trusting, op3: _namespace }) => {
    let name = vm[CONSTANTS].getString(_name);
    let reference = vm.stack.pop();
    let namespace = _namespace ? vm[CONSTANTS].getString(_namespace) : null;
    vm.fetchValue($t0).setAttribute(name, reference, !!trusting, namespace);
});
export class ComponentElementOperations {
    constructor() {
        this.attributes = dict();
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
                reference = new ClassListReference(this.classes);
            }
            if (name === 'type') {
                continue;
            }
            let attribute = vm.elements().setDynamicAttribute(name, reference.value(), trusting, namespace);
            if (!isConst(reference)) {
                vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
            }
        }
        if ('type' in this.attributes) {
            let type = this.attributes.type;
            let { value: reference, namespace, trusting } = type;
            let attribute = vm.elements().setDynamicAttribute('type', reference.value(), trusting, namespace);
            if (!isConst(reference)) {
                vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
            }
        }
        return this.modifiers;
    }
}
APPEND_OPCODES.add(101 /* DidCreateElement */, (vm, { op1: _state }) => {
    let { definition, state } = vm.fetchValue(_state);
    let { manager } = definition;
    let operations = vm.fetchValue($t0);
    manager.didCreateElement(state, vm.elements().constructing, operations);
});
APPEND_OPCODES.add(91 /* GetComponentSelf */, (vm, { op1: _state }) => {
    let { definition, state } = vm.fetchValue(_state);
    let { manager } = definition;
    vm.stack.push(manager.getSelf(state));
});
APPEND_OPCODES.add(92 /* GetComponentTagName */, (vm, { op1: _state }) => {
    let { definition, state } = vm.fetchValue(_state);
    let { manager } = definition;
    vm.stack.push(manager.getTagName(state));
});
// Dynamic Invocation Only
APPEND_OPCODES.add(94 /* GetJitComponentLayout */, (vm, { op1: _state }) => {
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
        if (hasCapability(capabilities, 1024 /* Wrapped */)) {
            layout = template.asWrappedLayout();
        } else {
            layout = template.asLayout();
        }
    } else {
        throw unreachable();
    }
    let handle = layout.compile(vm.context);
    stack.push(layout.symbolTable);
    stack.push(handle);
}, 'jit');
// Dynamic Invocation Only
APPEND_OPCODES.add(93 /* GetAotComponentLayout */, (vm, { op1: _state }) => {
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
APPEND_OPCODES.add(75 /* Main */, (vm, { op1: register }) => {
    let definition = vm.stack.pop();
    let invocation = vm.stack.pop();
    let { manager } = definition;
    let capabilities = capabilityFlagsFrom(manager.getCapabilities(definition.state));
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
APPEND_OPCODES.add(97 /* PopulateLayout */, (vm, { op1: _state }) => {
    let { stack } = vm;
    let handle = stack.pop();
    let table = stack.pop();
    let state = vm.fetchValue(_state);
    state.handle = handle;
    state.table = table;
});
APPEND_OPCODES.add(37 /* VirtualRootScope */, (vm, { op1: _state }) => {
    let { symbols } = vm.fetchValue(_state).table;
    vm.pushRootScope(symbols.length + 1);
});
APPEND_OPCODES.add(96 /* SetupForEval */, (vm, { op1: _state }) => {
    let state = vm.fetchValue(_state);
    if (state.table.hasEval) {
        let lookup = state.lookup = dict();
        vm.scope().bindEvalScope(lookup);
    }
});
APPEND_OPCODES.add(17 /* SetNamedVariables */, (vm, { op1: _state }) => {
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
APPEND_OPCODES.add(18 /* SetBlocks */, (vm, { op1: _state }) => {
    let state = vm.fetchValue(_state);
    let { blocks } = vm.stack.peek();
    bindBlock('&attrs', 'attrs', state, blocks, vm);
    bindBlock('&else', 'else', state, blocks, vm);
    bindBlock('&default', 'main', state, blocks, vm);
});
// Dynamic Invocation Only
APPEND_OPCODES.add(98 /* InvokeComponentLayout */, (vm, { op1: _state }) => {
    let state = vm.fetchValue(_state);
    vm.call(state.handle);
});
APPEND_OPCODES.add(102 /* DidRenderLayout */, (vm, { op1: _state }) => {
    let { manager, state, capabilities } = vm.fetchValue(_state);
    let bounds = vm.elements().popBlock();
    if (!managerHasCapability(manager, capabilities, 512 /* CreateInstance */)) {
        throw new Error(`BUG`);
    }
    let mgr = manager;
    mgr.didRenderLayout(state, bounds);
    vm.env.didCreate(state, manager);
    vm.updateWith(new DidUpdateLayoutOpcode(manager, state, bounds));
});
APPEND_OPCODES.add(100 /* CommitComponentTransaction */, vm => {
    vm.commitCacheGroup();
});
export class UpdateComponentOpcode extends UpdatingOpcode {
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
export class DidUpdateLayoutOpcode extends UpdatingOpcode {
    constructor(manager, component, bounds) {
        super();
        this.manager = manager;
        this.component = component;
        this.bounds = bounds;
        this.type = 'did-update-layout';
        this.tag = CONSTANT_TAG;
    }
    evaluate(vm) {
        let { manager, component, bounds } = this;
        manager.didUpdateLayout(component, bounds);
        vm.env.didUpdate(component, manager);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL29wY29kZXMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUF1Q0EsU0FDRSxZQURGLEVBRUUsT0FGRixFQUdFLFVBSEYsUUFPTyxvQkFQUDtBQVFBLFNBQVMsTUFBVCxFQUFpQixJQUFqQixFQUF1QyxXQUF2QyxRQUEwRCxlQUExRDtBQUNBLFNBQVMsR0FBVCxFQUFjLEdBQWQsRUFBbUIsR0FBbkIsUUFBOEIsYUFBOUI7QUFDQSxTQUVFLG1CQUZGLEVBR0Usb0JBSEYsRUFJRSxhQUpGLFFBS08sb0JBTFA7QUFNQSxTQUVFLDRCQUZGLFFBR08sbUNBSFA7QUFJQSxTQUFTLGdCQUFULFFBQWlDLHlCQUFqQztBQUNBLFNBQVMsY0FBVCxFQUF5QixjQUF6QixRQUErQyxlQUEvQztBQUNBLE9BQU8sa0JBQVAsTUFBK0IsNkJBQS9CO0FBQ0EsT0FBTyx1QkFBUCxNQUFvQyxrQ0FBcEM7QUFDQSxTQUFTLElBQVQsRUFBZSxTQUFmLFFBQWdDLGVBQWhDOztBQWNBLFNBQVMsb0JBQVQsUUFBcUMsV0FBckM7QUFDQSxTQUFTLDRCQUFULFFBQTZDLE9BQTdDO0FBQ0EsU0FBUyxvQkFBVCxRQUFxQyxrQkFBckM7QUFFQTs7Ozs7Ozs7O0FBVUEsT0FBTyxNQUFNLHFCQUFxQiwyREFBM0I7QUF3Q1AsZUFBZSxHQUFmLENBQWtCLEVBQWxCLENBQWtCLGlCQUFsQixFQUFtQyxNQUFLO0FBQ3RDLFFBQUksUUFBUSxHQUFHLEtBQWY7QUFDQSxRQUFJLE1BQVksTUFBTSxHQUFOLEVBQWhCO0FBRUEsVUFBTSxJQUFOLENBQVcsSUFBSSxvQkFBSixDQUF5QixHQUF6QixFQUE4Qiw0QkFBOUIsQ0FBWDtBQUNELENBTEQ7QUFPQSxlQUFlLEdBQWYsQ0FBa0IsRUFBbEIsQ0FBa0IsaUJBQWxCLEVBQW1DLE1BQUs7QUFDdEMsUUFBSSxRQUFRLEdBQUcsS0FBZjtB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QUFxQyxjQUFyQyxDQUFtRDtBQUl2RCxnQkFDVSxPQURWLEVBRVUsU0FGVixFQUdVLE1BSFYsRUFHd0I7QUFFdEI7QUFKUSxhQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQUNBLGFBQUEsTUFBQSxHQUFBLE1BQUE7QUFOSCxhQUFBLElBQUEsR0FBTyxtQkFBUDtBQUNBLGFBQUEsR0FBQSxHQUFXLFlBQVg7QUFRTjtBQUVELGFBQVMsRUFBVCxFQUF1QjtBQUNyQixZQUFJLEVBQUUsT0FBRixFQUFXLFNBQVgsRUFBc0IsTUFBdEIsS0FBaUMsSUFBckM7QUFFQSxnQkFBUSxlQUFSLENBQXdCLFNBQXhCLEVBQW1DLE1BQW5DO0FBRUEsV0FBRyxHQUFILENBQU8sU0FBUCxDQUFpQixTQUFqQixFQUE0QixPQUE1QjtBQUNEO0FBbEJzRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGNoZWNrLFxuICBDaGVja0Z1bmN0aW9uLFxuICBDaGVja0hhbmRsZSxcbiAgQ2hlY2tJbnN0YW5jZW9mLFxuICBDaGVja0ludGVyZmFjZSxcbiAgQ2hlY2tQcm9ncmFtU3ltYm9sVGFibGUsXG59IGZyb20gJ0BnbGltbWVyL2RlYnVnJztcbmltcG9ydCB7XG4gIEJvdW5kcyxcbiAgQ29tcGlsYWJsZVRlbXBsYXRlLFxuICBDb21wb25lbnREZWZpbml0aW9uLFxuICBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gIENvbXBvbmVudEluc3RhbmNlU3RhdGUsXG4gIENvbXBvbmVudE1hbmFnZXIsXG4gIERpY3QsXG4gIER5bmFtaWNTY29wZSxcbiAgRWxlbWVudE9wZXJhdGlvbnMsXG4gIEludGVybmFsQ29tcG9uZW50TWFuYWdlcixcbiAgSml0T3JBb3RCbG9jayxcbiAgTWF5YmUsXG4gIE9wLFxuICBQcm9ncmFtU3ltYm9sVGFibGUsXG4gIFJlY2FzdCxcbiAgUnVudGltZVJlc29sdmVyRGVsZWdhdGUsXG4gIFNjb3BlU2xvdCxcbiAgVk1Bcmd1bWVudHMsXG4gIFdpdGhBb3REeW5hbWljTGF5b3V0LFxuICBXaXRoQW90U3RhdGljTGF5b3V0LFxuICBXaXRoRHluYW1pY1RhZ05hbWUsXG4gIFdpdGhFbGVtZW50SG9vayxcbiAgV2l0aEppdER5bmFtaWNMYXlvdXQsXG4gIFdpdGhKaXRTdGF0aWNMYXlvdXQsXG4gIFdpdGhVcGRhdGVIb29rLFxuICBXaXRoQ3JlYXRlSW5zdGFuY2UsXG4gIEppdFJ1bnRpbWVSZXNvbHZlcixcbiAgUnVudGltZVJlc29sdmVyLFxuICBNb2RpZmllck1hbmFnZXIsXG59IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgQ09OU1RBTlRfVEFHLFxuICBpc0NvbnN0LFxuICBpc0NvbnN0VGFnLFxuICBUYWcsXG4gIFZlcnNpb25lZFBhdGhSZWZlcmVuY2UsXG4gIFZlcnNpb25lZFJlZmVyZW5jZSxcbn0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IGFzc2VydCwgZGljdCwgZXhwZWN0LCBPcHRpb24sIHVucmVhY2hhYmxlIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyAkdDAsICR0MSwgJHYwIH0gZnJvbSAnQGdsaW1tZXIvdm0nO1xuaW1wb3J0IHtcbiAgQ2FwYWJpbGl0eSxcbiAgY2FwYWJpbGl0eUZsYWdzRnJvbSxcbiAgbWFuYWdlckhhc0NhcGFiaWxpdHksXG4gIGhhc0NhcGFiaWxpdHksXG59IGZyb20gJy4uLy4uL2NhcGFiaWxpdGllcyc7XG5pbXBvcnQge1xuICBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgaXNDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2N1cnJpZWQtY29tcG9uZW50JztcbmltcG9ydCB7IHJlc29sdmVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvcmVzb2x2ZSc7XG5pbXBvcnQgeyBBUFBFTkRfT1BDT0RFUywgVXBkYXRpbmdPcGNvZGUgfSBmcm9tICcuLi8uLi9vcGNvZGVzJztcbmltcG9ydCBDbGFzc0xpc3RSZWZlcmVuY2UgZnJvbSAnLi4vLi4vcmVmZXJlbmNlcy9jbGFzcy1saXN0JztcbmltcG9ydCBDdXJyeUNvbXBvbmVudFJlZmVyZW5jZSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzL2N1cnJ5LWNvbXBvbmVudCc7XG5pbXBvcnQgeyBBUkdTLCBDT05TVEFOVFMgfSBmcm9tICcuLi8uLi9zeW1ib2xzJztcbmltcG9ydCB7IFVwZGF0aW5nVk0gfSBmcm9tICcuLi8uLi92bSc7XG5pbXBvcnQgeyBJbnRlcm5hbFZNIH0gZnJvbSAnLi4vLi4vdm0vYXBwZW5kJztcbmltcG9ydCB7IEJsb2NrQXJndW1lbnRzSW1wbCwgVk1Bcmd1bWVudHNJbXBsIH0gZnJvbSAnLi4vLi4vdm0vYXJndW1lbnRzJztcbmltcG9ydCB7XG4gIENoZWNrQXJndW1lbnRzLFxuICBDaGVja0NhcHR1cmVkQXJndW1lbnRzLFxuICBDaGVja0NvbXBvbmVudERlZmluaXRpb24sXG4gIENoZWNrQ29tcG9uZW50SW5zdGFuY2UsXG4gIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSxcbiAgQ2hlY2tJbnZvY2F0aW9uLFxuICBDaGVja1BhdGhSZWZlcmVuY2UsXG4gIENoZWNrUmVmZXJlbmNlLFxufSBmcm9tICcuLy1kZWJ1Zy1zdHJpcCc7XG5pbXBvcnQgeyBDb250ZW50VHlwZVJlZmVyZW5jZSB9IGZyb20gJy4vY29udGVudCc7XG5pbXBvcnQgeyBVcGRhdGVEeW5hbWljQXR0cmlidXRlT3Bjb2RlIH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHsgQ29uZGl0aW9uYWxSZWZlcmVuY2UgfSBmcm9tICcuLi8uLi9yZWZlcmVuY2VzJztcblxuLyoqXG4gKiBUaGUgVk0gY3JlYXRlcyBhIG5ldyBDb21wb25lbnRJbnN0YW5jZSBkYXRhIHN0cnVjdHVyZSBmb3IgZXZlcnkgY29tcG9uZW50XG4gKiBpbnZvY2F0aW9uIGl0IGVuY291bnRlcnMuXG4gKlxuICogU2ltaWxhciB0byBob3cgYSBDb21wb25lbnREZWZpbml0aW9uIGNvbnRhaW5zIHN0YXRlIGFib3V0IGFsbCBjb21wb25lbnRzIG9mIGFcbiAqIHBhcnRpY3VsYXIgdHlwZSwgYSBDb21wb25lbnRJbnN0YW5jZSBjb250YWlucyBzdGF0ZSBzcGVjaWZpYyB0byBhIHBhcnRpY3VsYXJcbiAqIGluc3RhbmNlIG9mIGEgY29tcG9uZW50IHR5cGUuIEl0IGFsc28gY29udGFpbnMgYSBwb2ludGVyIGJhY2sgdG8gaXRzXG4gKiBjb21wb25lbnQgdHlwZSdzIENvbXBvbmVudERlZmluaXRpb24uXG4gKi9cblxuZXhwb3J0IGNvbnN0IENPTVBPTkVOVF9JTlNUQU5DRSA9ICdDT01QT05FTlRfSU5TVEFOQ0UgW2M1NmM1N2RlLWU3M2EtNGVmMC1iMTM3LTA3NjYxZGExNzAyOV0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEluc3RhbmNlIHtcbiAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWU7XG4gIGRlZmluaXRpb246IENvbXBvbmVudERlZmluaXRpb247XG4gIG1hbmFnZXI6IENvbXBvbmVudE1hbmFnZXI7XG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eTtcbiAgc3RhdGU6IENvbXBvbmVudEluc3RhbmNlU3RhdGU7XG4gIGhhbmRsZTogbnVtYmVyO1xuICB0YWJsZTogUHJvZ3JhbVN5bWJvbFRhYmxlO1xuICBsb29rdXA6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxKaXRPckFvdEJsb2NrPj4+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluaXRpYWxDb21wb25lbnRJbnN0YW5jZSB7XG4gIFtDT01QT05FTlRfSU5TVEFOQ0VdOiB0cnVlO1xuICBkZWZpbml0aW9uOiBQYXJ0aWFsQ29tcG9uZW50RGVmaW5pdGlvbjtcbiAgbWFuYWdlcjogT3B0aW9uPEludGVybmFsQ29tcG9uZW50TWFuYWdlcj47XG4gIGNhcGFiaWxpdGllczogT3B0aW9uPENhcGFiaWxpdHk+O1xuICBzdGF0ZTogbnVsbDtcbiAgaGFuZGxlOiBPcHRpb248bnVtYmVyPjtcbiAgdGFibGU6IE9wdGlvbjxQcm9ncmFtU3ltYm9sVGFibGU+O1xuICBsb29rdXA6IE9wdGlvbjxEaWN0PFNjb3BlU2xvdDxKaXRPckFvdEJsb2NrPj4+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBvcHVsYXRlZENvbXBvbmVudEluc3RhbmNlIHtcbiAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWU7XG4gIGRlZmluaXRpb246IENvbXBvbmVudERlZmluaXRpb247XG4gIG1hbmFnZXI6IENvbXBvbmVudE1hbmFnZXI8dW5rbm93bj47XG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eTtcbiAgc3RhdGU6IG51bGw7XG4gIGhhbmRsZTogbnVtYmVyO1xuICB0YWJsZTogT3B0aW9uPFByb2dyYW1TeW1ib2xUYWJsZT47XG4gIGxvb2t1cDogT3B0aW9uPERpY3Q8U2NvcGVTbG90PEppdE9yQW90QmxvY2s+Pj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFydGlhbENvbXBvbmVudERlZmluaXRpb24ge1xuICBzdGF0ZTogT3B0aW9uPENvbXBvbmVudERlZmluaXRpb25TdGF0ZT47XG4gIG1hbmFnZXI6IEludGVybmFsQ29tcG9uZW50TWFuYWdlcjtcbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLklzQ29tcG9uZW50LCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgcmVmID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrUmVmZXJlbmNlKTtcblxuICBzdGFjay5wdXNoKG5ldyBDb25kaXRpb25hbFJlZmVyZW5jZShyZWYsIGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24pKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ29udGVudFR5cGUsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG4gIGxldCByZWYgPSBjaGVjayhzdGFjay5wZWVrKCksIENoZWNrUmVmZXJlbmNlKTtcblxuICBzdGFjay5wdXNoKG5ldyBDb250ZW50VHlwZVJlZmVyZW5jZShyZWYpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ3VycnlDb21wb25lbnQsICh2bSwgeyBvcDE6IF9tZXRhIH0pID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG5cbiAgbGV0IGRlZmluaXRpb24gPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tSZWZlcmVuY2UpO1xuICBsZXQgY2FwdHVyZWRBcmdzID0gY2hlY2soc3RhY2sucG9wKCksIENoZWNrQ2FwdHVyZWRBcmd1bWVudHMpO1xuXG4gIGxldCBtZXRhID0gdm1bQ09OU1RBTlRTXS5nZXRUZW1wbGF0ZU1ldGEoX21ldGEpO1xuICBsZXQgcmVzb2x2ZXIgPSB2bS5ydW50aW1lLnJlc29sdmVyO1xuXG4gIHZtLmxvYWRWYWx1ZSgkdjAsIG5ldyBDdXJyeUNvbXBvbmVudFJlZmVyZW5jZShkZWZpbml0aW9uLCByZXNvbHZlciwgbWV0YSwgY2FwdHVyZWRBcmdzKSk7XG5cbiAgLy8gZXhwZWN0U3RhY2tDaGFuZ2Uodm0uc3RhY2ssIC1hcmdzLmxlbmd0aCAtIDEsICdDdXJyeUNvbXBvbmVudCcpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5QdXNoQ29tcG9uZW50RGVmaW5pdGlvbiwgKHZtLCB7IG9wMTogaGFuZGxlIH0pID0+IHtcbiAgbGV0IGRlZmluaXRpb24gPSB2bS5ydW50aW1lLnJlc29sdmVyLnJlc29sdmU8Q29tcG9uZW50RGVmaW5pdGlvbj4oaGFuZGxlKTtcbiAgYXNzZXJ0KCEhZGVmaW5pdGlvbiwgYE1pc3NpbmcgY29tcG9uZW50IGZvciAke2hhbmRsZX1gKTtcblxuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKSk7XG5cbiAgbGV0IGluc3RhbmNlOiBJbml0aWFsQ29tcG9uZW50SW5zdGFuY2UgPSB7XG4gICAgW0NPTVBPTkVOVF9JTlNUQU5DRV06IHRydWUsXG4gICAgZGVmaW5pdGlvbixcbiAgICBtYW5hZ2VyLFxuICAgIGNhcGFiaWxpdGllcyxcbiAgICBzdGF0ZTogbnVsbCxcbiAgICBoYW5kbGU6IG51bGwsXG4gICAgdGFibGU6IG51bGwsXG4gICAgbG9va3VwOiBudWxsLFxuICB9O1xuXG4gIHZtLnN0YWNrLnB1c2goaW5zdGFuY2UpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5SZXNvbHZlRHluYW1pY0NvbXBvbmVudCwgKHZtLCB7IG9wMTogX21ldGEgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IGNvbXBvbmVudCA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja1BhdGhSZWZlcmVuY2UpLnZhbHVlKCkgYXMgTWF5YmU8RGljdD47XG4gIGxldCBtZXRhID0gdm1bQ09OU1RBTlRTXS5nZXRUZW1wbGF0ZU1ldGEoX21ldGEpO1xuXG4gIHZtLmxvYWRWYWx1ZSgkdDEsIG51bGwpOyAvLyBDbGVhciB0aGUgdGVtcCByZWdpc3RlclxuXG4gIGxldCBkZWZpbml0aW9uOiBDb21wb25lbnREZWZpbml0aW9uIHwgQ3VycmllZENvbXBvbmVudERlZmluaXRpb247XG5cbiAgaWYgKHR5cGVvZiBjb21wb25lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgbGV0IHJlc29sdmVkRGVmaW5pdGlvbiA9IHJlc29sdmVDb21wb25lbnQodm0ucnVudGltZS5yZXNvbHZlciwgY29tcG9uZW50LCBtZXRhKTtcblxuICAgIGRlZmluaXRpb24gPSBleHBlY3QocmVzb2x2ZWREZWZpbml0aW9uLCBgQ291bGQgbm90IGZpbmQgYSBjb21wb25lbnQgbmFtZWQgXCIke2NvbXBvbmVudH1cImApO1xuICB9IGVsc2UgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oY29tcG9uZW50KSkge1xuICAgIGRlZmluaXRpb24gPSBjb21wb25lbnQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goZGVmaW5pdGlvbik7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hEeW5hbWljQ29tcG9uZW50SW5zdGFuY2UsIHZtID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuICBsZXQgZGVmaW5pdGlvbiA9IHN0YWNrLnBvcDxDb21wb25lbnREZWZpbml0aW9uPigpO1xuXG4gIGxldCBjYXBhYmlsaXRpZXMsIG1hbmFnZXI7XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oZGVmaW5pdGlvbikpIHtcbiAgICBtYW5hZ2VyID0gY2FwYWJpbGl0aWVzID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICBtYW5hZ2VyID0gZGVmaW5pdGlvbi5tYW5hZ2VyO1xuICAgIGNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdHlGbGFnc0Zyb20obWFuYWdlci5nZXRDYXBhYmlsaXRpZXMoZGVmaW5pdGlvbi5zdGF0ZSkpO1xuICB9XG5cbiAgc3RhY2sucHVzaCh7IGRlZmluaXRpb24sIGNhcGFiaWxpdGllcywgbWFuYWdlciwgc3RhdGU6IG51bGwsIGhhbmRsZTogbnVsbCwgdGFibGU6IG51bGwgfSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hDdXJyaWVkQ29tcG9uZW50LCB2bSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuXG4gIGxldCBjb21wb25lbnQgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tQYXRoUmVmZXJlbmNlKS52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuICBsZXQgZGVmaW5pdGlvbjogQ3VycmllZENvbXBvbmVudERlZmluaXRpb247XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oY29tcG9uZW50KSkge1xuICAgIGRlZmluaXRpb24gPSBjb21wb25lbnQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgfVxuXG4gIHN0YWNrLnB1c2goZGVmaW5pdGlvbik7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hBcmdzLCAodm0sIHsgb3AxOiBfbmFtZXMsIG9wMjogZmxhZ3MgfSkgPT4ge1xuICBsZXQgc3RhY2sgPSB2bS5zdGFjaztcbiAgbGV0IG5hbWVzID0gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmdBcnJheShfbmFtZXMpO1xuXG4gIGxldCBwb3NpdGlvbmFsQ291bnQgPSBmbGFncyA+PiA0O1xuICBsZXQgYXROYW1lcyA9IGZsYWdzICYgMGIxMDAwO1xuICBsZXQgYmxvY2tOYW1lczogc3RyaW5nW10gPSBbXTtcblxuICBpZiAoZmxhZ3MgJiAwYjAxMDApIGJsb2NrTmFtZXMucHVzaCgnbWFpbicpO1xuICBpZiAoZmxhZ3MgJiAwYjAwMTApIGJsb2NrTmFtZXMucHVzaCgnZWxzZScpO1xuICBpZiAoZmxhZ3MgJiAwYjAwMDEpIGJsb2NrTmFtZXMucHVzaCgnYXR0cnMnKTtcblxuICB2bVtBUkdTXS5zZXR1cChzdGFjaywgbmFtZXMsIGJsb2NrTmFtZXMsIHBvc2l0aW9uYWxDb3VudCwgISFhdE5hbWVzKTtcbiAgc3RhY2sucHVzaCh2bVtBUkdTXSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlB1c2hFbXB0eUFyZ3MsIHZtID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gIHN0YWNrLnB1c2godm1bQVJHU10uZW1wdHkoc3RhY2spKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQ2FwdHVyZUFyZ3MsIHZtID0+IHtcbiAgbGV0IHN0YWNrID0gdm0uc3RhY2s7XG5cbiAgbGV0IGFyZ3MgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tJbnN0YW5jZW9mKFZNQXJndW1lbnRzSW1wbCkpO1xuICBsZXQgY2FwdHVyZWRBcmdzID0gYXJncy5jYXB0dXJlKCk7XG4gIHN0YWNrLnB1c2goY2FwdHVyZWRBcmdzKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHJlcGFyZUFyZ3MsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGFjayA9IHZtLnN0YWNrO1xuICBsZXQgaW5zdGFuY2UgPSB2bS5mZXRjaFZhbHVlPENvbXBvbmVudEluc3RhbmNlPihfc3RhdGUpO1xuICBsZXQgYXJncyA9IGNoZWNrKHN0YWNrLnBvcCgpLCBDaGVja0luc3RhbmNlb2YoVk1Bcmd1bWVudHNJbXBsKSk7XG5cbiAgbGV0IHsgZGVmaW5pdGlvbiB9ID0gaW5zdGFuY2U7XG5cbiAgaWYgKGlzQ3VycmllZENvbXBvbmVudERlZmluaXRpb24oZGVmaW5pdGlvbikpIHtcbiAgICBhc3NlcnQoXG4gICAgICAhZGVmaW5pdGlvbi5tYW5hZ2VyLFxuICAgICAgXCJJZiB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gd2FzIGN1cnJpZWQsIHdlIGRvbid0IHlldCBoYXZlIGEgbWFuYWdlclwiXG4gICAgKTtcbiAgICBkZWZpbml0aW9uID0gcmVzb2x2ZUN1cnJpZWRDb21wb25lbnREZWZpbml0aW9uKGluc3RhbmNlLCBkZWZpbml0aW9uLCBhcmdzKTtcbiAgfVxuXG4gIGxldCB7IG1hbmFnZXIsIHN0YXRlIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gaW5zdGFuY2UuY2FwYWJpbGl0aWVzO1xuXG4gIGlmICghbWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LlByZXBhcmVBcmdzKSkge1xuICAgIHN0YWNrLnB1c2goYXJncyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGJsb2NrcyA9IGFyZ3MuYmxvY2tzLnZhbHVlcztcbiAgbGV0IGJsb2NrTmFtZXMgPSBhcmdzLmJsb2Nrcy5uYW1lcztcbiAgbGV0IHByZXBhcmVkQXJncyA9IG1hbmFnZXIucHJlcGFyZUFyZ3Moc3RhdGUsIGFyZ3MpO1xuXG4gIGlmIChwcmVwYXJlZEFyZ3MpIHtcbiAgICBhcmdzLmNsZWFyKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgc3RhY2sucHVzaChibG9ja3NbaV0pO1xuICAgIH1cblxuICAgIGxldCB7IHBvc2l0aW9uYWwsIG5hbWVkIH0gPSBwcmVwYXJlZEFyZ3M7XG5cbiAgICBsZXQgcG9zaXRpb25hbENvdW50ID0gcG9zaXRpb25hbC5sZW5ndGg7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9uYWxDb3VudDsgaSsrKSB7XG4gICAgICBzdGFjay5wdXNoKHBvc2l0aW9uYWxbaV0pO1xuICAgIH1cblxuICAgIGxldCBuYW1lcyA9IE9iamVjdC5rZXlzKG5hbWVkKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHN0YWNrLnB1c2gobmFtZWRbbmFtZXNbaV1dKTtcbiAgICB9XG5cbiAgICBhcmdzLnNldHVwKHN0YWNrLCBuYW1lcywgYmxvY2tOYW1lcywgcG9zaXRpb25hbENvdW50LCBmYWxzZSk7XG4gIH1cblxuICBzdGFjay5wdXNoKGFyZ3MpO1xufSk7XG5cbmZ1bmN0aW9uIHJlc29sdmVDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbihcbiAgaW5zdGFuY2U6IENvbXBvbmVudEluc3RhbmNlLFxuICBkZWZpbml0aW9uOiBDdXJyaWVkQ29tcG9uZW50RGVmaW5pdGlvbixcbiAgYXJnczogVk1Bcmd1bWVudHNJbXBsXG4pOiBDb21wb25lbnREZWZpbml0aW9uIHtcbiAgbGV0IHVud3JhcHBlZERlZmluaXRpb24gPSAoaW5zdGFuY2UuZGVmaW5pdGlvbiA9IGRlZmluaXRpb24udW53cmFwKGFyZ3MpKTtcbiAgbGV0IHsgbWFuYWdlciwgc3RhdGUgfSA9IHVud3JhcHBlZERlZmluaXRpb247XG5cbiAgYXNzZXJ0KGluc3RhbmNlLm1hbmFnZXIgPT09IG51bGwsICdjb21wb25lbnQgaW5zdGFuY2UgbWFuYWdlciBzaG91bGQgbm90IGJlIHBvcHVsYXRlZCB5ZXQnKTtcbiAgYXNzZXJ0KGluc3RhbmNlLmNhcGFiaWxpdGllcyA9PT0gbnVsbCwgJ2NvbXBvbmVudCBpbnN0YW5jZSBtYW5hZ2VyIHNob3VsZCBub3QgYmUgcG9wdWxhdGVkIHlldCcpO1xuXG4gIGluc3RhbmNlLm1hbmFnZXIgPSBtYW5hZ2VyO1xuICBpbnN0YW5jZS5jYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXR5RmxhZ3NGcm9tKG1hbmFnZXIuZ2V0Q2FwYWJpbGl0aWVzKHN0YXRlKSk7XG5cbiAgcmV0dXJuIHVud3JhcHBlZERlZmluaXRpb247XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5DcmVhdGVDb21wb25lbnQsICh2bSwgeyBvcDE6IGZsYWdzLCBvcDI6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBpbnN0YW5jZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IGRlZmluaXRpb24sIG1hbmFnZXIgfSA9IGluc3RhbmNlO1xuXG4gIGxldCBjYXBhYmlsaXRpZXMgPSAoaW5zdGFuY2UuY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShcbiAgICBtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKVxuICApKTtcblxuICBpZiAoIW1hbmFnZXJIYXNDYXBhYmlsaXR5KG1hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5DcmVhdGVJbnN0YW5jZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJVR2ApO1xuICB9XG5cbiAgbGV0IGR5bmFtaWNTY29wZTogT3B0aW9uPER5bmFtaWNTY29wZT4gPSBudWxsO1xuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkR5bmFtaWNTY29wZSkpIHtcbiAgICBkeW5hbWljU2NvcGUgPSB2bS5keW5hbWljU2NvcGUoKTtcbiAgfVxuXG4gIGxldCBoYXNEZWZhdWx0QmxvY2sgPSBmbGFncyAmIDE7XG4gIGxldCBhcmdzOiBPcHRpb248Vk1Bcmd1bWVudHM+ID0gbnVsbDtcblxuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkNyZWF0ZUFyZ3MpKSB7XG4gICAgYXJncyA9IGNoZWNrKHZtLnN0YWNrLnBlZWsoKSwgQ2hlY2tBcmd1bWVudHMpO1xuICB9XG5cbiAgbGV0IHNlbGY6IE9wdGlvbjxWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+PiA9IG51bGw7XG4gIGlmIChtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuQ3JlYXRlQ2FsbGVyKSkge1xuICAgIHNlbGYgPSB2bS5nZXRTZWxmKCk7XG4gIH1cblxuICBsZXQgc3RhdGUgPSBtYW5hZ2VyLmNyZWF0ZSh2bS5lbnYsIGRlZmluaXRpb24uc3RhdGUsIGFyZ3MsIGR5bmFtaWNTY29wZSwgc2VsZiwgISFoYXNEZWZhdWx0QmxvY2spO1xuXG4gIC8vIFdlIHdhbnQgdG8gcmV1c2UgdGhlIGBzdGF0ZWAgUE9KTyBoZXJlLCBiZWNhdXNlIHdlIGtub3cgdGhhdCB0aGUgb3Bjb2Rlc1xuICAvLyBvbmx5IHRyYW5zaXRpb24gYXQgZXhhY3RseSBvbmUgcGxhY2UuXG4gIGluc3RhbmNlLnN0YXRlID0gc3RhdGU7XG5cbiAgbGV0IHRhZyA9IG1hbmFnZXIuZ2V0VGFnKHN0YXRlKTtcblxuICBpZiAobWFuYWdlckhhc0NhcGFiaWxpdHkobWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LlVwZGF0ZUhvb2spICYmICFpc0NvbnN0VGFnKHRhZykpIHtcbiAgICB2bS51cGRhdGVXaXRoKG5ldyBVcGRhdGVDb21wb25lbnRPcGNvZGUodGFnLCBzdGF0ZSwgbWFuYWdlciwgZHluYW1pY1Njb3BlKSk7XG4gIH1cbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUmVnaXN0ZXJDb21wb25lbnREZXN0cnVjdG9yLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBtYW5hZ2VyLCBzdGF0ZSB9ID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcblxuICBsZXQgZCA9IG1hbmFnZXIuZ2V0RGVzdHJ1Y3RvcihzdGF0ZSk7XG4gIGlmIChkKSB2bS5hc3NvY2lhdGVEZXN0cm95YWJsZShkKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuQmVnaW5Db21wb25lbnRUcmFuc2FjdGlvbiwgdm0gPT4ge1xuICB2bS5iZWdpbkNhY2hlR3JvdXAoKTtcbiAgdm0uZWxlbWVudHMoKS5wdXNoU2ltcGxlQmxvY2soKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuUHV0Q29tcG9uZW50T3BlcmF0aW9ucywgdm0gPT4ge1xuICB2bS5sb2FkVmFsdWUoJHQwLCBuZXcgQ29tcG9uZW50RWxlbWVudE9wZXJhdGlvbnMoKSk7XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkNvbXBvbmVudEF0dHIsICh2bSwgeyBvcDE6IF9uYW1lLCBvcDI6IHRydXN0aW5nLCBvcDM6IF9uYW1lc3BhY2UgfSkgPT4ge1xuICBsZXQgbmFtZSA9IHZtW0NPTlNUQU5UU10uZ2V0U3RyaW5nKF9uYW1lKTtcbiAgbGV0IHJlZmVyZW5jZSA9IGNoZWNrKHZtLnN0YWNrLnBvcCgpLCBDaGVja1JlZmVyZW5jZSk7XG4gIGxldCBuYW1lc3BhY2UgPSBfbmFtZXNwYWNlID8gdm1bQ09OU1RBTlRTXS5nZXRTdHJpbmcoX25hbWVzcGFjZSkgOiBudWxsO1xuXG4gIGNoZWNrKHZtLmZldGNoVmFsdWUoJHQwKSwgQ2hlY2tJbnN0YW5jZW9mKENvbXBvbmVudEVsZW1lbnRPcGVyYXRpb25zKSkuc2V0QXR0cmlidXRlKFxuICAgIG5hbWUsXG4gICAgcmVmZXJlbmNlLFxuICAgICEhdHJ1c3RpbmcsXG4gICAgbmFtZXNwYWNlXG4gICk7XG59KTtcblxuaW50ZXJmYWNlIERlZmVycmVkQXR0cmlidXRlIHtcbiAgdmFsdWU6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPjtcbiAgbmFtZXNwYWNlOiBPcHRpb248c3RyaW5nPjtcbiAgdHJ1c3Rpbmc6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRFbGVtZW50T3BlcmF0aW9ucyBpbXBsZW1lbnRzIEVsZW1lbnRPcGVyYXRpb25zIHtcbiAgcHJpdmF0ZSBhdHRyaWJ1dGVzID0gZGljdDxEZWZlcnJlZEF0dHJpYnV0ZT4oKTtcbiAgcHJpdmF0ZSBjbGFzc2VzOiBWZXJzaW9uZWRSZWZlcmVuY2U8dW5rbm93bj5bXSA9IFtdO1xuICBwcml2YXRlIG1vZGlmaWVyczogW01vZGlmaWVyTWFuYWdlcjx1bmtub3duPiwgdW5rbm93bl1bXSA9IFtdO1xuXG4gIHNldEF0dHJpYnV0ZShcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmFsdWU6IFZlcnNpb25lZFJlZmVyZW5jZTx1bmtub3duPixcbiAgICB0cnVzdGluZzogYm9vbGVhbixcbiAgICBuYW1lc3BhY2U6IE9wdGlvbjxzdHJpbmc+XG4gICkge1xuICAgIGxldCBkZWZlcnJlZCA9IHsgdmFsdWUsIG5hbWVzcGFjZSwgdHJ1c3RpbmcgfTtcblxuICAgIGlmIChuYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICB0aGlzLmNsYXNzZXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gZGVmZXJyZWQ7XG4gIH1cblxuICBhZGRNb2RpZmllcjxTPihtYW5hZ2VyOiBNb2RpZmllck1hbmFnZXI8Uz4sIHN0YXRlOiBTKTogdm9pZCB7XG4gICAgdGhpcy5tb2RpZmllcnMucHVzaChbbWFuYWdlciwgc3RhdGVdKTtcbiAgfVxuXG4gIGZsdXNoKHZtOiBJbnRlcm5hbFZNPEppdE9yQW90QmxvY2s+KTogW01vZGlmaWVyTWFuYWdlcjx1bmtub3duPiwgdW5rbm93bl1bXSB7XG4gICAgZm9yIChsZXQgbmFtZSBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgIGxldCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgbGV0IHsgdmFsdWU6IHJlZmVyZW5jZSwgbmFtZXNwYWNlLCB0cnVzdGluZyB9ID0gYXR0cjtcblxuICAgICAgaWYgKG5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgcmVmZXJlbmNlID0gbmV3IENsYXNzTGlzdFJlZmVyZW5jZSh0aGlzLmNsYXNzZXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PT0gJ3R5cGUnKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBsZXQgYXR0cmlidXRlID0gdm1cbiAgICAgICAgLmVsZW1lbnRzKClcbiAgICAgICAgLnNldER5bmFtaWNBdHRyaWJ1dGUobmFtZSwgcmVmZXJlbmNlLnZhbHVlKCksIHRydXN0aW5nLCBuYW1lc3BhY2UpO1xuXG4gICAgICBpZiAoIWlzQ29uc3QocmVmZXJlbmNlKSkge1xuICAgICAgICB2bS51cGRhdGVXaXRoKG5ldyBVcGRhdGVEeW5hbWljQXR0cmlidXRlT3Bjb2RlKHJlZmVyZW5jZSwgYXR0cmlidXRlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCd0eXBlJyBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgIGxldCB0eXBlID0gdGhpcy5hdHRyaWJ1dGVzLnR5cGU7XG4gICAgICBsZXQgeyB2YWx1ZTogcmVmZXJlbmNlLCBuYW1lc3BhY2UsIHRydXN0aW5nIH0gPSB0eXBlO1xuXG4gICAgICBsZXQgYXR0cmlidXRlID0gdm1cbiAgICAgICAgLmVsZW1lbnRzKClcbiAgICAgICAgLnNldER5bmFtaWNBdHRyaWJ1dGUoJ3R5cGUnLCByZWZlcmVuY2UudmFsdWUoKSwgdHJ1c3RpbmcsIG5hbWVzcGFjZSk7XG5cbiAgICAgIGlmICghaXNDb25zdChyZWZlcmVuY2UpKSB7XG4gICAgICAgIHZtLnVwZGF0ZVdpdGgobmV3IFVwZGF0ZUR5bmFtaWNBdHRyaWJ1dGVPcGNvZGUocmVmZXJlbmNlLCBhdHRyaWJ1dGUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5tb2RpZmllcnM7XG4gIH1cbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkRpZENyZWF0ZUVsZW1lbnQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IGRlZmluaXRpb24sIHN0YXRlIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuXG4gIGxldCBvcGVyYXRpb25zID0gY2hlY2sodm0uZmV0Y2hWYWx1ZSgkdDApLCBDaGVja0luc3RhbmNlb2YoQ29tcG9uZW50RWxlbWVudE9wZXJhdGlvbnMpKTtcblxuICAobWFuYWdlciBhcyBXaXRoRWxlbWVudEhvb2s8dW5rbm93bj4pLmRpZENyZWF0ZUVsZW1lbnQoXG4gICAgc3RhdGUsXG4gICAgZXhwZWN0KHZtLmVsZW1lbnRzKCkuY29uc3RydWN0aW5nLCBgRXhwZWN0ZWQgYSBjb25zdHJ1Y3RpbmcgZWxlbWV0IGluIERpZENyZWF0ZU9wY29kZWApLFxuICAgIG9wZXJhdGlvbnNcbiAgKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuR2V0Q29tcG9uZW50U2VsZiwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgZGVmaW5pdGlvbiwgc3RhdGUgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG5cbiAgdm0uc3RhY2sucHVzaChtYW5hZ2VyLmdldFNlbGYoc3RhdGUpKTtcbn0pO1xuXG5BUFBFTkRfT1BDT0RFUy5hZGQoT3AuR2V0Q29tcG9uZW50VGFnTmFtZSwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgZGVmaW5pdGlvbiwgc3RhdGUgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCB7IG1hbmFnZXIgfSA9IGRlZmluaXRpb247XG5cbiAgdm0uc3RhY2sucHVzaChcbiAgICAobWFuYWdlciBhcyBSZWNhc3Q8SW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyLCBXaXRoRHluYW1pY1RhZ05hbWU8dW5rbm93bj4+KS5nZXRUYWdOYW1lKHN0YXRlKVxuICApO1xufSk7XG5cbi8vIER5bmFtaWMgSW52b2NhdGlvbiBPbmx5XG5BUFBFTkRfT1BDT0RFUy5hZGQoXG4gIE9wLkdldEppdENvbXBvbmVudExheW91dCxcbiAgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgICBsZXQgaW5zdGFuY2UgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrQ29tcG9uZW50SW5zdGFuY2UpO1xuXG4gICAgbGV0IG1hbmFnZXIgPSBpbnN0YW5jZS5tYW5hZ2VyIGFzIFdpdGhKaXRTdGF0aWNMYXlvdXQgfCBXaXRoSml0RHluYW1pY0xheW91dDtcbiAgICBsZXQgeyBkZWZpbml0aW9uIH0gPSBpbnN0YW5jZTtcbiAgICBsZXQgeyBzdGFjayB9ID0gdm07XG5cbiAgICBsZXQgeyBjYXBhYmlsaXRpZXMgfSA9IGluc3RhbmNlO1xuXG4gICAgLy8gbGV0IGludm9rZTogeyBoYW5kbGU6IG51bWJlcjsgc3ltYm9sVGFibGU6IFByb2dyYW1TeW1ib2xUYWJsZSB9O1xuXG4gICAgbGV0IGxheW91dDogQ29tcGlsYWJsZVRlbXBsYXRlO1xuXG4gICAgaWYgKGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBtYW5hZ2VyKSkge1xuICAgICAgbGF5b3V0ID0gbWFuYWdlci5nZXRKaXRTdGF0aWNMYXlvdXQoZGVmaW5pdGlvbi5zdGF0ZSwgdm0ucnVudGltZS5yZXNvbHZlcik7XG4gICAgfSBlbHNlIGlmIChoYXNEeW5hbWljTGF5b3V0Q2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIG1hbmFnZXIpKSB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBtYW5hZ2VyLmdldEppdER5bmFtaWNMYXlvdXQoaW5zdGFuY2Uuc3RhdGUsIHZtLnJ1bnRpbWUucmVzb2x2ZXIsIHZtLmNvbnRleHQpO1xuXG4gICAgICBpZiAoaGFzQ2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuV3JhcHBlZCkpIHtcbiAgICAgICAgbGF5b3V0ID0gdGVtcGxhdGUuYXNXcmFwcGVkTGF5b3V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXlvdXQgPSB0ZW1wbGF0ZS5hc0xheW91dCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICAgIH1cblxuICAgIGxldCBoYW5kbGUgPSBsYXlvdXQuY29tcGlsZSh2bS5jb250ZXh0KTtcblxuICAgIHN0YWNrLnB1c2gobGF5b3V0LnN5bWJvbFRhYmxlKTtcbiAgICBzdGFjay5wdXNoKGhhbmRsZSk7XG4gIH0sXG4gICdqaXQnXG4pO1xuXG4vLyBEeW5hbWljIEludm9jYXRpb24gT25seVxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLkdldEFvdENvbXBvbmVudExheW91dCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IGluc3RhbmNlID0gY2hlY2sodm0uZmV0Y2hWYWx1ZShfc3RhdGUpLCBDaGVja0NvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgbWFuYWdlciwgZGVmaW5pdGlvbiB9ID0gaW5zdGFuY2U7XG4gIGxldCB7IHN0YWNrIH0gPSB2bTtcblxuICBsZXQgeyBzdGF0ZTogaW5zdGFuY2VTdGF0ZSwgY2FwYWJpbGl0aWVzIH0gPSBpbnN0YW5jZTtcbiAgbGV0IHsgc3RhdGU6IGRlZmluaXRpb25TdGF0ZSB9ID0gZGVmaW5pdGlvbjtcblxuICBsZXQgaW52b2tlOiB7IGhhbmRsZTogbnVtYmVyOyBzeW1ib2xUYWJsZTogUHJvZ3JhbVN5bWJvbFRhYmxlIH07XG5cbiAgaWYgKGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoY2FwYWJpbGl0aWVzLCBtYW5hZ2VyKSkge1xuICAgIGludm9rZSA9IChtYW5hZ2VyIGFzIFdpdGhBb3RTdGF0aWNMYXlvdXQ8XG4gICAgICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgICAgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLFxuICAgICAgUnVudGltZVJlc29sdmVyRGVsZWdhdGVcbiAgICA+KS5nZXRBb3RTdGF0aWNMYXlvdXQoZGVmaW5pdGlvblN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgfSBlbHNlIGlmIChoYXNEeW5hbWljTGF5b3V0Q2FwYWJpbGl0eShjYXBhYmlsaXRpZXMsIG1hbmFnZXIpKSB7XG4gICAgaW52b2tlID0gKG1hbmFnZXIgYXMgV2l0aEFvdER5bmFtaWNMYXlvdXQ8XG4gICAgICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgICAgUnVudGltZVJlc29sdmVyXG4gICAgPikuZ2V0QW90RHluYW1pY0xheW91dChpbnN0YW5jZVN0YXRlLCB2bS5ydW50aW1lLnJlc29sdmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyB1bnJlYWNoYWJsZSgpO1xuICB9XG5cbiAgc3RhY2sucHVzaChpbnZva2Uuc3ltYm9sVGFibGUpO1xuICBzdGFjay5wdXNoKGludm9rZS5oYW5kbGUpO1xufSk7XG5cbi8vIFRoZXNlIHR5cGVzIGFyZSBhYnN1cmQgaGVyZVxuZXhwb3J0IGZ1bmN0aW9uIGhhc1N0YXRpY0xheW91dENhcGFiaWxpdHkoXG4gIGNhcGFiaWxpdGllczogQ2FwYWJpbGl0eSxcbiAgX21hbmFnZXI6IEludGVybmFsQ29tcG9uZW50TWFuYWdlclxuKTogX21hbmFnZXIgaXNcbiAgfCBXaXRoSml0U3RhdGljTGF5b3V0PENvbXBvbmVudEluc3RhbmNlU3RhdGUsIENvbXBvbmVudERlZmluaXRpb25TdGF0ZSwgSml0UnVudGltZVJlc29sdmVyPlxuICB8IFdpdGhBb3RTdGF0aWNMYXlvdXQ8Q29tcG9uZW50SW5zdGFuY2VTdGF0ZSwgQ29tcG9uZW50RGVmaW5pdGlvblN0YXRlLCBSdW50aW1lUmVzb2x2ZXI+IHtcbiAgcmV0dXJuIG1hbmFnZXJIYXNDYXBhYmlsaXR5KF9tYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuRHluYW1pY0xheW91dCkgPT09IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzSml0U3RhdGljTGF5b3V0Q2FwYWJpbGl0eShcbiAgY2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5LFxuICBfbWFuYWdlcjogSW50ZXJuYWxDb21wb25lbnRNYW5hZ2VyXG4pOiBfbWFuYWdlciBpcyBXaXRoSml0U3RhdGljTGF5b3V0PFxuICBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICBDb21wb25lbnREZWZpbml0aW9uU3RhdGUsXG4gIEppdFJ1bnRpbWVSZXNvbHZlclxuPiB7XG4gIHJldHVybiBtYW5hZ2VySGFzQ2FwYWJpbGl0eShfbWFuYWdlciwgY2FwYWJpbGl0aWVzLCBDYXBhYmlsaXR5LkR5bmFtaWNMYXlvdXQpID09PSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0R5bmFtaWNMYXlvdXRDYXBhYmlsaXR5KFxuICBjYXBhYmlsaXRpZXM6IENhcGFiaWxpdHksXG4gIF9tYW5hZ2VyOiBJbnRlcm5hbENvbXBvbmVudE1hbmFnZXJcbik6IF9tYW5hZ2VyIGlzXG4gIHwgV2l0aEppdER5bmFtaWNMYXlvdXQ8Q29tcG9uZW50SW5zdGFuY2VTdGF0ZSwgSml0UnVudGltZVJlc29sdmVyPlxuICB8IFdpdGhBb3REeW5hbWljTGF5b3V0PENvbXBvbmVudEluc3RhbmNlU3RhdGUsIFJ1bnRpbWVSZXNvbHZlcj4ge1xuICByZXR1cm4gbWFuYWdlckhhc0NhcGFiaWxpdHkoX21hbmFnZXIsIGNhcGFiaWxpdGllcywgQ2FwYWJpbGl0eS5EeW5hbWljTGF5b3V0KSA9PT0gdHJ1ZTtcbn1cblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLk1haW4sICh2bSwgeyBvcDE6IHJlZ2lzdGVyIH0pID0+IHtcbiAgbGV0IGRlZmluaXRpb24gPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tDb21wb25lbnREZWZpbml0aW9uKTtcbiAgbGV0IGludm9jYXRpb24gPSBjaGVjayh2bS5zdGFjay5wb3AoKSwgQ2hlY2tJbnZvY2F0aW9uKTtcblxuICBsZXQgeyBtYW5hZ2VyIH0gPSBkZWZpbml0aW9uO1xuICBsZXQgY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0eUZsYWdzRnJvbShtYW5hZ2VyLmdldENhcGFiaWxpdGllcyhkZWZpbml0aW9uLnN0YXRlKSk7XG5cbiAgbGV0IHN0YXRlOiBQb3B1bGF0ZWRDb21wb25lbnRJbnN0YW5jZSA9IHtcbiAgICBbQ09NUE9ORU5UX0lOU1RBTkNFXTogdHJ1ZSxcbiAgICBkZWZpbml0aW9uLFxuICAgIG1hbmFnZXIsXG4gICAgY2FwYWJpbGl0aWVzLFxuICAgIHN0YXRlOiBudWxsLFxuICAgIGhhbmRsZTogaW52b2NhdGlvbi5oYW5kbGUsXG4gICAgdGFibGU6IGludm9jYXRpb24uc3ltYm9sVGFibGUsXG4gICAgbG9va3VwOiBudWxsLFxuICB9O1xuXG4gIHZtLmxvYWRWYWx1ZShyZWdpc3Rlciwgc3RhdGUpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Qb3B1bGF0ZUxheW91dCwgKHZtLCB7IG9wMTogX3N0YXRlIH0pID0+IHtcbiAgbGV0IHsgc3RhY2sgfSA9IHZtO1xuXG4gIGxldCBoYW5kbGUgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tIYW5kbGUpO1xuICBsZXQgdGFibGUgPSBjaGVjayhzdGFjay5wb3AoKSwgQ2hlY2tQcm9ncmFtU3ltYm9sVGFibGUpO1xuXG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG5cbiAgc3RhdGUuaGFuZGxlID0gaGFuZGxlO1xuICBzdGF0ZS50YWJsZSA9IHRhYmxlO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5WaXJ0dWFsUm9vdFNjb3BlLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgeyBzeW1ib2xzIH0gPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSkudGFibGU7XG5cbiAgdm0ucHVzaFJvb3RTY29wZShzeW1ib2xzLmxlbmd0aCArIDEpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXR1cEZvckV2YWwsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcblxuICBpZiAoc3RhdGUudGFibGUuaGFzRXZhbCkge1xuICAgIGxldCBsb29rdXAgPSAoc3RhdGUubG9va3VwID0gZGljdDxTY29wZVNsb3Q8Sml0T3JBb3RCbG9jaz4+KCkpO1xuICAgIHZtLnNjb3BlKCkuYmluZEV2YWxTY29wZShsb29rdXApO1xuICB9XG59KTtcblxuQVBQRU5EX09QQ09ERVMuYWRkKE9wLlNldE5hbWVkVmFyaWFibGVzLCAodm0sIHsgb3AxOiBfc3RhdGUgfSkgPT4ge1xuICBsZXQgc3RhdGUgPSBjaGVjayh2bS5mZXRjaFZhbHVlKF9zdGF0ZSksIENoZWNrRmluaXNoZWRDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCBzY29wZSA9IHZtLnNjb3BlKCk7XG5cbiAgbGV0IGFyZ3MgPSBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrQXJndW1lbnRzKTtcbiAgbGV0IGNhbGxlck5hbWVzID0gYXJncy5uYW1lZC5hdE5hbWVzO1xuXG4gIGZvciAobGV0IGkgPSBjYWxsZXJOYW1lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGxldCBhdE5hbWUgPSBjYWxsZXJOYW1lc1tpXTtcbiAgICBsZXQgc3ltYm9sID0gc3RhdGUudGFibGUuc3ltYm9scy5pbmRleE9mKGNhbGxlck5hbWVzW2ldKTtcbiAgICBsZXQgdmFsdWUgPSBhcmdzLm5hbWVkLmdldChhdE5hbWUsIHRydWUpO1xuXG4gICAgaWYgKHN5bWJvbCAhPT0gLTEpIHNjb3BlLmJpbmRTeW1ib2woc3ltYm9sICsgMSwgdmFsdWUpO1xuICAgIGlmIChzdGF0ZS5sb29rdXApIHN0YXRlLmxvb2t1cFthdE5hbWVdID0gdmFsdWU7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBiaW5kQmxvY2s8QyBleHRlbmRzIEppdE9yQW90QmxvY2s+KFxuICBzeW1ib2xOYW1lOiBzdHJpbmcsXG4gIGJsb2NrTmFtZTogc3RyaW5nLFxuICBzdGF0ZTogQ29tcG9uZW50SW5zdGFuY2UsXG4gIGJsb2NrczogQmxvY2tBcmd1bWVudHNJbXBsPEM+LFxuICB2bTogSW50ZXJuYWxWTTxDPlxuKSB7XG4gIGxldCBzeW1ib2wgPSBzdGF0ZS50YWJsZS5zeW1ib2xzLmluZGV4T2Yoc3ltYm9sTmFtZSk7XG5cbiAgbGV0IGJsb2NrID0gYmxvY2tzLmdldChibG9ja05hbWUpO1xuXG4gIGlmIChzeW1ib2wgIT09IC0xKSB7XG4gICAgdm0uc2NvcGUoKS5iaW5kQmxvY2soc3ltYm9sICsgMSwgYmxvY2spO1xuICB9XG5cbiAgaWYgKHN0YXRlLmxvb2t1cCkgc3RhdGUubG9va3VwW3N5bWJvbE5hbWVdID0gYmxvY2s7XG59XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5TZXRCbG9ja3MsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcbiAgbGV0IHsgYmxvY2tzIH0gPSBjaGVjayh2bS5zdGFjay5wZWVrKCksIENoZWNrQXJndW1lbnRzKTtcblxuICBiaW5kQmxvY2soJyZhdHRycycsICdhdHRycycsIHN0YXRlLCBibG9ja3MsIHZtKTtcbiAgYmluZEJsb2NrKCcmZWxzZScsICdlbHNlJywgc3RhdGUsIGJsb2Nrcywgdm0pO1xuICBiaW5kQmxvY2soJyZkZWZhdWx0JywgJ21haW4nLCBzdGF0ZSwgYmxvY2tzLCB2bSk7XG59KTtcblxuLy8gRHluYW1pYyBJbnZvY2F0aW9uIE9ubHlcbkFQUEVORF9PUENPREVTLmFkZChPcC5JbnZva2VDb21wb25lbnRMYXlvdXQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCBzdGF0ZSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tGaW5pc2hlZENvbXBvbmVudEluc3RhbmNlKTtcblxuICB2bS5jYWxsKHN0YXRlLmhhbmRsZSEpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5EaWRSZW5kZXJMYXlvdXQsICh2bSwgeyBvcDE6IF9zdGF0ZSB9KSA9PiB7XG4gIGxldCB7IG1hbmFnZXIsIHN0YXRlLCBjYXBhYmlsaXRpZXMgfSA9IGNoZWNrKHZtLmZldGNoVmFsdWUoX3N0YXRlKSwgQ2hlY2tDb21wb25lbnRJbnN0YW5jZSk7XG4gIGxldCBib3VuZHMgPSB2bS5lbGVtZW50cygpLnBvcEJsb2NrKCk7XG5cbiAgaWYgKCFtYW5hZ2VySGFzQ2FwYWJpbGl0eShtYW5hZ2VyLCBjYXBhYmlsaXRpZXMsIENhcGFiaWxpdHkuQ3JlYXRlSW5zdGFuY2UpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCVUdgKTtcbiAgfVxuXG4gIGxldCBtZ3IgPSBjaGVjayhtYW5hZ2VyLCBDaGVja0ludGVyZmFjZSh7IGRpZFJlbmRlckxheW91dDogQ2hlY2tGdW5jdGlvbiB9KSk7XG5cbiAgbWdyLmRpZFJlbmRlckxheW91dChzdGF0ZSwgYm91bmRzKTtcblxuICB2bS5lbnYuZGlkQ3JlYXRlKHN0YXRlLCBtYW5hZ2VyKTtcblxuICB2bS51cGRhdGVXaXRoKG5ldyBEaWRVcGRhdGVMYXlvdXRPcGNvZGUobWFuYWdlciwgc3RhdGUsIGJvdW5kcykpO1xufSk7XG5cbkFQUEVORF9PUENPREVTLmFkZChPcC5Db21taXRDb21wb25lbnRUcmFuc2FjdGlvbiwgdm0gPT4ge1xuICB2bS5jb21taXRDYWNoZUdyb3VwKCk7XG59KTtcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZUNvbXBvbmVudE9wY29kZSBleHRlbmRzIFVwZGF0aW5nT3Bjb2RlIHtcbiAgcHVibGljIHR5cGUgPSAndXBkYXRlLWNvbXBvbmVudCc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHRhZzogVGFnLFxuICAgIHByaXZhdGUgY29tcG9uZW50OiBDb21wb25lbnRJbnN0YW5jZVN0YXRlLFxuICAgIHByaXZhdGUgbWFuYWdlcjogV2l0aFVwZGF0ZUhvb2ssXG4gICAgcHJpdmF0ZSBkeW5hbWljU2NvcGU6IE9wdGlvbjxEeW5hbWljU2NvcGU+XG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBldmFsdWF0ZShfdm06IFVwZGF0aW5nVk0pIHtcbiAgICBsZXQgeyBjb21wb25lbnQsIG1hbmFnZXIsIGR5bmFtaWNTY29wZSB9ID0gdGhpcztcblxuICAgIG1hbmFnZXIudXBkYXRlKGNvbXBvbmVudCwgZHluYW1pY1Njb3BlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlkVXBkYXRlTGF5b3V0T3Bjb2RlIGV4dGVuZHMgVXBkYXRpbmdPcGNvZGUge1xuICBwdWJsaWMgdHlwZSA9ICdkaWQtdXBkYXRlLWxheW91dCc7XG4gIHB1YmxpYyB0YWc6IFRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIG1hbmFnZXI6IFdpdGhDcmVhdGVJbnN0YW5jZSxcbiAgICBwcml2YXRlIGNvbXBvbmVudDogQ29tcG9uZW50SW5zdGFuY2VTdGF0ZSxcbiAgICBwcml2YXRlIGJvdW5kczogQm91bmRzXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBldmFsdWF0ZSh2bTogVXBkYXRpbmdWTSkge1xuICAgIGxldCB7IG1hbmFnZXIsIGNvbXBvbmVudCwgYm91bmRzIH0gPSB0aGlzO1xuXG4gICAgbWFuYWdlci5kaWRVcGRhdGVMYXlvdXQoY29tcG9uZW50LCBib3VuZHMpO1xuXG4gICAgdm0uZW52LmRpZFVwZGF0ZShjb21wb25lbnQsIG1hbmFnZXIpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9