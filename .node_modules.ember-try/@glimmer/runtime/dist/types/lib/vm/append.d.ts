import { CompilableBlock, CompilableTemplate, Destroyable, Drop, DynamicScope, Environment, JitOrAotBlock, PartialScope, RenderResult, RichIteratorResult, RuntimeContext, RuntimeConstants, RuntimeProgram, Scope, SymbolDestroyable, SyntaxCompilationContext, VM as PublicVM, JitRuntimeContext, AotRuntimeContext, LiveBlock, ElementBuilder } from '@glimmer/interfaces';
import { PathReference, VersionedPathReference } from '@glimmer/reference';
import { LinkedList, Option } from '@glimmer/util';
import { MachineRegister, Register, SyscallRegister } from '@glimmer/vm';
import { UpdatingOpcode } from '../opcodes';
import { ARGS, CONSTANTS, DESTRUCTOR_STACK, HEAP, INNER_VM, STACKS } from '../symbols';
import { VMArgumentsImpl } from './arguments';
import LowLevelVM from './low-level';
import { EvaluationStack } from './stack';
import { ListBlockOpcode, ResumableVMState, TryOpcode, VMState } from './update';
/**
 * This interface is used by internal opcodes, and is more stable than
 * the implementation of the Append VM itself.
 */
export interface InternalVM<C extends JitOrAotBlock = JitOrAotBlock> {
    readonly [CONSTANTS]: RuntimeConstants;
    readonly [ARGS]: VMArgumentsImpl;
    readonly env: Environment;
    readonly stack: EvaluationStack;
    readonly runtime: RuntimeContext;
    loadValue(register: MachineRegister, value: number): void;
    loadValue(register: Register, value: unknown): void;
    loadValue(register: Register | MachineRegister, value: unknown): void;
    fetchValue(register: MachineRegister.ra | MachineRegister.pc): number;
    fetchValue<T>(register: Register): T;
    fetchValue(register: Register): unknown;
    load(register: Register): void;
    fetch(register: Register): void;
    scope(): Scope<C>;
    elements(): ElementBuilder;
    getSelf(): PathReference<unknown>;
    updateWith(opcode: UpdatingOpcode): void;
    associateDestroyable(d: SymbolDestroyable | Destroyable): void;
    beginCacheGroup(): void;
    commitCacheGroup(): void;
    enterList(offset: number): void;
    exitList(): void;
    iterate(memo: PathReference<unknown>, item: PathReference<unknown>): TryOpcode;
    enterItem(key: unknown, opcode: TryOpcode): void;
    pushRootScope(size: number): PartialScope<C>;
    pushChildScope(): void;
    popScope(): void;
    pushScope(scope: Scope<C>): void;
    dynamicScope(): DynamicScope;
    bindDynamicScope(names: number[]): void;
    pushDynamicScope(): void;
    popDynamicScope(): void;
    enter(args: number): void;
    exit(): void;
    goto(pc: number): void;
    call(handle: number): void;
    pushFrame(): void;
    referenceForSymbol(symbol: number): PathReference<unknown>;
    execute(initialize?: (vm: this) => void): RenderResult;
    pushUpdating(list?: LinkedList<UpdatingOpcode>): void;
    next(): RichIteratorResult<null, RenderResult>;
}
export interface InternalJitVM extends InternalVM<CompilableBlock> {
    compile(block: CompilableTemplate): number;
    readonly runtime: JitRuntimeContext;
    readonly context: SyntaxCompilationContext;
}
export default abstract class VM<C extends JitOrAotBlock> implements PublicVM, InternalVM<C> {
    readonly runtime: RuntimeContext;
    private readonly elementStack;
    private readonly [STACKS];
    private readonly [HEAP];
    private readonly destructor;
    private readonly [DESTRUCTOR_STACK];
    readonly [CONSTANTS]: RuntimeConstants;
    readonly [ARGS]: VMArgumentsImpl;
    readonly [INNER_VM]: LowLevelVM;
    readonly stack: EvaluationStack;
    currentBlock(): LiveBlock;
    readonly pc: number;
    s0: unknown;
    s1: unknown;
    t0: unknown;
    t1: unknown;
    v0: unknown;
    fetch(register: SyscallRegister): void;
    load(register: SyscallRegister): void;
    fetchValue(register: MachineRegister): number;
    fetchValue<T>(register: Register): T;
    loadValue<T>(register: Register | MachineRegister, value: T): void;
    /**
     * Migrated to Inner
     */
    pushFrame(): void;
    popFrame(): void;
    goto(offset: number): void;
    call(handle: number): void;
    returnTo(offset: number): void;
    return(): void;
    /**
     * End of migrated.
     */
    constructor(runtime: RuntimeContext, { pc, scope, dynamicScope, stack }: VMState, elementStack: ElementBuilder);
    readonly program: RuntimeProgram;
    readonly env: Environment;
    captureState(args: number, pc?: number): VMState;
    abstract capture(args: number, pc?: number): ResumableVMState<InternalVM>;
    beginCacheGroup(): void;
    commitCacheGroup(): void;
    enter(args: number): void;
    iterate(memo: VersionedPathReference<unknown>, value: VersionedPathReference<unknown>): TryOpcode;
    enterItem(key: string, opcode: TryOpcode): void;
    enterList(offset: number): void;
    private didEnter;
    exit(): void;
    exitList(): void;
    pushUpdating(list?: LinkedList<UpdatingOpcode>): void;
    popUpdating(): LinkedList<UpdatingOpcode>;
    updateWith(opcode: UpdatingOpcode): void;
    listBlock(): ListBlockOpcode;
    associateDestructor(child: Drop): void;
    associateDestroyable(child: SymbolDestroyable | Destroyable): void;
    tryUpdating(): Option<LinkedList<UpdatingOpcode>>;
    updating(): LinkedList<UpdatingOpcode>;
    elements(): ElementBuilder;
    scope(): Scope<C>;
    dynamicScope(): DynamicScope;
    pushChildScope(): void;
    pushDynamicScope(): DynamicScope;
    pushRootScope(size: number): PartialScope<C>;
    pushScope(scope: Scope<C>): void;
    popScope(): void;
    popDynamicScope(): void;
    getSelf(): PathReference<any>;
    referenceForSymbol(symbol: number): PathReference<unknown>;
    execute(initialize?: (vm: this) => void): RenderResult;
    next(): RichIteratorResult<null, RenderResult>;
    bindDynamicScope(names: number[]): void;
}
export interface MinimalInitOptions {
    handle: number;
    treeBuilder: ElementBuilder;
    dynamicScope: DynamicScope;
}
export interface InitOptions extends MinimalInitOptions {
    self: PathReference<unknown>;
}
export declare class AotVM extends VM<number> implements InternalVM<number> {
    static empty(runtime: AotRuntimeContext, { handle, treeBuilder, dynamicScope }: MinimalInitOptions): InternalVM<number>;
    static initial(runtime: AotRuntimeContext, { handle, self, treeBuilder, dynamicScope }: InitOptions): AotVM;
    capture(args: number, pc?: number): ResumableVMState<AotVM>;
}
export declare type VmInitCallback<V extends InternalVM = InternalVM> = (this: void, runtime: V extends JitVM ? JitRuntimeContext : AotRuntimeContext, state: VMState, builder: ElementBuilder) => V;
export declare type JitVmInitCallback<V extends InternalVM> = (this: void, runtime: JitRuntimeContext, state: VMState, builder: ElementBuilder) => V;
export declare class JitVM extends VM<CompilableBlock> implements InternalJitVM {
    readonly context: SyntaxCompilationContext;
    static initial(runtime: JitRuntimeContext, context: SyntaxCompilationContext, { handle, self, dynamicScope, treeBuilder }: InitOptions): JitVM;
    static empty(runtime: JitRuntimeContext, { handle, treeBuilder, dynamicScope }: MinimalInitOptions, context: SyntaxCompilationContext): JitVM;
    readonly runtime: JitRuntimeContext;
    constructor(runtime: JitRuntimeContext, state: VMState, elementStack: ElementBuilder, context: SyntaxCompilationContext);
    capture(args: number, pc?: number): ResumableVMState<JitVM>;
    private resume;
    compile(block: CompilableTemplate): number;
}
//# sourceMappingURL=append.d.ts.map