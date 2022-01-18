import { AbstractIterable, IterationItem, OpaqueIterator } from './iterable';
import { Tag } from './validators';
import { VersionedReference } from './reference';
import { Dict } from '@glimmer/interfaces';
import { UpdatableReference } from './property';
export declare type KeyFor = (item: Dict, index: unknown) => unknown;
export declare type UnknownKeyFor = (key: string) => KeyFor;
export interface IterableKeyDefinitions {
    named: {
        [prop: string]: KeyFor;
    };
    default: UnknownKeyFor;
}
export declare function keyFor(path: string, definitions: IterableKeyDefinitions): KeyFor | UnknownKeyFor;
export declare class IterableImpl implements AbstractIterable<unknown, unknown, IterationItem<unknown, unknown>, UpdatableReference<unknown>, UpdatableReference<unknown>> {
    private ref;
    private keyFor;
    tag: Tag;
    constructor(ref: VersionedReference, keyFor: KeyFor);
    iterate(): OpaqueIterator;
    valueReferenceFor(item: IterationItem<unknown, unknown>): UpdatableReference<unknown>;
    updateValueReference(reference: UpdatableReference<unknown>, item: IterationItem<unknown, unknown>): void;
    memoReferenceFor(item: IterationItem<unknown, unknown>): UpdatableReference<unknown>;
    updateMemoReference(reference: UpdatableReference<unknown>, item: IterationItem<unknown, unknown>): void;
}
//# sourceMappingURL=iterable-impl.d.ts.map