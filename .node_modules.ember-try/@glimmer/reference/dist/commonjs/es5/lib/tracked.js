'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EPOCH = undefined;
exports.setStateFor = setStateFor;
exports.getStateFor = getStateFor;

var _util = require('@glimmer/util');

var _validators = require('./validators');

var _tags = require('./tags');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var PrivateImpl = function () {
    function PrivateImpl() {
        _classCallCheck(this, PrivateImpl);

        this.inner = undefined;
    }

    PrivateImpl.prototype.get = function get() {
        return this.inner;
    };

    PrivateImpl.prototype.set = function set(value) {
        this.inner = value;
    };

    return PrivateImpl;
}();

var PRIVATES = new WeakMap();
function privateFor(object, key) {
    var privates = void 0;
    if (PRIVATES.has(object)) {
        privates = PRIVATES.get(object);
    } else {
        privates = (0, _util.dict)();
        PRIVATES.set(object, privates);
    }
    if (key in privates) {
        return privates[key];
    } else {
        var p = new PrivateImpl();
        privates[key] = p;
        return p;
    }
}
var EPOCH = exports.EPOCH = (0, _validators.createTag)();
function setStateFor(object, key, value) {
    (0, _validators.dirty)(EPOCH);
    (0, _tags.dirtyTag)(object, key);
    privateFor(object, key).set(value);
}
function getStateFor(object, key) {
    return privateFor(object, key).get();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvdHJhY2tlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUE4Q00sVyxHQUFBLFc7UUFVQSxXLEdBQUEsVzs7QUF4RE47O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0lBU0EsYztBQUFBLGFBQUEsV0FBQSxHQUFBO0FBQUEsd0JBQUEsSUFBQSxFQUFBLFdBQUE7O0FBQ1UsYUFBQSxLQUFBLEdBQUEsU0FBQTtBQVNUOzswQkFQQyxHLGtCQUFHO0FBQ0QsZUFBTyxLQUFQLEtBQUE7OzswQkFHRixHLGdCQUFBLEssRUFBWTtBQUNWLGFBQUEsS0FBQSxHQUFBLEtBQUE7Ozs7OztBQUlKLElBQU0sV0FBVyxJQUFqQixPQUFpQixFQUFqQjtBQUVBLFNBQUEsVUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEVBQTBFO0FBQ3hFLFFBQUEsV0FBQSxLQUFBLENBQUE7QUFFQSxRQUFJLFNBQUEsR0FBQSxDQUFKLE1BQUksQ0FBSixFQUEwQjtBQUN4QixtQkFBVyxTQUFBLEdBQUEsQ0FBWCxNQUFXLENBQVg7QUFERixLQUFBLE1BRU87QUFDTCxtQkFBQSxpQkFBQTtBQUNBLGlCQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsUUFBQTtBQUNEO0FBRUQsUUFBSSxPQUFKLFFBQUEsRUFBcUI7QUFDbkIsZUFBTyxTQUFQLEdBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLFlBQUksSUFBSSxJQUFSLFdBQVEsRUFBUjtBQUNBLGlCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBO0FBQ0Q7QUFDRjtBQUVNLElBQU0sd0JBQU4sNEJBQUE7QUFFRCxTQUFBLFdBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFHTztBQUVYLDJCQUFBLEtBQUE7QUFDQSx3QkFBQSxNQUFBLEVBQUEsR0FBQTtBQUNBLGVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsS0FBQTtBQUNEO0FBRUssU0FBQSxXQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFFRTtBQUVOLFdBQU8sV0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFQLEdBQU8sRUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGljdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgY3JlYXRlVGFnLCBkaXJ0eSB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBkaXJ0eVRhZyB9IGZyb20gJy4vdGFncyc7XG5cbnR5cGUgUHJpdmF0ZXM8VD4gPSB7IFtLIGluIGtleW9mIFRdPzogUHJpdmF0ZTxUW0tdPiB9O1xuXG5pbnRlcmZhY2UgUHJpdmF0ZTxUPiB7XG4gIGdldCgpOiBUIHwgdW5kZWZpbmVkO1xuICBzZXQodmFsdWU6IFQpOiB2b2lkO1xufVxuXG5jbGFzcyBQcml2YXRlSW1wbDxUPiBpbXBsZW1lbnRzIFByaXZhdGU8VD4ge1xuICBwcml2YXRlIGlubmVyOiBUIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIGdldCgpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lcjtcbiAgfVxuXG4gIHNldCh2YWx1ZTogVCk6IHZvaWQge1xuICAgIHRoaXMuaW5uZXIgPSB2YWx1ZTtcbiAgfVxufVxuXG5jb25zdCBQUklWQVRFUyA9IG5ldyBXZWFrTWFwPG9iamVjdCwgUHJpdmF0ZXM8b2JqZWN0Pj4oKTtcblxuZnVuY3Rpb24gcHJpdmF0ZUZvcjxPIGV4dGVuZHMgb2JqZWN0LCBLIGV4dGVuZHMga2V5b2YgTz4ob2JqZWN0OiBPLCBrZXk6IEspOiBQcml2YXRlPE9bS10+IHtcbiAgbGV0IHByaXZhdGVzOiBQcml2YXRlczxPPjtcblxuICBpZiAoUFJJVkFURVMuaGFzKG9iamVjdCkpIHtcbiAgICBwcml2YXRlcyA9IFBSSVZBVEVTLmdldChvYmplY3QpISBhcyBQcml2YXRlczxPPjtcbiAgfSBlbHNlIHtcbiAgICBwcml2YXRlcyA9IGRpY3QoKSBhcyBQcml2YXRlczxPPjtcbiAgICBQUklWQVRFUy5zZXQob2JqZWN0LCBwcml2YXRlcyk7XG4gIH1cblxuICBpZiAoa2V5IGluIHByaXZhdGVzKSB7XG4gICAgcmV0dXJuIHByaXZhdGVzW2tleV0hO1xuICB9IGVsc2Uge1xuICAgIGxldCBwID0gbmV3IFByaXZhdGVJbXBsPE9bS10+KCk7XG4gICAgcHJpdmF0ZXNba2V5XSA9IHA7XG4gICAgcmV0dXJuIHA7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEVQT0NIID0gY3JlYXRlVGFnKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTdGF0ZUZvcjxPIGV4dGVuZHMgb2JqZWN0LCBLIGV4dGVuZHMga2V5b2YgTz4oXG4gIG9iamVjdDogTyxcbiAga2V5OiBLLFxuICB2YWx1ZTogT1tLXVxuKTogdm9pZCB7XG4gIGRpcnR5KEVQT0NIKTtcbiAgZGlydHlUYWcob2JqZWN0LCBrZXkpO1xuICBwcml2YXRlRm9yKG9iamVjdCwga2V5KS5zZXQodmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RhdGVGb3I8TyBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIE8+KFxuICBvYmplY3Q6IE8sXG4gIGtleTogS1xuKTogT1tLXSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBwcml2YXRlRm9yKG9iamVjdCwga2V5KS5nZXQoKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=