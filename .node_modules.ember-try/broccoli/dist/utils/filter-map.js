"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function filterMap(iterator, cb) {
    const result = [];
    for (const entry of iterator) {
        if (cb(entry)) {
            result.push(entry);
        }
    }
    return result;
}
exports.default = filterMap;
//# sourceMappingURL=filter-map.js.map