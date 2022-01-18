"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builder_1 = __importDefault(require("./builder"));
const wrap_primitive_errors_1 = __importDefault(require("../utils/wrap-primitive-errors"));
class NodeSetupError extends builder_1.default {
    constructor(originalError, nodeWrapper) {
        if (nodeWrapper == null) {
            // Chai calls new NodeSetupError() :(
            super();
            return;
        }
        originalError = wrap_primitive_errors_1.default(originalError);
        const message = originalError.message +
            '\nat ' +
            nodeWrapper.label +
            nodeWrapper.formatInstantiationStackForTerminal();
        super(message);
        // The stack will have the original exception name, but that's OK
        this.stack = originalError.stack;
    }
}
exports.default = NodeSetupError;
//# sourceMappingURL=node-setup.js.map