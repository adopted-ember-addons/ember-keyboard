import { EvaluationStack } from './stack';
import { Dict, Option, VMArguments, CapturedArguments, PositionalArguments, CapturedPositionalArguments, NamedArguments, CapturedNamedArguments, JitOrAotBlock, BlockValue, ScopeBlock, CapturedBlockArguments, BlockArguments } from '@glimmer/interfaces';
import { Tag, VersionedPathReference } from '@glimmer/reference';
export declare class VMArgumentsImpl implements VMArguments {
    private stack;
    positional: PositionalArgumentsImpl;
    named: NamedArgumentsImpl;
    blocks: BlockArgumentsImpl<JitOrAotBlock>;
    empty(stack: EvaluationStack): this;
    setup(stack: EvaluationStack, names: string[], blockNames: string[], positionalCount: number, atNames: boolean): void;
    readonly tag: Tag;
    readonly base: number;
    readonly length: number;
    at<T extends VersionedPathReference<unknown>>(pos: number): T;
    realloc(offset: number): void;
    capture(): CapturedArguments;
    clear(): void;
}
export declare class PositionalArgumentsImpl implements PositionalArguments {
    base: number;
    length: number;
    private stack;
    private _tag;
    private _references;
    empty(stack: EvaluationStack, base: number): void;
    setup(stack: EvaluationStack, base: number, length: number): void;
    readonly tag: Tag;
    at<T extends VersionedPathReference<unknown>>(position: number): T;
    capture(): CapturedPositionalArgumentsImpl;
    prepend(other: CapturedPositionalArguments): void;
    private readonly references;
}
export declare class CapturedPositionalArgumentsImpl implements CapturedPositionalArguments {
    tag: Tag;
    references: VersionedPathReference<unknown>[];
    length: number;
    static empty(): CapturedPositionalArguments;
    constructor(tag: Tag, references: VersionedPathReference<unknown>[], length?: number);
    at<T extends VersionedPathReference<unknown>>(position: number): T;
    value(): unknown[];
    get(name: string): VersionedPathReference<unknown>;
    private valueOf;
}
export declare class NamedArgumentsImpl implements NamedArguments {
    base: number;
    length: number;
    private stack;
    private _references;
    private _names;
    private _atNames;
    empty(stack: EvaluationStack, base: number): void;
    setup(stack: EvaluationStack, base: number, length: number, names: string[], atNames: boolean): void;
    readonly tag: Tag;
    readonly names: string[];
    readonly atNames: string[];
    has(name: string): boolean;
    get<T extends VersionedPathReference<unknown>>(name: string, atNames?: boolean): T;
    capture(): CapturedNamedArguments;
    merge(other: CapturedNamedArguments): void;
    private readonly references;
    private toSyntheticName;
    private toAtName;
}
export declare class CapturedNamedArgumentsImpl implements CapturedNamedArguments {
    tag: Tag;
    names: string[];
    references: VersionedPathReference<unknown>[];
    length: number;
    private _map;
    constructor(tag: Tag, names: string[], references: VersionedPathReference<unknown>[]);
    readonly map: Dict<VersionedPathReference<unknown>>;
    has(name: string): boolean;
    get<T extends VersionedPathReference<unknown>>(name: string): T;
    value(): Dict<unknown>;
}
export declare class BlockArgumentsImpl<C extends JitOrAotBlock> implements BlockArguments<C> {
    private stack;
    private internalValues;
    internalTag: Option<Tag>;
    names: string[];
    length: number;
    base: number;
    empty(stack: EvaluationStack, base: number): void;
    setup(stack: EvaluationStack, base: number, length: number, names: string[]): void;
    readonly values: BlockValue[];
    has(name: string): boolean;
    get(name: string): Option<ScopeBlock<C>>;
    capture(): CapturedBlockArguments;
}
export declare class CapturedArgumentsImpl implements CapturedArguments {
    tag: Tag;
    positional: CapturedPositionalArguments;
    named: CapturedNamedArguments;
    length: number;
    constructor(tag: Tag, positional: CapturedPositionalArguments, named: CapturedNamedArguments, length: number);
    value(): {
        named: Dict<unknown>;
        positional: unknown[];
    };
}
export declare const EMPTY_ARGS: CapturedArgumentsImpl;
//# sourceMappingURL=arguments.d.ts.map