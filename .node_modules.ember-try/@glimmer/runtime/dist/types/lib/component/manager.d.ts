import { ComponentManager, ComponentDefinitionState, VMArguments, ComponentCapabilities, Option, DynamicScope, ComponentInstanceState, PreparedArguments, Bounds, SymbolDestroyable, Destroyable, Environment } from '@glimmer/interfaces';
import { VersionedPathReference, Tag } from '@glimmer/reference';
export declare class SimpleComponentManager implements ComponentManager {
    getCapabilities(_state: ComponentDefinitionState): ComponentCapabilities;
    prepareArgs(_state: ComponentDefinitionState, _args: VMArguments): Option<PreparedArguments>;
    create(_env: Environment, _state: ComponentDefinitionState, _args: Option<VMArguments>, _dynamicScope: Option<DynamicScope>, _caller: Option<VersionedPathReference<unknown>>, _hasDefaultBlock: boolean): ComponentInstanceState;
    getSelf(_state: ComponentInstanceState): VersionedPathReference;
    getTag(_state: ComponentInstanceState): Tag;
    didRenderLayout(_state: ComponentInstanceState, _bounds: Bounds): void;
    didCreate(_state: ComponentInstanceState): void;
    update(_state: ComponentInstanceState, _dynamicScope: Option<DynamicScope>): void;
    didUpdateLayout(_state: ComponentInstanceState, _bounds: Bounds): void;
    didUpdate(_state: ComponentInstanceState): void;
    getDestructor(_state: ComponentInstanceState): Option<SymbolDestroyable | Destroyable>;
}
export declare const TEMPLATE_ONLY_COMPONENT: {
    state: null;
    manager: SimpleComponentManager;
};
//# sourceMappingURL=manager.d.ts.map