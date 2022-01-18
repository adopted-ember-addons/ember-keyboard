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
exports.TemplateCompiler = exports.templateCompilerModule = void 0;
const strip_bom_1 = __importDefault(require("strip-bom"));
const fs_1 = require("fs");
const broccoli_persistent_filter_1 = __importDefault(require("broccoli-persistent-filter"));
const json_stable_stringify_1 = __importDefault(require("json-stable-stringify"));
const crypto_1 = require("crypto");
const path_1 = require("path");
const typescript_memoize_1 = require("typescript-memoize");
const wrap_legacy_hbs_plugin_if_needed_1 = __importDefault(require("wrap-legacy-hbs-plugin-if-needed"));
const patch_template_compiler_1 = require("./patch-template-compiler");
const portable_1 = require("./portable");
const CACHE = new Map();
// Today the template compiler seems to not expose a public way to to source 2 source compilation of templates.
// because of this, we must resort to some hackery.
//
// TODO: expose a way to accomplish this via purely public API's.
// Today we use the following API's
// * glimmer/syntax's preprocess
// * glimmer/syntax's print
// * ember-template-compiler/lib/system/compile-options's defaultOptions
function getEmberExports(templateCompilerPath) {
    let entry = CACHE.get(templateCompilerPath);
    if (entry) {
        let currentStat = fs_1.statSync(templateCompilerPath);
        // Let's ensure the template is still what we cached
        if (currentStat.mode === entry.stat.mode &&
            currentStat.size === entry.stat.size &&
            currentStat.mtime.getTime() === entry.stat.mtime.getTime()) {
            return entry.value;
        }
    }
    let stat = fs_1.statSync(templateCompilerPath);
    let source = patch_template_compiler_1.patch(fs_1.readFileSync(templateCompilerPath, 'utf8'), templateCompilerPath);
    let theExports = new Function(source)();
    // cacheKey, theExports
    let cacheKey = crypto_1.createHash('md5').update(source).digest('hex');
    entry = Object.freeze({
        value: {
            cacheKey,
            theExports,
        },
        stat,
    });
    CACHE.set(templateCompilerPath, entry);
    return entry.value;
}
// we could directly depend on @glimmer/syntax and have nice types and
// everything. But the problem is, we really want to use the exact version that
// the app itself is using, and its copy is bundled away inside
// ember-template-compiler.js.
function loadGlimmerSyntax(templateCompilerPath) {
    let { theExports, cacheKey } = getEmberExports(templateCompilerPath);
    // TODO: we should work to make this, or what it intends to accomplish, public API
    let syntax = theExports.Ember.__loader.require('@glimmer/syntax');
    let compilerOptions = theExports.Ember.__loader.require('ember-template-compiler/lib/system/compile-options');
    return {
        print: syntax.print,
        preprocess: syntax.preprocess,
        defaultOptions: compilerOptions.default,
        registerPlugin: compilerOptions.registerPlugin,
        precompile: theExports.precompile,
        _Ember: theExports._Ember,
        cacheKey,
    };
}
function templateCompilerModule(params, hints) {
    let p = new portable_1.Portable({ hints });
    let result = p.dehydrate(params);
    return {
        src: [
            `const { TemplateCompiler } = require("${__filename}");`,
            `const { Portable } = require("${path_1.resolve(__dirname, './portable.js')}");`,
            `let p = new Portable({ hints: ${JSON.stringify(hints, null, 2)} });`,
            `module.exports = new TemplateCompiler(p.hydrate(${JSON.stringify(result.value, null, 2)}))`,
        ].join('\n'),
        isParallelSafe: result.isParallelSafe,
    };
}
exports.templateCompilerModule = templateCompilerModule;
class TemplateCompiler {
    constructor(params) {
        this.params = params;
        // stage3 packagers don't need to know about our instance, they can just
        // grab the compile function and use it.
        this.compile = this.compile.bind(this);
    }
    get syntax() {
        return this.setup().syntax;
    }
    get cacheKey() {
        return this.setup().cacheKey;
    }
    setup() {
        let syntax = loadGlimmerSyntax(this.params.compilerPath);
        initializeEmberENV(syntax, this.params.EmberENV);
        let cacheKey = crypto_1.createHash('md5')
            .update(json_stable_stringify_1.default({
            // todo: get resolver reflected in cacheKey
            syntax: syntax.cacheKey,
        }))
            .digest('hex');
        return { syntax, cacheKey };
    }
    getReversedASTPlugins(ast) {
        return ast.slice().reverse();
    }
    // Compiles to the wire format plus dependency list.
    precompile(moduleName, contents) {
        let dependencies;
        let runtimeName;
        if (this.params.resolver) {
            runtimeName = this.params.resolver.absPathToRuntimePath(moduleName);
        }
        else {
            runtimeName = moduleName;
        }
        let opts = this.syntax.defaultOptions({ contents, moduleName });
        let plugins = Object.assign(Object.assign({}, opts.plugins), { ast: [
                ...this.getReversedASTPlugins(this.params.plugins.ast),
                this.params.resolver && this.params.resolver.astTransformer(this),
                ...opts.plugins.ast,
            ].filter(Boolean) });
        let compiled = this.syntax.precompile(strip_bom_1.default(contents), {
            contents,
            moduleName: runtimeName,
            filename: moduleName,
            plugins,
        });
        if (this.params.resolver) {
            dependencies = this.params.resolver.dependenciesOf(moduleName);
        }
        else {
            dependencies = [];
        }
        return { compiled, dependencies };
    }
    // Compiles all the way from a template string to a javascript module string.
    compile(moduleName, contents) {
        let { compiled, dependencies } = this.precompile(moduleName, contents);
        let lines = [];
        let counter = 0;
        for (let { runtimeName, path } of dependencies) {
            lines.push(`import a${counter} from "${path.split(path_1.sep).join('/')}";`);
            lines.push(`window.define('${runtimeName}', function(){ return a${counter++}});`);
        }
        lines.push(`export default Ember.HTMLBars.template(${compiled});`);
        return lines.join('\n');
    }
    // Applies all custom AST transforms and emits the results still as
    // handlebars.
    applyTransforms(moduleName, contents) {
        let opts = this.syntax.defaultOptions({ contents, moduleName });
        if (opts.plugins && opts.plugins.ast) {
            // the user-provided plugins come first in the list, and those are the
            // only ones we want to run. The built-in plugins don't need to run here
            // in stage1, it's better that they run in stage3 when the appropriate
            // ember version is in charge.
            //
            // rather than slicing them off, we could choose instead to not call
            // syntax.defaultOptions, but then we lose some of the compatibility
            // normalization that it does on the user-provided plugins.
            opts.plugins.ast = this.getReversedASTPlugins(this.params.plugins.ast).map(plugin => {
                // Although the precompile API does, this direct glimmer syntax api
                // does not support these legacy plugins, so we must wrap them.
                return wrap_legacy_hbs_plugin_if_needed_1.default(plugin);
            });
        }
        opts.filename = moduleName;
        opts.moduleName = this.params.resolver
            ? this.params.resolver.absPathToRuntimePath(moduleName) || moduleName
            : moduleName;
        let ast = this.syntax.preprocess(contents, opts);
        return this.syntax.print(ast);
    }
    parse(moduleName, contents) {
        // this is just a parse, so we deliberately don't run any plugins.
        let opts = { contents, moduleName, plugins: {} };
        return this.syntax.preprocess(contents, opts);
    }
    // Use applyTransforms on every file in a broccoli tree.
    applyTransformsToTree(tree) {
        return new TemplateCompileTree(tree, this, 1);
    }
    // Use applyTransforms on the contents of inline hbs template strings inside
    // Javascript.
    inlineTransformsBabelPlugin() {
        return [
            path_1.join(__dirname, 'babel-plugin-inline-hbs.js'),
            {
                templateCompiler: Object.assign({ cacheKey: this.cacheKey, baseDir: this.baseDir }, this.params),
                stage: 1,
            },
        ];
    }
    baseDir() {
        return path_1.join(__dirname, '..');
    }
    // tests for the classic ember-cli-htmlbars-inline-precompile babel plugin
    static isInlinePrecompilePlugin(item) {
        if (typeof item === 'string') {
            return matchesSourceFile(item);
        }
        if (hasProperties(item) && item._parallelBabel) {
            return matchesSourceFile(item._parallelBabel.requireFile);
        }
        if (Array.isArray(item) && item.length > 0) {
            if (typeof item[0] === 'string') {
                return matchesSourceFile(item[0]);
            }
            if (hasProperties(item[0]) && item[0]._parallelBabel) {
                return matchesSourceFile(item[0]._parallelBabel.requireFile);
            }
        }
        return false;
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], TemplateCompiler.prototype, "setup", null);
__decorate([
    typescript_memoize_1.Memoize()
], TemplateCompiler.prototype, "getReversedASTPlugins", null);
exports.TemplateCompiler = TemplateCompiler;
class TemplateCompileTree extends broccoli_persistent_filter_1.default {
    constructor(inputTree, templateCompiler, stage) {
        super(inputTree, {
            name: `embroider-template-compile-stage${stage}`,
            persist: true,
            extensions: ['hbs', 'handlebars'],
            // in stage3 we are changing the file extensions from hbs to js. In
            // stage1, we are just keeping hbs.
            targetExtension: stage === 3 ? 'js' : undefined,
        });
        this.templateCompiler = templateCompiler;
        this.stage = stage;
    }
    processString(source, relativePath) {
        if (this.stage === 1) {
            return this.templateCompiler.applyTransforms(relativePath, source);
        }
        else {
            return this.templateCompiler.compile(relativePath, source);
        }
    }
    cacheKeyProcessString(source, relativePath) {
        return `${this.stage}-${this.templateCompiler.cacheKey}` + super.cacheKeyProcessString(source, relativePath);
    }
    baseDir() {
        return path_1.join(__dirname, '..');
    }
}
function matchesSourceFile(filename) {
    return /(htmlbars-inline-precompile|ember-cli-htmlbars)\/(index|lib\/require-from-worker)(\.js)?$/.test(filename);
}
function hasProperties(item) {
    return item && (typeof item === 'object' || typeof item === 'function');
}
function initializeEmberENV(syntax, EmberENV) {
    if (!EmberENV) {
        return;
    }
    let props;
    if (EmberENV.FEATURES) {
        props = Object.keys(EmberENV.FEATURES);
        props.forEach(prop => {
            syntax._Ember.FEATURES[prop] = EmberENV.FEATURES[prop];
        });
    }
    if (EmberENV) {
        props = Object.keys(EmberENV);
        props.forEach(prop => {
            if (prop === 'FEATURES') {
                return;
            }
            syntax._Ember.ENV[prop] = EmberENV[prop];
        });
    }
}
//# sourceMappingURL=template-compiler.js.map