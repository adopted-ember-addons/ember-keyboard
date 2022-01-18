"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const rimraf_1 = __importDefault(require("rimraf"));
const undefined_to_null_1 = __importDefault(require("../utils/undefined-to-null"));
const node_1 = __importDefault(require("./node"));
const heimdalljs_logger_1 = __importDefault(require("heimdalljs-logger"));
const logger = new heimdalljs_logger_1.default('broccoli:transform-node');
class TransformNodeWrapper extends node_1.default {
    setup(features) {
        this.nodeInfo.setup(features, {
            inputPaths: this.inputPaths,
            outputPath: this.outputPath,
            cachePath: this.cachePath,
        });
        this.callbackObject = this.nodeInfo.getCallbackObject();
        // This weakmap holds references from inputNode --> last known revision #
        // If the any inputNode's ref does not match what is stored in here then we
        // know a modification has happened so we call the build method
        this.inputRevisions = new WeakMap();
    }
    shouldBuild() {
        const nodesThatChanged = [];
        this.inputNodeWrappers.forEach((wrapper) => {
            const wrapperRevisionMeta = this.inputRevisions.get(wrapper);
            if (!wrapperRevisionMeta || wrapperRevisionMeta.revision !== wrapper.revision) {
                nodesThatChanged.push(wrapper.id);
                this.inputRevisions.set(wrapper, { revision: wrapper.revision, changed: true });
            }
            else {
                this.inputRevisions.set(wrapper, { revision: wrapper.revision, changed: false });
            }
        });
        // The plugin has told us they should always build
        if (this.nodeInfo.volatile === true) {
            return true;
        }
        // Memoization is currently optin via BROCCOLI_ENABLED_MEMOIZE = true
        if (process.env.BROCCOLI_ENABLED_MEMOIZE !== 'true') {
            return true;
        }
        // The plugin has no input nodes so it's build method should not
        // be called after the first build
        if (this.inputNodeWrappers.length === 0 && this.revision === 0) {
            return true;
        }
        if (nodesThatChanged.length > 0) {
            logger.debug(`${this.id} built because inputNodes [${nodesThatChanged.join(', ')}] changed`);
            return true;
        }
        return false;
    }
    async build() {
        const startTime = process.hrtime();
        if (!this.shouldBuild()) {
            this.buildState.built = false;
            return; // Noop the build since inputs did not change
        }
        if (!this.nodeInfo.persistentOutput) {
            rimraf_1.default.sync(this.outputPath);
            fs_1.default.mkdirSync(this.outputPath);
        }
        if (this.nodeInfo.trackInputChanges === true) {
            const changed = this.inputNodeWrappers.map(wrapper => this.inputRevisions.get(wrapper).changed);
            await this.callbackObject.build({ changedNodes: changed });
        }
        else {
            await this.callbackObject.build();
        }
        this.revise();
        const now = process.hrtime();
        const endTime = process.hrtime(startTime);
        // Build time in milliseconds
        this.buildState.selfTime = 1000 * (now[0] - startTime[0] + (now[1] - startTime[1]) / 1e9);
        this.buildState.totalTime = this.buildState.selfTime;
        for (let i = 0; i < this.inputNodeWrappers.length; i++) {
            this.buildState.totalTime += this.inputNodeWrappers[i].buildState.totalTime || 0;
        }
        if (this.buildState.selfTime >= 100) {
            logger.debug(`Node build execution time: %ds %dms`, endTime[0], Math.round(endTime[1] / 1e6));
        }
    }
    toString() {
        let hint = this.label;
        if (this.inputNodeWrappers) {
            // a bit defensive to deal with partially-constructed node wrappers
            hint += ' inputNodeWrappers:[' + this.inputNodeWrappers.map(nw => nw.id) + ']';
        }
        hint += ' at ' + this.outputPath;
        if (this.buildState.selfTime != null) {
            hint += ' (' + Math.round(this.buildState.selfTime) + ' ms)';
        }
        return '[NodeWrapper:' + this.id + ' ' + hint + ']';
    }
    nodeInfoToJSON() {
        return undefined_to_null_1.default({
            nodeType: 'transform',
            name: this.nodeInfo.name,
            annotation: this.nodeInfo.annotation,
            persistentOutput: this.nodeInfo.persistentOutput,
            needsCache: this.nodeInfo.needsCache,
        });
    }
}
exports.default = TransformNodeWrapper;
//# sourceMappingURL=transform-node.js.map