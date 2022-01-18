'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UpdatableReference = exports.NestedPropertyReference = exports.RootPropertyReference = exports.Cached = exports.UNDEFINED_REFERENCE = exports.PrimitiveReference = exports.ImmutableRootReference = exports.RootReference = undefined;
exports.cached = cached;
exports.data = data;
exports.property = property;
exports.State = State;
exports.StableState = StableState;

var _util = require('@glimmer/util');

var _validators = require('./validators');

var _autotrack = require('./autotrack');

var _tags = require('./tags');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var RootReference = exports.RootReference = function () {
    function RootReference(inner) {
        _classCallCheck(this, RootReference);

        this.inner = inner;
        this.children = (0, _util.dict)();
        this.tag = _validators.CONSTANT_TAG;
    }

    RootReference.prototype.value = function value() {
        return this.inner;
    };

    RootReference.prototype.get = function get(propertyKey) {
        var ref = this.children[propertyKey];
        if (!ref) {
            ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
        }
        return ref;
    };

    return RootReference;
}();
var ImmutableRootReference = exports.ImmutableRootReference = function () {
    function ImmutableRootReference(inner) {
        _classCallCheck(this, ImmutableRootReference);

        this.inner = inner;
        this.children = (0, _util.dict)();
        this.tag = _validators.CONSTANT_TAG;
    }

    ImmutableRootReference.prototype.value = function value() {
        return this.inner;
    };

    ImmutableRootReference.prototype.get = function get(propertyKey) {
        var ref = this.children[propertyKey];
        if (!ref) {
            ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
        }
        return ref;
    };

    return ImmutableRootReference;
}();
var PrimitiveReference = exports.PrimitiveReference = function () {
    function PrimitiveReference(inner) {
        _classCallCheck(this, PrimitiveReference);

        this.inner = inner;
        this.tag = _validators.CONSTANT_TAG;
    }

    PrimitiveReference.prototype.value = function value() {
        return this.inner;
    };

    PrimitiveReference.prototype.get = function get(_key) {
        return UNDEFINED_REFERENCE;
    };

    return PrimitiveReference;
}();
var UNDEFINED_REFERENCE = exports.UNDEFINED_REFERENCE = new PrimitiveReference(undefined);
function cached(inner) {
    return new Cached(inner);
}
var Cached = exports.Cached = function () {
    function Cached(inner) {
        _classCallCheck(this, Cached);

        this.inner = inner;
        this._lastRevision = null;
        this._lastValue = null;
        this.tag = _validators.CONSTANT_TAG;
    }

    Cached.prototype.value = function value() {
        var tag = this.tag,
            _lastRevision = this._lastRevision,
            _lastValue = this._lastValue;

        if (!_lastRevision || !(0, _validators.validate)(tag, _lastRevision)) {
            _lastValue = this._lastValue = this.inner.value();
            this._lastRevision = (0, _validators.value)(tag);
        }
        return _lastValue;
    };

    Cached.prototype.get = function get(key) {
        return property(this, key);
    };

    return Cached;
}();
function data(value) {
    if ((0, _util.isDict)(value)) {
        return new RootReference(value);
    } else {
        return new PrimitiveReference(value);
    }
}
function property(parentReference, propertyKey) {
    if ((0, _validators.isConst)(parentReference)) {
        return new RootPropertyReference(parentReference.value(), propertyKey);
    } else {
        return new NestedPropertyReference(parentReference, propertyKey);
    }
}
// function isMutable(value: unknown): boolean {
//   return value !== null && typeof value === 'object' && !Object.isFrozen(value);
// }
// function child(value: unknown, key: string): VersionedPathReference {}
var RootPropertyReference = exports.RootPropertyReference = function () {
    function RootPropertyReference(_parentValue, _propertyKey) {
        _classCallCheck(this, RootPropertyReference);

        this._parentValue = _parentValue;
        this._propertyKey = _propertyKey;
        this.tag = (0, _validators.createUpdatableTag)();
    }

    RootPropertyReference.prototype.value = function value() {
        var _parentValue = this._parentValue;

        if ((0, _util.isDict)(_parentValue)) {
            var old = (0, _autotrack.pushTrackFrame)();
            var ret = _parentValue[this._propertyKey];
            var tag = (0, _autotrack.popTrackFrame)(old);
            (0, _validators.update)(this.tag, tag);
            return ret;
        } else {
            return undefined;
        }
    };

    RootPropertyReference.prototype.get = function get(key) {
        return new NestedPropertyReference(this, key);
    };

    return RootPropertyReference;
}();
var NestedPropertyReference = exports.NestedPropertyReference = function () {
    function NestedPropertyReference(_parentReference, _propertyKey) {
        _classCallCheck(this, NestedPropertyReference);

        this._parentReference = _parentReference;
        this._propertyKey = _propertyKey;
        var parentObjectTag = this._parentObjectTag = (0, _validators.createUpdatableTag)();
        var parentReferenceTag = _parentReference.tag;
        this.tag = (0, _validators.combine)([parentReferenceTag, parentObjectTag]);
    }

    NestedPropertyReference.prototype.value = function value() {
        var _parentReference = this._parentReference,
            _parentObjectTag = this._parentObjectTag,
            _propertyKey = this._propertyKey;

        var parentValue = _parentReference.value();
        (0, _validators.update)(_parentObjectTag, (0, _tags.tagFor)(parentValue, _propertyKey));
        if ((0, _util.isDict)(parentValue)) {
            var old = (0, _autotrack.pushTrackFrame)();
            var ret = parentValue[_propertyKey];
            var tag = (0, _autotrack.popTrackFrame)(old);
            (0, _validators.update)(_parentObjectTag, tag);
            return ret;
        } else {
            return undefined;
        }
    };

    NestedPropertyReference.prototype.get = function get(key) {
        return new NestedPropertyReference(this, key);
    };

    return NestedPropertyReference;
}();
var UpdatableReference = exports.UpdatableReference = function () {
    function UpdatableReference(_value) {
        _classCallCheck(this, UpdatableReference);

        this._value = _value;
        this.tag = (0, _validators.createUpdatableTag)();
    }

    UpdatableReference.prototype.value = function value() {
        return this._value;
    };

    UpdatableReference.prototype.update = function update(value) {
        var _value = this._value;

        if (value !== _value) {
            (0, _validators.dirty)(this.tag);
            this._value = value;
        }
    };

    UpdatableReference.prototype.forceUpdate = function forceUpdate(value) {
        (0, _validators.dirty)(this.tag);
        this._value = value;
    };

    UpdatableReference.prototype.dirty = function dirty() {
        (0, _validators.dirty)(this.tag);
    };

    UpdatableReference.prototype.get = function get(key) {
        return new NestedPropertyReference(this, key);
    };

    return UpdatableReference;
}();
function State(data) {
    return new UpdatableReference(data);
}
var STABLE_STATE = new WeakMap();
function StableState(data) {
    if (STABLE_STATE.has(data)) {
        return STABLE_STATE.get(data);
    } else {
        var ref = new UpdatableReference(data);
        STABLE_STATE.set(data, ref);
        return ref;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcHJvcGVydHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBK0VNLE0sR0FBQSxNO1FBNEJBLEksR0FBQSxJO1FBUUEsUSxHQUFBLFE7UUF1R0EsSyxHQUFBLEs7UUFNQSxXLEdBQUEsVzs7QUFoT047O0FBQ0E7O0FBYUE7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBQSx3Q0FBQSxZQUFBO0FBS0UsYUFBQSxhQUFBLENBQUEsS0FBQSxFQUE0QjtBQUFBLHdCQUFBLElBQUEsRUFBQSxhQUFBOztBQUFSLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFKWixhQUFBLFFBQUEsR0FBQSxpQkFBQTtBQUVSLGFBQUEsR0FBQSxHQUFBLHdCQUFBO0FBRWdDOztBQUxsQyxrQkFBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFNBQUEsS0FBQSxHQU9PO0FBQ0gsZUFBTyxLQUFQLEtBQUE7QUFSSixLQUFBOztBQUFBLGtCQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsV0FBQSxFQVd5QjtBQUNyQixZQUFJLE1BQU0sS0FBQSxRQUFBLENBQVYsV0FBVSxDQUFWO0FBRUEsWUFBSSxDQUFKLEdBQUEsRUFBVTtBQUNSLGtCQUFNLEtBQUEsUUFBQSxDQUFBLFdBQUEsSUFBNkIsSUFBQSxxQkFBQSxDQUEwQixLQUExQixLQUFBLEVBQW5DLFdBQW1DLENBQW5DO0FBQ0Q7QUFFRCxlQUFBLEdBQUE7QUFsQkosS0FBQTs7QUFBQSxXQUFBLGFBQUE7QUFBQSxDQUFBLEVBQUE7QUFzQkEsSUFBQSwwREFBQSxZQUFBO0FBS0UsYUFBQSxzQkFBQSxDQUFBLEtBQUEsRUFBNEI7QUFBQSx3QkFBQSxJQUFBLEVBQUEsc0JBQUE7O0FBQVIsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUpaLGFBQUEsUUFBQSxHQUFBLGlCQUFBO0FBRVIsYUFBQSxHQUFBLEdBQUEsd0JBQUE7QUFFZ0M7O0FBTGxDLDJC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TUFBQSxFQUFzQjtBQUNwQixtQ0FBTSxLQUFOLEdBQUE7QUFDQSxpQkFBQSxNQUFBLEdBQUEsS0FBQTtBQUNEO0FBZkwsS0FBQTs7QUFBQSx1QkFBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsV0FBQSxDQUFBLEtBQUEsRUFrQnNCO0FBQ2xCLCtCQUFNLEtBQU4sR0FBQTtBQUNBLGFBQUEsTUFBQSxHQUFBLEtBQUE7QUFwQkosS0FBQTs7QUFBQSx1QkFBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFNBQUEsS0FBQSxHQXVCTztBQUNILCtCQUFNLEtBQU4sR0FBQTtBQXhCSixLQUFBOztBQUFBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsR0FBQSxFQTJCaUI7QUFDYixlQUFPLElBQUEsdUJBQUEsQ0FBQSxJQUFBLEVBQVAsR0FBTyxDQUFQO0FBNUJKLEtBQUE7O0FBQUEsV0FBQSxrQkFBQTtBQUFBLENBQUEsRUFBQTtBQWdDTSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQTBCO0FBQzlCLFdBQU8sSUFBQSxrQkFBQSxDQUFQLElBQU8sQ0FBUDtBQUNEO0FBRUQsSUFBTSxlQUFlLElBQXJCLE9BQXFCLEVBQXJCO0FBRU0sU0FBQSxXQUFBLENBQUEsSUFBQSxFQUErQztBQUNuRCxRQUFJLGFBQUEsR0FBQSxDQUFKLElBQUksQ0FBSixFQUE0QjtBQUMxQixlQUFPLGFBQUEsR0FBQSxDQUFQLElBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLFlBQUksTUFBTSxJQUFBLGtCQUFBLENBQVYsSUFBVSxDQUFWO0FBQ0EscUJBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxHQUFBO0FBQ0EsZUFBQSxHQUFBO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRpY3QsIGlzRGljdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHtcbiAgQ09OU1RBTlRfVEFHLFxuICBpc0NvbnN0LFxuICBUYWcsXG4gIGNvbWJpbmUsXG4gIGNyZWF0ZVVwZGF0YWJsZVRhZyxcbiAgVXBkYXRhYmxlVGFnLFxuICB2YWxpZGF0ZSxcbiAgdmFsdWUsXG4gIGRpcnR5LFxuICB1cGRhdGUsXG59IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIH0gZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgcHVzaFRyYWNrRnJhbWUsIHBvcFRyYWNrRnJhbWUgfSBmcm9tICcuL2F1dG90cmFjayc7XG5pbXBvcnQgeyB0YWdGb3IgfSBmcm9tICcuL3RhZ3MnO1xuXG5leHBvcnQgY2xhc3MgUm9vdFJlZmVyZW5jZTxUPiBpbXBsZW1lbnRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICBwcml2YXRlIGNoaWxkcmVuID0gZGljdDxSb290UHJvcGVydHlSZWZlcmVuY2U+KCk7XG5cbiAgdGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFQpIHt9XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBnZXQocHJvcGVydHlLZXk6IHN0cmluZyk6IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZSB7XG4gICAgbGV0IHJlZiA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHlLZXldO1xuXG4gICAgaWYgKCFyZWYpIHtcbiAgICAgIHJlZiA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHlLZXldID0gbmV3IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZSh0aGlzLmlubmVyLCBwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1tdXRhYmxlUm9vdFJlZmVyZW5jZTxUPiBpbXBsZW1lbnRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICBwcml2YXRlIGNoaWxkcmVuID0gZGljdDxSb290UHJvcGVydHlSZWZlcmVuY2U+KCk7XG5cbiAgdGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFQpIHt9XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBnZXQocHJvcGVydHlLZXk6IHN0cmluZyk6IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZSB7XG4gICAgbGV0IHJlZiA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHlLZXldO1xuXG4gICAgaWYgKCFyZWYpIHtcbiAgICAgIHJlZiA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHlLZXldID0gbmV3IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZSh0aGlzLmlubmVyLCBwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBQcmltaXRpdmUgPSB1bmRlZmluZWQgfCBudWxsIHwgYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZztcblxuZXhwb3J0IGNsYXNzIFByaW1pdGl2ZVJlZmVyZW5jZTxUIGV4dGVuZHMgUHJpbWl0aXZlPiBpbXBsZW1lbnRzIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICByZWFkb25seSB0YWcgPSBDT05TVEFOVF9UQUc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbm5lcjogVCkge31cblxuICB2YWx1ZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lcjtcbiAgfVxuXG4gIGdldChfa2V5OiBzdHJpbmcpOiBQcmltaXRpdmVSZWZlcmVuY2U8UHJpbWl0aXZlPiB7XG4gICAgcmV0dXJuIFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFVOREVGSU5FRF9SRUZFUkVOQ0U6IFByaW1pdGl2ZVJlZmVyZW5jZTx1bmRlZmluZWQ+ID0gbmV3IFByaW1pdGl2ZVJlZmVyZW5jZSh1bmRlZmluZWQpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVkPFQ+KGlubmVyOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+KTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHJldHVybiBuZXcgQ2FjaGVkKGlubmVyKTtcbn1cblxuZXhwb3J0IGNsYXNzIENhY2hlZDxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHJpdmF0ZSBfbGFzdFJldmlzaW9uOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfbGFzdFZhbHVlOiBhbnkgPSBudWxsO1xuXG4gIHRhZzogVGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4pIHt9XG5cbiAgdmFsdWUoKSB7XG4gICAgbGV0IHsgdGFnLCBfbGFzdFJldmlzaW9uLCBfbGFzdFZhbHVlIH0gPSB0aGlzO1xuXG4gICAgaWYgKCFfbGFzdFJldmlzaW9uIHx8ICF2YWxpZGF0ZSh0YWcsIF9sYXN0UmV2aXNpb24pKSB7XG4gICAgICBfbGFzdFZhbHVlID0gdGhpcy5fbGFzdFZhbHVlID0gdGhpcy5pbm5lci52YWx1ZSgpO1xuICAgICAgdGhpcy5fbGFzdFJldmlzaW9uID0gdmFsdWUodGFnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gX2xhc3RWYWx1ZTtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiBwcm9wZXJ0eSh0aGlzLCBrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRhKHZhbHVlOiB1bmtub3duKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gIGlmIChpc0RpY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIG5ldyBSb290UmVmZXJlbmNlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByaW1pdGl2ZVJlZmVyZW5jZSh2YWx1ZSBhcyBudWxsIHwgdW5kZWZpbmVkKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvcGVydHkocGFyZW50UmVmZXJlbmNlOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLCBwcm9wZXJ0eUtleTogc3RyaW5nKSB7XG4gIGlmIChpc0NvbnN0KHBhcmVudFJlZmVyZW5jZSkpIHtcbiAgICByZXR1cm4gbmV3IFJvb3RQcm9wZXJ0eVJlZmVyZW5jZShwYXJlbnRSZWZlcmVuY2UudmFsdWUoKSwgcHJvcGVydHlLZXkpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgTmVzdGVkUHJvcGVydHlSZWZlcmVuY2UocGFyZW50UmVmZXJlbmNlLCBwcm9wZXJ0eUtleSk7XG4gIH1cbn1cblxuLy8gZnVuY3Rpb24gaXNNdXRhYmxlKHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4vLyAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFPYmplY3QuaXNGcm96ZW4odmFsdWUpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBjaGlsZCh2YWx1ZTogdW5rbm93biwga2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHt9XG5cbmV4cG9ydCBjbGFzcyBSb290UHJvcGVydHlSZWZlcmVuY2UgaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgdGFnID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyZW50VmFsdWU6IHVua25vd24sIHByaXZhdGUgX3Byb3BlcnR5S2V5OiBzdHJpbmcpIHt9XG5cbiAgdmFsdWUoKTogdW5rbm93biB7XG4gICAgbGV0IHsgX3BhcmVudFZhbHVlIH0gPSB0aGlzO1xuICAgIGlmIChpc0RpY3QoX3BhcmVudFZhbHVlKSkge1xuICAgICAgbGV0IG9sZCA9IHB1c2hUcmFja0ZyYW1lKCk7XG4gICAgICBsZXQgcmV0ID0gX3BhcmVudFZhbHVlW3RoaXMuX3Byb3BlcnR5S2V5XTtcbiAgICAgIGxldCB0YWcgPSBwb3BUcmFja0ZyYW1lKG9sZCk7XG4gICAgICB1cGRhdGUodGhpcy50YWcsIHRhZyk7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiBuZXcgTmVzdGVkUHJvcGVydHlSZWZlcmVuY2UodGhpcywga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmVzdGVkUHJvcGVydHlSZWZlcmVuY2UgaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgcHVibGljIHRhZzogVGFnO1xuICBwcml2YXRlIF9wYXJlbnRPYmplY3RUYWc6IFVwZGF0YWJsZVRhZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wYXJlbnRSZWZlcmVuY2U6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UsIHByaXZhdGUgX3Byb3BlcnR5S2V5OiBzdHJpbmcpIHtcbiAgICBsZXQgcGFyZW50T2JqZWN0VGFnID0gKHRoaXMuX3BhcmVudE9iamVjdFRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpKTtcbiAgICBsZXQgcGFyZW50UmVmZXJlbmNlVGFnID0gX3BhcmVudFJlZmVyZW5jZS50YWc7XG5cbiAgICB0aGlzLnRhZyA9IGNvbWJpbmUoW3BhcmVudFJlZmVyZW5jZVRhZywgcGFyZW50T2JqZWN0VGFnXSk7XG4gIH1cblxuICB2YWx1ZSgpIHtcbiAgICBsZXQgeyBfcGFyZW50UmVmZXJlbmNlLCBfcGFyZW50T2JqZWN0VGFnLCBfcHJvcGVydHlLZXkgfSA9IHRoaXM7XG5cbiAgICBsZXQgcGFyZW50VmFsdWUgPSBfcGFyZW50UmVmZXJlbmNlLnZhbHVlKCk7XG5cbiAgICB1cGRhdGUoX3BhcmVudE9iamVjdFRhZywgdGFnRm9yKHBhcmVudFZhbHVlLCBfcHJvcGVydHlLZXkpKTtcblxuICAgIGlmIChpc0RpY3QocGFyZW50VmFsdWUpKSB7XG4gICAgICBsZXQgb2xkID0gcHVzaFRyYWNrRnJhbWUoKTtcbiAgICAgIGxldCByZXQgPSBwYXJlbnRWYWx1ZVtfcHJvcGVydHlLZXldO1xuICAgICAgbGV0IHRhZyA9IHBvcFRyYWNrRnJhbWUob2xkKTtcbiAgICAgIHVwZGF0ZShfcGFyZW50T2JqZWN0VGFnLCB0YWcpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gbmV3IE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlKHRoaXMsIGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVwZGF0YWJsZVJlZmVyZW5jZTxUID0gdW5rbm93bj4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHVibGljIHRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZhbHVlOiBUKSB7fVxuXG4gIHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZTogVCkge1xuICAgIGxldCB7IF92YWx1ZSB9ID0gdGhpcztcblxuICAgIGlmICh2YWx1ZSAhPT0gX3ZhbHVlKSB7XG4gICAgICBkaXJ0eSh0aGlzLnRhZyk7XG4gICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlVXBkYXRlKHZhbHVlOiBUKSB7XG4gICAgZGlydHkodGhpcy50YWcpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBkaXJ0eSgpIHtcbiAgICBkaXJ0eSh0aGlzLnRhZyk7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gbmV3IE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlKHRoaXMsIGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0YXRlPFQ+KGRhdGE6IFQpOiBVcGRhdGFibGVSZWZlcmVuY2U8VD4ge1xuICByZXR1cm4gbmV3IFVwZGF0YWJsZVJlZmVyZW5jZShkYXRhKTtcbn1cblxuY29uc3QgU1RBQkxFX1NUQVRFID0gbmV3IFdlYWtNYXAoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIFN0YWJsZVN0YXRlPFQgZXh0ZW5kcyBvYmplY3Q+KGRhdGE6IFQpOiBVcGRhdGFibGVSZWZlcmVuY2U8VD4ge1xuICBpZiAoU1RBQkxFX1NUQVRFLmhhcyhkYXRhKSkge1xuICAgIHJldHVybiBTVEFCTEVfU1RBVEUuZ2V0KGRhdGEpO1xuICB9IGVsc2Uge1xuICAgIGxldCByZWYgPSBuZXcgVXBkYXRhYmxlUmVmZXJlbmNlKGRhdGEpO1xuICAgIFNUQUJMRV9TVEFURS5zZXQoZGF0YSwgcmVmKTtcbiAgICByZXR1cm4gcmVmO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9