import { Operation, Entry } from 'fs-tree-diff';
export interface InputTree {
    walk(): Entry[];
    mayChange: boolean;
}
export declare class Sources {
    private combinedEntries;
    private combinedOwners;
    constructor(combinedEntries: ReturnType<MultiTreeDiff['combinedEntries']>, combinedOwners: MultiTreeDiff['combinedOwners']);
    get(relativePath: string): number[];
}
export declare type Merger = (treeIndices: number[]) => number[];
export default class MultiTreeDiff {
    private inTrees;
    private merger;
    private prevEntries;
    private prevCombined;
    private owners;
    private combinedOwners;
    constructor(inTrees: InputTree[], merger: Merger);
    private allEntries;
    private candidates;
    private combinedEntries;
    update(): {
        ops: Operation[];
        sources: Sources;
    };
}
