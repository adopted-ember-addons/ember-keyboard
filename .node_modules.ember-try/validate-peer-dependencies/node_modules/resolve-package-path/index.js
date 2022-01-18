'use strict';
var path = require("path");
var customResolvePackagePath = require('./lib/resolve-package-path');
var ALLOWED_ERROR_CODES = {
    // resolve package error codes
    MODULE_NOT_FOUND: true,
    // Yarn PnP Error Codes
    UNDECLARED_DEPENDENCY: true,
    MISSING_PEER_DEPENDENCY: true,
    MISSING_DEPENDENCY: true,
};
var CacheGroup = require("./lib/cache-group");
var Cache = require("./lib/cache");
var getRealFilePath = customResolvePackagePath._getRealFilePath;
var getRealDirectoryPath = customResolvePackagePath._getRealDirectoryPath;
var __findUpPackagePath = customResolvePackagePath._findUpPackagePath;
var CACHE = new CacheGroup();
var FIND_UP_CACHE = new Cache();
var pnp;
try {
    pnp = require('pnpapi'); // eslint-ignore node/no-missing-require
}
catch (error) {
    // not in Yarn PnP; not a problem
}
/**
 * Search each directory in the absolute path `basedir`, from leaf to root, for
 * a `package.json`, and return the first match, or `null` if no `package.json`
 * was found.
 *
 * @public
 * @param {string} basedir - an absolute path in which to search for a `package.json`
 * @param {CacheGroup|boolean} [_cache] (optional)
 *  * if true: will choose the default global cache
 *  * if false: will not cache
 *  * if undefined or omitted, will choose the default global cache
 *  * otherwise we assume the argument is an external cache of the form provided by resolve-package-path/lib/cache-group.js
 *
 * @return {string|null} a full path to the resolved package.json if found or null if not
 */
function _findUpPackagePath(basedir, _cache) {
    var cache;
    if (_cache === undefined || _cache === null || _cache === true) {
        // if no cache specified, or if cache is true then use the global cache
        cache = FIND_UP_CACHE;
    }
    else if (_cache === false) {
        // if cache is explicity false, create a throw-away cache;
        cache = new Cache();
    }
    else {
        // otherwise, assume the user has provided an alternative cache for the following form:
        // provided by resolve-package-path/lib/cache-group.js
        cache = _cache;
    }
    var absoluteStart = path.resolve(basedir);
    return __findUpPackagePath(cache, absoluteStart);
}
function resolvePackagePath(target, basedir, _cache) {
    var cache;
    if (_cache === undefined || _cache === null || _cache === true) {
        // if no cache specified, or if cache is true then use the global cache
        cache = CACHE;
    }
    else if (_cache === false) {
        // if cache is explicity false, create a throw-away cache;
        cache = new CacheGroup();
    }
    else {
        // otherwise, assume the user has provided an alternative cache for the following form:
        // provided by resolve-package-path/lib/cache-group.js
        cache = _cache;
    }
    var key = target + '\x00' + basedir;
    var pkgPath;
    if (cache.PATH.has(key)) {
        pkgPath = cache.PATH.get(key);
    }
    else {
        try {
            // the custom `pnp` code here can be removed when yarn 1.13 is the
            // current release. This is due to Yarn 1.13 and resolve interoperating
            // together seamlessly.
            pkgPath = pnp
                ? pnp.resolveToUnqualified(target + '/package.json', basedir)
                : customResolvePackagePath(cache, target, basedir);
        }
        catch (e) {
            if (e !== null && typeof e === 'object') {
                var code = e.code;
                if (ALLOWED_ERROR_CODES[code] === true) {
                    pkgPath = null;
                }
                else {
                    throw e;
                }
            }
            else {
                throw e;
            }
        }
        cache.PATH.set(key, pkgPath);
    }
    return pkgPath;
}
resolvePackagePath._resetCache = function () {
    CACHE = new CacheGroup();
    FIND_UP_CACHE = new Cache();
};
(function (resolvePackagePath) {
    resolvePackagePath._FIND_UP_CACHE = FIND_UP_CACHE;
    resolvePackagePath.findUpPackagePath = _findUpPackagePath;
})(resolvePackagePath || (resolvePackagePath = {}));
Object.defineProperty(resolvePackagePath, '_CACHE', {
    get: function () {
        return CACHE;
    },
});
Object.defineProperty(resolvePackagePath, '_FIND_UP_CACHE', {
    get: function () {
        return FIND_UP_CACHE;
    },
});
resolvePackagePath.getRealFilePath = function (filePath) {
    return getRealFilePath(CACHE.REAL_FILE_PATH, filePath);
};
resolvePackagePath.getRealDirectoryPath = function (directoryPath) {
    return getRealDirectoryPath(CACHE.REAL_DIRECTORY_PATH, directoryPath);
};
module.exports = resolvePackagePath;
