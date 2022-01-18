"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multi_tree_diff_1 = __importDefault(require("./multi-tree-diff"));
const walk_sync_1 = __importDefault(require("walk-sync"));
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const messages_1 = require("./messages");
const assert_never_1 = __importDefault(require("assert-never"));
const describe_exports_1 = require("./describe-exports");
const js_handlebars_1 = require("./js-handlebars");
class AppDiffer {
    constructor(outputPath, ownAppJSDir, activeAddonDescendants, 
    // arguments below this point are only needed in fastboot mode. Fastboot
    // makes this pretty messy because fastboot trees all merge into the app 🤮.
    fastbootEnabled = false, ownFastbootJSDir, babelParserConfig) {
        this.outputPath = outputPath;
        this.ownAppJSDir = ownAppJSDir;
        this.ownFastbootJSDir = ownFastbootJSDir;
        this.babelParserConfig = babelParserConfig;
        this.sourceDirs = [];
        this.firstFastbootTree = Infinity;
        // maps from each filename in the app to the original directory from whence it
        // came, if it came from an addon. The mapping allows us to preserve
        // resolution semantics so that each of the app files can still resolve
        // relative to where it was authored.
        //
        // files authored within the app map to null
        this.files = new Map();
        // true for files that are fastboot-only.
        this.isFastbootOnly = new Map();
        let trees = activeAddonDescendants
            .map((addon) => {
            let dir = addon.meta['app-js'];
            if (dir) {
                let definitelyDir = path_1.join(addon.root, dir);
                this.sourceDirs.push(definitelyDir);
                return {
                    mayChange: addon.mayRebuild,
                    walk() {
                        return walk_sync_1.default.entries(definitelyDir);
                    },
                };
            }
        })
            .filter(Boolean);
        trees.push({
            mayChange: true,
            walk() {
                return walk_sync_1.default.entries(ownAppJSDir);
            },
        });
        this.sourceDirs.push(ownAppJSDir);
        if (!fastbootEnabled) {
            this.differ = new multi_tree_diff_1.default(trees, lastOneWins);
            return;
        }
        this.firstFastbootTree = trees.length;
        for (let addon of activeAddonDescendants) {
            let dir = addon.meta['fastboot-js'];
            if (dir) {
                let definitelyDir = path_1.join(addon.root, dir);
                this.sourceDirs.push(definitelyDir);
                trees.push({
                    mayChange: addon.mayRebuild,
                    walk() {
                        return walk_sync_1.default.entries(definitelyDir);
                    },
                });
            }
        }
        if (ownFastbootJSDir) {
            trees.push({
                mayChange: true,
                walk() {
                    return walk_sync_1.default.entries(ownFastbootJSDir);
                },
            });
            this.sourceDirs.push(ownFastbootJSDir);
        }
        this.differ = new multi_tree_diff_1.default(trees, fastbootMerge(this.firstFastbootTree));
    }
    update() {
        let { ops, sources } = this.differ.update();
        messages_1.debug(`app-differ operations count: %s`, ops.length);
        for (let [operation, relativePath] of ops) {
            let outputPath = path_1.join(this.outputPath, relativePath);
            switch (operation) {
                case 'unlink':
                    fs_extra_1.unlinkSync(outputPath);
                    this.files.delete(relativePath);
                    break;
                case 'rmdir':
                    fs_extra_1.rmdirSync(outputPath);
                    break;
                case 'mkdir':
                    fs_extra_1.mkdirpSync(outputPath);
                    break;
                case 'change':
                    fs_extra_1.removeSync(outputPath);
                // deliberate fallthrough
                case 'create':
                    let sourceIndices = sources.get(relativePath);
                    if (sourceIndices.length === 1) {
                        // a single file won. whether it's fastboot or non-fastboot doesn't
                        // actually change what we do here. It gets emitted in the app's
                        // namespace (if it's fastboot-only, non-fastboot code shouldn't be
                        // trying to import it anyway, because that would have already been
                        // an error pre-embroider).
                        this.isFastbootOnly.set(relativePath, sourceIndices[0] >= this.firstFastbootTree);
                        let sourceDir = this.sourceDirs[sourceIndices[0]];
                        let sourceFile = path_1.join(sourceDir, relativePath);
                        fs_extra_1.copySync(sourceFile, outputPath, { dereference: true });
                        this.updateFiles(relativePath, sourceDir, sourceFile);
                    }
                    else {
                        // we have both fastboot and non-fastboot files for this path.
                        // Because of the way fastbootMerge is written, the first one is the
                        // non-fastboot.
                        this.isFastbootOnly.set(relativePath, false);
                        let [browserDir, fastbootDir] = sourceIndices.map(i => this.sourceDirs[i]);
                        let [browserSourceFile, fastbootSourceFile] = [browserDir, fastbootDir].map(dir => path_1.join(dir, relativePath));
                        let dir = path_1.dirname(relativePath);
                        let base = path_1.basename(relativePath);
                        let browserDest = `_browser_${base}`;
                        let fastbootDest = `_fastboot_${base}`;
                        fs_extra_1.copySync(browserSourceFile, path_1.join(this.outputPath, dir, browserDest), { dereference: true });
                        fs_extra_1.copySync(fastbootSourceFile, path_1.join(this.outputPath, dir, fastbootDest), { dereference: true });
                        fs_extra_1.writeFileSync(outputPath, switcher(browserDest, fastbootDest, this.babelParserConfig, fs_extra_1.readFileSync(browserSourceFile, 'utf8')));
                        this.updateFiles(relativePath, browserDir, browserSourceFile);
                    }
                    break;
                default:
                    assert_never_1.default(operation);
            }
        }
    }
    updateFiles(relativePath, sourceDir, sourceFile) {
        switch (sourceDir) {
            case this.ownAppJSDir:
            case this.ownFastbootJSDir:
                this.files.set(relativePath, null);
                break;
            default:
                this.files.set(relativePath, sourceFile);
        }
    }
}
exports.default = AppDiffer;
function lastOneWins(treeIds) {
    return treeIds.slice(-1);
}
function fastbootMerge(firstFastbootTree) {
    return function _fastbootMerge(treeIds) {
        let mainWinner, fastbootWinner;
        for (let id of treeIds) {
            if (id < firstFastbootTree) {
                mainWinner = id;
            }
            else {
                fastbootWinner = id;
            }
        }
        if (mainWinner != null && fastbootWinner != null) {
            return [mainWinner, fastbootWinner];
        }
        else if (mainWinner != null) {
            return [mainWinner];
        }
        else if (fastbootWinner != null) {
            return [fastbootWinner];
        }
        else {
            throw new Error(`bug: should always have at least one winner in fastbootMerge`);
        }
    };
}
const switcherTemplate = js_handlebars_1.compile(`
import { macroCondition, getGlobalConfig, importSync } from '@embroider/macros';
let mod;
if (macroCondition(getGlobalConfig().fastboot?.isRunning)){
  mod = importSync("./{{js-string-escape fastbootDest}}");
} else {
  mod = importSync("./{{js-string-escape browserDest}}");
}
{{#if hasDefaultExport}}
export default mod.default;
{{/if}}
{{#each names as |name|}}
export const {{name}} = mod.{{name}};
{{/each}}
`);
function switcher(browserDest, fastbootDest, babelParserConfig, browserSource) {
    let { names, hasDefaultExport } = describe_exports_1.describeExports(browserSource, babelParserConfig);
    return switcherTemplate({ fastbootDest, browserDest, names: [...names], hasDefaultExport });
}
//# sourceMappingURL=app-differ.js.map