import { ASTPlugin, ASTPluginEnvironment } from '@glimmer/syntax';
import { AST, Syntax } from '@glimmer/syntax';
declare type APluginFunc = (env: ASTPluginEnvironment) => ASTPlugin | undefined;
declare type PluginFunc = APluginFunc & {
    __raw?: LegacyPluginClass | undefined;
};
export interface LegacyPlugin {
    transform(node: AST.Program): AST.Node;
    syntax: Syntax;
}
export declare type LegacyPluginClass = new (env: ASTPluginEnvironment) => LegacyPlugin;
export default function wrapLegacyPluginIfNeeded(_plugin: PluginFunc | LegacyPluginClass): PluginFunc;
export {};
