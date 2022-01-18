"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slow_trees_1 = __importDefault(require("./utils/slow-trees"));
exports.default = {
    onBuildSuccess(builder, ui) {
        slow_trees_1.default(builder.outputNodeWrapper.__heimdall__, 0.05, ui);
        ui.writeLine('Built - ' +
            Math.round(builder.outputNodeWrapper.buildState.totalTime) +
            ' ms @ ' +
            new Date().toString());
    },
};
//# sourceMappingURL=messages.js.map