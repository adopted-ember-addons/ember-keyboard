'use strict';

module.exports = class CacheEntry {
  constructor(isCached, key, value) {
    this.isCached = isCached;
    this.key = key;
    this.value = value;
  }
};

module.exports.MISS = new module.exports(false);

