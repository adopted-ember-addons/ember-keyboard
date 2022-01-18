import { NodePath } from '@babel/traverse';
import { Program, ExportDefaultDeclaration, ExportNamedDeclaration } from '@babel/types';
interface State {
    colocatedTemplate: string | undefined;
    importTemplateAs: string | undefined;
    associateWithName: string | undefined;
    mustImportComponent: undefined | {
        source: string;
        name: string;
    };
}
export default function main(): {
    visitor: {
        Program: {
            enter(path: NodePath<Program>, state: State): void;
            exit(path: NodePath<Program>, state: State): void;
        };
        ExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>, state: State): void;
        ExportNamedDeclaration(path: NodePath<ExportNamedDeclaration>, state: State): void;
    };
};
export {};
