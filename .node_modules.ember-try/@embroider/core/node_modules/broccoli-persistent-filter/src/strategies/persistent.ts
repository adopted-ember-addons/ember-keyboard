import { Context, ProcessStringResult, Strategy, InstrumentationSchema } from './strategy';
import AsyncDiskCache = require('async-disk-cache');
import SyncDiskCache = require('sync-disk-cache');
import Dependencies = require('../dependencies');
import Rimraf = require('rimraf');
import * as process from 'process';
import nativePromise from '../util/nativePromise';
import assertNever from '../util/assertNever';

const rimraf = Rimraf.sync;

interface PersistentStrategyConstructor {
  _persistentCacheKey?: string;
}

interface IPersistentStrategy extends Strategy {
  _cache?: AsyncDiskCache;
  _syncCache?: SyncDiskCache;
  cacheKey(ctx: Context): string;
}

const PersistentStrategy: IPersistentStrategy = {
  init(ctx) {
    // not happy about having to cast through `any` here.
    let constructor: PersistentStrategyConstructor = <any>ctx.constructor;
    if (!constructor._persistentCacheKey) {
      constructor._persistentCacheKey = this.cacheKey(ctx);
    }

    this._cache = new AsyncDiskCache(constructor._persistentCacheKey, {
      location: process.env['BROCCOLI_PERSISTENT_FILTER_CACHE_ROOT'],
      compression: 'deflate'
    });

    this._syncCache = new SyncDiskCache(constructor._persistentCacheKey, {
      location: process.env['BROCCOLI_PERSISTENT_FILTER_CACHE_ROOT']
    });

    if (process.env['CLEAR_BROCCOLI_PERSISTENT_FILTER_CACHE'] === 'true') {
      // this._cache.clear is async and can result in race conditions here.
      // TODO: update async-disk-cache to have a synchronous `clearSync` method.
      rimraf(this._cache.root);
      rimraf(this._syncCache.root);
    }
  },

  cacheKey(ctx) {
    return ctx.cacheKey!();
  },

  async processString(ctx: Context, contents: string, relativePath: string, forceInvalidation: boolean, instrumentation: InstrumentationSchema): Promise<string> {
    let key = ctx.cacheKeyProcessString!(contents, relativePath);
    let cache = this._cache!;
    let value: ProcessStringResult;

    let entry = await nativePromise(cache.get<string>(key));
    if (entry.isCached && !forceInvalidation) {
      instrumentation.persistentCacheHit++;
      value = JSON.parse(entry.value);
    } else {
      instrumentation.persistentCachePrime++;

      let result = await ctx.processString(contents, relativePath)
      if (typeof result === 'string') {
        value = { output: result };
      } else {
        value = result;
      }
      let stringValue = JSON.stringify(value);

      await nativePromise(cache.set(key, stringValue));
    }

    let result = await ctx.postProcess(value, relativePath);

    if (result === undefined) {
      assertNever(result, 'You must return an object from `Filter.prototype.postProcess`.');
    }
    return result.output;
  },

  /**
   * By default initial dependencies are empty.
   * @returns {Dependencies}
   */
  initialDependencies(rootFS: Dependencies.FSFacade, inputEncoding: string): Dependencies {
    let result = this._syncCache!.get<string>('__dependencies__');
    let dependencies;
    if (result.isCached) {
      let data = JSON.parse(result.value);
      dependencies = Dependencies.deserialize(data, rootFS, inputEncoding);
    } else {
      // Dependencies start out empty; they are sealed as if they came from
      // the previous build iteration.
      dependencies = new Dependencies(rootFS, inputEncoding);
      dependencies.seal().captureDependencyState();
    }
   return dependencies;
  },

  /**
   * Seals the dependencies and captures the dependency state.
   * @param dependencies {Dependencies} The dependencies to seal.
   */
  sealDependencies(dependencies) {
    dependencies.seal().captureDependencyState();
    let data = dependencies.serialize();
    this._syncCache!.set('__dependencies__', JSON.stringify(data));
  }
};

export = PersistentStrategy;
