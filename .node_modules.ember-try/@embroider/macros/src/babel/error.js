"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function error(path, message) {
    return path.buildCodeFrameError(message, MacroError);
}
exports.default = error;
class MacroError extends Error {
    constructor(message) {
        super(message);
        this.type = '@embroider/macros Error';
        this.name = 'MacroError';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
        else if (!this.stack) {
            this.stack = new Error(message).stack;
        }
    }
}
//# sourceMappingURL=error.js.map