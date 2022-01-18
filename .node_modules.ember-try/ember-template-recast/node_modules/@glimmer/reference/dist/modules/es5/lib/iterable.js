function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { getPath, toIterator } from '@glimmer/global-context';
import { EMPTY_ARRAY, isObject } from '@glimmer/util';
import { DEBUG } from '@glimmer/env';
import { createTag, consumeTag, dirtyTag } from '@glimmer/validator';
import { valueForRef, createComputeRef } from './reference';
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
  if (DEBUG && path[0] === '@') {
    throw new Error("invalid keypath: '" + path + "', valid keys: @index, @identity, or a path");
  }

  return uniqueKeyFor(function (item) {
    return getPath(item, path);
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
    if (isObject(key) || typeof key === 'function') {
      this.weakMap.set(key, value);
    } else {
      this.primitiveMap.set(key, value);
    }
  };

  _proto.get = function get(key) {
    if (isObject(key) || typeof key === 'function') {
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

export function createIteratorRef(listRef, key) {
  return createComputeRef(function () {
    var iterable = valueForRef(listRef);
    var keyFor = makeKeyFor(key);

    if (Array.isArray(iterable)) {
      return new ArrayIterator(iterable, keyFor);
    }

    var maybeIterator = toIterator(iterable);

    if (maybeIterator === null) {
      return new ArrayIterator(EMPTY_ARRAY, function () {
        return null;
      });
    }

    return new IteratorWrapper(maybeIterator, keyFor);
  });
}
export function createIteratorItemRef(_value) {
  var value = _value;
  var tag = createTag();
  return createComputeRef(function () {
    consumeTag(tag);
    return value;
  }, function (newValue) {
    if (value !== newValue) {
      value = newValue;
      dirtyTag(tag);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLFNBQUEsT0FBQSxFQUFBLFVBQUEsUUFBQSx5QkFBQTtBQUVBLFNBQUEsV0FBQSxFQUFBLFFBQUEsUUFBQSxlQUFBO0FBQ0EsU0FBQSxLQUFBLFFBQUEsY0FBQTtBQUNBLFNBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxRQUFBLFFBQUEsb0JBQUE7QUFDQSxTQUFBLFdBQUEsRUFBQSxnQkFBQSxRQUFBLGFBQUE7QUE0QkEsSUFBTSxhQUFhLEdBQW5CLEVBQUE7O0FBRUEsSUFBTSxHQUFHLEdBQVcsU0FBZCxHQUFjLENBQUEsQ0FBQSxFQUFBLEtBQUE7QUFBQSxTQUFwQixLQUFvQjtBQUFBLENBQXBCOztBQUNBLElBQU0sS0FBSyxHQUFXLFNBQWhCLEtBQWdCLENBQUEsQ0FBQSxFQUFBLEtBQUE7QUFBQSxTQUFjLE1BQU0sQ0FBMUMsS0FBMEMsQ0FBcEI7QUFBQSxDQUF0Qjs7QUFDQSxJQUFNLFFBQVEsR0FBWSxTQUFwQixRQUFvQixDQUFBLElBQUQsRUFBUztBQUNoQyxNQUFJLElBQUksS0FBUixJQUFBLEVBQW1CO0FBQ2pCO0FBQ0E7QUFDQSxXQUFBLGFBQUE7QUFDRDs7QUFFRCxTQUFBLElBQUE7QUFQRixDQUFBOztBQVVBLFNBQUEsVUFBQSxDQUFBLElBQUEsRUFBZ0M7QUFDOUIsTUFBSSxLQUFLLElBQUksSUFBSSxDQUFKLENBQUksQ0FBSixLQUFiLEdBQUEsRUFBOEI7QUFDNUIsVUFBTSxJQUFBLEtBQUEsd0JBQU4sSUFBTSxpREFBTjtBQUNEOztBQUNELFNBQU8sWUFBWSxDQUFFLFVBQUEsSUFBRDtBQUFBLFdBQVUsT0FBTyxDQUFBLElBQUEsRUFBckMsSUFBcUMsQ0FBakI7QUFBQSxHQUFELENBQW5CO0FBQ0Q7O0FBRUQsU0FBQSxVQUFBLENBQUEsR0FBQSxFQUErQjtBQUM3QixVQUFBLEdB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QUEsSUFBQTtBQURLLEtBQUEsTUFFQTtBQUNMLE1BQUEsS0FBSyxHQUFHLEtBQUEsUUFBQSxDQUFjLEVBQUUsS0FBeEIsR0FBUSxDQUFSO0FBQ0Q7O0FBWEMsUUFhSSxNQWJKLEdBYUYsSUFiRSxDQWFJLE1BYko7QUFlRixRQUFJLEdBQUcsR0FBRyxNQUFNLENBQUEsS0FBQSxFQUFnQixLQUFoQyxHQUFnQixDQUFoQjtBQUNBLFFBQUksSUFBSSxHQUFHLEtBQVgsR0FBQTtBQUVBLFdBQU87QUFBRSxNQUFBLEdBQUYsRUFBRSxHQUFGO0FBQU8sTUFBQSxLQUFQLEVBQU8sS0FBUDtBQUFjLE1BQUEsSUFBQSxFQUFBO0FBQWQsS0FBUDtBQUNELEciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRQYXRoLCB0b0l0ZXJhdG9yIH0gZnJvbSAnQGdsaW1tZXIvZ2xvYmFsLWNvbnRleHQnO1xuaW1wb3J0IHsgT3B0aW9uLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBFTVBUWV9BUlJBWSwgaXNPYmplY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcbmltcG9ydCB7IGNyZWF0ZVRhZywgY29uc3VtZVRhZywgZGlydHlUYWcgfSBmcm9tICdAZ2xpbW1lci92YWxpZGF0b3InO1xuaW1wb3J0IHsgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbnZpcm9ubWVudCwgdmFsdWVGb3JSZWYsIGNyZWF0ZUNvbXB1dGVSZWYgfSBmcm9tICcuL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0aW9uSXRlbTxULCBVPiB7XG4gIGtleTogdW5rbm93bjtcbiAgdmFsdWU6IFQ7XG4gIG1lbW86IFU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWJzdHJhY3RJdGVyYXRvcjxULCBVLCBWIGV4dGVuZHMgSXRlcmF0aW9uSXRlbTxULCBVPj4ge1xuICBpc0VtcHR5KCk6IGJvb2xlYW47XG4gIG5leHQoKTogT3B0aW9uPFY+O1xufVxuXG5leHBvcnQgdHlwZSBPcGFxdWVJdGVyYXRpb25JdGVtID0gSXRlcmF0aW9uSXRlbTx1bmtub3duLCB1bmtub3duPjtcbmV4cG9ydCB0eXBlIE9wYXF1ZUl0ZXJhdG9yID0gQWJzdHJhY3RJdGVyYXRvcjx1bmtub3duLCB1bmtub3duLCBPcGFxdWVJdGVyYXRpb25JdGVtPjtcblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvckRlbGVnYXRlIHtcbiAgaXNFbXB0eSgpOiBib29sZWFuO1xuICBuZXh0KCk6IHsgdmFsdWU6IHVua25vd247IG1lbW86IHVua25vd24gfSB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0b3JSZWZlcmVuY2VFbnZpcm9ubWVudCBleHRlbmRzIFJlZmVyZW5jZUVudmlyb25tZW50IHtcbiAgZ2V0UGF0aChvYmo6IHVua25vd24sIHBhdGg6IHN0cmluZyk6IHVua25vd247XG4gIHRvSXRlcmF0b3Iob2JqOiB1bmtub3duKTogT3B0aW9uPEl0ZXJhdG9yRGVsZWdhdGU+O1xufVxuXG50eXBlIEtleUZvciA9IChpdGVtOiB1bmtub3duLCBpbmRleDogdW5rbm93bikgPT4gdW5rbm93bjtcblxuY29uc3QgTlVMTF9JREVOVElUWSA9IHt9O1xuXG5jb25zdCBLRVk6IEtleUZvciA9IChfLCBpbmRleCkgPT4gaW5kZXg7XG5jb25zdCBJTkRFWDogS2V5Rm9yID0gKF8sIGluZGV4KSA9PiBTdHJpbmcoaW5kZXgpO1xuY29uc3QgSURFTlRJVFk6IEtleUZvciA9IChpdGVtKSA9PiB7XG4gIGlmIChpdGVtID09PSBudWxsKSB7XG4gICAgLy8gUmV0dXJuaW5nIG51bGwgYXMgYW4gaWRlbnRpdHkgd2lsbCBjYXVzZSBmYWlsdXJlcyBzaW5jZSB0aGUgaXRlcmF0b3JcbiAgICAvLyBjYW4ndCB0ZWxsIHRoYXQgaXQncyBhY3R1YWxseSBzdXBwb3NlZCB0byBiZSBudWxsXG4gICAgcmV0dXJuIE5VTExfSURFTlRJVFk7XG4gIH1cblxuICByZXR1cm4gaXRlbTtcbn07XG5cbmZ1bmN0aW9uIGtleUZvclBhdGgocGF0aDogc3RyaW5nKTogS2V5Rm9yIHtcbiAgaWYgKERFQlVHICYmIHBhdGhbMF0gPT09ICdAJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBrZXlwYXRoOiAnJHtwYXRofScsIHZhbGlkIGtleXM6IEBpbmRleCwgQGlkZW50aXR5LCBvciBhIHBhdGhgKTtcbiAgfVxuICByZXR1cm4gdW5pcXVlS2V5Rm9yKChpdGVtKSA9PiBnZXRQYXRoKGl0ZW0gYXMgb2JqZWN0LCBwYXRoKSk7XG59XG5cbmZ1bmN0aW9uIG1ha2VLZXlGb3Ioa2V5OiBzdHJpbmcpIHtcbiAgc3dpdGNoIChrZXkpIHtcbiAgICBjYXNlICdAa2V5JzpcbiAgICAgIHJldHVybiB1bmlxdWVLZXlGb3IoS0VZKTtcbiAgICBjYXNlICdAaW5kZXgnOlxuICAgICAgcmV0dXJuIHVuaXF1ZUtleUZvcihJTkRFWCk7XG4gICAgY2FzZSAnQGlkZW50aXR5JzpcbiAgICAgIHJldHVybiB1bmlxdWVLZXlGb3IoSURFTlRJVFkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ga2V5Rm9yUGF0aChrZXkpO1xuICB9XG59XG5cbmNsYXNzIFdlYWtNYXBXaXRoUHJpbWl0aXZlczxUPiB7XG4gIHByaXZhdGUgX3dlYWtNYXA/OiBXZWFrTWFwPG9iamVjdCwgVD47XG4gIHByaXZhdGUgX3ByaW1pdGl2ZU1hcD86IE1hcDx1bmtub3duLCBUPjtcblxuICBwcml2YXRlIGdldCB3ZWFrTWFwKCkge1xuICAgIGlmICh0aGlzLl93ZWFrTWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX3dlYWtNYXAgPSBuZXcgV2Vha01hcCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl93ZWFrTWFwO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgcHJpbWl0aXZlTWFwKCkge1xuICAgIGlmICh0aGlzLl9wcmltaXRpdmVNYXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcHJpbWl0aXZlTWFwID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wcmltaXRpdmVNYXA7XG4gIH1cblxuICBzZXQoa2V5OiB1bmtub3duLCB2YWx1ZTogVCkge1xuICAgIGlmIChpc09iamVjdChrZXkpIHx8IHR5cGVvZiBrZXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMud2Vha01hcC5zZXQoa2V5IGFzIG9iamVjdCwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByaW1pdGl2ZU1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0KGtleTogdW5rbm93bik6IFQgfCB1bmRlZmluZWQge1xuICAgIGlmIChpc09iamVjdChrZXkpIHx8IHR5cGVvZiBrZXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLndlYWtNYXAuZ2V0KGtleSBhcyBvYmplY3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wcmltaXRpdmVNYXAuZ2V0KGtleSk7XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IElERU5USVRJRVMgPSBuZXcgV2Vha01hcFdpdGhQcmltaXRpdmVzPG9iamVjdFtdPigpO1xuXG5mdW5jdGlvbiBpZGVudGl0eUZvck50aE9jY3VyZW5jZSh2YWx1ZTogYW55LCBjb3VudDogbnVtYmVyKSB7XG4gIGxldCBpZGVudGl0aWVzID0gSURFTlRJVElFUy5nZXQodmFsdWUpO1xuXG4gIGlmIChpZGVudGl0aWVzID09PSB1bmRlZmluZWQpIHtcbiAgICBpZGVudGl0aWVzID0gW107XG4gICAgSURFTlRJVElFUy5zZXQodmFsdWUsIGlkZW50aXRpZXMpO1xuICB9XG5cbiAgbGV0IGlkZW50aXR5ID0gaWRlbnRpdGllc1tjb3VudF07XG5cbiAgaWYgKGlkZW50aXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICBpZGVudGl0eSA9IHsgdmFsdWUsIGNvdW50IH07XG4gICAgaWRlbnRpdGllc1tjb3VudF0gPSBpZGVudGl0eTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGl0eTtcbn1cblxuLyoqXG4gKiBXaGVuIGl0ZXJhdGluZyBvdmVyIGEgbGlzdCwgaXQncyBwb3NzaWJsZSB0aGF0IGFuIGl0ZW0gd2l0aCB0aGUgc2FtZSB1bmlxdWVcbiAqIGtleSBjb3VsZCBiZSBlbmNvdW50ZXJlZCB0d2ljZTpcbiAqXG4gKiBgYGBqc1xuICogbGV0IGFyciA9IFsnc2FtZScsICdkaWZmZXJlbnQnLCAnc2FtZScsICdzYW1lJ107XG4gKiBgYGBcbiAqXG4gKiBJbiBnZW5lcmFsLCB3ZSB3YW50IHRvIHRyZWF0IHRoZXNlIGl0ZW1zIGFzIF91bmlxdWUgd2l0aGluIHRoZSBsaXN0Xy4gVG8gZG9cbiAqIHRoaXMsIHdlIHRyYWNrIHRoZSBvY2N1cmVuY2VzIG9mIGV2ZXJ5IGl0ZW0gYXMgd2UgaXRlcmF0ZSB0aGUgbGlzdCwgYW5kIHdoZW5cbiAqIGFuIGl0ZW0gb2NjdXJzIG1vcmUgdGhhbiBvbmNlLCB3ZSBnZW5lcmF0ZSBhIG5ldyB1bmlxdWUga2V5IGp1c3QgZm9yIHRoYXRcbiAqIGl0ZW0sIGFuZCB0aGF0IG9jY3VyZW5jZSB3aXRoaW4gdGhlIGxpc3QuIFRoZSBuZXh0IHRpbWUgd2UgaXRlcmF0ZSB0aGUgbGlzdCxcbiAqIGFuZCBlbmNvdW50ZXIgYW4gaXRlbSBmb3IgdGhlIG50aCB0aW1lLCB3ZSBjYW4gZ2V0IHRoZSBfc2FtZV8ga2V5LCBhbmQgbGV0XG4gKiBHbGltbWVyIGtub3cgdGhhdCBpdCBzaG91bGQgcmV1c2UgdGhlIERPTSBmb3IgdGhlIHByZXZpb3VzIG50aCBvY2N1cmVuY2UuXG4gKi9cbmZ1bmN0aW9uIHVuaXF1ZUtleUZvcihrZXlGb3I6IEtleUZvcikge1xuICBsZXQgc2VlbiA9IG5ldyBXZWFrTWFwV2l0aFByaW1pdGl2ZXM8bnVtYmVyPigpO1xuXG4gIHJldHVybiAodmFsdWU6IHVua25vd24sIG1lbW86IHVua25vd24pID0+IHtcbiAgICBsZXQga2V5ID0ga2V5Rm9yKHZhbHVlLCBtZW1vKTtcbiAgICBsZXQgY291bnQgPSBzZWVuLmdldChrZXkpIHx8IDA7XG5cbiAgICBzZWVuLnNldChrZXksIGNvdW50ICsgMSk7XG5cbiAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlkZW50aXR5Rm9yTnRoT2NjdXJlbmNlKGtleSwgY291bnQpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSXRlcmF0b3JSZWYobGlzdFJlZjogUmVmZXJlbmNlLCBrZXk6IHN0cmluZykge1xuICByZXR1cm4gY3JlYXRlQ29tcHV0ZVJlZigoKSA9PiB7XG4gICAgbGV0IGl0ZXJhYmxlID0gdmFsdWVGb3JSZWYobGlzdFJlZikgYXMgeyBbU3ltYm9sLml0ZXJhdG9yXTogYW55IH0gfCBudWxsIHwgZmFsc2U7XG5cbiAgICBsZXQga2V5Rm9yID0gbWFrZUtleUZvcihrZXkpO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlcmFibGUpKSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5SXRlcmF0b3IoaXRlcmFibGUsIGtleUZvcik7XG4gICAgfVxuXG4gICAgbGV0IG1heWJlSXRlcmF0b3IgPSB0b0l0ZXJhdG9yKGl0ZXJhYmxlKTtcblxuICAgIGlmIChtYXliZUl0ZXJhdG9yID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5SXRlcmF0b3IoRU1QVFlfQVJSQVksICgpID0+IG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgSXRlcmF0b3JXcmFwcGVyKG1heWJlSXRlcmF0b3IsIGtleUZvcik7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSXRlcmF0b3JJdGVtUmVmKF92YWx1ZTogdW5rbm93bikge1xuICBsZXQgdmFsdWUgPSBfdmFsdWU7XG4gIGxldCB0YWcgPSBjcmVhdGVUYWcoKTtcblxuICByZXR1cm4gY3JlYXRlQ29tcHV0ZVJlZihcbiAgICAoKSA9PiB7XG4gICAgICBjb25zdW1lVGFnKHRhZyk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICAobmV3VmFsdWUpID0+IHtcbiAgICAgIGlmICh2YWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgZGlydHlUYWcodGFnKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59XG5cbmNsYXNzIEl0ZXJhdG9yV3JhcHBlciBpbXBsZW1lbnRzIE9wYXF1ZUl0ZXJhdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogSXRlcmF0b3JEZWxlZ2F0ZSwgcHJpdmF0ZSBrZXlGb3I6IEtleUZvcikge31cblxuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLmlubmVyLmlzRW1wdHkoKTtcbiAgfVxuXG4gIG5leHQoKSB7XG4gICAgbGV0IG5leHRWYWx1ZSA9IHRoaXMuaW5uZXIubmV4dCgpIGFzIE9wYXF1ZUl0ZXJhdGlvbkl0ZW07XG5cbiAgICBpZiAobmV4dFZhbHVlICE9PSBudWxsKSB7XG4gICAgICBuZXh0VmFsdWUua2V5ID0gdGhpcy5rZXlGb3IobmV4dFZhbHVlLnZhbHVlLCBuZXh0VmFsdWUubWVtbyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRWYWx1ZTtcbiAgfVxufVxuXG5jbGFzcyBBcnJheUl0ZXJhdG9yIGltcGxlbWVudHMgT3BhcXVlSXRlcmF0b3Ige1xuICBwcml2YXRlIGN1cnJlbnQ6IHsga2luZDogJ2VtcHR5JyB9IHwgeyBraW5kOiAnZmlyc3QnOyB2YWx1ZTogdW5rbm93biB9IHwgeyBraW5kOiAncHJvZ3Jlc3MnIH07XG4gIHByaXZhdGUgcG9zID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGl0ZXJhdG9yOiB1bmtub3duW10sIHByaXZhdGUga2V5Rm9yOiBLZXlGb3IpIHtcbiAgICBpZiAoaXRlcmF0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdlbXB0eScgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50ID0geyBraW5kOiAnZmlyc3QnLCB2YWx1ZTogaXRlcmF0b3JbdGhpcy5wb3NdIH07XG4gICAgfVxuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50LmtpbmQgPT09ICdlbXB0eSc7XG4gIH1cblxuICBuZXh0KCk6IE9wdGlvbjxJdGVyYXRpb25JdGVtPHVua25vd24sIG51bWJlcj4+IHtcbiAgICBsZXQgdmFsdWU6IHVua25vd247XG5cbiAgICBsZXQgY3VycmVudCA9IHRoaXMuY3VycmVudDtcbiAgICBpZiAoY3VycmVudC5raW5kID09PSAnZmlyc3QnKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgICAgIHZhbHVlID0gY3VycmVudC52YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucG9zID49IHRoaXMuaXRlcmF0b3IubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdGhpcy5pdGVyYXRvclsrK3RoaXMucG9zXTtcbiAgICB9XG5cbiAgICBsZXQgeyBrZXlGb3IgfSA9IHRoaXM7XG5cbiAgICBsZXQga2V5ID0ga2V5Rm9yKHZhbHVlIGFzIERpY3QsIHRoaXMucG9zKTtcbiAgICBsZXQgbWVtbyA9IHRoaXMucG9zO1xuXG4gICAgcmV0dXJuIHsga2V5LCB2YWx1ZSwgbWVtbyB9O1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9