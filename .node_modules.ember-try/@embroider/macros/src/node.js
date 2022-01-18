"use strict";
// this is the public entrypoint for Node-side code, as opposed to index.ts
// which is our browser-visible public entrypoint
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmbroiderMacrosPlugin = exports.MacrosConfig = void 0;
// Entrypoint for managing the macro config within Node.
var macros_config_1 = require("./macros-config");
Object.defineProperty(exports, "MacrosConfig", { enumerable: true, get: function () { return __importDefault(macros_config_1).default; } });
function isEmbroiderMacrosPlugin(item) {
    return ((Array.isArray(item) &&
        item.length > 1 &&
        item[1] &&
        typeof item[1] === 'object' &&
        item[1].embroiderMacrosConfigMarker) ||
        (item && typeof item === 'function' && item.embroiderMacrosASTMarker));
}
exports.isEmbroiderMacrosPlugin = isEmbroiderMacrosPlugin;
//# sourceMappingURL=node.js.map