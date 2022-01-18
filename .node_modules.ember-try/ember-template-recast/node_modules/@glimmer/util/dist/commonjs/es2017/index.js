"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  assertNever: true,
  EMPTY_ARRAY: true,
  assert: true,
  deprecate: true,
  dict: true,
  DictSet: true,
  isDict: true,
  isObject: true,
  Stack: true,
  ensureGuid: true,
  initializeGuid: true,
  isSerializationFirstNode: true,
  SERIALIZATION_FIRST_NODE_STRING: true,
  assign: true,
  fillNulls: true,
  values: true,
  _WeakSet: true,
  castToSimple: true,
  castToBrowser: true,
  checkNode: true,
  debugToString: true,
  beginTestSteps: true,
  endTestSteps: true,
  logStep: true,
  verifySteps: true
};
exports.assertNever = assertNever;
Object.defineProperty(exports, "EMPTY_ARRAY", {
  enumerable: true,
  get: function () {
    return _arrayUtils.EMPTY_ARRAY;
  }
});
Object.defineProperty(exports, "assert", {
  enumerable: true,
  get: function () {
    return _assert.default;
  }
});
Object.defineProperty(exports, "deprecate", {
  enumerable: true,
  get: function () {
    return _assert.deprecate;
  }
});
Object.defineProperty(exports, "dict", {
  enumerable: true,
  get: function () {
    return _collections.dict;
  }
});
Object.defineProperty(exports, "DictSet", {
  enumerable: true,
  get: function () {
    return _collections.DictSet;
  }
});
Object.defineProperty(exports, "isDict", {
  enumerable: true,
  get: function () {
    return _collections.isDict;
  }
});
Object.defineProperty(exports, "isObject", {
  enumerable: true,
  get: function () {
    return _collections.isObject;
  }
});
Object.defineProperty(exports, "Stack", {
  enumerable: true,
  get: function () {
    return _collections.StackImpl;
  }
});
Object.defineProperty(exports, "ensureGuid", {
  enumerable: true,
  get: function () {
    return _guid.ensureGuid;
  }
});
Object.defineProperty(exports, "initializeGuid", {
  enumerable: true,
  get: function () {
    return _guid.initializeGuid;
  }
});
Object.defineProperty(exports, "isSerializationFirstNode", {
  enumerable: true,
  get: function () {
    return _isSerializationFirstNode.isSerializationFirstNode;
  }
});
Object.defineProperty(exports, "SERIALIZATION_FIRST_NODE_STRING", {
  enumerable: true,
  get: function () {
    return _isSerializationFirstNode.SERIALIZATION_FIRST_NODE_STRING;
  }
});
Object.defineProperty(exports, "assign", {
  enumerable: true,
  get: function () {
    return _objectUtils.assign;
  }
});
Object.defineProperty(exports, "fillNulls", {
  enumerable: true,
  get: function () {
    return _objectUtils.fillNulls;
  }
});
Object.defineProperty(exports, "values", {
  enumerable: true,
  get: function () {
    return _objectUtils.values;
  }
});
Object.defineProperty(exports, "_WeakSet", {
  enumerable: true,
  get: function () {
    return _weakSet.default;
  }
});
Object.defineProperty(exports, "castToSimple", {
  enumerable: true,
  get: function () {
    return _simpleCast.castToSimple;
  }
});
Object.defineProperty(exports, "castToBrowser", {
  enumerable: true,
  get: function () {
    return _simpleCast.castToBrowser;
  }
});
Object.defineProperty(exports, "checkNode", {
  enumerable: true,
  get: function () {
    return _simpleCast.checkNode;
  }
});
Object.defineProperty(exports, "debugToString", {
  enumerable: true,
  get: function () {
    return _debugToString.default;
  }
});
Object.defineProperty(exports, "beginTestSteps", {
  enumerable: true,
  get: function () {
    return _debugSteps.beginTestSteps;
  }
});
Object.defineProperty(exports, "endTestSteps", {
  enumerable: true,
  get: function () {
    return _debugSteps.endTestSteps;
  }
});
Object.defineProperty(exports, "logStep", {
  enumerable: true,
  get: function () {
    return _debugSteps.logStep;
  }
});
Object.defineProperty(exports, "verifySteps", {
  enumerable: true,
  get: function () {
    return _debugSteps.verifySteps;
  }
});

var _arrayUtils = require("./lib/array-utils");

var _assert = _interopRequireWildcard(require("./lib/assert"));

var _collections = require("./lib/collections");

var _dom = require("./lib/dom");

Object.keys(_dom).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _dom[key];
    }
  });
});

