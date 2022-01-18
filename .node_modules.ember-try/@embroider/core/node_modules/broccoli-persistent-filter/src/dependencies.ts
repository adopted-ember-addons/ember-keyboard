/// @ts-check
'use strict';

import * as path from 'path';
import * as fs from 'fs';
import FSTree = require('fs-tree-diff');
import Entry from 'fs-tree-diff/lib/entry';
import { HashEntry, FSHashTree } from './fs-hash-diff';
import md5sum = require('./md5-hex');
import FSMerger = require('fs-merger');
import resolveRelative from './util/resolveRelative';


const LOCAL_PATH: unique symbol = Symbol('Local Filesystem');
const EXTERNAL_PATH: unique symbol = Symbol('External Filesystem');

type PathTag = typeof LOCAL_PATH | typeof EXTERNAL_PATH;

namespace Dependencies {
  export type FSFacade =
    Pick<typeof fs, 'existsSync' | 'readFileSync' | 'statSync'>
    & Pick<FSMerger.FS, 'relativePathTo'>;

  export interface Options {
    fs: FSFacade;
  }

  export interface SerializedTreeEntry {
    relativePath: string;
  }

  export interface SerializedStatEntry {
    type: 'stat';
    size: number;
    mtime: number;
    mode: number;
  }

  export interface SerializedHashEntry {
    type: 'hash';
    hash: string;
  }

  export type SerializedEntry = SerializedTreeEntry
    & (SerializedStatEntry | SerializedHashEntry);

  export interface SerializedExternalRoot {
    type: 'external';
    rootDir: string;
  }

  export interface SerializedLocalRoot {
    type: 'local';
  }

  export type SerializedRoot = SerializedExternalRoot | SerializedLocalRoot;

  export type SerializedTree = {
    fsRoot: SerializedRoot,
    entries: Array<SerializedEntry>
  }

  export interface SerializedDependencies {
    fsTrees: Array<SerializedTree>;
    dependencies: Record<string, Array<string>>;
  }
}

class Dependencies {
  // This is exposed for testing purposes
  static __LOCAL_ROOT = LOCAL_PATH;
  /**
   * Tracks whether new dependencies can be added.
   **/
  private sealed: boolean;
  /**
   * The root directory containing the files that have dependencies. Relative
   * paths are resolved against this directory.
   */
  private rootFS: Dependencies.FSFacade;
  /**
   * Tracks dependencies on a per file basis.
   *
   * The key is a relative path.
   *
   * The value is:
   *   - an absolute path if the Path tag is EXTERNAL_PATH.
   *   - an relative path if the Path tag is LOCAL_PATH.
   **/
  private dependencyMap: Map<string, Array<[PathTag, string]>>;
  /**
   * Map of filesystem roots to unique dependencies on that filesystem. This
   * property is only populated once `seal()` is called. This allows us to
   * build an FSTree (which requires relative paths) per filesystem root.
   */
  private allDependencies: Map<string | typeof LOCAL_PATH, Set<string>>;
  /**
   * Map of filesystem roots to FSTrees, capturing the state of all
   * dependencies.
   */
  private fsTrees: Map<string | typeof LOCAL_PATH, FSTree<Entry>|FSHashTree>;
  /**
   * Maps dependencies to the local files that depend on them.
   * Keys that are relative are relative to the local tree. Absolute paths are
   * external to the local tree.
   * Values are paths relative to the local tree.
   */
  dependentsMap: Map<string, string[]>;
  inputEncoding: string;

  /**
   * Creates an instance of Dependencies.
   * @param rootDir The root directory containing the files that
   *   have dependencies. Relative paths are resolved against this directory.
   * @param options options is used to pass the custom fs opertations implementations
   */
  constructor(rootFS: Dependencies.FSFacade, inputEncoding: string) {
    this.inputEncoding = inputEncoding;
    this.rootFS = rootFS;
    this.sealed = false;
    this.dependencyMap = new Map<string, Array<[PathTag, string]>>();
    this.allDependencies = new Map<string, Set<string>>();
    this.fsTrees = new Map<string, FSTree<Entry>|FSHashTree>();
    this.dependentsMap = new Map<string, Array<string>>();
  }

