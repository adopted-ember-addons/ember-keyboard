import { ComponentCapabilities, ComponentDefinitionState, ComponentInstanceState, ComponentManager, WithAotDynamicLayout, WithAotStaticLayout, WithJitDynamicLayout, WithJitStaticLayout, JitRuntimeResolver, RuntimeResolver } from '@glimmer/interfaces';
/** @internal */
export declare function hasStaticLayout<D extends ComponentDefinitionState, I extends ComponentInstanceState>(state: D, manager: ComponentManager<I, D>): manager is WithAotStaticLayout<I, D, RuntimeResolver> | WithJitStaticLayout<I, D, JitRuntimeResolver>;
/** @internal */
export declare function hasDynamicLayout<D extends ComponentDefinitionState, I extends ComponentInstanceState>(state: D, manager: ComponentManager<I, D>): manager is WithAotDynamicLayout<I, RuntimeResolver> | WithJitDynamicLayout<I, RuntimeResolver>;
export declare const DEFAULT_CAPABILITIES: ComponentCapabilities;
export declare const MINIMAL_CAPABILITIES: ComponentCapabilities;
//# sourceMappingURL=interfaces.d.ts.map