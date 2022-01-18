"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const node_1 = __importDefault(require("./node"));
const undefined_to_null_1 = __importDefault(require("../utils/undefined-to-null"));
class SourceNodeWrapper extends node_1.default {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setup( /* features */) { }
    build() {
        // We only check here that the sourceDirectory exists and is a directory
        try {
            if (!fs_1.default.statSync(this.nodeInfo.sourceDirectory).isDirectory()) {
                throw new Error('Not a directory');
            }
        }
        catch (err) {
            // stat might throw, or we might throw
            err.file = this.nodeInfo.sourceDirectory;
            // fs.stat augments error message with file name, but that's redundant
            // with our err.file, so we strip it
            err.message = err.message.replace(/, stat '[^'\n]*'$/m, '');
            throw err;
        }
        this.buildState.selfTime = 0;
        this.buildState.totalTime = 0;
    }
    toString() {
        const hint = this.nodeInfo.sourceDirectory + (this.nodeInfo.watched ? '' : ' (unwatched)');
        return '[NodeWrapper:' + this.id + ' ' + hint + ']';
    }
    nodeInfoToJSON() {
        return undefined_to_null_1.default({
            nodeType: 'source',
            sourceDirectory: this.nodeInfo.sourceDirectory,
            watched: this.nodeInfo.watched,
            name: this.nodeInfo.name,
            annotation: this.nodeInfo.annotation,
        });
    }
}
exports.default = SourceNodeWrapper;
//# sourceMappingURL=source-node.js.map