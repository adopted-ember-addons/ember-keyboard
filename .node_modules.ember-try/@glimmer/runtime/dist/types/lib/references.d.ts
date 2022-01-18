import { ConstReference, PathReference, Reference, Tag } from '@glimmer/reference';
export declare type Primitive = undefined | null | boolean | number | string;
export declare class PrimitiveReference<T extends Primitive> extends ConstReference<T> implements PathReference<T> {
    static create<T extends Primitive>(value: T): PrimitiveReference<T>;
    protected constructor(value: T);
    get(_key: string): PrimitiveReference<Primitive>;
}
export declare const UNDEFINED_REFERENCE: PrimitiveReference<undefined>;
export declare const NULL_REFERENCE: PrimitiveReference<null>;
export declare const TRUE_REFERENCE: PrimitiveReference<boolean>;
export declare const FALSE_REFERENCE: PrimitiveReference<boolean>;
export declare class ConditionalReference implements Reference<boolean> {
    private inner;
    private toBool;
    tag: Tag;
    constructor(inner: Reference<unknown>, toBool?: (value: unknown) => boolean);
    value(): boolean;
}
//# sourceMappingURL=references.d.ts.map