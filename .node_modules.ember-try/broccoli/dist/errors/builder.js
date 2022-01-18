"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Base class for builder errors
class BuilderError extends Error {
    constructor(message = '') {
        super(message);
        this.isBuilderError = true;
    }
    static isBuilderError(error) {
        return error !== null && typeof error === 'object' && error.isBuilderError;
    }
}
exports.default = BuilderError;
//# sourceMappingURL=builder.js.map