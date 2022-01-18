define('@glimmer/reference', ['exports', '@glimmer/global-context', '@glimmer/util', '@glimmer/validator', '@glimmer/env'], function (exports, globalContext, util, validator, env) { 'use strict';

  var REFERENCE = util.symbol('REFERENCE');

  var ReferenceImpl = function ReferenceImpl(type) {
    this.tag = null;
    this.lastRevision = validator.INITIAL;
    this.children = null;
    this.compute = null;
    this.update = null;
    this[REFERENCE] = type;
  };

  function createPrimitiveRef(value) {
    var ref = new ReferenceImpl(2
    /* Unbound */
    );
    ref.tag = validator.CONSTANT_TAG;
    ref.lastValue = value;

    if (env.DEBUG) {
      ref.debugLabel = String(value);
    }

    return ref;
  }
  var UNDEFINED_REFERENCE = createPrimitiveRef(undefined);
  var NULL_REFERENCE = createPrimitiveRef(null);
  var TRUE_REFERENCE = createPrimitiveRef(true);
  var FALSE_REFERENCE = createPrimitiveRef(false);
  function createConstRef(value, debugLabel) {
    var ref = new ReferenceImpl(0
    /* Constant */
    );
    ref.lastValue = value;
    ref.tag = validator.CONSTANT_TAG;

    if (env.DEBUG) {
      ref.debugLabel = debugLabel;
    }

    return ref;
  }
  function createUnboundRef(value, debugLabel) {
    var ref = new ReferenceImpl(2
    /* Unbound */
    );
    ref.lastValue = value;
    ref.tag = validator.CONSTANT_TAG;

    if (env.DEBUG) {
      ref.debugLabel = debugLabel;
    }

    return ref;
  }
  function createComputeRef(compute, update, debugLabel) {
    if (update === void 0) {
      update = null;
    }

    if (debugLabel === void 0) {
      debugLabel = 'unknown';
    }

    var ref = new ReferenceImpl(1
    /* Compute */
    );
    ref.compute = compute;
    ref.update = update;

    if (env.DEBUG) {
      ref.debugLabel = "(result of a `" + debugLabel + "` helper)";
    }

    return ref;
  }
  function createReadOnlyRef(ref) {
    if (!isUpdatableRef(ref)) return ref;
    return createComputeRef(function () {
      return valueForRef(ref);
    }, null, ref.debugLabel);
  }
  function isInvokableRef(ref) {
    return ref[REFERENCE] === 3
    /* Invokable */
    ;
  }
  function createInvokableRef(inner) {
    var ref = createComputeRef(function () {
      return valueForRef(inner);
    }, function (value) {
      return updateRef(inner, value);
    });
    ref.debugLabel = inner.debugLabel;
    ref[REFERENCE] = 3
    /* Invokable */
    ;
    return ref;
  }
  function isConstRef(_ref) {
    var ref = _ref;
    return ref.tag === validator.CONSTANT_TAG;
  }
  function isUpdatableRef(_ref) {
    var ref = _ref;
    return ref.update !== null;
  }
  function valueForRef(_ref) {
    var ref = _ref;
    var tag = ref.tag;

    if (tag === validator.CONSTANT_TAG) {
      return ref.lastValue;
    }

    var lastRevision = ref.lastRevision;
    var lastValue;

    if (tag === null || !validator.validateTag(tag, lastRevision)) {
      var compute = ref.compute;
      tag = ref.tag = validator.track(function () {
        lastValue = ref.lastValue = compute();
      }, env.DEBUG && ref.debugLabel);
      ref.lastRevision = validator.valueForTag(tag);
    } else {
      lastValue = ref.lastValue;
    }

    validator.consumeTag(tag);
    return lastValue;
  }
  function updateRef(_ref, value) {
    var ref = _ref;
    var update = ref.update;
    update(value);
  }
  function childRefFor(_parentRef, path) {
    var parentRef = _parentRef;
    var type = parentRef[REFERENCE];
    var children = parentRef.children;
    var child;

    if (children === null) {
      children = parentRef.children = new Map();
    } else {
      child = children.get(path);

      if (child !== undefined) {
        return child;
      }
    }

    if (type === 2
    /* Unbound */
    ) {
        var parent = valueForRef(parentRef);

        if (util.isDict(parent)) {
          child = createUnboundRef(parent[path], env.DEBUG && parentRef.debugLabel + "." + path);
        } else {
          child = UNDEFINED_REFERENCE;
        }
      } else {
      child = createComputeRef(function () {
        var parent = valueForRef(parentRef);

        if (util.isDict(parent)) {
          return globalContext.getProp(parent, path);
        }
      }, function (val) {
        var parent = valueForRef(parentRef);

        if (util.isDict(parent)) {
          return globalContext.setProp(parent, path, val);
        }
      });

      if (env.DEBUG) {
        child.debugLabel = parentRef.debugLabel + "." + path;
      }
    }

    children.set(path, child);
    return child;
  }
  function childRefFromParts(root, parts) {
    var reference = root;

    for (var i = 0; i < parts.length; i++) {
      reference = childRefFor(reference, parts[i]);
    }

    return reference;
  }

  if (env.DEBUG) {
    exports.createDebugAliasRef = function createDebugAliasRef(debugLabel, inner) {
      var update = isUpdatableRef(inner) ? function (value) {
        return updateRef(inner, value);
      } : null;
      var ref = createComputeRef(function () {
        return valueForRef(inner);
      }, update);
      ref[REFERENCE] = inner[REFERENCE];
      ref.debugLabel = debugLabel;
      return ref;
    };
  }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
  var NULL_IDENTITY = {};

  var KEY = function KEY(_, index) {
    return index;
  };

  var INDEX = function INDEX(_, index) {
    return String(index);
  };

  var IDENTITY = function IDENTITY(item) {
    if (item === null) {
      // Returning null as an identity will cause failures since the iterator
      // can't tell that it's actually supposed to be null
      return NULL_IDENTITY;
    }

    return item;
  };

  function keyForPath(path) {
    if (env.DEBUG && path[0] === '@') {
      throw new Error("invalid keypath: '" + path + "', valid keys: @index, @identity, or a path");
    }

    return uniqueKeyFor(function (item) {
      return globalContext.getPath(item, path);
    });
  }

  function makeKeyFor(key) {
    switch (key) {
      case '@key':
        return uniqueKeyFor(KEY);

      case '@index':
        return uniqueKeyFor(INDEX);

      case '@identity':
        return uniqueKeyFor(IDENTITY);

      default:
        return keyForPath(key);
    }
  }

  var WeakMapWithPrimitives = /*#__PURE__*/function () {
    function WeakMapWithPrimitives() {}

    var _proto = WeakMapWithPrimitives.prototype;

    _proto.set = function set(key, value) {
      if (util.isObject(key) || typeof key === 'function') {
        this.weakMap.set(key, value);
      } else {
        this.primitiveMap.set(key, value);
      }
    };

    _proto.get = function get(key) {
      if (util.isObject(key) || typeof key === 'function') {
        return this.weakMap.get(key);
      } else {
        return this.primitiveMap.get(key);
      }
    };

    _createClass(WeakMapWithPrimitives, [{
      key: "weakMap",
      get: function get() {
        if (this._weakMap === undefined) {
          this._weakMap = new WeakMap();
        }

        return this._weakMap;
      }
    }, {
      key: "primitiveMap",
      get: function get() {
        if (this._primitiveMap === undefined) {
          this._primitiveMap = new Map();
        }

        return this._primitiveMap;
      }
    }]);

    return WeakMapWithPrimitives;
  }();

  var IDENTITIES = new WeakMapWithPrimitives();

  function identityForNthOccurence(value, count) {
    var identities = IDENTITIES.get(value);

    if (identities === undefined) {
      identities = [];
      IDENTITIES.set(value, identities);
    }

    var identity = identities[count];

    if (identity === undefined) {
      identity = {
        value: value,
        count: count
      };
      identities[count] = identity;
    }

    return identity;
  }
  /**
   * When iterating over a list, it's possible that an item with the same unique
   * key could be encountered twice:
   *
   * ```js
   * let arr = ['same', 'different', 'same', 'same'];
   * ```
   *
   * In general, we want to treat these items as _unique within the list_. To do
   * this, we track the occurences of every item as we iterate the list, and when
   * an item occurs more than once, we generate a new unique key just for that
   * item, and that occurence within the list. The next time we iterate the list,
   * and encounter an item for the nth time, we can get the _same_ key, and let
   * Glimmer know that it should reuse the DOM for the previous nth occurence.
   */


  function uniqueKeyFor(keyFor) {
    var seen = new WeakMapWithPrimitives();
    return function (value, memo) {
      var key = keyFor(value, memo);
      var count = seen.get(key) || 0;
      seen.set(key, count + 1);

      if (count === 0) {
        return key;
      }

      return identityForNthOccurence(key, count);
    };
  }

  function createIteratorRef(listRef, key) {
    return createComputeRef(function () {
      var iterable = valueForRef(listRef);
      var keyFor = makeKeyFor(key);

      if (Array.isArray(iterable)) {
        return new ArrayIterator(iterable, keyFor);
      }

      var maybeIterator = globalContext.toIterator(iterable);

      if (maybeIterator === null) {
        return new ArrayIterator(util.EMPTY_ARRAY, function () {
          return null;
        });
      }

      return new IteratorWrapper(maybeIterator, keyFor);
    });
  }
  function createIteratorItemRef(_value) {
    var value = _value;
    var tag = validator.createTag();
    return createComputeRef(function () {
      validator.consumeTag(tag);
      return value;
    }, function (newValue) {
      if (value !== newValue) {
        value = newValue;
        validator.dirtyTag(tag);
      }
    });
  }

  var IteratorWrapper = /*#__PURE__*/function () {
    function IteratorWrapper(inner, keyFor) {
      this.inner = inner;
      this.keyFor = keyFor;
    }

    var _proto2 = IteratorWrapper.prototype;

    _proto2.isEmpty = function isEmpty() {
      return this.inner.isEmpty();
    };

    _proto2.next = function next() {
      var nextValue = this.inner.next();

      if (nextValue !== null) {
        nextValue.key = this.keyFor(nextValue.value, nextValue.memo);
      }

      return nextValue;
    };

    return IteratorWrapper;
  }();

  var ArrayIterator = /*#__PURE__*/function () {
    function ArrayIterator(iterator, keyFor) {
      this.iterator = iterator;
      this.keyFor = keyFor;
      this.pos = 0;

      if (iterator.length === 0) {
        this.current = {
          kind: 'empty'
        };
      } else {
        this.current = {
          kind: 'first',
          value: iterator[this.pos]
        };
      }
    }

    var _proto3 = ArrayIterator.prototype;

    _proto3.isEmpty = function isEmpty() {
      return this.current.kind === 'empty';
    };

    _proto3.next = function next() {
      var value;
      var current = this.current;

      if (current.kind === 'first') {
        this.current = {
          kind: 'progress'
        };
        value = current.value;
      } else if (this.pos >= this.iterator.length - 1) {
        return null;
      } else {
        value = this.iterator[++this.pos];
      }

      var keyFor = this.keyFor;
      var key = keyFor(value, this.pos);
      var memo = this.pos;
      return {
        key: key,
        value: value,
        memo: memo
      };
    };

    return ArrayIterator;
  }();

  exports.FALSE_REFERENCE = FALSE_REFERENCE;
  exports.NULL_REFERENCE = NULL_REFERENCE;
  exports.REFERENCE = REFERENCE;
  exports.TRUE_REFERENCE = TRUE_REFERENCE;
  exports.UNDEFINED_REFERENCE = UNDEFINED_REFERENCE;
  exports.childRefFor = childRefFor;
  exports.childRefFromParts = childRefFromParts;
  exports.createComputeRef = createComputeRef;
  exports.createConstRef = createConstRef;
  exports.createInvokableRef = createInvokableRef;
  exports.createIteratorItemRef = createIteratorItemRef;
  exports.createIteratorRef = createIteratorRef;
  exports.createPrimitiveRef = createPrimitiveRef;
  exports.createReadOnlyRef = createReadOnlyRef;
  exports.createUnboundRef = createUnboundRef;
  exports.isConstRef = isConstRef;
  exports.isInvokableRef = isInvokableRef;
  exports.isUpdatableRef = isUpdatableRef;
  exports.updateRef = updateRef;
  exports.valueForRef = valueForRef;

  Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci1yZWZlcmVuY2UuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcmVmZXJlbmNlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvcmVmZXJlbmNlL2xpYi9pdGVyYWJsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRQcm9wLCBzZXRQcm9wIH0gZnJvbSAnQGdsaW1tZXIvZ2xvYmFsLWNvbnRleHQnO1xuaW1wb3J0IHsgT3B0aW9uLCBleHBlY3QsIHN5bWJvbCwgaXNEaWN0LCBfV2Vha1NldCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgVGFnLFxuICBDT05TVEFOVF9UQUcsXG4gIFJldmlzaW9uLFxuICB2YWxpZGF0ZVRhZyxcbiAgY29uc3VtZVRhZyxcbiAgSU5JVElBTCxcbiAgdmFsdWVGb3JUYWcsXG4gIHRyYWNrLFxufSBmcm9tICdAZ2xpbW1lci92YWxpZGF0b3InO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9lbnYnO1xuXG5leHBvcnQgY29uc3QgUkVGRVJFTkNFOiB1bmlxdWUgc3ltYm9sID0gc3ltYm9sKCdSRUZFUkVOQ0UnKTtcblxuY29uc3QgZW51bSBSZWZlcmVuY2VUeXBlIHtcbiAgQ29uc3RhbnQsXG4gIENvbXB1dGUsXG4gIFVuYm91bmQsXG4gIEludm9rYWJsZSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWZlcmVuY2U8X1QgPSB1bmtub3duPiB7XG4gIFtSRUZFUkVOQ0VdOiBSZWZlcmVuY2VUeXBlO1xuICBkZWJ1Z0xhYmVsPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBSZWZlcmVuY2U7XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGludGVyZmFjZSBSZWZlcmVuY2VFbnZpcm9ubWVudCB7XG4gIGdldFByb3Aob2JqOiB1bmtub3duLCBwYXRoOiBzdHJpbmcpOiB1bmtub3duO1xuICBzZXRQcm9wKG9iajogdW5rbm93biwgcGF0aDogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHVua25vd247XG59XG5cbmNsYXNzIFJlZmVyZW5jZUltcGw8VCA9IHVua25vd24+IGltcGxlbWVudHMgUmVmZXJlbmNlIHtcbiAgW1JFRkVSRU5DRV06IFJlZmVyZW5jZVR5cGU7XG4gIHB1YmxpYyB0YWc6IE9wdGlvbjxUYWc+ID0gbnVsbDtcbiAgcHVibGljIGxhc3RSZXZpc2lvbjogUmV2aXNpb24gPSBJTklUSUFMO1xuICBwdWJsaWMgbGFzdFZhbHVlPzogVDtcblxuICBwdWJsaWMgY2hpbGRyZW46IE9wdGlvbjxNYXA8c3RyaW5nIHwgUmVmZXJlbmNlLCBSZWZlcmVuY2U+PiA9IG51bGw7XG5cbiAgcHVibGljIGNvbXB1dGU6IE9wdGlvbjwoKSA9PiBUPiA9IG51bGw7XG4gIHB1YmxpYyB1cGRhdGU6IE9wdGlvbjwodmFsOiBUKSA9PiB2b2lkPiA9IG51bGw7XG5cbiAgcHVibGljIGRlYnVnTGFiZWw/OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodHlwZTogUmVmZXJlbmNlVHlwZSkge1xuICAgIHRoaXNbUkVGRVJFTkNFXSA9IHR5cGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByaW1pdGl2ZVJlZih2YWx1ZTogdW5rbm93bik6IFJlZmVyZW5jZSB7XG4gIGxldCByZWYgPSBuZXcgUmVmZXJlbmNlSW1wbChSZWZlcmVuY2VUeXBlLlVuYm91bmQpO1xuXG4gIHJlZi50YWcgPSBDT05TVEFOVF9UQUc7XG4gIHJlZi5sYXN0VmFsdWUgPSB2YWx1ZTtcblxuICBpZiAoREVCVUcpIHtcbiAgICByZWYuZGVidWdMYWJlbCA9IFN0cmluZyh2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gcmVmO1xufVxuXG5leHBvcnQgY29uc3QgVU5ERUZJTkVEX1JFRkVSRU5DRSA9IGNyZWF0ZVByaW1pdGl2ZVJlZih1bmRlZmluZWQpO1xuZXhwb3J0IGNvbnN0IE5VTExfUkVGRVJFTkNFID0gY3JlYXRlUHJpbWl0aXZlUmVmKG51bGwpO1xuZXhwb3J0IGNvbnN0IFRSVUVfUkVGRVJFTkNFID0gY3JlYXRlUHJpbWl0aXZlUmVmKHRydWUpO1xuZXhwb3J0IGNvbnN0IEZBTFNFX1JFRkVSRU5DRSA9IGNyZWF0ZVByaW1pdGl2ZVJlZihmYWxzZSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb25zdFJlZih2YWx1ZTogdW5rbm93biwgZGVidWdMYWJlbDogZmFsc2UgfCBzdHJpbmcpOiBSZWZlcmVuY2Uge1xuICBsZXQgcmVmID0gbmV3IFJlZmVyZW5jZUltcGwoUmVmZXJlbmNlVHlwZS5Db25zdGFudCk7XG5cbiAgcmVmLmxhc3RWYWx1ZSA9IHZhbHVlO1xuICByZWYudGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGlmIChERUJVRykge1xuICAgIHJlZi5kZWJ1Z0xhYmVsID0gZGVidWdMYWJlbCBhcyBzdHJpbmc7XG4gIH1cblxuICByZXR1cm4gcmVmO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVW5ib3VuZFJlZih2YWx1ZTogdW5rbm93biwgZGVidWdMYWJlbDogZmFsc2UgfCBzdHJpbmcpOiBSZWZlcmVuY2Uge1xuICBsZXQgcmVmID0gbmV3IFJlZmVyZW5jZUltcGwoUmVmZXJlbmNlVHlwZS5VbmJvdW5kKTtcblxuICByZWYubGFzdFZhbHVlID0gdmFsdWU7XG4gIHJlZi50YWcgPSBDT05TVEFOVF9UQUc7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgcmVmLmRlYnVnTGFiZWwgPSBkZWJ1Z0xhYmVsIGFzIHN0cmluZztcbiAgfVxuXG4gIHJldHVybiByZWY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wdXRlUmVmPFQgPSB1bmtub3duPihcbiAgY29tcHV0ZTogKCkgPT4gVCxcbiAgdXBkYXRlOiBPcHRpb248KHZhbHVlOiBUKSA9PiB2b2lkPiA9IG51bGwsXG4gIGRlYnVnTGFiZWw6IGZhbHNlIHwgc3RyaW5nID0gJ3Vua25vd24nXG4pOiBSZWZlcmVuY2U8VD4ge1xuICBsZXQgcmVmID0gbmV3IFJlZmVyZW5jZUltcGw8VD4oUmVmZXJlbmNlVHlwZS5Db21wdXRlKTtcblxuICByZWYuY29tcHV0ZSA9IGNvbXB1dGU7XG4gIHJlZi51cGRhdGUgPSB1cGRhdGU7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgcmVmLmRlYnVnTGFiZWwgPSBgKHJlc3VsdCBvZiBhIFxcYCR7ZGVidWdMYWJlbH1cXGAgaGVscGVyKWA7XG4gIH1cblxuICByZXR1cm4gcmVmO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVhZE9ubHlSZWYocmVmOiBSZWZlcmVuY2UpOiBSZWZlcmVuY2Uge1xuICBpZiAoIWlzVXBkYXRhYmxlUmVmKHJlZikpIHJldHVybiByZWY7XG5cbiAgcmV0dXJuIGNyZWF0ZUNvbXB1dGVSZWYoKCkgPT4gdmFsdWVGb3JSZWYocmVmKSwgbnVsbCwgcmVmLmRlYnVnTGFiZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJbnZva2FibGVSZWYocmVmOiBSZWZlcmVuY2UpIHtcbiAgcmV0dXJuIHJlZltSRUZFUkVOQ0VdID09PSBSZWZlcmVuY2VUeXBlLkludm9rYWJsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUludm9rYWJsZVJlZihpbm5lcjogUmVmZXJlbmNlKTogUmVmZXJlbmNlIHtcbiAgbGV0IHJlZiA9IGNyZWF0ZUNvbXB1dGVSZWYoXG4gICAgKCkgPT4gdmFsdWVGb3JSZWYoaW5uZXIpLFxuICAgICh2YWx1ZSkgPT4gdXBkYXRlUmVmKGlubmVyLCB2YWx1ZSlcbiAgKTtcbiAgcmVmLmRlYnVnTGFiZWwgPSBpbm5lci5kZWJ1Z0xhYmVsO1xuICByZWZbUkVGRVJFTkNFXSA9IFJlZmVyZW5jZVR5cGUuSW52b2thYmxlO1xuXG4gIHJldHVybiByZWY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0UmVmKF9yZWY6IFJlZmVyZW5jZSkge1xuICBsZXQgcmVmID0gX3JlZiBhcyBSZWZlcmVuY2VJbXBsO1xuXG4gIHJldHVybiByZWYudGFnID09PSBDT05TVEFOVF9UQUc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VwZGF0YWJsZVJlZihfcmVmOiBSZWZlcmVuY2UpIHtcbiAgbGV0IHJlZiA9IF9yZWYgYXMgUmVmZXJlbmNlSW1wbDtcblxuICByZXR1cm4gcmVmLnVwZGF0ZSAhPT0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlRm9yUmVmPFQ+KF9yZWY6IFJlZmVyZW5jZTxUPik6IFQge1xuICBsZXQgcmVmID0gX3JlZiBhcyBSZWZlcmVuY2VJbXBsPFQ+O1xuXG4gIGxldCB7IHRhZyB9ID0gcmVmO1xuXG4gIGlmICh0YWcgPT09IENPTlNUQU5UX1RBRykge1xuICAgIHJldHVybiByZWYubGFzdFZhbHVlIGFzIFQ7XG4gIH1cblxuICBsZXQgeyBsYXN0UmV2aXNpb24gfSA9IHJlZjtcbiAgbGV0IGxhc3RWYWx1ZTtcblxuICBpZiAodGFnID09PSBudWxsIHx8ICF2YWxpZGF0ZVRhZyh0YWcsIGxhc3RSZXZpc2lvbikpIHtcbiAgICBsZXQgeyBjb21wdXRlIH0gPSByZWY7XG5cbiAgICB0YWcgPSByZWYudGFnID0gdHJhY2soKCkgPT4ge1xuICAgICAgbGFzdFZhbHVlID0gcmVmLmxhc3RWYWx1ZSA9IGNvbXB1dGUhKCk7XG4gICAgfSwgREVCVUcgJiYgcmVmLmRlYnVnTGFiZWwpO1xuXG4gICAgcmVmLmxhc3RSZXZpc2lvbiA9IHZhbHVlRm9yVGFnKHRhZyk7XG4gIH0gZWxzZSB7XG4gICAgbGFzdFZhbHVlID0gcmVmLmxhc3RWYWx1ZTtcbiAgfVxuXG4gIGNvbnN1bWVUYWcodGFnKTtcblxuICByZXR1cm4gbGFzdFZhbHVlIGFzIFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVSZWYoX3JlZjogUmVmZXJlbmNlLCB2YWx1ZTogdW5rbm93bikge1xuICBsZXQgcmVmID0gX3JlZiBhcyBSZWZlcmVuY2VJbXBsO1xuXG4gIGxldCB1cGRhdGUgPSBleHBlY3QocmVmLnVwZGF0ZSwgJ2NhbGxlZCB1cGRhdGUgb24gYSBub24tdXBkYXRhYmxlIHJlZmVyZW5jZScpO1xuXG4gIHVwZGF0ZSh2YWx1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGlsZFJlZkZvcihfcGFyZW50UmVmOiBSZWZlcmVuY2UsIHBhdGg6IHN0cmluZyk6IFJlZmVyZW5jZSB7XG4gIGxldCBwYXJlbnRSZWYgPSBfcGFyZW50UmVmIGFzIFJlZmVyZW5jZUltcGw7XG5cbiAgbGV0IHR5cGUgPSBwYXJlbnRSZWZbUkVGRVJFTkNFXTtcblxuICBsZXQgY2hpbGRyZW4gPSBwYXJlbnRSZWYuY2hpbGRyZW47XG4gIGxldCBjaGlsZDogUmVmZXJlbmNlO1xuXG4gIGlmIChjaGlsZHJlbiA9PT0gbnVsbCkge1xuICAgIGNoaWxkcmVuID0gcGFyZW50UmVmLmNoaWxkcmVuID0gbmV3IE1hcCgpO1xuICB9IGVsc2Uge1xuICAgIGNoaWxkID0gY2hpbGRyZW4uZ2V0KHBhdGgpITtcblxuICAgIGlmIChjaGlsZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGUgPT09IFJlZmVyZW5jZVR5cGUuVW5ib3VuZCkge1xuICAgIGxldCBwYXJlbnQgPSB2YWx1ZUZvclJlZihwYXJlbnRSZWYpO1xuXG4gICAgaWYgKGlzRGljdChwYXJlbnQpKSB7XG4gICAgICBjaGlsZCA9IGNyZWF0ZVVuYm91bmRSZWYoXG4gICAgICAgIChwYXJlbnQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW3BhdGhdLFxuICAgICAgICBERUJVRyAmJiBgJHtwYXJlbnRSZWYuZGVidWdMYWJlbH0uJHtwYXRofWBcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkID0gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY2hpbGQgPSBjcmVhdGVDb21wdXRlUmVmKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBsZXQgcGFyZW50ID0gdmFsdWVGb3JSZWYocGFyZW50UmVmKTtcblxuICAgICAgICBpZiAoaXNEaWN0KHBhcmVudCkpIHtcbiAgICAgICAgICByZXR1cm4gZ2V0UHJvcChwYXJlbnQsIHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgKHZhbCkgPT4ge1xuICAgICAgICBsZXQgcGFyZW50ID0gdmFsdWVGb3JSZWYocGFyZW50UmVmKTtcblxuICAgICAgICBpZiAoaXNEaWN0KHBhcmVudCkpIHtcbiAgICAgICAgICByZXR1cm4gc2V0UHJvcChwYXJlbnQsIHBhdGgsIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBjaGlsZC5kZWJ1Z0xhYmVsID0gYCR7cGFyZW50UmVmLmRlYnVnTGFiZWx9LiR7cGF0aH1gO1xuICAgIH1cbiAgfVxuXG4gIGNoaWxkcmVuLnNldChwYXRoLCBjaGlsZCk7XG5cbiAgcmV0dXJuIGNoaWxkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRSZWZGcm9tUGFydHMocm9vdDogUmVmZXJlbmNlLCBwYXJ0czogc3RyaW5nW10pOiBSZWZlcmVuY2Uge1xuICBsZXQgcmVmZXJlbmNlID0gcm9vdDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVmZXJlbmNlID0gY2hpbGRSZWZGb3IocmVmZXJlbmNlLCBwYXJ0c1tpXSk7XG4gIH1cblxuICByZXR1cm4gcmVmZXJlbmNlO1xufVxuXG5leHBvcnQgbGV0IGNyZWF0ZURlYnVnQWxpYXNSZWY6IHVuZGVmaW5lZCB8ICgoZGVidWdMYWJlbDogc3RyaW5nLCBpbm5lcjogUmVmZXJlbmNlKSA9PiBSZWZlcmVuY2UpO1xuXG5pZiAoREVCVUcpIHtcbiAgY3JlYXRlRGVidWdBbGlhc1JlZiA9IChkZWJ1Z0xhYmVsOiBzdHJpbmcsIGlubmVyOiBSZWZlcmVuY2UpID0+IHtcbiAgICBsZXQgdXBkYXRlID0gaXNVcGRhdGFibGVSZWYoaW5uZXIpID8gKHZhbHVlOiB1bmtub3duKSA9PiB1cGRhdGVSZWYoaW5uZXIsIHZhbHVlKSA6IG51bGw7XG4gICAgbGV0IHJlZiA9IGNyZWF0ZUNvbXB1dGVSZWYoKCkgPT4gdmFsdWVGb3JSZWYoaW5uZXIpLCB1cGRhdGUpO1xuXG4gICAgcmVmW1JFRkVSRU5DRV0gPSBpbm5lcltSRUZFUkVOQ0VdO1xuXG4gICAgcmVmLmRlYnVnTGFiZWwgPSBkZWJ1Z0xhYmVsO1xuXG4gICAgcmV0dXJuIHJlZjtcbiAgfTtcbn1cbiIsImltcG9ydCB7IGdldFBhdGgsIHRvSXRlcmF0b3IgfSBmcm9tICdAZ2xpbW1lci9nbG9iYWwtY29udGV4dCc7XG5pbXBvcnQgeyBPcHRpb24sIERpY3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEVNUFRZX0FSUkFZLCBpc09iamVjdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9lbnYnO1xuaW1wb3J0IHsgY3JlYXRlVGFnLCBjb25zdW1lVGFnLCBkaXJ0eVRhZyB9IGZyb20gJ0BnbGltbWVyL3ZhbGlkYXRvcic7XG5pbXBvcnQgeyBSZWZlcmVuY2UsIFJlZmVyZW5jZUVudmlyb25tZW50LCB2YWx1ZUZvclJlZiwgY3JlYXRlQ29tcHV0ZVJlZiB9IGZyb20gJy4vcmVmZXJlbmNlJztcblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRpb25JdGVtPFQsIFU+IHtcbiAga2V5OiB1bmtub3duO1xuICB2YWx1ZTogVDtcbiAgbWVtbzogVTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBYnN0cmFjdEl0ZXJhdG9yPFQsIFUsIFYgZXh0ZW5kcyBJdGVyYXRpb25JdGVtPFQsIFU+PiB7XG4gIGlzRW1wdHkoKTogYm9vbGVhbjtcbiAgbmV4dCgpOiBPcHRpb248Vj47XG59XG5cbmV4cG9ydCB0eXBlIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0gPSBJdGVyYXRpb25JdGVtPHVua25vd24sIHVua25vd24+O1xuZXhwb3J0IHR5cGUgT3BhcXVlSXRlcmF0b3IgPSBBYnN0cmFjdEl0ZXJhdG9yPHVua25vd24sIHVua25vd24sIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhdG9yRGVsZWdhdGUge1xuICBpc0VtcHR5KCk6IGJvb2xlYW47XG4gIG5leHQoKTogeyB2YWx1ZTogdW5rbm93bjsgbWVtbzogdW5rbm93biB9IHwgbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvclJlZmVyZW5jZUVudmlyb25tZW50IGV4dGVuZHMgUmVmZXJlbmNlRW52aXJvbm1lbnQge1xuICBnZXRQYXRoKG9iajogdW5rbm93biwgcGF0aDogc3RyaW5nKTogdW5rbm93bjtcbiAgdG9JdGVyYXRvcihvYmo6IHVua25vd24pOiBPcHRpb248SXRlcmF0b3JEZWxlZ2F0ZT47XG59XG5cbnR5cGUgS2V5Rm9yID0gKGl0ZW06IHVua25vd24sIGluZGV4OiB1bmtub3duKSA9PiB1bmtub3duO1xuXG5jb25zdCBOVUxMX0lERU5USVRZID0ge307XG5cbmNvbnN0IEtFWTogS2V5Rm9yID0gKF8sIGluZGV4KSA9PiBpbmRleDtcbmNvbnN0IElOREVYOiBLZXlGb3IgPSAoXywgaW5kZXgpID0+IFN0cmluZyhpbmRleCk7XG5jb25zdCBJREVOVElUWTogS2V5Rm9yID0gKGl0ZW0pID0+IHtcbiAgaWYgKGl0ZW0gPT09IG51bGwpIHtcbiAgICAvLyBSZXR1cm5pbmcgbnVsbCBhcyBhbiBpZGVudGl0eSB3aWxsIGNhdXNlIGZhaWx1cmVzIHNpbmNlIHRoZSBpdGVyYXRvclxuICAgIC8vIGNhbid0IHRlbGwgdGhhdCBpdCdzIGFjdHVhbGx5IHN1cHBvc2VkIHRvIGJlIG51bGxcbiAgICByZXR1cm4gTlVMTF9JREVOVElUWTtcbiAgfVxuXG4gIHJldHVybiBpdGVtO1xufTtcblxuZnVuY3Rpb24ga2V5Rm9yUGF0aChwYXRoOiBzdHJpbmcpOiBLZXlGb3Ige1xuICBpZiAoREVCVUcgJiYgcGF0aFswXSA9PT0gJ0AnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGtleXBhdGg6ICcke3BhdGh9JywgdmFsaWQga2V5czogQGluZGV4LCBAaWRlbnRpdHksIG9yIGEgcGF0aGApO1xuICB9XG4gIHJldHVybiB1bmlxdWVLZXlGb3IoKGl0ZW0pID0+IGdldFBhdGgoaXRlbSBhcyBvYmplY3QsIHBhdGgpKTtcbn1cblxuZnVuY3Rpb24gbWFrZUtleUZvcihrZXk6IHN0cmluZykge1xuICBzd2l0Y2ggKGtleSkge1xuICAgIGNhc2UgJ0BrZXknOlxuICAgICAgcmV0dXJuIHVuaXF1ZUtleUZvcihLRVkpO1xuICAgIGNhc2UgJ0BpbmRleCc6XG4gICAgICByZXR1cm4gdW5pcXVlS2V5Rm9yKElOREVYKTtcbiAgICBjYXNlICdAaWRlbnRpdHknOlxuICAgICAgcmV0dXJuIHVuaXF1ZUtleUZvcihJREVOVElUWSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBrZXlGb3JQYXRoKGtleSk7XG4gIH1cbn1cblxuY2xhc3MgV2Vha01hcFdpdGhQcmltaXRpdmVzPFQ+IHtcbiAgcHJpdmF0ZSBfd2Vha01hcD86IFdlYWtNYXA8b2JqZWN0LCBUPjtcbiAgcHJpdmF0ZSBfcHJpbWl0aXZlTWFwPzogTWFwPHVua25vd24sIFQ+O1xuXG4gIHByaXZhdGUgZ2V0IHdlYWtNYXAoKSB7XG4gICAgaWYgKHRoaXMuX3dlYWtNYXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fd2Vha01hcCA9IG5ldyBXZWFrTWFwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3dlYWtNYXA7XG4gIH1cblxuICBwcml2YXRlIGdldCBwcmltaXRpdmVNYXAoKSB7XG4gICAgaWYgKHRoaXMuX3ByaW1pdGl2ZU1hcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9wcmltaXRpdmVNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3ByaW1pdGl2ZU1hcDtcbiAgfVxuXG4gIHNldChrZXk6IHVua25vd24sIHZhbHVlOiBUKSB7XG4gICAgaWYgKGlzT2JqZWN0KGtleSkgfHwgdHlwZW9mIGtleSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy53ZWFrTWFwLnNldChrZXkgYXMgb2JqZWN0LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJpbWl0aXZlTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBnZXQoa2V5OiB1bmtub3duKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGlzT2JqZWN0KGtleSkgfHwgdHlwZW9mIGtleSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMud2Vha01hcC5nZXQoa2V5IGFzIG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnByaW1pdGl2ZU1hcC5nZXQoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgSURFTlRJVElFUyA9IG5ldyBXZWFrTWFwV2l0aFByaW1pdGl2ZXM8b2JqZWN0W10+KCk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5Rm9yTnRoT2NjdXJlbmNlKHZhbHVlOiBhbnksIGNvdW50OiBudW1iZXIpIHtcbiAgbGV0IGlkZW50aXRpZXMgPSBJREVOVElUSUVTLmdldCh2YWx1ZSk7XG5cbiAgaWYgKGlkZW50aXRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgIGlkZW50aXRpZXMgPSBbXTtcbiAgICBJREVOVElUSUVTLnNldCh2YWx1ZSwgaWRlbnRpdGllcyk7XG4gIH1cblxuICBsZXQgaWRlbnRpdHkgPSBpZGVudGl0aWVzW2NvdW50XTtcblxuICBpZiAoaWRlbnRpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgIGlkZW50aXR5ID0geyB2YWx1ZSwgY291bnQgfTtcbiAgICBpZGVudGl0aWVzW2NvdW50XSA9IGlkZW50aXR5O1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aXR5O1xufVxuXG4vKipcbiAqIFdoZW4gaXRlcmF0aW5nIG92ZXIgYSBsaXN0LCBpdCdzIHBvc3NpYmxlIHRoYXQgYW4gaXRlbSB3aXRoIHRoZSBzYW1lIHVuaXF1ZVxuICoga2V5IGNvdWxkIGJlIGVuY291bnRlcmVkIHR3aWNlOlxuICpcbiAqIGBgYGpzXG4gKiBsZXQgYXJyID0gWydzYW1lJywgJ2RpZmZlcmVudCcsICdzYW1lJywgJ3NhbWUnXTtcbiAqIGBgYFxuICpcbiAqIEluIGdlbmVyYWwsIHdlIHdhbnQgdG8gdHJlYXQgdGhlc2UgaXRlbXMgYXMgX3VuaXF1ZSB3aXRoaW4gdGhlIGxpc3RfLiBUbyBkb1xuICogdGhpcywgd2UgdHJhY2sgdGhlIG9jY3VyZW5jZXMgb2YgZXZlcnkgaXRlbSBhcyB3ZSBpdGVyYXRlIHRoZSBsaXN0LCBhbmQgd2hlblxuICogYW4gaXRlbSBvY2N1cnMgbW9yZSB0aGFuIG9uY2UsIHdlIGdlbmVyYXRlIGEgbmV3IHVuaXF1ZSBrZXkganVzdCBmb3IgdGhhdFxuICogaXRlbSwgYW5kIHRoYXQgb2NjdXJlbmNlIHdpdGhpbiB0aGUgbGlzdC4gVGhlIG5leHQgdGltZSB3ZSBpdGVyYXRlIHRoZSBsaXN0LFxuICogYW5kIGVuY291bnRlciBhbiBpdGVtIGZvciB0aGUgbnRoIHRpbWUsIHdlIGNhbiBnZXQgdGhlIF9zYW1lXyBrZXksIGFuZCBsZXRcbiAqIEdsaW1tZXIga25vdyB0aGF0IGl0IHNob3VsZCByZXVzZSB0aGUgRE9NIGZvciB0aGUgcHJldmlvdXMgbnRoIG9jY3VyZW5jZS5cbiAqL1xuZnVuY3Rpb24gdW5pcXVlS2V5Rm9yKGtleUZvcjogS2V5Rm9yKSB7XG4gIGxldCBzZWVuID0gbmV3IFdlYWtNYXBXaXRoUHJpbWl0aXZlczxudW1iZXI+KCk7XG5cbiAgcmV0dXJuICh2YWx1ZTogdW5rbm93biwgbWVtbzogdW5rbm93bikgPT4ge1xuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUsIG1lbW8pO1xuICAgIGxldCBjb3VudCA9IHNlZW4uZ2V0KGtleSkgfHwgMDtcblxuICAgIHNlZW4uc2V0KGtleSwgY291bnQgKyAxKTtcblxuICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG5cbiAgICByZXR1cm4gaWRlbnRpdHlGb3JOdGhPY2N1cmVuY2Uoa2V5LCBjb3VudCk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvclJlZihsaXN0UmVmOiBSZWZlcmVuY2UsIGtleTogc3RyaW5nKSB7XG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKCgpID0+IHtcbiAgICBsZXQgaXRlcmFibGUgPSB2YWx1ZUZvclJlZihsaXN0UmVmKSBhcyB7IFtTeW1ib2wuaXRlcmF0b3JdOiBhbnkgfSB8IG51bGwgfCBmYWxzZTtcblxuICAgIGxldCBrZXlGb3IgPSBtYWtlS2V5Rm9yKGtleSk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVyYWJsZSkpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihpdGVyYWJsZSwga2V5Rm9yKTtcbiAgICB9XG5cbiAgICBsZXQgbWF5YmVJdGVyYXRvciA9IHRvSXRlcmF0b3IoaXRlcmFibGUpO1xuXG4gICAgaWYgKG1heWJlSXRlcmF0b3IgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihFTVBUWV9BUlJBWSwgKCkgPT4gbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcldyYXBwZXIobWF5YmVJdGVyYXRvciwga2V5Rm9yKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvckl0ZW1SZWYoX3ZhbHVlOiB1bmtub3duKSB7XG4gIGxldCB2YWx1ZSA9IF92YWx1ZTtcbiAgbGV0IHRhZyA9IGNyZWF0ZVRhZygpO1xuXG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKFxuICAgICgpID0+IHtcbiAgICAgIGNvbnN1bWVUYWcodGFnKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBkaXJ0eVRhZyh0YWcpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbn1cblxuY2xhc3MgSXRlcmF0b3JXcmFwcGVyIGltcGxlbWVudHMgT3BhcXVlSXRlcmF0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBJdGVyYXRvckRlbGVnYXRlLCBwcml2YXRlIGtleUZvcjogS2V5Rm9yKSB7fVxuXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXIuaXNFbXB0eSgpO1xuICB9XG5cbiAgbmV4dCgpIHtcbiAgICBsZXQgbmV4dFZhbHVlID0gdGhpcy5pbm5lci5uZXh0KCkgYXMgT3BhcXVlSXRlcmF0aW9uSXRlbTtcblxuICAgIGlmIChuZXh0VmFsdWUgIT09IG51bGwpIHtcbiAgICAgIG5leHRWYWx1ZS5rZXkgPSB0aGlzLmtleUZvcihuZXh0VmFsdWUudmFsdWUsIG5leHRWYWx1ZS5tZW1vKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFZhbHVlO1xuICB9XG59XG5cbmNsYXNzIEFycmF5SXRlcmF0b3IgaW1wbGVtZW50cyBPcGFxdWVJdGVyYXRvciB7XG4gIHByaXZhdGUgY3VycmVudDogeyBraW5kOiAnZW1wdHknIH0gfCB7IGtpbmQ6ICdmaXJzdCc7IHZhbHVlOiB1bmtub3duIH0gfCB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgcHJpdmF0ZSBwb3MgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlcmF0b3I6IHVua25vd25bXSwgcHJpdmF0ZSBrZXlGb3I6IEtleUZvcikge1xuICAgIGlmIChpdGVyYXRvci5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ2VtcHR5JyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdmaXJzdCcsIHZhbHVlOiBpdGVyYXRvclt0aGlzLnBvc10gfTtcbiAgICB9XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnQua2luZCA9PT0gJ2VtcHR5JztcbiAgfVxuXG4gIG5leHQoKTogT3B0aW9uPEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgbnVtYmVyPj4ge1xuICAgIGxldCB2YWx1ZTogdW5rbm93bjtcblxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5jdXJyZW50O1xuICAgIGlmIChjdXJyZW50LmtpbmQgPT09ICdmaXJzdCcpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ3Byb2dyZXNzJyB9O1xuICAgICAgdmFsdWUgPSBjdXJyZW50LnZhbHVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wb3MgPj0gdGhpcy5pdGVyYXRvci5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSB0aGlzLml0ZXJhdG9yWysrdGhpcy5wb3NdO1xuICAgIH1cblxuICAgIGxldCB7IGtleUZvciB9ID0gdGhpcztcblxuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUgYXMgRGljdCwgdGhpcy5wb3MpO1xuICAgIGxldCBtZW1vID0gdGhpcy5wb3M7XG5cbiAgICByZXR1cm4geyBrZXksIHZhbHVlLCBtZW1vIH07XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJzeW1ib2wiLCJJTklUSUFMIiwiQ09OU1RBTlRfVEFHIiwiREVCVUciLCJ2YWxpZGF0ZVRhZyIsInRyYWNrIiwidmFsdWVGb3JUYWciLCJjb25zdW1lVGFnIiwiaXNEaWN0IiwiZ2V0UHJvcCIsInNldFByb3AiLCJjcmVhdGVEZWJ1Z0FsaWFzUmVmIiwiZ2V0UGF0aCIsImlzT2JqZWN0IiwidG9JdGVyYXRvciIsIkVNUFRZX0FSUkFZIiwiY3JlYXRlVGFnIiwiZGlydHlUYWciXSwibWFwcGluZ3MiOiI7O01BY2EsU0FBUyxHQUFrQkEsV0FBTSxDQUF2QyxXQUF1Qzs7TUF1QjlDLGdCQWFFLHVCQUFBLElBQUEsRUFBK0I7RUFYeEIsT0FBQSxHQUFBLEdBQUEsSUFBQTtFQUNBLE9BQUEsWUFBQSxHQUFBQyxpQkFB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
