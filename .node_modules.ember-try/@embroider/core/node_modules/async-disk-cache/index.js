'use strict';

const path = require('path');
const RSVP = require('rsvp');
const fs = require('fs');
const readFile = RSVP.denodeify(fs.readFile);
const writeFile = RSVP.denodeify(fs.writeFile);
const renameFile = RSVP.denodeify(fs.rename);
const chmod = RSVP.denodeify(fs.chmod);
const mkdirp = RSVP.denodeify(require('mkdirp'));
const rimraf = RSVP.denodeify(require('rimraf'));
const unlink = RSVP.denodeify(fs.unlink);
const os = require('os');
const debug = require('debug')('async-disk-cache');
const zlib = require('zlib');
const heimdall = require('heimdalljs');
const crypto = require('crypto');

const CacheEntry = require('./lib/cache-entry');
const Metric = require('./lib/metric');

if (!heimdall.hasMonitor('async-disk-cache')) {
  heimdall.registerMonitor('async-disk-cache', function AsyncDiskCacheSchema() {});
}

const username = require('username-sync')();
const tmpdir = path.join(os.tmpdir(), username);

/*
 * @private
 *
 * Defines a function on the given object at the given property name. Wraps
 * the function with metric recording for heimdalljs.
 *
 * @method defineFunction
 * @param Object obj the object on which to define the function
 * @param String name the name to use for the function
 * @param Function fn
 * @returns Void
 */
function defineFunction(obj, name, fn) {
  obj[name] = function() {
    const stats = heimdall.statsFor('async-disk-cache');
    const metrics = stats[name] = stats[name] || new Metric();

    metrics.start();

    let result;
    let didError = true;

    try {
      result = fn.apply(this, arguments);
      didError = false;
    } finally {
      if (didError) {
        metrics.stop();
      }
    }

    if (typeof result.finally === 'function') {
      return result.finally(() => metrics.stop());
    }

    metrics.stop();
    return result;
  };
}

/*
 * @private
 * @method processFile
 * @param String filePath the path of the cached file
 * @returns CacheEntry an object representing that cache entry
 */
function processFile(decompress, filePath) {
  return async (fileStream) => {
    let value = await decompress(fileStream);

    // is Buffer or string? >:D
    if (!this.supportBuffer || require('istextorbinary').isTextSync(false, value)) {
      debug('convert to string');
      value = value.toString();
    } else {
      debug('keep data as Buffer');
    }

    return new CacheEntry(true, filePath, value);
  };
}

/*
 * @private
 *
 * When we encounter a rejection with reason of ENOENT, we actually know this
 * should be a cache miss, so the rejection is handled as the CacheEntry.MISS
 * singleton is the result.
 *
 * But if we encounter anything else, we must assume a legitimate failure an
 * re-throw
 *
 * @method handleENOENT
 * @param Error reason
 * @returns CacheEntry returns the CacheEntry miss singleton
 */
function handleENOENT(reason) {
  if (reason && reason.code === 'ENOENT') {
    return CacheEntry.MISS;
  }
  throw reason;
}

const COMPRESSIONS = {
  deflate: {
    in: RSVP.denodeify(zlib.deflate),
    out: RSVP.denodeify(zlib.inflate)
  },

  deflateRaw: {
    in: RSVP.denodeify(zlib.deflateRaw),
    out: RSVP.denodeify(zlib.inflateRaw)
  },

  gzip: {
    in: RSVP.denodeify(zlib.gzip),
    out: RSVP.denodeify(zlib.gunzip)
  },
};
/*
 *
 * @class Cache
 * @param {String} key the global key that represents this cache in its final location
 * @param {String} options optional string path to the location for the
 *                          cache. If omitted the system tmpdir is used
 */
class Cache {
  constructor(key, _) {
    const options = _ || {};
    this.tmpdir = options.location|| tmpdir;
    this.compression = options.compression || false;
    this.supportBuffer = options.supportBuffer || false;
    this.key = key || 'default-disk-cache';
    this.root = path.join(this.tmpdir, 'if-you-need-to-delete-this-open-an-issue-async-disk-cache', this.key);

    debug('new Cache { root: %s, compression: %s }', this.root, this.compression);
  }
}

