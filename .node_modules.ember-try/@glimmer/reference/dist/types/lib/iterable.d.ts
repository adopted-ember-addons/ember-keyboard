import { ListNode, Option } from '@glimmer/util';
import { Tag } from './validators';
import { VersionedPathReference as PathReference } from './reference';
export interface IterationItem<T, U> {
    key: unknown;
    value: T;
    memo: U;
}
export interface AbstractIterator<T, U, V extends IterationItem<T, U>> {
    isEmpty(): boolean;
    next(): Option<V>;
}
export interface AbstractIterable<T, U, ItemType extends IterationItem<T, U>, ValueReferenceType extends PathReference<T>, MemoReferenceType extends PathReference<U>> {
    tag: Tag;
    iterate(): AbstractIterator<T, U, ItemType>;
    valueReferenceFor(item: ItemType): ValueReferenceType;
    updateValueReference(reference: ValueReferenceType, item: ItemType): void;
    memoReferenceFor(item: ItemType): MemoReferenceType;
    updateMemoReference(reference: MemoReferenceType, item: ItemType): void;
}
export declare type Iterator<T, U> = AbstractIterator<T, U, IterationItem<T, U>>;
export declare type Iterable<T, U> = AbstractIterable<T, U, IterationItem<T, U>, PathReference<T>, PathReference<U>>;
export declare type OpaqueIterationItem = IterationItem<unknown, unknown>;
export declare type OpaqueIterator = AbstractIterator<unknown, unknown, OpaqueIterationItem>;
export declare type OpaquePathReference = PathReference<unknown>;
export declare type OpaqueIterable = AbstractIterable<unknown, unknown, OpaqueIterationItem, OpaquePathReference, OpaquePathReference>;
export declare type OpaquePathReferenceIterationItem = IterationItem<OpaquePathReference, OpaquePathReference>;
export declare class ListItem extends ListNode<OpaquePathReference> implements OpaqueIterationItem {
    key: unknown;
    memo: OpaquePathReference;
    retained: boolean;
    seen: boolean;
    private iterable;
    constructor(iterable: OpaqueIterable, result: OpaqueIterationItem);
    update(item: OpaqueIterationItem): void;
    shouldRemove(): boolean;
    reset(): void;
}
export declare class IterationArtifacts {
    tag: Tag;
    private iterable;
    private iterator;
    private map;
    private list;
    constructor(iterable: OpaqueIterable);
    isEmpty(): boolean;
    iterate(): OpaqueIterator;
    advanceToKey(key: unknown, current: ListItem): Option<ListItem>;
    has(key: unknown): boolean;
    get(key: unknown): ListItem;
    wasSeen(key: unknown): boolean;
    update(item: OpaqueIterationItem): ListItem;
    append(item: OpaqueIterationItem): ListItem;
    insertBefore(item: OpaqueIterationItem, reference: Option<ListItem>): ListItem;
    move(item: ListItem, reference: Option<ListItem>): void;
    remove(item: ListItem): void;
    nextNode(item: ListItem): ListItem;
    advanceNode(item: ListItem): ListItem;
    head(): Option<ListItem>;
}
export declare class ReferenceIterator {
    artifacts: IterationArtifacts;
    private iterator;
    constructor(iterable: OpaqueIterable);
    next(): Option<ListItem>;
}
export interface IteratorSynchronizerDelegate<Env> {
    retain(env: Env, key: unknown, item: PathReference<unknown>, memo: PathReference<unknown>): void;
    insert(env: Env, key: unknown, item: PathReference<unknown>, memo: PathReference<unknown>, before: Option<unknown>): void;
    move(env: Env, key: unknown, item: PathReference<unknown>, memo: PathReference<unknown>, before: Option<unknown>): void;
    delete(env: Env, key: unknown): void;
    done(env: Env): void;
}
export interface IteratorSynchronizerOptions<Env> {
    target: IteratorSynchronizerDelegate<Env>;
    artifacts: IterationArtifacts;
    env: Env;
}
export declare const END = "END [2600abdf-889f-4406-b059-b44ecbafa5c5]";
export declare class IteratorSynchronizer<Env> {
    private target;
    private iterator;
    private current;
    private artifacts;
    private env;
    constructor({ target, artifacts, env }: IteratorSynchronizerOptions<Env>);
    sync(): void;
    private advanceToKey;
    private move;
    private nextAppend;
    private nextRetain;
    private nextMove;
    private nextInsert;
    private startPrune;
    private nextPrune;
    private nextDone;
}
//# sourceMappingURL=iterable.d.ts.map