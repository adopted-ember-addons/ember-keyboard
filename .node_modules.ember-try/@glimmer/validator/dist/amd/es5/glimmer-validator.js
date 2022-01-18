define('@glimmer/validator', ['exports', '@glimmer/env', '@glimmer/global-context'], function (exports, env, globalContext) { 'use strict';

  // eslint-disable-next-line @typescript-eslint/ban-types
  function indexable(input) {
    return input;
  } // This is a duplicate utility from @glimmer/util because `@glimmer/validator`
  // should not depend on any other @glimmer packages, in order to avoid pulling
  // in types and prevent regressions in `@glimmer/tracking` (which has public types).

  var symbol = typeof Symbol !== 'undefined' ? Symbol : // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (key) {
    return "__" + key + Math.floor(Math.random() * Date.now()) + "__";
  }; // eslint-disable-next-line @typescript-eslint/no-explicit-any

  var symbolFor = typeof Symbol !== 'undefined' ? Symbol["for"] : function (key) {
    return "__GLIMMER_VALIDATOR_SYMBOL_FOR_" + key;
  };
  function getGlobal() {
    // eslint-disable-next-line node/no-unsupported-features/es-builtins
    if (typeof globalThis !== 'undefined') return indexable(globalThis);
    if (typeof self !== 'undefined') return indexable(self);
    if (typeof window !== 'undefined') return indexable(window);
    if (typeof global !== 'undefined') return indexable(global);
    throw new Error('unable to locate global object');
  }
  function unwrap(val) {
    if (val === null || val === undefined) throw new Error("Expected value to be present");
    return val;
  }

  var resetTrackingTransaction;
  var assertTagNotConsumed;

  var _markTagAsConsumed;

  if (env.DEBUG) {
    var CONSUMED_TAGS = null;
    var TRANSACTION_STACK = []; /////////

    var TRANSACTION_ENV = {
      assert: function assert(message) {
        throw new Error(message);
      },
      deprecate: function deprecate(message) {
        console.warn(message);
      },
      debugMessage: function debugMessage(obj, keyName) {
        var objName;

        if (typeof obj === 'function') {
          objName = obj.name;
        } else if (typeof obj === 'object' && obj !== null) {
          var className = obj.constructor && obj.constructor.name || '(unknown class)';
          objName = "(an instance of " + className + ")";
        } else if (obj === undefined) {
          objName = '(an unknown tag)';
        } else {
          objName = String(obj);
        }

        var dirtyString = keyName ? "`" + keyName + "` on `" + objName + "`" : "`" + objName + "`";
        return "You attempted to update " + dirtyString + ", but it had already been used previously in the same computation.  Attempting to update a value after using it in a computation can cause logical errors, infinite revalidation bugs, and performance issues, and is not supported.";
      }
    };

    exports.setTrackingTransactionEnv = function setTrackingTransactionEnv(env) {
      return Object.assign(TRANSACTION_ENV, env);
    };

    exports.beginTrackingTransaction = function beginTrackingTransaction(_debugLabel, deprecate) {
      if (deprecate === void 0) {
        deprecate = false;
      }

      CONSUMED_TAGS = CONSUMED_TAGS || new WeakMap();
      var debugLabel = _debugLabel || undefined;
      var parent = TRANSACTION_STACK[TRANSACTION_STACK.length - 1] || null;
      TRANSACTION_STACK.push({
        parent: parent,
        debugLabel: debugLabel,
        deprecate: deprecate
      });
    };

    exports.endTrackingTransaction = function endTrackingTransaction() {
      if (TRANSACTION_STACK.length === 0) {
        throw new Error('attempted to close a tracking transaction, but one was not open');
      }

      TRANSACTION_STACK.pop();

      if (TRANSACTION_STACK.length === 0) {
        CONSUMED_TAGS = null;
      }
    };

    resetTrackingTransaction = function resetTrackingTransaction() {
      var stack = '';

      if (TRANSACTION_STACK.length > 0) {
        stack = exports.logTrackingStack(TRANSACTION_STACK[TRANSACTION_STACK.length - 1]);
      }

      TRANSACTION_STACK = [];
      CONSUMED_TAGS = null;
      return stack;
    };
    /**
     * Creates a global autotracking transaction. This will prevent any backflow
     * in any `track` calls within the transaction, even if they are not
     * externally consumed.
     *
     * `runInAutotrackingTransaction` can be called within itself, and it will add
     * onto the existing transaction if one exists.
     *
     * TODO: Only throw an error if the `track` is consumed.
     */


    exports.runInTrackingTransaction = function runInTrackingTransaction(fn, debugLabel) {
      exports.beginTrackingTransaction(debugLabel);
      var didError = true;

      try {
        var value = fn();
        didError = false;
        return value;
      } finally {
        if (didError !== true) {
          exports.endTrackingTransaction();
        }
      }
    };
    /**
     * Switches to deprecating within an autotracking transaction, if one exists.
     * If `runInAutotrackingTransaction` is called within the callback of this
     * method, it switches back to throwing an error, allowing zebra-striping of
     * the types of errors that are thrown.
     *
     * Does not start an autotracking transaction.
     *
     * NOTE: For Ember usage only, in general you should assert that these
     * invariants are true.
     */


    exports.deprecateMutationsInTrackingTransaction = function deprecateMutationsInTrackingTransaction(fn, debugLabel) {
      exports.beginTrackingTransaction(debugLabel, true);

      try {
        fn();
      } finally {
        exports.endTrackingTransaction();
      }
    };

    var nthIndex = function nthIndex(str, pattern, n, startingPos) {
      if (startingPos === void 0) {
        startingPos = -1;
      }

      var i = startingPos;

      while (n-- > 0 && i++ < str.length) {
        i = str.indexOf(pattern, i);
        if (i < 0) break;
      }

      return i;
    };

    var makeTrackingErrorMessage = function makeTrackingErrorMessage(transaction, obj, keyName) {
      var message = [TRANSACTION_ENV.debugMessage(obj, keyName && String(keyName))];
      message.push("`" + String(keyName) + "` was first used:");
      message.push(exports.logTrackingStack(transaction));
      message.push("Stack trace for the update:");
      return message.join('\n\n');
    };

    exports.logTrackingStack = function logTrackingStack(transaction) {
      var trackingStack = [];
      var current = transaction || TRANSACTION_STACK[TRANSACTION_STACK.length - 1];
      if (current === undefined) return '';

      while (current) {
        if (current.debugLabel) {
          trackingStack.unshift(current.debugLabel);
        }

        current = current.parent;
      } // TODO: Use String.prototype.repeat here once we can drop support for IE11


      return trackingStack.map(function (label, index) {
        return Array(2 * index + 1).join(' ') + label;
      }).join('\n');
    };

    _markTagAsConsumed = function markTagAsConsumed(_tag) {
      if (!CONSUMED_TAGS || CONSUMED_TAGS.has(_tag)) return;
      CONSUMED_TAGS.set(_tag, TRANSACTION_STACK[TRANSACTION_STACK.length - 1]); // We need to mark the tag and all of its subtags as consumed, so we need to
      // cast it and access its internals. In the future this shouldn't be necessary,
      // this is only for computed properties.

      var tag = _tag;

      if (tag.subtag) {
        _markTagAsConsumed(tag.subtag);
      }

      if (tag.subtags) {
        tag.subtags.forEach(function (tag) {
          return _markTagAsConsumed(tag);
        });
      }
    };

    assertTagNotConsumed = function assertTagNotConsumed(tag, obj, keyName) {
      if (CONSUMED_TAGS === null) return;
      var transaction = CONSUMED_TAGS.get(tag);
      if (!transaction) return;
      var currentTransaction = TRANSACTION_STACK[TRANSACTION_STACK.length - 1];

      if (currentTransaction.deprecate) {
        TRANSACTION_ENV.deprecate(makeTrackingErrorMessage(transaction, obj, keyName));
      } else {
        // This hack makes the assertion message nicer, we can cut off the first
        // few lines of the stack trace and let users know where the actual error
        // occurred.
        try {
          TRANSACTION_ENV.assert(makeTrackingErrorMessage(transaction, obj, keyName));
        } catch (e) {
          if (e.stack) {
            var updateStackBegin = e.stack.indexOf('Stack trace for the update:');

            if (updateStackBegin !== -1) {
              var start = nthIndex(e.stack, '\n', 1, updateStackBegin);
              var end = nthIndex(e.stack, '\n', 4, updateStackBegin);
              e.stack = e.stack.substr(0, start) + e.stack.substr(end);
            }
          }

          throw e;
        }
      }
    };
  }

  var CONSTANT = 0;
  var INITIAL = 1;
  var VOLATILE = NaN;
  var $REVISION = INITIAL;
  function bump() {
    $REVISION++;
  } //////////

  var COMPUTE = symbol('TAG_COMPUTE'); //////////

  /**
   * `value` receives a tag and returns an opaque Revision based on that tag. This
   * snapshot can then later be passed to `validate` with the same tag to
   * determine if the tag has changed at all since the time that `value` was
   * called.
   *
   * @param tag
   */

  function valueForTag(tag) {
    return tag[COMPUTE]();
  }
  /**
   * `validate` receives a tag and a snapshot from a previous call to `value` with
   * the same tag, and determines if the tag is still valid compared to the
   * snapshot. If the tag's state has changed at all since then, `validate` will
   * return false, otherwise it will return true. This is used to determine if a
   * calculation related to the tags should be rerun.
   *
   * @param tag
   * @param snapshot
   */

  function validateTag(tag, snapshot) {
    return snapshot >= tag[COMPUTE]();
  }
  var TYPE = symbol('TAG_TYPE'); // this is basically a const

  if (env.DEBUG) {
    exports.ALLOW_CYCLES = new WeakMap();
  }

  function allowsCycles(tag) {
    if (exports.ALLOW_CYCLES === undefined) {
      return true;
    } else {
      return exports.ALLOW_CYCLES.has(tag);
    }
  }

  var MonomorphicTagImpl = /*#__PURE__*/function () {
    function MonomorphicTagImpl(type) {
      this.revision = INITIAL;
      this.lastChecked = INITIAL;
      this.lastValue = INITIAL;
      this.isUpdating = false;
      this.subtag = null;
      this.subtagBufferCache = null;
      this[TYPE] = type;
    }

    MonomorphicTagImpl.combine = function combine(tags) {
      switch (tags.length) {
        case 0:
          return CONSTANT_TAG;

        case 1:
          return tags[0];

        default:
          var tag = new MonomorphicTagImpl(2
          /* Combinator */
          );
          tag.subtag = tags;
          return tag;
      }
    };

    var _proto = MonomorphicTagImpl.prototype;

    _proto[COMPUTE] = function () {
      var lastChecked = this.lastChecked;

      if (this.isUpdating === true) {
        if (env.DEBUG && !allowsCycles(this)) {
          throw new Error('Cycles in tags are not allowed');
        }

        this.lastChecked = ++$REVISION;
      } else if (lastChecked !== $REVISION) {
        this.isUpdating = true;
        this.lastChecked = $REVISION;

        try {
          var subtag = this.subtag,
              revision = this.revision;

          if (subtag !== null) {
            if (Array.isArray(subtag)) {
              for (var i = 0; i < subtag.length; i++) {
                var value = subtag[i][COMPUTE]();
                revision = Math.max(value, revision);
              }
            } else {
              var subtagValue = subtag[COMPUTE]();

              if (subtagValue === this.subtagBufferCache) {
                revision = Math.max(revision, this.lastValue);
              } else {
                // Clear the temporary buffer cache
                this.subtagBufferCache = null;
                revision = Math.max(revision, subtagValue);
              }
            }
          }

          this.lastValue = revision;
        } finally {
          this.isUpdating = false;
        }
      }

      return this.lastValue;
    };

    MonomorphicTagImpl.updateTag = function updateTag(_tag, _subtag) {
      if (env.DEBUG && _tag[TYPE] !== 1
      /* Updatable */
      ) {
          throw new Error('Attempted to update a tag that was not updatable');
        } // TODO: TS 3.7 should allow us to do this via assertion


      var tag = _tag;
      var subtag = _subtag;

      if (subtag === CONSTANT_TAG) {
        tag.subtag = null;
      } else {
        // There are two different possibilities when updating a subtag:
        //
        // 1. subtag[COMPUTE]() <= tag[COMPUTE]();
        // 2. subtag[COMPUTE]() > tag[COMPUTE]();
        //
        // The first possibility is completely fine within our caching model, but
        // the second possibility presents a problem. If the parent tag has
        // already been read, then it's value is cached and will not update to
        // reflect the subtag's greater value. Next time the cache is busted, the
        // subtag's value _will_ be read, and it's value will be _greater_ than
        // the saved snapshot of the parent, causing the resulting calculation to
        // be rerun erroneously.
        //
        // In order to prevent this, when we first update to a new subtag we store
        // its computed value, and then check against that computed value on
        // subsequent updates. If its value hasn't changed, then we return the
        // parent's previous value. Once the subtag changes for the first time,
        // we clear the cache and everything is finally in sync with the parent.
        tag.subtagBufferCache = subtag[COMPUTE]();
        tag.subtag = subtag;
      }
    };

    MonomorphicTagImpl.dirtyTag = function dirtyTag(tag, disableConsumptionAssertion) {
      if (env.DEBUG && !(tag[TYPE] === 1
      /* Updatable */
      || tag[TYPE] === 0
      /* Dirtyable */
      )) {
        throw new Error('Attempted to dirty a tag that was not dirtyable');
      }

      if (env.DEBUG && disableConsumptionAssertion !== true) {
        // Usually by this point, we've already asserted with better error information,
        // but this is our last line of defense.
        unwrap(assertTagNotConsumed)(tag);
      }

      tag.revision = ++$REVISION;
      globalContext.scheduleRevalidate();
    };

    return MonomorphicTagImpl;
  }();

  var DIRTY_TAG = MonomorphicTagImpl.dirtyTag;
  var UPDATE_TAG = MonomorphicTagImpl.updateTag; //////////

  function createTag() {
    return new MonomorphicTagImpl(0
    /* Dirtyable */
    );
  }
  function createUpdatableTag() {
    return new MonomorphicTagImpl(1
    /* Updatable */
    );
  } //////////

  var CONSTANT_TAG = new MonomorphicTagImpl(3
  /* Constant */
  );
  function isConstTag(tag) {
    return tag === CONSTANT_TAG;
  } //////////

  var VolatileTag = /*#__PURE__*/function () {
    function VolatileTag() {}

    var _proto2 = VolatileTag.prototype;

    _proto2[COMPUTE] = function () {
      return VOLATILE;
    };

    return VolatileTag;
  }();
  var VOLATILE_TAG = new VolatileTag(); //////////

  var CurrentTag = /*#__PURE__*/function () {
    function CurrentTag() {}

    var _proto3 = CurrentTag.prototype;

    _proto3[COMPUTE] = function () {
      return $REVISION;
    };

    return CurrentTag;
  }();
  var CURRENT_TAG = new CurrentTag(); //////////

  var combine = MonomorphicTagImpl.combine; // Warm

  var tag1 = createUpdatableTag();
  var tag2 = createUpdatableTag();
  var tag3 = createUpdatableTag();
  valueForTag(tag1);
  DIRTY_TAG(tag1);
  valueForTag(tag1);
  UPDATE_TAG(tag1, combine([tag2, tag3]));
  valueForTag(tag1);
  DIRTY_TAG(tag2);
  valueForTag(tag1);
  DIRTY_TAG(tag3);
  valueForTag(tag1);
  UPDATE_TAG(tag1, tag3);
  valueForTag(tag1);
  DIRTY_TAG(tag3);
  valueForTag(tag1);

  function isObjectLike(u) {
    return typeof u === 'object' && u !== null || typeof u === 'function';
  }

  var TRACKED_TAGS = new WeakMap();
  function dirtyTagFor(obj, key, meta) {
    if (env.DEBUG && !isObjectLike(obj)) {
      throw new Error("BUG: Can't update a tag for a primitive");
    }

    var tags = meta === undefined ? TRACKED_TAGS.get(obj) : meta; // No tags have been setup for this object yet, return

    if (tags === undefined) return; // Dirty the tag for the specific property if it exists

    var propertyTag = tags.get(key);

    if (propertyTag !== undefined) {
      if (env.DEBUG) {
        unwrap(assertTagNotConsumed)(propertyTag, obj, key);
      }

      DIRTY_TAG(propertyTag, true);
    }
  }
  function tagMetaFor(obj) {
    var tags = TRACKED_TAGS.get(obj);

    if (tags === undefined) {
      tags = new Map();
      TRACKED_TAGS.set(obj, tags);
    }

    return tags;
  }
  function tagFor(obj, key, meta) {
    var tags = meta === undefined ? tagMetaFor(obj) : meta;
    var tag = tags.get(key);

    if (tag === undefined) {
      tag = createUpdatableTag();
      tags.set(key, tag);
    }

    return tag;
  }

  /**
   * An object that that tracks @tracked properties that were consumed.
   */

  var Tracker = /*#__PURE__*/function () {
    function Tracker() {
      this.tags = new Set();
      this.last = null;
    }

    var _proto = Tracker.prototype;

    _proto.add = function add(tag) {
      if (tag === CONSTANT_TAG) return;
      this.tags.add(tag);

      if (env.DEBUG) {
        unwrap(_markTagAsConsumed)(tag);
      }

      this.last = tag;
    };

    _proto.combine = function combine$1() {
      var tags = this.tags;

      if (tags.size === 0) {
        return CONSTANT_TAG;
      } else if (tags.size === 1) {
        return this.last;
      } else {
        var tagsArr = [];
        tags.forEach(function (tag) {
          return tagsArr.push(tag);
        });
        return combine(tagsArr);
      }
    };

    return Tracker;
  }();
  /**
   * Whenever a tracked computed property is entered, the current tracker is
   * saved off and a new tracker is replaced.
   *
   * Any tracked properties consumed are added to the current tracker.
   *
   * When a tracked computed property is exited, the tracker's tags are
   * combined and added to the parent tracker.
   *
   * The consequence is that each tracked computed property has a tag
   * that corresponds to the tracked properties consumed inside of
   * itself, including child tracked computed properties.
   */


  var CURRENT_TRACKER = null;
  var OPEN_TRACK_FRAMES = [];
  function beginTrackFrame(debuggingContext) {
    OPEN_TRACK_FRAMES.push(CURRENT_TRACKER);
    CURRENT_TRACKER = new Tracker();

    if (env.DEBUG) {
      unwrap(exports.beginTrackingTransaction)(debuggingContext);
    }
  }
  function endTrackFrame() {
    var current = CURRENT_TRACKER;

    if (env.DEBUG) {
      if (OPEN_TRACK_FRAMES.length === 0) {
        throw new Error('attempted to close a tracking frame, but one was not open');
      }

      unwrap(exports.endTrackingTransaction)();
    }

    CURRENT_TRACKER = OPEN_TRACK_FRAMES.pop() || null;
    return unwrap(current).combine();
  }
  function beginUntrackFrame() {
    OPEN_TRACK_FRAMES.push(CURRENT_TRACKER);
    CURRENT_TRACKER = null;
  }
  function endUntrackFrame() {
    if (env.DEBUG && OPEN_TRACK_FRAMES.length === 0) {
      throw new Error('attempted to close a tracking frame, but one was not open');
    }

    CURRENT_TRACKER = OPEN_TRACK_FRAMES.pop() || null;
  } // This function is only for handling errors and resetting to a valid state

  function resetTracking() {
    while (OPEN_TRACK_FRAMES.length > 0) {
      OPEN_TRACK_FRAMES.pop();
    }

    CURRENT_TRACKER = null;

    if (env.DEBUG) {
      return unwrap(resetTrackingTransaction)();
    }
  }
  function isTracking() {
    return CURRENT_TRACKER !== null;
  }
  function consumeTag(tag) {
    if (CURRENT_TRACKER !== null) {
      CURRENT_TRACKER.add(tag);
    }
  } //////////
  var FN = symbol('FN');
  var LAST_VALUE = symbol('LAST_VALUE');
  var TAG = symbol('TAG');
  var SNAPSHOT = symbol('SNAPSHOT');
  var DEBUG_LABEL = symbol('DEBUG_LABEL');
  function createCache(fn, debuggingLabel) {
    var _cache;

    if (env.DEBUG && !(typeof fn === 'function')) {
      throw new Error("createCache() must be passed a function as its first parameter. Called with: " + String(fn));
    }

    var cache = (_cache = {}, _cache[FN] = fn, _cache[LAST_VALUE] = undefined, _cache[TAG] = undefined, _cache[SNAPSHOT] = -1, _cache);

    if (env.DEBUG) {
      cache[DEBUG_LABEL] = debuggingLabel;
    }

    return cache;
  }
  function getValue(cache) {
    assertCache(cache, 'getValue');
    var fn = cache[FN];
    var tag = cache[TAG];
    var snapshot = cache[SNAPSHOT];

    if (tag === undefined || !validateTag(tag, snapshot)) {
      beginTrackFrame();

      try {
        cache[LAST_VALUE] = fn();
      } finally {
        tag = endTrackFrame();
        cache[TAG] = tag;
        cache[SNAPSHOT] = valueForTag(tag);
        consumeTag(tag);
      }
    } else {
      consumeTag(tag);
    }

    return cache[LAST_VALUE];
  }
  function isConst(cache) {
    assertCache(cache, 'isConst');
    var tag = cache[TAG];
    assertTag(tag, cache);
    return isConstTag(tag);
  }

  function assertCache(value, fnName) {
    if (env.DEBUG && !(typeof value === 'object' && value !== null && FN in value)) {
      throw new Error(fnName + "() can only be used on an instance of a cache created with createCache(). Called with: " + String(value));
    }
  } // replace this with `expect` when we can


  function assertTag(tag, cache) {
    if (env.DEBUG && tag === undefined) {
      throw new Error("isConst() can only be used on a cache once getValue() has been called at least once. Called with cache function:\n\n" + String(cache[FN]));
    }
  } //////////
  // Legacy tracking APIs
  // track() shouldn't be necessary at all in the VM once the autotracking
  // refactors are merged, and we should generally be moving away from it. It may
  // be necessary in Ember for a while longer, but I think we'll be able to drop
  // it in favor of cache sooner rather than later.


  function track(callback, debugLabel) {
    beginTrackFrame(debugLabel);
    var tag;

    try {
      callback();
    } finally {
      tag = endTrackFrame();
    }

    return tag;
  } // untrack() is currently mainly used to handle places that were previously not
  // tracked, and that tracking now would cause backtracking rerender assertions.
  // I think once we move everyone forward onto modern APIs, we'll probably be
  // able to remove it, but I'm not sure yet.

  function untrack(callback) {
    beginUntrackFrame();

    try {
      return callback();
    } finally {
      endUntrackFrame();
    }
  }

  function trackedData(key, initializer) {
    var values = new WeakMap();
    var hasInitializer = typeof initializer === 'function';

    function getter(self) {
      consumeTag(tagFor(self, key));
      var value; // If the field has never been initialized, we should initialize it

      if (hasInitializer && !values.has(self)) {
        value = initializer.call(self);
        values.set(self, value);
      } else {
        value = values.get(self);
      }

      return value;
    }

    function setter(self, value) {
      dirtyTagFor(self, key);
      values.set(self, value);
    }

    return {
      getter: getter,
      setter: setter
    };
  }

  var GLIMMER_VALIDATOR_REGISTRATION = symbolFor('GLIMMER_VALIDATOR_REGISTRATION');
  var globalObj = getGlobal();

  if (globalObj[GLIMMER_VALIDATOR_REGISTRATION] === true) {
    throw new Error('The `@glimmer/validator` library has been included twice in this application. It could be different versions of the package, or the same version included twice by mistake. `@glimmer/validator` depends on having a single copy of the package in use at any time in an application, even if they are the same version. You must dedupe your build to remove the duplicate packages in order to prevent this error.');
  }

  globalObj[GLIMMER_VALIDATOR_REGISTRATION] = true;

  exports.COMPUTE = COMPUTE;
  exports.CONSTANT = CONSTANT;
  exports.CONSTANT_TAG = CONSTANT_TAG;
  exports.CURRENT_TAG = CURRENT_TAG;
  exports.CurrentTag = CurrentTag;
  exports.INITIAL = INITIAL;
  exports.VOLATILE = VOLATILE;
  exports.VOLATILE_TAG = VOLATILE_TAG;
  exports.VolatileTag = VolatileTag;
  exports.beginTrackFrame = beginTrackFrame;
  exports.beginUntrackFrame = beginUntrackFrame;
  exports.bump = bump;
  exports.combine = combine;
  exports.consumeTag = consumeTag;
  exports.createCache = createCache;
  exports.createTag = createTag;
  exports.createUpdatableTag = createUpdatableTag;
  exports.dirtyTag = DIRTY_TAG;
  exports.dirtyTagFor = dirtyTagFor;
  exports.endTrackFrame = endTrackFrame;
  exports.endUntrackFrame = endUntrackFrame;
  exports.getValue = getValue;
  exports.isConst = isConst;
  exports.isConstTag = isConstTag;
  exports.isTracking = isTracking;
  exports.resetTracking = resetTracking;
  exports.tagFor = tagFor;
  exports.tagMetaFor = tagMetaFor;
  exports.track = track;
  exports.trackedData = trackedData;
  exports.untrack = untrack;
  exports.updateTag = UPDATE_TAG;
  exports.validateTag = validateTag;
  exports.valueForTag = valueForTag;

  Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci12YWxpZGF0b3IuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdXRpbHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci92YWxpZGF0b3IvbGliL2RlYnVnLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdmFsaWRhdG9yL2xpYi92YWxpZGF0b3JzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdmFsaWRhdG9yL2xpYi9tZXRhLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdmFsaWRhdG9yL2xpYi90cmFja2luZy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdHJhY2tlZC1kYXRhLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdmFsaWRhdG9yL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFVuaW9uVG9JbnRlcnNlY3Rpb248VT4gPSAoVSBleHRlbmRzIHVua25vd24gPyAoazogVSkgPT4gdm9pZCA6IG5ldmVyKSBleHRlbmRzIChcbiAgazogaW5mZXIgSVxuKSA9PiB2b2lkXG4gID8gSVxuICA6IG5ldmVyO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZXhwb3J0IHR5cGUgQW55S2V5ID0ga2V5b2YgYW55O1xuZXhwb3J0IHR5cGUgSW5kZXhhYmxlID0gUmVjb3JkPEFueUtleSwgdW5rbm93bj47XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhhYmxlPFQgZXh0ZW5kcyBvYmplY3Q+KGlucHV0OiBUKTogVCAmIEluZGV4YWJsZSB7XG4gIHJldHVybiBpbnB1dCBhcyBUICYgSW5kZXhhYmxlO1xufVxuXG4vLyBUaGlzIGlzIGEgZHVwbGljYXRlIHV0aWxpdHkgZnJvbSBAZ2xpbW1lci91dGlsIGJlY2F1c2UgYEBnbGltbWVyL3ZhbGlkYXRvcmBcbi8vIHNob3VsZCBub3QgZGVwZW5kIG9uIGFueSBvdGhlciBAZ2xpbW1lciBwYWNrYWdlcywgaW4gb3JkZXIgdG8gYXZvaWQgcHVsbGluZ1xuLy8gaW4gdHlwZXMgYW5kIHByZXZlbnQgcmVncmVzc2lvbnMgaW4gYEBnbGltbWVyL3RyYWNraW5nYCAod2hpY2ggaGFzIHB1YmxpYyB0eXBlcykuXG5leHBvcnQgY29uc3Qgc3ltYm9sID1cbiAgdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IFN5bWJvbFxuICAgIDogLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIChrZXk6IHN0cmluZykgPT4gYF9fJHtrZXl9JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBEYXRlLm5vdygpKX1fX2AgYXMgYW55O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZXhwb3J0IGNvbnN0IHN5bWJvbEZvcjogKGtleTogc3RyaW5nKSA9PiBhbnkgPVxuICB0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJ1xuICAgID8gU3ltYm9sLmZvclxuICAgIDogKGtleTogc3RyaW5nKSA9PiBgX19HTElNTUVSX1ZBTElEQVRPUl9TWU1CT0xfRk9SXyR7a2V5fWA7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHbG9iYWwoKTogSW5kZXhhYmxlIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vZGUvbm8tdW5zdXBwb3J0ZWQtZmVhdHVyZXMvZXMtYnVpbHRpbnNcbiAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGluZGV4YWJsZShnbG9iYWxUaGlzKTtcbiAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGluZGV4YWJsZShzZWxmKTtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gaW5kZXhhYmxlKHdpbmRvdyk7XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGluZGV4YWJsZShnbG9iYWwpO1xuXG4gIHRocm93IG5ldyBFcnJvcigndW5hYmxlIHRvIGxvY2F0ZSBnbG9iYWwgb2JqZWN0Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXA8VD4odmFsOiBUIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFQge1xuICBpZiAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHZhbHVlIHRvIGJlIHByZXNlbnRgKTtcbiAgcmV0dXJuIHZhbCBhcyBUO1xufVxuIiwiaW1wb3J0IHsgVGFnIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcblxuZXhwb3J0IGxldCBiZWdpblRyYWNraW5nVHJhbnNhY3Rpb246XG4gIHwgdW5kZWZpbmVkXG4gIHwgKChkZWJ1Z2dpbmdDb250ZXh0Pzogc3RyaW5nIHwgZmFsc2UsIGRlcHJlY2F0ZT86IGJvb2xlYW4pID0+IHZvaWQpO1xuZXhwb3J0IGxldCBlbmRUcmFja2luZ1RyYW5zYWN0aW9uOiB1bmRlZmluZWQgfCAoKCkgPT4gdm9pZCk7XG5leHBvcnQgbGV0IHJ1bkluVHJhY2tpbmdUcmFuc2FjdGlvbjpcbiAgfCB1bmRlZmluZWRcbiAgfCAoPFQ+KGZuOiAoKSA9PiBULCBkZWJ1Z2dpbmdDb250ZXh0Pzogc3RyaW5nIHwgZmFsc2UpID0+IFQpO1xuZXhwb3J0IGxldCBkZXByZWNhdGVNdXRhdGlvbnNJblRyYWNraW5nVHJhbnNhY3Rpb246IHVuZGVmaW5lZCB8ICgoZm46ICgpID0+IHZvaWQpID0+IHZvaWQpO1xuXG5leHBvcnQgbGV0IHJlc2V0VHJhY2tpbmdUcmFuc2FjdGlvbjogdW5kZWZpbmVkIHwgKCgpID0+IHN0cmluZyk7XG5leHBvcnQgbGV0IHNldFRyYWNraW5nVHJhbnNhY3Rpb25FbnY6XG4gIHwgdW5kZWZpbmVkXG4gIHwgKChlbnY6IHtcbiAgICAgIGFzc2VydD8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAgICAgIGRlcHJlY2F0ZT8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAgICAgIGRlYnVnTWVzc2FnZT8ob2JqPzogdW5rbm93biwga2V5TmFtZT86IHN0cmluZyk6IHN0cmluZztcbiAgICB9KSA9PiB2b2lkKTtcblxuZXhwb3J0IGxldCBhc3NlcnRUYWdOb3RDb25zdW1lZDpcbiAgfCB1bmRlZmluZWRcbiAgfCAoPFQ+KHRhZzogVGFnLCBvYmo/OiBULCBrZXlOYW1lPzoga2V5b2YgVCB8IHN0cmluZyB8IHN5bWJvbCkgPT4gdm9pZCk7XG5cbmV4cG9ydCBsZXQgbWFya1RhZ0FzQ29uc3VtZWQ6IHVuZGVmaW5lZCB8ICgoX3RhZzogVGFnKSA9PiB2b2lkKTtcblxuZXhwb3J0IGxldCBsb2dUcmFja2luZ1N0YWNrOiB1bmRlZmluZWQgfCAoKHRyYW5zYWN0aW9uPzogVHJhbnNhY3Rpb24pID0+IHN0cmluZyk7XG5cbmludGVyZmFjZSBUcmFuc2FjdGlvbiB7XG4gIHBhcmVudDogVHJhbnNhY3Rpb24gfCBudWxsO1xuICBkZWJ1Z0xhYmVsPzogc3RyaW5nO1xuICBkZXByZWNhdGU6IGJvb2xlYW47XG59XG5cbmlmIChERUJVRykge1xuICBsZXQgQ09OU1VNRURfVEFHUzogV2Vha01hcDxUYWcsIFRyYW5zYWN0aW9uPiB8IG51bGwgPSBudWxsO1xuXG4gIGxldCBUUkFOU0FDVElPTl9TVEFDSzogVHJhbnNhY3Rpb25bXSA9IFtdO1xuXG4gIC8vLy8vLy8vL1xuXG4gIGxldCBUUkFOU0FDVElPTl9FTlYgPSB7XG4gICAgYXNzZXJ0KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH0sXG5cbiAgICBkZXByZWNhdGUobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgfSxcblxuICAgIGRlYnVnTWVzc2FnZShvYmo/OiB1bmtub3duLCBrZXlOYW1lPzogc3RyaW5nKSB7XG4gICAgICBsZXQgb2JqTmFtZTtcblxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgb2JqTmFtZSA9IG9iai5uYW1lO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGwpIHtcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IChvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLm5hbWUpIHx8ICcodW5rbm93biBjbGFzcyknO1xuXG4gICAgICAgIG9iak5hbWUgPSBgKGFuIGluc3RhbmNlIG9mICR7Y2xhc3NOYW1lfSlgO1xuICAgICAgfSBlbHNlIGlmIChvYmogPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvYmpOYW1lID0gJyhhbiB1bmtub3duIHRhZyknO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2JqTmFtZSA9IFN0cmluZyhvYmopO1xuICAgICAgfVxuXG4gICAgICBsZXQgZGlydHlTdHJpbmcgPSBrZXlOYW1lID8gYFxcYCR7a2V5TmFtZX1cXGAgb24gXFxgJHtvYmpOYW1lfVxcYGAgOiBgXFxgJHtvYmpOYW1lfVxcYGA7XG5cbiAgICAgIHJldHVybiBgWW91IGF0dGVtcHRlZCB0byB1cGRhdGUgJHtkaXJ0eVN0cmluZ30sIGJ1dCBpdCBoYWQgYWxyZWFkeSBiZWVuIHVzZWQgcHJldmlvdXNseSBpbiB0aGUgc2FtZSBjb21wdXRhdGlvbi4gIEF0dGVtcHRpbmcgdG8gdXBkYXRlIGEgdmFsdWUgYWZ0ZXIgdXNpbmcgaXQgaW4gYSBjb21wdXRhdGlvbiBjYW4gY2F1c2UgbG9naWNhbCBlcnJvcnMsIGluZmluaXRlIHJldmFsaWRhdGlvbiBidWdzLCBhbmQgcGVyZm9ybWFuY2UgaXNzdWVzLCBhbmQgaXMgbm90IHN1cHBvcnRlZC5gO1xuICAgIH0sXG4gIH07XG5cbiAgc2V0VHJhY2tpbmdUcmFuc2FjdGlvbkVudiA9IChlbnYpID0+IE9iamVjdC5hc3NpZ24oVFJBTlNBQ1RJT05fRU5WLCBlbnYpO1xuXG4gIGJlZ2luVHJhY2tpbmdUcmFuc2FjdGlvbiA9IChfZGVidWdMYWJlbD86IHN0cmluZyB8IGZhbHNlLCBkZXByZWNhdGUgPSBmYWxzZSkgPT4ge1xuICAgIENPTlNVTUVEX1RBR1MgPSBDT05TVU1FRF9UQUdTIHx8IG5ldyBXZWFrTWFwKCk7XG5cbiAgICBsZXQgZGVidWdMYWJlbCA9IF9kZWJ1Z0xhYmVsIHx8IHVuZGVmaW5lZDtcblxuICAgIGxldCBwYXJlbnQgPSBUUkFOU0FDVElPTl9TVEFDS1tUUkFOU0FDVElPTl9TVEFDSy5sZW5ndGggLSAxXSB8fCBudWxsO1xuXG4gICAgVFJBTlNBQ1RJT05fU1RBQ0sucHVzaCh7XG4gICAgICBwYXJlbnQsXG4gICAgICBkZWJ1Z0xhYmVsLFxuICAgICAgZGVwcmVjYXRlLFxuICAgIH0pO1xuICB9O1xuXG4gIGVuZFRyYWNraW5nVHJhbnNhY3Rpb24gPSAoKSA9PiB7XG4gICAgaWYgKFRSQU5TQUNUSU9OX1NUQUNLLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhdHRlbXB0ZWQgdG8gY2xvc2UgYSB0cmFja2luZyB0cmFuc2FjdGlvbiwgYnV0IG9uZSB3YXMgbm90IG9wZW4nKTtcbiAgICB9XG5cbiAgICBUUkFOU0FDVElPTl9TVEFDSy5wb3AoKTtcblxuICAgIGlmIChUUkFOU0FDVElPTl9TVEFDSy5sZW5ndGggPT09IDApIHtcbiAgICAgIENPTlNVTUVEX1RBR1MgPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICByZXNldFRyYWNraW5nVHJhbnNhY3Rpb24gPSAoKSA9PiB7XG4gICAgbGV0IHN0YWNrID0gJyc7XG5cbiAgICBpZiAoVFJBTlNBQ1RJT05fU1RBQ0subGVuZ3RoID4gMCkge1xuICAgICAgc3RhY2sgPSBsb2dUcmFja2luZ1N0YWNrIShUUkFOU0FDVElPTl9TVEFDS1tUUkFOU0FDVElPTl9TVEFDSy5sZW5ndGggLSAxXSk7XG4gICAgfVxuXG4gICAgVFJBTlNBQ1RJT05fU1RBQ0sgPSBbXTtcbiAgICBDT05TVU1FRF9UQUdTID0gbnVsbDtcblxuICAgIHJldHVybiBzdGFjaztcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGdsb2JhbCBhdXRvdHJhY2tpbmcgdHJhbnNhY3Rpb24uIFRoaXMgd2lsbCBwcmV2ZW50IGFueSBiYWNrZmxvd1xuICAgKiBpbiBhbnkgYHRyYWNrYCBjYWxscyB3aXRoaW4gdGhlIHRyYW5zYWN0aW9uLCBldmVuIGlmIHRoZXkgYXJlIG5vdFxuICAgKiBleHRlcm5hbGx5IGNvbnN1bWVkLlxuICAgKlxuICAgKiBgcnVuSW5BdXRvdHJhY2tpbmdUcmFuc2FjdGlvbmAgY2FuIGJlIGNhbGxlZCB3aXRoaW4gaXRzZWxmLCBhbmQgaXQgd2lsbCBhZGRcbiAgICogb250byB0aGUgZXhpc3RpbmcgdHJhbnNhY3Rpb24gaWYgb25lIGV4aXN0cy5cbiAgICpcbiAgICogVE9ETzogT25seSB0aHJvdyBhbiBlcnJvciBpZiB0aGUgYHRyYWNrYCBpcyBjb25zdW1lZC5cbiAgICovXG4gIHJ1bkluVHJhY2tpbmdUcmFuc2FjdGlvbiA9IDxUPihmbjogKCkgPT4gVCwgZGVidWdMYWJlbD86IHN0cmluZyB8IGZhbHNlKSA9PiB7XG4gICAgYmVnaW5UcmFja2luZ1RyYW5zYWN0aW9uIShkZWJ1Z0xhYmVsKTtcbiAgICBsZXQgZGlkRXJyb3IgPSB0cnVlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGxldCB2YWx1ZSA9IGZuKCk7XG4gICAgICBkaWRFcnJvciA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZGlkRXJyb3IgIT09IHRydWUpIHtcbiAgICAgICAgZW5kVHJhY2tpbmdUcmFuc2FjdGlvbiEoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFN3aXRjaGVzIHRvIGRlcHJlY2F0aW5nIHdpdGhpbiBhbiBhdXRvdHJhY2tpbmcgdHJhbnNhY3Rpb24sIGlmIG9uZSBleGlzdHMuXG4gICAqIElmIGBydW5JbkF1dG90cmFja2luZ1RyYW5zYWN0aW9uYCBpcyBjYWxsZWQgd2l0aGluIHRoZSBjYWxsYmFjayBvZiB0aGlzXG4gICAqIG1ldGhvZCwgaXQgc3dpdGNoZXMgYmFjayB0byB0aHJvd2luZyBhbiBlcnJvciwgYWxsb3dpbmcgemVicmEtc3RyaXBpbmcgb2ZcbiAgICogdGhlIHR5cGVzIG9mIGVycm9ycyB0aGF0IGFyZSB0aHJvd24uXG4gICAqXG4gICAqIERvZXMgbm90IHN0YXJ0IGFuIGF1dG90cmFja2luZyB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogTk9URTogRm9yIEVtYmVyIHVzYWdlIG9ubHksIGluIGdlbmVyYWwgeW91IHNob3VsZCBhc3NlcnQgdGhhdCB0aGVzZVxuICAgKiBpbnZhcmlhbnRzIGFyZSB0cnVlLlxuICAgKi9cbiAgZGVwcmVjYXRlTXV0YXRpb25zSW5UcmFja2luZ1RyYW5zYWN0aW9uID0gKGZuOiAoKSA9PiB2b2lkLCBkZWJ1Z0xhYmVsPzogc3RyaW5nIHwgZmFsc2UpID0+IHtcbiAgICBiZWdpblRyYWNraW5nVHJhbnNhY3Rpb24hKGRlYnVnTGFiZWwsIHRydWUpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGVuZFRyYWNraW5nVHJhbnNhY3Rpb24hKCk7XG4gICAgfVxuICB9O1xuXG4gIGxldCBudGhJbmRleCA9IChzdHI6IHN0cmluZywgcGF0dGVybjogc3RyaW5nLCBuOiBudW1iZXIsIHN0YXJ0aW5nUG9zID0gLTEpID0+IHtcbiAgICBsZXQgaSA9IHN0YXJ0aW5nUG9zO1xuXG4gICAgd2hpbGUgKG4tLSA+IDAgJiYgaSsrIDwgc3RyLmxlbmd0aCkge1xuICAgICAgaSA9IHN0ci5pbmRleE9mKHBhdHRlcm4sIGkpO1xuICAgICAgaWYgKGkgPCAwKSBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gaTtcbiAgfTtcblxuICBsZXQgbWFrZVRyYWNraW5nRXJyb3JNZXNzYWdlID0gPFQ+KFxuICAgIHRyYW5zYWN0aW9uOiBUcmFuc2FjdGlvbixcbiAgICBvYmo/OiBULFxuICAgIGtleU5hbWU/OiBrZXlvZiBUIHwgc3RyaW5nIHwgc3ltYm9sXG4gICkgPT4ge1xuICAgIGxldCBtZXNzYWdlID0gW1RSQU5TQUNUSU9OX0VOVi5kZWJ1Z01lc3NhZ2Uob2JqLCBrZXlOYW1lICYmIFN0cmluZyhrZXlOYW1lKSldO1xuXG4gICAgbWVzc2FnZS5wdXNoKGBcXGAke1N0cmluZyhrZXlOYW1lKX1cXGAgd2FzIGZpcnN0IHVzZWQ6YCk7XG5cbiAgICBtZXNzYWdlLnB1c2gobG9nVHJhY2tpbmdTdGFjayEodHJhbnNhY3Rpb24pKTtcblxuICAgIG1lc3NhZ2UucHVzaChgU3RhY2sgdHJhY2UgZm9yIHRoZSB1cGRhdGU6YCk7XG5cbiAgICByZXR1cm4gbWVzc2FnZS5qb2luKCdcXG5cXG4nKTtcbiAgfTtcblxuICBsb2dUcmFja2luZ1N0YWNrID0gKHRyYW5zYWN0aW9uPzogVHJhbnNhY3Rpb24pID0+IHtcbiAgICBsZXQgdHJhY2tpbmdTdGFjayA9IFtdO1xuICAgIGxldCBjdXJyZW50OiBUcmFuc2FjdGlvbiB8IG51bGwgfCB1bmRlZmluZWQgPVxuICAgICAgdHJhbnNhY3Rpb24gfHwgVFJBTlNBQ1RJT05fU1RBQ0tbVFJBTlNBQ1RJT05fU1RBQ0subGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoY3VycmVudCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJyc7XG5cbiAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgaWYgKGN1cnJlbnQuZGVidWdMYWJlbCkge1xuICAgICAgICB0cmFja2luZ1N0YWNrLnVuc2hpZnQoY3VycmVudC5kZWJ1Z0xhYmVsKTtcbiAgICAgIH1cblxuICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFVzZSBTdHJpbmcucHJvdG90eXBlLnJlcGVhdCBoZXJlIG9uY2Ugd2UgY2FuIGRyb3Agc3VwcG9ydCBmb3IgSUUxMVxuICAgIHJldHVybiB0cmFja2luZ1N0YWNrLm1hcCgobGFiZWwsIGluZGV4KSA9PiBBcnJheSgyICogaW5kZXggKyAxKS5qb2luKCcgJykgKyBsYWJlbCkuam9pbignXFxuJyk7XG4gIH07XG5cbiAgbWFya1RhZ0FzQ29uc3VtZWQgPSAoX3RhZzogVGFnKSA9PiB7XG4gICAgaWYgKCFDT05TVU1FRF9UQUdTIHx8IENPTlNVTUVEX1RBR1MuaGFzKF90YWcpKSByZXR1cm47XG5cbiAgICBDT05TVU1FRF9UQUdTLnNldChfdGFnLCBUUkFOU0FDVElPTl9TVEFDS1tUUkFOU0FDVElPTl9TVEFDSy5sZW5ndGggLSAxXSk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIG1hcmsgdGhlIHRhZyBhbmQgYWxsIG9mIGl0cyBzdWJ0YWdzIGFzIGNvbnN1bWVkLCBzbyB3ZSBuZWVkIHRvXG4gICAgLy8gY2FzdCBpdCBhbmQgYWNjZXNzIGl0cyBpbnRlcm5hbHMuIEluIHRoZSBmdXR1cmUgdGhpcyBzaG91bGRuJ3QgYmUgbmVjZXNzYXJ5LFxuICAgIC8vIHRoaXMgaXMgb25seSBmb3IgY29tcHV0ZWQgcHJvcGVydGllcy5cbiAgICBsZXQgdGFnID0gX3RhZyBhcyBhbnk7XG5cbiAgICBpZiAodGFnLnN1YnRhZykge1xuICAgICAgbWFya1RhZ0FzQ29uc3VtZWQhKHRhZy5zdWJ0YWcpO1xuICAgIH1cblxuICAgIGlmICh0YWcuc3VidGFncykge1xuICAgICAgdGFnLnN1YnRhZ3MuZm9yRWFjaCgodGFnOiBUYWcpID0+IG1hcmtUYWdBc0NvbnN1bWVkISh0YWcpKTtcbiAgICB9XG4gIH07XG5cbiAgYXNzZXJ0VGFnTm90Q29uc3VtZWQgPSA8VD4odGFnOiBUYWcsIG9iaj86IFQsIGtleU5hbWU/OiBrZXlvZiBUIHwgc3RyaW5nIHwgc3ltYm9sKSA9PiB7XG4gICAgaWYgKENPTlNVTUVEX1RBR1MgPT09IG51bGwpIHJldHVybjtcblxuICAgIGxldCB0cmFuc2FjdGlvbiA9IENPTlNVTUVEX1RBR1MuZ2V0KHRhZyk7XG5cbiAgICBpZiAoIXRyYW5zYWN0aW9uKSByZXR1cm47XG5cbiAgICBsZXQgY3VycmVudFRyYW5zYWN0aW9uID0gVFJBTlNBQ1RJT05fU1RBQ0tbVFJBTlNBQ1RJT05fU1RBQ0subGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoY3VycmVudFRyYW5zYWN0aW9uLmRlcHJlY2F0ZSkge1xuICAgICAgVFJBTlNBQ1RJT05fRU5WLmRlcHJlY2F0ZShtYWtlVHJhY2tpbmdFcnJvck1lc3NhZ2UodHJhbnNhY3Rpb24sIG9iaiwga2V5TmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGhhY2sgbWFrZXMgdGhlIGFzc2VydGlvbiBtZXNzYWdlIG5pY2VyLCB3ZSBjYW4gY3V0IG9mZiB0aGUgZmlyc3RcbiAgICAgIC8vIGZldyBsaW5lcyBvZiB0aGUgc3RhY2sgdHJhY2UgYW5kIGxldCB1c2VycyBrbm93IHdoZXJlIHRoZSBhY3R1YWwgZXJyb3JcbiAgICAgIC8vIG9jY3VycmVkLlxuICAgICAgdHJ5IHtcbiAgICAgICAgVFJBTlNBQ1RJT05fRU5WLmFzc2VydChtYWtlVHJhY2tpbmdFcnJvck1lc3NhZ2UodHJhbnNhY3Rpb24sIG9iaiwga2V5TmFtZSkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5zdGFjaykge1xuICAgICAgICAgIGxldCB1cGRhdGVTdGFja0JlZ2luID0gZS5zdGFjay5pbmRleE9mKCdTdGFjayB0cmFjZSBmb3IgdGhlIHVwZGF0ZTonKTtcblxuICAgICAgICAgIGlmICh1cGRhdGVTdGFja0JlZ2luICE9PSAtMSkge1xuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gbnRoSW5kZXgoZS5zdGFjaywgJ1xcbicsIDEsIHVwZGF0ZVN0YWNrQmVnaW4pO1xuICAgICAgICAgICAgbGV0IGVuZCA9IG50aEluZGV4KGUuc3RhY2ssICdcXG4nLCA0LCB1cGRhdGVTdGFja0JlZ2luKTtcbiAgICAgICAgICAgIGUuc3RhY2sgPSBlLnN0YWNrLnN1YnN0cigwLCBzdGFydCkgKyBlLnN0YWNrLnN1YnN0cihlbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuIiwiaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9lbnYnO1xuaW1wb3J0IHsgc2NoZWR1bGVSZXZhbGlkYXRlIH0gZnJvbSAnQGdsaW1tZXIvZ2xvYmFsLWNvbnRleHQnO1xuaW1wb3J0IHsgc3ltYm9sLCB1bndyYXAgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGFzc2VydFRhZ05vdENvbnN1bWVkIH0gZnJvbSAnLi9kZWJ1Zyc7XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IHR5cGUgUmV2aXNpb24gPSBudW1iZXI7XG5cbmV4cG9ydCBjb25zdCBDT05TVEFOVDogUmV2aXNpb24gPSAwO1xuZXhwb3J0IGNvbnN0IElOSVRJQUw6IFJldmlzaW9uID0gMTtcbmV4cG9ydCBjb25zdCBWT0xBVElMRTogUmV2aXNpb24gPSBOYU47XG5cbmxldCAkUkVWSVNJT04gPSBJTklUSUFMO1xuXG5leHBvcnQgZnVuY3Rpb24gYnVtcCgpOiB2b2lkIHtcbiAgJFJFVklTSU9OKys7XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNvbnN0IENPTVBVVEU6IHVuaXF1ZSBzeW1ib2wgPSBzeW1ib2woJ1RBR19DT01QVVRFJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5VGFnPFQ+IHtcbiAgW0NPTVBVVEVdKCk6IFQ7XG59XG5cbmV4cG9ydCB0eXBlIFRhZyA9IEVudGl0eVRhZzxSZXZpc2lvbj47XG5cbi8vLy8vLy8vLy9cblxuLyoqXG4gKiBgdmFsdWVgIHJlY2VpdmVzIGEgdGFnIGFuZCByZXR1cm5zIGFuIG9wYXF1ZSBSZXZpc2lvbiBiYXNlZCBvbiB0aGF0IHRhZy4gVGhpc1xuICogc25hcHNob3QgY2FuIHRoZW4gbGF0ZXIgYmUgcGFzc2VkIHRvIGB2YWxpZGF0ZWAgd2l0aCB0aGUgc2FtZSB0YWcgdG9cbiAqIGRldGVybWluZSBpZiB0aGUgdGFnIGhhcyBjaGFuZ2VkIGF0IGFsbCBzaW5jZSB0aGUgdGltZSB0aGF0IGB2YWx1ZWAgd2FzXG4gKiBjYWxsZWQuXG4gKlxuICogQHBhcmFtIHRhZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsdWVGb3JUYWcodGFnOiBUYWcpOiBSZXZpc2lvbiB7XG4gIHJldHVybiB0YWdbQ09NUFVURV0oKTtcbn1cblxuLyoqXG4gKiBgdmFsaWRhdGVgIHJlY2VpdmVzIGEgdGFnIGFuZCBhIHNuYXBzaG90IGZyb20gYSBwcmV2aW91cyBjYWxsIHRvIGB2YWx1ZWAgd2l0aFxuICogdGhlIHNhbWUgdGFnLCBhbmQgZGV0ZXJtaW5lcyBpZiB0aGUgdGFnIGlzIHN0aWxsIHZhbGlkIGNvbXBhcmVkIHRvIHRoZVxuICogc25hcHNob3QuIElmIHRoZSB0YWcncyBzdGF0ZSBoYXMgY2hhbmdlZCBhdCBhbGwgc2luY2UgdGhlbiwgYHZhbGlkYXRlYCB3aWxsXG4gKiByZXR1cm4gZmFsc2UsIG90aGVyd2lzZSBpdCB3aWxsIHJldHVybiB0cnVlLiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIGFcbiAqIGNhbGN1bGF0aW9uIHJlbGF0ZWQgdG8gdGhlIHRhZ3Mgc2hvdWxkIGJlIHJlcnVuLlxuICpcbiAqIEBwYXJhbSB0YWdcbiAqIEBwYXJhbSBzbmFwc2hvdFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVUYWcodGFnOiBUYWcsIHNuYXBzaG90OiBSZXZpc2lvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gc25hcHNob3QgPj0gdGFnW0NPTVBVVEVdKCk7XG59XG5cbi8vLy8vLy8vLy9cblxuLyoqXG4gKiBUaGlzIGVudW0gcmVwcmVzZW50cyBhbGwgb2YgdGhlIHBvc3NpYmxlIHRhZyB0eXBlcyBmb3IgdGhlIG1vbm9tb3JwaGljIHRhZyBjbGFzcy5cbiAqIE90aGVyIGN1c3RvbSB0YWcgY2xhc3NlcyBjYW4gZXhpc3QsIHN1Y2ggYXMgQ3VycmVudFRhZyBhbmQgVm9sYXRpbGVUYWcsIGJ1dCBmb3JcbiAqIHBlcmZvcm1hbmNlIHJlYXNvbnMsIGFueSB0eXBlIG9mIHRhZyB0aGF0IGlzIG1lYW50IHRvIGJlIHVzZWQgZnJlcXVlbnRseSBzaG91bGRcbiAqIGJlIGFkZGVkIHRvIHRoZSBtb25vbW9ycGhpYyB0YWcuXG4gKi9cbmNvbnN0IGVudW0gTW9ub21vcnBoaWNUYWdUeXBlcyB7XG4gIERpcnR5YWJsZSxcbiAgVXBkYXRhYmxlLFxuICBDb21iaW5hdG9yLFxuICBDb25zdGFudCxcbn1cblxuY29uc3QgVFlQRTogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnVEFHX1RZUEUnKTtcblxuLy8gdGhpcyBpcyBiYXNpY2FsbHkgYSBjb25zdFxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuZXhwb3J0IGxldCBBTExPV19DWUNMRVM6IFdlYWtNYXA8VGFnLCBib29sZWFuPiB8IHVuZGVmaW5lZDtcblxuaWYgKERFQlVHKSB7XG4gIEFMTE9XX0NZQ0xFUyA9IG5ldyBXZWFrTWFwKCk7XG59XG5cbmZ1bmN0aW9uIGFsbG93c0N5Y2xlcyh0YWc6IFRhZyk6IGJvb2xlYW4ge1xuICBpZiAoQUxMT1dfQ1lDTEVTID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gQUxMT1dfQ1lDTEVTLmhhcyh0YWcpO1xuICB9XG59XG5cbmludGVyZmFjZSBNb25vbW9ycGhpY1RhZ0Jhc2U8VCBleHRlbmRzIE1vbm9tb3JwaGljVGFnVHlwZXM+IGV4dGVuZHMgVGFnIHtcbiAgW1RZUEVdOiBUO1xufVxuXG5leHBvcnQgdHlwZSBEaXJ0eWFibGVUYWcgPSBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5EaXJ0eWFibGU+O1xuZXhwb3J0IHR5cGUgVXBkYXRhYmxlVGFnID0gTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlPjtcbmV4cG9ydCB0eXBlIENvbWJpbmF0b3JUYWcgPSBNb25vbW9ycGhpY1RhZ0Jhc2U8TW9ub21vcnBoaWNUYWdUeXBlcy5Db21iaW5hdG9yPjtcbmV4cG9ydCB0eXBlIENvbnN0YW50VGFnID0gTW9ub21vcnBoaWNUYWdCYXNlPE1vbm9tb3JwaGljVGFnVHlwZXMuQ29uc3RhbnQ+O1xuXG5jbGFzcyBNb25vbW9ycGhpY1RhZ0ltcGw8VCBleHRlbmRzIE1vbm9tb3JwaGljVGFnVHlwZXMgPSBNb25vbW9ycGhpY1RhZ1R5cGVzPiB7XG4gIHN0YXRpYyBjb21iaW5lKHRhZ3M6IFRhZ1tdKTogVGFnIHtcbiAgICBzd2l0Y2ggKHRhZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiBDT05TVEFOVF9UQUc7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiB0YWdzWzBdO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGV0IHRhZzogTW9ub21vcnBoaWNUYWdJbXBsID0gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLkNvbWJpbmF0b3IpO1xuICAgICAgICB0YWcuc3VidGFnID0gdGFncztcbiAgICAgICAgcmV0dXJuIHRhZztcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSByZXZpc2lvbiA9IElOSVRJQUw7XG4gIHByaXZhdGUgbGFzdENoZWNrZWQgPSBJTklUSUFMO1xuICBwcml2YXRlIGxhc3RWYWx1ZSA9IElOSVRJQUw7XG5cbiAgcHJpdmF0ZSBpc1VwZGF0aW5nID0gZmFsc2U7XG4gIHByaXZhdGUgc3VidGFnOiBUYWcgfCBUYWdbXSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHN1YnRhZ0J1ZmZlckNhY2hlOiBSZXZpc2lvbiB8IG51bGwgPSBudWxsO1xuXG4gIFtUWVBFXTogVDtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBUKSB7XG4gICAgdGhpc1tUWVBFXSA9IHR5cGU7XG4gIH1cblxuICBbQ09NUFVURV0oKTogUmV2aXNpb24ge1xuICAgIGxldCB7IGxhc3RDaGVja2VkIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuaXNVcGRhdGluZyA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKERFQlVHICYmICFhbGxvd3NDeWNsZXModGhpcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDeWNsZXMgaW4gdGFncyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sYXN0Q2hlY2tlZCA9ICsrJFJFVklTSU9OO1xuICAgIH0gZWxzZSBpZiAobGFzdENoZWNrZWQgIT09ICRSRVZJU0lPTikge1xuICAgICAgdGhpcy5pc1VwZGF0aW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMubGFzdENoZWNrZWQgPSAkUkVWSVNJT047XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCB7IHN1YnRhZywgcmV2aXNpb24gfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHN1YnRhZyAhPT0gbnVsbCkge1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHN1YnRhZykpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VidGFnLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGxldCB2YWx1ZSA9IHN1YnRhZ1tpXVtDT01QVVRFXSgpO1xuICAgICAgICAgICAgICByZXZpc2lvbiA9IE1hdGgubWF4KHZhbHVlLCByZXZpc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBzdWJ0YWdWYWx1ZSA9IHN1YnRhZ1tDT01QVVRFXSgpO1xuXG4gICAgICAgICAgICBpZiAoc3VidGFnVmFsdWUgPT09IHRoaXMuc3VidGFnQnVmZmVyQ2FjaGUpIHtcbiAgICAgICAgICAgICAgcmV2aXNpb24gPSBNYXRoLm1heChyZXZpc2lvbiwgdGhpcy5sYXN0VmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIHRlbXBvcmFyeSBidWZmZXIgY2FjaGVcbiAgICAgICAgICAgICAgdGhpcy5zdWJ0YWdCdWZmZXJDYWNoZSA9IG51bGw7XG4gICAgICAgICAgICAgIHJldmlzaW9uID0gTWF0aC5tYXgocmV2aXNpb24sIHN1YnRhZ1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxhc3RWYWx1ZSA9IHJldmlzaW9uO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5pc1VwZGF0aW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdFZhbHVlO1xuICB9XG5cbiAgc3RhdGljIHVwZGF0ZVRhZyhfdGFnOiBVcGRhdGFibGVUYWcsIF9zdWJ0YWc6IFRhZykge1xuICAgIGlmIChERUJVRyAmJiBfdGFnW1RZUEVdICE9PSBNb25vbW9ycGhpY1RhZ1R5cGVzLlVwZGF0YWJsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0ZWQgdG8gdXBkYXRlIGEgdGFnIHRoYXQgd2FzIG5vdCB1cGRhdGFibGUnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBUUyAzLjcgc2hvdWxkIGFsbG93IHVzIHRvIGRvIHRoaXMgdmlhIGFzc2VydGlvblxuICAgIGxldCB0YWcgPSBfdGFnIGFzIE1vbm9tb3JwaGljVGFnSW1wbDtcbiAgICBsZXQgc3VidGFnID0gX3N1YnRhZyBhcyBNb25vbW9ycGhpY1RhZ0ltcGw7XG5cbiAgICBpZiAoc3VidGFnID09PSBDT05TVEFOVF9UQUcpIHtcbiAgICAgIHRhZy5zdWJ0YWcgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGVyZSBhcmUgdHdvIGRpZmZlcmVudCBwb3NzaWJpbGl0aWVzIHdoZW4gdXBkYXRpbmcgYSBzdWJ0YWc6XG4gICAgICAvL1xuICAgICAgLy8gMS4gc3VidGFnW0NPTVBVVEVdKCkgPD0gdGFnW0NPTVBVVEVdKCk7XG4gICAgICAvLyAyLiBzdWJ0YWdbQ09NUFVURV0oKSA+IHRhZ1tDT01QVVRFXSgpO1xuICAgICAgLy9cbiAgICAgIC8vIFRoZSBmaXJzdCBwb3NzaWJpbGl0eSBpcyBjb21wbGV0ZWx5IGZpbmUgd2l0aGluIG91ciBjYWNoaW5nIG1vZGVsLCBidXRcbiAgICAgIC8vIHRoZSBzZWNvbmQgcG9zc2liaWxpdHkgcHJlc2VudHMgYSBwcm9ibGVtLiBJZiB0aGUgcGFyZW50IHRhZyBoYXNcbiAgICAgIC8vIGFscmVhZHkgYmVlbiByZWFkLCB0aGVuIGl0J3MgdmFsdWUgaXMgY2FjaGVkIGFuZCB3aWxsIG5vdCB1cGRhdGUgdG9cbiAgICAgIC8vIHJlZmxlY3QgdGhlIHN1YnRhZydzIGdyZWF0ZXIgdmFsdWUuIE5leHQgdGltZSB0aGUgY2FjaGUgaXMgYnVzdGVkLCB0aGVcbiAgICAgIC8vIHN1YnRhZydzIHZhbHVlIF93aWxsXyBiZSByZWFkLCBhbmQgaXQncyB2YWx1ZSB3aWxsIGJlIF9ncmVhdGVyXyB0aGFuXG4gICAgICAvLyB0aGUgc2F2ZWQgc25hcHNob3Qgb2YgdGhlIHBhcmVudCwgY2F1c2luZyB0aGUgcmVzdWx0aW5nIGNhbGN1bGF0aW9uIHRvXG4gICAgICAvLyBiZSByZXJ1biBlcnJvbmVvdXNseS5cbiAgICAgIC8vXG4gICAgICAvLyBJbiBvcmRlciB0byBwcmV2ZW50IHRoaXMsIHdoZW4gd2UgZmlyc3QgdXBkYXRlIHRvIGEgbmV3IHN1YnRhZyB3ZSBzdG9yZVxuICAgICAgLy8gaXRzIGNvbXB1dGVkIHZhbHVlLCBhbmQgdGhlbiBjaGVjayBhZ2FpbnN0IHRoYXQgY29tcHV0ZWQgdmFsdWUgb25cbiAgICAgIC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4gSWYgaXRzIHZhbHVlIGhhc24ndCBjaGFuZ2VkLCB0aGVuIHdlIHJldHVybiB0aGVcbiAgICAgIC8vIHBhcmVudCdzIHByZXZpb3VzIHZhbHVlLiBPbmNlIHRoZSBzdWJ0YWcgY2hhbmdlcyBmb3IgdGhlIGZpcnN0IHRpbWUsXG4gICAgICAvLyB3ZSBjbGVhciB0aGUgY2FjaGUgYW5kIGV2ZXJ5dGhpbmcgaXMgZmluYWxseSBpbiBzeW5jIHdpdGggdGhlIHBhcmVudC5cbiAgICAgIHRhZy5zdWJ0YWdCdWZmZXJDYWNoZSA9IHN1YnRhZ1tDT01QVVRFXSgpO1xuICAgICAgdGFnLnN1YnRhZyA9IHN1YnRhZztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZGlydHlUYWcodGFnOiBEaXJ0eWFibGVUYWcgfCBVcGRhdGFibGVUYWcsIGRpc2FibGVDb25zdW1wdGlvbkFzc2VydGlvbj86IGJvb2xlYW4pIHtcbiAgICBpZiAoXG4gICAgICBERUJVRyAmJlxuICAgICAgISh0YWdbVFlQRV0gPT09IE1vbm9tb3JwaGljVGFnVHlwZXMuVXBkYXRhYmxlIHx8IHRhZ1tUWVBFXSA9PT0gTW9ub21vcnBoaWNUYWdUeXBlcy5EaXJ0eWFibGUpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byBkaXJ0eSBhIHRhZyB0aGF0IHdhcyBub3QgZGlydHlhYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKERFQlVHICYmIGRpc2FibGVDb25zdW1wdGlvbkFzc2VydGlvbiAhPT0gdHJ1ZSkge1xuICAgICAgLy8gVXN1YWxseSBieSB0aGlzIHBvaW50LCB3ZSd2ZSBhbHJlYWR5IGFzc2VydGVkIHdpdGggYmV0dGVyIGVycm9yIGluZm9ybWF0aW9uLFxuICAgICAgLy8gYnV0IHRoaXMgaXMgb3VyIGxhc3QgbGluZSBvZiBkZWZlbnNlLlxuICAgICAgdW53cmFwKGFzc2VydFRhZ05vdENvbnN1bWVkKSh0YWcpO1xuICAgIH1cblxuICAgICh0YWcgYXMgTW9ub21vcnBoaWNUYWdJbXBsKS5yZXZpc2lvbiA9ICsrJFJFVklTSU9OO1xuXG4gICAgc2NoZWR1bGVSZXZhbGlkYXRlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IERJUlRZX1RBRyA9IE1vbm9tb3JwaGljVGFnSW1wbC5kaXJ0eVRhZztcbmV4cG9ydCBjb25zdCBVUERBVEVfVEFHID0gTW9ub21vcnBoaWNUYWdJbXBsLnVwZGF0ZVRhZztcblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGFnKCk6IERpcnR5YWJsZVRhZyB7XG4gIHJldHVybiBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuRGlydHlhYmxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVwZGF0YWJsZVRhZygpOiBVcGRhdGFibGVUYWcge1xuICByZXR1cm4gbmV3IE1vbm9tb3JwaGljVGFnSW1wbChNb25vbW9ycGhpY1RhZ1R5cGVzLlVwZGF0YWJsZSk7XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNvbnN0IENPTlNUQU5UX1RBRzogQ29uc3RhbnRUYWcgPSBuZXcgTW9ub21vcnBoaWNUYWdJbXBsKE1vbm9tb3JwaGljVGFnVHlwZXMuQ29uc3RhbnQpO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdFRhZyh0YWc6IFRhZyk6IHRhZyBpcyBDb25zdGFudFRhZyB7XG4gIHJldHVybiB0YWcgPT09IENPTlNUQU5UX1RBRztcbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY2xhc3MgVm9sYXRpbGVUYWcgaW1wbGVtZW50cyBUYWcge1xuICBbQ09NUFVURV0oKTogUmV2aXNpb24ge1xuICAgIHJldHVybiBWT0xBVElMRTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVk9MQVRJTEVfVEFHID0gbmV3IFZvbGF0aWxlVGFnKCk7XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNsYXNzIEN1cnJlbnRUYWcgaW1wbGVtZW50cyBDdXJyZW50VGFnIHtcbiAgW0NPTVBVVEVdKCk6IFJldmlzaW9uIHtcbiAgICByZXR1cm4gJFJFVklTSU9OO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBDVVJSRU5UX1RBRyA9IG5ldyBDdXJyZW50VGFnKCk7XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNvbnN0IGNvbWJpbmUgPSBNb25vbW9ycGhpY1RhZ0ltcGwuY29tYmluZTtcblxuLy8gV2FybVxuXG5sZXQgdGFnMSA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xubGV0IHRhZzIgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcbmxldCB0YWczID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG5cbnZhbHVlRm9yVGFnKHRhZzEpO1xuRElSVFlfVEFHKHRhZzEpO1xudmFsdWVGb3JUYWcodGFnMSk7XG5VUERBVEVfVEFHKHRhZzEsIGNvbWJpbmUoW3RhZzIsIHRhZzNdKSk7XG52YWx1ZUZvclRhZyh0YWcxKTtcbkRJUlRZX1RBRyh0YWcyKTtcbnZhbHVlRm9yVGFnKHRhZzEpO1xuRElSVFlfVEFHKHRhZzMpO1xudmFsdWVGb3JUYWcodGFnMSk7XG5VUERBVEVfVEFHKHRhZzEsIHRhZzMpO1xudmFsdWVGb3JUYWcodGFnMSk7XG5ESVJUWV9UQUcodGFnMyk7XG52YWx1ZUZvclRhZyh0YWcxKTtcbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcbmltcG9ydCB7IERJUlRZX1RBRywgY3JlYXRlVXBkYXRhYmxlVGFnLCBVcGRhdGFibGVUYWcsIENvbnN0YW50VGFnIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IGFzc2VydFRhZ05vdENvbnN1bWVkIH0gZnJvbSAnLi9kZWJ1Zyc7XG5pbXBvcnQgeyBJbmRleGFibGUsIHVud3JhcCB9IGZyb20gJy4vdXRpbHMnO1xuXG5mdW5jdGlvbiBpc09iamVjdExpa2U8VD4odTogVCk6IHUgaXMgSW5kZXhhYmxlICYgVCB7XG4gIHJldHVybiAodHlwZW9mIHUgPT09ICdvYmplY3QnICYmIHUgIT09IG51bGwpIHx8IHR5cGVvZiB1ID09PSAnZnVuY3Rpb24nO1xufVxuXG4vLy8vLy8vLy8vL1xuXG5leHBvcnQgdHlwZSBUYWdNZXRhID0gTWFwPFByb3BlcnR5S2V5LCBVcGRhdGFibGVUYWc+O1xuXG5jb25zdCBUUkFDS0VEX1RBR1MgPSBuZXcgV2Vha01hcDxvYmplY3QsIFRhZ01ldGE+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXJ0eVRhZ0ZvcjxUIGV4dGVuZHMgb2JqZWN0PihcbiAgb2JqOiBULFxuICBrZXk6IGtleW9mIFQgfCBzdHJpbmcgfCBzeW1ib2wsXG4gIG1ldGE/OiBUYWdNZXRhXG4pOiB2b2lkIHtcbiAgaWYgKERFQlVHICYmICFpc09iamVjdExpa2Uob2JqKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQlVHOiBDYW4ndCB1cGRhdGUgYSB0YWcgZm9yIGEgcHJpbWl0aXZlYCk7XG4gIH1cblxuICBsZXQgdGFncyA9IG1ldGEgPT09IHVuZGVmaW5lZCA/IFRSQUNLRURfVEFHUy5nZXQob2JqKSA6IG1ldGE7XG5cbiAgLy8gTm8gdGFncyBoYXZlIGJlZW4gc2V0dXAgZm9yIHRoaXMgb2JqZWN0IHlldCwgcmV0dXJuXG4gIGlmICh0YWdzID09PSB1bmRlZmluZWQpIHJldHVybjtcblxuICAvLyBEaXJ0eSB0aGUgdGFnIGZvciB0aGUgc3BlY2lmaWMgcHJvcGVydHkgaWYgaXQgZXhpc3RzXG4gIGxldCBwcm9wZXJ0eVRhZyA9IHRhZ3MuZ2V0KGtleSk7XG5cbiAgaWYgKHByb3BlcnR5VGFnICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIHVud3JhcChhc3NlcnRUYWdOb3RDb25zdW1lZCkocHJvcGVydHlUYWcsIG9iaiwga2V5KTtcbiAgICB9XG5cbiAgICBESVJUWV9UQUcocHJvcGVydHlUYWcsIHRydWUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWdNZXRhRm9yKG9iajogb2JqZWN0KTogVGFnTWV0YSB7XG4gIGxldCB0YWdzID0gVFJBQ0tFRF9UQUdTLmdldChvYmopO1xuXG4gIGlmICh0YWdzID09PSB1bmRlZmluZWQpIHtcbiAgICB0YWdzID0gbmV3IE1hcCgpO1xuXG4gICAgVFJBQ0tFRF9UQUdTLnNldChvYmosIHRhZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRhZ3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWdGb3I8VCBleHRlbmRzIG9iamVjdD4oXG4gIG9iajogVCxcbiAga2V5OiBrZXlvZiBUIHwgc3RyaW5nIHwgc3ltYm9sLFxuICBtZXRhPzogVGFnTWV0YVxuKTogVXBkYXRhYmxlVGFnIHwgQ29uc3RhbnRUYWcge1xuICBsZXQgdGFncyA9IG1ldGEgPT09IHVuZGVmaW5lZCA/IHRhZ01ldGFGb3Iob2JqKSA6IG1ldGE7XG4gIGxldCB0YWcgPSB0YWdzLmdldChrZXkpO1xuXG4gIGlmICh0YWcgPT09IHVuZGVmaW5lZCkge1xuICAgIHRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xuICAgIHRhZ3Muc2V0KGtleSwgdGFnKTtcbiAgfVxuXG4gIHJldHVybiB0YWc7XG59XG4iLCJpbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2Vudic7XG5pbXBvcnQge1xuICBUYWcsXG4gIENPTlNUQU5UX1RBRyxcbiAgdmFsaWRhdGVUYWcsXG4gIFJldmlzaW9uLFxuICB2YWx1ZUZvclRhZyxcbiAgaXNDb25zdFRhZyxcbiAgY29tYmluZSxcbn0gZnJvbSAnLi92YWxpZGF0b3JzJztcblxuaW1wb3J0IHtcbiAgbWFya1RhZ0FzQ29uc3VtZWQsXG4gIGJlZ2luVHJhY2tpbmdUcmFuc2FjdGlvbixcbiAgZW5kVHJhY2tpbmdUcmFuc2FjdGlvbixcbiAgcmVzZXRUcmFja2luZ1RyYW5zYWN0aW9uLFxufSBmcm9tICcuL2RlYnVnJztcbmltcG9ydCB7IHN5bWJvbCwgdW53cmFwIH0gZnJvbSAnLi91dGlscyc7XG5cbnR5cGUgT3B0aW9uPFQ+ID0gVCB8IG51bGw7XG5cbi8qKlxuICogQW4gb2JqZWN0IHRoYXQgdGhhdCB0cmFja3MgQHRyYWNrZWQgcHJvcGVydGllcyB0aGF0IHdlcmUgY29uc3VtZWQuXG4gKi9cbmNsYXNzIFRyYWNrZXIge1xuICBwcml2YXRlIHRhZ3MgPSBuZXcgU2V0PFRhZz4oKTtcbiAgcHJpdmF0ZSBsYXN0OiBPcHRpb248VGFnPiA9IG51bGw7XG5cbiAgYWRkKHRhZzogVGFnKSB7XG4gICAgaWYgKHRhZyA9PT0gQ09OU1RBTlRfVEFHKSByZXR1cm47XG5cbiAgICB0aGlzLnRhZ3MuYWRkKHRhZyk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIHVud3JhcChtYXJrVGFnQXNDb25zdW1lZCkodGFnKTtcbiAgICB9XG5cbiAgICB0aGlzLmxhc3QgPSB0YWc7XG4gIH1cblxuICBjb21iaW5lKCk6IFRhZyB7XG4gICAgbGV0IHsgdGFncyB9ID0gdGhpcztcblxuICAgIGlmICh0YWdzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBDT05TVEFOVF9UQUc7XG4gICAgfSBlbHNlIGlmICh0YWdzLnNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiB0aGlzLmxhc3QgYXMgVGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdGFnc0FycjogVGFnW10gPSBbXTtcbiAgICAgIHRhZ3MuZm9yRWFjaCgodGFnKSA9PiB0YWdzQXJyLnB1c2godGFnKSk7XG4gICAgICByZXR1cm4gY29tYmluZSh0YWdzQXJyKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBXaGVuZXZlciBhIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaXMgZW50ZXJlZCwgdGhlIGN1cnJlbnQgdHJhY2tlciBpc1xuICogc2F2ZWQgb2ZmIGFuZCBhIG5ldyB0cmFja2VyIGlzIHJlcGxhY2VkLlxuICpcbiAqIEFueSB0cmFja2VkIHByb3BlcnRpZXMgY29uc3VtZWQgYXJlIGFkZGVkIHRvIHRoZSBjdXJyZW50IHRyYWNrZXIuXG4gKlxuICogV2hlbiBhIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaXMgZXhpdGVkLCB0aGUgdHJhY2tlcidzIHRhZ3MgYXJlXG4gKiBjb21iaW5lZCBhbmQgYWRkZWQgdG8gdGhlIHBhcmVudCB0cmFja2VyLlxuICpcbiAqIFRoZSBjb25zZXF1ZW5jZSBpcyB0aGF0IGVhY2ggdHJhY2tlZCBjb21wdXRlZCBwcm9wZXJ0eSBoYXMgYSB0YWdcbiAqIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHRyYWNrZWQgcHJvcGVydGllcyBjb25zdW1lZCBpbnNpZGUgb2ZcbiAqIGl0c2VsZiwgaW5jbHVkaW5nIGNoaWxkIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydGllcy5cbiAqL1xubGV0IENVUlJFTlRfVFJBQ0tFUjogT3B0aW9uPFRyYWNrZXI+ID0gbnVsbDtcblxuY29uc3QgT1BFTl9UUkFDS19GUkFNRVM6IE9wdGlvbjxUcmFja2VyPltdID0gW107XG5cbmV4cG9ydCBmdW5jdGlvbiBiZWdpblRyYWNrRnJhbWUoZGVidWdnaW5nQ29udGV4dD86IHN0cmluZyB8IGZhbHNlKTogdm9pZCB7XG4gIE9QRU5fVFJBQ0tfRlJBTUVTLnB1c2goQ1VSUkVOVF9UUkFDS0VSKTtcblxuICBDVVJSRU5UX1RSQUNLRVIgPSBuZXcgVHJhY2tlcigpO1xuXG4gIGlmIChERUJVRykge1xuICAgIHVud3JhcChiZWdpblRyYWNraW5nVHJhbnNhY3Rpb24pKGRlYnVnZ2luZ0NvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmRUcmFja0ZyYW1lKCk6IFRhZyB7XG4gIGxldCBjdXJyZW50ID0gQ1VSUkVOVF9UUkFDS0VSO1xuXG4gIGlmIChERUJVRykge1xuICAgIGlmIChPUEVOX1RSQUNLX0ZSQU1FUy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXR0ZW1wdGVkIHRvIGNsb3NlIGEgdHJhY2tpbmcgZnJhbWUsIGJ1dCBvbmUgd2FzIG5vdCBvcGVuJyk7XG4gICAgfVxuXG4gICAgdW53cmFwKGVuZFRyYWNraW5nVHJhbnNhY3Rpb24pKCk7XG4gIH1cblxuICBDVVJSRU5UX1RSQUNLRVIgPSBPUEVOX1RSQUNLX0ZSQU1FUy5wb3AoKSB8fCBudWxsO1xuXG4gIHJldHVybiB1bndyYXAoY3VycmVudCkuY29tYmluZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmVnaW5VbnRyYWNrRnJhbWUoKTogdm9pZCB7XG4gIE9QRU5fVFJBQ0tfRlJBTUVTLnB1c2goQ1VSUkVOVF9UUkFDS0VSKTtcbiAgQ1VSUkVOVF9UUkFDS0VSID0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZFVudHJhY2tGcmFtZSgpOiB2b2lkIHtcbiAgaWYgKERFQlVHICYmIE9QRU5fVFJBQ0tfRlJBTUVTLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYXR0ZW1wdGVkIHRvIGNsb3NlIGEgdHJhY2tpbmcgZnJhbWUsIGJ1dCBvbmUgd2FzIG5vdCBvcGVuJyk7XG4gIH1cblxuICBDVVJSRU5UX1RSQUNLRVIgPSBPUEVOX1RSQUNLX0ZSQU1FUy5wb3AoKSB8fCBudWxsO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgZm9yIGhhbmRsaW5nIGVycm9ycyBhbmQgcmVzZXR0aW5nIHRvIGEgdmFsaWQgc3RhdGVcbmV4cG9ydCBmdW5jdGlvbiByZXNldFRyYWNraW5nKCk6IHN0cmluZyB8IHZvaWQge1xuICB3aGlsZSAoT1BFTl9UUkFDS19GUkFNRVMubGVuZ3RoID4gMCkge1xuICAgIE9QRU5fVFJBQ0tfRlJBTUVTLnBvcCgpO1xuICB9XG5cbiAgQ1VSUkVOVF9UUkFDS0VSID0gbnVsbDtcblxuICBpZiAoREVCVUcpIHtcbiAgICByZXR1cm4gdW53cmFwKHJlc2V0VHJhY2tpbmdUcmFuc2FjdGlvbikoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUcmFja2luZygpOiBib29sZWFuIHtcbiAgcmV0dXJuIENVUlJFTlRfVFJBQ0tFUiAhPT0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVUYWcodGFnOiBUYWcpOiB2b2lkIHtcbiAgaWYgKENVUlJFTlRfVFJBQ0tFUiAhPT0gbnVsbCkge1xuICAgIENVUlJFTlRfVFJBQ0tFUi5hZGQodGFnKTtcbiAgfVxufVxuXG4vLy8vLy8vLy8vXG5cbmNvbnN0IENBQ0hFX0tFWTogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnQ0FDSEVfS0VZJyk7XG5cbi8vIHB1YmxpYyBpbnRlcmZhY2VcbmV4cG9ydCBpbnRlcmZhY2UgQ2FjaGU8VCA9IHVua25vd24+IHtcbiAgW0NBQ0hFX0tFWV06IFQ7XG59XG5cbmNvbnN0IEZOOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdGTicpO1xuY29uc3QgTEFTVF9WQUxVRTogdW5pcXVlIHN5bWJvbCA9IHN5bWJvbCgnTEFTVF9WQUxVRScpO1xuY29uc3QgVEFHOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdUQUcnKTtcbmNvbnN0IFNOQVBTSE9UOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdTTkFQU0hPVCcpO1xuY29uc3QgREVCVUdfTEFCRUw6IHVuaXF1ZSBzeW1ib2wgPSBzeW1ib2woJ0RFQlVHX0xBQkVMJyk7XG5cbmludGVyZmFjZSBJbnRlcm5hbENhY2hlPFQgPSB1bmtub3duPiB7XG4gIFtGTl06ICguLi5hcmdzOiB1bmtub3duW10pID0+IFQ7XG4gIFtMQVNUX1ZBTFVFXTogVCB8IHVuZGVmaW5lZDtcbiAgW1RBR106IFRhZyB8IHVuZGVmaW5lZDtcbiAgW1NOQVBTSE9UXTogUmV2aXNpb247XG4gIFtERUJVR19MQUJFTF0/OiBzdHJpbmcgfCBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNhY2hlPFQ+KGZuOiAoKSA9PiBULCBkZWJ1Z2dpbmdMYWJlbD86IHN0cmluZyB8IGZhbHNlKTogQ2FjaGU8VD4ge1xuICBpZiAoREVCVUcgJiYgISh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGNyZWF0ZUNhY2hlKCkgbXVzdCBiZSBwYXNzZWQgYSBmdW5jdGlvbiBhcyBpdHMgZmlyc3QgcGFyYW1ldGVyLiBDYWxsZWQgd2l0aDogJHtTdHJpbmcoZm4pfWBcbiAgICApO1xuICB9XG5cbiAgbGV0IGNhY2hlOiBJbnRlcm5hbENhY2hlPFQ+ID0ge1xuICAgIFtGTl06IGZuLFxuICAgIFtMQVNUX1ZBTFVFXTogdW5kZWZpbmVkLFxuICAgIFtUQUddOiB1bmRlZmluZWQsXG4gICAgW1NOQVBTSE9UXTogLTEsXG4gIH07XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgY2FjaGVbREVCVUdfTEFCRUxdID0gZGVidWdnaW5nTGFiZWw7XG4gIH1cblxuICByZXR1cm4gKGNhY2hlIGFzIHVua25vd24pIGFzIENhY2hlPFQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsdWU8VD4oY2FjaGU6IENhY2hlPFQ+KTogVCB8IHVuZGVmaW5lZCB7XG4gIGFzc2VydENhY2hlKGNhY2hlLCAnZ2V0VmFsdWUnKTtcblxuICBsZXQgZm4gPSBjYWNoZVtGTl07XG4gIGxldCB0YWcgPSBjYWNoZVtUQUddO1xuICBsZXQgc25hcHNob3QgPSBjYWNoZVtTTkFQU0hPVF07XG5cbiAgaWYgKHRhZyA9PT0gdW5kZWZpbmVkIHx8ICF2YWxpZGF0ZVRhZyh0YWcsIHNuYXBzaG90KSkge1xuICAgIGJlZ2luVHJhY2tGcmFtZSgpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNhY2hlW0xBU1RfVkFMVUVdID0gZm4oKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGFnID0gZW5kVHJhY2tGcmFtZSgpO1xuICAgICAgY2FjaGVbVEFHXSA9IHRhZztcbiAgICAgIGNhY2hlW1NOQVBTSE9UXSA9IHZhbHVlRm9yVGFnKHRhZyk7XG4gICAgICBjb25zdW1lVGFnKHRhZyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN1bWVUYWcodGFnKTtcbiAgfVxuXG4gIHJldHVybiBjYWNoZVtMQVNUX1ZBTFVFXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29uc3QoY2FjaGU6IENhY2hlKTogYm9vbGVhbiB7XG4gIGFzc2VydENhY2hlKGNhY2hlLCAnaXNDb25zdCcpO1xuXG4gIGxldCB0YWcgPSBjYWNoZVtUQUddO1xuXG4gIGFzc2VydFRhZyh0YWcsIGNhY2hlKTtcblxuICByZXR1cm4gaXNDb25zdFRhZyh0YWcpO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRDYWNoZTxUPihcbiAgdmFsdWU6IENhY2hlPFQ+IHwgSW50ZXJuYWxDYWNoZTxUPixcbiAgZm5OYW1lOiBzdHJpbmdcbik6IGFzc2VydHMgdmFsdWUgaXMgSW50ZXJuYWxDYWNoZTxUPiB7XG4gIGlmIChERUJVRyAmJiAhKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwgJiYgRk4gaW4gdmFsdWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYCR7Zm5OYW1lfSgpIGNhbiBvbmx5IGJlIHVzZWQgb24gYW4gaW5zdGFuY2Ugb2YgYSBjYWNoZSBjcmVhdGVkIHdpdGggY3JlYXRlQ2FjaGUoKS4gQ2FsbGVkIHdpdGg6ICR7U3RyaW5nKFxuICAgICAgICB2YWx1ZVxuICAgICAgKX1gXG4gICAgKTtcbiAgfVxufVxuXG4vLyByZXBsYWNlIHRoaXMgd2l0aCBgZXhwZWN0YCB3aGVuIHdlIGNhblxuZnVuY3Rpb24gYXNzZXJ0VGFnKHRhZzogVGFnIHwgdW5kZWZpbmVkLCBjYWNoZTogSW50ZXJuYWxDYWNoZSk6IGFzc2VydHMgdGFnIGlzIFRhZyB7XG4gIGlmIChERUJVRyAmJiB0YWcgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBpc0NvbnN0KCkgY2FuIG9ubHkgYmUgdXNlZCBvbiBhIGNhY2hlIG9uY2UgZ2V0VmFsdWUoKSBoYXMgYmVlbiBjYWxsZWQgYXQgbGVhc3Qgb25jZS4gQ2FsbGVkIHdpdGggY2FjaGUgZnVuY3Rpb246XFxuXFxuJHtTdHJpbmcoXG4gICAgICAgIGNhY2hlW0ZOXVxuICAgICAgKX1gXG4gICAgKTtcbiAgfVxufVxuXG4vLy8vLy8vLy8vXG5cbi8vIExlZ2FjeSB0cmFja2luZyBBUElzXG5cbi8vIHRyYWNrKCkgc2hvdWxkbid0IGJlIG5lY2Vzc2FyeSBhdCBhbGwgaW4gdGhlIFZNIG9uY2UgdGhlIGF1dG90cmFja2luZ1xuLy8gcmVmYWN0b3JzIGFyZSBtZXJnZWQsIGFuZCB3ZSBzaG91bGQgZ2VuZXJhbGx5IGJlIG1vdmluZyBhd2F5IGZyb20gaXQuIEl0IG1heVxuLy8gYmUgbmVjZXNzYXJ5IGluIEVtYmVyIGZvciBhIHdoaWxlIGxvbmdlciwgYnV0IEkgdGhpbmsgd2UnbGwgYmUgYWJsZSB0byBkcm9wXG4vLyBpdCBpbiBmYXZvciBvZiBjYWNoZSBzb29uZXIgcmF0aGVyIHRoYW4gbGF0ZXIuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2soY2FsbGJhY2s6ICgpID0+IHZvaWQsIGRlYnVnTGFiZWw/OiBzdHJpbmcgfCBmYWxzZSk6IFRhZyB7XG4gIGJlZ2luVHJhY2tGcmFtZShkZWJ1Z0xhYmVsKTtcblxuICBsZXQgdGFnO1xuXG4gIHRyeSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfSBmaW5hbGx5IHtcbiAgICB0YWcgPSBlbmRUcmFja0ZyYW1lKCk7XG4gIH1cblxuICByZXR1cm4gdGFnO1xufVxuXG4vLyB1bnRyYWNrKCkgaXMgY3VycmVudGx5IG1haW5seSB1c2VkIHRvIGhhbmRsZSBwbGFjZXMgdGhhdCB3ZXJlIHByZXZpb3VzbHkgbm90XG4vLyB0cmFja2VkLCBhbmQgdGhhdCB0cmFja2luZyBub3cgd291bGQgY2F1c2UgYmFja3RyYWNraW5nIHJlcmVuZGVyIGFzc2VydGlvbnMuXG4vLyBJIHRoaW5rIG9uY2Ugd2UgbW92ZSBldmVyeW9uZSBmb3J3YXJkIG9udG8gbW9kZXJuIEFQSXMsIHdlJ2xsIHByb2JhYmx5IGJlXG4vLyBhYmxlIHRvIHJlbW92ZSBpdCwgYnV0IEknbSBub3Qgc3VyZSB5ZXQuXG5leHBvcnQgZnVuY3Rpb24gdW50cmFjazxUPihjYWxsYmFjazogKCkgPT4gVCk6IFQge1xuICBiZWdpblVudHJhY2tGcmFtZSgpO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH0gZmluYWxseSB7XG4gICAgZW5kVW50cmFja0ZyYW1lKCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IHRhZ0ZvciwgZGlydHlUYWdGb3IgfSBmcm9tICcuL21ldGEnO1xuaW1wb3J0IHsgY29uc3VtZVRhZyB9IGZyb20gJy4vdHJhY2tpbmcnO1xuXG5leHBvcnQgdHlwZSBHZXR0ZXI8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gKHNlbGY6IFQpID0+IFRbS10gfCB1bmRlZmluZWQ7XG5leHBvcnQgdHlwZSBTZXR0ZXI8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gKHNlbGY6IFQsIHZhbHVlOiBUW0tdKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2tlZERhdGE8VCBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIFQ+KFxuICBrZXk6IEssXG4gIGluaXRpYWxpemVyPzogKHRoaXM6IFQpID0+IFRbS11cbik6IHsgZ2V0dGVyOiBHZXR0ZXI8VCwgSz47IHNldHRlcjogU2V0dGVyPFQsIEs+IH0ge1xuICBsZXQgdmFsdWVzID0gbmV3IFdlYWtNYXA8VCwgVFtLXT4oKTtcbiAgbGV0IGhhc0luaXRpYWxpemVyID0gdHlwZW9mIGluaXRpYWxpemVyID09PSAnZnVuY3Rpb24nO1xuXG4gIGZ1bmN0aW9uIGdldHRlcihzZWxmOiBUKSB7XG4gICAgY29uc3VtZVRhZyh0YWdGb3Ioc2VsZiwga2V5KSk7XG5cbiAgICBsZXQgdmFsdWU7XG5cbiAgICAvLyBJZiB0aGUgZmllbGQgaGFzIG5ldmVyIGJlZW4gaW5pdGlhbGl6ZWQsIHdlIHNob3VsZCBpbml0aWFsaXplIGl0XG4gICAgaWYgKGhhc0luaXRpYWxpemVyICYmICF2YWx1ZXMuaGFzKHNlbGYpKSB7XG4gICAgICB2YWx1ZSA9IGluaXRpYWxpemVyIS5jYWxsKHNlbGYpO1xuICAgICAgdmFsdWVzLnNldChzZWxmLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdmFsdWVzLmdldChzZWxmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiBzZXR0ZXIoc2VsZjogVCwgdmFsdWU6IFRbS10pOiB2b2lkIHtcbiAgICBkaXJ0eVRhZ0ZvcihzZWxmLCBrZXkpO1xuICAgIHZhbHVlcy5zZXQoc2VsZiwgdmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHsgZ2V0dGVyLCBzZXR0ZXIgfTtcbn1cbiIsImltcG9ydCB7IHN5bWJvbEZvciwgZ2V0R2xvYmFsIH0gZnJvbSAnLi9saWIvdXRpbHMnO1xuXG5jb25zdCBHTElNTUVSX1ZBTElEQVRPUl9SRUdJU1RSQVRJT04gPSBzeW1ib2xGb3IoJ0dMSU1NRVJfVkFMSURBVE9SX1JFR0lTVFJBVElPTicpO1xuXG5jb25zdCBnbG9iYWxPYmogPSBnZXRHbG9iYWwoKTtcblxuaWYgKGdsb2JhbE9ialtHTElNTUVSX1ZBTElEQVRPUl9SRUdJU1RSQVRJT05dID09PSB0cnVlKSB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnVGhlIGBAZ2xpbW1lci92YWxpZGF0b3JgIGxpYnJhcnkgaGFzIGJlZW4gaW5jbHVkZWQgdHdpY2UgaW4gdGhpcyBhcHBsaWNhdGlvbi4gSXQgY291bGQgYmUgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBwYWNrYWdlLCBvciB0aGUgc2FtZSB2ZXJzaW9uIGluY2x1ZGVkIHR3aWNlIGJ5IG1pc3Rha2UuIGBAZ2xpbW1lci92YWxpZGF0b3JgIGRlcGVuZHMgb24gaGF2aW5nIGEgc2luZ2xlIGNvcHkgb2YgdGhlIHBhY2thZ2UgaW4gdXNlIGF0IGFueSB0aW1lIGluIGFuIGFwcGxpY2F0aW9uLCBldmVuIGlmIHRoZXkgYXJlIHRoZSBzYW1lIHZlcnNpb24uIFlvdSBtdXN0IGRlZHVwZSB5b3VyIGJ1aWxkIHRvIHJlbW92ZSB0aGUgZHVwbGljYXRlIHBhY2thZ2VzIGluIG9yZGVyIHRvIHByZXZlbnQgdGhpcyBlcnJvci4nXG4gICk7XG59XG5cbmdsb2JhbE9ialtHTElNTUVSX1ZBTElEQVRPUl9SRUdJU1RSQVRJT05dID0gdHJ1ZTtcblxuZXhwb3J0IHtcbiAgQUxMT1dfQ1lDTEVTLFxuICBidW1wLFxuICBDb21iaW5hdG9yVGFnLFxuICBjb21iaW5lLFxuICBDT01QVVRFLFxuICBDT05TVEFOVF9UQUcsXG4gIENPTlNUQU5ULFxuICBDb25zdGFudFRhZyxcbiAgY3JlYXRlVGFnLFxuICBjcmVhdGVVcGRhdGFibGVUYWcsXG4gIEN1cnJlbnRUYWcsXG4gIENVUlJFTlRfVEFHLFxuICBESVJUWV9UQUcgYXMgZGlydHlUYWcsXG4gIERpcnR5YWJsZVRhZyxcbiAgRW50aXR5VGFnLFxuICBJTklUSUFMLFxuICBpc0NvbnN0VGFnLFxuICBSZXZpc2lvbixcbiAgVGFnLFxuICBVcGRhdGFibGVUYWcsXG4gIFVQREFURV9UQUcgYXMgdXBkYXRlVGFnLFxuICB2YWxpZGF0ZVRhZyxcbiAgdmFsdWVGb3JUYWcsXG4gIFZvbGF0aWxlVGFnLFxuICBWT0xBVElMRV9UQUcsXG4gIFZPTEFUSUxFLFxufSBmcm9tICcuL2xpYi92YWxpZGF0b3JzJztcblxuZXhwb3J0IHsgZGlydHlUYWdGb3IsIHRhZ0ZvciwgdGFnTWV0YUZvciwgVGFnTWV0YSB9IGZyb20gJy4vbGliL21ldGEnO1xuXG5leHBvcnQge1xuICBiZWdpblRyYWNrRnJhbWUsXG4gIGVuZFRyYWNrRnJhbWUsXG4gIGJlZ2luVW50cmFja0ZyYW1lLFxuICBlbmRVbnRyYWNrRnJhbWUsXG4gIHJlc2V0VHJhY2tpbmcsXG4gIGNvbnN1bWVUYWcsXG4gIGlzVHJhY2tpbmcsXG4gIHRyYWNrLFxuICB1bnRyYWNrLFxuICBDYWNoZSxcbiAgY3JlYXRlQ2FjaGUsXG4gIGlzQ29uc3QsXG4gIGdldFZhbHVlLFxufSBmcm9tICcuL2xpYi90cmFja2luZyc7XG5cbmV4cG9ydCB7IHRyYWNrZWREYXRhIH0gZnJvbSAnLi9saWIvdHJhY2tlZC1kYXRhJztcblxuZXhwb3J0IHtcbiAgbG9nVHJhY2tpbmdTdGFjayxcbiAgc2V0VHJhY2tpbmdUcmFuc2FjdGlvbkVudixcbiAgcnVuSW5UcmFja2luZ1RyYW5zYWN0aW9uLFxuICBiZWdpblRyYWNraW5nVHJhbnNhY3Rpb24sXG4gIGVuZFRyYWNraW5nVHJhbnNhY3Rpb24sXG4gIGRlcHJlY2F0ZU11dGF0aW9uc0luVHJhY2tpbmdUcmFuc2FjdGlvbixcbn0gZnJvbSAnLi9saWIvZGVidWcnO1xuIl0sIm5hbWVzIjpbIkRFQlVHIiwic2V0VHJhY2tpbmdUcmFuc2FjdGlvbkVudiIsImJlZ2luVHJhY2tpbmdUcmFuc2FjdGlvbiIsImVuZFRyYWNraW5nVHJhbnNhY3Rpb24iLCJsb2dUcmFja2luZ1N0YWNrIiwicnVuSW5UcmFja2luZ1RyYW5zYWN0aW9uIiwiZGVwcmVjYXRlTXV0YXRpb25zSW5UcmFja2luZ1RyYW5zYWN0aW9uIiwiQUxMT1dfQ1lDTEVTIiwic2NoZWR1bGVSZXZhbGlkYXRlIiwibWFya1RhZ0FzQ29uc3VtZWQiLCJfY29tYmluZSJdLCJtYXBwaW5ncyI6Ijs7RUFVQTtFQUNNLFNBQUEsU0FBQSxDQUFBLEtBQUEsRUFBOEM7RUFDbEQsU0FBQSxLQUFBOztFQUlGO0VBQ0E7O0VBQ08sSUFBTSxNQUFNLEdBQ2pCLE9BQUEsTUFBQSxLQUFBLFdBQUEsR0FBQSxNQUFBO0VBR0ssVUFBQSxHQUFEO0VBQUEsZ0JBQXNCLEdBQXRCLEdBQTRCLElBQUksQ0FBSixLQUFBLENBQVcsSUFBSSxDQUFKLE1BQUEsS0FBZ0IsSUFBSSxDQUoxRCxHQUlzRCxFQUEzQixDQUE1QjtFQUFBLENBSkM7O0VBT0EsSUFBTSxTQUFTLEdBQ3BCLE9BQUEsTUFBQSxLQUFBLFdBQUEsR0FDSSxNQURKLE9BQUEsR0FFSyxVQUFBLEdBQUQ7RUFBQSw2Q0FIQyxHQUdEO0VBQUEsQ0FIQztFQUtELFNBQUEsU0FBQSxHQUFtQjtFQUN2QjtFQUNBLE1BQUksT0FBQSxVQUFBLEtBQUosV0FBQSxFQUF1QyxPQUFPLFNBQVMsQ0FBaEIsVUFBZ0IsQ0FBaEI7RUFDdkMsTUFBSSxPQUFBLElBQUEsS0FBSixXQUFBLEVBQWlDLE9BQU8sU0FBUyxDQUFoQixJQUFnQixDQUFoQjtFQUNqQyxNQUFJLE9BQUEsTUFBQSxLQUFKLFdBQUEsRUFBbUMsT0FBTyxTQUFTLENBQWhCLE1BQWdCLENBQWhCO0VBQ25DLE1BQUksT0FBQSxNQUFBLEtBQUosV0FBQSxFQUFtQyxPQUFPLFNBQVMsQ0FBaEIsTUFBZ0IsQ0FBaEI7RUFFbkMsUUFBTSxJQUFBLEtBQUEsQ0FBTixnQ0FBTSxDQUFOO0VBQ0Q7RUFFSyxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQTZDO0VBQ2pELE1BQUksR0FBRyxLQUFILElBQUEsSUFBZ0IsR0FBRyxLQUF2QixTQUFBLEVBQXVDLE1BQU0sSUFBTixLQUFNLGdDQUFOO0VBQ3ZDLFNBQUEsR0FBQTtFQUNEOztFQy9CTSxJQUFBLHdCQUFBO0FBQ1AsRUFRTyxJQUFBLG9CQUFBOztFQUlBLElBQUEsa0JBQUE7O0VBVVAsSUFBQUEsU0FBQSxFQUFXO0VBQ1QsTUFBSSxhQUFhLEdBQWpCLElBQUE7RUFFQSxNQUFJLGlCQUFpQixHQUhaLEVBR1QsQ0FIUzs7RUFPVCxNQUFJLGVBQWUsR0FBRztFQUNwQixJQUFBLE1BRG9CLGtCQUNkLE9BRGMsRUFDRTtFQUNwQixZQUFNLElBQUEsS0FBQSxDQUFOLE9BQU0sQ0FBTjtFQUZrQixLQUFBO0VBS3BCLElBQUEsU0FMb0IscUJBS1gsT0FMVyxFQUtLO0VBQ3ZCLE1BQUEsT0FBTyxDQUFQLElBQUEsQ0FBQSxPQUFBO0VBTmtCLEtBQUE7RUFTcEIsSUFBQSxZQVRvQix3QkFTUixHQVRRLEVBU1IsT0FUUSxFQVN3QjtFQUMxQyxVQUFBLE9BQUE7O0VBRUEsVUFBSSxPQUFBLEdBQUEsS0FBSixVQUFBLEVBQStCO0VBQzdCLFFBQUEsT0FBTyxHQUFHLEdBQUcsQ0FBYixJQUFBO0VBREYsT0FBQSxNQUVPLElBQUksT0FBQSxHQUFBLEtBQUEsUUFBQSxJQUEyQixHQUFHLEtBQWxDLElBQUEsRUFBNkM7RUFDbEQsWUFBSSxTQUFTLEdBQUksR0FBRyxDQUFILFdBQUEsSUFBbUIsR0FBRyxDQUFILFdBQUEsQ0FBcEIsSUFBQyxJQUFqQixpQkFBQTtFQUVBLFFBQUEsT0FBTyx3QkFBUCxTQUFPLE1BQVA7RUFISyxPQUFBLE1BSUEsSUFBSSxHQUFHLEtBQVAsU0FBQSxFQUF1QjtFQUM1QixRQUFBLE9BQU8sR0FBUCxrQkFBQTtFQURLLE9BQUEsTUFFQTtFQUNMLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBaEIsR0FBZ0IsQ0FBaEI7RUFDRDs7RUFFRCxVQUFJLFdBQVcsR0FBRyxPQUFPLFNBQVEsT0FBUixjQUFBLE9BQUEsZUFBekIsT0FBeUIsTUFBekI7RUFFQSwwQ0FBQSxXQUFBO0VBQ0Q7RUEzQm1CLEdBQXRCOztFQThCQSxFQUFBQyxpQ0FBeUIsR0FBSSxtQ0FBQSxHQUFEO0VBQUEsV0FBUyxNQUFNLENBQU4sTUFBQSxDQUFBLGVBQUEsRUFBckMsR0FBcUMsQ0FBVDtFQUFBLEdBQTVCOztFQUVBLEVBQUFDLGdDQUF3QixHQUFHLGtDQUFBLFdBQUEsRUFBK0IsU0FBL0IsRUFBb0Q7RUFBQSxRQUFyQixTQUFxQjtFQUFyQixNQUFBLFNBQXFCLEdBQXBELEtBQW9EO0VBQUE7O0VBQzdFLElBQUEsYUFBYSxHQUFHLGFBQWEsSUFBSSxJQUFqQyxPQUFpQyxFQUFqQztFQUVBLFFBQUksVUFBVSxHQUFHLFdBQVcsSUFBNUIsU0FBQTtFQUVBLFFBQUksTUFBTSxHQUFHLGlCQUFpQixDQUFDLGlCQUFpQixDQUFqQixNQUFBLEdBQWxCLENBQWlCLENBQWpCLElBQWIsSUFBQTtFQUVBLElBQUEsaUJBQWlCLENBQWpCLElBQUEsQ0FBdUI7RUFDckIsTUFBQSxNQURxQixFQUNyQixNQURxQjtFQUVyQixNQUFBLFVBRnFCLEVBRXJCLFVBRnFCO0VBR3JCLE1BQUEsU0FBQSxFQUFBO0VBSHFCLEtBQXZCO0VBUEYsR0FBQTs7RUFjQSxFQUFBQyw4QkFBc0IsR0FBRyxrQ0FBSztFQUM1QixRQUFJLGlCQUFpQixDQUFqQixNQUFBLEtBQUosQ0FBQSxFQUFvQztFQUNsQyxZQUFNLElBQUEsS0FBQSxDQUFOLGlFQUFNLENBQU47RUFDRDs7RUFFRCxJQUFBLGlCQUFpQixDQUFqQixHQUFBOztFQUVBLFFBQUksaUJBQWlCLENBQWpCLE1BQUEsS0FBSixDQUFBLEVBQW9DO0VBQ2xDLE1BQUEsYUFBYSxHQUFiLElBQUE7RUFDRDtFQVRILEdBQUE7O0VBWUEsRUFBQSx3QkFBd0IsR0FBRyxvQ0FBSztFQUM5QixRQUFJLEtBQUssR0FBVCxFQUFBOztFQUVBLFFBQUksaUJBQWlCLENBQWpCLE1BQUEsR0FBSixDQUFBLEVBQWtDO0VBQ2hDLE1BQUEsS0FBSyxHQUFHQyx3QkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBakIsTUFBQSxHQUE1QyxDQUEyQyxDQUFsQixDQUF6QjtFQUNEOztFQUVELElBQUEsaUJBQWlCLEdBQWpCLEVBQUE7RUFDQSxJQUFBLGFBQWEsR0FBYixJQUFBO0VBRUEsV0FBQSxLQUFBO0VBVkYsR0FBQTtFQWFBOzs7Ozs7Ozs7Ozs7RUFVQSxFQUFBQyxnQ0FBd0IsR0FBRyxrQ0FBQSxFQUFBLEVBQUEsVUFBQSxFQUFnRDtFQUN6RSxJQUFBSCxnQ0FBeUIsQ0FBekIsVUFBeUIsQ0FBekI7RUFDQSxRQUFJLFFBQVEsR0FBWixJQUFBOztFQUVBLFFBQUk7RUFDRixVQUFJLEtBQUssR0FBRyxFQUFaLEVBQUE7RUFDQSxNQUFBLFFBQVEsR0FBUixLQUFBO0VBQ0EsYUFBQSxLQUFBO0VBSEYsS0FBQSxTQUlVO0VBQ1IsVUFBSSxRQUFRLEtBQVosSUFBQSxFQUF1QjtFQUNyQixRQUFBQyw4QkFBdUI7RUFDeEI7RUFDRjtFQVpILEdBQUE7RUFlQTs7Ozs7Ozs7Ozs7OztFQVdBLEVBQUFHLCtDQUF1QyxHQUFHLGlEQUFBLEVBQUEsRUFBQSxVQUFBLEVBQWdEO0VBQ3hGLElBQUFKLGdDQUF5QixDQUFBLFVBQUEsRUFBekIsSUFBeUIsQ0FBekI7O0VBRUEsUUFBSTtFQUNGLE1BQUEsRUFBRTtFQURKLEtBQUEsU0FFVTtFQUNSLE1BQUFDLDhCQUF1QjtFQUN4QjtFQVBILEdBQUE7O0VBVUEsTUFBSSxRQUFRLEdBQUcsU0FBWCxRQUFXLENBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQTBDLFdBQTFDLEVBQThEO0VBQUEsUUFBcEIsV0FBb0I7RUFBcEIsTUFBQSxXQUFvQixHQUFOLENBQXhELENBQThEO0VBQUE7O0VBQzNFLFFBQUksQ0FBQyxHQUFMLFdBQUE7O0VBRUEsV0FBTyxDQUFDLEtBQUQsQ0FBQSxJQUFXLENBQUMsS0FBSyxHQUFHLENBQTNCLE1BQUEsRUFBb0M7RUFDbEMsTUFBQSxDQUFDLEdBQUcsR0FBRyxDQUFILE9BQUEsQ0FBQSxPQUFBLEVBQUosQ0FBSSxDQUFKO0VBQ0EsVUFBSSxDQUFDLEdBQUwsQ0FBQSxFQUFXO0VBQ1o7O0VBRUQsV0FBQSxDQUFBO0VBUkYsR0FBQTs7RUFXQSxNQUFJLHdCQUF3QixHQUFHLFNBQTNCLHdCQUEyQixDQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUkzQjtFQUNGLFFBQUksT0FBTyxHQUFHLENBQUMsZUFBZSxDQUFmLFlBQUEsQ0FBQSxHQUFBLEVBQWtDLE9BQU8sSUFBSSxNQUFNLENBQWxFLE9BQWtFLENBQW5ELENBQUQsQ0FBZDtFQUVBLElBQUEsT0FBTyxDQUFQLElBQUEsT0FBa0IsTUFBTSxDQUF4QixPQUF3QixDQUF4QjtFQUVBLElBQUEsT0FBTyxDQUFQLElBQUEsQ0FBYUMsd0JBQWlCLENBQTlCLFdBQThCLENBQTlCO0VBRUEsSUFBQSxPQUFPLENBQVAsSUFBQTtFQUVBLFdBQU8sT0FBTyxDQUFQLElBQUEsQ0FBUCxNQUFPLENBQVA7RUFiRixHQUFBOztFQWdCQSxFQUFBQSx3QkFBZ0IsR0FBSSwwQkFBQSxXQUFELEVBQThCO0VBQy9DLFFBQUksYUFBYSxHQUFqQixFQUFBO0VBQ0EsUUFBSSxPQUFPLEdBQ1QsV0FBVyxJQUFJLGlCQUFpQixDQUFDLGlCQUFpQixDQUFqQixNQUFBLEdBRG5DLENBQ2tDLENBRGxDO0VBR0EsUUFBSSxPQUFPLEtBQVgsU0FBQSxFQUEyQixPQUFBLEVBQUE7O0VBRTNCLFdBQUEsT0FBQSxFQUFnQjtFQUNkLFVBQUksT0FBTyxDQUFYLFVBQUEsRUFBd0I7RUFDdEIsUUFBQSxhQUFhLENBQWIsT0FBQSxDQUFzQixPQUFPLENBQTdCLFVBQUE7RUFDRDs7RUFFRCxNQUFBLE9BQU8sR0FBRyxPQUFPLENBQWpCLE1BQUE7RUFaNkMsS0FBQTs7O0VBZ0IvQyxXQUFPLGFBQWEsQ0FBYixHQUFBLENBQWtCLFVBQUEsS0FBQSxFQUFBLEtBQUE7RUFBQSxhQUFrQixLQUFLLENBQUMsSUFBQSxLQUFBLEdBQU4sQ0FBSyxDQUFMLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBcEMsS0FBa0I7RUFBQSxLQUFsQixFQUFBLElBQUEsQ0FBUCxJQUFPLENBQVA7RUFoQkYsR0FBQTs7RUFtQkEsRUFBQSxrQkFBaUIsR0FBSSwyQkFBQSxJQUFELEVBQWM7RUFDaEMsUUFBSSxDQUFBLGFBQUEsSUFBa0IsYUFBYSxDQUFiLEdBQUEsQ0FBdEIsSUFBc0IsQ0FBdEIsRUFBK0M7RUFFL0MsSUFBQSxhQUFhLENBQWIsR0FBQSxDQUFBLElBQUEsRUFBd0IsaUJBQWlCLENBQUMsaUJBQWlCLENBQWpCLE1BQUEsR0FIVixDQUdTLENBQXpDLEVBSGdDO0VBTWhDO0VBQ0E7O0VBQ0EsUUFBSSxHQUFHLEdBQVAsSUFBQTs7RUFFQSxRQUFJLEdBQUcsQ0FBUCxNQUFBLEVBQWdCO0VBQ2QsTUFBQSxrQkFBa0IsQ0FBQyxHQUFHLENBQXRCLE1BQWtCLENBQWxCO0VBQ0Q7O0VBRUQsUUFBSSxHQUFHLENBQVAsT0FBQSxFQUFpQjtFQUNmLE1BQUEsR0FBRyxDQUFILE9BQUEsQ0FBQSxPQUFBLENBQXFCLFVBQUEsR0FBRDtFQUFBLGVBQWMsa0JBQWtCLENBQXBELEdBQW9ELENBQWhDO0VBQUEsT0FBcEI7RUFDRDtFQWhCSCxHQUFBOztFQW1CQSxFQUFBLG9CQUFvQixHQUFHLDhCQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUE4RDtFQUNuRixRQUFJLGFBQWEsS0FBakIsSUFBQSxFQUE0QjtFQUU1QixRQUFJLFdBQVcsR0FBRyxhQUFhLENBQWIsR0FBQSxDQUFsQixHQUFrQixDQUFsQjtFQUVBLFFBQUksQ0FBSixXQUFBLEVBQWtCO0VBRWxCLFFBQUksa0JBQWtCLEdBQUcsaUJBQWlCLENBQUMsaUJBQWlCLENBQWpCLE1BQUEsR0FBM0MsQ0FBMEMsQ0FBMUM7O0VBRUEsUUFBSSxrQkFBa0IsQ0FBdEIsU0FBQSxFQUFrQztFQUNoQyxNQUFBLGVBQWUsQ0FBZixTQUFBLENBQTBCLHdCQUF3QixDQUFBLFdBQUEsRUFBQSxHQUFBLEVBQWxELE9BQWtELENBQWxEO0VBREYsS0FBQSxNQUVPO0VBQ0w7RUFDQTtFQUNBO0VBQ0EsVUFBSTtFQUNGLFFBQUEsZUFBZSxDQUFmLE1BQUEsQ0FBdUIsd0JBQXdCLENBQUEsV0FBQSxFQUFBLEdBQUEsRUFBL0MsT0FBK0MsQ0FBL0M7RUFERixPQUFBLENBRUUsT0FBQSxDQUFBLEVBQVU7RUFDVixZQUFJLENBQUMsQ0FBTCxLQUFBLEVBQWE7RUFDWCxjQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBRCxLQUFBLENBQUEsT0FBQSxDQUF2Qiw2QkFBdUIsQ0FBdkI7O0VBRUEsY0FBSSxnQkFBZ0IsS0FBSyxDQUF6QixDQUFBLEVBQTZCO0VBQzNCLGdCQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFGLEtBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFwQixnQkFBb0IsQ0FBcEI7RUFDQSxnQkFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBRixLQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBbEIsZ0JBQWtCLENBQWxCO0VBQ0EsWUFBQSxDQUFDLENBQUQsS0FBQSxHQUFVLENBQUMsQ0FBRCxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLElBQTJCLENBQUMsQ0FBRCxLQUFBLENBQUEsTUFBQSxDQUFyQyxHQUFxQyxDQUFyQztFQUNEO0VBQ0Y7O0VBRUQsY0FBQSxDQUFBO0VBQ0Q7RUFDRjtFQTlCSCxHQUFBO0VBZ0NEOztNQ3ZQWSxRQUFRLEdBQWQsQ0FBQTtBQUNQLE1BQWEsT0FBTyxHQUFiLENBQUE7QUFDUCxNQUFhLFFBQVEsR0FBZCxHQUFBO0VBRVAsSUFBSSxTQUFTLEdBQWIsT0FBQTtBQUVBLEVBQU0sU0FBQSxJQUFBLEdBQWM7RUFDbEIsRUFBQSxTQUFTOzs7QUFLWCxNQUFhLE9BQU8sR0FBa0IsTUFBTSxDQUFyQyxhQUFxQyxDQUFyQzs7RUFVUDs7Ozs7Ozs7O0FBUUEsRUFBTSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQThCO0VBQ2xDLFNBQU8sR0FBRyxDQUFWLE9BQVUsQ0FBSCxFQUFQO0VBQ0Q7RUFFRDs7Ozs7Ozs7Ozs7QUFVQSxFQUFNLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLEVBQWtEO0VBQ3RELFNBQU8sUUFBUSxJQUFJLEdBQUcsQ0FBdEIsT0FBc0IsQ0FBSCxFQUFuQjtFQUNEO0VBaUJELElBQU0sSUFBSSxHQUFrQixNQUFNLENBQWxDLFVBQWtDLENBQWxDO0FBR0E7RUFHQSxJQUFBSixTQUFBLEVBQVc7RUFDVCxFQUFBTyxvQkFBWSxHQUFHLElBQWYsT0FBZSxFQUFmO0VBQ0Q7O0VBRUQsU0FBQSxZQUFBLENBQUEsR0FBQSxFQUE4QjtFQUM1QixNQUFJQSxvQkFBWSxLQUFoQixTQUFBLEVBQWdDO0VBQzlCLFdBQUEsSUFBQTtFQURGLEdBQUEsTUFFTztFQUNMLFdBQU9BLG9CQUFZLENBQVosR0FBQSxDQUFQLEdBQU8sQ0FBUDtFQUNEO0VBQ0Y7O01BV0Q7RUF1QkUsOEJBQUEsSUFBQSxFQUFtQjtFQVZYLFNBQUEsUUFBQSxHQUFBLE9BQUE7RUFDQSxTQUFBLFdBQUEsR0FBQSxPQUFBO0VBQ0EsU0FBQSxTQUFBLEdBQUEsT0FBQTtFQUVBLFNBQUEsVUFBQSxHQUFBLEtBQUE7RUFDQSxTQUFBLE1BQUEsR0FBQSxJQUFBO0VBQ0EsU0FBQSxpQkFBQSxHQUFBLElBQUE7RUFLTixTQUFBLElBQUEsSUFBQSxJQUFBO0VBQ0Q7O3VCQXhCRCxVQUFBLGlCQUFBLElBQUEsRUFBMEI7RUFDeEIsWUFBUSxJQUFJLENBQVosTUFBQTtFQUNFLFdBQUEsQ0FBQTtFQUNFLGVBQUEsWUFBQTs7RUFDRixXQUFBLENBQUE7RUFDRSxlQUFPLElBQUksQ0FBWCxDQUFXLENBQVg7O0VBQ0Y7RUFDRSxZQUFJLEdBQUcsR0FBdUIsSUFBQSxrQkFBQSxDQUFzQjtFQUFBO0VBQXRCLFNBQTlCO0VBQ0EsUUFBQSxHQUFHLENBQUgsTUFBQSxHQUFBLElBQUE7RUFDQSxlQUFBLEdBQUE7RUFSSjtFQVVEOzs7O1dBZUQsV0FBQSxZQUFTO0VBQUEsUUFDRCxXQURDLEdBQ1AsSUFETyxDQUNELFdBREM7O0VBR1AsUUFBSSxLQUFBLFVBQUEsS0FBSixJQUFBLEVBQThCO0VBQzVCLFVBQUlQLFNBQUssSUFBSSxDQUFDLFlBQVksQ0FBMUIsSUFBMEIsQ0FBMUIsRUFBa0M7RUFDaEMsY0FBTSxJQUFBLEtBQUEsQ0FBTixnQ0FBTSxDQUFOO0VBQ0Q7O0VBRUQsV0FBQSxXQUFBLEdBQW1CLEVBQW5CLFNBQUE7RUFMRixLQUFBLE1BTU8sSUFBSSxXQUFXLEtBQWYsU0FBQSxFQUErQjtFQUNwQyxXQUFBLFVBQUEsR0FBQSxJQUFBO0VBQ0EsV0FBQSxXQUFBLEdBQUEsU0FBQTs7RUFFQSxVQUFJO0VBQUEsWUFDRSxNQURGLEdBQ0YsSUFERSxDQUNFLE1BREY7RUFBQSxZQUNZLFFBRFosR0FDRixJQURFLENBQ1ksUUFEWjs7RUFHRixZQUFJLE1BQU0sS0FBVixJQUFBLEVBQXFCO0VBQ25CLGNBQUksS0FBSyxDQUFMLE9BQUEsQ0FBSixNQUFJLENBQUosRUFBMkI7RUFDekIsaUJBQUssSUFBSSxDQUFDLEdBQVYsQ0FBQSxFQUFnQixDQUFDLEdBQUcsTUFBTSxDQUExQixNQUFBLEVBQW1DLENBQW5DLEVBQUEsRUFBd0M7RUFDdEMsa0JBQUksS0FBSyxHQUFHLE1BQU0sQ0FBTixDQUFNLENBQU4sQ0FBWixPQUFZLEdBQVo7RUFDQSxjQUFBLFFBQVEsR0FBRyxJQUFJLENBQUosR0FBQSxDQUFBLEtBQUEsRUFBWCxRQUFXLENBQVg7RUFDRDtFQUpILFdBQUEsTUFLTztFQUNMLGdCQUFJLFdBQVcsR0FBRyxNQUFNLENBQXhCLE9BQXdCLENBQU4sRUFBbEI7O0VBRUEsZ0JBQUksV0FBVyxLQUFLLEtBQXBCLGlCQUFBLEVBQTRDO0VBQzFDLGNBQUEsUUFBUSxHQUFHLElBQUksQ0FBSixHQUFBLENBQUEsUUFBQSxFQUFtQixLQUE5QixTQUFXLENBQVg7RUFERixhQUFBLE1BRU87RUFDTDtFQUNBLG1CQUFBLGlCQUFBLEdBQUEsSUFBQTtFQUNBLGNBQUEsUUFBUSxHQUFHLElBQUksQ0FBSixHQUFBLENBQUEsUUFBQSxFQUFYLFdBQVcsQ0FBWDtFQUNEO0VBQ0Y7RUFDRjs7RUFFRCxhQUFBLFNBQUEsR0FBQSxRQUFBO0VBdEJGLE9BQUEsU0F1QlU7RUFDUixhQUFBLFVBQUEsR0FBQSxLQUFBO0VBQ0Q7RUFDRjs7RUFFRCxXQUFPLEtBQVAsU0FBQTtFQUNEOzt1QkFFRCxZQUFBLG1CQUFBLElBQUEsRUFBQSxPQUFBLEVBQWlEO0VBQy9DLFFBQUlBLFNBQUssSUFBSSxJQUFJLENBQUosSUFBSSxDQUFKLEtBQVU7RUFBQTtFQUF2QixNQUEyRDtFQUN6RCxjQUFNLElBQUEsS0FBQSxDQUFOLGtEQUFNLENBQU47RUFGNkMsT0FBQTs7O0VBTS9DLFFBQUksR0FBRyxHQUFQLElBQUE7RUFDQSxRQUFJLE1BQU0sR0FBVixPQUFBOztFQUVBLFFBQUksTUFBTSxLQUFWLFlBQUEsRUFBNkI7RUFDM0IsTUFBQSxHQUFHLENBQUgsTUFBQSxHQUFBLElBQUE7RUFERixLQUFBLE1BRU87RUFDTDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxNQUFBLEdBQUcsQ0FBSCxpQkFBQSxHQUF3QixNQUFNLENBQTlCLE9BQThCLENBQU4sRUFBeEI7RUFDQSxNQUFBLEdBQUcsQ0FBSCxNQUFBLEdBQUEsTUFBQTtFQUNEO0VBQ0Y7O3VCQUVELFdBQUEsa0JBQUEsR0FBQSxFQUFBLDJCQUFBLEVBQXVGO0VBQ3JGLFFBQ0VBLFNBQUssSUFDTCxFQUFFLEdBQUcsQ0FBSCxJQUFHLENBQUgsS0FBUztFQUFBO0VBQVQsT0FBK0MsR0FBRyxDQUFILElBQUcsQ0FBSCxLQUFTO0VBQUE7RUFBMUQsS0FGRixFQUdFO0VBQ0EsWUFBTSxJQUFBLEtBQUEsQ0FBTixpREFBTSxDQUFOO0VBQ0Q7O0VBRUQsUUFBSUEsU0FBSyxJQUFJLDJCQUEyQixLQUF4QyxJQUFBLEVBQW1EO0VBQ2pEO0VBQ0E7RUFDQSxNQUFBLE1BQU0sQ0FBTixvQkFBTSxDQUFOLENBQUEsR0FBQTtFQUNEOztFQUVBLElBQUEsR0FBMEIsQ0FBMUIsUUFBQSxHQUFzQyxFQUF0QyxTQUFBO0VBRUQsSUFBQVEsZ0NBQWtCO0VBQ25COzs7OztBQUdILE1BQWEsU0FBUyxHQUFHLGtCQUFrQixDQUFwQyxRQUFBO0FBQ1AsTUFBYSxVQUFVLEdBQUcsa0JBQWtCLENBQXJDLFNBQUE7O0FBSVAsRUFBTSxTQUFBLFNBQUEsR0FBbUI7RUFDdkIsU0FBTyxJQUFBLGtCQUFBLENBQXNCO0VBQUE7RUFBdEIsR0FBUDtFQUNEO0FBRUQsRUFBTSxTQUFBLGtCQUFBLEdBQTRCO0VBQ2hDLFNBQU8sSUFBQSxrQkFBQSxDQUFzQjtFQUFBO0VBQXRCLEdBQVA7OztBQUtGLE1BQWEsWUFBWSxHQUFnQixJQUFBLGtCQUFBLENBQXNCO0VBQUE7RUFBdEIsQ0FBbEM7QUFFUCxFQUFNLFNBQUEsVUFBQSxDQUFBLEdBQUEsRUFBNkI7RUFDakMsU0FBTyxHQUFHLEtBQVYsWUFBQTs7O0FBS0YsTUFBTSxXQUFOO0VBQUE7O0VBQUE7O0VBQUEsVUFDRSxPQURGLElBQ0UsWUFBUztFQUNQLFdBQUEsUUFBQTtFQUNELEdBSEg7O0VBQUE7RUFBQTtBQU1BLE1BQWEsWUFBWSxHQUFHLElBQXJCLFdBQXFCLEVBQXJCOztBQUlQLE1BQU0sVUFBTjtFQUFBOztFQUFBOztFQUFBLFVBQ0UsT0FERixJQUNFLFlBQVM7RUFDUCxXQUFBLFNBQUE7RUFDRCxHQUhIOztFQUFBO0VBQUE7QUFNQSxNQUFhLFdBQVcsR0FBRyxJQUFwQixVQUFvQixFQUFwQjs7QUFJUCxNQUFhLE9BQU8sR0FBRyxrQkFBa0IsQ0FBbEMsT0FBQTs7RUFJUCxJQUFJLElBQUksR0FBRyxrQkFBWCxFQUFBO0VBQ0EsSUFBSSxJQUFJLEdBQUcsa0JBQVgsRUFBQTtFQUNBLElBQUksSUFBSSxHQUFHLGtCQUFYLEVBQUE7RUFFQSxXQUFXLENBQVgsSUFBVyxDQUFYO0VBQ0EsU0FBUyxDQUFULElBQVMsQ0FBVDtFQUNBLFdBQVcsQ0FBWCxJQUFXLENBQVg7RUFDQSxVQUFVLENBQUEsSUFBQSxFQUFPLE9BQU8sQ0FBQyxDQUFBLElBQUEsRUFBekIsSUFBeUIsQ0FBRCxDQUFkLENBQVY7RUFDQSxXQUFXLENBQVgsSUFBVyxDQUFYO0VBQ0EsU0FBUyxDQUFULElBQVMsQ0FBVDtFQUNBLFdBQVcsQ0FBWCxJQUFXLENBQVg7RUFDQSxTQUFTLENBQVQsSUFBUyxDQUFUO0VBQ0EsV0FBVyxDQUFYLElBQVcsQ0FBWDtFQUNBLFVBQVUsQ0FBQSxJQUFBLEVBQVYsSUFBVSxDQUFWO0VBQ0EsV0FBVyxDQUFYLElBQVcsQ0FBWDtFQUNBLFNBQVMsQ0FBVCxJQUFTLENBQVQ7RUFDQSxXQUFXLENBQVgsSUFBVyxDQUFYOztFQzNSQSxTQUFBLFlBQUEsQ0FBQSxDQUFBLEVBQTZCO0VBQzNCLFNBQVEsT0FBQSxDQUFBLEtBQUEsUUFBQSxJQUF5QixDQUFDLEtBQTNCLElBQUMsSUFBd0MsT0FBQSxDQUFBLEtBQWhELFVBQUE7RUFDRDs7RUFNRCxJQUFNLFlBQVksR0FBRyxJQUFyQixPQUFxQixFQUFyQjtBQUVBLEVBQU0sU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBR1U7RUFFZCxNQUFJUixTQUFLLElBQUksQ0FBQyxZQUFZLENBQTFCLEdBQTBCLENBQTFCLEVBQWlDO0VBQy9CLFVBQU0sSUFBTixLQUFNLDJDQUFOO0VBQ0Q7O0VBRUQsTUFBSSxJQUFJLEdBQUcsSUFBSSxLQUFKLFNBQUEsR0FBcUIsWUFBWSxDQUFaLEdBQUEsQ0FBckIsR0FBcUIsQ0FBckIsR0FORyxJQU1kLENBTmM7O0VBU2QsTUFBSSxJQUFJLEtBQVIsU0FBQSxFQVRjLE9BQUE7O0VBWWQsTUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFKLEdBQUEsQ0FBbEIsR0FBa0IsQ0FBbEI7O0VBRUEsTUFBSSxXQUFXLEtBQWYsU0FBQSxFQUErQjtFQUM3QixRQUFBQSxTQUFBLEVBQVc7RUFDVCxNQUFBLE1BQU0sQ0FBTixvQkFBTSxDQUFOLENBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBO0VBQ0Q7O0VBRUQsSUFBQSxTQUFTLENBQUEsV0FBQSxFQUFULElBQVMsQ0FBVDtFQUNEO0VBQ0Y7QUFFRCxFQUFNLFNBQUEsVUFBQSxDQUFBLEdBQUEsRUFBZ0M7RUFDcEMsTUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFaLEdBQUEsQ0FBWCxHQUFXLENBQVg7O0VBRUEsTUFBSSxJQUFJLEtBQVIsU0FBQSxFQUF3QjtFQUN0QixJQUFBLElBQUksR0FBRyxJQUFQLEdBQU8sRUFBUDtFQUVBLElBQUEsWUFBWSxDQUFaLEdBQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQTtFQUNEOztFQUVELFNBQUEsSUFBQTtFQUNEO0FBRUQsRUFBTSxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFHVTtFQUVkLE1BQUksSUFBSSxHQUFHLElBQUksS0FBSixTQUFBLEdBQXFCLFVBQVUsQ0FBL0IsR0FBK0IsQ0FBL0IsR0FBWCxJQUFBO0VBQ0EsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFKLEdBQUEsQ0FBVixHQUFVLENBQVY7O0VBRUEsTUFBSSxHQUFHLEtBQVAsU0FBQSxFQUF1QjtFQUNyQixJQUFBLEdBQUcsR0FBRyxrQkFBTixFQUFBO0VBQ0EsSUFBQSxJQUFJLENBQUosR0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBO0VBQ0Q7O0VBRUQsU0FBQSxHQUFBO0VBQ0Q7O0VDOUNEOzs7O01BR0E7RUFBQSxxQkFBQTtFQUNVLFNBQUEsSUFBQSxHQUFPLElBQVAsR0FBTyxFQUFQO0VBQ0EsU0FBQSxJQUFBLEdBQUEsSUFBQTtFQTJCVDs7OztXQXpCQyxNQUFBLGFBQUcsR0FBSCxFQUFZO0VBQ1YsUUFBSSxHQUFHLEtBQVAsWUFBQSxFQUEwQjtFQUUxQixTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQTs7RUFFQSxRQUFBQSxTQUFBLEVBQVc7RUFDVCxNQUFBLE1BQU0sQ0FBTlMsa0JBQU0sQ0FBTixDQUFBLEdBQUE7RUFDRDs7RUFFRCxTQUFBLElBQUEsR0FBQSxHQUFBO0VBQ0Q7O1dBRUQsVUFBQSxxQkFBTztFQUFBLFFBQ0MsSUFERCxHQUNMLElBREssQ0FDQyxJQUREOztFQUdMLFFBQUksSUFBSSxDQUFKLElBQUEsS0FBSixDQUFBLEVBQXFCO0VBQ25CLGFBQUEsWUFBQTtFQURGLEtBQUEsTUFFTyxJQUFJLElBQUksQ0FBSixJQUFBLEtBQUosQ0FBQSxFQUFxQjtFQUMxQixhQUFPLEtBQVAsSUFBQTtFQURLLEtBQUEsTUFFQTtFQUNMLFVBQUksT0FBTyxHQUFYLEVBQUE7RUFDQSxNQUFBLElBQUksQ0FBSixPQUFBLENBQWMsVUFBQSxHQUFEO0VBQUEsZUFBUyxPQUFPLENBQVAsSUFBQSxDQUF0QixHQUFzQixDQUFUO0VBQUEsT0FBYjtFQUNBLGFBQU9DLE9BQU8sQ0FBZCxPQUFjLENBQWQ7RUFDRDtFQUNGOzs7O0VBR0g7Ozs7Ozs7Ozs7Ozs7OztFQWFBLElBQUksZUFBZSxHQUFuQixJQUFBO0VBRUEsSUFBTSxpQkFBaUIsR0FBdkIsRUFBQTtBQUVBLEVBQU0sU0FBQSxlQUFBLENBQUEsZ0JBQUEsRUFBMkQ7RUFDL0QsRUFBQSxpQkFBaUIsQ0FBakIsSUFBQSxDQUFBLGVBQUE7RUFFQSxFQUFBLGVBQWUsR0FBRyxJQUFsQixPQUFrQixFQUFsQjs7RUFFQSxNQUFBVixTQUFBLEVBQVc7RUFDVCxJQUFBLE1BQU0sQ0FBTkUsZ0NBQU0sQ0FBTixDQUFBLGdCQUFBO0VBQ0Q7RUFDRjtBQUVELEVBQU0sU0FBQSxhQUFBLEdBQXVCO0VBQzNCLE1BQUksT0FBTyxHQUFYLGVBQUE7O0VBRUEsTUFBQUYsU0FBQSxFQUFXO0VBQ1QsUUFBSSxpQkFBaUIsQ0FBakIsTUFBQSxLQUFKLENBQUEsRUFBb0M7RUFDbEMsWUFBTSxJQUFBLEtBQUEsQ0FBTiwyREFBTSxDQUFOO0VBQ0Q7O0VBRUQsSUFBQSxNQUFNLENBQU5HLDhCQUFNLENBQU47RUFDRDs7RUFFRCxFQUFBLGVBQWUsR0FBRyxpQkFBaUIsQ0FBakIsR0FBQSxNQUFsQixJQUFBO0VBRUEsU0FBTyxNQUFNLENBQU4sT0FBTSxDQUFOLENBQVAsT0FBTyxFQUFQO0VBQ0Q7QUFFRCxFQUFNLFNBQUEsaUJBQUEsR0FBMkI7RUFDL0IsRUFBQSxpQkFBaUIsQ0FBakIsSUFBQSxDQUFBLGVBQUE7RUFDQSxFQUFBLGVBQWUsR0FBZixJQUFBO0VBQ0Q7QUFFRCxFQUFNLFNBQUEsZUFBQSxHQUF5QjtFQUM3QixNQUFJSCxTQUFLLElBQUksaUJBQWlCLENBQWpCLE1BQUEsS0FBYixDQUFBLEVBQTZDO0VBQzNDLFVBQU0sSUFBQSxLQUFBLENBQU4sMkRBQU0sQ0FBTjtFQUNEOztFQUVELEVBQUEsZUFBZSxHQUFHLGlCQUFpQixDQUFqQixHQUFBLE1BQWxCLElBQUE7OztBQUlGLEVBQU0sU0FBQSxhQUFBLEdBQXVCO0VBQzNCLFNBQU8saUJBQWlCLENBQWpCLE1BQUEsR0FBUCxDQUFBLEVBQXFDO0VBQ25DLElBQUEsaUJBQWlCLENBQWpCLEdBQUE7RUFDRDs7RUFFRCxFQUFBLGVBQWUsR0FBZixJQUFBOztFQUVBLE1BQUFBLFNBQUEsRUFBVztFQUNULFdBQU8sTUFBTSxDQUFiLHdCQUFhLENBQU4sRUFBUDtFQUNEO0VBQ0Y7QUFFRCxFQUFNLFNBQUEsVUFBQSxHQUFvQjtFQUN4QixTQUFPLGVBQWUsS0FBdEIsSUFBQTtFQUNEO0FBRUQsRUFBTSxTQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQTZCO0VBQ2pDLE1BQUksZUFBZSxLQUFuQixJQUFBLEVBQThCO0VBQzVCLElBQUEsZUFBZSxDQUFmLEdBQUEsQ0FBQSxHQUFBO0VBQ0Q7O0VBWUgsSUFBTSxFQUFFLEdBQWtCLE1BQU0sQ0FBaEMsSUFBZ0MsQ0FBaEM7RUFDQSxJQUFNLFVBQVUsR0FBa0IsTUFBTSxDQUF4QyxZQUF3QyxDQUF4QztFQUNBLElBQU0sR0FBRyxHQUFrQixNQUFNLENBQWpDLEtBQWlDLENBQWpDO0VBQ0EsSUFBTSxRQUFRLEdBQWtCLE1BQU0sQ0FBdEMsVUFBc0MsQ0FBdEM7RUFDQSxJQUFNLFdBQVcsR0FBa0IsTUFBTSxDQUF6QyxhQUF5QyxDQUF6QztBQVVBLEVBQU0sU0FBQSxXQUFBLENBQUEsRUFBQSxFQUFBLGNBQUEsRUFBcUU7RUFBQTs7RUFDekUsTUFBSUEsU0FBSyxJQUFJLEVBQUUsT0FBQSxFQUFBLEtBQWYsVUFBYSxDQUFiLEVBQTBDO0VBQ3hDLFVBQU0sSUFBQSxLQUFBLG1GQUM0RSxNQUFNLENBRHhGLEVBQ3dGLENBRGxGLENBQU47RUFHRDs7RUFFRCxNQUFJLEtBQUssd0JBQ1AsRUFETyxJQUFxQixFQUFyQixTQUVQLFVBRk8sSUFBcUIsU0FBckIsU0FHUCxHQUhPLElBQXFCLFNBQXJCLFNBSVAsUUFKTyxJQUlLLENBQUMsQ0FKTixTQUFUOztFQU9BLE1BQUFBLFNBQUEsRUFBVztFQUNULElBQUEsS0FBSyxDQUFMLFdBQUssQ0FBTCxHQUFBLGNBQUE7RUFDRDs7RUFFRCxTQUFBLEtBQUE7RUFDRDtBQUVELEVBQU0sU0FBQSxRQUFBLENBQUEsS0FBQSxFQUFxQztFQUN6QyxFQUFBLFdBQVcsQ0FBQSxLQUFBLEVBQVgsVUFBVyxDQUFYO0VBRUEsTUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFkLEVBQWMsQ0FBZDtFQUNBLE1BQUksR0FBRyxHQUFHLEtBQUssQ0FBZixHQUFlLENBQWY7RUFDQSxNQUFJLFFBQVEsR0FBRyxLQUFLLENBQXBCLFFBQW9CLENBQXBCOztFQUVBLE1BQUksR0FBRyxLQUFILFNBQUEsSUFBcUIsQ0FBQyxXQUFXLENBQUEsR0FBQSxFQUFyQyxRQUFxQyxDQUFyQyxFQUFzRDtFQUNwRCxJQUFBLGVBQWU7O0VBRWYsUUFBSTtFQUNGLE1BQUEsS0FBSyxDQUFMLFVBQUssQ0FBTCxHQUFvQixFQUFwQixFQUFBO0VBREYsS0FBQSxTQUVVO0VBQ1IsTUFBQSxHQUFHLEdBQUcsYUFBTixFQUFBO0VBQ0EsTUFBQSxLQUFLLENBQUwsR0FBSyxDQUFMLEdBQUEsR0FBQTtFQUNBLE1BQUEsS0FBSyxDQUFMLFFBQUssQ0FBTCxHQUFrQixXQUFXLENBQTdCLEdBQTZCLENBQTdCO0VBQ0EsTUFBQSxVQUFVLENBQVYsR0FBVSxDQUFWO0VBQ0Q7RUFWSCxHQUFBLE1BV087RUFDTCxJQUFBLFVBQVUsQ0FBVixHQUFVLENBQVY7RUFDRDs7RUFFRCxTQUFPLEtBQUssQ0FBWixVQUFZLENBQVo7RUFDRDtBQUVELEVBQU0sU0FBQSxPQUFBLENBQUEsS0FBQSxFQUE4QjtFQUNsQyxFQUFBLFdBQVcsQ0FBQSxLQUFBLEVBQVgsU0FBVyxDQUFYO0VBRUEsTUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFmLEdBQWUsQ0FBZjtFQUVBLEVBQUEsU0FBUyxDQUFBLEdBQUEsRUFBVCxLQUFTLENBQVQ7RUFFQSxTQUFPLFVBQVUsQ0FBakIsR0FBaUIsQ0FBakI7RUFDRDs7RUFFRCxTQUFBLFdBQUEsQ0FBQSxLQUFBLEVBQUEsTUFBQSxFQUVnQjtFQUVkLE1BQUlBLFNBQUssSUFBSSxFQUFFLE9BQUEsS0FBQSxLQUFBLFFBQUEsSUFBNkIsS0FBSyxLQUFsQyxJQUFBLElBQStDLEVBQUUsSUFBaEUsS0FBYSxDQUFiLEVBQTRFO0VBQzFFLFVBQU0sSUFBQSxLQUFBLENBQ0QsTUFEQywrRkFDK0YsTUFBTSxDQUQzRyxLQUMyRyxDQURyRyxDQUFOO0VBS0Q7Ozs7RUFJSCxTQUFBLFNBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxFQUE2RDtFQUMzRCxNQUFJQSxTQUFLLElBQUksR0FBRyxLQUFoQixTQUFBLEVBQWdDO0VBQzlCLFVBQU0sSUFBQSxLQUFBLDBIQUNtSCxNQUFNLENBQzNILEtBQUssQ0FGVCxFQUVTLENBRHNILENBRHpILENBQU47RUFLRDs7RUFLSDtFQUVBO0VBQ0E7RUFDQTtFQUNBOzs7QUFDQSxFQUFNLFNBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLEVBQWlFO0VBQ3JFLEVBQUEsZUFBZSxDQUFmLFVBQWUsQ0FBZjtFQUVBLE1BQUEsR0FBQTs7RUFFQSxNQUFJO0VBQ0YsSUFBQSxRQUFRO0VBRFYsR0FBQSxTQUVVO0VBQ1IsSUFBQSxHQUFHLEdBQUcsYUFBTixFQUFBO0VBQ0Q7O0VBRUQsU0FBQSxHQUFBOztFQUlGO0VBQ0E7RUFDQTs7QUFDQSxFQUFNLFNBQUEsT0FBQSxDQUFBLFFBQUEsRUFBc0M7RUFDMUMsRUFBQSxpQkFBaUI7O0VBRWpCLE1BQUk7RUFDRixXQUFPLFFBQVAsRUFBQTtFQURGLEdBQUEsU0FFVTtFQUNSLElBQUEsZUFBZTtFQUNoQjtFQUNGOztFQ3pRSyxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUEsV0FBQSxFQUUyQjtFQUUvQixNQUFJLE1BQU0sR0FBRyxJQUFiLE9BQWEsRUFBYjtFQUNBLE1BQUksY0FBYyxHQUFHLE9BQUEsV0FBQSxLQUFyQixVQUFBOztFQUVBLFdBQUEsTUFBQSxDQUFBLElBQUEsRUFBdUI7RUFDckIsSUFBQSxVQUFVLENBQUMsTUFBTSxDQUFBLElBQUEsRUFBakIsR0FBaUIsQ0FBUCxDQUFWO0VBRUEsUUFIcUIsS0FHckIsQ0FIcUI7O0VBTXJCLFFBQUksY0FBYyxJQUFJLENBQUMsTUFBTSxDQUFOLEdBQUEsQ0FBdkIsSUFBdUIsQ0FBdkIsRUFBeUM7RUFDdkMsTUFBQSxLQUFLLEdBQUcsV0FBWSxDQUFaLElBQUEsQ0FBUixJQUFRLENBQVI7RUFDQSxNQUFBLE1BQU0sQ0FBTixHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7RUFGRixLQUFBLE1BR087RUFDTCxNQUFBLEtBQUssR0FBRyxNQUFNLENBQU4sR0FBQSxDQUFSLElBQVEsQ0FBUjtFQUNEOztFQUVELFdBQUEsS0FBQTtFQUNEOztFQUVELFdBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBQW9DO0VBQ2xDLElBQUEsV0FBVyxDQUFBLElBQUEsRUFBWCxHQUFXLENBQVg7RUFDQSxJQUFBLE1BQU0sQ0FBTixHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7RUFDRDs7RUFFRCxTQUFPO0VBQUUsSUFBQSxNQUFGLEVBQUUsTUFBRjtFQUFVLElBQUEsTUFBQSxFQUFBO0VBQVYsR0FBUDtFQUNEOztFQ2pDRCxJQUFNLDhCQUE4QixHQUFHLFNBQVMsQ0FBaEQsZ0NBQWdELENBQWhEO0VBRUEsSUFBTSxTQUFTLEdBQUcsU0FBbEIsRUFBQTs7RUFFQSxJQUFJLFNBQVMsQ0FBVCw4QkFBUyxDQUFULEtBQUosSUFBQSxFQUF3RDtFQUN0RCxRQUFNLElBQUEsS0FBQSxDQUFOLHNaQUFNLENBQU47RUFHRDs7RUFFRCxTQUFTLENBQVQsOEJBQVMsQ0FBVCxHQUFBLElBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
