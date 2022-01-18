import BaseComponent from './component';
export interface ComponentManagerArgs {
    named: object;
    positional: any[];
}
export declare type SetOwner = (obj: {}, owner: unknown) => void;
export declare type GetOwner = (obj: {}) => unknown;
export interface CustomComponentCapabilities {
    asyncLifecycleCallbacks: boolean;
    destructor: boolean;
    updateHook: boolean;
}
export interface Constructor<T> {
    new (owner: unknown, args: {}): T;
}
/**
 * This factory function returns a component manager class with common behavior
 * that can be extend to add Glimmer.js- or Ember.js-specific functionality. As
 * these environments converge, the need for two component manager
 * implementations (and thus this factory) should go away.
 */
export default function BaseComponentManager<GlimmerComponent extends BaseComponent>(setOwner: SetOwner, getOwner: GetOwner, capabilities: CustomComponentCapabilities): {
    new (owner: unknown): {
        capabilities: CustomComponentCapabilities;
        createComponent(ComponentClass: Constructor<GlimmerComponent>, args: ComponentManagerArgs): GlimmerComponent;
        getContext(component: GlimmerComponent): GlimmerComponent;
    };
    create(attrs: {}): {
        capabilities: CustomComponentCapabilities;
        createComponent(ComponentClass: Constructor<GlimmerComponent>, args: ComponentManagerArgs): GlimmerComponent;
        getContext(component: GlimmerComponent): GlimmerComponent;
    };
};