  /**
   * Seals the dependencies. No more dependencies can be added once this is
   * called.
   * @return {this}
   */
  seal(): this {
    if (this.sealed) return this;
    this.sealed = true;
    this.dependencyMap.forEach((deps, referer) => {
      for (let [tag, dep] of deps) {
        let depRoot: string | typeof LOCAL_PATH;
        if (tag === LOCAL_PATH) {
          depRoot = LOCAL_PATH;
          let depsForRoot = this._getDepsForRoot(depRoot);
          depsForRoot.add(dep);
        } else {
          depRoot = path.parse(dep).root;
          let depsForRoot = this._getDepsForRoot(depRoot);
          depsForRoot.add(path.relative(depRoot, dep));
        }

        // Create an inverse map so that when a dependency is invalidated
        // we can track it back to the file that should be processed again.
        let dependents = this.dependentsMap.get(dep);
        if (!dependents) {
          dependents = [];
          this.dependentsMap.set(dep, dependents);
        }
        dependents.push(referer);
      }
    });
    return this;
  }

  _getDepsForRoot(dir: string | typeof LOCAL_PATH) {
    let depsForRoot = this.allDependencies.get(dir);
    if (!depsForRoot) {
      depsForRoot = new Set();
      this.allDependencies.set(dir, depsForRoot);
    }
    return depsForRoot;
  }

  unseal() {
    this.sealed = false;
    this.allDependencies.clear();
    this.fsTrees.clear();
  }

  countAll() {
    let num = 0;
    this.dependencyMap.forEach((deps) => {
      num += deps.length;
    });
    return num;
  }

  /**
   * Counts the number of unique dependencies.
   *
   * @returns {number}
   */
  countUnique() {
    if (!this.sealed) {
      throw new Error('Cannot count dependencies until after sealing them.');
    } else {
      return this.dependentsMap.size;
    }
  }

  /**
   * Set the dependencies for the file specified by `filePath`.
   *
   * @param filePath {string} relative path of the file that has dependencies.
   * @param dependencies {Array<string>} absolute or relative paths the file
   *   depends on. Relative paths are resolved relative to the directory
   *   containing the file that depends on them.
   */
  setDependencies(filePath: string, dependencies: Array<string>) {
    filePath = path.normalize(filePath);
    if (this.sealed) {
      throw new Error('Cannot set dependencies when sealed');
    }
    let fileDeps = new Array<[PathTag, string]>();
    let fileDir = path.dirname(filePath);
    for (let dep of dependencies) {
      if (path.isAbsolute(dep)) {
        let localPath = this.rootFS.relativePathTo(dep);
        if (localPath) {
          fileDeps.push([LOCAL_PATH, localPath.relativePath]);
        } else {
          fileDeps.push([EXTERNAL_PATH, dep]);
        }
      } else {
        let depPath = resolveRelative(fileDir, dep);
        let tag = path.isAbsolute(depPath) ? EXTERNAL_PATH : LOCAL_PATH;
        fileDeps.push([tag, depPath]);
      }
    }
    this.dependencyMap.set(filePath, fileDeps);
  }

  /**
   * Return a new, unsealed Dependencies that includes all the files and their
   * dependencies except for the files provided (and their dependencies) are
   * omitted.
   *
   * Note: this doesn't include the stat entries for the existing dependencies.
   *
   * @param files {Array<string>}
   * @returns {Dependencies}
   */
  copyWithout(files: Array<string>) {
    files = files.map(f => path.normalize(f));
    let newDeps = new Dependencies(this.rootFS, this.inputEncoding);
    for (let file of this.dependencyMap.keys()) {
      if (!files.includes(file)) {
        newDeps.dependencyMap.set(file, this.dependencyMap.get(file)!);
      }
    }
    return newDeps;
  }

  /**
   * Get the dependency state and save it.
   * Dependencies must be sealed.
   * @returns {this}
   */
  captureDependencyState() {
    this.fsTrees = this.getDependencyState();
    return this;
  }

