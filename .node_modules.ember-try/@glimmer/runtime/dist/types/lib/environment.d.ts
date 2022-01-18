import { Dict, Drop, Environment, EnvironmentOptions, GlimmerTreeChanges, GlimmerTreeConstruction, JitOrAotBlock, PartialScope, Scope, ScopeBlock, ScopeSlot, Transaction, TransactionSymbol, CompilerArtifacts, WithCreateInstance, ResolvedValue, RuntimeResolverDelegate, RuntimeProgram, ModifierManager, Template, AotRuntimeResolver, Invocation, JitRuntimeContext, AotRuntimeContext, JitRuntimeResolver, RuntimeResolver, SyntaxCompilationContext, RuntimeConstants, RuntimeHeap, WholeProgramCompilationContext, CompileTimeConstants, CompileTimeHeap, Macros } from '@glimmer/interfaces';
import { IterableKeyDefinitions, OpaqueIterable, PathReference, Reference, VersionedPathReference, VersionedReference } from '@glimmer/reference';
import { Option } from '@glimmer/util';
import { AttrNamespace, SimpleDocument, SimpleElement } from '@simple-dom/interface';
import { DynamicAttribute } from './vm/attributes/dynamic';
export declare function isScopeReference(s: ScopeSlot): s is VersionedPathReference;
export declare class ScopeImpl<C extends JitOrAotBlock> implements PartialScope<C> {
    readonly slots: Array<ScopeSlot<C>>;
    private callerScope;
    private evalScope;
    private partialMap;
    static root<C extends JitOrAotBlock>(self: PathReference<unknown>, size?: number): PartialScope<C>;
    static sized<C extends JitOrAotBlock>(size?: number): Scope<C>;
    constructor(slots: Array<ScopeSlot<C>>, callerScope: Option<Scope<C>>, evalScope: Option<Dict<ScopeSlot<C>>>, partialMap: Option<Dict<PathReference<unknown>>>);
    init({ self }: {
        self: PathReference<unknown>;
    }): this;
    getSelf(): PathReference<unknown>;
    getSymbol(symbol: number): PathReference<unknown>;
    getBlock(symbol: number): Option<ScopeBlock<C>>;
    getEvalScope(): Option<Dict<ScopeSlot<C>>>;
    getPartialMap(): Option<Dict<PathReference<unknown>>>;
    bind(symbol: number, value: ScopeSlot<C>): void;
    bindSelf(self: PathReference<unknown>): void;
    bindSymbol(symbol: number, value: PathReference<unknown>): void;
    bindBlock(symbol: number, value: Option<ScopeBlock<C>>): void;
    bindEvalScope(map: Option<Dict<ScopeSlot<C>>>): void;
    bindPartialMap(map: Dict<PathReference<unknown>>): void;
    bindCallerScope(scope: Option<Scope<C>>): void;
    getCallerScope(): Option<Scope<C>>;
    child(): Scope<C>;
    private get;
    private set;
}
export declare const TRANSACTION: TransactionSymbol;
declare class TransactionImpl implements Transaction {
    readonly [TRANSACTION]: Option<TransactionImpl>;
    scheduledInstallManagers: ModifierManager[];
    scheduledInstallModifiers: unknown[];
    scheduledUpdateModifierManagers: ModifierManager[];
    scheduledUpdateModifiers: unknown[];
    createdComponents: unknown[];
    createdManagers: WithCreateInstance<unknown>[];
    updatedComponents: unknown[];
    updatedManagers: WithCreateInstance<unknown>[];
    destructors: Drop[];
    didCreate(component: unknown, manager: WithCreateInstance): void;
    didUpdate(component: unknown, manager: WithCreateInstance): void;
    scheduleInstallModifier(modifier: unknown, manager: ModifierManager): void;
    scheduleUpdateModifier(modifier: unknown, manager: ModifierManager): void;
    didDestroy(d: Drop): void;
    commit(): void;
}
export declare type ToBool = (value: unknown) => boolean;
export declare abstract class EnvironmentImpl implements Environment {
    [TRANSACTION]: Option<TransactionImpl>;
    protected updateOperations: GlimmerTreeChanges;
    protected appendOperations: GlimmerTreeConstruction;
    constructor({ appendOperations, updateOperations }: EnvironmentOptions);
    toConditionalReference(reference: Reference): Reference<boolean>;
    abstract iterableFor(reference: Reference, key: unknown): OpaqueIterable;
    abstract protocolForURL(s: string): string;
    getAppendOperations(): GlimmerTreeConstruction;
    getDOM(): GlimmerTreeChanges;
    begin(): void;
    private readonly transaction;
    didCreate(component: unknown, manager: WithCreateInstance): void;
    didUpdate(component: unknown, manager: WithCreateInstance): void;
    scheduleInstallModifier(modifier: unknown, manager: ModifierManager): void;
    scheduleUpdateModifier(modifier: unknown, manager: ModifierManager): void;
    didDestroy(d: Drop): void;
    commit(): void;
    attributeFor(element: SimpleElement, attr: string, _isTrusting: boolean, namespace?: Option<AttrNamespace>): DynamicAttribute;
}
export interface RuntimeEnvironmentDelegate {
    protocolForURL?(url: string): string;
    iterable?: IterableKeyDefinitions;
    toBool?(value: unknown): boolean;
    attributeFor?(element: SimpleElement, attr: string, isTrusting: boolean, namespace: Option<AttrNamespace>): DynamicAttribute;
}
export declare class RuntimeEnvironmentDelegateImpl implements RuntimeEnvironmentDelegate {
    private inner;
    readonly toBool: (value: unknown) => boolean;
    constructor(inner?: RuntimeEnvironmentDelegate);
    protocolForURL(url: string): string;
    attributeFor(element: SimpleElement, attr: string, isTrusting: boolean, namespace: Option<AttrNamespace>): DynamicAttribute;
    readonly iterable: IterableKeyDefinitions;
}
export declare class DefaultRuntimeResolver<R extends {
    module: string;
}> implements JitRuntimeResolver<R>, AotRuntimeResolver {
    private inner;
    constructor(inner: RuntimeResolverDelegate);
    lookupComponent(name: string, referrer?: unknown): Option<any>;
    lookupPartial(name: string, referrer?: unknown): Option<number>;
    resolve<U extends ResolvedValue>(handle: number): U;
    compilable(locator: {
        module: string;
    }): Template;
    getInvocation(locator: R): Invocation;
}
export declare function AotRuntime(document: SimpleDocument, program: CompilerArtifacts, resolver?: RuntimeResolverDelegate, delegate?: RuntimeEnvironmentDelegate): AotRuntimeContext;
export interface JitProgramCompilationContext extends WholeProgramCompilationContext {
    readonly constants: CompileTimeConstants & RuntimeConstants;
    readonly heap: CompileTimeHeap & RuntimeHeap;
}
export interface JitSyntaxCompilationContext extends SyntaxCompilationContext {
    readonly program: JitProgramCompilationContext;
    readonly macros: Macros;
}
export declare function CustomJitRuntime(resolver: RuntimeResolver, context: SyntaxCompilationContext & {
    program: {
        constants: RuntimeConstants;
        heap: RuntimeHeap;
    };
}, env: Environment): JitRuntimeContext;
export declare function JitRuntime(document: SimpleDocument, resolver?: RuntimeResolverDelegate, delegate?: RuntimeEnvironmentDelegate): JitRuntimeContext;
export declare function JitRuntimeFromProgram(document: SimpleDocument, program: RuntimeProgram, resolver?: RuntimeResolverDelegate, delegate?: RuntimeEnvironmentDelegate): JitRuntimeContext;
export declare class RuntimeEnvironment extends EnvironmentImpl {
    private delegate;
    constructor(document: SimpleDocument, delegate: RuntimeEnvironmentDelegateImpl);
    protocolForURL(url: string): string;
    iterableFor(ref: Reference, inputKey: unknown): OpaqueIterable;
    toConditionalReference(input: VersionedPathReference): VersionedReference<boolean>;
    attributeFor(element: SimpleElement, attr: string, isTrusting: boolean, namespace: Option<AttrNamespace>): DynamicAttribute;
}
export declare function inTransaction(env: Environment, cb: () => void): void;
export declare abstract class DefaultEnvironment extends EnvironmentImpl {
    constructor(options?: EnvironmentOptions);
}
export default EnvironmentImpl;
//# sourceMappingURL=environment.d.ts.map