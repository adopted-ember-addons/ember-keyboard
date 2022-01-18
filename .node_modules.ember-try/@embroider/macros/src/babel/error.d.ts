import { NodePath } from '@babel/traverse';
export default function error(path: NodePath, message: string): MacroError;
declare class MacroError extends Error {
    type: string;
    constructor(message: string);
}
export {};
