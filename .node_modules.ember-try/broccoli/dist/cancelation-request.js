"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cancelation_1 = __importDefault(require("./errors/cancelation"));
class CancelationRequest {
    constructor(pendingWork) {
        this._pendingWork = pendingWork; // all
        this._canceling = null;
    }
    get isCanceled() {
        return !!this._canceling;
    }
    throwIfRequested() {
        if (this.isCanceled) {
            throw new cancelation_1.default('Build Canceled');
        }
    }
    then() {
        // eslint-disable-next-line prefer-rest-params
        return this._pendingWork.then(...arguments);
    }
    cancel() {
        if (this._canceling) {
            return this._canceling;
        }
        this._canceling = this._pendingWork.catch(e => {
            if (cancelation_1.default.isCancelationError(e)) {
                return;
            }
            else {
                throw e;
            }
        });
        return this._canceling;
    }
}
exports.default = CancelationRequest;
//# sourceMappingURL=cancelation-request.js.map