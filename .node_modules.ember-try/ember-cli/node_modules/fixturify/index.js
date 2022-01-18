"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs = require("fs-extra");
var walk_sync_1 = __importDefault(require("walk-sync"));
var fixturify;
(function (fixturify) {
    ;
    // merge walkSync.Options + Options for now
    function readSync(dir, options, _relativeRoot) {
        if (options === void 0) { options = {}; }
        if (_relativeRoot === void 0) { _relativeRoot = ''; }
        if ('include' in options) {
            if ('globs' in options) {
                throw new TypeError('fixturify.readSync does not support both options.include and options.globs, please only use options.globs.');
            }
            console.log('fixturify.readSync no longer supports options.include, please use options.globs instead.');
            options.globs = options.include;
        }
        if ('exclude' in options) {
            if ('ignore' in options) {
                throw new TypeError('fixturify.readSync does not support both options.exclude and options.ignore, please only use options.ignore.');
            }
            console.log('fixturify.readSync no longer supports options.exclude, please use options.ignore instead.');
            options.ignore = options.exclude;
        }
        var ignoreEmptyDirs = options.ignoreEmptyDirs;
        var obj = {};
        for (var _i = 0, _a = walk_sync_1.default.entries(dir, __assign(__assign({}, options), { directories: !ignoreEmptyDirs })); _i < _a.length; _i++) {
            var entry = _a[_i];
            if (entry.isDirectory() === false) {
                addFile(obj, entry.relativePath, fs.readFileSync(entry.fullPath, 'UTF8'));
            }
            else {
                addFolder(obj, entry.relativePath);
            }
        }
        return obj;
    }
    fixturify.readSync = readSync;
    function writeSync(dir, obj) {
        fs.mkdirpSync(dir);
        if ('string' !== typeof dir || dir === '') {
            throw new TypeError('writeSync first argument must be a non-empty string');
        }
        if ('object' !== typeof obj && obj !== null) {
            throw new TypeError('writeSync second argument must be an object');
        }
        for (var entry in obj) {
            if (obj.hasOwnProperty(entry)) {
                if ('string' !== typeof entry || entry === '') {
                    throw new Error('Directory entry must be a non-empty string');
                }
                if (entry === '.' || entry === '..') {
                    throw new Error('Directory entry must not be "." or ".."');
                }
                if (entry.indexOf('/') !== -1 || entry.indexOf('\\') !== -1) {
                    throw new Error('Directory entry must not contain "/" or "\\"');
                }
                var fullPath = dir + "/" + entry;
                var value = obj[entry];
                var stat = void 0;
                try {
                    stat = fs.statSync(fullPath);
                }
                catch (e) {
                    stat = undefined;
                }
                if (typeof value === 'string') {
                    if (stat && stat.isDirectory()) {
                        fs.removeSync(fullPath);
                    }
                    fs.writeFileSync(fullPath, value, 'UTF8');
                }
                else if (typeof value === 'object') {
                    if (value === null) {
                        fs.removeSync(fullPath);
                    }
                    else {
                        try {
                            if (stat && stat.isFile()) {
                                fs.unlinkSync(fullPath);
                            }
                            fs.mkdirSync(fullPath);
                        }
                        catch (e) {
                            // if the directory already exists, carry on.
                            // This is to support, re-applying (append-only) of fixtures
                            if (!(typeof e === 'object' && e !== null && e.code === 'EEXIST')) {
                                throw e;
                            }
                        }
                        writeSync(fullPath, value);
                    }
                }
                else {
                    throw new Error(entry + " in " + dir + " : Expected string or object, got " + value);
                }
            }
        }
    }
    fixturify.writeSync = writeSync;
})(fixturify || (fixturify = {}));
function addFile(obj, path, content) {
    var segments = path.split('/');
    var file = segments.pop();
    if (typeof file !== 'string') {
        throw new Error("invalid file path: '" + path + "'");
    }
    addFolder(obj, segments)[file] = content;
}
function addFolder(obj, path) {
    var segments = Array.isArray(path) ? path : path.split('/');
    for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
        var segment = segments_1[_i];
        if (segment === '') {
            break;
        }
        var entry = obj[segment];
        if (entry === undefined) {
            obj = obj[segment] = {};
        }
        else {
            if (typeof entry === 'object' && entry !== null) {
                obj = entry;
            }
            else {
                throw new Error("expected no existing directory entry for '" + path + "' but got '" + entry + "'");
            }
        }
    }
    return obj;
}
module.exports = fixturify;
//# sourceMappingURL=index.js.map