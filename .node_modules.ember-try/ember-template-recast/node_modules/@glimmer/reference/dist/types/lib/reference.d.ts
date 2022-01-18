import { Option } from '@glimmer/util';
export declare const REFERENCE: unique symbol;
declare const enum ReferenceType {
    Constant = 0,
    Compute = 1,
    Unbound = 2,
    Invokable = 3
}
export interface Reference<_T = unknown> {
    [REFERENCE]: ReferenceType;
    debugLabel?: string;
}
export default Reference;
export interface ReferenceEnvironment {
    getProp(obj: unknown, path: string): unknown;
    setProp(obj: unknown, path: string, value: unknown): unknown;
}
export declare function createPrimitiveRef(value: unknown): Reference;
export declare const UNDEFINED_REFERENCE: Reference<unknown>;
export declare const NULL_REFERENCE: Reference<unknown>;
export declare const TRUE_REFERENCE: Reference<unknown>;
export declare const FALSE_REFERENCE: Reference<unknown>;
export declare function createConstRef(value: unknown, debugLabel: false | string): Reference;
export declare function createUnboundRef(value: unknown, debugLabel: false | string): Reference;
export declare function createComputeRef<T = unknown>(compute: () => T, update?: Option<(value: T) => void>, debugLabel?: false | string): Reference<T>;
export declare function createReadOnlyRef(ref: Reference): Reference;
export declare function isInvokableRef(ref: Reference): boolean;
export declare function createInvokableRef(inner: Reference): Reference;
export declare function isConstRef(_ref: Reference): boolean;
export declare function isUpdatableRef(_ref: Reference): boolean;
export declare function valueForRef<T>(_ref: Reference<T>): T;
export declare function updateRef(_ref: Reference, value: unknown): void;
export declare function childRefFor(_parentRef: Reference, path: string): Reference;
export declare function childRefFromParts(root: Reference, parts: string[]): Reference;
export declare let createDebugAliasRef: undefined | ((debugLabel: string, inner: Reference) => Reference);
//# sourceMappingURL=reference.d.ts.map