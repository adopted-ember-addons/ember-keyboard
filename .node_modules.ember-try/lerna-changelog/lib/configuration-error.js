"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigurationError {
    constructor(message) {
        this.name = "ConfigurationError";
        Error.apply(this, arguments);
        this.message = message;
    }
}
exports.default = ConfigurationError;
