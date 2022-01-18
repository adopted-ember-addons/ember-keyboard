/// @ts-check
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Imported for type annotations.
const FSTree = require("fs-tree-diff");
class HashEntry {
    constructor(relativePath, hash) {
        this.relativePath = relativePath;
        this.hash = hash;
    }
    isDirectory() {
        return false;
    }
    /**
     * Whether the entries have the same content.
     */
    equals(other) {
        if (other instanceof HashEntry) {
            return this.hash === other.hash;
        }
        else {
            return false;
        }
    }
}
exports.HashEntry = HashEntry;
class FSHashTree extends FSTree {
    /**
     * Creates an instance of FSHashTree.
     * @param [options] {{entries?: Array<Entry|HashEntry>, sortAndExpand?: boolean}}
     */
    constructor(options) {
        super(options);
        this.entries = (options === null || options === void 0 ? void 0 : options.entries) || [];
    }
    static defaultIsEqual(entryA, entryB) {
        if (entryA instanceof HashEntry) {
            return entryA.equals(entryB);
        }
        else if (entryB instanceof HashEntry) {
            return false;
        }
        else {
            return super.defaultIsEqual(entryA, entryB);
        }
    }
    static fromHashEntries(entries, options = { sortAndExpand: true }) {
        return new FSHashTree({
            entries,
            sortAndExpand: options.sortAndExpand
        });
    }
}
exports.FSHashTree = FSHashTree;
//# sourceMappingURL=fs-hash-diff.js.map