"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sources = void 0;
const fs_tree_diff_1 = __importDefault(require("fs-tree-diff"));
const isEqual_1 = __importDefault(require("lodash/isEqual"));
// tells you which of your inTrees (by index) resulted in the given output file
class Sources {
    constructor(combinedEntries, combinedOwners) {
        this.combinedEntries = combinedEntries;
        this.combinedOwners = combinedOwners;
    }
    get(relativePath) {
        return this.combinedOwners.get(this.combinedEntries.get(relativePath));
    }
}
exports.Sources = Sources;
class MultiTreeDiff {
    constructor(inTrees, merger) {
        this.inTrees = inTrees;
        this.merger = merger;
        this.prevCombined = new fs_tree_diff_1.default();
        // tracks which input Entry is owned by which input tree
        this.owners = new WeakMap();
        // tracks which output Entry is owned by which set of input trees. This is
        // different from `owners` because merging is possible.
        this.combinedOwners = new WeakMap();
    }
    allEntries() {
        let result = this.inTrees.map((tree, index) => {
            if (!tree.mayChange && this.prevEntries && this.prevEntries[index]) {
                return this.prevEntries[index];
            }
            return tree.walk();
        });
        this.prevEntries = result;
        return result;
    }
    candidates(entries) {
        let result = new Map();
        for (let [treeIndex, treeEntries] of entries.entries()) {
            for (let entry of treeEntries) {
                let list = result.get(entry.relativePath);
                if (!list) {
                    list = [];
                    result.set(entry.relativePath, list);
                }
                list.push(entry);
                this.owners.set(entry, treeIndex);
            }
        }
        return result;
    }
    combinedEntries(candidates) {
        let result = new Map();
        for (let [relativePath, entries] of candidates.entries()) {
            if (entries.length === 1) {
                let [entry] = entries;
                // no collision, simple case.
                result.set(relativePath, entry);
                this.combinedOwners.set(entry, [this.owners.get(entry)]);
            }
            else {
                // collision, apply merge logic
                let winners = this.merger(entries.map(e => this.owners.get(e)));
                if (winners.length === 1) {
                    // single winner, no merging
                    let winner = entries.find(e => this.owners.get(e) === winners[0]);
                    result.set(relativePath, winner);
                    this.combinedOwners.set(winner, winners);
                }
                else {
                    // multiple winners, must synthesize a combined entry
                    let winningEntries = entries.filter(e => winners.includes(this.owners.get(e)));
                    let combinedEntry = {
                        relativePath,
                        size: winningEntries.reduce((accum, entry) => {
                            return accum + (entry.size || 0);
                        }, 0),
                        mtime: winningEntries.reduce((accum, entry) => {
                            return latest(accum, entry.mtime);
                        }, undefined),
                        isDirectory() {
                            return winningEntries.reduce((isDir, entry) => isDir || entry.isDirectory(), false);
                        },
                    };
                    result.set(relativePath, combinedEntry);
                    this.combinedOwners.set(combinedEntry, winners);
                }
            }
        }
        return result;
    }
    update() {
        let combinedEntries = this.combinedEntries(this.candidates(this.allEntries()));
        // FSTree requires the entries to be sorted and uniq. We already have
        // uniqueness because we're taking them out of a map. And here we do the
        // sort.
        let combinedEntriesList = [...combinedEntries.values()].sort(compareByRelativePath);
        let newFSTree = fs_tree_diff_1.default.fromEntries(combinedEntriesList);
        let ops = this.prevCombined.calculatePatch(newFSTree, isEqual(this.combinedOwners));
        this.prevCombined = newFSTree;
        return { ops, sources: new Sources(combinedEntries, this.combinedOwners) };
    }
}
exports.default = MultiTreeDiff;
function compareByRelativePath(entryA, entryB) {
    let pathA = entryA.relativePath;
    let pathB = entryB.relativePath;
    if (pathA < pathB) {
        return -1;
    }
    else if (pathA > pathB) {
        return 1;
    }
    return 0;
}
function isEqual(owners) {
    return function (a, b) {
        return fs_tree_diff_1.default.defaultIsEqual(a, b) && isEqual_1.default(owners.get(a), owners.get(b));
    };
}
function latest(a, b) {
    if (a == null) {
        return b;
    }
    if (b == null) {
        return a;
    }
    if (a instanceof Date) {
        a = a.getTime();
    }
    if (b instanceof Date) {
        b = b.getTime();
    }
    return Math.max(a, b);
}
//# sourceMappingURL=multi-tree-diff.js.map