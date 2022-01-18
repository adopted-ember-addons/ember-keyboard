"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_memoize_1 = require("typescript-memoize");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const get_1 = __importDefault(require("lodash/get"));
const flatMap_1 = __importDefault(require("lodash/flatMap"));
class Package {
    constructor(root, packageCache, isApp) {
        this.root = root;
        this.packageCache = packageCache;
        // In stage1 and stage2, we're careful to make sure our PackageCache entry
        // for the app itself gets created with an explicit `isApp` flag. In stage3
        // we don't have that much control, but we can rely on the v2-formatted app
        // being easy to identify from its metadata.
        let mayUseDevDeps = typeof isApp === 'boolean' ? isApp : this.isV2App();
        this.dependencyKeys = mayUseDevDeps
            ? ['dependencies', 'devDependencies', 'peerDependencies']
            : ['dependencies', 'peerDependencies'];
    }
    get name() {
        return this.packageJSON.name;
    }
    get version() {
        return this.packageJSON.version;
    }
    get internalPackageJSON() {
        return JSON.parse(fs_extra_1.readFileSync(path_1.join(this.root, 'package.json'), 'utf8'));
    }
    get packageJSON() {
        let json = this.internalPackageJSON;
        if (this.nonResolvableDeps) {
            if (!json.dependencies) {
                json.dependencies = {};
            }
            for (let dep of this.nonResolvableDeps.values()) {
                json.dependencies[dep.name] = dep.version || '*';
            }
        }
        return json;
    }
    get meta() {
        let m = this.packageJSON['ember-addon'];
        if (this.isV2App()) {
            return m;
        }
        if (this.isV2Addon()) {
            return m;
        }
    }
    isEmberPackage() {
        let keywords = this.packageJSON.keywords;
        return Boolean(keywords && keywords.includes('ember-addon'));
    }
    isEngine() {
        let keywords = this.packageJSON.keywords;
        return Boolean(keywords && keywords.includes('ember-engine'));
    }
    isLazyEngine() {
        return this.isEngine() && this.packageJSON['ember-addon']['lazy-engine'];
    }
    isV2Ember() {
        return this.isEmberPackage() && get_1.default(this.packageJSON, 'ember-addon.version') === 2;
    }
    isV2App() {
        return this.isV2Ember() && this.packageJSON['ember-addon'].type === 'app';
    }
    isV2Addon() {
        return this.isV2Ember() && this.packageJSON['ember-addon'].type === 'addon';
    }
    findDescendants(filter) {
        let pkgs = new Set();
        let queue = [this];
        while (true) {
            let pkg = queue.shift();
            if (!pkg) {
                break;
            }
            if (!pkgs.has(pkg)) {
                pkgs.add(pkg);
                let nextLevel;
                if (filter) {
                    nextLevel = pkg.dependencies.filter(filter);
                }
                else {
                    nextLevel = pkg.dependencies;
                }
                nextLevel.forEach(d => queue.push(d));
            }
        }
        pkgs.delete(this);
        return [...pkgs.values()];
    }
    get mayRebuild() {
        // if broccoli memoization is enabled, allowing addons to rebuild
        // automatically is cheap, so we allow all addons to rebuild.
        if (process.env['BROCCOLI_ENABLED_MEMOIZE'] === 'true') {
            return true;
        }
        // Otherwise, we only allow addons to rebuild that you've explicitly asked for
        // via env var.
        if (process.env.EMBROIDER_REBUILD_ADDONS) {
            if (process.env.EMBROIDER_REBUILD_ADDONS.split(',').includes(this.name)) {
                return true;
            }
        }
        return false;
    }
    get nonResolvableDeps() {
        let meta = this.internalPackageJSON['ember-addon'];
        if (meta && meta.paths) {
            return new Map(meta.paths
                .map((path) => {
                // ember-cli gives a warning if the path specifies an invalid, malformed or missing addon. the logic for invalidating an addon is:
                // https://github.com/ember-cli/ember-cli/blob/627934f91b2aa0e19b041fdb1b547873c1855793/lib/models/package-info-cache/index.js#L427
                //
                // Note that we only need to be this lenient with in-repo addons,
                // which is why this logic is here in nonResolvableDeps. If you try
                // to ship broken stuff in regular dependencies, NPM is going to
                // stop you.
                let pkg;
                try {
                    pkg = this.packageCache.get(path_1.join(this.packageCache.basedir(this), path));
                }
                catch (err) {
                    // package was missing or had invalid package.json
                    return false;
                }
                let main = (pkg.packageJSON['ember-addon'] && pkg.packageJSON['ember-addon'].main) || pkg.packageJSON['main'];
                if (!main || main === '.' || main === './') {
                    main = 'index.js';
                }
                else if (!path_1.extname(main)) {
                    main = `${main}.js`;
                }
                let mainPath = path_1.join(this.packageCache.basedir(this), path, main);
                if (!fs_extra_1.existsSync(mainPath)) {
                    // package has no valid main
                    return false;
                }
                return [pkg.name, pkg];
            })
                .filter(Boolean));
        }
    }
    get dependencies() {
        let names = flatMap_1.default(this.dependencyKeys, key => Object.keys(this.packageJSON[key] || {}));
        return names
            .map(name => {
            if (this.nonResolvableDeps) {
                let dep = this.nonResolvableDeps.get(name);
                if (dep) {
                    return dep;
                }
            }
            try {
                return this.packageCache.resolve(name, this);
            }
            catch (error) {
                // if the package was not found do not error out here. this is relevant
                // for the case where a package might be an optional peerDependency and we dont
                // want to error if it was not found. Additionally, erroring here is "far" away
                // from the actual logical failure point and so not failing here will provide a better
                // error message down the line
                if (error.code === 'MODULE_NOT_FOUND') {
                    return false;
                }
                throw error;
            }
        })
            .filter(Boolean);
    }
    hasDependency(name) {
        for (let section of this.dependencyKeys) {
            if (this.packageJSON[section]) {
                if (this.packageJSON[section][name]) {
                    return true;
                }
            }
        }
        return false;
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], Package.prototype, "internalPackageJSON", null);
__decorate([
    typescript_memoize_1.Memoize()
], Package.prototype, "packageJSON", null);
__decorate([
    typescript_memoize_1.Memoize()
], Package.prototype, "nonResolvableDeps", null);
__decorate([
    typescript_memoize_1.Memoize()
], Package.prototype, "dependencies", null);
exports.default = Package;
//# sourceMappingURL=package.js.map