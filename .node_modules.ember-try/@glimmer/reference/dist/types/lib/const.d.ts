import { Tag } from './validators';
import { VersionedPathReference } from './reference';
export declare class ConstReference<T = unknown> implements VersionedPathReference<T> {
    protected inner: T;
    tag: Tag;
    constructor(inner: T);
    value(): T;
    get(_key: string): VersionedPathReference;
}
//# sourceMappingURL=const.d.ts.map