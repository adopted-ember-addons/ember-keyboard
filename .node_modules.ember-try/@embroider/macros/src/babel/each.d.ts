import { NodePath } from '@babel/traverse';
import { CallExpression, ForOfStatement, Identifier } from '@babel/types';
import State from './state';
declare type CallEachExpression = NodePath<CallExpression> & {
    get(callee: 'callee'): NodePath<Identifier>;
};
export declare type EachPath = NodePath<ForOfStatement> & {
    get(right: 'right'): CallEachExpression;
};
export declare function isEachPath(path: NodePath<ForOfStatement>): path is EachPath;
export declare function insertEach(path: EachPath, state: State): void;
export {};
