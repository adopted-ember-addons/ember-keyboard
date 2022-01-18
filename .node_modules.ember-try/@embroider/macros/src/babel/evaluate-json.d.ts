import { NodePath } from '@babel/traverse';
import { Identifier, ObjectExpression, MemberExpression, CallExpression, OptionalMemberExpression } from '@babel/types';
import State from './state';
export interface ConfidentResult {
    confident: true;
    value: any;
}
export interface UnknownResult {
    confident: false;
}
export declare type EvaluateResult = ConfidentResult | UnknownResult;
export interface EvaluationEnv {
    knownPaths?: Map<NodePath, EvaluateResult>;
    locals?: {
        [localVar: string]: any;
    };
    state?: State;
}
export declare class Evaluator {
    private knownPaths;
    private locals;
    private state;
    constructor(env?: EvaluationEnv);
    evaluateMember(path: NodePath<MemberExpression | OptionalMemberExpression>, optionalChain: boolean): EvaluateResult;
    evaluateKey(path: NodePath): EvaluateResult;
    evaluate(path: NodePath): EvaluateResult;
    private realEvaluate;
    private maybeEvaluateRuntimeConfig;
    evaluateMacroCall(path: NodePath<CallExpression>): EvaluateResult;
}
export declare function assertNotArray<T>(input: T | T[]): T;
export declare function assertArray<T>(input: T | T[]): T[];
export declare function buildLiterals(value: unknown | undefined): Identifier | ObjectExpression;
