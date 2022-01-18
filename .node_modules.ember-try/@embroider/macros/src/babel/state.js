"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unusedNameLike = exports.cloneDeep = exports.owningPackage = exports.sourceFile = exports.pathToRuntime = void 0;
const cloneDeepWith_1 = __importDefault(require("lodash/cloneDeepWith"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const path_1 = require("path");
const core_1 = require("@embroider/core");
const runtimePath = path_1.resolve(path_1.join(__dirname, '..', 'addon', 'runtime'));
function pathToRuntime(path, state) {
    if (!state.opts.owningPackageRoot) {
        // running inside embroider, so make a relative path to the module
        let source = sourceFile(path, state);
        return core_1.explicitRelative(path_1.dirname(source), runtimePath);
    }
    else {
        // running inside a classic build, so use a classic-compatible runtime
        // specifier
        return '@embroider/macros/runtime';
    }
}
exports.pathToRuntime = pathToRuntime;
function sourceFile(path, state) {
    return state.opts.owningPackageRoot || path.hub.file.opts.filename;
}
exports.sourceFile = sourceFile;
const packageCache = core_1.PackageCache.shared('embroider-stage3');
function owningPackage(path, state) {
    let file = sourceFile(path, state);
    let pkg = packageCache.ownerOfFile(file);
    if (!pkg) {
        throw new Error(`unable to determine which npm package owns the file ${file}`);
    }
    return pkg;
}
exports.owningPackage = owningPackage;
function cloneDeep(node, state) {
    return cloneDeepWith_1.default(node, function (value) {
        if (state.generatedRequires.has(value)) {
            let cloned = cloneDeep_1.default(value);
            state.generatedRequires.add(cloned);
            return cloned;
        }
    });
}
exports.cloneDeep = cloneDeep;
function unusedNameLike(name, path) {
    let candidate = name;
    let counter = 0;
    while (path.scope.getBinding(candidate)) {
        candidate = `${name}${counter++}`;
    }
    return candidate;
}
exports.unusedNameLike = unusedNameLike;
//# sourceMappingURL=state.js.map