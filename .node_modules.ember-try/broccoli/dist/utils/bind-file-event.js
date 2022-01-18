"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const heimdalljs_logger_1 = __importDefault(require("heimdalljs-logger"));
const logger = new heimdalljs_logger_1.default('broccoli:watcherAdapter');
function bindFileEvent(adapter, watcher, node, event) {
    // @ts-ignores
    watcher.on(event, (filepath, root) => {
        logger.debug(event, root + '/' + filepath);
        logger.debug(`revise called on node [${node.id}]`);
        node.revise();
        adapter.emit('change', event, filepath, root);
    });
}
exports.default = bindFileEvent;
//# sourceMappingURL=bind-file-event.js.map