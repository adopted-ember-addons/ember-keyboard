import { Option } from '@glimmer/interfaces';
import { Reference, ReferenceEnvironment } from './reference';
export interface IterationItem<T, U> {
    key: unknown;
    value: T;
    memo: U;
}
export interface AbstractIterator<T, U, V extends IterationItem<T, U>> {
    isEmpty(): boolean;
    next(): Option<V>;
}
export declare type OpaqueIterationItem = IterationItem<unknown, unknown>;
export declare type OpaqueIterator = AbstractIterator<unknown, unknown, OpaqueIterationItem>;
export interface IteratorDelegate {
    isEmpty(): boolean;
    next(): {
        value: unknown;
        memo: unknown;
    } | null;
}
export interface IteratorReferenceEnvironment extends ReferenceEnvironment {
    getPath(obj: unknown, path: string): unknown;
    toIterator(obj: unknown): Option<IteratorDelegate>;
}
declare type KeyFor = (item: unknown, index: unknown) => unknown;
export declare function createIteratorRef(listRef: Reference, key: string): Reference<ArrayIterator | IteratorWrapper>;
export declare function createIteratorItemRef(_value: unknown): Reference<unknown>;
declare class IteratorWrapper implements OpaqueIterator {
    private inner;
    private keyFor;
    constructor(inner: IteratorDelegate, keyFor: KeyFor);
    isEmpty(): boolean;
    next(): OpaqueIterationItem;
}
declare class ArrayIterator implements OpaqueIterator {
    private iterator;
    private keyFor;
    private current;
    private pos;
    constructor(iterator: unknown[], keyFor: KeyFor);
    isEmpty(): boolean;
    next(): Option<IterationItem<unknown, number>>;
}
export {};
//# sourceMappingURL=iterable.d.ts.map