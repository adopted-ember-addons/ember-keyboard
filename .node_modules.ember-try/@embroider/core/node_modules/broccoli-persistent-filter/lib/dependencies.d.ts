/// <reference types="node" />
import * as fs from 'fs';
import FSTree = require('fs-tree-diff');
import Entry from 'fs-tree-diff/lib/entry';
import { FSHashTree } from './fs-hash-diff';
import FSMerger = require('fs-merger');
declare const LOCAL_PATH: unique symbol;
declare namespace Dependencies {
    type FSFacade = Pick<typeof fs, 'existsSync' | 'readFileSync' | 'statSync'> & Pick<FSMerger.FS, 'relativePathTo'>;
    interface Options {
        fs: FSFacade;
    }
    interface SerializedTreeEntry {
        relativePath: string;
    }
    interface SerializedStatEntry {
        type: 'stat';
        size: number;
        mtime: number;
        mode: number;
    }
    interface SerializedHashEntry {
        type: 'hash';
        hash: string;
    }
    type SerializedEntry = SerializedTreeEntry & (SerializedStatEntry | SerializedHashEntry);
    interface SerializedExternalRoot {
        type: 'external';
        rootDir: string;
    }
    interface SerializedLocalRoot {
        type: 'local';
    }
    type SerializedRoot = SerializedExternalRoot | SerializedLocalRoot;
    type SerializedTree = {
        fsRoot: SerializedRoot;
        entries: Array<SerializedEntry>;
    };
    interface SerializedDependencies {
        fsTrees: Array<SerializedTree>;
        dependencies: Record<string, Array<string>>;
    }
}
declare class Dependencies {
    static __LOCAL_ROOT: symbol;
    /**
     * Tracks whether new dependencies can be added.
     **/
    private sealed;
    /**
     * The root directory containing the files that have dependencies. Relative
     * paths are resolved against this directory.
     */
    private rootFS;
    /**
     * Tracks dependencies on a per file basis.
     *
     * The key is a relative path.
     *
     * The value is:
     *   - an absolute path if the Path tag is EXTERNAL_PATH.
     *   - an relative path if the Path tag is LOCAL_PATH.
     **/
    private dependencyMap;
    /**
     * Map of filesystem roots to unique dependencies on that filesystem. This
     * property is only populated once `seal()` is called. This allows us to
     * build an FSTree (which requires relative paths) per filesystem root.
     */
    private allDependencies;
    /**
     * Map of filesystem roots to FSTrees, capturing the state of all
     * dependencies.
     */
    private fsTrees;
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
    constructor(rootFS: Dependencies.FSFacade, inputEncoding: string);
    /**
     * Seals the dependencies. No more dependencies can be added once this is
     * called.
     * @return {this}
     */
    seal(): this;
    _getDepsForRoot(dir: string | typeof LOCAL_PATH): Set<string>;
    unseal(): void;
    countAll(): number;
    /**
     * Counts the number of unique dependencies.
     *
     * @returns {number}
     */
    countUnique(): number;
    /**
     * Set the dependencies for the file specified by `filePath`.
     *
     * @param filePath {string} relative path of the file that has dependencies.
     * @param dependencies {Array<string>} absolute or relative paths the file
     *   depends on. Relative paths are resolved relative to the directory
     *   containing the file that depends on them.
     */
    setDependencies(filePath: string, dependencies: Array<string>): void;
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
    copyWithout(files: Array<string>): Dependencies;
    /**
     * Get the dependency state and save it.
     * Dependencies must be sealed.
     * @returns {this}
     */
    captureDependencyState(): this;
    /**
     * Compute dependencies state as fsTrees.
     * @returns {Map<string, FSTree<Entry> | FSHashTree>} an fs tree per filesystem root.
     */
    getDependencyState(): Map<string | typeof LOCAL_PATH, FSTree<Entry> | FSHashTree>;
    /**
     * Returns the dependent files which have had a dependency change
     * since the last call to this method.
     * @returns {Array<string>} relative paths to the files that had a dependency change.
     */
    getInvalidatedFiles(): string[];
    /**
     * Serialize to a simple, JSON-friendly object containing only the
     * data necessary for deserializing.
     *
     * This object is serializable so it can be put into the persistent cache and
     * used to invalidate files during the next build in a new process.
     * @return {{rootDir: string, dependencies: {[k: string]: string[]}, fsTrees: Array<{fsRoot: string, entries: Array<{relativePath: string} & ({type: 'stat', size: number, mtime: number, mode: number} | {type: 'hash', hash: string})>}>}}
     */
    serialize(): Dependencies.SerializedDependencies;
    /**
     * Deserialize from JSON data returned from the `serialize` method.
     *
     * @param dependencyData {ReturnType<Dependencies['serialize']>}
     * @param [newRootDir] {string | undefined}
     * @param customFS {typeof fs}. A customFS method to support fs facade change in broccoli-plugin.
     * @return {Dependencies};
     */
    static deserialize(dependencyData: Dependencies.SerializedDependencies, customFS: Dependencies.FSFacade, inputEncoding: string): Dependencies;
}
export = Dependencies;
//# sourceMappingURL=dependencies.d.ts.map