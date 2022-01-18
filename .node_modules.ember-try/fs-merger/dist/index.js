"use strict";
const fs = require("fs-extra");
const path = require("path");
const nodefs = require("fs");
const broccoliNodeInfo = require('broccoli-node-info');
const walk_sync_1 = require("walk-sync");
const WHITELISTEDOPERATION = new Set([
    'readFileSync',
    'existsSync',
    'lstatSync',
    'statSync',
    'readdirSync',
    'readdir',
    'readFileMeta',
    'entries',
    'at',
    'relativePathTo'
]);
function getRootAndPrefix(node) {
    let root = '';
    let prefix = '';
    let getDestinationPath = undefined;
    if (typeof node == 'string') {
        root = node;
    }
    else if (node.root) {
        root = node.root;
    }
    else {
        let { nodeType, sourceDirectory } = broccoliNodeInfo.getNodeInfo(node);
        root = nodeType == 'source' ? sourceDirectory : node.outputPath;
    }
    root = path.normalize(root);
    return {
        root,
        absRootWithSep: path.resolve(root) + path.sep,
        prefix: node.prefix || prefix,
        getDestinationPath: node.getDestinationPath || getDestinationPath
    };
}
function getValues(object) {
    if (Object.values) {
        return Object.values(object);
    }
    else {
        return Object.keys(object).map(function (key) {
            return object[key];
        });
    }
}
function handleOperation({ target, propertyName }, relativePath, ...fsArguments) {
    if (!this.MAP) {
        this._generateMap();
    }
    let fullPath = relativePath;
    let byPassAbsPathCheck = false;
    switch (propertyName) {
        case 'relativePathTo':
        case 'at':
            byPassAbsPathCheck = true;
            break;
        case 'entries':
            if (!relativePath) {
                byPassAbsPathCheck = true;
            }
            break;
    }
    if (byPassAbsPathCheck || !path.isAbsolute(relativePath)) {
        // if property is present in the FSMerge do not hijack it with fs operations
        if (this[propertyName]) {
            return this[propertyName](relativePath, ...fsArguments);
        }
        let { _dirList } = this;
        for (let i = _dirList.length - 1; i > -1; i--) {
            let { root } = this.PREFIXINDEXMAP[i];
            let tempPath = root + '/' + relativePath;
            if (fs.existsSync(tempPath)) {
                fullPath = tempPath;
            }
        }
    }
    return target[propertyName](fullPath, ...fsArguments);
}
class FSMerger {
    constructor(trees) {
        this._dirList = Array.isArray(trees) ? trees : [trees];
        this.MAP = null;
        this.PREFIXINDEXMAP = {};
        this.LIST = [];
        this._atList = [];
        let self = this;
        this.fs = new Proxy(nodefs, {
            get(target, propertyName) {
                if (WHITELISTEDOPERATION.has(propertyName)) {
                    return handleOperation.bind(self, { target, propertyName });
                }
                else {
                    throw new Error(`Operation ${propertyName} is not allowed with FSMerger.fs. Allowed operations are ${Array.from(WHITELISTEDOPERATION).toString()}`);
                }
            }
        });
    }
    readFileSync(filePath, options) {
        if (!this.MAP) {
            this._generateMap();
        }
        let { _dirList } = this;
        for (let i = _dirList.length - 1; i > -1; i--) {
            let { root } = this.PREFIXINDEXMAP[i];
            let fullPath = root + '/' + filePath;
            if (fs.existsSync(fullPath)) {
                return fs.readFileSync(fullPath, options);
            }
        }
        return fs.readFileSync(filePath, options);
    }
    at(index) {
        if (!this._atList[index]) {
            this._atList[index] = new FSMerger(this._dirList[index]);
        }
        return this._atList[index];
    }
    /**
     * Given an absolute path, returns a relative path suitable for using with the
     * other methods in this FSMerger. Does not emit paths starting with `../`;
     * paths outside this merged FS are instead returned as `null`.
     *
     * Note: If this FSMerger has a path that is inside another path, the first
     * one that contains the path will be used.
     *
     * Note 2: This method does not check whether the absolute path exists.
     *
     * @param absolutePath An absolute path to make relative.
     * @returns null if the path is not within any filesystem tree.
     */
    relativePathTo(absolutePath) {
        if (!path.isAbsolute(absolutePath)) {
            throw new Error(`relativePathTo expects an absolute path: ${absolutePath}`);
        }
        if (!this.MAP) {
            this._generateMap();
        }
        absolutePath = path.normalize(absolutePath);
        for (let i = 0; i < this.LIST.length; i++) {
            if (absolutePath.startsWith(this.LIST[i].absRootWithSep)) {
                return {
                    relativePath: path.relative(this.LIST[i].absRootWithSep, absolutePath),
                    at: i,
                };
            }
        }
        return null;
    }
    _generateMap() {
        this.MAP = this._dirList.reduce((map, tree, index) => {
            let parsedTree = getRootAndPrefix(tree);
            this.LIST.push(parsedTree);
            map[parsedTree.root] = parsedTree;
            this.PREFIXINDEXMAP[index] = parsedTree;
            return map;
        }, {});
    }
    readFileMeta(filePath, options) {
        if (!this.MAP) {
            this._generateMap();
        }
        let { _dirList } = this;
        let { basePath = '' } = options || {};
        basePath = basePath && path.normalize(basePath);
        if (this.MAP && this.MAP[basePath]) {
            let { root, prefix, getDestinationPath } = this.MAP[basePath];
            return {
                path: path.join(root, filePath),
                prefix: prefix,
                getDestinationPath: getDestinationPath
            };
        }
        for (let i = _dirList.length - 1; i > -1; i--) {
            let { root, prefix, getDestinationPath } = this.PREFIXINDEXMAP[i];
            let fullPath = path.join(root, filePath);
            if (basePath == root || fs.existsSync(fullPath)) {
                return {
                    path: fullPath,
                    prefix: prefix,
                    getDestinationPath: getDestinationPath
                };
            }
        }
    }
    readdirSync(dirPath, options) {
        if (!this.MAP) {
            this._generateMap();
        }
        let { _dirList } = this;
        let result = new Set();
        let errorCount = 0;
        let fullDirPath = '';
        for (let i = 0; i < _dirList.length; i++) {
            let { root } = this.PREFIXINDEXMAP[i];
            fullDirPath = root + '/' + dirPath;
            fullDirPath = fullDirPath.replace(/(\/|\/\/)$/, '');
            if (fs.existsSync(fullDirPath)) {
                for (let entry of fs.readdirSync(fullDirPath, options)) {
                    result.add(entry);
                }
            }
            else {
                errorCount += 1;
            }
        }
        if (errorCount == _dirList.length) {
            fs.readdirSync(fullDirPath);
        }
        return [...result];
    }
    readdir(dirPath, options, callback) {
        if (!this.MAP) {
            this._generateMap();
        }
        if (typeof options === 'function') {
            callback = options;
            options = 'utf-8';
        }
        let result = new Set();
        let { _dirList } = this;
        let fullDirPath = '';
        let existingPath = [];
        for (let i = 0; i < _dirList.length; i++) {
            let { root } = this.PREFIXINDEXMAP[i];
            fullDirPath = root + '/' + dirPath;
            fullDirPath = fullDirPath.replace(/(\/|\/\/)$/, '');
            if (fs.existsSync(fullDirPath)) {
                existingPath.push(fullDirPath);
            }
        }
        if (!existingPath.length) {
            nodefs.readdir(fullDirPath, options, callback);
        }
        let readComplete = 0;
        for (let i = 0; i < existingPath.length; i++) {
            nodefs.readdir(existingPath[i], options, (err, list) => {
                readComplete += 1;
                if (list) {
                    for (let r of list) {
                        result.add(r);
                    }
                }
                if (readComplete == existingPath.length || err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, [...result]);
                    }
                }
            });
        }
    }
    entries(dirPath = '', options) {
        if (!this.MAP) {
            this._generateMap();
        }
        let { _dirList } = this;
        let result = [], errorCount = 0;
        let hashStore = {};
        for (let i = 0; i < _dirList.length; i++) {
            let { root, prefix, getDestinationPath } = this.PREFIXINDEXMAP[i];
            if (!root) {
                throw new Error('FSMerger must be instatiated with string or BroccoliNode or Object with root');
            }
            let fullDirPath = dirPath ? root + '/' + dirPath : root;
            fullDirPath = fullDirPath.replace(/(\/|\/\/)$/, '');
            if (fs.existsSync(fullDirPath)) {
                let curEntryList = walk_sync_1.entries(fullDirPath, options);
                hashStore = curEntryList.reduce((hashStoreAccumulated, entry) => {
                    let relativePath = getDestinationPath ? getDestinationPath(entry.relativePath) : entry.relativePath;
                    relativePath = prefix ? path.join(prefix, relativePath) : relativePath;
                    hashStoreAccumulated[relativePath] = entry;
                    return hashStoreAccumulated;
                }, hashStore);
            }
            else {
                errorCount++;
            }
        }
        if (errorCount === _dirList.length) {
            return walk_sync_1.entries(dirPath);
        }
        result = getValues(hashStore);
        result.sort((entryA, entryB) => (entryA.relativePath > entryB.relativePath) ? 1 : -1);
        return result;
    }
}
module.exports = FSMerger;
//# sourceMappingURL=index.js.map