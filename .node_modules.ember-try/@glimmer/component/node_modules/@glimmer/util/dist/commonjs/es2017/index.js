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

function assertNever(value, desc = 'unexpected unreachable branch') {
    console.log('unreachable', value);
    console.trace(`${desc} :: ${JSON.stringify(value)} (${value})`);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0NBQ0EsTzs7Ozs7O3VCQUFBLFM7Ozs7Ozs7Ozs0QkFDQSxJOzs7Ozs7NEJBQUEsTzs7Ozs7OzRCQUFBLE07Ozs7Ozs0QkFBQSxROzs7Ozs7NEJBQUEsUzs7Ozs7O0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7O0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O3FCQUNBLFU7Ozs7OztxQkFBQSxjOzs7Ozs7Ozs7eUNBQ0Esd0I7Ozs7Ozt5Q0FBQSwrQjs7Ozs7O0FBSUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OzBCQUNBLFc7Ozs7OzswQkFBQSxVOzs7Ozs7MEJBQUEsUTs7Ozs7OzBCQUFBLFM7Ozs7Ozs7Ozs0QkFTQSxNOzs7Ozs7NEJBQUEsUzs7Ozs7OzRCQUFBLE07Ozs7OztBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7OztBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtRQUlNLFcsR0FBQSxXOzs7O0FBQUEsU0FBQSxXQUFBLENBQUEsS0FBQSxFQUFvQyxPQUFwQywrQkFBQSxFQUEwRTtBQUM5RSxZQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsS0FBQTtBQUNBLFlBQUEsS0FBQSxDQUFjLEdBQUcsSUFBSSxPQUFPLEtBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBcUIsS0FBSyxLQUF0RCxHQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgeyBFTVBUWV9BUlJBWSB9IGZyb20gJy4vbGliL2FycmF5LXV0aWxzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYXNzZXJ0LCBkZXByZWNhdGUgfSBmcm9tICcuL2xpYi9hc3NlcnQnO1xuZXhwb3J0IHsgZGljdCwgRGljdFNldCwgaXNEaWN0LCBpc09iamVjdCwgU2V0LCBTdGFja0ltcGwgYXMgU3RhY2sgfSBmcm9tICcuL2xpYi9jb2xsZWN0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9kZXN0cm95JztcbmV4cG9ydCAqIGZyb20gJy4vbGliL2RvbSc7XG5leHBvcnQgeyBlbnN1cmVHdWlkLCBIYXNHdWlkLCBpbml0aWFsaXplR3VpZCB9IGZyb20gJy4vbGliL2d1aWQnO1xuZXhwb3J0IHtcbiAgaXNTZXJpYWxpemF0aW9uRmlyc3ROb2RlLFxuICBTRVJJQUxJWkFUSU9OX0ZJUlNUX05PREVfU1RSSU5HLFxufSBmcm9tICcuL2xpYi9pcy1zZXJpYWxpemF0aW9uLWZpcnN0LW5vZGUnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvbGlmZXRpbWVzJztcbmV4cG9ydCB7XG4gIENsb25lYWJsZUxpc3ROb2RlLFxuICBFTVBUWV9TTElDRSxcbiAgTGlua2VkTGlzdCxcbiAgTGlua2VkTGlzdE5vZGUsXG4gIExpc3ROb2RlLFxuICBMaXN0U2xpY2UsXG4gIFNsaWNlLFxufSBmcm9tICcuL2xpYi9saXN0LXV0aWxzJztcbmV4cG9ydCB7IGFzc2lnbiwgZmlsbE51bGxzLCB2YWx1ZXMgfSBmcm9tICcuL2xpYi9vYmplY3QtdXRpbHMnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvcGxhdGZvcm0tdXRpbHMnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvc3RyaW5nJztcblxuZXhwb3J0IHR5cGUgRklYTUU8VCwgUyBleHRlbmRzIHN0cmluZz4gPSBUICYgUyB8IFQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROZXZlcih2YWx1ZTogbmV2ZXIsIGRlc2MgPSAndW5leHBlY3RlZCB1bnJlYWNoYWJsZSBicmFuY2gnKTogdm9pZCB7XG4gIGNvbnNvbGUubG9nKCd1bnJlYWNoYWJsZScsIHZhbHVlKTtcbiAgY29uc29sZS50cmFjZShgJHtkZXNjfSA6OiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0gKCR7dmFsdWV9KWApO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==