  /**
   * Compute dependencies state as fsTrees.
   * @returns {Map<string, FSTree<Entry> | FSHashTree>} an fs tree per filesystem root.
   */
  getDependencyState() {
    if (!this.sealed) {
      throw new Error('Cannot compute dependency state with unsealed dependencies.');
    }
    let fsTrees = new Map<string | typeof LOCAL_PATH, FSTree<Entry> | FSHashTree>();
    for (let fsRoot of this.allDependencies.keys()) {
      let dependencies = this.allDependencies.get(fsRoot)!;
      let fsTree;
      if (fsRoot === LOCAL_PATH) {
        fsTree = getHashTree(this.rootFS, dependencies, this.inputEncoding);
      } else {
        fsTree = getStatTree(fsRoot, dependencies);
      }
      fsTrees.set(fsRoot, fsTree);
    }
    return fsTrees;
  }

  /**
   * Returns the dependent files which have had a dependency change
   * since the last call to this method.
   * @returns {Array<string>} relative paths to the files that had a dependency change.
   */
  getInvalidatedFiles() {
    let invalidated = new Set<string>();
    let currentState = this.getDependencyState();
    for (let fsRoot of this.allDependencies.keys()) {
      let oldTree = this.fsTrees.get(fsRoot);
      let currentTree = currentState.get(fsRoot);
      if (!oldTree || !currentTree) throw new Error('internal error');
      let patch: FSTree.Patch;
      // typescript doesn't think these calculatePatch methods are the same
      // enough to call them from a single code path. I think it's a typescript
      // bug. the use of a type discriminator works around it.
      if (oldTree instanceof FSHashTree) {
        patch = oldTree.calculatePatch(currentTree);
      } else {
        patch = oldTree.calculatePatch(currentTree);
      }
      for (let operation of patch) {
        let depPath = operation[1];
        let dependents;
        if (fsRoot === LOCAL_PATH) {
          dependents = this.dependentsMap.get(depPath);
        } else {
          dependents = this.dependentsMap.get(fsRoot + depPath);
        }
        if (!dependents) { continue; }
        for (let dep of dependents) {
          invalidated.add(dep);
        }
      }
    }
    this.fsTrees = currentState;
    return new Array(...invalidated);
  }

  /**
   * Serialize to a simple, JSON-friendly object containing only the
   * data necessary for deserializing.
   *
   * This object is serializable so it can be put into the persistent cache and
   * used to invalidate files during the next build in a new process.
   * @return {{rootDir: string, dependencies: {[k: string]: string[]}, fsTrees: Array<{fsRoot: string, entries: Array<{relativePath: string} & ({type: 'stat', size: number, mtime: number, mode: number} | {type: 'hash', hash: string})>}>}}
   */
  serialize(): Dependencies.SerializedDependencies {
    let dependencies: Record<string, Array<string>> = {};
    this.dependencyMap.forEach((deps, filePath) => {
      dependencies[filePath] = deps.map(([tag, dep]) => {
        let isAbsolute = path.isAbsolute(dep);
        if (isAbsolute && tag === LOCAL_PATH ||
            !isAbsolute && tag === EXTERNAL_PATH) {
              throw new Error('internal error');
        }
        return dep;
      });
    });
    let fsTrees = new Array<Dependencies.SerializedTree>();
    for (let rootDir of this.fsTrees.keys()) {
      let fsRoot: Dependencies.SerializedLocalRoot | Dependencies.SerializedExternalRoot;
      if (rootDir === LOCAL_PATH) {
        fsRoot = {type: 'local'};
      } else {
        fsRoot = {type: 'external', rootDir};
      }
      let fsTree = this.fsTrees.get(rootDir)!;
      let entries = new Array<Dependencies.SerializedEntry>();
      for (let entry of fsTree.entries) {
        if (entry instanceof HashEntry) {
          entries.push({
            type: 'hash',
            relativePath: entry.relativePath,
            hash: entry.hash,
          });
        } else {
          entries.push({
            type: 'stat',
            relativePath: entry.relativePath,
            size: entry.size!,
            mtime: +entry.mtime!,
            mode: entry.mode!
          });
        }
      }
      fsTrees.push({
        fsRoot,
        entries
      });
    }
    let serialized: Dependencies.SerializedDependencies = {
      dependencies,
      fsTrees
    };
    return serialized;
  }

