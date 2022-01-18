import { Resolver, ResolvedDep } from './resolver';
import { Node } from 'broccoli-node-api';
import { PluginItem } from '@babel/core';
import { PortableHint } from './portable';
export interface Plugins {
    ast?: unknown[];
}
interface AST {
    _deliberatelyOpaque: 'AST';
}
export declare function templateCompilerModule(params: TemplateCompilerParams, hints: PortableHint[]): {
    src: string;
    isParallelSafe: boolean;
};
export interface TemplateCompilerParams {
    compilerPath: string;
    resolver?: Resolver;
    EmberENV: unknown;
    plugins: Plugins;
}
export declare class TemplateCompiler {
    params: TemplateCompilerParams;
    constructor(params: TemplateCompilerParams);
    private get syntax();
    get cacheKey(): string;
    private setup;
    private getReversedASTPlugins;
    precompile(moduleName: string, contents: string): {
        compiled: string;
        dependencies: ResolvedDep[];
    };
    compile(moduleName: string, contents: string): string;
    applyTransforms(moduleName: string, contents: string): string;
    parse(moduleName: string, contents: string): AST;
    applyTransformsToTree(tree: Node): Node;
    inlineTransformsBabelPlugin(): PluginItem;
    baseDir(): string;
    static isInlinePrecompilePlugin(item: PluginItem): boolean;
}
export {};
