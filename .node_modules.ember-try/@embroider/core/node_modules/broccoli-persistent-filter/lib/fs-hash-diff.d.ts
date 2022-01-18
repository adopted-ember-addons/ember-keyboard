import FSTree = require('fs-tree-diff');
import Entry from 'fs-tree-diff/lib/entry';
export declare class HashEntry {
    relativePath: string;
    hash: string;
    constructor(relativePath: string, hash: string);
    isDirectory(): boolean;
    /**
     * Whether the entries have the same content.
     */
    equals(other: unknown): boolean;
}
export declare class FSHashTree extends FSTree<Entry | HashEntry> {
    /**
     * Creates an instance of FSHashTree.
     * @param [options] {{entries?: Array<Entry|HashEntry>, sortAndExpand?: boolean}}
     */
    constructor(options: ConstructorParameters<typeof FSTree>[0]);
    static defaultIsEqual(entryA: HashEntry | Entry, entryB: HashEntry | Entry): boolean;
    static fromHashEntries(entries: Array<HashEntry | Entry>, options?: {
        sortAndExpand: boolean;
    }): FSHashTree;
}
//# sourceMappingURL=fs-hash-diff.d.ts.map