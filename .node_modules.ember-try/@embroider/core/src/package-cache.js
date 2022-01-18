"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_1 = __importDefault(require("./package"));
const fs_1 = require("fs");
const get_or_create_1 = require("./get-or-create");
const resolve_package_path_1 = __importDefault(require("resolve-package-path"));
const path_1 = require("path");
const pkg_up_1 = require("pkg-up");
class PackageCache {
    constructor() {
        this.rootCache = new Map();
        this.resolutionCache = new Map();
    }
    resolve(packageName, fromPackage) {
        let cache = get_or_create_1.getOrCreate(this.resolutionCache, fromPackage, () => new Map());
        let result = get_or_create_1.getOrCreate(cache, packageName, () => {
            // the type cast is needed because resolvePackagePath itself is erroneously typed as `any`.
            let packagePath = resolve_package_path_1.default(packageName, this.basedir(fromPackage));
            if (!packagePath) {
                // this gets our null into the cache so we don't keep trying to resolve
                // a thing that is not found
                return null;
            }
            return this.get(path_1.dirname(packagePath));
        });
        if (!result) {
            let e = new Error(`unable to resolve package ${packageName} from ${fromPackage.root}`);
            e.code = 'MODULE_NOT_FOUND';
            throw e;
        }
        return result;
    }
    getApp(packageRoot) {
        let root = fs_1.realpathSync(packageRoot);
        let p = get_or_create_1.getOrCreate(this.rootCache, root, () => {
            return new package_1.default(root, this, true);
        });
        return p;
    }
    seed(pkg) {
        if (this.rootCache.has(pkg.root)) {
            throw new Error(`bug: tried to seed package ${pkg.name} but it's already in packageCache`);
        }
        this.rootCache.set(pkg.root, pkg);
    }
    basedir(pkg) {
        return pkg.root;
    }
    get(packageRoot) {
        let root = fs_1.realpathSync(packageRoot);
        let p = get_or_create_1.getOrCreate(this.rootCache, root, () => {
            return new package_1.default(root, this);
        });
        return p;
    }
    ownerOfFile(filename) {
        let segments = filename.split(path_1.sep);
        // first we look through our cached packages for any that are rooted right
        // at or above the file.
        for (let length = segments.length - 1; length >= 0; length--) {
            if (segments[length - 1] === 'node_modules') {
                // once we hit a node_modules, we're leaving the package we were in, so
                // any higher caches don't apply to us
                break;
            }
            let candidate = segments.slice(0, length).join(path_1.sep);
            if (this.rootCache.has(candidate)) {
                return this.rootCache.get(candidate);
            }
        }
        let packageJSONPath = pkg_up_1.sync(filename);
        if (packageJSONPath) {
            return this.get(path_1.dirname(packageJSONPath));
        }
    }
    // register to be shared as the per-process package cache with the given name
    shareAs(identifier) {
        shared.set(identifier, this);
    }
    static shared(identifier) {
        return get_or_create_1.getOrCreate(shared, identifier, () => new PackageCache());
    }
}
exports.default = PackageCache;
const shared = new Map();
//# sourceMappingURL=package-cache.js.map