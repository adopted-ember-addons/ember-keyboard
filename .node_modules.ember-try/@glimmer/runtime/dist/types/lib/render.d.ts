import { Dict, DynamicScope, Environment, RenderResult, SyntaxCompilationContext, TemplateIterator, Cursor, JitRuntimeContext, AotRuntimeContext, ElementBuilder } from '@glimmer/interfaces';
import { PathReference } from '@glimmer/reference';
export declare function renderSync(env: Environment, iterator: TemplateIterator): RenderResult;
export declare function renderAotMain(runtime: AotRuntimeContext, self: PathReference, treeBuilder: ElementBuilder, handle: number, dynamicScope?: DynamicScope): TemplateIterator;
export declare function renderAot(runtime: AotRuntimeContext, handle: number, cursor: Cursor, self?: PathReference): TemplateIterator;
export declare function renderJitMain(runtime: JitRuntimeContext, context: SyntaxCompilationContext, self: PathReference, treeBuilder: ElementBuilder, handle: number, dynamicScope?: DynamicScope): TemplateIterator;
export declare type RenderComponentArgs = Dict<PathReference>;
export declare function renderAotComponent<R>(runtime: AotRuntimeContext<R>, treeBuilder: ElementBuilder, main: number, name: string, args?: RenderComponentArgs, dynamicScope?: DynamicScope): TemplateIterator;
export declare function renderJitComponent(runtime: JitRuntimeContext, treeBuilder: ElementBuilder, context: SyntaxCompilationContext, main: number, name: string, args?: RenderComponentArgs, dynamicScope?: DynamicScope): TemplateIterator;
//# sourceMappingURL=render.d.ts.map