"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const tmp_1 = __importDefault(require("tmp"));
const path_1 = __importDefault(require("path"));
const broccoli_source_1 = require("broccoli-source");
const transform_node_1 = __importDefault(require("./wrappers/transform-node"));
const source_node_1 = __importDefault(require("./wrappers/source-node"));
const builder_1 = __importDefault(require("./errors/builder"));
const node_setup_1 = __importDefault(require("./errors/node-setup"));
const build_1 = __importDefault(require("./errors/build"));
const cancelation_request_1 = __importDefault(require("./cancelation-request"));
const filter_map_1 = __importDefault(require("./utils/filter-map"));
const events_1 = require("events");
const node_1 = __importDefault(require("./wrappers/node"));
const heimdalljs_1 = __importDefault(require("heimdalljs"));
const underscore_string_1 = __importDefault(require("underscore.string"));
// @ts-ignore
const broccoli_node_info_1 = __importDefault(require("broccoli-node-info"));
const heimdalljs_logger_1 = __importDefault(require("heimdalljs-logger"));
const logger = new heimdalljs_logger_1.default('broccoli:builder');
// Clean up left-over temporary directories on uncaught exception.
tmp_1.default.setGracefulCleanup();
function reParentNodes(outputNodeWrapper) {
    // re-parent heimdall nodes according to input nodes
    const seen = new Set();
    const queue = [outputNodeWrapper];
    let node;
    let parent;
    const stack = [];
    while ((node = queue.pop()) !== undefined) {
        if (parent === node) {
            parent = stack.pop();
        }
        else {
            queue.push(node);
            let heimdallNode = node.__heimdall__;
            if (heimdallNode === undefined || seen.has(heimdallNode)) {
                // make 0 time node
                const cookie = heimdalljs_1.default.start(Object.assign({}, heimdallNode.id));
                heimdallNode = heimdalljs_1.default.current;
                heimdallNode.id.broccoliCachedNode = true;
                cookie.stop();
                heimdallNode.stats.time.self = 0;
            }
            else {
                seen.add(heimdallNode);
                // Only push children for non "cached inputs"
                const inputNodeWrappers = node.inputNodeWrappers;
                for (let i = inputNodeWrappers.length - 1; i >= 0; i--) {
                    queue.push(inputNodeWrappers[i]);
                }
            }
            if (parent) {
                heimdallNode.remove();
                parent.__heimdall__.addChild(heimdallNode);
                stack.push(parent);
            }
            parent = node;
        }
    }
}
function aggregateTime() {
    const queue = [heimdalljs_1.default.current];
    const stack = [];
    let parent;
    let node;
    while ((node = queue.pop()) !== undefined) {
        if (parent === node) {
            parent = stack.pop();
            if (parent !== undefined) {
                parent.stats.time.total += node.stats.time.total;
            }
        }
        else {
            const children = node._children;
            queue.push(node);
            for (let i = children.length - 1; i >= 0; i--) {
                queue.push(children[i]);
            }
            if (parent) {
                stack.push(parent);
            }
            node.stats.time.total = node.stats.time.self;
            parent = node;
        }
    }
}
// For an explanation and reference of the API that we use to communicate with
// nodes (__broccoliFeatures__ and __broccoliGetInfo__), see
// https://github.com/broccolijs/broccoli/blob/master/docs/node-api.md
// Build a graph of nodes, referenced by its final output node. Example:
//
// ```js
// const builder = new Builder(outputNode)
// try {
//   const { outputPath } = await builder.build()
// } finally {
//   await builder.cleanup()
// }
// ```
//
// Note that the API of this Builder may change between minor Broccoli
// versions. Backwards compatibility is only guaranteed for plugins, so any
// plugin that works with Broccoli 1.0 will work with 1.x.
class Builder extends events_1.EventEmitter {
    constructor(outputNode, options = {}) {
        super();
        this.outputNode = outputNode;
        this.tmpdir = options.tmpdir; // can be null
        this.unwatchedPaths = [];
        this.watchedPaths = [];
        // nodeWrappers store additional bookkeeping information, such as paths.
        // This array contains them in topological (build) order.
        this._nodeWrappers = new Map();
        // This populates this._nodeWrappers as a side effect
        this.outputNodeWrapper = this.makeNodeWrapper(this.outputNode);
        // Catching missing directories here helps prevent later errors when we set
        // up the watcher.
        this.checkInputPathsExist();
        this.setupTmpDirs();
        this.setupHeimdall();
        this._cancelationRequest = undefined;
        // Now that temporary directories are set up, we need to run the rest of the
        // constructor in a try/catch block to clean them up if necessary.
        try {
            this.setupNodes();
            this.outputPath = this.outputNodeWrapper.outputPath;
            this.buildId = 0;
        }
        catch (e) {
            this.cleanup();
            throw e;
        }
    }
    static get BuilderError() {
        return builder_1.default;
    }
    static get InvalidNodeError() {
        return broccoli_node_info_1.default.InvalidNodeError;
    }
    static get NodeSetupError() {
        return node_setup_1.default;
    }
    static get BuildError() {
        return build_1.default;
    }
    static get NodeWrapper() {
        return node_1.default;
    }
    static get TransformNodeWrapper() {
        return transform_node_1.default;
    }
    static get SourceNodeWrapper() {
        return source_node_1.default;
    }
    // Trigger a (re)build.
    //
    // Returns a promise that resolves when the build has finished. If there is a
    // build error, the promise is rejected with a Builder.BuildError instance.
    // This method will never throw, and it will never be rejected with anything
    // other than a BuildError.
    async build() {
        if (this._cancelationRequest) {
            throw new builder_1.default('Cannot start a build if one is already running');
        }
        let pipeline = Promise.resolve();
        this.buildId++;
        for (const nw of this._nodeWrappers.values()) {
            // Wipe all buildState objects at the beginning of the build
            nw.buildState = {};
            // the build is two passes, first we create a promise chain representing
            // the complete build, then we pass that terminal promises which
            // represents the build to the CancelationRequest, after which the build
            // itself begins.
            //
            // 1. build up a promise chain, which represents the complete build
            pipeline = pipeline.then(async () => {
                // 3. begin next build step
                this._cancelationRequest.throwIfRequested();
                this.emit('beginNode', nw);
                try {
                    await nw.build();
                    this.emit('endNode', nw);
                }
                catch (e) {
                    this.emit('endNode', nw);
                    // wrap the error which occurred from a node wrappers build with
                    // additional build information. This includes which build step
                    // caused the error, and where that build step was instantiated.
                    throw new build_1.default(e, nw);
                }
            });
        }
        // 2. Create CancelationRequest which waits on the complete build itself
        // This allows us to initiate a cancellation, but wait until any
        // un-cancelable work completes before canceling. This allows us to safely
        // wait until cancelation is complete before performance actions such as
        // cleanup, or restarting the build itself.
        this._cancelationRequest = new cancelation_request_1.default(pipeline);
        try {
            await pipeline;
            this.buildHeimdallTree(this.outputNodeWrapper);
        }
        finally {
            const buildsSkipped = filter_map_1.default(this._nodeWrappers.values(), (nw) => nw.buildState.built === false).length;
            logger.debug(`Total nodes skipped: ${buildsSkipped} out of ${this._nodeWrappers.size}`);
            this._cancelationRequest = null;
        }
    }
    async cancel() {
        if (this._cancelationRequest) {
            return this._cancelationRequest.cancel();
        }
    }
    // Destructor-like method. Waits on current node to finish building, then cleans up temp directories
    async cleanup() {
        try {
            await this.cancel();
        }
        finally {
            await this.builderTmpDirCleanup();
        }
    }
    // This method recursively traverses the node graph and returns a nodeWrapper.
    // The nodeWrapper graph parallels the node graph 1:1.
    makeNodeWrapper(node, _stack = []) {
        const wrapper = this._nodeWrappers.get(node);
        if (wrapper !== undefined) {
            return wrapper;
        }
        // Turn string nodes into WatchedDir nodes
        const originalNode = node; // keep original (possibly string) node around so we can later deduplicate
        if (typeof node === 'string') {
            node = new broccoli_source_1.WatchedDir(node, { annotation: 'string node' });
        }
        // Call node.__broccoliGetInfo__()
        let nodeInfo;
        try {
            nodeInfo = broccoli_node_info_1.default.getNodeInfo(node);
        }
        catch (e) {
            if (!(e instanceof broccoli_node_info_1.default.InvalidNodeError))
                throw e;
            // We don't have the instantiation stack of an invalid node, so to aid
            // debugging, we instead report its parent node
            const messageSuffix = _stack.length > 0
                ? '\nused as input node to ' +
                    _stack[_stack.length - 1].label +
                    _stack[_stack.length - 1].formatInstantiationStackForTerminal()
                : '\nused as output node';
            throw new broccoli_node_info_1.default.InvalidNodeError(e.message + messageSuffix);
        }
        // Compute label, like "Funnel (test suite)"
        let label = nodeInfo.name;
        const labelExtras = [];
        if (nodeInfo.nodeType === 'source')
            labelExtras.push(nodeInfo.sourceDirectory);
        if (nodeInfo.annotation != null)
            labelExtras.push(nodeInfo.annotation);
        if (labelExtras.length > 0)
            label += ' (' + labelExtras.join('; ') + ')';
        // We start constructing the nodeWrapper here because we'll need the partial
        // nodeWrapper for the _stack. Later we'll add more properties.
        const nodeWrapper = nodeInfo.nodeType === 'transform' ? new transform_node_1.default() : new source_node_1.default();
        nodeWrapper.nodeInfo = nodeInfo;
        nodeWrapper.originalNode = originalNode;
        nodeWrapper.node = node;
        nodeWrapper.label = label;
        // Detect cycles
        for (let i = 0; i < _stack.length; i++) {
            if (_stack[i].node === originalNode) {
                let cycleMessage = 'Cycle in node graph: ';
                for (let j = i; j < _stack.length; j++) {
                    cycleMessage += _stack[j].label + ' -> ';
                }
                cycleMessage += nodeWrapper.label;
                throw new builder_1.default(cycleMessage);
            }
        }
        // For 'transform' nodes, recursively enter into the input nodes; for
        // 'source' nodes, record paths.
        let inputNodeWrappers = [];
        if (nodeInfo.nodeType === 'transform') {
            const newStack = _stack.concat([nodeWrapper]);
            inputNodeWrappers = nodeInfo.inputNodes.map((inputNode) => {
                return this.makeNodeWrapper(inputNode, newStack);
            });
        }
        else {
            // nodeType === 'source'
            if (nodeInfo.watched) {
                this.watchedPaths.push(nodeInfo.sourceDirectory);
            }
            else {
                this.unwatchedPaths.push(nodeInfo.sourceDirectory);
            }
        }
        // For convenience, all nodeWrappers get an `inputNodeWrappers` array; for
        // 'source' nodes it's empty.
        nodeWrapper.inputNodeWrappers = inputNodeWrappers;
        nodeWrapper.id = this._nodeWrappers.size;
        // this._nodeWrappers will contain all the node wrappers in topological
        // order, i.e. each node comes after all its input nodes.
        //
        // It's unfortunate that we're mutating this._nodeWrappers as a side effect,
        // but since we work backwards from the output node to discover all the
        // input nodes, it's harder to do a side-effect-free topological sort.
        this._nodeWrappers.set(nodeWrapper.originalNode, nodeWrapper);
        return nodeWrapper;
    }
    get watchedSourceNodeWrappers() {
        return filter_map_1.default(this._nodeWrappers.values(), (nw) => {
            return nw.nodeInfo.nodeType === 'source' && nw.nodeInfo.watched;
        });
    }
    checkInputPathsExist() {
        // We might consider checking this.unwatchedPaths as well.
        for (let i = 0; i < this.watchedPaths.length; i++) {
            let isDirectory;
            try {
                isDirectory = fs_1.default.statSync(this.watchedPaths[i]).isDirectory();
            }
            catch (err) {
                throw new builder_1.default('Directory not found: ' + this.watchedPaths[i]);
            }
            if (!isDirectory) {
                throw new builder_1.default('Not a directory: ' + this.watchedPaths[i]);
            }
        }
    }
    setupTmpDirs() {
        // Create temporary directories for each node:
        //
        //   out-01-some-plugin/
        //   out-02-otherplugin/
        //   cache-01-some-plugin/
        //   cache-02-otherplugin/
        //
        // Here's an alternative directory structure we might consider (it's not
        // clear which structure makes debugging easier):
        //
        //   01-some-plugin/
        //     out/
        //     cache/
        //     in-1 -> ... // symlink for convenience
        //     in-2 -> ...
        //   02-otherplugin/
        //     ...
        // @ts-ignore
        const tmpObj = tmp_1.default.dirSync({
            prefix: 'broccoli-',
            unsafeCleanup: true,
            dir: this.tmpdir || undefined,
        });
        this.builderTmpDir = tmpObj.name;
        this.builderTmpDirCleanup = tmpObj.removeCallback;
        for (const nodeWrapper of this._nodeWrappers.values()) {
            if (nodeWrapper.nodeInfo.nodeType === 'transform') {
                nodeWrapper.inputPaths = nodeWrapper.inputNodeWrappers.map((nw) => nw.outputPath);
                nodeWrapper.outputPath = this.mkTmpDir(nodeWrapper, 'out');
                if (nodeWrapper.nodeInfo.needsCache) {
                    nodeWrapper.cachePath = this.mkTmpDir(nodeWrapper, 'cache');
                }
            }
            else {
                // nodeType === 'source'
                // We could name this .sourcePath, but with .outputPath the code is simpler.
                nodeWrapper.outputPath = nodeWrapper.nodeInfo.sourceDirectory;
            }
        }
    }
    // Create temporary directory, like
    // /tmp/broccoli-9rLfJh/out-067-merge_trees_vendor_packages
    // type is 'out' or 'cache'
    mkTmpDir(nodeWrapper, type) {
        const nameAndAnnotation = nodeWrapper.nodeInfo.name + ' ' + (nodeWrapper.nodeInfo.annotation || '');
        // slugify turns fooBar into foobar, so we call underscored first to
        // preserve word boundaries
        let suffix = underscore_string_1.default.underscored(nameAndAnnotation.substr(0, 60));
        suffix = underscore_string_1.default.slugify(suffix).replace(/-/g, '_');
        // 1 .. 147 -> '001' .. '147'
        const paddedId = underscore_string_1.default.pad('' + nodeWrapper.id, ('' + this._nodeWrappers.size).length, '0');
        const dirname = type + '-' + paddedId + '-' + suffix;
        const tmpDir = path_1.default.join(this.builderTmpDir, dirname);
        fs_1.default.mkdirSync(tmpDir);
        return tmpDir;
    }
    // for compat
    get nodeWrappers() {
        return [...this._nodeWrappers.values()];
    }
    setupNodes() {
        for (const nw of this._nodeWrappers.values()) {
            try {
                nw.setup(this.features);
            }
            catch (err) {
                throw new node_setup_1.default(err, nw);
            }
        }
    }
    setupHeimdall() {
        this.on('beginNode', node => {
            let name;
            if (node instanceof source_node_1.default) {
                name = node.nodeInfo.sourceDirectory;
            }
            else {
                name = node.nodeInfo.annotation || node.nodeInfo.name;
            }
            node['__heimdall_cookie__'] = heimdalljs_1.default.start({
                name,
                label: node.label,
                broccoliNode: true,
                broccoliId: node.id,
                // we should do this instead of reParentNodes
                // broccoliInputIds: node.inputNodeWrappers.map(input => input.id),
                broccoliCachedNode: false,
                broccoliPluginName: node.nodeInfo.name,
            });
            node.__heimdall__ = heimdalljs_1.default.current;
        });
        this.on('endNode', node => {
            if (node.__heimdall__) {
                node.__heimdall_cookie__.stop();
            }
        });
    }
    buildHeimdallTree(outputNodeWrapper) {
        if (!outputNodeWrapper.__heimdall__) {
            return;
        }
        // Why?
        reParentNodes(outputNodeWrapper);
        // What uses this??
        aggregateTime();
    }
    get features() {
        return broccoli_node_info_1.default.features;
    }
}
module.exports = Builder;
//# sourceMappingURL=builder.js.map