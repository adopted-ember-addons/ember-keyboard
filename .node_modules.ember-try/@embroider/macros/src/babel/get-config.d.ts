import { NodePath } from '@babel/traverse';
import { CallExpression, FunctionDeclaration } from '@babel/types';
import State from './state';
export declare type Mode = 'own' | 'getGlobalConfig' | 'package';
export default function getConfig(path: NodePath<CallExpression>, state: State, mode: Mode): unknown;
export declare function insertConfig(path: NodePath<CallExpression>, state: State, mode: Mode): void;
export declare function inlineRuntimeConfig(path: NodePath<FunctionDeclaration>, state: State): void;
