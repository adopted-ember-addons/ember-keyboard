"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreate = void 0;
function getOrCreate(map, key, construct) {
    let result = map.get(key);
    if (!result) {
        result = construct(key);
        map.set(key, result);
    }
    return result;
}
exports.getOrCreate = getOrCreate;
//# sourceMappingURL=get-or-create.js.map