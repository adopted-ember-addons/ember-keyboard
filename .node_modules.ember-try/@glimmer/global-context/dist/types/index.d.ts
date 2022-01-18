/**
 * This package contains global context functions for Glimmer. These functions
 * are set by the embedding environment and must be set before initial render.
 *
 * These functions should meet the following criteria:
 *
 * - Must be provided by the embedder, due to having framework specific
 *   behaviors (e.g. interop with classic Ember behaviors that should not be
 *   upstreamed) or to being out of scope for the VM (e.g. scheduling a
 *   revalidation)
 * - Never differ between render roots
 * - Never change over time
 *
 */
/**
 * Interfaces
 *
 * TODO: Move these into @glimmer/interfaces, move @glimmer/interfaces to
 * @glimmer/internal-interfaces.
 */
interface IteratorDelegate {
    isEmpty(): boolean;
    next(): {
        value: unknown;
        memo: unknown;
    } | null;
}
export declare type Destroyable = object;
export declare type Destructor<T extends Destroyable> = (destroyable: T) => void;
/**
 * Schedules a VM revalidation.
 *
 * Note: this has a default value so that tags can warm themselves when first loaded.
 */
export declare let scheduleRevalidate: () => void;
/**
 * Schedules a destructor to run
 *
 * @param destroyable The destroyable being destroyed
 * @param destructor The destructor being scheduled
 */
export declare let scheduleDestroy: <T extends Destroyable>(destroyable: T, destructor: Destructor<T>) => void;
/**
 * Finalizes destruction
 *
 * @param finalizer finalizer function
 */
export declare let scheduleDestroyed: (finalizer: () => void) => void;
/**
 * Hook to provide iterators for `{{each}}` loops
 *
 * @param value The value to create an iterator for
 */
export declare let toIterator: (value: unknown) => IteratorDelegate | null;
/**
 * Hook to specify truthiness within Glimmer templates
 *
 * @param value The value to convert to a boolean
 */
export declare let toBool: (value: unknown) => boolean;
/**
 * Hook for specifying how Glimmer should access properties in cases where it
 * needs to. For instance, accessing an object's values in templates.
 *
 * @param obj The object provided to get a value from
 * @param path The path to get the value from
 */
export declare let getProp: (obj: object, path: string) => unknown;
/**
 * Hook for specifying how Glimmer should update props in cases where it needs
 * to. For instance, when updating a template reference (e.g. 2-way-binding)
 *
 * @param obj The object provided to get a value from
 * @param prop The prop to set the value at
 * @param value The value to set the value to
 */
export declare let setProp: (obj: object, prop: string, value: unknown) => void;
/**
 * Hook for specifying how Glimmer should access paths in cases where it needs
 * to. For instance, the `key` value of `{{each}}` loops.
 *
 * @param obj The object provided to get a value from
 * @param path The path to get the value from
 */
export declare let getPath: (obj: object, path: string) => unknown;
/**
 * Hook to warn if a style binding string or value was not marked as trusted
 * (e.g. HTMLSafe)
 */
export declare let warnIfStyleNotTrusted: (value: unknown) => void;
export interface GlobalContext {
    scheduleRevalidate: () => void;
    scheduleDestroy: <T extends Destroyable>(destroyable: T, destructor: Destructor<T>) => void;
    scheduleDestroyed: (finalizer: () => void) => void;
    toIterator: (value: unknown) => IteratorDelegate | null;
    toBool: (value: unknown) => boolean;
    getProp: (obj: object, path: string) => unknown;
    setProp: (obj: object, prop: string, value: unknown) => void;
    getPath: (obj: object, path: string) => unknown;
    warnIfStyleNotTrusted: (value: unknown) => void;
}
export default function setGlobalContext(context: GlobalContext): void;
export declare let assertGlobalContextWasSet: (() => void) | undefined;
export declare let testOverrideGlobalContext: ((context: Partial<GlobalContext> | null) => GlobalContext | null) | undefined;
export {};
//# sourceMappingURL=index.d.ts.map