import type { AST } from '@glimmer/syntax';
export declare function sourceForLoc(source: string | string[], loc?: AST.SourceLocation): string;
export declare function isSynthetic(node: AST.Node): boolean;
export declare function sortByLoc(a: AST.Node, b: AST.Node): -1 | 0 | 1;
export declare function compact(array: unknown[]): unknown[];
export declare function compactJoin(array: unknown[], delimeter?: string): string;
export declare function getLines(source: string): string[];
//# sourceMappingURL=utils.d.ts.map