var _guid = require("./lib/guid");

var _isSerializationFirstNode = require("./lib/is-serialization-first-node");

var _objectUtils = require("./lib/object-utils");

var _platformUtils = require("./lib/platform-utils");

Object.keys(_platformUtils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _platformUtils[key];
    }
  });
});

var _string = require("./lib/string");

Object.keys(_string).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _string[key];
    }
  });
});

var _immediate = require("./lib/immediate");

Object.keys(_immediate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _immediate[key];
    }
  });
});

var _template = require("./lib/template");

Object.keys(_template).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _template[key];
    }
  });
});

var _weakSet = _interopRequireDefault(require("./lib/weak-set"));

var _simpleCast = require("./lib/simple-cast");

var _debugToString = _interopRequireDefault(require("./lib/debug-to-string"));

var _debugSteps = require("./lib/debug-steps");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function assertNever(value, desc = 'unexpected unreachable branch') {
  console.log('unreachable', value);
  console.trace(`${desc} :: ${JSON.stringify(value)} (${value})`);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUNBOztBQUlBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7OztBQUlNLFNBQUEsV0FBQSxDQUFBLEtBQUEsRUFBb0MsSUFBSSxHQUF4QywrQkFBQSxFQUEwRTtBQUM5RSxFQUFBLE9BQU8sQ0FBUCxHQUFBLENBQUEsYUFBQSxFQUFBLEtBQUE7QUFDQSxFQUFBLE9BQU8sQ0FBUCxLQUFBLENBQWMsR0FBRyxJQUFJLE9BQU8sSUFBSSxDQUFKLFNBQUEsQ0FBQSxLQUFBLENBQXFCLEtBQUssS0FBdEQsR0FBQTtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgRU1QVFlfQVJSQVkgfSBmcm9tICcuL2xpYi9hcnJheS11dGlscyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGFzc2VydCwgZGVwcmVjYXRlIH0gZnJvbSAnLi9saWIvYXNzZXJ0JztcbmV4cG9ydCB7IGRpY3QsIERpY3RTZXQsIGlzRGljdCwgaXNPYmplY3QsIFNldCwgU3RhY2tJbXBsIGFzIFN0YWNrIH0gZnJvbSAnLi9saWIvY29sbGVjdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvZG9tJztcbmV4cG9ydCB7IGVuc3VyZUd1aWQsIEhhc0d1aWQsIGluaXRpYWxpemVHdWlkIH0gZnJvbSAnLi9saWIvZ3VpZCc7XG5leHBvcnQge1xuICBpc1NlcmlhbGl6YXRpb25GaXJzdE5vZGUsXG4gIFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkcsXG59IGZyb20gJy4vbGliL2lzLXNlcmlhbGl6YXRpb24tZmlyc3Qtbm9kZSc7XG5leHBvcnQgeyBhc3NpZ24sIGZpbGxOdWxscywgdmFsdWVzIH0gZnJvbSAnLi9saWIvb2JqZWN0LXV0aWxzJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL3BsYXRmb3JtLXV0aWxzJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL3N0cmluZyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9pbW1lZGlhdGUnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvdGVtcGxhdGUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBfV2Vha1NldCB9IGZyb20gJy4vbGliL3dlYWstc2V0JztcbmV4cG9ydCB7IGNhc3RUb1NpbXBsZSwgY2FzdFRvQnJvd3NlciwgY2hlY2tOb2RlIH0gZnJvbSAnLi9saWIvc2ltcGxlLWNhc3QnO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIGRlYnVnVG9TdHJpbmcgfSBmcm9tICcuL2xpYi9kZWJ1Zy10by1zdHJpbmcnO1xuZXhwb3J0IHsgYmVnaW5UZXN0U3RlcHMsIGVuZFRlc3RTdGVwcywgbG9nU3RlcCwgdmVyaWZ5U3RlcHMgfSBmcm9tICcuL2xpYi9kZWJ1Zy1zdGVwcyc7XG5cbmV4cG9ydCB0eXBlIEZJWE1FPFQsIFMgZXh0ZW5kcyBzdHJpbmc+ID0gKFQgJiBTKSB8IFQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROZXZlcih2YWx1ZTogbmV2ZXIsIGRlc2MgPSAndW5leHBlY3RlZCB1bnJlYWNoYWJsZSBicmFuY2gnKTogdm9pZCB7XG4gIGNvbnNvbGUubG9nKCd1bnJlYWNoYWJsZScsIHZhbHVlKTtcbiAgY29uc29sZS50cmFjZShgJHtkZXNjfSA6OiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0gKCR7dmFsdWV9KWApO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==