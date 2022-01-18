'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _arrayUtils = require('./lib/array-utils');

Object.defineProperty(exports, 'EMPTY_ARRAY', {
    enumerable: true,
    get: function () {
        return _arrayUtils.EMPTY_ARRAY;
    }
});

var _assert = require('./lib/assert');

Object.defineProperty(exports, 'assert', {
    enumerable: true,
    get: function () {
        return _interopRequireDefault(_assert).default;
    }
});
Object.defineProperty(exports, 'deprecate', {
    enumerable: true,
    get: function () {
        return _assert.deprecate;
    }
});

var _collections = require('./lib/collections');

Object.defineProperty(exports, 'dict', {
    enumerable: true,
    get: function () {
        return _collections.dict;
    }
});
Object.defineProperty(exports, 'DictSet', {
    enumerable: true,
    get: function () {
        return _collections.DictSet;
    }
});
Object.defineProperty(exports, 'isDict', {
    enumerable: true,
    get: function () {
        return _collections.isDict;
    }
});
Object.defineProperty(exports, 'isObject', {
    enumerable: true,
    get: function () {
        return _collections.isObject;
    }
});
Object.defineProperty(exports, 'Stack', {
    enumerable: true,
    get: function () {
        return _collections.StackImpl;
    }
});

var _destroy = require('./lib/destroy');

Object.keys(_destroy).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _destroy[key];
        }
    });
});

var _dom = require('./lib/dom');

Object.keys(_dom).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _dom[key];
        }
    });
});

var _guid = require('./lib/guid');

Object.defineProperty(exports, 'ensureGuid', {
    enumerable: true,
    get: function () {
        return _guid.ensureGuid;
    }
});
Object.defineProperty(exports, 'initializeGuid', {
    enumerable: true,
    get: function () {
        return _guid.initializeGuid;
    }
});

var _isSerializationFirstNode = require('./lib/is-serialization-first-node');

Object.defineProperty(exports, 'isSerializationFirstNode', {
    enumerable: true,
    get: function () {
        return _isSerializationFirstNode.isSerializationFirstNode;
    }
});
Object.defineProperty(exports, 'SERIALIZATION_FIRST_NODE_STRING', {
    enumerable: true,
    get: function () {
        return _isSerializationFirstNode.SERIALIZATION_FIRST_NODE_STRING;
    }
});

var _lifetimes = require('./lib/lifetimes');

Object.keys(_lifetimes).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _lifetimes[key];
        }
    });
});

var _listUtils = require('./lib/list-utils');

Object.defineProperty(exports, 'EMPTY_SLICE', {
    enumerable: true,
    get: function () {
        return _listUtils.EMPTY_SLICE;
    }
});
Object.defineProperty(exports, 'LinkedList', {
    enumerable: true,
    get: function () {
        return _listUtils.LinkedList;
    }
});
Object.defineProperty(exports, 'ListNode', {
    enumerable: true,
    get: function () {
        return _listUtils.ListNode;
    }
});
Object.defineProperty(exports, 'ListSlice', {
    enumerable: true,
    get: function () {
        return _listUtils.ListSlice;
    }
});

var _objectUtils = require('./lib/object-utils');

Object.defineProperty(exports, 'assign', {
    enumerable: true,
    get: function () {
        return _objectUtils.assign;
    }
});
Object.defineProperty(exports, 'fillNulls', {
    enumerable: true,
    get: function () {
        return _objectUtils.fillNulls;
    }
});
Object.defineProperty(exports, 'values', {
    enumerable: true,
    get: function () {
        return _objectUtils.values;
    }
});

var _platformUtils = require('./lib/platform-utils');

Object.keys(_platformUtils).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _platformUtils[key];
        }
    });
});

var _string = require('./lib/string');

