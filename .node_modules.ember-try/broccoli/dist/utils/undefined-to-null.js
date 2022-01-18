"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Replace all `undefined` values with `null`, so that they show up in JSON output
function undefinedToNull(obj) {
    for (const key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key) && obj[key] === undefined) {
            obj[key] = null;
        }
    }
    return obj;
}
exports.default = undefinedToNull;
//# sourceMappingURL=undefined-to-null.js.map