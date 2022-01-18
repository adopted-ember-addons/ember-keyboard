import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';
import State from './state';
export default function moduleExists(path: NodePath<CallExpression>, state: State): boolean;
