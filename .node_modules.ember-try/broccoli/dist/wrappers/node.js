"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const undefined_to_null_1 = __importDefault(require("../utils/undefined-to-null"));
class NodeWrapper {
    constructor() {
        this.buildState = {};
        this._revision = 0;
    }
    revise() {
        this._revision++;
    }
    get revision() {
        return this._revision;
    }
    toJSON() {
        return undefined_to_null_1.default({
            id: this.id,
            nodeInfo: this.nodeInfoToJSON(),
            buildState: this.buildState,
            label: this.label,
            inputNodeWrappers: this.inputNodeWrappers.map(nw => nw.id),
            cachePath: this.cachePath,
            outputPath: this.outputPath,
        });
    }
    formatInstantiationStackForTerminal() {
        return '\n-~- created here: -~-\n' + this.nodeInfo.instantiationStack + '\n-~- (end) -~-';
    }
    nodeInfoToJSON() {
        return {};
    }
}
exports.default = NodeWrapper;
//# sourceMappingURL=node.js.map