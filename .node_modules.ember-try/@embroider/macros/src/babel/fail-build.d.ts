import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';
import State from './state';
export default function failBuild(path: NodePath<CallExpression>, state: State): void;
