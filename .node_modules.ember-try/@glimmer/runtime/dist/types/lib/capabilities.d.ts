import { ComponentCapabilities, ComponentManager, WithUpdateHook, WithPrepareArgs, WithCreateInstance, WithJitDynamicLayout, WithAotDynamicLayout } from '@glimmer/interfaces';
export declare const enum Capability {
    DynamicLayout = 1,
    DynamicTag = 2,
    PrepareArgs = 4,
    CreateArgs = 8,
    AttributeHook = 16,
    ElementHook = 32,
    DynamicScope = 64,
    CreateCaller = 128,
    UpdateHook = 256,
    CreateInstance = 512,
    Wrapped = 1024
}
/**
 * Converts a ComponentCapabilities object into a 32-bit integer representation.
 */
export declare function capabilityFlagsFrom(capabilities: ComponentCapabilities): Capability;
export interface CapabilityMap {
    [Capability.DynamicLayout]: WithJitDynamicLayout | WithAotDynamicLayout;
    [Capability.DynamicTag]: ComponentManager;
    [Capability.PrepareArgs]: WithPrepareArgs;
    [Capability.CreateArgs]: ComponentManager;
    [Capability.AttributeHook]: ComponentManager;
    [Capability.ElementHook]: ComponentManager;
    [Capability.DynamicScope]: ComponentManager;
    [Capability.CreateCaller]: ComponentManager;
    [Capability.UpdateHook]: WithUpdateHook;
    [Capability.CreateInstance]: WithCreateInstance;
    [Capability.Wrapped]: ComponentManager;
}
export declare function managerHasCapability<F extends keyof CapabilityMap>(_manager: ComponentManager, capabilities: Capability, capability: F): _manager is CapabilityMap[F];
export declare function hasCapability<F extends keyof CapabilityMap>(capabilities: Capability, capability: F): boolean;
//# sourceMappingURL=capabilities.d.ts.map