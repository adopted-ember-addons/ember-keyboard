import { Bounds, DynamicScope, Environment, ExceptionHandler, GlimmerTreeChanges, JitOrAotBlock, RuntimeContext, Scope, AotRuntimeContext, JitRuntimeContext, ElementBuilder, LiveBlock, UpdatableBlock } from '@glimmer/interfaces';
import { Tag, IterationArtifacts } from '@glimmer/reference';
import { LinkedList, Option } from '@glimmer/util';
import { SimpleNode } from '@simple-dom/interface';
import { UpdatingOpcode, UpdatingOpSeq } from '../opcodes';
import { InternalVM, VmInitCallback, JitVM } from './append';
export default class UpdatingVM {
    env: Environment;
    dom: GlimmerTreeChanges;
    alwaysRevalidate: boolean;
    private frameStack;
    constructor(env: Environment, { alwaysRevalidate }: {
        alwaysRevalidate?: boolean | undefined;
    });
    execute(opcodes: UpdatingOpSeq, handler: ExceptionHandler): void;
    private readonly frame;
    goto(op: UpdatingOpcode): void;
    try(ops: UpdatingOpSeq, handler: Option<ExceptionHandler>): void;
    throw(): void;
}
export interface VMState {
    readonly pc: number;
    readonly scope: Scope<JitOrAotBlock>;
    readonly dynamicScope: DynamicScope;
    readonly stack: unknown[];
}
export interface ResumableVMState<V extends InternalVM> {
    resume(runtime: RuntimeContext, builder: ElementBuilder): V;
}
export declare class ResumableVMStateImpl<V extends InternalVM> implements ResumableVMState<V> {
    readonly state: VMState;
    private resumeCallback;
    constructor(state: VMState, resumeCallback: VmInitCallback<V>);
    resume(runtime: V extends JitVM ? JitRuntimeContext : AotRuntimeContext, builder: ElementBuilder): V;
}
export declare abstract class BlockOpcode extends UpdatingOpcode implements Bounds {
    protected state: ResumableVMState<InternalVM>;
    protected runtime: RuntimeContext;
    type: string;
    next: null;
    prev: null;
    readonly children: LinkedList<UpdatingOpcode>;
    protected readonly bounds: LiveBlock;
    constructor(state: ResumableVMState<InternalVM>, runtime: RuntimeContext, bounds: LiveBlock, children: LinkedList<UpdatingOpcode>);
    abstract didInitializeChildren(): void;
    parentElement(): import("@simple-dom/interface").SimpleElement;
    firstNode(): SimpleNode;
    lastNode(): SimpleNode;
    evaluate(vm: UpdatingVM): void;
}
export declare class TryOpcode extends BlockOpcode implements ExceptionHandler {
    type: string;
    tag: Tag;
    private _tag;
    protected bounds: UpdatableBlock;
    constructor(state: ResumableVMState<InternalVM>, runtime: RuntimeContext, bounds: UpdatableBlock, children: LinkedList<UpdatingOpcode>);
    didInitializeChildren(): void;
    evaluate(vm: UpdatingVM): void;
    handleException(): void;
}
export declare class ListBlockOpcode extends BlockOpcode {
    type: string;
    map: Map<unknown, BlockOpcode>;
    artifacts: IterationArtifacts;
    tag: Tag;
    private lastIterated;
    private _tag;
    constructor(state: ResumableVMState<InternalVM>, runtime: RuntimeContext, bounds: LiveBlock, children: LinkedList<UpdatingOpcode>, artifacts: IterationArtifacts);
    didInitializeChildren(listDidChange?: boolean): void;
    evaluate(vm: UpdatingVM): void;
    vmForInsertion(nextSibling: Option<SimpleNode>): InternalVM<JitOrAotBlock>;
}
//# sourceMappingURL=update.d.ts.map