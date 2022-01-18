"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function absolutePackageName(specifier) {
    if (specifier[0] === '.' || specifier[0] === '/') {
        // Not an absolute specifier
        return;
    }
    let parts = specifier.split('/');
    if (specifier[0] === '@') {
        return `${parts[0]}/${parts[1]}`;
    }
    else {
        return parts[0];
    }
}
exports.default = absolutePackageName;
//# sourceMappingURL=package-name.js.map