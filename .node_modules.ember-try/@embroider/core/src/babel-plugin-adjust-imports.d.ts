import { NodePath } from '@babel/traverse';
import { Program, CallExpression, StringLiteral, ArrayExpression, ExportNamedDeclaration, ImportDeclaration, ExportAllDeclaration } from '@babel/types';
import Package from './package';
interface State {
    emberCLIVanillaJobs: Function[];
    adjustFile: AdjustFile;
    opts: {
        renamePackages: {
            [fromName: string]: string;
        };
        renameModules: {
            [fromName: string]: string;
        };
        extraImports: {
            absPath: string;
            target: string;
            runtimeName?: string;
        }[];
        externalsDir: string;
        activeAddons: {
            [packageName: string]: string;
        };
        relocatedFiles: {
            [relativePath: string]: string;
        };
        resolvableExtensions: string[];
    };
}
export declare type Options = State['opts'];
declare type DefineExpressionPath = NodePath<CallExpression> & {
    node: CallExpression & {
        arguments: [StringLiteral, ArrayExpression, Function];
    };
};
export declare function isImportSyncExpression(path: NodePath<any>): boolean;
export declare function isDynamicImportExpression(path: NodePath<any>): boolean;
export declare function isDefineExpression(path: NodePath<any>): path is DefineExpressionPath;
export default function main(): {
    visitor: {
        Program: {
            enter(path: NodePath<Program>, state: State): void;
            exit(_: any, state: State): void;
        };
        CallExpression(path: NodePath<CallExpression>, state: State): void;
        'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(path: NodePath<ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration>, state: State): void;
    };
};
declare class AdjustFile {
    name: string;
    readonly originalFile: string;
    constructor(name: string, relocatedFiles: Options['relocatedFiles']);
    get isRelocated(): boolean;
    owningPackage(): Package | undefined;
    relocatedIntoPackage(): Package | undefined;
}
export {};
