"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function nativePromise(promise) {
    return new Promise((resolve, reject) => {
        promise.then(resolve, reject);
    });
}
exports.default = nativePromise;
//# sourceMappingURL=nativePromise.js.map