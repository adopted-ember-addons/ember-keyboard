"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_cache_1 = __importDefault(require("./package-cache"));
const semver_1 = __importDefault(require("semver"));
function babelFilter(skipBabel) {
    return function shouldTranspileFile(filename) {
        if (!babelCanHandle(filename)) {
            // quick exit for non JS extensions
            return false;
        }
        let owner = package_cache_1.default.shared('embroider-stage3').ownerOfFile(filename);
        if (owner) {
            for (let { package: pkg, semverRange } of skipBabel) {
                if (owner.name === pkg && (semverRange == null || semver_1.default.satisfies(owner.version, semverRange))) {
                    if (owner.isEmberPackage()) {
                        throw new Error(`You can't use skipBabel to disable transpilation of Ember addons, it only works for non-Ember third-party packages`);
                    }
                    return false;
                }
            }
        }
        return true;
    };
}
exports.default = babelFilter;
function babelCanHandle(filename) {
    // we can handle .js and .ts files with babel. If typescript is enabled, .ts
    // files become resolvable and stage3 will be asking us if they should get
    // transpiled and the answer is yes. If typescript is not enbled, they will
    // not be resolvable, so stage3 won't ask us about them.
    return /\.[jt]s$/i.test(filename);
}
//# sourceMappingURL=babel-filter.js.map