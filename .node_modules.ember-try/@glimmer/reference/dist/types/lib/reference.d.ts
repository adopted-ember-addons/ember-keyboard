import { Tag, Tagged } from './validators';
export interface Reference<T> {
    value(): T;
}
export default Reference;
export interface PathReference<T> extends Reference<T> {
    get(key: string): PathReference<unknown>;
}
export interface VersionedReference<T = unknown> extends Reference<T>, Tagged {
}
export interface VersionedPathReference<T = unknown> extends PathReference<T>, Tagged {
    get(property: string): VersionedPathReference<unknown>;
}
export declare abstract class CachedReference<T> implements VersionedReference<T> {
    abstract tag: Tag;
    private lastRevision;
    private lastValue;
    value(): T;
    protected abstract compute(): T;
    protected invalidate(): void;
}
export declare class ReferenceCache<T> implements Tagged {
    tag: Tag;
    private reference;
    private lastValue;
    private lastRevision;
    private initialized;
    constructor(reference: VersionedReference<T>);
    peek(): T;
    revalidate(): Validation<T>;
    private initialize;
}
export declare type Validation<T> = T | NotModified;
export declare type NotModified = 'adb3b78e-3d22-4e4b-877a-6317c2c5c145';
export declare function isModified<T>(value: Validation<T>): value is T;
//# sourceMappingURL=reference.d.ts.map