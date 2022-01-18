"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createIteratorRef = createIteratorRef;
exports.createIteratorItemRef = createIteratorItemRef;

var _globalContext = require("@glimmer/global-context");

var _util = require("@glimmer/util");

var _env = require("@glimmer/env");

var _validator = require("@glimmer/validator");

var _reference = require("./reference");

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

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
  if (_env.DEBUG && path[0] === '@') {
    throw new Error("invalid keypath: '" + path + "', valid keys: @index, @identity, or a path");
  }

  return uniqueKeyFor(function (item) {
    return (0, _globalContext.getPath)(item, path);
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
    if ((0, _util.isObject)(key) || typeof key === 'function') {
      this.weakMap.set(key, value);
    } else {
      this.primitiveMap.set(key, value);
    }
  };

  _proto.get = function get(key) {
    if ((0, _util.isObject)(key) || typeof key === 'function') {
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
  return (0, _reference.createComputeRef)(function () {
    var iterable = (0, _reference.valueForRef)(listRef);
    var keyFor = makeKeyFor(key);

    if (Array.isArray(iterable)) {
      return new ArrayIterator(iterable, keyFor);
    }

    var maybeIterator = (0, _globalContext.toIterator)(iterable);

    if (maybeIterator === null) {
      return new ArrayIterator(_util.EMPTY_ARRAY, function () {
        return null;
      });
    }

    return new IteratorWrapper(maybeIterator, keyFor);
  });
}

function createIteratorItemRef(_value) {
  var value = _value;
  var tag = (0, _validator.createTag)();
  return (0, _reference.createComputeRef)(function () {
    (0, _validator.consumeTag)(tag);
    return value;
  }, function (newValue) {
    if (value !== newValue) {
      value = newValue;
      (0, _validator.dirtyTag)(tag);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU0sYUFBYSxHQUFuQixFQUFBOztBQUVBLElBQU0sR0FBRyxHQUFXLFNBQWQsR0FBYyxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFBQSxTQUFwQixLQUFvQjtBQUFwQixDQUFBOztBQUNBLElBQU0sS0FBSyxHQUFXLFNBQWhCLEtBQWdCLENBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQTtBQUFBLFNBQWMsTUFBTSxDQUExQyxLQUEwQyxDQUFwQjtBQUF0QixDQUFBOztBQUNBLElBQU0sUUFBUSxHQUFZLFNBQXBCLFFBQW9CLENBQUQsSUFBQyxFQUFRO0FBQ2hDLE1BQUksSUFBSSxLQUFSLElBQUEsRUFBbUI7QUFDakI7QUFDQTtBQUNBLFdBQUEsYUFBQTtBQUNEOztBQUVELFNBQUEsSUFBQTtBQVBGLENBQUE7O0FBVUEsU0FBQSxVQUFBLENBQUEsSUFBQSxFQUFnQztBQUM5QixNQUFJLGNBQVMsSUFBSSxDQUFKLENBQUksQ0FBSixLQUFiLEdBQUEsRUFBOEI7QUFDNUIsVUFBTSxJQUFBLEtBQUEsQ0FBQSx1QkFBTixJQUFNLEdBQU4sNkNBQU0sQ0FBTjtBQUNEOztBQUNELFNBQU8sWUFBWSxDQUFFLFVBQUQsSUFBQyxFQUFEO0FBQUEsV0FBVSw0QkFBTyxJQUFQLEVBQTlCLElBQThCLENBQVY7QUFBcEIsR0FBbUIsQ0FBbkI7QUFDRDs7QUFFRCxTQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQStCO0FBQzdCLFVBQUEsR0FBQTtBQUNFLFNBQUEsTUFBQTtBQUNFLGFBQU8sWUFBWSxDQUFuQixHQUFtQixDQUFuQjs7QUFDRixTQUFBLFFBQUE7QUFDRSxhQUFPLFlBQVksQ0FBbkIsS0FBbUIsQ0FBbkI7O0FBQ0YsU0FBQSxXQUFBO0FBQ0UsYUFBTyxZQUFZLENBQW5CLFFBQW1CLENBQW5COztBQUNGO0FBQ0UsYUFBTyxVQUFVLENBQWpCLEdBQWlCLENBQWpCO0FBUko7QUFVRDs7SUFFRCxxQjs7Ozs7U0FvQkUsRyxHQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSxLQUFBLEVBQTBCO0FBQ3hCLFFBQUksb0JBQUEsR0FBQSxLQUFpQixPQUFBLEdBQUEsS0FBckIsVUFBQSxFQUFnRDtBQUM5QyxXQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxFQUFBLEtBQUE7QUFERixLQUFBLE1BRU87QUFDTCxXQUFBLFlBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxFQUFBLEtBQUE7QUFDRDs7O1NBR0gsRyxHQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsRUFBZ0I7QUFDZCxRQUFJLG9CQUFBLEdBQUEsS0FBaUIsT0FBQSxHQUFBLEtBQXJCLFVBQUEsRUFBZ0Q7QUFDOUMsYUFBTyxLQUFBLE9BQUEsQ0FBQSxHQUFBLENBQVAsR0FBTyxDQUFQO0FBREYsS0FBQSxNQUVPO0FBQ0wsYUFBTyxLQUFBLFlBQUEsQ0FBQSxHQUFBLENBQVAsR0FBTyxDQUFQO0FBQ0Q7Ozs7O3dCQTdCZ0I7QUFDakIsVUFBSSxLQUFBLFFBQUEsS0FBSixTQUFBLEVBQWlDO0FBQy9CLGFBQUEsUUFBQSxHQUFnQixJQUFoQixPQUFnQixFQUFoQjtBQUNEOztBQUVELGFBQU8sS0FBUCxRQUFBO0FBQ0Q7Ozt3QkFFdUI7QUFDdEIsVUFBSSxLQUFBLGFBQUEsS0FBSixTQUFBLEVBQXNDO0FBQ3BDLGFBQUEsYUFBQSxHQUFxQixJQUFyQixHQUFxQixFQUFyQjtBQUNEOztBQUVELGFBQU8sS0FBUCxhQUFBO0FBQ0Q7Ozs7OztBQW1CSCxJQUFNLFVBQVUsR0FBRyxJQUFuQixxQkFBbUIsRUFBbkI7O0FBRUEsU0FBQSx1QkFBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLEVBQTBEO0FBQ3hELE1BQUksVUFBVSxHQUFHLFVBQVUsQ0FBVixHQUFBLENBQWpCLEtBQWlCLENBQWpCOztBQUVBLE1BQUksVUFBVSxLQUFkLFNBQUEsRUFBOEI7QUFDNUIsSUFBQSxVQUFVLEdBQVYsRUFBQTtBQUNBLElBQUEsVUFBVSxDQUFWLEdBQUEsQ0FBQSxLQUFBLEVBQUEsVUFBQTtBQUNEOztBQUVELE1BQUksUUFBUSxHQUFHLFVBQVUsQ0FBekIsS0FBeUIsQ0FBekI7O0FBRUEsTUFBSSxRQUFRLEtBQVosU0FBQSxFQUE0QjtBQUMxQixJQUFBLFFBQVEsR0FBRztBQUFFLE1BQUEsS0FBRixFQUFBLEtBQUE7QUFBUyxNQUFBLEtBQUEsRUFBQTtBQUFULEtBQVg7QUFDQSxJQUFBLFVBQVUsQ0FBVixLQUFVLENBQVYsR0FBQSxRQUFBO0FBQ0Q7O0FBRUQsU0FBQSxRQUFBO0FBQ0Q7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlQSxTQUFBLFlBQUEsQ0FBQSxNQUFBLEVBQW9DO0FBQ2xDLE1BQUksSUFBSSxHQUFHLElBQVgscUJBQVcsRUFBWDtBQUVBLFNBQU8sVUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFrQztBQUN2QyxRQUFJLEdBQUcsR0FBRyxNQUFNLENBQUEsS0FBQSxFQUFoQixJQUFnQixDQUFoQjtBQUNBLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBSixHQUFBLENBQUEsR0FBQSxLQUFaLENBQUE7QUFFQSxJQUFBLElBQUksQ0FBSixHQUFBLENBQUEsR0FBQSxFQUFjLEtBQUssR0FBbkIsQ0FBQTs7QUFFQSxRQUFJLEtBQUssS0FBVCxDQUFBLEVBQWlCO0FBQ2YsYUFBQSxHQUFBO0FBQ0Q7O0FBRUQsV0FBTyx1QkFBdUIsQ0FBQSxHQUFBLEVBQTlCLEtBQThCLENBQTlCO0FBVkYsR0FBQTtBQVlEOztBQUVLLFNBQUEsaUJBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUEyRDtBQUMvRCxTQUFPLGlDQUFpQixZQUFLO0FBQzNCLFFBQUksUUFBUSxHQUFHLDRCQUFmLE9BQWUsQ0FBZjtBQUVBLFFBQUksTUFBTSxHQUFHLFVBQVUsQ0FBdkIsR0FBdUIsQ0FBdkI7O0FBRUEsUUFBSSxLQUFLLENBQUwsT0FBQSxDQUFKLFFBQUksQ0FBSixFQUE2QjtBQUMzQixhQUFPLElBQUEsYUFBQSxDQUFBLFFBQUEsRUFBUCxNQUFPLENBQVA7QUFDRDs7QUFFRCxRQUFJLGFBQWEsR0FBRywrQkFBcEIsUUFBb0IsQ0FBcEI7O0FBRUEsUUFBSSxhQUFhLEtBQWpCLElBQUEsRUFBNEI7QUFDMUIsYUFBTyxJQUFBLGFBQUEsQ0FBQSxpQkFBQSxFQUErQixZQUFBO0FBQUEsZUFBdEMsSUFBc0M7QUFBdEMsT0FBTyxDQUFQO0FBQ0Q7O0FBRUQsV0FBTyxJQUFBLGVBQUEsQ0FBQSxhQUFBLEVBQVAsTUFBTyxDQUFQO0FBZkYsR0FBTyxDQUFQO0FBaUJEOztBQUVLLFNBQUEscUJBQUEsQ0FBQSxNQUFBLEVBQStDO0FBQ25ELE1BQUksS0FBSyxHQUFULE1BQUE7QUFDQSxNQUFJLEdBQUcsR0FBUCwyQkFBQTtBQUVBLFNBQU8saUNBQ0wsWUFBSztBQUNILCtCQUFBLEdBQUE7QUFDQSxXQUFBLEtBQUE7QUFIbUIsR0FBaEIsRUFLSixVQUFELFFBQUMsRUFBWTtBQUNYLFFBQUksS0FBSyxLQUFULFFBQUEsRUFBd0I7QUFDdEIsTUFBQSxLQUFLLEdBQUwsUUFBQTtBQUNBLCtCQUFBLEdBQUE7QUFDRDtBQVRMLEdBQU8sQ0FBUDtBQVlEOztJQUVELGU7QUFDRSxXQUFBLGVBQUEsQ0FBQSxLQUFBLEVBQUEsTUFBQSxFQUFtRTtBQUEvQyxTQUFBLEtBQUEsR0FBQSxLQUFBO0FBQWlDLFNBQUEsTUFBQSxHQUFBLE1BQUE7QUFBa0I7Ozs7VUFFdkUsTyxHQUFBLFNBQUEsT0FBQSxHQUFPO0FBQ0wsV0FBTyxLQUFBLEtBQUEsQ0FBUCxPQUFPLEVBQVA7OztVQUdGLEksR0FBQSxTQUFBLElBQUEsR0FBSTtBQUNGLFFBQUksU0FBUyxHQUFHLEtBQUEsS0FBQSxDQUFoQixJQUFnQixFQUFoQjs7QUFFQSxRQUFJLFNBQVMsS0FBYixJQUFBLEVBQXdCO0FBQ3RCLE1BQUEsU0FBUyxDQUFULEdBQUEsR0FBZ0IsS0FBQSxNQUFBLENBQVksU0FBUyxDQUFyQixLQUFBLEVBQTZCLFNBQVMsQ0FBdEQsSUFBZ0IsQ0FBaEI7QUFDRDs7QUFFRCxXQUFBLFNBQUE7Ozs7OztJQUlKLGE7QUFJRSxXQUFBLGFBQUEsQ0FBQSxRQUFBLEVBQUEsTUFBQSxFQUErRDtBQUEzQyxTQUFBLFFBQUEsR0FBQSxRQUFBO0FBQTZCLFNBQUEsTUFBQSxHQUFBLE1BQUE7QUFGekMsU0FBQSxHQUFBLEdBQUEsQ0FBQTs7QUFHTixRQUFJLFFBQVEsQ0FBUixNQUFBLEtBQUosQ0FBQSxFQUEyQjtBQUN6QixXQUFBLE9BQUEsR0FBZTtBQUFFLFFBQUEsSUFBSSxFQUFFO0FBQVIsT0FBZjtBQURGLEtBQUEsTUFFTztBQUNMLFdBQUEsT0FBQSxHQUFlO0FBQUUsUUFBQSxJQUFJLEVBQU4sT0FBQTtBQUFpQixRQUFBLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBRCxHQUFBO0FBQWhDLE9BQWY7QUFDRDtBQUNGOzs7O1VBRUQsTyxHQUFBLFNBQUEsT0FBQSxHQUFPO0FBQ0wsV0FBTyxLQUFBLE9BQUEsQ0FBQSxJQUFBLEtBQVAsT0FBQTs7O1VBR0YsSSxHQUFBLFNBQUEsSUFBQSxHQUFJO0FBQ0YsUUFBQSxLQUFBO0FBRUEsUUFBSSxPQUFPLEdBQUcsS0FBZCxPQUFBOztBQUNBLFFBQUksT0FBTyxDQUFQLElBQUEsS0FBSixPQUFBLEVBQThCO0FBQzVCLFdBQUEsT0FBQSxHQUFlO0FBQUUsUUFBQSxJQUFJLEVBQUU7QUFBUixPQUFmO0FBQ0EsTUFBQSxLQUFLLEdBQUcsT0FBTyxDQUFmLEtBQUE7QUFGRixLQUFBLE1BR08sSUFBSSxLQUFBLEdBQUEsSUFBWSxLQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQWhCLENBQUEsRUFBMEM7QUFDL0MsYUFBQSxJQUFBO0FBREssS0FBQSxNQUVBO0FBQ0wsTUFBQSxLQUFLLEdBQUcsS0FBQSxRQUFBLENBQWMsRUFBRSxLQUF4QixHQUFRLENBQVI7QUFDRDs7QUFYQyxRQWFJLE1BYkosR0FBQSxLQUFBLE1BQUE7QUFlRixRQUFJLEdBQUcsR0FBRyxNQUFNLENBQUEsS0FBQSxFQUFnQixLQUFoQyxHQUFnQixDQUFoQjtBQUNBLFFBQUksSUFBSSxHQUFHLEtBQVgsR0FBQTtBQUVBLFdBQU87QUFBRSxNQUFBLEdBQUYsRUFBQSxHQUFBO0FBQU8sTUFBQSxLQUFQLEVBQUEsS0FBQTtBQUFjLE1BQUEsSUFBQSxFQUFBO0FBQWQsS0FBUCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFBhdGgsIHRvSXRlcmF0b3IgfSBmcm9tICdAZ2xpbW1lci9nbG9iYWwtY29udGV4dCc7XG5pbXBvcnQgeyBPcHRpb24sIERpY3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEVNUFRZX0FSUkFZLCBpc09iamVjdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tICdAZ2xpbW1lci9lbnYnO1xuaW1wb3J0IHsgY3JlYXRlVGFnLCBjb25zdW1lVGFnLCBkaXJ0eVRhZyB9IGZyb20gJ0BnbGltbWVyL3ZhbGlkYXRvcic7XG5pbXBvcnQgeyBSZWZlcmVuY2UsIFJlZmVyZW5jZUVudmlyb25tZW50LCB2YWx1ZUZvclJlZiwgY3JlYXRlQ29tcHV0ZVJlZiB9IGZyb20gJy4vcmVmZXJlbmNlJztcblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRpb25JdGVtPFQsIFU+IHtcbiAga2V5OiB1bmtub3duO1xuICB2YWx1ZTogVDtcbiAgbWVtbzogVTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBYnN0cmFjdEl0ZXJhdG9yPFQsIFUsIFYgZXh0ZW5kcyBJdGVyYXRpb25JdGVtPFQsIFU+PiB7XG4gIGlzRW1wdHkoKTogYm9vbGVhbjtcbiAgbmV4dCgpOiBPcHRpb248Vj47XG59XG5cbmV4cG9ydCB0eXBlIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0gPSBJdGVyYXRpb25JdGVtPHVua25vd24sIHVua25vd24+O1xuZXhwb3J0IHR5cGUgT3BhcXVlSXRlcmF0b3IgPSBBYnN0cmFjdEl0ZXJhdG9yPHVua25vd24sIHVua25vd24sIE9wYXF1ZUl0ZXJhdGlvbkl0ZW0+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhdG9yRGVsZWdhdGUge1xuICBpc0VtcHR5KCk6IGJvb2xlYW47XG4gIG5leHQoKTogeyB2YWx1ZTogdW5rbm93bjsgbWVtbzogdW5rbm93biB9IHwgbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvclJlZmVyZW5jZUVudmlyb25tZW50IGV4dGVuZHMgUmVmZXJlbmNlRW52aXJvbm1lbnQge1xuICBnZXRQYXRoKG9iajogdW5rbm93biwgcGF0aDogc3RyaW5nKTogdW5rbm93bjtcbiAgdG9JdGVyYXRvcihvYmo6IHVua25vd24pOiBPcHRpb248SXRlcmF0b3JEZWxlZ2F0ZT47XG59XG5cbnR5cGUgS2V5Rm9yID0gKGl0ZW06IHVua25vd24sIGluZGV4OiB1bmtub3duKSA9PiB1bmtub3duO1xuXG5jb25zdCBOVUxMX0lERU5USVRZID0ge307XG5cbmNvbnN0IEtFWTogS2V5Rm9yID0gKF8sIGluZGV4KSA9PiBpbmRleDtcbmNvbnN0IElOREVYOiBLZXlGb3IgPSAoXywgaW5kZXgpID0+IFN0cmluZyhpbmRleCk7XG5jb25zdCBJREVOVElUWTogS2V5Rm9yID0gKGl0ZW0pID0+IHtcbiAgaWYgKGl0ZW0gPT09IG51bGwpIHtcbiAgICAvLyBSZXR1cm5pbmcgbnVsbCBhcyBhbiBpZGVudGl0eSB3aWxsIGNhdXNlIGZhaWx1cmVzIHNpbmNlIHRoZSBpdGVyYXRvclxuICAgIC8vIGNhbid0IHRlbGwgdGhhdCBpdCdzIGFjdHVhbGx5IHN1cHBvc2VkIHRvIGJlIG51bGxcbiAgICByZXR1cm4gTlVMTF9JREVOVElUWTtcbiAgfVxuXG4gIHJldHVybiBpdGVtO1xufTtcblxuZnVuY3Rpb24ga2V5Rm9yUGF0aChwYXRoOiBzdHJpbmcpOiBLZXlGb3Ige1xuICBpZiAoREVCVUcgJiYgcGF0aFswXSA9PT0gJ0AnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGtleXBhdGg6ICcke3BhdGh9JywgdmFsaWQga2V5czogQGluZGV4LCBAaWRlbnRpdHksIG9yIGEgcGF0aGApO1xuICB9XG4gIHJldHVybiB1bmlxdWVLZXlGb3IoKGl0ZW0pID0+IGdldFBhdGgoaXRlbSBhcyBvYmplY3QsIHBhdGgpKTtcbn1cblxuZnVuY3Rpb24gbWFrZUtleUZvcihrZXk6IHN0cmluZykge1xuICBzd2l0Y2ggKGtleSkge1xuICAgIGNhc2UgJ0BrZXknOlxuICAgICAgcmV0dXJuIHVuaXF1ZUtleUZvcihLRVkpO1xuICAgIGNhc2UgJ0BpbmRleCc6XG4gICAgICByZXR1cm4gdW5pcXVlS2V5Rm9yKElOREVYKTtcbiAgICBjYXNlICdAaWRlbnRpdHknOlxuICAgICAgcmV0dXJuIHVuaXF1ZUtleUZvcihJREVOVElUWSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBrZXlGb3JQYXRoKGtleSk7XG4gIH1cbn1cblxuY2xhc3MgV2Vha01hcFdpdGhQcmltaXRpdmVzPFQ+IHtcbiAgcHJpdmF0ZSBfd2Vha01hcD86IFdlYWtNYXA8b2JqZWN0LCBUPjtcbiAgcHJpdmF0ZSBfcHJpbWl0aXZlTWFwPzogTWFwPHVua25vd24sIFQ+O1xuXG4gIHByaXZhdGUgZ2V0IHdlYWtNYXAoKSB7XG4gICAgaWYgKHRoaXMuX3dlYWtNYXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fd2Vha01hcCA9IG5ldyBXZWFrTWFwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3dlYWtNYXA7XG4gIH1cblxuICBwcml2YXRlIGdldCBwcmltaXRpdmVNYXAoKSB7XG4gICAgaWYgKHRoaXMuX3ByaW1pdGl2ZU1hcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9wcmltaXRpdmVNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3ByaW1pdGl2ZU1hcDtcbiAgfVxuXG4gIHNldChrZXk6IHVua25vd24sIHZhbHVlOiBUKSB7XG4gICAgaWYgKGlzT2JqZWN0KGtleSkgfHwgdHlwZW9mIGtleSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy53ZWFrTWFwLnNldChrZXkgYXMgb2JqZWN0LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJpbWl0aXZlTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBnZXQoa2V5OiB1bmtub3duKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGlzT2JqZWN0KGtleSkgfHwgdHlwZW9mIGtleSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMud2Vha01hcC5nZXQoa2V5IGFzIG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnByaW1pdGl2ZU1hcC5nZXQoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgSURFTlRJVElFUyA9IG5ldyBXZWFrTWFwV2l0aFByaW1pdGl2ZXM8b2JqZWN0W10+KCk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5Rm9yTnRoT2NjdXJlbmNlKHZhbHVlOiBhbnksIGNvdW50OiBudW1iZXIpIHtcbiAgbGV0IGlkZW50aXRpZXMgPSBJREVOVElUSUVTLmdldCh2YWx1ZSk7XG5cbiAgaWYgKGlkZW50aXRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgIGlkZW50aXRpZXMgPSBbXTtcbiAgICBJREVOVElUSUVTLnNldCh2YWx1ZSwgaWRlbnRpdGllcyk7XG4gIH1cblxuICBsZXQgaWRlbnRpdHkgPSBpZGVudGl0aWVzW2NvdW50XTtcblxuICBpZiAoaWRlbnRpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgIGlkZW50aXR5ID0geyB2YWx1ZSwgY291bnQgfTtcbiAgICBpZGVudGl0aWVzW2NvdW50XSA9IGlkZW50aXR5O1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aXR5O1xufVxuXG4vKipcbiAqIFdoZW4gaXRlcmF0aW5nIG92ZXIgYSBsaXN0LCBpdCdzIHBvc3NpYmxlIHRoYXQgYW4gaXRlbSB3aXRoIHRoZSBzYW1lIHVuaXF1ZVxuICoga2V5IGNvdWxkIGJlIGVuY291bnRlcmVkIHR3aWNlOlxuICpcbiAqIGBgYGpzXG4gKiBsZXQgYXJyID0gWydzYW1lJywgJ2RpZmZlcmVudCcsICdzYW1lJywgJ3NhbWUnXTtcbiAqIGBgYFxuICpcbiAqIEluIGdlbmVyYWwsIHdlIHdhbnQgdG8gdHJlYXQgdGhlc2UgaXRlbXMgYXMgX3VuaXF1ZSB3aXRoaW4gdGhlIGxpc3RfLiBUbyBkb1xuICogdGhpcywgd2UgdHJhY2sgdGhlIG9jY3VyZW5jZXMgb2YgZXZlcnkgaXRlbSBhcyB3ZSBpdGVyYXRlIHRoZSBsaXN0LCBhbmQgd2hlblxuICogYW4gaXRlbSBvY2N1cnMgbW9yZSB0aGFuIG9uY2UsIHdlIGdlbmVyYXRlIGEgbmV3IHVuaXF1ZSBrZXkganVzdCBmb3IgdGhhdFxuICogaXRlbSwgYW5kIHRoYXQgb2NjdXJlbmNlIHdpdGhpbiB0aGUgbGlzdC4gVGhlIG5leHQgdGltZSB3ZSBpdGVyYXRlIHRoZSBsaXN0LFxuICogYW5kIGVuY291bnRlciBhbiBpdGVtIGZvciB0aGUgbnRoIHRpbWUsIHdlIGNhbiBnZXQgdGhlIF9zYW1lXyBrZXksIGFuZCBsZXRcbiAqIEdsaW1tZXIga25vdyB0aGF0IGl0IHNob3VsZCByZXVzZSB0aGUgRE9NIGZvciB0aGUgcHJldmlvdXMgbnRoIG9jY3VyZW5jZS5cbiAqL1xuZnVuY3Rpb24gdW5pcXVlS2V5Rm9yKGtleUZvcjogS2V5Rm9yKSB7XG4gIGxldCBzZWVuID0gbmV3IFdlYWtNYXBXaXRoUHJpbWl0aXZlczxudW1iZXI+KCk7XG5cbiAgcmV0dXJuICh2YWx1ZTogdW5rbm93biwgbWVtbzogdW5rbm93bikgPT4ge1xuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUsIG1lbW8pO1xuICAgIGxldCBjb3VudCA9IHNlZW4uZ2V0KGtleSkgfHwgMDtcblxuICAgIHNlZW4uc2V0KGtleSwgY291bnQgKyAxKTtcblxuICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG5cbiAgICByZXR1cm4gaWRlbnRpdHlGb3JOdGhPY2N1cmVuY2Uoa2V5LCBjb3VudCk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvclJlZihsaXN0UmVmOiBSZWZlcmVuY2UsIGtleTogc3RyaW5nKSB7XG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKCgpID0+IHtcbiAgICBsZXQgaXRlcmFibGUgPSB2YWx1ZUZvclJlZihsaXN0UmVmKSBhcyB7IFtTeW1ib2wuaXRlcmF0b3JdOiBhbnkgfSB8IG51bGwgfCBmYWxzZTtcblxuICAgIGxldCBrZXlGb3IgPSBtYWtlS2V5Rm9yKGtleSk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVyYWJsZSkpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihpdGVyYWJsZSwga2V5Rm9yKTtcbiAgICB9XG5cbiAgICBsZXQgbWF5YmVJdGVyYXRvciA9IHRvSXRlcmF0b3IoaXRlcmFibGUpO1xuXG4gICAgaWYgKG1heWJlSXRlcmF0b3IgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcihFTVBUWV9BUlJBWSwgKCkgPT4gbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcldyYXBwZXIobWF5YmVJdGVyYXRvciwga2V5Rm9yKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJdGVyYXRvckl0ZW1SZWYoX3ZhbHVlOiB1bmtub3duKSB7XG4gIGxldCB2YWx1ZSA9IF92YWx1ZTtcbiAgbGV0IHRhZyA9IGNyZWF0ZVRhZygpO1xuXG4gIHJldHVybiBjcmVhdGVDb21wdXRlUmVmKFxuICAgICgpID0+IHtcbiAgICAgIGNvbnN1bWVUYWcodGFnKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgaWYgKHZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBkaXJ0eVRhZyh0YWcpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbn1cblxuY2xhc3MgSXRlcmF0b3JXcmFwcGVyIGltcGxlbWVudHMgT3BhcXVlSXRlcmF0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBJdGVyYXRvckRlbGVnYXRlLCBwcml2YXRlIGtleUZvcjogS2V5Rm9yKSB7fVxuXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXIuaXNFbXB0eSgpO1xuICB9XG5cbiAgbmV4dCgpIHtcbiAgICBsZXQgbmV4dFZhbHVlID0gdGhpcy5pbm5lci5uZXh0KCkgYXMgT3BhcXVlSXRlcmF0aW9uSXRlbTtcblxuICAgIGlmIChuZXh0VmFsdWUgIT09IG51bGwpIHtcbiAgICAgIG5leHRWYWx1ZS5rZXkgPSB0aGlzLmtleUZvcihuZXh0VmFsdWUudmFsdWUsIG5leHRWYWx1ZS5tZW1vKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFZhbHVlO1xuICB9XG59XG5cbmNsYXNzIEFycmF5SXRlcmF0b3IgaW1wbGVtZW50cyBPcGFxdWVJdGVyYXRvciB7XG4gIHByaXZhdGUgY3VycmVudDogeyBraW5kOiAnZW1wdHknIH0gfCB7IGtpbmQ6ICdmaXJzdCc7IHZhbHVlOiB1bmtub3duIH0gfCB7IGtpbmQ6ICdwcm9ncmVzcycgfTtcbiAgcHJpdmF0ZSBwb3MgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlcmF0b3I6IHVua25vd25bXSwgcHJpdmF0ZSBrZXlGb3I6IEtleUZvcikge1xuICAgIGlmIChpdGVyYXRvci5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ2VtcHR5JyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSB7IGtpbmQ6ICdmaXJzdCcsIHZhbHVlOiBpdGVyYXRvclt0aGlzLnBvc10gfTtcbiAgICB9XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnQua2luZCA9PT0gJ2VtcHR5JztcbiAgfVxuXG4gIG5leHQoKTogT3B0aW9uPEl0ZXJhdGlvbkl0ZW08dW5rbm93biwgbnVtYmVyPj4ge1xuICAgIGxldCB2YWx1ZTogdW5rbm93bjtcblxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5jdXJyZW50O1xuICAgIGlmIChjdXJyZW50LmtpbmQgPT09ICdmaXJzdCcpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHsga2luZDogJ3Byb2dyZXNzJyB9O1xuICAgICAgdmFsdWUgPSBjdXJyZW50LnZhbHVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wb3MgPj0gdGhpcy5pdGVyYXRvci5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSB0aGlzLml0ZXJhdG9yWysrdGhpcy5wb3NdO1xuICAgIH1cblxuICAgIGxldCB7IGtleUZvciB9ID0gdGhpcztcblxuICAgIGxldCBrZXkgPSBrZXlGb3IodmFsdWUgYXMgRGljdCwgdGhpcy5wb3MpO1xuICAgIGxldCBtZW1vID0gdGhpcy5wb3M7XG5cbiAgICByZXR1cm4geyBrZXksIHZhbHVlLCBtZW1vIH07XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=