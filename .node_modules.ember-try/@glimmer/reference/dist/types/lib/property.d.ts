import { Tag, UpdatableTag } from './validators';
import { VersionedPathReference } from './reference';
export declare class RootReference<T> implements VersionedPathReference<T> {
    private inner;
    private children;
    tag: import("./validators").ConstantTag;
    constructor(inner: T);
    value(): T;
    get(propertyKey: string): RootPropertyReference;
}
export declare class ImmutableRootReference<T> implements VersionedPathReference<T> {
    private inner;
    private children;
    tag: import("./validators").ConstantTag;
    constructor(inner: T);
    value(): T;
    get(propertyKey: string): RootPropertyReference;
}
export declare type Primitive = undefined | null | boolean | number | string;
export declare class PrimitiveReference<T extends Primitive> implements VersionedPathReference<T> {
    private inner;
    readonly tag: import("./validators").ConstantTag;
    constructor(inner: T);
    value(): T;
    get(_key: string): PrimitiveReference<Primitive>;
}
export declare const UNDEFINED_REFERENCE: PrimitiveReference<undefined>;
export declare function cached<T>(inner: VersionedPathReference<T>): VersionedPathReference<T>;
export declare class Cached<T = unknown> implements VersionedPathReference<T> {
    private inner;
    private _lastRevision;
    private _lastValue;
    tag: Tag;
    constructor(inner: VersionedPathReference<T>);
    value(): any;
    get(key: string): VersionedPathReference;
}
export declare function data(value: unknown): VersionedPathReference;
export declare function property(parentReference: VersionedPathReference, propertyKey: string): RootPropertyReference | NestedPropertyReference;
export declare class RootPropertyReference implements VersionedPathReference {
    private _parentValue;
    private _propertyKey;
    tag: UpdatableTag;
    constructor(_parentValue: unknown, _propertyKey: string);
    value(): unknown;
    get(key: string): VersionedPathReference;
}
export declare class NestedPropertyReference implements VersionedPathReference {
    private _parentReference;
    private _propertyKey;
    tag: Tag;
    private _parentObjectTag;
    constructor(_parentReference: VersionedPathReference, _propertyKey: string);
    value(): unknown;
    get(key: string): VersionedPathReference;
}
export declare class UpdatableReference<T = unknown> implements VersionedPathReference<T> {
    private _value;
    tag: UpdatableTag;
    constructor(_value: T);
    value(): T;
    update(value: T): void;
    forceUpdate(value: T): void;
    dirty(): void;
    get(key: string): VersionedPathReference;
}
export declare function State<T>(data: T): UpdatableReference<T>;
export declare function StableState<T extends object>(data: T): UpdatableReference<T>;
//# sourceMappingURL=property.d.ts.map