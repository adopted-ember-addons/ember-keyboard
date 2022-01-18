import { Bounds } from '@glimmer/application';
import GlimmerComponent from './component';
declare const GlimmerComponentManager_base: {
    new (owner: unknown): {
        capabilities: import("../addon/-private/base-component-manager").CustomComponentCapabilities;
        createComponent(ComponentClass: import("../addon/-private/base-component-manager").Constructor<import("../addon/-private/component").default<object>>, args: import("../addon/-private/base-component-manager").ComponentManagerArgs): import("../addon/-private/component").default<object>;
        getContext(component: import("../addon/-private/component").default<object>): import("../addon/-private/component").default<object>;
    };
    create(attrs: {}): {
        capabilities: import("../addon/-private/base-component-manager").CustomComponentCapabilities;
        createComponent(ComponentClass: import("../addon/-private/base-component-manager").Constructor<import("../addon/-private/component").default<object>>, args: import("../addon/-private/base-component-manager").ComponentManagerArgs): import("../addon/-private/component").default<object>;
        getContext(component: import("../addon/-private/component").default<object>): import("../addon/-private/component").default<object>;
    };
};
/**
 * This component manager runs in Glimmer.js environments and extends the base component manager to:
 *
 * 1. Implement a lightweight destruction protocol (currently not deferred, like in Ember)
 * 2. Invoke legacy component lifecycle hooks (didInsertElement and didUpdate)
 */
export default class GlimmerComponentManager extends GlimmerComponentManager_base {
    destroyComponent(component: GlimmerComponent): void;
    didCreateComponent(component: GlimmerComponent): void;
    updateComponent(): void;
    didUpdateComponent(component: GlimmerComponent): void;
    __glimmer__didRenderLayout(component: GlimmerComponent, bounds: Bounds): void;
}
export {};
