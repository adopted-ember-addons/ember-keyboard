import { NodePath } from '@babel/traverse';
import { IfStatement, ConditionalExpression, CallExpression, Identifier } from '@babel/types';
import State from './state';
export declare type MacroConditionPath = NodePath<IfStatement | ConditionalExpression> & {
    get(test: 'test'): NodePath<CallExpression> & {
        get(callee: 'callee'): NodePath<Identifier>;
    };
};
export declare function isMacroConditionPath(path: NodePath<IfStatement | ConditionalExpression>): path is MacroConditionPath;
export default function macroCondition(conditionalPath: MacroConditionPath, state: State): void;