Object.keys(_string).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _string[key];
        }
    });
});
exports.assertNever = assertNever;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function assertNever(value) {
    var desc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'unexpected unreachable branch';

    console.log('unreachable', value);
    console.trace(desc + ' :: ' + JSON.stringify(value) + ' (' + value + ')');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0NBQ0EsTzs7Ozs7O3VCQUFBLFM7Ozs7Ozs7Ozs0QkFDQSxJOzs7Ozs7NEJBQUEsTzs7Ozs7OzRCQUFBLE07Ozs7Ozs0QkFBQSxROzs7Ozs7NEJBQUEsUzs7Ozs7O0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7O0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O3FCQUNBLFU7Ozs7OztxQkFBQSxjOzs7Ozs7Ozs7eUNBQ0Esd0I7Ozs7Ozt5Q0FBQSwrQjs7Ozs7O0FBSUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OzBCQUNBLFc7Ozs7OzswQkFBQSxVOzs7Ozs7MEJBQUEsUTs7Ozs7OzBCQUFBLFM7Ozs7Ozs7Ozs0QkFTQSxNOzs7Ozs7NEJBQUEsUzs7Ozs7OzRCQUFBLE07Ozs7OztBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7OztBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtRQUlNLFcsR0FBQSxXOzs7O0FBQUEsU0FBQSxXQUFBLENBQUEsS0FBQSxFQUEwRTtBQUFBLFFBQXRDLE9BQXNDLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FBMUUsK0JBQTBFOztBQUM5RSxZQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsS0FBQTtBQUNBLFlBQUEsS0FBQSxDQUFBLE9BQUEsTUFBQSxHQUE0QixLQUFBLFNBQUEsQ0FBNUIsS0FBNEIsQ0FBNUIsR0FBQSxJQUFBLEdBQUEsS0FBQSxHQUFBLEdBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7IEVNUFRZX0FSUkFZIH0gZnJvbSAnLi9saWIvYXJyYXktdXRpbHMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhc3NlcnQsIGRlcHJlY2F0ZSB9IGZyb20gJy4vbGliL2Fzc2VydCc7XG5leHBvcnQgeyBkaWN0LCBEaWN0U2V0LCBpc0RpY3QsIGlzT2JqZWN0LCBTZXQsIFN0YWNrSW1wbCBhcyBTdGFjayB9IGZyb20gJy4vbGliL2NvbGxlY3Rpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL2Rlc3Ryb3knO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvZG9tJztcbmV4cG9ydCB7IGVuc3VyZUd1aWQsIEhhc0d1aWQsIGluaXRpYWxpemVHdWlkIH0gZnJvbSAnLi9saWIvZ3VpZCc7XG5leHBvcnQge1xuICBpc1NlcmlhbGl6YXRpb25GaXJzdE5vZGUsXG4gIFNFUklBTElaQVRJT05fRklSU1RfTk9ERV9TVFJJTkcsXG59IGZyb20gJy4vbGliL2lzLXNlcmlhbGl6YXRpb24tZmlyc3Qtbm9kZSc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9saWZldGltZXMnO1xuZXhwb3J0IHtcbiAgQ2xvbmVhYmxlTGlzdE5vZGUsXG4gIEVNUFRZX1NMSUNFLFxuICBMaW5rZWRMaXN0LFxuICBMaW5rZWRMaXN0Tm9kZSxcbiAgTGlzdE5vZGUsXG4gIExpc3RTbGljZSxcbiAgU2xpY2UsXG59IGZyb20gJy4vbGliL2xpc3QtdXRpbHMnO1xuZXhwb3J0IHsgYXNzaWduLCBmaWxsTnVsbHMsIHZhbHVlcyB9IGZyb20gJy4vbGliL29iamVjdC11dGlscyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9wbGF0Zm9ybS11dGlscyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9zdHJpbmcnO1xuXG5leHBvcnQgdHlwZSBGSVhNRTxULCBTIGV4dGVuZHMgc3RyaW5nPiA9IFQgJiBTIHwgVDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5ldmVyKHZhbHVlOiBuZXZlciwgZGVzYyA9ICd1bmV4cGVjdGVkIHVucmVhY2hhYmxlIGJyYW5jaCcpOiB2b2lkIHtcbiAgY29uc29sZS5sb2coJ3VucmVhY2hhYmxlJywgdmFsdWUpO1xuICBjb25zb2xlLnRyYWNlKGAke2Rlc2N9IDo6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfSAoJHt2YWx1ZX0pYCk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9