  /**
   * Deserialize from JSON data returned from the `serialize` method.
   *
   * @param dependencyData {ReturnType<Dependencies['serialize']>}
   * @param [newRootDir] {string | undefined}
   * @param customFS {typeof fs}. A customFS method to support fs facade change in broccoli-plugin.
   * @return {Dependencies};
   */
  static deserialize(dependencyData: Dependencies.SerializedDependencies, customFS: Dependencies.FSFacade, inputEncoding: string): Dependencies {
    let dependencies = new Dependencies(customFS, inputEncoding);
    let prevFsTree = dependencyData.fsTrees[0];
    if (prevFsTree && typeof prevFsTree.fsRoot === 'string') {
      // Ideally the serialized cache would be invalidated when this code changes,
      // but just to be safe we handle the situation where old serialized data
      // that doesn't work with the current implementation might be present.
      dependencies.seal();
      return dependencies;
    }
    let files = Object.keys(dependencyData.dependencies);
    for (let file of files) {
      let deps = dependencyData.dependencies[file];
      let taggedPaths: Array<[PathTag, string]> = deps.map((filePath) => {
        return path.isAbsolute(filePath) ? [EXTERNAL_PATH, filePath] : [LOCAL_PATH, filePath];
      });
      dependencies.dependencyMap.set(file, taggedPaths);
    }
    let fsTrees = new Map<string | typeof LOCAL_PATH, FSTree | FSHashTree>();
    for (let fsTreeData of dependencyData.fsTrees) {
      let entries = new Array<Entry | HashEntry>();
      for (let entry of fsTreeData.entries) {
        if (entry.type === 'stat') {
          entries.push(new Entry(entry.relativePath, entry.size, entry.mtime, entry.mode));
        } else {
          entries.push(new HashEntry(entry.relativePath, entry.hash));
        }
      }
      let fsTree: FSTree | FSHashTree;
      let treeRoot: string | typeof LOCAL_PATH;
      if (fsTreeData.fsRoot.type === 'local') {
        treeRoot = LOCAL_PATH;
        fsTree = FSHashTree.fromHashEntries(entries, { sortAndExpand: true });
      } else {
        treeRoot = fsTreeData.fsRoot.rootDir;
        fsTree = FSTree.fromEntries(entries, { sortAndExpand: true });
      }
      fsTrees.set(treeRoot, fsTree);
    }
    dependencies.seal();
    dependencies.fsTrees = fsTrees;
    return dependencies;
  }
}

export = Dependencies;

/**
 * Get an FSTree that uses content hashing information to compare files to
 * see if they have changed.
 *
 * @param fsRoot {string}
 * @param dependencies {Set<string>}
 * @return {FSHashTree}
 */
function getHashTree(fs: Dependencies.FSFacade, dependencies: Set<string>, encoding: string = 'utf8'): FSHashTree {
  let entries = new Array<HashEntry>();
  for (let dependency of dependencies) {
    // it would be good if we could cache this and share it with
    // the read that accompanies `processString()` (if any).
    if (fs.existsSync(dependency)) {
      let contents = fs.readFileSync(dependency, encoding);
      let hash = md5sum(contents);
      entries.push(new HashEntry(dependency, hash));
    }
  }
  return FSHashTree.fromHashEntries(entries);
}

/**
 * Get an FSTree that uses fs.stat information to compare files to see
 * if they have changed.
 *
 * @param fsRoot {string} The root directory for these files
 * @param dependencies {Set<string>}
 */
function getStatTree(fsRoot: string, dependencies: Set<string>): FSTree<Entry> {
  let entries = new Array<Entry>();
  for (let dependency of dependencies) {
    let fullPath = path.join(fsRoot, dependency);
    try {
      // TODO: Share a cache of stat results across all persistent filters.
      let stats = fs.statSync(fullPath);
      let entry = Entry.fromStat(dependency, stats);
      entries.push(entry);
    } catch (e) {
      entries.push(new Entry(dependency, 0, 0));
    }
  }
  return FSTree.fromEntries(entries, {sortAndExpand: true});
}
