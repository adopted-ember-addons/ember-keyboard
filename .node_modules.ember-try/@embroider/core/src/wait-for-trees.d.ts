import BroccoliPlugin from 'broccoli-plugin';
import { Node } from 'broccoli-node-api';
export default class WaitForTrees<NamedTrees> extends BroccoliPlugin {
    private trees;
    private buildHook;
    constructor(trees: NamedTrees, annotation: string, buildHook: (trees: OutputPaths<NamedTrees>, changed: Map<string, boolean>) => Promise<void>);
    build(detail?: {
        changedNodes: boolean[];
    }): Promise<void>;
}
export declare type OutputPaths<NamedTrees> = {
    [P in keyof NamedTrees]: NamedTrees[P] extends Node ? string : NamedTrees[P] extends Node[] ? string[] : never;
};