/*
 * @public
 *
 * @method clear
 * @returns {Promise} - fulfills when the cache has been cleared
 *                    - rejects when a failured occured during cache clear
 */
defineFunction(Cache.prototype, 'clear', function() {
  debug('clear: %s', this.root);

  return rimraf(
    path.join(this.root)
  );
});

/*
 * @public
 *
 * @method has
 * @param {String} key the key to check existence of
 * @return {Promise} - fulfills with either true | false depending if the key was found or not
 *                   - rejects when a failured occured when checking existence of the key
 */
defineFunction(Cache.prototype, 'has', function(key) {
  const filePath = this.pathFor(key);
  debug('has: %s', filePath);
  return new RSVP.Promise(resolve => fs.exists(filePath, resolve));
});

/*
 * @public
 *
 * @method set
 * @param {String} key they key to retrieve
 * @return {Promise} - fulfills with either the cache entry, or a cache miss entry
 *                   - rejects when a failure occured looking retrieving the key
 */
defineFunction(Cache.prototype, 'get', function(key) {
  const filePath = this.pathFor(key);
  debug('get: %s', filePath);

  return readFile(filePath).
    then(processFile.call(this, this.decompress.bind(this), filePath), handleENOENT);
});

/*
 * @public
 *
 * @method set
 * @param {String} key the key we wish to store
 * @param {String} value the value we wish the key to be stored with
 * @returns {Promise#fulfilled} if the value was coõstored as the key
 * @returns {Promise#rejected} when a failure occured persisting the key
 */


defineFunction(Cache.prototype, 'set', function(key, value) {
  // use RSVP to preserve public API as node 8 does not yet have Promise.prototype.finally

  return new RSVP.Promise(resolve => {
    resolve((async () => {
      const filePath = this.pathFor(key);
      debug('set : %s', filePath);
      const cache = this;

      await writeP(filePath, await cache.compress(value));
      return filePath;
    })());
  });
});

const MAX_DIGITS = Math.pow(10, (Number.MAX_SAFE_INTEGER + '').length);

async function writeP(filePath, content) {
  const base = path.dirname(filePath);
  const random = Math.random() * MAX_DIGITS;
  const tmpfile = filePath + '.tmp.' + random;

  try {
    await writeFile(tmpfile, content)
  } catch(reason) {
    if (reason && reason.code === 'ENOENT') {
      await mkdirp(base, { mode: '0700' });
      await writeFile(tmpfile, content);
    } else {
      throw reason;
    }
  }

  await renameFile(tmpfile, filePath);
  await chmod(filePath,  '600');
}

/*
 * @public
 *
 * @method remove
 * @param {String} key the key to remove from the cache
 * @returns {Promise#fulfilled} if the removal was successful
 * @returns {Promise#rejection} if something went wrong while removing the key
 */
defineFunction(Cache.prototype, 'remove', function(key) {
  // use RSVP to preserve public API as node 8 does not yet have Promise.prototype.finally
  return new RSVP.Promise(resolve => {
    resolve((async () => {
      const filePath = this.pathFor(key);
      debug('remove : %s', filePath);

      try {
        await unlink(filePath);
      } catch(e) {
        await handleENOENT(e);
      }
    })());
  });
});

/*
 * @public
 *
 * @method pathFor
 * @param {String} key the key to generate the final path for
 * @returns the path where the key's value may reside
 */
defineFunction(Cache.prototype, 'pathFor', function(key) {
  return path.join(this.root, crypto.createHash('sha1').update(key).digest('hex'));
});

/*
 * @public
 *
 * @method decompress
 * @param {String} compressedValue
 * @returns decompressedValue
 */
defineFunction(Cache.prototype, 'decompress', function(value) {
  if (!this.compression) {
    return value;
  }

  return COMPRESSIONS[this.compression].out(value);
});

/*
 * @public
 *
 * @method compress
 * @param {String} value
 * @returns compressedValue
 */
defineFunction(Cache.prototype, 'compress', function(value) {
  if (!this.compression) {
    return value;
  }
  return COMPRESSIONS[this.compression].in(value);
});

module.exports = Cache;
