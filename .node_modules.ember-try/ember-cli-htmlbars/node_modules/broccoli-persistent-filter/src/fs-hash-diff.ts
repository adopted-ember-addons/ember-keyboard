/// @ts-check
'use strict';

// Imported for type annotations.
import FSTree = require('fs-tree-diff');
import Entry from 'fs-tree-diff/lib/entry';

export class HashEntry {
  relativePath: string;
  hash: string;

  constructor(relativePath: string, hash: string) {
    this.relativePath = relativePath;
    this.hash = hash;
  }

  isDirectory(): boolean {
    return false;
  }

  /**
   * Whether the entries have the same content.
   */
  equals(other: unknown): boolean {
    if (other instanceof HashEntry) {
      return this.hash === other.hash;
    } else {
      return false;
    }
  }
}

export class FSHashTree extends FSTree<Entry | HashEntry> {
  /**
   * Creates an instance of FSHashTree.
   * @param [options] {{entries?: Array<Entry|HashEntry>, sortAndExpand?: boolean}}
   */
  constructor(options: ConstructorParameters<typeof FSTree>[0]) {
    super(options);
    this.entries = options?.entries || [];
  }
  static defaultIsEqual(entryA: HashEntry | Entry, entryB: HashEntry | Entry): boolean {
    if (entryA instanceof HashEntry) {
      return entryA.equals(entryB);
    } else if (entryB instanceof HashEntry) {
      return false;
    } else {
      return super.defaultIsEqual(entryA, entryB);
    }
  }

  static fromHashEntries(entries: Array<HashEntry | Entry>, options = {sortAndExpand: true}): FSHashTree {
    return new FSHashTree({
      entries,
      sortAndExpand: options.sortAndExpand
    });
  }
}
