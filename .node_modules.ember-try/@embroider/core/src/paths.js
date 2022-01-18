"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionsPattern = exports.explicitRelative = void 0;
const path_1 = require("path");
// by "explicit", I mean that we want "./local/thing" instead of "local/thing"
// because
//     import "./local/thing"
// has a different meaning than
//     import "local/thing"
//
function explicitRelative(fromDir, toFile) {
    let result = path_1.join(path_1.relative(fromDir, path_1.dirname(toFile)), path_1.basename(toFile));
    if (!result.startsWith('/') && !result.startsWith('.')) {
        result = './' + result;
    }
    if (path_1.isAbsolute(toFile) && result.endsWith(toFile)) {
        // this prevents silly "relative" paths like
        // "../../../../../Users/you/projects/your/stuff" when we could have just
        // said "/Users/you/projects/your/stuff". The silly path isn't incorrect,
        // but it's unnecessarily verbose.
        return toFile;
    }
    return result;
}
exports.explicitRelative = explicitRelative;
// given a list like ['.js', '.ts'], return a regular expression for files ending
// in those extensions.
function extensionsPattern(extensions) {
    return new RegExp(`(${extensions.map(e => `${e.replace('.', '\\.')}`).join('|')})$`, 'i');
}
exports.extensionsPattern = extensionsPattern;
//# sourceMappingURL=paths.js.map