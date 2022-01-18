"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cancelation_1 = __importDefault(require("./cancelation"));
class Retry extends cancelation_1.default {
    constructor(message = 'Retry', retryIn) {
        super(message);
        this.isRetry = true;
        this.retryIn = retryIn;
    }
    static isRetry(e) {
        return typeof e === 'object' && e !== null && e.isRetry === true;
    }
}
exports.default = Retry;
//# sourceMappingURL=retry-cancelation.js.map