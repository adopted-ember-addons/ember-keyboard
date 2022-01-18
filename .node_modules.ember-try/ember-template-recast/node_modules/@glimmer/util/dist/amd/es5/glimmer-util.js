define('@glimmer/util', ['exports', '@glimmer/env'], function (exports, env) { 'use strict';

  var EMPTY_ARRAY = Object.freeze([]);

  // import Logger from './logger';
  // let alreadyWarned = false;
  function debugAssert(test, msg) {
    // if (!alreadyWarned) {
    //   alreadyWarned = true;
    //   Logger.warn("Don't leave debug assertions on in public builds");
    // }
    if (!test) {
      throw new Error(msg || 'assertion failure');
    }
  }
  function deprecate(desc) {
    console.warn("DEPRECATION: " + desc);
  }

  var GUID = 0;
  function initializeGuid(object) {
    return object._guid = ++GUID;
  }
  function ensureGuid(object) {
    return object._guid || initializeGuid(object);
  }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
  function dict() {
    return Object.create(null);
  }
  function isDict(u) {
    return u !== null && u !== undefined;
  }
  function isObject(u) {
    return typeof u === 'object' && u !== null;
  }
  var DictSet = /*#__PURE__*/function () {
    function DictSet() {
      this.dict = dict();
    }

    var _proto = DictSet.prototype;

    _proto.add = function add(obj) {
      if (typeof obj === 'string') this.dict[obj] = obj;else this.dict[ensureGuid(obj)] = obj;
      return this;
    };

    _proto["delete"] = function _delete(obj) {
      if (typeof obj === 'string') delete this.dict[obj];else if (obj._guid) delete this.dict[obj._guid];
    };

    return DictSet;
  }();
  var StackImpl = /*#__PURE__*/function () {
    function StackImpl() {
      this.stack = [];
      this.current = null;
    }

    var _proto2 = StackImpl.prototype;

    _proto2.push = function push(item) {
      this.current = item;
      this.stack.push(item);
    };

    _proto2.pop = function pop() {
      var item = this.stack.pop();
      var len = this.stack.length;
      this.current = len === 0 ? null : this.stack[len - 1];
      return item === undefined ? null : item;
    };

    _proto2.nth = function nth(from) {
      var len = this.stack.length;
      return len < from ? null : this.stack[len - from];
    };

    _proto2.isEmpty = function isEmpty() {
      return this.stack.length === 0;
    };

    _proto2.toArray = function toArray() {
      return this.stack;
    };

    _createClass(StackImpl, [{
      key: "size",
      get: function get() {
        return this.stack.length;
      }
    }]);

    return StackImpl;
  }();

  function clearElement(parent) {
    var current = parent.firstChild;

    while (current) {
      var next = current.nextSibling;
      parent.removeChild(current);
      current = next;
    }
  }

  var SERIALIZATION_FIRST_NODE_STRING = '%+b:0%';
  function isSerializationFirstNode(node) {
    return node.nodeValue === SERIALIZATION_FIRST_NODE_STRING;
  }

  var objKeys = Object.keys;
  function assign(obj) {
    for (var i = 1; i < arguments.length; i++) {
      var assignment = arguments[i];
      if (assignment === null || typeof assignment !== 'object') continue;
      var keys = objKeys(assignment);

      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        obj[key] = assignment[key];
      }
    }

    return obj;
  }
  function fillNulls(count) {
    var arr = new Array(count);

    for (var i = 0; i < count; i++) {
      arr[i] = null;
    }

    return arr;
  }
  function values(obj) {
    var vals = [];

    for (var key in obj) {
      vals.push(obj[key]);
    }

    return vals;
  }

  var HAS_NATIVE_SYMBOL = function () {
    if (typeof Symbol !== 'function') {
      return false;
    } // eslint-disable-next-line symbol-description


    return typeof Symbol() === 'symbol';
  }();
  function keys(obj) {
    return Object.keys(obj);
  }
  function unwrap(val) {
    if (val === null || val === undefined) throw new Error("Expected value to be present");
    return val;
  }
  function expect(val, message) {
    if (val === null || val === undefined) throw new Error(message);
    return val;
  }
  function unreachable(message) {
    if (message === void 0) {
      message = 'unreachable';
    }

    return new Error(message);
  }
  function exhausted(value) {
    throw new Error("Exhausted " + value);
  }
  var tuple = function tuple() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args;
  };
  var symbol = HAS_NATIVE_SYMBOL ? Symbol : function (key) {
    return "__" + key + Math.floor(Math.random() * Date.now()) + "__";
  };

  function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } it = o[Symbol.iterator](); return it.next.bind(it); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function strip(strings) {
    var out = '';

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    for (var i = 0; i < strings.length; i++) {
      var string = strings[i];
      var dynamic = args[i] !== undefined ? String(args[i]) : '';
      out += "" + string + dynamic;
    }

    var lines = out.split('\n');

    while (lines.length && lines[0].match(/^\s*$/)) {
      lines.shift();
    }

    while (lines.length && lines[lines.length - 1].match(/^\s*$/)) {
      lines.pop();
    }

    var min = Infinity;

    for (var _iterator = _createForOfIteratorHelperLoose(lines), _step; !(_step = _iterator()).done;) {
      var line = _step.value;
      var leading = line.match(/^\s*/)[0].length;
      min = Math.min(min, leading);
    }

    var stripped = [];

    for (var _iterator2 = _createForOfIteratorHelperLoose(lines), _step2; !(_step2 = _iterator2()).done;) {
      var _line = _step2.value;
      stripped.push(_line.slice(min));
    }

    return stripped.join('\n');
  }

  function isHandle(value) {
    return value >= 0;
  }
  function isNonPrimitiveHandle(value) {
    return value > 3
    /* ENCODED_UNDEFINED_HANDLE */
    ;
  }
  function constants() {
    for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
      values[_key] = arguments[_key];
    }

    return [false, true, null, undefined].concat(values);
  }
  function isSmallInt(value) {
    return value % 1 === 0 && value <= 536870911
    /* MAX_INT */
    && value >= -536870912
    /* MIN_INT */
    ;
  }
  function encodeNegative(num) {

    return num & -536870913
    /* SIGN_BIT */
    ;
  }
  function decodeNegative(num) {

    return num | ~-536870913
    /* SIGN_BIT */
    ;
  }
  function encodePositive(num) {

    return ~num;
  }
  function decodePositive(num) {

    return ~num;
  }
  function encodeHandle(num) {

    return num;
  }
  function decodeHandle(num) {

    return num;
  }
  function encodeImmediate(num) {
    num |= 0;
    return num < 0 ? encodeNegative(num) : encodePositive(num);
  }
  function decodeImmediate(num) {
    num |= 0;
    return num > -536870913
    /* SIGN_BIT */
    ? decodePositive(num) : decodeNegative(num);
  } // Warm
  [1, -1].forEach(function (x) {
    return decodeImmediate(encodeImmediate(x));
  });

  function unwrapHandle(handle) {
    if (typeof handle === 'number') {
      return handle;
    } else {
      var error = handle.errors[0];
      throw new Error("Compile Error: " + error.problem + " @ " + error.span.start + ".." + error.span.end);
    }
  }
  function unwrapTemplate(template) {
    if (template.result === 'error') {
      throw new Error("Compile Error: " + template.problem + " @ " + template.span.start + ".." + template.span.end);
    }

    return template;
  }
  function extractHandle(handle) {
    if (typeof handle === 'number') {
      return handle;
    } else {
      return handle.handle;
    }
  }
  function isOkHandle(handle) {
    return typeof handle === 'number';
  }
  function isErrHandle(handle) {
    return typeof handle === 'number';
  }

  var weakSet = typeof WeakSet === 'function' ? WeakSet : /*#__PURE__*/function () {
    function WeakSetPolyFill() {
      this._map = new WeakMap();
    }

    var _proto = WeakSetPolyFill.prototype;

    _proto.add = function add(val) {
      this._map.set(val, true);

      return this;
    };

    _proto["delete"] = function _delete(val) {
      return this._map["delete"](val);
    };

    _proto.has = function has(val) {
      return this._map.has(val);
    };

    return WeakSetPolyFill;
  }();

  function castToSimple(node) {
    if (isDocument(node)) {
      return node;
    } else if (isElement(node)) {
      return node;
    } else {
      return node;
    }
  }
  function castToBrowser(node, sugaryCheck) {
    if (node === null || node === undefined) {
      return null;
    }

    if (typeof document === undefined) {
      throw new Error('Attempted to cast to a browser node in a non-browser context');
    }

    if (isDocument(node)) {
      return node;
    }

    if (node.ownerDocument !== document) {
      throw new Error('Attempted to cast to a browser node with a node that was not created from this document');
    }

    return checkNode(node, sugaryCheck);
  }

  function checkError(from, check) {
    return new Error("cannot cast a " + from + " into " + check);
  }

  function isDocument(node) {
    return node.nodeType === 9
    /* DOCUMENT_NODE */
    ;
  }

  function isElement(node) {
    return node.nodeType === 1
    /* ELEMENT_NODE */
    ;
  }

  function checkNode(node, check) {
    var isMatch = false;

    if (node !== null) {
      if (typeof check === 'string') {
        isMatch = stringCheckNode(node, check);
      } else if (Array.isArray(check)) {
        isMatch = check.some(function (c) {
          return stringCheckNode(node, c);
        });
      } else {
        throw unreachable();
      }
    }

    if (isMatch) {
      return node;
    } else {
      throw checkError("SimpleElement(" + node + ")", check);
    }
  }

  function stringCheckNode(node, check) {
    switch (check) {
      case 'NODE':
        return true;

      case 'HTML':
        return node instanceof HTMLElement;

      case 'SVG':
        return node instanceof SVGElement;

      case 'ELEMENT':
        return node instanceof Element;

      default:
        if (check.toUpperCase() === check) {
          throw new Error("BUG: this code is missing handling for a generic node type");
        }

        return node instanceof Element && node.tagName.toLowerCase() === check;
    }
  }

  var debugToString;

  if (env.DEBUG) {
    var getFunctionName = function getFunctionName(fn) {
      var functionName = fn.name;

      if (functionName === undefined) {
        var match = Function.prototype.toString.call(fn).match(/function (\w+)\s*\(/);
        functionName = match && match[1] || '';
      }

      return functionName.replace(/^bound /, '');
    };

    var getObjectName = function getObjectName(obj) {
      var name;
      var className;

      if (obj.constructor && obj.constructor !== Object) {
        className = getFunctionName(obj.constructor);
      }

      if ('toString' in obj && obj.toString !== Object.prototype.toString && obj.toString !== Function.prototype.toString) {
        name = obj.toString();
      } // If the class has a decent looking name, and the `toString` is one of the
      // default Ember toStrings, replace the constructor portion of the toString
      // with the class name. We check the length of the class name to prevent doing
      // this when the value is minified.


      if (name && name.match(/<.*:ember\d+>/) && className && className[0] !== '_' && className.length > 2 && className !== 'Class') {
        return name.replace(/<.*:/, "<" + className + ":");
      }

      return name || className;
    };

    var getPrimitiveName = function getPrimitiveName(value) {
      return String(value);
    };

    debugToString = function debugToString(value) {
      if (typeof value === 'function') {
        return getFunctionName(value) || "(unknown function)";
      } else if (typeof value === 'object' && value !== null) {
        return getObjectName(value) || "(unknown object)";
      } else {
        return getPrimitiveName(value);
      }
    };
  }

  var debugToString$1 = debugToString;

  var beginTestSteps;
  var endTestSteps;
  var verifySteps;
  var logStep;

  function assertNever(value, desc) {
    if (desc === void 0) {
      desc = 'unexpected unreachable branch';
    }

    console.log('unreachable', value);
    console.trace(desc + " :: " + JSON.stringify(value) + " (" + value + ")");
  }

  exports.DictSet = DictSet;
  exports.EMPTY_ARRAY = EMPTY_ARRAY;
  exports.HAS_NATIVE_SYMBOL = HAS_NATIVE_SYMBOL;
  exports.SERIALIZATION_FIRST_NODE_STRING = SERIALIZATION_FIRST_NODE_STRING;
  exports.Stack = StackImpl;
  exports._WeakSet = weakSet;
  exports.assert = debugAssert;
  exports.assertNever = assertNever;
  exports.assign = assign;
  exports.beginTestSteps = beginTestSteps;
  exports.castToBrowser = castToBrowser;
  exports.castToSimple = castToSimple;
  exports.checkNode = checkNode;
  exports.clearElement = clearElement;
  exports.constants = constants;
  exports.debugToString = debugToString$1;
  exports.decodeHandle = decodeHandle;
  exports.decodeImmediate = decodeImmediate;
  exports.decodeNegative = decodeNegative;
  exports.decodePositive = decodePositive;
  exports.deprecate = deprecate;
  exports.dict = dict;
  exports.encodeHandle = encodeHandle;
  exports.encodeImmediate = encodeImmediate;
  exports.encodeNegative = encodeNegative;
  exports.encodePositive = encodePositive;
  exports.endTestSteps = endTestSteps;
  exports.ensureGuid = ensureGuid;
  exports.exhausted = exhausted;
  exports.expect = expect;
  exports.extractHandle = extractHandle;
  exports.fillNulls = fillNulls;
  exports.initializeGuid = initializeGuid;
  exports.isDict = isDict;
  exports.isErrHandle = isErrHandle;
  exports.isHandle = isHandle;
  exports.isNonPrimitiveHandle = isNonPrimitiveHandle;
  exports.isObject = isObject;
  exports.isOkHandle = isOkHandle;
  exports.isSerializationFirstNode = isSerializationFirstNode;
  exports.isSmallInt = isSmallInt;
  exports.keys = keys;
  exports.logStep = logStep;
  exports.strip = strip;
  exports.symbol = symbol;
  exports.tuple = tuple;
  exports.unreachable = unreachable;
  exports.unwrap = unwrap;
  exports.unwrapHandle = unwrapHandle;
  exports.unwrapTemplate = unwrapTemplate;
  exports.values = values;
  exports.verifySteps = verifySteps;

  Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci11dGlsLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9hcnJheS11dGlscy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2Fzc2VydC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2d1aWQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi9jb2xsZWN0aW9ucy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2RvbS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2lzLXNlcmlhbGl6YXRpb24tZmlyc3Qtbm9kZS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL29iamVjdC11dGlscy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3BsYXRmb3JtLXV0aWxzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvc3RyaW5nLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvaW1tZWRpYXRlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvdGVtcGxhdGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2xpYi93ZWFrLXNldC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3NpbXBsZS1jYXN0LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvZGVidWctdG8tc3RyaW5nLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvdXRpbC9saWIvZGVidWctc3RlcHMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci91dGlsL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBFTVBUWV9BUlJBWTogYW55W10gPSBPYmplY3QuZnJlZXplKFtdKSBhcyBhbnk7XG4iLCIvLyBpbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuLy8gbGV0IGFscmVhZHlXYXJuZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnQXNzZXJ0KHRlc3Q6IGFueSwgbXNnOiBzdHJpbmcpIHtcbiAgLy8gaWYgKCFhbHJlYWR5V2FybmVkKSB7XG4gIC8vICAgYWxyZWFkeVdhcm5lZCA9IHRydWU7XG4gIC8vICAgTG9nZ2VyLndhcm4oXCJEb24ndCBsZWF2ZSBkZWJ1ZyBhc3NlcnRpb25zIG9uIGluIHB1YmxpYyBidWlsZHNcIik7XG4gIC8vIH1cblxuICBpZiAoIXRlc3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnIHx8ICdhc3NlcnRpb24gZmFpbHVyZScpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9kQXNzZXJ0KCkge31cblxuZXhwb3J0IGZ1bmN0aW9uIGRlcHJlY2F0ZShkZXNjOiBzdHJpbmcpIHtcbiAgY29uc29sZS53YXJuKGBERVBSRUNBVElPTjogJHtkZXNjfWApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWJ1Z0Fzc2VydDtcbiIsImxldCBHVUlEID0gMDtcblxuZXhwb3J0IGludGVyZmFjZSBIYXNHdWlkIHtcbiAgX2d1aWQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVHdWlkKG9iamVjdDogSGFzR3VpZCk6IG51bWJlciB7XG4gIHJldHVybiAob2JqZWN0Ll9ndWlkID0gKytHVUlEKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUd1aWQob2JqZWN0OiBIYXNHdWlkKTogbnVtYmVyIHtcbiAgcmV0dXJuIG9iamVjdC5fZ3VpZCB8fCBpbml0aWFsaXplR3VpZChvYmplY3QpO1xufVxuIiwiaW1wb3J0IHsgSGFzR3VpZCwgZW5zdXJlR3VpZCB9IGZyb20gJy4vZ3VpZCc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICcuL3BsYXRmb3JtLXV0aWxzJztcbmltcG9ydCB7IERpY3QsIFN0YWNrIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0PFQ+IHtcbiAgYWRkKHZhbHVlOiBUKTogU2V0PFQ+O1xuICBkZWxldGUodmFsdWU6IFQpOiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGljdDxUID0gdW5rbm93bj4oKTogRGljdDxUPiB7XG4gIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEaWN0PFQ+KHU6IFQpOiB1IGlzIERpY3QgJiBUIHtcbiAgcmV0dXJuIHUgIT09IG51bGwgJiYgdSAhPT0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3Q8VD4odTogVCk6IHUgaXMgb2JqZWN0ICYgVCB7XG4gIHJldHVybiB0eXBlb2YgdSA9PT0gJ29iamVjdCcgJiYgdSAhPT0gbnVsbDtcbn1cblxuZXhwb3J0IHR5cGUgU2V0TWVtYmVyID0gSGFzR3VpZCB8IHN0cmluZztcblxuZXhwb3J0IGNsYXNzIERpY3RTZXQ8VCBleHRlbmRzIFNldE1lbWJlcj4gaW1wbGVtZW50cyBTZXQ8VD4ge1xuICBwcml2YXRlIGRpY3Q6IERpY3Q8VD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5kaWN0ID0gZGljdDxUPigpO1xuICB9XG5cbiAgYWRkKG9iajogVCk6IFNldDxUPiB7XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB0aGlzLmRpY3Rbb2JqIGFzIGFueV0gPSBvYmo7XG4gICAgZWxzZSB0aGlzLmRpY3RbZW5zdXJlR3VpZChvYmogYXMgYW55KV0gPSBvYmo7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkZWxldGUob2JqOiBUKSB7XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSBkZWxldGUgdGhpcy5kaWN0W29iaiBhcyBhbnldO1xuICAgIGVsc2UgaWYgKChvYmogYXMgYW55KS5fZ3VpZCkgZGVsZXRlIHRoaXMuZGljdFsob2JqIGFzIGFueSkuX2d1aWRdO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdGFja0ltcGw8VD4gaW1wbGVtZW50cyBTdGFjazxUPiB7XG4gIHByaXZhdGUgc3RhY2s6IFRbXSA9IFtdO1xuICBwdWJsaWMgY3VycmVudDogT3B0aW9uPFQ+ID0gbnVsbDtcblxuICBwdWJsaWMgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2subGVuZ3RoO1xuICB9XG5cbiAgcHVzaChpdGVtOiBUKSB7XG4gICAgdGhpcy5jdXJyZW50ID0gaXRlbTtcbiAgICB0aGlzLnN0YWNrLnB1c2goaXRlbSk7XG4gIH1cblxuICBwb3AoKTogT3B0aW9uPFQ+IHtcbiAgICBsZXQgaXRlbSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgbGV0IGxlbiA9IHRoaXMuc3RhY2subGVuZ3RoO1xuICAgIHRoaXMuY3VycmVudCA9IGxlbiA9PT0gMCA/IG51bGwgOiB0aGlzLnN0YWNrW2xlbiAtIDFdO1xuXG4gICAgcmV0dXJuIGl0ZW0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBpdGVtO1xuICB9XG5cbiAgbnRoKGZyb206IG51bWJlcik6IE9wdGlvbjxUPiB7XG4gICAgbGV0IGxlbiA9IHRoaXMuc3RhY2subGVuZ3RoO1xuICAgIHJldHVybiBsZW4gPCBmcm9tID8gbnVsbCA6IHRoaXMuc3RhY2tbbGVuIC0gZnJvbV07XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YWNrLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIHRvQXJyYXkoKTogVFtdIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjaztcbiAgfVxufVxuIiwiaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50LCBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyRWxlbWVudChwYXJlbnQ6IFNpbXBsZUVsZW1lbnQpIHtcbiAgbGV0IGN1cnJlbnQ6IE9wdGlvbjxTaW1wbGVOb2RlPiA9IHBhcmVudC5maXJzdENoaWxkO1xuXG4gIHdoaWxlIChjdXJyZW50KSB7XG4gICAgbGV0IG5leHQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuICAgIHBhcmVudC5yZW1vdmVDaGlsZChjdXJyZW50KTtcbiAgICBjdXJyZW50ID0gbmV4dDtcbiAgfVxufVxuIiwiaW1wb3J0IHsgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5cbmV4cG9ydCBjb25zdCBTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HID0gJyUrYjowJSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NlcmlhbGl6YXRpb25GaXJzdE5vZGUobm9kZTogU2ltcGxlTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5ub2RlVmFsdWUgPT09IFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkc7XG59XG4iLCJjb25zdCB7IGtleXM6IG9iaktleXMgfSA9IE9iamVjdDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbjxULCBVPihvYmo6IFQsIGFzc2lnbm1lbnRzOiBVKTogVCAmIFU7XG5leHBvcnQgZnVuY3Rpb24gYXNzaWduPFQsIFUsIFY+KG9iajogVCwgYTogVSwgYjogVik6IFQgJiBVICYgVjtcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ248VCwgVSwgViwgVz4ob2JqOiBULCBhOiBVLCBiOiBWLCBjOiBXKTogVCAmIFUgJiBWICYgVztcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ248VCwgVSwgViwgVywgWD4ob2JqOiBULCBhOiBVLCBiOiBWLCBjOiBXLCBkOiBYKTogVCAmIFUgJiBWICYgVyAmIFg7XG5leHBvcnQgZnVuY3Rpb24gYXNzaWduPFQsIFUsIFYsIFcsIFgsIFk+KFxuICBvYmo6IFQsXG4gIGE6IFUsXG4gIGI6IFYsXG4gIGM6IFcsXG4gIGQ6IFgsXG4gIGU6IFlcbik6IFQgJiBVICYgViAmIFcgJiBYICYgWTtcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ248VCwgVSwgViwgVywgWCwgWSwgWj4oXG4gIG9iajogVCxcbiAgYTogVSxcbiAgYjogVixcbiAgYzogVyxcbiAgZDogWCxcbiAgZTogWSxcbiAgZjogWlxuKTogVCAmIFUgJiBWICYgVyAmIFggJiBZICYgWjtcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0OiBhbnksIC4uLmFyZ3M6IGFueVtdKTogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbihvYmo6IGFueSkge1xuICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhc3NpZ25tZW50ID0gYXJndW1lbnRzW2ldO1xuICAgIGlmIChhc3NpZ25tZW50ID09PSBudWxsIHx8IHR5cGVvZiBhc3NpZ25tZW50ICE9PSAnb2JqZWN0JykgY29udGludWU7XG4gICAgbGV0IGtleXMgPSBvYmpLZXlzKGFzc2lnbm1lbnQpO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwga2V5cy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IGtleSA9IGtleXNbal07XG4gICAgICBvYmpba2V5XSA9IGFzc2lnbm1lbnRba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbGxOdWxsczxUPihjb3VudDogbnVtYmVyKTogVFtdIHtcbiAgbGV0IGFyciA9IG5ldyBBcnJheShjb3VudCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgYXJyW2ldID0gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZXM8VD4ob2JqOiB7IFtzOiBzdHJpbmddOiBUIH0pOiBUW10ge1xuICBjb25zdCB2YWxzID0gW107XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIHZhbHMucHVzaChvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIHZhbHM7XG59XG4iLCJleHBvcnQgdHlwZSBPcHRpb248VD4gPSBUIHwgbnVsbDtcbmV4cG9ydCB0eXBlIE1heWJlPFQ+ID0gT3B0aW9uPFQ+IHwgdW5kZWZpbmVkIHwgdm9pZDtcblxuZXhwb3J0IHR5cGUgRmFjdG9yeTxUPiA9IG5ldyAoLi4uYXJnczogdW5rbm93bltdKSA9PiBUO1xuXG5leHBvcnQgY29uc3QgSEFTX05BVElWRV9TWU1CT0wgPSAoZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBzeW1ib2wtZGVzY3JpcHRpb25cbiAgcmV0dXJuIHR5cGVvZiBTeW1ib2woKSA9PT0gJ3N5bWJvbCc7XG59KSgpO1xuXG5leHBvcnQgZnVuY3Rpb24ga2V5czxUPihvYmo6IFQpOiBBcnJheTxrZXlvZiBUPiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopIGFzIEFycmF5PGtleW9mIFQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwPFQ+KHZhbDogTWF5YmU8VD4pOiBUIHtcbiAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB2YWx1ZSB0byBiZSBwcmVzZW50YCk7XG4gIHJldHVybiB2YWwgYXMgVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cGVjdDxUPih2YWw6IE1heWJlPFQ+LCBtZXNzYWdlOiBzdHJpbmcpOiBUIHtcbiAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gdmFsIGFzIFQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnJlYWNoYWJsZShtZXNzYWdlID0gJ3VucmVhY2hhYmxlJyk6IEVycm9yIHtcbiAgcmV0dXJuIG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4aGF1c3RlZCh2YWx1ZTogbmV2ZXIpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihgRXhoYXVzdGVkICR7dmFsdWV9YCk7XG59XG5cbmV4cG9ydCB0eXBlIExpdCA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsIHwgdm9pZCB8IHt9O1xuXG5leHBvcnQgY29uc3QgdHVwbGUgPSA8VCBleHRlbmRzIExpdFtdPiguLi5hcmdzOiBUKSA9PiBhcmdzO1xuXG5leHBvcnQgY29uc3Qgc3ltYm9sID0gSEFTX05BVElWRV9TWU1CT0xcbiAgPyBTeW1ib2xcbiAgOiAoa2V5OiBzdHJpbmcpID0+IGBfXyR7a2V5fSR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogRGF0ZS5ub3coKSl9X19gIGFzIGFueTtcbiIsImV4cG9ydCBmdW5jdGlvbiBzdHJpcChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uYXJnczogdW5rbm93bltdKSB7XG4gIGxldCBvdXQgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHN0cmluZyA9IHN0cmluZ3NbaV07XG4gICAgbGV0IGR5bmFtaWMgPSBhcmdzW2ldICE9PSB1bmRlZmluZWQgPyBTdHJpbmcoYXJnc1tpXSkgOiAnJztcblxuICAgIG91dCArPSBgJHtzdHJpbmd9JHtkeW5hbWljfWA7XG4gIH1cblxuICBsZXQgbGluZXMgPSBvdXQuc3BsaXQoJ1xcbicpO1xuXG4gIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbMF0ubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgbGluZXMuc2hpZnQoKTtcbiAgfVxuXG4gIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgbGluZXMucG9wKCk7XG4gIH1cblxuICBsZXQgbWluID0gSW5maW5pdHk7XG5cbiAgZm9yIChsZXQgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBsZWFkaW5nID0gbGluZS5tYXRjaCgvXlxccyovKSFbMF0ubGVuZ3RoO1xuXG4gICAgbWluID0gTWF0aC5taW4obWluLCBsZWFkaW5nKTtcbiAgfVxuXG4gIGxldCBzdHJpcHBlZCA9IFtdO1xuXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBzdHJpcHBlZC5wdXNoKGxpbmUuc2xpY2UobWluKSk7XG4gIH1cblxuICByZXR1cm4gc3RyaXBwZWQuam9pbignXFxuJyk7XG59XG4iLCJpbXBvcnQgeyBMT0NBTF9ERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IGRlYnVnQXNzZXJ0IGFzIGFzc2VydCB9IGZyb20gJy4vYXNzZXJ0JztcblxuLypcbiAgRW5jb2Rpbmcgbm90ZXNcblxuICBXZSB1c2UgMzAgYml0IGludGVnZXJzIGZvciBlbmNvZGluZywgc28gdGhhdCB3ZSBkb24ndCBldmVyIGVuY29kZSBhIG5vbi1TTUlcbiAgaW50ZWdlciB0byBwdXNoIG9uIHRoZSBzdGFjay5cblxuICBIYW5kbGVzIGFyZSA+PSAwXG4gIEltbWVkaWF0ZXMgYXJlIDwgMFxuXG4gIFRydWUsIEZhbHNlLCBVbmRlZmluZWQgYW5kIE51bGwgYXJlIHB1c2hlZCBhcyBoYW5kbGVzIGludG8gdGhlIHN5bWJvbCB0YWJsZSxcbiAgd2l0aCB3ZWxsIGtub3duIGhhbmRsZXMgKDAsIDEsIDIsIDMpXG5cbiAgVGhlIG5lZ2F0aXZlIHNwYWNlIGlzIGRpdmlkZWQgaW50byBwb3NpdGl2ZXMgYW5kIG5lZ2F0aXZlcy4gUG9zaXRpdmVzIGFyZVxuICBoaWdoZXIgbnVtYmVycyAoLTEsIC0yLCAtMywgZXRjKSwgbmVnYXRpdmVzIGFyZSBsb3dlci5cblxuICBXZSBvbmx5IGVuY29kZSBpbW1lZGlhdGVzIGZvciB0d28gcmVhc29uczpcblxuICAxLiBUbyB0cmFuc2ZlciBvdmVyIHRoZSB3aXJlLCBzbyB0aGV5J3JlIHNtYWxsZXIgaW4gZ2VuZXJhbFxuICAyLiBXaGVuIHB1c2hpbmcgdmFsdWVzIG9udG8gdGhlIHN0YWNrIGZyb20gdGhlIGxvdyBsZXZlbC9pbm5lciBWTSwgd2hpY2ggbWF5XG4gICAgIGJlIGNvbnZlcnRlZCBpbnRvIFdBU00gb25lIGRheS5cblxuICBUaGlzIGFsbG93cyB0aGUgbG93LWxldmVsIFZNIHRvIGFsd2F5cyB1c2UgU01JcywgYW5kIHRvIG1pbmltaXplIHVzaW5nIEpTXG4gIHZhbHVlcyB2aWEgaGFuZGxlcyBmb3IgdGhpbmdzIGxpa2UgdGhlIHN0YWNrIHBvaW50ZXIgYW5kIGZyYW1lIHBvaW50ZXIuXG4gIEV4dGVybmFsbHksIG1vc3QgY29kZSBwdXNoZXMgdmFsdWVzIGFzIEpTIHZhbHVlcywgZXhjZXB0IHdoZW4gYmVpbmcgcHVsbGVkXG4gIGZyb20gdGhlIGFwcGVuZCBieXRlIGNvZGUgd2hlcmUgaXQgd2FzIGFscmVhZHkgZW5jb2RlZC5cblxuICBMb2dpY2FsbHksIHRoaXMgaXMgYmVjYXVzZSB0aGUgbG93IGxldmVsIFZNIGRvZXNuJ3QgcmVhbGx5IGNhcmUgYWJvdXQgdGhlc2VcbiAgaGlnaGVyIGxldmVsIHZhbHVlcy4gRm9yIGluc3RhbmNlLCB0aGUgcmVzdWx0IG9mIGEgdXNlcmxhbmQgaGVscGVyIG1heSBiZSBhXG4gIG51bWJlciwgb3IgYSBib29sZWFuLCBvciB1bmRlZmluZWQvbnVsbCwgYnV0IGl0J3MgZXh0cmEgd29yayB0byBmaWd1cmUgdGhhdFxuICBvdXQgYW5kIHB1c2ggaXQgY29ycmVjdGx5LCB2cy4ganVzdCBwdXNoaW5nIHRoZSB2YWx1ZSBhcyBhIEpTIHZhbHVlIHdpdGggYVxuICBoYW5kbGUuXG5cbiAgTm90ZTogVGhlIGRldGFpbHMgY291bGQgY2hhbmdlIGhlcmUgaW4gdGhlIGZ1dHVyZSwgdGhpcyBpcyBqdXN0IHRoZSBjdXJyZW50XG4gIHN0cmF0ZWd5LlxuKi9cblxuZXhwb3J0IGNvbnN0IGVudW0gSW1tZWRpYXRlQ29uc3RhbnRzIHtcbiAgTUFYX1NNSSA9IDIgKiogMzAgLSAxLFxuICBNSU5fU01JID0gfk1BWF9TTUksXG4gIFNJR05fQklUID0gfigyICoqIDI5KSxcbiAgTUFYX0lOVCA9IH5TSUdOX0JJVCAtIDEsXG4gIE1JTl9JTlQgPSB+TUFYX0lOVCxcblxuICBGQUxTRV9IQU5ETEUgPSAwLFxuICBUUlVFX0hBTkRMRSA9IDEsXG4gIE5VTExfSEFORExFID0gMixcbiAgVU5ERUZJTkVEX0hBTkRMRSA9IDMsXG5cbiAgRU5DT0RFRF9GQUxTRV9IQU5ETEUgPSBGQUxTRV9IQU5ETEUsXG4gIEVOQ09ERURfVFJVRV9IQU5ETEUgPSBUUlVFX0hBTkRMRSxcbiAgRU5DT0RFRF9OVUxMX0hBTkRMRSA9IE5VTExfSEFORExFLFxuICBFTkNPREVEX1VOREVGSU5FRF9IQU5ETEUgPSBVTkRFRklORURfSEFORExFLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNIYW5kbGUodmFsdWU6IG51bWJlcikge1xuICByZXR1cm4gdmFsdWUgPj0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTm9uUHJpbWl0aXZlSGFuZGxlKHZhbHVlOiBudW1iZXIpIHtcbiAgcmV0dXJuIHZhbHVlID4gSW1tZWRpYXRlQ29uc3RhbnRzLkVOQ09ERURfVU5ERUZJTkVEX0hBTkRMRTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0YW50cyguLi52YWx1ZXM6IHVua25vd25bXSk6IHVua25vd25bXSB7XG4gIHJldHVybiBbZmFsc2UsIHRydWUsIG51bGwsIHVuZGVmaW5lZCwgLi4udmFsdWVzXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU21hbGxJbnQodmFsdWU6IG51bWJlcikge1xuICByZXR1cm4gKFxuICAgIHZhbHVlICUgMSA9PT0gMCAmJiB2YWx1ZSA8PSBJbW1lZGlhdGVDb25zdGFudHMuTUFYX0lOVCAmJiB2YWx1ZSA+PSBJbW1lZGlhdGVDb25zdGFudHMuTUlOX0lOVFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlTmVnYXRpdmUobnVtOiBudW1iZXIpIHtcbiAgaWYgKExPQ0FMX0RFQlVHKSB7XG4gICAgYXNzZXJ0KFxuICAgICAgbnVtICUgMSA9PT0gMCAmJiBudW0gPj0gSW1tZWRpYXRlQ29uc3RhbnRzLk1JTl9JTlQgJiYgbnVtIDwgMCxcbiAgICAgIGBDb3VsZCBub3QgZW5jb2RlIG5lZ2F0aXZlOiAke251bX1gXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBudW0gJiBJbW1lZGlhdGVDb25zdGFudHMuU0lHTl9CSVQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVOZWdhdGl2ZShudW06IG51bWJlcikge1xuICBpZiAoTE9DQUxfREVCVUcpIHtcbiAgICBhc3NlcnQoXG4gICAgICBudW0gJSAxID09PSAwICYmIG51bSA8IH5JbW1lZGlhdGVDb25zdGFudHMuTUFYX0lOVCAmJiBudW0gPj0gSW1tZWRpYXRlQ29uc3RhbnRzLk1JTl9TTUksXG4gICAgICBgQ291bGQgbm90IGRlY29kZSBuZWdhdGl2ZTogJHtudW19YFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gbnVtIHwgfkltbWVkaWF0ZUNvbnN0YW50cy5TSUdOX0JJVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZVBvc2l0aXZlKG51bTogbnVtYmVyKSB7XG4gIGlmIChMT0NBTF9ERUJVRykge1xuICAgIGFzc2VydChcbiAgICAgIG51bSAlIDEgPT09IDAgJiYgbnVtID49IDAgJiYgbnVtIDw9IEltbWVkaWF0ZUNvbnN0YW50cy5NQVhfSU5ULFxuICAgICAgYENvdWxkIG5vdCBlbmNvZGUgcG9zaXRpdmU6ICR7bnVtfWBcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIH5udW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVQb3NpdGl2ZShudW06IG51bWJlcikge1xuICBpZiAoTE9DQUxfREVCVUcpIHtcbiAgICBhc3NlcnQoXG4gICAgICBudW0gJSAxID09PSAwICYmIG51bSA8PSAwICYmIG51bSA+PSB+SW1tZWRpYXRlQ29uc3RhbnRzLk1BWF9JTlQsXG4gICAgICBgQ291bGQgbm90IGRlY29kZSBwb3NpdGl2ZTogJHtudW19YFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gfm51bTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUhhbmRsZShudW06IG51bWJlcikge1xuICBpZiAoTE9DQUxfREVCVUcpIHtcbiAgICBhc3NlcnQoXG4gICAgICBudW0gJSAxID09PSAwICYmIG51bSA+PSAwICYmIG51bSA8PSBJbW1lZGlhdGVDb25zdGFudHMuTUFYX1NNSSxcbiAgICAgIGBDb3VsZCBub3QgZW5jb2RlIGhhbmRsZTogJHtudW19YFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gbnVtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlSGFuZGxlKG51bTogbnVtYmVyKSB7XG4gIGlmIChMT0NBTF9ERUJVRykge1xuICAgIGFzc2VydChcbiAgICAgIG51bSAlIDEgPT09IDAgJiYgbnVtIDw9IEltbWVkaWF0ZUNvbnN0YW50cy5NQVhfU01JICYmIG51bSA+PSAwLFxuICAgICAgYENvdWxkIG5vdCBkZWNvZGUgaGFuZGxlOiAke251bX1gXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBudW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVJbW1lZGlhdGUobnVtOiBudW1iZXIpIHtcbiAgbnVtIHw9IDA7XG4gIHJldHVybiBudW0gPCAwID8gZW5jb2RlTmVnYXRpdmUobnVtKSA6IGVuY29kZVBvc2l0aXZlKG51bSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVJbW1lZGlhdGUobnVtOiBudW1iZXIpIHtcbiAgbnVtIHw9IDA7XG4gIHJldHVybiBudW0gPiBJbW1lZGlhdGVDb25zdGFudHMuU0lHTl9CSVQgPyBkZWNvZGVQb3NpdGl2ZShudW0pIDogZGVjb2RlTmVnYXRpdmUobnVtKTtcbn1cblxuLy8gV2FybVxuWzEsIDIsIDNdLmZvckVhY2goKHgpID0+IGRlY29kZUhhbmRsZShlbmNvZGVIYW5kbGUoeCkpKTtcblsxLCAtMV0uZm9yRWFjaCgoeCkgPT4gZGVjb2RlSW1tZWRpYXRlKGVuY29kZUltbWVkaWF0ZSh4KSkpO1xuIiwiaW1wb3J0IHsgSGFuZGxlUmVzdWx0LCBUZW1wbGF0ZSwgVGVtcGxhdGVPaywgT2tIYW5kbGUsIEVyckhhbmRsZSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwSGFuZGxlKGhhbmRsZTogSGFuZGxlUmVzdWx0KTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiBoYW5kbGUgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIGhhbmRsZTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgZXJyb3IgPSBoYW5kbGUuZXJyb3JzWzBdO1xuICAgIHRocm93IG5ldyBFcnJvcihgQ29tcGlsZSBFcnJvcjogJHtlcnJvci5wcm9ibGVtfSBAICR7ZXJyb3Iuc3Bhbi5zdGFydH0uLiR7ZXJyb3Iuc3Bhbi5lbmR9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSk6IFRlbXBsYXRlT2sge1xuICBpZiAodGVtcGxhdGUucmVzdWx0ID09PSAnZXJyb3InKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYENvbXBpbGUgRXJyb3I6ICR7dGVtcGxhdGUucHJvYmxlbX0gQCAke3RlbXBsYXRlLnNwYW4uc3RhcnR9Li4ke3RlbXBsYXRlLnNwYW4uZW5kfWBcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIHRlbXBsYXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEhhbmRsZShoYW5kbGU6IEhhbmRsZVJlc3VsdCk6IG51bWJlciB7XG4gIGlmICh0eXBlb2YgaGFuZGxlID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBoYW5kbGU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGhhbmRsZS5oYW5kbGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2tIYW5kbGUoaGFuZGxlOiBIYW5kbGVSZXN1bHQpOiBoYW5kbGUgaXMgT2tIYW5kbGUge1xuICByZXR1cm4gdHlwZW9mIGhhbmRsZSA9PT0gJ251bWJlcic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VyckhhbmRsZShoYW5kbGU6IEhhbmRsZVJlc3VsdCk6IGhhbmRsZSBpcyBFcnJIYW5kbGUge1xuICByZXR1cm4gdHlwZW9mIGhhbmRsZSA9PT0gJ251bWJlcic7XG59XG4iLCJleHBvcnQgZGVmYXVsdCAodHlwZW9mIFdlYWtTZXQgPT09ICdmdW5jdGlvbidcbiAgPyBXZWFrU2V0XG4gIDogY2xhc3MgV2Vha1NldFBvbHlGaWxsPFQgZXh0ZW5kcyBvYmplY3Q+IHtcbiAgICAgIHByaXZhdGUgX21hcCA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICAgIGFkZCh2YWw6IFQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fbWFwLnNldCh2YWwsIHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgZGVsZXRlKHZhbDogVCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmRlbGV0ZSh2YWwpO1xuICAgICAgfVxuXG4gICAgICBoYXModmFsOiBUKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuaGFzKHZhbCk7XG4gICAgICB9XG4gICAgfSkgYXMgV2Vha1NldENvbnN0cnVjdG9yO1xuIiwiaW1wb3J0IHsgdW5yZWFjaGFibGUgfSBmcm9tICcuL3BsYXRmb3JtLXV0aWxzJztcbmltcG9ydCB7IE5vZGVUeXBlLCBTaW1wbGVEb2N1bWVudCwgU2ltcGxlRWxlbWVudCwgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5cbmludGVyZmFjZSBHZW5lcmljRWxlbWVudFRhZ3Mge1xuICBIVE1MOiBIVE1MRWxlbWVudDtcbiAgU1ZHOiBTVkdFbGVtZW50O1xuICBFTEVNRU5UOiBIVE1MRWxlbWVudCB8IFNWR0VsZW1lbnQ7XG59XG5cbmludGVyZmFjZSBHZW5lcmljTm9kZVRhZ3Mge1xuICBOT0RFOiBOb2RlO1xufVxuXG50eXBlIEdlbmVyaWNOb2RlVGFnID0ga2V5b2YgR2VuZXJpY05vZGVUYWdzO1xuXG5pbnRlcmZhY2UgQnJvd3NlckVsZW1lbnRUYWdzIGV4dGVuZHMgSFRNTEVsZW1lbnRUYWdOYW1lTWFwLCBHZW5lcmljRWxlbWVudFRhZ3Mge31cbnR5cGUgQnJvd3NlckVsZW1lbnRUYWcgPSBrZXlvZiBCcm93c2VyRWxlbWVudFRhZ3M7XG5cbmludGVyZmFjZSBCcm93c2VyVGFncyBleHRlbmRzIEJyb3dzZXJFbGVtZW50VGFncywgR2VuZXJpY05vZGVUYWdzIHt9XG50eXBlIEJyb3dzZXJUYWcgPSBrZXlvZiBCcm93c2VyVGFncztcblxudHlwZSBOb2RlQ2hlY2s8TiBleHRlbmRzIE5vZGU+ID0gKG5vZGU6IE5vZGUpID0+IG5vZGUgaXMgTjtcbnR5cGUgU3VnYXJ5Tm9kZUNoZWNrPEsgZXh0ZW5kcyBCcm93c2VyVGFnID0gQnJvd3NlclRhZz4gPSBOb2RlQ2hlY2s8QnJvd3NlclRhZ3NbS10+IHwgSyB8IEtbXTtcbnR5cGUgTm9kZUZvclN1Z2FyeUNoZWNrPFMgZXh0ZW5kcyBTdWdhcnlOb2RlQ2hlY2s8QnJvd3NlclRhZz4+ID0gUyBleHRlbmRzIE5vZGVDaGVjazxpbmZlciBOPlxuICA/IE5cbiAgOiBTIGV4dGVuZHMga2V5b2YgQnJvd3NlclRhZ3NcbiAgPyBCcm93c2VyVGFnc1tTXVxuICA6IFMgZXh0ZW5kcyAoa2V5b2YgQnJvd3NlclRhZ3MpW11cbiAgPyBCcm93c2VyVGFnc1tTW251bWJlcl1dXG4gIDogbmV2ZXI7XG5cbnR5cGUgQnJvd3Nlck5vZGUgPSBFbGVtZW50IHwgRG9jdW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHwgVGV4dCB8IENvbW1lbnQgfCBOb2RlO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FzdFRvU2ltcGxlKGRvYzogRG9jdW1lbnQgfCBTaW1wbGVEb2N1bWVudCk6IFNpbXBsZURvY3VtZW50O1xuZXhwb3J0IGZ1bmN0aW9uIGNhc3RUb1NpbXBsZShlbGVtOiBFbGVtZW50IHwgU2ltcGxlRWxlbWVudCk6IFNpbXBsZUVsZW1lbnQ7XG5leHBvcnQgZnVuY3Rpb24gY2FzdFRvU2ltcGxlKG5vZGU6IE5vZGUgfCBTaW1wbGVOb2RlKTogU2ltcGxlTm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBjYXN0VG9TaW1wbGUoXG4gIG5vZGU6IERvY3VtZW50IHwgRWxlbWVudCB8IE5vZGUgfCBTaW1wbGVEb2N1bWVudCB8IFNpbXBsZUVsZW1lbnQgfCBTaW1wbGVOb2RlXG4pIHtcbiAgaWYgKGlzRG9jdW1lbnQobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZSBhcyBTaW1wbGVEb2N1bWVudDtcbiAgfSBlbHNlIGlmIChpc0VsZW1lbnQobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZSBhcyBTaW1wbGVFbGVtZW50O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBub2RlIGFzIFNpbXBsZU5vZGU7XG4gIH1cbn1cblxuLy8gSWYgcGFzc2VkIGEgZG9jdW1lbnQsIHZlcmlmeSB3ZSdyZSBpbiB0aGUgYnJvd3NlciBhbmQgcmV0dXJuIGl0IGFzIGEgRG9jdW1lbnRcbmV4cG9ydCBmdW5jdGlvbiBjYXN0VG9Ccm93c2VyKGRvYzogRG9jdW1lbnQgfCBTaW1wbGVEb2N1bWVudCk6IERvY3VtZW50O1xuLy8gSWYgd2UgZG9uJ3Qga25vdyB3aGF0IHRoaXMgaXMsIGJ1dCB0aGUgY2hlY2sgcmVxdWlyZXMgaXQgdG8gYmUgYW4gZWxlbWVudCxcbi8vIHRoZSBjYXN0IHdpbGwgbWFuZGF0ZSB0aGF0IGl0J3MgYSBicm93c2VyIGVsZW1lbnRcbmV4cG9ydCBmdW5jdGlvbiBjYXN0VG9Ccm93c2VyPFMgZXh0ZW5kcyBTdWdhcnlOb2RlQ2hlY2s8QnJvd3NlckVsZW1lbnRUYWc+PihcbiAgbm9kZTogQnJvd3Nlck5vZGUgfCBTaW1wbGVOb2RlLFxuICBjaGVjazogU1xuKTogTm9kZUZvclN1Z2FyeUNoZWNrPFM+O1xuLy8gRmluYWxseSwgaWYgaXQncyBhIG1vcmUgZ2VuZXJpYyBjaGVjaywgdGhlIGNhc3Qgd2lsbCBtYW5kYXRlIHRoYXQgaXQncyBhXG4vLyBicm93c2VyIG5vZGUgYW5kIHJldHVybiBhIEJyb3dzZXJOb2RlVXRpbHMgY29ycmVzcG9uZGluZyB0byB0aGUgY2hlY2tcbmV4cG9ydCBmdW5jdGlvbiBjYXN0VG9Ccm93c2VyPFMgZXh0ZW5kcyBTdWdhcnlOb2RlQ2hlY2s8R2VuZXJpY05vZGVUYWc+PihcbiAgZWxlbWVudDogQnJvd3Nlck5vZGUgfCBTaW1wbGVOb2RlLFxuICBjaGVjazogU1xuKTogTm9kZUZvclN1Z2FyeUNoZWNrPFM+O1xuZXhwb3J0IGZ1bmN0aW9uIGNhc3RUb0Jyb3dzZXI8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oXG4gIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQgfCBFbGVtZW50LFxuICBjaGVjazogS1xuKTogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdO1xuZXhwb3J0IGZ1bmN0aW9uIGNhc3RUb0Jyb3dzZXI8UyBleHRlbmRzIFN1Z2FyeU5vZGVDaGVjaz4oXG4gIG5vZGU6IFNpbXBsZU5vZGUgfCBCcm93c2VyTm9kZSB8IG51bGwgfCB1bmRlZmluZWQsXG4gIHN1Z2FyeUNoZWNrPzogU1xuKTogRG9jdW1lbnQgfCBOb2RlRm9yU3VnYXJ5Q2hlY2s8Uz4gfCBudWxsIHtcbiAgaWYgKG5vZGUgPT09IG51bGwgfHwgbm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byBjYXN0IHRvIGEgYnJvd3NlciBub2RlIGluIGEgbm9uLWJyb3dzZXIgY29udGV4dCcpO1xuICB9XG5cbiAgaWYgKGlzRG9jdW1lbnQobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZSBhcyBEb2N1bWVudDtcbiAgfVxuXG4gIGlmIChub2RlLm93bmVyRG9jdW1lbnQgIT09IGRvY3VtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0F0dGVtcHRlZCB0byBjYXN0IHRvIGEgYnJvd3NlciBub2RlIHdpdGggYSBub2RlIHRoYXQgd2FzIG5vdCBjcmVhdGVkIGZyb20gdGhpcyBkb2N1bWVudCdcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGNoZWNrTm9kZTxTPihub2RlLCBzdWdhcnlDaGVjayEpO1xufVxuXG5mdW5jdGlvbiBjaGVja0Vycm9yKGZyb206IHN0cmluZywgY2hlY2s6IFN1Z2FyeU5vZGVDaGVjayk6IEVycm9yIHtcbiAgcmV0dXJuIG5ldyBFcnJvcihgY2Fubm90IGNhc3QgYSAke2Zyb219IGludG8gJHtjaGVja31gKTtcbn1cblxuZnVuY3Rpb24gaXNEb2N1bWVudChub2RlOiBOb2RlIHwgU2ltcGxlTm9kZSB8IFNpbXBsZURvY3VtZW50KTogbm9kZSBpcyBEb2N1bWVudCB8IFNpbXBsZURvY3VtZW50IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGVUeXBlLkRPQ1VNRU5UX05PREU7XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudChub2RlOiBOb2RlIHwgU2ltcGxlTm9kZSB8IFNpbXBsZUVsZW1lbnQpOiBub2RlIGlzIEVsZW1lbnQgfCBTaW1wbGVFbGVtZW50IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGVUeXBlLkVMRU1FTlRfTk9ERTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrTm9kZTxTIGV4dGVuZHMgU3VnYXJ5Tm9kZUNoZWNrPihcbiAgbm9kZTogTm9kZSB8IG51bGwsXG4gIGNoZWNrOiBTXG4pOiBOb2RlRm9yU3VnYXJ5Q2hlY2s8Uz4ge1xuICBsZXQgaXNNYXRjaCA9IGZhbHNlO1xuXG4gIGlmIChub2RlICE9PSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBjaGVjayA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlzTWF0Y2ggPSBzdHJpbmdDaGVja05vZGUobm9kZSwgY2hlY2sgYXMgQnJvd3NlclRhZyk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNoZWNrKSkge1xuICAgICAgaXNNYXRjaCA9IGNoZWNrLnNvbWUoKGMpID0+IHN0cmluZ0NoZWNrTm9kZShub2RlLCBjIGFzIEJyb3dzZXJUYWcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdW5yZWFjaGFibGUoKTtcbiAgICB9XG4gIH1cblxuICBpZiAoaXNNYXRjaCkge1xuICAgIHJldHVybiBub2RlIGFzIE5vZGVGb3JTdWdhcnlDaGVjazxTPjtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBjaGVja0Vycm9yKGBTaW1wbGVFbGVtZW50KCR7bm9kZX0pYCwgY2hlY2spO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0cmluZ0NoZWNrTm9kZTxTIGV4dGVuZHMgQnJvd3NlclRhZz4obm9kZTogTm9kZSwgY2hlY2s6IFMpOiBub2RlIGlzIEJyb3dzZXJUYWdzW1NdIHtcbiAgc3dpdGNoIChjaGVjaykge1xuICAgIGNhc2UgJ05PREUnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY2FzZSAnSFRNTCc6XG4gICAgICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50O1xuICAgIGNhc2UgJ1NWRyc6XG4gICAgICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIFNWR0VsZW1lbnQ7XG4gICAgY2FzZSAnRUxFTUVOVCc6XG4gICAgICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChjaGVjay50b1VwcGVyQ2FzZSgpID09PSBjaGVjaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJVRzogdGhpcyBjb2RlIGlzIG1pc3NpbmcgaGFuZGxpbmcgZm9yIGEgZ2VuZXJpYyBub2RlIHR5cGVgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlIGluc3RhbmNlb2YgRWxlbWVudCAmJiBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gY2hlY2s7XG4gIH1cbn1cbiIsImltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcblxubGV0IGRlYnVnVG9TdHJpbmc6IHVuZGVmaW5lZCB8ICgodmFsdWU6IHVua25vd24pID0+IHN0cmluZyk7XG5cbmlmIChERUJVRykge1xuICBsZXQgZ2V0RnVuY3Rpb25OYW1lID0gKGZuOiBGdW5jdGlvbikgPT4ge1xuICAgIGxldCBmdW5jdGlvbk5hbWUgPSBmbi5uYW1lO1xuXG4gICAgaWYgKGZ1bmN0aW9uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZXQgbWF0Y2ggPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmbikubWF0Y2goL2Z1bmN0aW9uIChcXHcrKVxccypcXCgvKTtcblxuICAgICAgZnVuY3Rpb25OYW1lID0gKG1hdGNoICYmIG1hdGNoWzFdKSB8fCAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb25OYW1lLnJlcGxhY2UoL15ib3VuZCAvLCAnJyk7XG4gIH07XG5cbiAgbGV0IGdldE9iamVjdE5hbWUgPSAob2JqOiBvYmplY3QpID0+IHtcbiAgICBsZXQgbmFtZTtcbiAgICBsZXQgY2xhc3NOYW1lO1xuXG4gICAgaWYgKG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgY2xhc3NOYW1lID0gZ2V0RnVuY3Rpb25OYW1lKG9iai5jb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgJ3RvU3RyaW5nJyBpbiBvYmogJiZcbiAgICAgIG9iai50b1N0cmluZyAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyAmJlxuICAgICAgb2JqLnRvU3RyaW5nICE9PSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmdcbiAgICApIHtcbiAgICAgIG5hbWUgPSBvYmoudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgY2xhc3MgaGFzIGEgZGVjZW50IGxvb2tpbmcgbmFtZSwgYW5kIHRoZSBgdG9TdHJpbmdgIGlzIG9uZSBvZiB0aGVcbiAgICAvLyBkZWZhdWx0IEVtYmVyIHRvU3RyaW5ncywgcmVwbGFjZSB0aGUgY29uc3RydWN0b3IgcG9ydGlvbiBvZiB0aGUgdG9TdHJpbmdcbiAgICAvLyB3aXRoIHRoZSBjbGFzcyBuYW1lLiBXZSBjaGVjayB0aGUgbGVuZ3RoIG9mIHRoZSBjbGFzcyBuYW1lIHRvIHByZXZlbnQgZG9pbmdcbiAgICAvLyB0aGlzIHdoZW4gdGhlIHZhbHVlIGlzIG1pbmlmaWVkLlxuICAgIGlmIChcbiAgICAgIG5hbWUgJiZcbiAgICAgIG5hbWUubWF0Y2goLzwuKjplbWJlclxcZCs+LykgJiZcbiAgICAgIGNsYXNzTmFtZSAmJlxuICAgICAgY2xhc3NOYW1lWzBdICE9PSAnXycgJiZcbiAgICAgIGNsYXNzTmFtZS5sZW5ndGggPiAyICYmXG4gICAgICBjbGFzc05hbWUgIT09ICdDbGFzcydcbiAgICApIHtcbiAgICAgIHJldHVybiBuYW1lLnJlcGxhY2UoLzwuKjovLCBgPCR7Y2xhc3NOYW1lfTpgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZSB8fCBjbGFzc05hbWU7XG4gIH07XG5cbiAgbGV0IGdldFByaW1pdGl2ZU5hbWUgPSAodmFsdWU6IGFueSkgPT4ge1xuICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICB9O1xuXG4gIGRlYnVnVG9TdHJpbmcgPSAodmFsdWU6IHVua25vd24pID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZ2V0RnVuY3Rpb25OYW1lKHZhbHVlKSB8fCBgKHVua25vd24gZnVuY3Rpb24pYDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBnZXRPYmplY3ROYW1lKHZhbHVlKSB8fCBgKHVua25vd24gb2JqZWN0KWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXRQcmltaXRpdmVOYW1lKHZhbHVlKTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlYnVnVG9TdHJpbmc7XG4iLCJpbXBvcnQgeyBMT0NBTF9ERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnLi9wbGF0Zm9ybS11dGlscyc7XG5cbmV4cG9ydCBsZXQgYmVnaW5UZXN0U3RlcHM6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbmV4cG9ydCBsZXQgZW5kVGVzdFN0ZXBzOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBsZXQgdmVyaWZ5U3RlcHM6XG4gIHwgKCh0eXBlOiBzdHJpbmcsIHN0ZXBzOiB1bmtub3duW10gfCAoKHN0ZXBzOiB1bmtub3duW10pID0+IHZvaWQpLCBtZXNzYWdlPzogc3RyaW5nKSA9PiB2b2lkKVxuICB8IHVuZGVmaW5lZDtcbmV4cG9ydCBsZXQgbG9nU3RlcDogKCh0eXBlOiBzdHJpbmcsIHN0ZXBzOiB1bmtub3duKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuaWYgKExPQ0FMX0RFQlVHKSB7XG4gIGxldCBMT0dHRURfU1RFUFM6IFJlY29yZDxzdHJpbmcsIHVua25vd25bXT4gfCBudWxsID0gbnVsbDtcblxuICBiZWdpblRlc3RTdGVwcyA9ICgpID0+IHtcbiAgICBhc3NlcnQoTE9HR0VEX1NURVBTID09PSBudWxsLCAnYXR0ZW1wdGVkIHRvIHN0YXJ0IHN0ZXBzLCBidXQgaXQgYWxyZWFkeSBiZWdhbicpO1xuXG4gICAgTE9HR0VEX1NURVBTID0ge307XG4gIH07XG5cbiAgZW5kVGVzdFN0ZXBzID0gKCkgPT4ge1xuICAgIGFzc2VydChMT0dHRURfU1RFUFMsICdhdHRlbXB0ZWQgdG8gZW5kIHN0ZXBzLCBidXQgdGhleSB3ZXJlIG5vdCBzdGFydGVkJyk7XG5cbiAgICBMT0dHRURfU1RFUFMgPSBudWxsO1xuICB9O1xuXG4gIGxvZ1N0ZXAgPSAodHlwZTogc3RyaW5nLCBzdGVwOiB1bmtub3duKSA9PiB7XG4gICAgaWYgKExPR0dFRF9TVEVQUyA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgTE9HR0VEX1NURVBTW3R5cGVdID0gTE9HR0VEX1NURVBTW3R5cGVdIHx8IFtdO1xuICAgIExPR0dFRF9TVEVQU1t0eXBlXS5wdXNoKHN0ZXApO1xuICB9O1xuXG4gIHZlcmlmeVN0ZXBzID0gKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBleHBlY3RlZFN0ZXBzOiB1bmtub3duW10gfCAoKHN0ZXBzOiB1bmtub3duW10pID0+IHZvaWQpLFxuICAgIG1lc3NhZ2U/OiBzdHJpbmdcbiAgKSA9PiB7XG4gICAgbGV0IGxvZ2dlZFN0ZXBzID0gZXhwZWN0KExPR0dFRF9TVEVQUywgJ2F0dGVtcGV0ZCB0byB2ZXJpZnkgc3RlcHMsIGJ1dCBzdGVwcyB3ZXJlIG5vdCBzdGFydGVkJyk7XG5cbiAgICBsZXQgc3RlcHMgPSBsb2dnZWRTdGVwc1t0eXBlXSB8fCBbXTtcblxuICAgIGxvZ2dlZFN0ZXBzW3R5cGVdID0gW107XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShleHBlY3RlZFN0ZXBzKSkge1xuICAgICAgUVVuaXQuY29uZmlnLmN1cnJlbnQuYXNzZXJ0LmRlZXBFcXVhbChzdGVwcywgZXhwZWN0ZWRTdGVwcywgbWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cGVjdGVkU3RlcHMoc3RlcHMpO1xuICAgIH1cbiAgfTtcbn1cbiIsImV4cG9ydCB7IEVNUFRZX0FSUkFZIH0gZnJvbSAnLi9saWIvYXJyYXktdXRpbHMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhc3NlcnQsIGRlcHJlY2F0ZSB9IGZyb20gJy4vbGliL2Fzc2VydCc7XG5leHBvcnQgeyBkaWN0LCBEaWN0U2V0LCBpc0RpY3QsIGlzT2JqZWN0LCBTZXQsIFN0YWNrSW1wbCBhcyBTdGFjayB9IGZyb20gJy4vbGliL2NvbGxlY3Rpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL2RvbSc7XG5leHBvcnQgeyBlbnN1cmVHdWlkLCBIYXNHdWlkLCBpbml0aWFsaXplR3VpZCB9IGZyb20gJy4vbGliL2d1aWQnO1xuZXhwb3J0IHtcbiAgaXNTZXJpYWxpemF0aW9uRmlyc3ROb2RlLFxuICBTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HLFxufSBmcm9tICcuL2xpYi9pcy1zZXJpYWxpemF0aW9uLWZpcnN0LW5vZGUnO1xuZXhwb3J0IHsgYXNzaWduLCBmaWxsTnVsbHMsIHZhbHVlcyB9IGZyb20gJy4vbGliL29iamVjdC11dGlscyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9wbGF0Zm9ybS11dGlscyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9zdHJpbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvaW1tZWRpYXRlJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL3RlbXBsYXRlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgX1dlYWtTZXQgfSBmcm9tICcuL2xpYi93ZWFrLXNldCc7XG5leHBvcnQgeyBjYXN0VG9TaW1wbGUsIGNhc3RUb0Jyb3dzZXIsIGNoZWNrTm9kZSB9IGZyb20gJy4vbGliL3NpbXBsZS1jYXN0JztcblxuZXhwb3J0IHsgZGVmYXVsdCBhcyBkZWJ1Z1RvU3RyaW5nIH0gZnJvbSAnLi9saWIvZGVidWctdG8tc3RyaW5nJztcbmV4cG9ydCB7IGJlZ2luVGVzdFN0ZXBzLCBlbmRUZXN0U3RlcHMsIGxvZ1N0ZXAsIHZlcmlmeVN0ZXBzIH0gZnJvbSAnLi9saWIvZGVidWctc3RlcHMnO1xuXG5leHBvcnQgdHlwZSBGSVhNRTxULCBTIGV4dGVuZHMgc3RyaW5nPiA9IChUICYgUykgfCBUO1xuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TmV2ZXIodmFsdWU6IG5ldmVyLCBkZXNjID0gJ3VuZXhwZWN0ZWQgdW5yZWFjaGFibGUgYnJhbmNoJyk6IHZvaWQge1xuICBjb25zb2xlLmxvZygndW5yZWFjaGFibGUnLCB2YWx1ZSk7XG4gIGNvbnNvbGUudHJhY2UoYCR7ZGVzY30gOjogJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9ICgke3ZhbHVlfSlgKTtcbn1cbiJdLCJuYW1lcyI6WyJERUJVRyJdLCJtYXBwaW5ncyI6Ijs7TUFBYSxXQUFXLEdBQVUsTUFBTSxDQUFOLE1BQUEsQ0FBM0IsRUFBMkI7O0VDQWxDO0VBRUE7QUFFQSxFQUFNLFNBQUEsV0FBQSxDQUFBLElBQUEsRUFBQSxHQUFBLEVBQTRDO0VBQ2hEO0VBQ0E7RUFDQTtFQUNBO0VBRUEsTUFBSSxDQUFKLElBQUEsRUFBVztFQUNULFVBQU0sSUFBQSxLQUFBLENBQVUsR0FBRyxJQUFuQixtQkFBTSxDQUFOO0VBQ0Q7RUFDRjtBQUVELEVBRU0sU0FBQSxTQUFBLENBQUEsSUFBQSxFQUFnQztFQUNwQyxFQUFBLE9BQU8sQ0FBUCxJQUFBLG1CQUFBLElBQUE7RUFDRDs7RUNuQkQsSUFBSSxJQUFJLEdBQVIsQ0FBQTtBQU1BLEVBQU0sU0FBQSxjQUFBLENBQUEsTUFBQSxFQUF3QztFQUM1QyxTQUFRLE1BQU0sQ0FBTixLQUFBLEdBQWUsRUFBdkIsSUFBQTtFQUNEO0FBRUQsRUFBTSxTQUFBLFVBQUEsQ0FBQSxNQUFBLEVBQW9DO0VBQ3hDLFNBQU8sTUFBTSxDQUFOLEtBQUEsSUFBZ0IsY0FBYyxDQUFyQyxNQUFxQyxDQUFyQztFQUNEOzs7OztFQ0hLLFNBQUEsSUFBQSxHQUFjO0VBQ2xCLFNBQU8sTUFBTSxDQUFOLE1BQUEsQ0FBUCxJQUFPLENBQVA7RUFDRDtBQUVELEVBQU0sU0FBQSxNQUFBLENBQUEsQ0FBQSxFQUF3QjtFQUM1QixTQUFPLENBQUMsS0FBRCxJQUFBLElBQWMsQ0FBQyxLQUF0QixTQUFBO0VBQ0Q7QUFFRCxFQUFNLFNBQUEsUUFBQSxDQUFBLENBQUEsRUFBMEI7RUFDOUIs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
