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

function assertNever(value, desc) {
  if (desc === void 0) {
    desc = 'unexpected unreachable branch';
  }

  console.log('unreachable', value);
  console.trace(desc + " :: " + JSON.stringify(value) + " (" + value + ")");
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUNBOztBQUlBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7OztBQUlNLFNBQUEsV0FBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLEVBQTBFO0FBQUEsTUFBdEMsSUFBc0MsS0FBQSxLQUFBLENBQUEsRUFBQTtBQUF0QyxJQUFBLElBQXNDLEdBQTFFLCtCQUFvQztBQUFzQzs7QUFDOUUsRUFBQSxPQUFPLENBQVAsR0FBQSxDQUFBLGFBQUEsRUFBQSxLQUFBO0FBQ0EsRUFBQSxPQUFPLENBQVAsS0FBQSxDQUFpQixJQUFqQixHQUFBLE1BQWlCLEdBQVcsSUFBSSxDQUFKLFNBQUEsQ0FBNUIsS0FBNEIsQ0FBWCxHQUFqQixJQUFpQixHQUFqQixLQUFpQixHQUFqQixHQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgeyBFTVBUWV9BUlJBWSB9IGZyb20gJy4vbGliL2FycmF5LXV0aWxzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYXNzZXJ0LCBkZXByZWNhdGUgfSBmcm9tICcuL2xpYi9hc3NlcnQnO1xuZXhwb3J0IHsgZGljdCwgRGljdFNldCwgaXNEaWN0LCBpc09iamVjdCwgU2V0LCBTdGFja0ltcGwgYXMgU3RhY2sgfSBmcm9tICcuL2xpYi9jb2xsZWN0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9kb20nO1xuZXhwb3J0IHsgZW5zdXJlR3VpZCwgSGFzR3VpZCwgaW5pdGlhbGl6ZUd1aWQgfSBmcm9tICcuL2xpYi9ndWlkJztcbmV4cG9ydCB7XG4gIGlzU2VyaWFsaXphdGlvbkZpcnN0Tm9kZSxcbiAgU0VSSUFMSVpBVElPTl9GSVJTVF9OT0RFX1NUUklORyxcbn0gZnJvbSAnLi9saWIvaXMtc2VyaWFsaXphdGlvbi1maXJzdC1ub2RlJztcbmV4cG9ydCB7IGFzc2lnbiwgZmlsbE51bGxzLCB2YWx1ZXMgfSBmcm9tICcuL2xpYi9vYmplY3QtdXRpbHMnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvcGxhdGZvcm0tdXRpbHMnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvc3RyaW5nJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL2ltbWVkaWF0ZSc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi90ZW1wbGF0ZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIF9XZWFrU2V0IH0gZnJvbSAnLi9saWIvd2Vhay1zZXQnO1xuZXhwb3J0IHsgY2FzdFRvU2ltcGxlLCBjYXN0VG9Ccm93c2VyLCBjaGVja05vZGUgfSBmcm9tICcuL2xpYi9zaW1wbGUtY2FzdCc7XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgZGVidWdUb1N0cmluZyB9IGZyb20gJy4vbGliL2RlYnVnLXRvLXN0cmluZyc7XG5leHBvcnQgeyBiZWdpblRlc3RTdGVwcywgZW5kVGVzdFN0ZXBzLCBsb2dTdGVwLCB2ZXJpZnlTdGVwcyB9IGZyb20gJy4vbGliL2RlYnVnLXN0ZXBzJztcblxuZXhwb3J0IHR5cGUgRklYTUU8VCwgUyBleHRlbmRzIHN0cmluZz4gPSAoVCAmIFMpIHwgVDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5ldmVyKHZhbHVlOiBuZXZlciwgZGVzYyA9ICd1bmV4cGVjdGVkIHVucmVhY2hhYmxlIGJyYW5jaCcpOiB2b2lkIHtcbiAgY29uc29sZS5sb2coJ3VucmVhY2hhYmxlJywgdmFsdWUpO1xuICBjb25zb2xlLnRyYWNlKGAke2Rlc2N9IDo6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfSAoJHt2YWx1ZX0pYCk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9