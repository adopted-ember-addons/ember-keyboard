import { Bounds, ComponentDefinition, ComponentDefinitionState, ComponentInstanceState, ComponentManager, Dict, DynamicScope, ElementOperations, InternalComponentManager, JitOrAotBlock, ProgramSymbolTable, ScopeSlot, WithAotDynamicLayout, WithAotStaticLayout, WithJitDynamicLayout, WithJitStaticLayout, WithUpdateHook, WithCreateInstance, JitRuntimeResolver, RuntimeResolver, ModifierManager } from '@glimmer/interfaces';
import { Tag, VersionedReference } from '@glimmer/reference';
import { Option } from '@glimmer/util';
import { Capability } from '../../capabilities';
import { UpdatingOpcode } from '../../opcodes';
import { UpdatingVM } from '../../vm';
import { InternalVM } from '../../vm/append';
/**
 * The VM creates a new ComponentInstance data structure for every component
 * invocation it encounters.
 *
 * Similar to how a ComponentDefinition contains state about all components of a
 * particular type, a ComponentInstance contains state specific to a particular
 * instance of a component type. It also contains a pointer back to its
 * component type's ComponentDefinition.
 */
export declare const COMPONENT_INSTANCE = "COMPONENT_INSTANCE [c56c57de-e73a-4ef0-b137-07661da17029]";
export interface ComponentInstance {
    [COMPONENT_INSTANCE]: true;
    definition: ComponentDefinition;
    manager: ComponentManager;
    capabilities: Capability;
    state: ComponentInstanceState;
    handle: number;
    table: ProgramSymbolTable;
    lookup: Option<Dict<ScopeSlot<JitOrAotBlock>>>;
}
export interface InitialComponentInstance {
    [COMPONENT_INSTANCE]: true;
    definition: PartialComponentDefinition;
    manager: Option<InternalComponentManager>;
    capabilities: Option<Capability>;
    state: null;
    handle: Option<number>;
    table: Option<ProgramSymbolTable>;
    lookup: Option<Dict<ScopeSlot<JitOrAotBlock>>>;
}
export interface PopulatedComponentInstance {
    [COMPONENT_INSTANCE]: true;
    definition: ComponentDefinition;
    manager: ComponentManager<unknown>;
    capabilities: Capability;
    state: null;
    handle: number;
    table: Option<ProgramSymbolTable>;
    lookup: Option<Dict<ScopeSlot<JitOrAotBlock>>>;
}
export interface PartialComponentDefinition {
    state: Option<ComponentDefinitionState>;
    manager: InternalComponentManager;
}
export declare class ComponentElementOperations implements ElementOperations {
    private attributes;
    private classes;
    private modifiers;
    setAttribute(name: string, value: VersionedReference<unknown>, trusting: boolean, namespace: Option<string>): void;
    addModifier<S>(manager: ModifierManager<S>, state: S): void;
    flush(vm: InternalVM<JitOrAotBlock>): [ModifierManager<unknown>, unknown][];
}
export declare function hasStaticLayoutCapability(capabilities: Capability, _manager: InternalComponentManager): _manager is WithJitStaticLayout<ComponentInstanceState, ComponentDefinitionState, JitRuntimeResolver> | WithAotStaticLayout<ComponentInstanceState, ComponentDefinitionState, RuntimeResolver>;
export declare function hasJitStaticLayoutCapability(capabilities: Capability, _manager: InternalComponentManager): _manager is WithJitStaticLayout<ComponentInstanceState, ComponentDefinitionState, JitRuntimeResolver>;
export declare function hasDynamicLayoutCapability(capabilities: Capability, _manager: InternalComponentManager): _manager is WithJitDynamicLayout<ComponentInstanceState, JitRuntimeResolver> | WithAotDynamicLayout<ComponentInstanceState, RuntimeResolver>;
export declare class UpdateComponentOpcode extends UpdatingOpcode {
    tag: Tag;
    private component;
    private manager;
    private dynamicScope;
    type: string;
    constructor(tag: Tag, component: ComponentInstanceState, manager: WithUpdateHook, dynamicScope: Option<DynamicScope>);
    evaluate(_vm: UpdatingVM): void;
}
export declare class DidUpdateLayoutOpcode extends UpdatingOpcode {
    private manager;
    private component;
    private bounds;
    type: string;
    tag: Tag;
    constructor(manager: WithCreateInstance, component: ComponentInstanceState, bounds: Bounds);
    evaluate(vm: UpdatingVM): void;
}
//# sourceMappingURL=component.d.ts.map