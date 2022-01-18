"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppBuilder = exports.excludeDotFiles = void 0;
const js_handlebars_1 = require("./js-handlebars");
const resolve_1 = __importDefault(require("resolve"));
const typescript_memoize_1 = require("typescript-memoize");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const messages_1 = require("./messages");
const sortBy_1 = __importDefault(require("lodash/sortBy"));
const flatten_1 = __importDefault(require("lodash/flatten"));
const app_differ_1 = __importDefault(require("./app-differ"));
const ember_html_1 = require("./ember-html");
const assert_never_1 = __importDefault(require("assert-never"));
const fast_sourcemap_concat_1 = __importDefault(require("fast-sourcemap-concat"));
const node_1 = require("@embroider/macros/src/node");
const portable_babel_config_1 = require("./portable-babel-config");
const template_compiler_1 = require("./template-compiler");
const paths_1 = require("./paths");
const engine_mangler_1 = require("./engine-mangler");
const app_files_1 = require("./app-files");
const partition_1 = __importDefault(require("lodash/partition"));
const mergeWith_1 = __importDefault(require("lodash/mergeWith"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
function excludeDotFiles(files) {
    return files.filter(file => !file.startsWith('.') && !file.includes('/.'));
}
exports.excludeDotFiles = excludeDotFiles;
class ParsedEmberAsset {
    constructor(asset) {
        this.kind = 'parsed-ember';
        this.fileAsset = asset;
        this.html = new ember_html_1.PreparedEmberHTML(asset);
        this.relativePath = asset.relativePath;
    }
    validFor(other) {
        return this.fileAsset.mtime === other.mtime && this.fileAsset.size === other.size;
    }
}
class BuiltEmberAsset {
    constructor(asset) {
        this.kind = 'built-ember';
        this.parsedAsset = asset;
        this.source = asset.html.dom.serialize();
        this.relativePath = asset.relativePath;
    }
}
class ConcatenatedAsset {
    constructor(relativePath, sources, resolvableExtensions) {
        this.relativePath = relativePath;
        this.sources = sources;
        this.resolvableExtensions = resolvableExtensions;
        this.kind = 'concatenated-asset';
    }
    get sourcemapPath() {
        return this.relativePath.replace(this.resolvableExtensions, '') + '.map';
    }
}
class AppBuilder {
    constructor(root, app, adapter, options, macrosConfig) {
        this.root = root;
        this.app = app;
        this.adapter = adapter;
        this.options = options;
        this.macrosConfig = macrosConfig;
        // for each relativePath, an Asset we have already emitted
        this.assets = new Map();
        // this uses globalConfig because it's a way for packages to ask "is
        // Embroider doing this build?". So it's necessarily global, not scoped to
        // any subgraph of dependencies.
        macrosConfig.setGlobalConfig(__filename, `@embroider/core`, {
            // this is hard-coded to true because it literally means "embroider is
            // building this Ember app". You can see non-true when using the Embroider
            // macros in a classic build.
            active: true,
        });
    }
    scriptPriority(pkg) {
        switch (pkg.name) {
            case 'loader.js':
                return 0;
            case 'ember-source':
                return 10;
            default:
                return 1000;
        }
    }
    get resolvableExtensionsPattern() {
        return paths_1.extensionsPattern(this.adapter.adjustImportsOptions().resolvableExtensions);
    }
    impliedAssets(type, engine, emberENV) {
        let result = this.impliedAddonAssets(type, engine).map((sourcePath) => {
            let stats = fs_extra_1.statSync(sourcePath);
            return {
                kind: 'on-disk',
                relativePath: paths_1.explicitRelative(this.root, sourcePath),
                sourcePath,
                mtime: stats.mtimeMs,
                size: stats.size,
            };
        });
        if (type === 'implicit-scripts') {
            result.unshift({
                kind: 'in-memory',
                relativePath: '_testing_prefix_.js',
                source: `var runningTests=false;`,
            });
            result.unshift({
                kind: 'in-memory',
                relativePath: '_ember_env_.js',
                source: `window.EmberENV=${JSON.stringify(emberENV, null, 2)};`,
            });
            result.push({
                kind: 'in-memory',
                relativePath: '_loader_.js',
                source: `loader.makeDefaultExport=false;`,
            });
        }
        if (type === 'implicit-test-scripts') {
            // this is the traditional test-support-suffix.js
            result.push({
                kind: 'in-memory',
                relativePath: '_testing_suffix_.js',
                source: `
        var runningTests=true;
        if (typeof Testem !== 'undefined' && (typeof QUnit !== 'undefined' || typeof Mocha !== 'undefined')) {
          Testem.hookIntoTestFramework();
        }`,
            });
            // whether or not anybody was actually using @embroider/macros
            // explicitly as an addon, we ensure its test-support file is always
            // present.
            if (!result.find(s => s.kind === 'on-disk' && s.sourcePath.endsWith('embroider-macros-test-support.js'))) {
                result.unshift({
                    kind: 'on-disk',
                    sourcePath: require.resolve('@embroider/macros/src/vendor/embroider-macros-test-support'),
                    mtime: 0,
                    size: 0,
                    relativePath: 'embroider-macros-test-support.js',
                });
            }
        }
        return result;
    }
    impliedAddonAssets(type, engine) {
        let result = [];
        for (let addon of sortBy_1.default(Array.from(engine.addons), this.scriptPriority.bind(this))) {
            let implicitScripts = addon.meta[type];
            if (implicitScripts) {
                let styles = [];
                let options = { basedir: addon.root };
                for (let mod of implicitScripts) {
                    if (type === 'implicit-styles') {
                        // exclude engines because they will handle their own css importation
                        if (!addon.isLazyEngine()) {
                            styles.push(resolve_1.default.sync(mod, options));
                        }
                    }
                    else {
                        result.push(resolve_1.default.sync(mod, options));
                    }
                }
                if (styles.length) {
                    result = [...styles, ...result];
                }
            }
        }
        return result;
    }
    // unlike our full config, this one just needs to know how to parse all the
    // syntax our app can contain.
    babelParserConfig() {
        let babel = cloneDeep_1.default(this.adapter.babelConfig());
        if (!babel.plugins) {
            babel.plugins = [];
        }
        // Our stage3 code is always allowed to use dynamic import. We may emit it
        // ourself when splitting routes.
        babel.plugins.push(require.resolve(this.adapter.babelMajorVersion() === 6
            ? 'babel-plugin-syntax-dynamic-import'
            : '@babel/plugin-syntax-dynamic-import'));
        return babel;
    }
    babelConfig(templateCompilerParams, appFiles) {
        let babel = this.adapter.babelConfig();
        if (!babel.plugins) {
            babel.plugins = [];
        }
        // Our stage3 code is always allowed to use dynamic import. We may emit it
        // ourself when splitting routes.
        babel.plugins.push(require.resolve(this.adapter.babelMajorVersion() === 6
            ? 'babel-plugin-syntax-dynamic-import'
            : '@babel/plugin-syntax-dynamic-import'));
        // this is our built-in support for the inline hbs macro
        babel.plugins.push([
            path_1.join(__dirname, 'babel-plugin-inline-hbs.js'),
            {
                templateCompiler: templateCompilerParams,
                stage: 3,
            },
        ]);
        babel.plugins.push(this.adjustImportsPlugin(appFiles));
        // this is @embroider/macros configured for full stage3 resolution
        babel.plugins.push(this.macrosConfig.babelPluginConfig());
        babel.plugins.push([require.resolve('./template-colocation-plugin')]);
        // we can use globally shared babel runtime by default
        babel.plugins.push([
            require.resolve('@babel/plugin-transform-runtime'),
            { absoluteRuntime: __dirname, useESModules: true, regenerator: false },
        ]);
        return portable_babel_config_1.makePortable(babel, { basedir: this.root }, this.portableHints);
    }
    adjustImportsPlugin(engines) {
        let relocatedFiles = {};
        for (let { destPath, appFiles } of engines) {
            for (let [relativePath, originalPath] of appFiles.relocatedFiles) {
                relocatedFiles[path_1.join(destPath, relativePath).split(path_1.sep).join('/')] = originalPath;
            }
        }
        return [
            require.resolve('./babel-plugin-adjust-imports'),
            Object.assign({}, this.adapter.adjustImportsOptions(), { relocatedFiles }),
        ];
    }
    insertEmberApp(asset, appFiles, prepared, emberENV) {
        let html = asset.html;
        if (this.fastbootConfig) {
            // ignore scripts like ember-cli-livereload.js which are not really associated with
            // "the app".
            let ignoreScripts = html.dom.window.document.querySelectorAll('script');
            ignoreScripts.forEach(script => {
                script.setAttribute('data-fastboot-ignore', '');
            });
        }
        // our tests entrypoint already includes a correct module dependency on the
        // app, so we only insert the app when we're not inserting tests
        if (!asset.fileAsset.includeTests) {
            let appJS = this.topAppJSAsset(appFiles, prepared);
            html.insertScriptTag(html.javascript, appJS.relativePath, { type: 'module' });
        }
        if (this.fastbootConfig) {
            // any extra fastboot app files get inserted into our html.javascript
            // section, after the app has been inserted.
            for (let script of this.fastbootConfig.extraAppFiles) {
                html.insertScriptTag(html.javascript, script, { tag: 'fastboot-script' });
            }
        }
        html.insertStyleLink(html.styles, `assets/${this.app.name}.css`);
        const parentEngine = appFiles.find(e => !e.parent);
        let vendorJS = this.implicitScriptsAsset(prepared, parentEngine, emberENV);
        if (vendorJS) {
            html.insertScriptTag(html.implicitScripts, vendorJS.relativePath);
        }
        if (this.fastbootConfig) {
            // any extra fastboot vendor files get inserted into our
            // html.implicitScripts section, after the regular implicit script
            // (vendor.js) have been inserted.
            for (let script of this.fastbootConfig.extraVendorFiles) {
                html.insertScriptTag(html.implicitScripts, script, { tag: 'fastboot-script' });
            }
        }
        let implicitStyles = this.implicitStylesAsset(prepared, parentEngine);
        if (implicitStyles) {
            html.insertStyleLink(html.implicitStyles, implicitStyles.relativePath);
        }
        if (!asset.fileAsset.includeTests) {
            return;
        }
        // Test-related assets happen below this point
        let testJS = this.testJSEntrypoint(appFiles, prepared);
        html.insertScriptTag(html.testJavascript, testJS.relativePath, { type: 'module' });
        let implicitTestScriptsAsset = this.implicitTestScriptsAsset(prepared, parentEngine);
        if (implicitTestScriptsAsset) {
            html.insertScriptTag(html.implicitTestScripts, implicitTestScriptsAsset.relativePath);
        }
        let implicitTestStylesAsset = this.implicitTestStylesAsset(prepared, parentEngine);
        if (implicitTestStylesAsset) {
            html.insertStyleLink(html.implicitTestStyles, implicitTestStylesAsset.relativePath);
        }
    }
    implicitScriptsAsset(prepared, application, emberENV) {
        let asset = prepared.get('assets/vendor.js');
        if (!asset) {
            let implicitScripts = this.impliedAssets('implicit-scripts', application, emberENV);
            if (implicitScripts.length > 0) {
                asset = new ConcatenatedAsset('assets/vendor.js', implicitScripts, this.resolvableExtensionsPattern);
                prepared.set(asset.relativePath, asset);
            }
        }
        return asset;
    }
    implicitStylesAsset(prepared, application) {
        let asset = prepared.get('assets/vendor.css');
        if (!asset) {
            let implicitStyles = this.impliedAssets('implicit-styles', application);
            if (implicitStyles.length > 0) {
                // we reverse because we want the synthetic vendor style at the top
                asset = new ConcatenatedAsset('assets/vendor.css', implicitStyles.reverse(), this.resolvableExtensionsPattern);
                prepared.set(asset.relativePath, asset);
            }
        }
        return asset;
    }
    implicitTestScriptsAsset(prepared, application) {
        let testSupportJS = prepared.get('assets/test-support.js');
        if (!testSupportJS) {
            let implicitTestScripts = this.impliedAssets('implicit-test-scripts', application);
            if (implicitTestScripts.length > 0) {
                testSupportJS = new ConcatenatedAsset('assets/test-support.js', implicitTestScripts, this.resolvableExtensionsPattern);
                prepared.set(testSupportJS.relativePath, testSupportJS);
            }
        }
        return testSupportJS;
    }
    implicitTestStylesAsset(prepared, application) {
        let asset = prepared.get('assets/test-support.css');
        if (!asset) {
            let implicitTestStyles = this.impliedAssets('implicit-test-styles', application);
            if (implicitTestStyles.length > 0) {
                asset = new ConcatenatedAsset('assets/test-support.css', implicitTestStyles, this.resolvableExtensionsPattern);
                prepared.set(asset.relativePath, asset);
            }
        }
        return asset;
    }
    // recurse to find all active addons that don't cross an engine boundary.
    // Inner engines themselves will be returned, but not those engines' children.
    // The output set's insertion order is the proper ember-cli compatible
    // ordering of the addons.
    findActiveAddons(pkg, engine) {
        for (let child of this.adapter.activeAddonChildren(pkg)) {
            if (!child.isEngine()) {
                this.findActiveAddons(child, engine);
            }
            engine.addons.add(child);
        }
    }
    partitionEngines(appJSPath) {
        let queue = [
            {
                package: this.app,
                addons: new Set(),
                parent: undefined,
                sourcePath: appJSPath,
                destPath: this.root,
                modulePrefix: this.modulePrefix,
                appRelativePath: '.',
            },
        ];
        let done = [];
        let seenEngines = new Set();
        while (true) {
            let current = queue.shift();
            if (!current) {
                break;
            }
            this.findActiveAddons(current.package, current);
            for (let addon of current.addons) {
                if (addon.isEngine() && !seenEngines.has(addon)) {
                    seenEngines.add(addon);
                    queue.push({
                        package: addon,
                        addons: new Set(),
                        parent: current,
                        sourcePath: engine_mangler_1.mangledEngineRoot(addon),
                        destPath: addon.root,
                        modulePrefix: addon.name,
                        appRelativePath: paths_1.explicitRelative(this.root, addon.root),
                    });
                }
            }
            done.push(current);
        }
        return done;
    }
    get activeFastboot() {
        return this.adapter.activeAddonChildren(this.app).find(a => a.name === 'ember-cli-fastboot');
    }
    get fastbootConfig() {
        if (this.activeFastboot) {
            // this is relying on work done in stage1 by @embroider/compat/src/compat-adapters/ember-cli-fastboot.ts
            let packageJSON = fs_extra_1.readJSONSync(path_1.join(this.activeFastboot.root, '_fastboot_', 'package.json'));
            let { extraAppFiles, extraVendorFiles } = packageJSON['embroider-fastboot'];
            delete packageJSON['embroider-fastboot'];
            extraVendorFiles.push('assets/embroider_macros_fastboot_init.js');
            return { packageJSON, extraAppFiles, extraVendorFiles };
        }
    }
    updateAppJS(inputPaths) {
        let appJSPath = this.adapter.appJSSrcDir(inputPaths);
        if (!this.appDiffers) {
            let engines = this.partitionEngines(appJSPath);
            this.appDiffers = engines.map(engine => {
                let differ;
                if (this.activeFastboot) {
                    differ = new app_differ_1.default(engine.destPath, engine.sourcePath, [...engine.addons], true, this.adapter.fastbootJSSrcDir(inputPaths), this.babelParserConfig());
                }
                else {
                    differ = new app_differ_1.default(engine.destPath, engine.sourcePath, [...engine.addons]);
                }
                return {
                    differ,
                    engine,
                };
            });
        }
        // this is in reverse order because we need deeper engines to update before
        // their parents, because they aren't really valid packages until they
        // update, and their parents will go looking for their own `app-js` content.
        this.appDiffers
            .slice()
            .reverse()
            .forEach(a => a.differ.update());
        return this.appDiffers.map(a => {
            return Object.assign({}, a.engine, {
                appFiles: new app_files_1.AppFiles(a.differ, this.resolvableExtensionsPattern, this.adapter.podModulePrefix()),
            });
        });
    }
    prepareAsset(asset, appFiles, prepared, emberENV) {
        if (asset.kind === 'ember') {
            let prior = this.assets.get(asset.relativePath);
            let parsed;
            if (prior && prior.kind === 'built-ember' && prior.parsedAsset.validFor(asset)) {
                // we can reuse the parsed html
                parsed = prior.parsedAsset;
                parsed.html.clear();
            }
            else {
                parsed = new ParsedEmberAsset(asset);
            }
            this.insertEmberApp(parsed, appFiles, prepared, emberENV);
            prepared.set(asset.relativePath, new BuiltEmberAsset(parsed));
        }
        else {
            prepared.set(asset.relativePath, asset);
        }
    }
    prepareAssets(requestedAssets, appFiles, emberENV) {
        let prepared = new Map();
        for (let asset of requestedAssets) {
            this.prepareAsset(asset, appFiles, prepared, emberENV);
        }
        return prepared;
    }
    assetIsValid(asset, prior) {
        if (!prior) {
            return false;
        }
        switch (asset.kind) {
            case 'on-disk':
                return prior.kind === 'on-disk' && prior.size === asset.size && prior.mtime === asset.mtime;
            case 'in-memory':
                return prior.kind === 'in-memory' && stringOrBufferEqual(prior.source, asset.source);
            case 'built-ember':
                return prior.kind === 'built-ember' && prior.source === asset.source;
            case 'concatenated-asset':
                return (prior.kind === 'concatenated-asset' &&
                    prior.sources.length === asset.sources.length &&
                    prior.sources.every((priorFile, index) => {
                        let newFile = asset.sources[index];
                        return this.assetIsValid(newFile, priorFile);
                    }));
        }
    }
    updateOnDiskAsset(asset) {
        let destination = path_1.join(this.root, asset.relativePath);
        fs_extra_1.ensureDirSync(path_1.dirname(destination));
        fs_extra_1.copySync(asset.sourcePath, destination, { dereference: true });
    }
    updateInMemoryAsset(asset) {
        let destination = path_1.join(this.root, asset.relativePath);
        fs_extra_1.ensureDirSync(path_1.dirname(destination));
        fs_extra_1.writeFileSync(destination, asset.source, 'utf8');
    }
    updateBuiltEmberAsset(asset) {
        let destination = path_1.join(this.root, asset.relativePath);
        fs_extra_1.ensureDirSync(path_1.dirname(destination));
        fs_extra_1.writeFileSync(destination, asset.source, 'utf8');
    }
    async updateConcatenatedAsset(asset) {
        let concat = new fast_sourcemap_concat_1.default({
            outputFile: path_1.join(this.root, asset.relativePath),
            mapCommentType: asset.relativePath.endsWith('.js') ? 'line' : 'block',
            baseDir: this.root,
        });
        if (process.env.EMBROIDER_CONCAT_STATS) {
            let MeasureConcat = (await Promise.resolve().then(() => __importStar(require('./measure-concat')))).default;
            concat = new MeasureConcat(asset.relativePath, concat, this.root);
        }
        for (let source of asset.sources) {
            switch (source.kind) {
                case 'on-disk':
                    concat.addFile(paths_1.explicitRelative(this.root, source.sourcePath));
                    break;
                case 'in-memory':
                    if (typeof source.source !== 'string') {
                        throw new Error(`attempted to concatenated a Buffer-backed in-memory asset`);
                    }
                    concat.addSpace(source.source);
                    break;
                default:
                    assert_never_1.default(source);
            }
        }
        await concat.end();
    }
    async updateAssets(requestedAssets, appFiles, emberENV) {
        let assets = this.prepareAssets(requestedAssets, appFiles, emberENV);
        for (let asset of assets.values()) {
            if (this.assetIsValid(asset, this.assets.get(asset.relativePath))) {
                continue;
            }
            messages_1.debug('rebuilding %s', asset.relativePath);
            switch (asset.kind) {
                case 'on-disk':
                    this.updateOnDiskAsset(asset);
                    break;
                case 'in-memory':
                    this.updateInMemoryAsset(asset);
                    break;
                case 'built-ember':
                    this.updateBuiltEmberAsset(asset);
                    break;
                case 'concatenated-asset':
                    await this.updateConcatenatedAsset(asset);
                    break;
                default:
                    assert_never_1.default(asset);
            }
        }
        for (let oldAsset of this.assets.values()) {
            if (!assets.has(oldAsset.relativePath)) {
                fs_extra_1.unlinkSync(path_1.join(this.root, oldAsset.relativePath));
            }
        }
        this.assets = assets;
        return [...assets.values()];
    }
    gatherAssets(inputPaths) {
        // first gather all the assets out of addons
        let assets = [];
        for (let pkg of this.adapter.allActiveAddons) {
            if (pkg.meta['public-assets']) {
                for (let [filename, appRelativeURL] of Object.entries(pkg.meta['public-assets'] || {})) {
                    let sourcePath = path_1.resolve(pkg.root, filename);
                    let stats = fs_extra_1.statSync(sourcePath);
                    assets.push({
                        kind: 'on-disk',
                        sourcePath,
                        relativePath: appRelativeURL,
                        mtime: stats.mtimeMs,
                        size: stats.size,
                    });
                }
            }
        }
        if (this.activeFastboot) {
            const source = `
      (function(){
        var key = '_embroider_macros_runtime_config';
        if (!window[key]){ window[key] = [];}
        window[key].push(function(m) {
          m.setGlobalConfig('fastboot', Object.assign({}, m.getGlobalConfig().fastboot, { isRunning: true }));
        });
      }())`;
            assets.push({
                kind: 'in-memory',
                source,
                relativePath: 'assets/embroider_macros_fastboot_init.js',
            });
        }
        // and finally tack on the ones from our app itself
        return assets.concat(this.adapter.assets(inputPaths));
    }
    async build(inputPaths) {
        if (this.adapter.env !== 'production') {
            this.macrosConfig.enableAppDevelopment(this.root);
            this.macrosConfig.enableRuntimeMode();
        }
        for (let pkgRoot of this.adapter.developingAddons()) {
            this.macrosConfig.enablePackageDevelopment(pkgRoot);
        }
        // on the first build, we lock down the macros config. on subsequent builds,
        // this doesn't do anything anyway because it's idempotent.
        this.macrosConfig.finalize();
        let appFiles = this.updateAppJS(inputPaths);
        let emberENV = this.adapter.emberENV();
        let assets = this.gatherAssets(inputPaths);
        let finalAssets = await this.updateAssets(assets, appFiles, emberENV);
        let templateCompiler = this.templateCompiler(emberENV);
        let babelConfig = this.babelConfig(templateCompiler, appFiles);
        let templateCompilerIsParallelSafe = this.addTemplateCompiler(templateCompiler);
        this.addBabelConfig(babelConfig);
        let assetPaths = assets.map(asset => asset.relativePath);
        if (this.activeFastboot) {
            // when using fastboot, our own package.json needs to be in the output so fastboot can read it.
            assetPaths.push('package.json');
        }
        for (let asset of finalAssets) {
            // our concatenated assets all have map files that ride along. Here we're
            // telling the final stage packager to be sure and serve the map files
            // too.
            if (asset.kind === 'concatenated-asset') {
                assetPaths.push(asset.sourcemapPath);
            }
        }
        let meta = {
            type: 'app',
            version: 2,
            assets: assetPaths,
            'template-compiler': {
                filename: '_template_compiler_.js',
                isParallelSafe: templateCompilerIsParallelSafe,
            },
            babel: {
                filename: '_babel_config_.js',
                isParallelSafe: babelConfig.isParallelSafe,
                majorVersion: this.adapter.babelMajorVersion(),
                fileFilter: '_babel_filter_.js',
            },
            'resolvable-extensions': this.adapter.adjustImportsOptions().resolvableExtensions,
            'root-url': this.adapter.rootURL(),
        };
        if (!this.adapter.strictV2Format()) {
            meta['auto-upgraded'] = true;
        }
        let pkg = this.combinePackageJSON(meta);
        fs_extra_1.writeFileSync(path_1.join(this.root, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
    }
    combinePackageJSON(meta) {
        let pkgLayers = [this.app.packageJSON, { keywords: ['ember-addon'], 'ember-addon': meta }];
        let fastbootConfig = this.fastbootConfig;
        if (fastbootConfig) {
            pkgLayers.push(fastbootConfig.packageJSON);
        }
        return combinePackageJSON(...pkgLayers);
    }
    templateCompiler(config) {
        let plugins = this.adapter.htmlbarsPlugins();
        if (!plugins.ast) {
            plugins.ast = [];
        }
        let { plugins: macroPlugins, setConfig } = node_1.MacrosConfig.astPlugins();
        setConfig(this.macrosConfig);
        for (let macroPlugin of macroPlugins) {
            plugins.ast.push(macroPlugin);
        }
        return {
            plugins,
            compilerPath: resolve_1.default.sync(this.adapter.templateCompilerPath(), { basedir: this.root }),
            resolver: this.adapter.templateResolver(),
            EmberENV: config,
        };
    }
    get portableHints() {
        return this.options.pluginHints.map(hint => {
            let cursor = path_1.join(this.app.root, 'package.json');
            for (let i = 0; i < hint.resolve.length; i++) {
                let target = hint.resolve[i];
                if (i < hint.resolve.length - 1) {
                    target = path_1.join(target, 'package.json');
                }
                cursor = resolve_1.default.sync(target, { basedir: path_1.dirname(cursor) });
            }
            return { requireFile: cursor, useMethod: hint.useMethod };
        });
    }
    addTemplateCompiler(params) {
        let mod = template_compiler_1.templateCompilerModule(params, this.portableHints);
        fs_extra_1.writeFileSync(path_1.join(this.root, '_template_compiler_.js'), mod.src, 'utf8');
        return mod.isParallelSafe;
    }
    addBabelConfig(pconfig) {
        if (!pconfig.isParallelSafe) {
            messages_1.warn('Your build is slower because some babel plugins are non-serializable');
        }
        fs_extra_1.writeFileSync(path_1.join(this.root, '_babel_config_.js'), `module.exports = ${JSON.stringify(pconfig.config, null, 2)}`, 'utf8');
        fs_extra_1.writeFileSync(path_1.join(this.root, '_babel_filter_.js'), babelFilterTemplate({ skipBabel: this.options.skipBabel }), 'utf8');
    }
    shouldSplitRoute(routeName) {
        return (!this.options.splitAtRoutes ||
            this.options.splitAtRoutes.find(pattern => {
                if (typeof pattern === 'string') {
                    return pattern === routeName;
                }
                else {
                    return pattern.test(routeName);
                }
            }));
    }
    splitRoute(routeName, files, addToParent, addLazyBundle) {
        let shouldSplit = routeName && this.shouldSplitRoute(routeName);
        let ownFiles = [];
        let ownNames = new Set();
        if (files.template) {
            if (shouldSplit) {
                ownFiles.push(files.template);
                ownNames.add(routeName);
            }
            else {
                addToParent(routeName, files.template);
            }
        }
        if (files.controller) {
            if (shouldSplit) {
                ownFiles.push(files.controller);
                ownNames.add(routeName);
            }
            else {
                addToParent(routeName, files.controller);
            }
        }
        if (files.route) {
            if (shouldSplit) {
                ownFiles.push(files.route);
                ownNames.add(routeName);
            }
            else {
                addToParent(routeName, files.route);
            }
        }
        for (let [childName, childFiles] of files.children) {
            this.splitRoute(`${routeName}.${childName}`, childFiles, (childRouteName, childFile) => {
                // this is our child calling "addToParent"
                if (shouldSplit) {
                    ownFiles.push(childFile);
                    ownNames.add(childRouteName);
                }
                else {
                    addToParent(childRouteName, childFile);
                }
            }, (routeNames, files) => {
                addLazyBundle(routeNames, files);
            });
        }
        if (ownFiles.length > 0) {
            addLazyBundle([...ownNames], ownFiles);
        }
    }
    topAppJSAsset(engines, prepared) {
        let [app, ...childEngines] = engines;
        let relativePath = `assets/${this.app.name}.js`;
        return this.appJSAsset(relativePath, app, childEngines, prepared, {
            autoRun: this.adapter.autoRun(),
            appBoot: !this.adapter.autoRun() ? this.adapter.appBoot() : '',
            mainModule: paths_1.explicitRelative(path_1.dirname(relativePath), this.adapter.mainModule()),
            appConfig: this.adapter.mainModuleConfig(),
        });
    }
    get staticAppPathsPattern() {
        if (this.options.staticAppPaths.length > 0) {
            return new RegExp('^(?:' +
                this.options.staticAppPaths.map(staticAppPath => escape_string_regexp_1.default(staticAppPath.replace(/\//g, path_1.sep))).join('|') +
                ')(?:$|' +
                path_1.sep +
                ')');
        }
    }
    requiredOtherFiles(appFiles) {
        let pattern = this.staticAppPathsPattern;
        if (pattern) {
            return appFiles.otherAppFiles.filter(f => {
                return !pattern.test(f);
            });
        }
        else {
            return appFiles.otherAppFiles;
        }
    }
    appJSAsset(relativePath, engine, childEngines, prepared, entryParams) {
        let { appFiles } = engine;
        let cached = prepared.get(relativePath);
        if (cached) {
            return cached;
        }
        let eagerModules = [];
        let requiredAppFiles = [this.requiredOtherFiles(appFiles)];
        if (!this.options.staticComponents) {
            requiredAppFiles.push(appFiles.components);
        }
        if (!this.options.staticHelpers) {
            requiredAppFiles.push(appFiles.helpers);
        }
        let styles = [];
        // only import styles from engines with a parent (this excludeds the parent application) as their styles
        // will be inserted via a direct <link> tag.
        if (engine.parent && engine.package.isLazyEngine()) {
            let implicitStyles = this.impliedAssets('implicit-styles', engine);
            for (let style of implicitStyles) {
                styles.push({
                    path: paths_1.explicitRelative('assets/_engine_', style.relativePath),
                });
            }
            styles.push({
                path: paths_1.explicitRelative(relativePath, engine.package.name + '/' + engine.package.name + '.css'),
            });
        }
        let lazyEngines = [];
        for (let childEngine of childEngines) {
            let asset = this.appJSAsset(`assets/_engine_/${encodeURIComponent(childEngine.package.name)}.js`, childEngine, [], prepared);
            if (childEngine.package.isLazyEngine()) {
                lazyEngines.push({
                    names: [childEngine.package.name],
                    path: paths_1.explicitRelative(path_1.dirname(relativePath), asset.relativePath),
                });
            }
            else {
                eagerModules.push(paths_1.explicitRelative(path_1.dirname(relativePath), asset.relativePath));
            }
        }
        let lazyRoutes = [];
        for (let [routeName, routeFiles] of appFiles.routeFiles.children) {
            this.splitRoute(routeName, routeFiles, (_, filename) => {
                requiredAppFiles.push([filename]);
            }, (routeNames, files) => {
                let routeEntrypoint = `assets/_route_/${encodeURIComponent(routeNames[0])}.js`;
                if (!prepared.has(routeEntrypoint)) {
                    prepared.set(routeEntrypoint, this.routeEntrypoint(engine, routeEntrypoint, files));
                }
                lazyRoutes.push({
                    names: routeNames,
                    path: this.importPaths(engine, routeEntrypoint, relativePath).buildtime,
                });
            });
        }
        let [fastboot, nonFastboot] = partition_1.default(excludeDotFiles(flatten_1.default(requiredAppFiles)), file => appFiles.isFastbootOnly.get(file));
        let amdModules = nonFastboot.map(file => this.importPaths(engine, file, relativePath));
        let fastbootOnlyAmdModules = fastboot.map(file => this.importPaths(engine, file, relativePath));
        // this is a backward-compatibility feature: addons can force inclusion of
        // modules.
        this.gatherImplicitModules('implicit-modules', relativePath, engine, amdModules);
        let params = { amdModules, fastbootOnlyAmdModules, lazyRoutes, lazyEngines, eagerModules, styles };
        if (entryParams) {
            Object.assign(params, entryParams);
        }
        let source = entryTemplate(params);
        let asset = {
            kind: 'in-memory',
            source,
            relativePath,
        };
        prepared.set(relativePath, asset);
        return asset;
    }
    get modulePrefix() {
        return this.adapter.modulePrefix();
    }
    importPaths(engine, engineRelativePath, fromFile) {
        let appRelativePath = path_1.join(engine.appRelativePath, engineRelativePath);
        let noJS = appRelativePath.replace(this.resolvableExtensionsPattern, '');
        let noHBS = engineRelativePath.replace(this.resolvableExtensionsPattern, '').replace(/\.hbs$/, '');
        return {
            runtime: `${engine.modulePrefix}/${noHBS}`,
            buildtime: paths_1.explicitRelative(path_1.dirname(fromFile), noJS),
        };
    }
    routeEntrypoint(engine, relativePath, files) {
        let [fastboot, nonFastboot] = partition_1.default(files, file => engine.appFiles.isFastbootOnly.get(file));
        let asset = {
            kind: 'in-memory',
            source: routeEntryTemplate({
                files: nonFastboot.map(f => this.importPaths(engine, f, relativePath)),
                fastbootOnlyFiles: fastboot.map(f => this.importPaths(engine, f, relativePath)),
            }),
            relativePath,
        };
        return asset;
    }
    testJSEntrypoint(engines, prepared) {
        let asset = prepared.get(`assets/test.js`);
        if (asset) {
            return asset;
        }
        // We're only building tests from the first engine (the app). This is the
        // normal thing to do -- tests from engines don't automatically roll up into
        // the app.
        let engine = engines[0];
        const myName = 'assets/test.js';
        // tests necessarily also include the app. This is where we account for
        // that. The classic solution was to always include the app's separate
        // script tag in the tests HTML, but that isn't as easy for final stage
        // packagers to understand. It's better to express it here as a direct
        // module dependency.
        let eagerModules = [
            paths_1.explicitRelative(path_1.dirname(myName), this.topAppJSAsset(engines, prepared).relativePath),
        ];
        let amdModules = [];
        // this is a backward-compatibility feature: addons can force inclusion of
        // test support modules.
        this.gatherImplicitModules('implicit-test-modules', myName, engine, amdModules);
        let { appFiles } = engine;
        for (let relativePath of appFiles.tests) {
            amdModules.push(this.importPaths(engine, relativePath, myName));
        }
        let source = entryTemplate({
            amdModules,
            eagerModules,
            testSuffix: true,
        });
        asset = {
            kind: 'in-memory',
            source,
            relativePath: myName,
        };
        prepared.set(asset.relativePath, asset);
        return asset;
    }
    gatherImplicitModules(section, relativeTo, engine, lazyModules) {
        for (let addon of engine.addons) {
            let implicitModules = addon.meta[section];
            if (implicitModules) {
                let renamedModules = inverseRenamedModules(addon.meta, this.resolvableExtensionsPattern);
                for (let name of implicitModules) {
                    let packageName = addon.name;
                    if (addon.isV2Addon()) {
                        let renamedMeta = addon.meta['renamed-packages'];
                        if (renamedMeta) {
                            Object.entries(renamedMeta).forEach(([key, value]) => {
                                if (value === addon.name) {
                                    packageName = key;
                                }
                            });
                        }
                    }
                    let runtime = path_1.join(packageName, name).replace(this.resolvableExtensionsPattern, '');
                    if (renamedModules && renamedModules[runtime]) {
                        runtime = renamedModules[runtime];
                    }
                    runtime = runtime.split(path_1.sep).join('/');
                    lazyModules.push({
                        runtime,
                        buildtime: paths_1.explicitRelative(path_1.dirname(path_1.join(this.root, relativeTo)), path_1.join(addon.root, name)),
                    });
                }
            }
        }
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "resolvableExtensionsPattern", null);
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "babelParserConfig", null);
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "babelConfig", null);
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "activeFastboot", null);
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "fastbootConfig", null);
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "portableHints", null);
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "staticAppPathsPattern", null);
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "modulePrefix", null);
exports.AppBuilder = AppBuilder;
const entryTemplate = js_handlebars_1.compile(`
import { importSync as i, macroCondition, getGlobalConfig } from '@embroider/macros';
let w = window;
let d = w.define;

{{#if styles}}
  if (macroCondition(!getGlobalConfig().fastboot?.isRunning)) {
    {{#each styles as |stylePath| ~}}
      i("{{stylePath.path}}");
    {{/each}}
  }
{{/if}}

{{#each amdModules as |amdModule| ~}}
  d("{{js-string-escape amdModule.runtime}}", function(){ return i("{{js-string-escape amdModule.buildtime}}");});
{{/each}}

{{#if fastbootOnlyAmdModules}}
  if (macroCondition(getGlobalConfig().fastboot?.isRunning)) {
    {{#each fastbootOnlyAmdModules as |amdModule| ~}}
      d("{{js-string-escape amdModule.runtime}}", function(){ return i("{{js-string-escape amdModule.buildtime}}");});
    {{/each}}
  }
{{/if}}

{{#each eagerModules as |eagerModule| ~}}
  i("{{js-string-escape eagerModule}}");
{{/each}}

{{#if lazyRoutes}}
w._embroiderRouteBundles_ = [
  {{#each lazyRoutes as |route|}}
  {
    names: {{{json-stringify route.names}}},
    load: function() {
      return import("{{js-string-escape route.path}}");
    }
  },
  {{/each}}
]
{{/if}}

{{#if lazyEngines}}
w._embroiderEngineBundles_ = [
  {{#each lazyEngines as |engine|}}
  {
    names: {{{json-stringify engine.names}}},
    load: function() {
      return import("{{js-string-escape engine.path}}");
    }
  },
  {{/each}}
]
{{/if}}

{{#if autoRun ~}}
if (!runningTests) {
  i("{{js-string-escape mainModule}}").default.create({{{json-stringify appConfig}}});
}
{{else  if appBoot ~}}
  {{{ appBoot }}}
{{/if}}

{{#if testSuffix ~}}
  {{!- TODO: both of these suffixes should get dynamically generated so they incorporate
       any content-for added by addons. -}}


  {{!- this is the traditional tests-suffix.js -}}
  i('../tests/test-helper');
  EmberENV.TESTS_FILE_LOADED = true;
{{/if}}
`);
const routeEntryTemplate = js_handlebars_1.compile(`
import { importSync as i } from '@embroider/macros';
let d = window.define;
{{#each files as |amdModule| ~}}
d("{{js-string-escape amdModule.runtime}}", function(){ return i("{{js-string-escape amdModule.buildtime}}");});
{{/each}}
{{#if fastbootOnlyFiles}}
  import { macroCondition, getGlobalConfig } from '@embroider/macros';
  if (macroCondition(getGlobalConfig().fastboot?.isRunning)) {
    {{#each fastbootOnlyFiles as |amdModule| ~}}
    d("{{js-string-escape amdModule.runtime}}", function(){ return i("{{js-string-escape amdModule.buildtime}}");});
    {{/each}}
  }
{{/if}}
`);
function stringOrBufferEqual(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a === b;
    }
    if (a instanceof Buffer && b instanceof Buffer) {
        return Buffer.compare(a, b) === 0;
    }
    return false;
}
const babelFilterTemplate = js_handlebars_1.compile(`
const { babelFilter } = require('@embroider/core');
module.exports = babelFilter({{{json-stringify skipBabel}}});
`);
// meta['renamed-modules'] has mapping from classic filename to real filename.
// This takes that and converts it to the inverst mapping from real import path
// to classic import path.
function inverseRenamedModules(meta, extensions) {
    let renamed = meta['renamed-modules'];
    if (renamed) {
        let inverted = {};
        for (let [classic, real] of Object.entries(renamed)) {
            inverted[real.replace(extensions, '')] = classic.replace(extensions, '');
        }
        return inverted;
    }
}
function combinePackageJSON(...layers) {
    function custom(objValue, srcValue, key, _object, _source, stack) {
        if (key === 'keywords' && stack.size === 0) {
            if (Array.isArray(objValue)) {
                return objValue.concat(srcValue);
            }
        }
    }
    return mergeWith_1.default({}, ...layers, custom);
}
//# sourceMappingURL=app.js.map