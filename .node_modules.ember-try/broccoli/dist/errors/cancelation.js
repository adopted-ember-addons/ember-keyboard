"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Base class for builder errors
class Cancelation extends Error {
    constructor(message = '') {
        super(message);
        this.isCancelation = true;
        this.isSilent = true;
    }
    static isCancelationError(e) {
        return typeof e === 'object' && e !== null && e.isCancelation === true;
    }
}
exports.default = Cancelation;
//# sourceMappingURL=cancelation.js.map