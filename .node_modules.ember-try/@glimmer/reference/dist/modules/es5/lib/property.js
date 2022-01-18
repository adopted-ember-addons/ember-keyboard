function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { dict, isDict } from '@glimmer/util';
import { CONSTANT_TAG, isConst, combine, createUpdatableTag, validate, value as _value2, dirty as _dirty, update } from './validators';
import { pushTrackFrame, popTrackFrame } from './autotrack';
import { tagFor } from './tags';
export var RootReference = function () {
    function RootReference(inner) {
        _classCallCheck(this, RootReference);

        this.inner = inner;
        this.children = dict();
        this.tag = CONSTANT_TAG;
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
export var ImmutableRootReference = function () {
    function ImmutableRootReference(inner) {
        _classCallCheck(this, ImmutableRootReference);

        this.inner = inner;
        this.children = dict();
        this.tag = CONSTANT_TAG;
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
export var PrimitiveReference = function () {
    function PrimitiveReference(inner) {
        _classCallCheck(this, PrimitiveReference);

        this.inner = inner;
        this.tag = CONSTANT_TAG;
    }

    PrimitiveReference.prototype.value = function value() {
        return this.inner;
    };

    PrimitiveReference.prototype.get = function get(_key) {
        return UNDEFINED_REFERENCE;
    };

    return PrimitiveReference;
}();
export var UNDEFINED_REFERENCE = new PrimitiveReference(undefined);
export function cached(inner) {
    return new Cached(inner);
}
export var Cached = function () {
    function Cached(inner) {
        _classCallCheck(this, Cached);

        this.inner = inner;
        this._lastRevision = null;
        this._lastValue = null;
        this.tag = CONSTANT_TAG;
    }

    Cached.prototype.value = function value() {
        var tag = this.tag,
            _lastRevision = this._lastRevision,
            _lastValue = this._lastValue;

        if (!_lastRevision || !validate(tag, _lastRevision)) {
            _lastValue = this._lastValue = this.inner.value();
            this._lastRevision = _value2(tag);
        }
        return _lastValue;
    };

    Cached.prototype.get = function get(key) {
        return property(this, key);
    };

    return Cached;
}();
export function data(value) {
    if (isDict(value)) {
        return new RootReference(value);
    } else {
        return new PrimitiveReference(value);
    }
}
export function property(parentReference, propertyKey) {
    if (isConst(parentReference)) {
        return new RootPropertyReference(parentReference.value(), propertyKey);
    } else {
        return new NestedPropertyReference(parentReference, propertyKey);
    }
}
// function isMutable(value: unknown): boolean {
//   return value !== null && typeof value === 'object' && !Object.isFrozen(value);
// }
// function child(value: unknown, key: string): VersionedPathReference {}
export var RootPropertyReference = function () {
    function RootPropertyReference(_parentValue, _propertyKey) {
        _classCallCheck(this, RootPropertyReference);

        this._parentValue = _parentValue;
        this._propertyKey = _propertyKey;
        this.tag = createUpdatableTag();
    }

    RootPropertyReference.prototype.value = function value() {
        var _parentValue = this._parentValue;

        if (isDict(_parentValue)) {
            var old = pushTrackFrame();
            var ret = _parentValue[this._propertyKey];
            var tag = popTrackFrame(old);
            update(this.tag, tag);
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
export var NestedPropertyReference = function () {
    function NestedPropertyReference(_parentReference, _propertyKey) {
        _classCallCheck(this, NestedPropertyReference);

        this._parentReference = _parentReference;
        this._propertyKey = _propertyKey;
        var parentObjectTag = this._parentObjectTag = createUpdatableTag();
        var parentReferenceTag = _parentReference.tag;
        this.tag = combine([parentReferenceTag, parentObjectTag]);
    }

    NestedPropertyReference.prototype.value = function value() {
        var _parentReference = this._parentReference,
            _parentObjectTag = this._parentObjectTag,
            _propertyKey = this._propertyKey;

        var parentValue = _parentReference.value();
        update(_parentObjectTag, tagFor(parentValue, _propertyKey));
        if (isDict(parentValue)) {
            var old = pushTrackFrame();
            var ret = parentValue[_propertyKey];
            var tag = popTrackFrame(old);
            update(_parentObjectTag, tag);
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
export var UpdatableReference = function () {
    function UpdatableReference(_value) {
        _classCallCheck(this, UpdatableReference);

        this._value = _value;
        this.tag = createUpdatableTag();
    }

    UpdatableReference.prototype.value = function value() {
        return this._value;
    };

    UpdatableReference.prototype.update = function update(value) {
        var _value = this._value;

        if (value !== _value) {
            _dirty(this.tag);
            this._value = value;
        }
    };

    UpdatableReference.prototype.forceUpdate = function forceUpdate(value) {
        _dirty(this.tag);
        this._value = value;
    };

    UpdatableReference.prototype.dirty = function dirty() {
        _dirty(this.tag);
    };

    UpdatableReference.prototype.get = function get(key) {
        return new NestedPropertyReference(this, key);
    };

    return UpdatableReference;
}();
export function State(data) {
    return new UpdatableReference(data);
}
var STABLE_STATE = new WeakMap();
export function StableState(data) {
    if (STABLE_STATE.has(data)) {
        return STABLE_STATE.get(data);
    } else {
        var ref = new UpdatableReference(data);
        STABLE_STATE.set(data, ref);
        return ref;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcHJvcGVydHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFBLElBQUEsRUFBQSxNQUFBLFFBQUEsZUFBQTtBQUNBLFNBQUEsWUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsa0JBQUEsRUFBQSxRQUFBLEVBQUEsZ0JBQUEsRUFBQSxlQUFBLEVBQUEsTUFBQSxRQUFBLGNBQUE7QUFhQSxTQUFBLGNBQUEsRUFBQSxhQUFBLFFBQUEsYUFBQTtBQUNBLFNBQUEsTUFBQSxRQUFBLFFBQUE7QUFFQSxXQUFNLGFBQU47QUFLRSwyQkFBQSxLQUFBLEVBQTRCO0FBQUE7O0FBQVIsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUpaLGFBQUEsUUFBQSxHQUFBLE1BQUE7QUFFUixhQUFBLEdBQUEsR0FBQSxZQUFBO0FBRWdDOztBQUxsQyw0QkFPRSxLQVBGLG9CQU9PO0FBQ0gsZUFBTyxLQUFQLEtBQUE7QUFDRCxLQVRIOztBQUFBLDRCQVdFLEdBWEYsZ0JBV0UsV0FYRixFQVd5QjtBQUNyQixZQUFJLE1BQU0sS0FBQSxRQUFBLENBQVYsV0FBVSxDQUFWO0FBRUEsWUFBSSxDQUFKLEdBQUEsRUFBVTtBQUNSLGtCQUFNLEtBQUEsUUFBQSxDQUFBLFdBQUEsSUFBNkIsSUFBQSxxQkFBQSxDQUEwQixLQUExQixLQUFBLEVBQW5DLFdBQW1DLENBQW5DO0FBQ0Q7QUFFRCxlQUFBLEdBQUE7QUFDRCxLQW5CSDs7QUFBQTtBQUFBO0FBc0JBLFdBQU0sc0JBQU47QUFLRSxvQ0FBQSxLQUFBLEVBQTRCO0FBQUE7O0FBQVIsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUpaLGFBQUEsUUFBQSxHQUFBLE1BQUE7QUFFUixhQUFBLEdBQUEsR0FBQSxZQUFBO0FBRWdDOztBQUxsQyxxQ0FPRSxLQVBGLG9CQU9PO0FBQ0gsZUFBTyxLQUFQLEtBQUE7QUFDRCxLQVRIOztBQUFBLHFDQVdFLEdBWEYs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QUFBLEdBQUEsQ0FBUCxJQUFPLENBQVA7QUFERixLQUFBLE1BRU87QUFDTCxZQUFJLE1BQU0sSUFBQSxrQkFBQSxDQUFWLElBQVUsQ0FBVjtBQUNBLHFCQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQTtBQUNBLGVBQUEsR0FBQTtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkaWN0LCBpc0RpY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIENPTlNUQU5UX1RBRyxcbiAgaXNDb25zdCxcbiAgVGFnLFxuICBjb21iaW5lLFxuICBjcmVhdGVVcGRhdGFibGVUYWcsXG4gIFVwZGF0YWJsZVRhZyxcbiAgdmFsaWRhdGUsXG4gIHZhbHVlLFxuICBkaXJ0eSxcbiAgdXBkYXRlLFxufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB9IGZyb20gJy4vcmVmZXJlbmNlJztcbmltcG9ydCB7IHB1c2hUcmFja0ZyYW1lLCBwb3BUcmFja0ZyYW1lIH0gZnJvbSAnLi9hdXRvdHJhY2snO1xuaW1wb3J0IHsgdGFnRm9yIH0gZnJvbSAnLi90YWdzJztcblxuZXhwb3J0IGNsYXNzIFJvb3RSZWZlcmVuY2U8VD4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHJpdmF0ZSBjaGlsZHJlbiA9IGRpY3Q8Um9vdFByb3BlcnR5UmVmZXJlbmNlPigpO1xuXG4gIHRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBUKSB7fVxuXG4gIHZhbHVlKCk6IFQge1xuICAgIHJldHVybiB0aGlzLmlubmVyO1xuICB9XG5cbiAgZ2V0KHByb3BlcnR5S2V5OiBzdHJpbmcpOiBSb290UHJvcGVydHlSZWZlcmVuY2Uge1xuICAgIGxldCByZWYgPSB0aGlzLmNoaWxkcmVuW3Byb3BlcnR5S2V5XTtcblxuICAgIGlmICghcmVmKSB7XG4gICAgICByZWYgPSB0aGlzLmNoaWxkcmVuW3Byb3BlcnR5S2V5XSA9IG5ldyBSb290UHJvcGVydHlSZWZlcmVuY2UodGhpcy5pbm5lciwgcHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIHJldHVybiByZWY7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltbXV0YWJsZVJvb3RSZWZlcmVuY2U8VD4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHJpdmF0ZSBjaGlsZHJlbiA9IGRpY3Q8Um9vdFByb3BlcnR5UmVmZXJlbmNlPigpO1xuXG4gIHRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBUKSB7fVxuXG4gIHZhbHVlKCk6IFQge1xuICAgIHJldHVybiB0aGlzLmlubmVyO1xuICB9XG5cbiAgZ2V0KHByb3BlcnR5S2V5OiBzdHJpbmcpOiBSb290UHJvcGVydHlSZWZlcmVuY2Uge1xuICAgIGxldCByZWYgPSB0aGlzLmNoaWxkcmVuW3Byb3BlcnR5S2V5XTtcblxuICAgIGlmICghcmVmKSB7XG4gICAgICByZWYgPSB0aGlzLmNoaWxkcmVuW3Byb3BlcnR5S2V5XSA9IG5ldyBSb290UHJvcGVydHlSZWZlcmVuY2UodGhpcy5pbm5lciwgcHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIHJldHVybiByZWY7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUHJpbWl0aXZlID0gdW5kZWZpbmVkIHwgbnVsbCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmc7XG5cbmV4cG9ydCBjbGFzcyBQcmltaXRpdmVSZWZlcmVuY2U8VCBleHRlbmRzIFByaW1pdGl2ZT4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcmVhZG9ubHkgdGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFQpIHt9XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBnZXQoX2tleTogc3RyaW5nKTogUHJpbWl0aXZlUmVmZXJlbmNlPFByaW1pdGl2ZT4ge1xuICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBVTkRFRklORURfUkVGRVJFTkNFOiBQcmltaXRpdmVSZWZlcmVuY2U8dW5kZWZpbmVkPiA9IG5ldyBQcmltaXRpdmVSZWZlcmVuY2UodW5kZWZpbmVkKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlZDxUPihpbm5lcjogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPik6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICByZXR1cm4gbmV3IENhY2hlZChpbm5lcik7XG59XG5cbmV4cG9ydCBjbGFzcyBDYWNoZWQ8VCA9IHVua25vd24+IGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHByaXZhdGUgX2xhc3RSZXZpc2lvbjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RWYWx1ZTogYW55ID0gbnVsbDtcblxuICB0YWc6IFRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+KSB7fVxuXG4gIHZhbHVlKCkge1xuICAgIGxldCB7IHRhZywgX2xhc3RSZXZpc2lvbiwgX2xhc3RWYWx1ZSB9ID0gdGhpcztcblxuICAgIGlmICghX2xhc3RSZXZpc2lvbiB8fCAhdmFsaWRhdGUodGFnLCBfbGFzdFJldmlzaW9uKSkge1xuICAgICAgX2xhc3RWYWx1ZSA9IHRoaXMuX2xhc3RWYWx1ZSA9IHRoaXMuaW5uZXIudmFsdWUoKTtcbiAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9sYXN0VmFsdWU7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gcHJvcGVydHkodGhpcywga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0YSh2YWx1ZTogdW5rbm93bik6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICBpZiAoaXNEaWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBuZXcgUm9vdFJlZmVyZW5jZSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBQcmltaXRpdmVSZWZlcmVuY2UodmFsdWUgYXMgbnVsbCB8IHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5KHBhcmVudFJlZmVyZW5jZTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSwgcHJvcGVydHlLZXk6IHN0cmluZykge1xuICBpZiAoaXNDb25zdChwYXJlbnRSZWZlcmVuY2UpKSB7XG4gICAgcmV0dXJuIG5ldyBSb290UHJvcGVydHlSZWZlcmVuY2UocGFyZW50UmVmZXJlbmNlLnZhbHVlKCksIHByb3BlcnR5S2V5KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlKHBhcmVudFJlZmVyZW5jZSwgcHJvcGVydHlLZXkpO1xuICB9XG59XG5cbi8vIGZ1bmN0aW9uIGlzTXV0YWJsZSh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuLy8gICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhT2JqZWN0LmlzRnJvemVuKHZhbHVlKTtcbi8vIH1cblxuLy8gZnVuY3Rpb24gY2hpbGQodmFsdWU6IHVua25vd24sIGtleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7fVxuXG5leHBvcnQgY2xhc3MgUm9vdFByb3BlcnR5UmVmZXJlbmNlIGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gIHRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BhcmVudFZhbHVlOiB1bmtub3duLCBwcml2YXRlIF9wcm9wZXJ0eUtleTogc3RyaW5nKSB7fVxuXG4gIHZhbHVlKCk6IHVua25vd24ge1xuICAgIGxldCB7IF9wYXJlbnRWYWx1ZSB9ID0gdGhpcztcbiAgICBpZiAoaXNEaWN0KF9wYXJlbnRWYWx1ZSkpIHtcbiAgICAgIGxldCBvbGQgPSBwdXNoVHJhY2tGcmFtZSgpO1xuICAgICAgbGV0IHJldCA9IF9wYXJlbnRWYWx1ZVt0aGlzLl9wcm9wZXJ0eUtleV07XG4gICAgICBsZXQgdGFnID0gcG9wVHJhY2tGcmFtZShvbGQpO1xuICAgICAgdXBkYXRlKHRoaXMudGFnLCB0YWcpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gbmV3IE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlKHRoaXMsIGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlIGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHJpdmF0ZSBfcGFyZW50T2JqZWN0VGFnOiBVcGRhdGFibGVUYWc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyZW50UmVmZXJlbmNlOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLCBwcml2YXRlIF9wcm9wZXJ0eUtleTogc3RyaW5nKSB7XG4gICAgbGV0IHBhcmVudE9iamVjdFRhZyA9ICh0aGlzLl9wYXJlbnRPYmplY3RUYWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKSk7XG4gICAgbGV0IHBhcmVudFJlZmVyZW5jZVRhZyA9IF9wYXJlbnRSZWZlcmVuY2UudGFnO1xuXG4gICAgdGhpcy50YWcgPSBjb21iaW5lKFtwYXJlbnRSZWZlcmVuY2VUYWcsIHBhcmVudE9iamVjdFRhZ10pO1xuICB9XG5cbiAgdmFsdWUoKSB7XG4gICAgbGV0IHsgX3BhcmVudFJlZmVyZW5jZSwgX3BhcmVudE9iamVjdFRhZywgX3Byb3BlcnR5S2V5IH0gPSB0aGlzO1xuXG4gICAgbGV0IHBhcmVudFZhbHVlID0gX3BhcmVudFJlZmVyZW5jZS52YWx1ZSgpO1xuXG4gICAgdXBkYXRlKF9wYXJlbnRPYmplY3RUYWcsIHRhZ0ZvcihwYXJlbnRWYWx1ZSwgX3Byb3BlcnR5S2V5KSk7XG5cbiAgICBpZiAoaXNEaWN0KHBhcmVudFZhbHVlKSkge1xuICAgICAgbGV0IG9sZCA9IHB1c2hUcmFja0ZyYW1lKCk7XG4gICAgICBsZXQgcmV0ID0gcGFyZW50VmFsdWVbX3Byb3BlcnR5S2V5XTtcbiAgICAgIGxldCB0YWcgPSBwb3BUcmFja0ZyYW1lKG9sZCk7XG4gICAgICB1cGRhdGUoX3BhcmVudE9iamVjdFRhZywgdGFnKTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIG5ldyBOZXN0ZWRQcm9wZXJ0eVJlZmVyZW5jZSh0aGlzLCBrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGFibGVSZWZlcmVuY2U8VCA9IHVua25vd24+IGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHB1YmxpYyB0YWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92YWx1ZTogVCkge31cblxuICB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICB1cGRhdGUodmFsdWU6IFQpIHtcbiAgICBsZXQgeyBfdmFsdWUgfSA9IHRoaXM7XG5cbiAgICBpZiAodmFsdWUgIT09IF92YWx1ZSkge1xuICAgICAgZGlydHkodGhpcy50YWcpO1xuICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBmb3JjZVVwZGF0ZSh2YWx1ZTogVCkge1xuICAgIGRpcnR5KHRoaXMudGFnKTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgZGlydHkoKSB7XG4gICAgZGlydHkodGhpcy50YWcpO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIG5ldyBOZXN0ZWRQcm9wZXJ0eVJlZmVyZW5jZSh0aGlzLCBrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGF0ZTxUPihkYXRhOiBUKTogVXBkYXRhYmxlUmVmZXJlbmNlPFQ+IHtcbiAgcmV0dXJuIG5ldyBVcGRhdGFibGVSZWZlcmVuY2UoZGF0YSk7XG59XG5cbmNvbnN0IFNUQUJMRV9TVEFURSA9IG5ldyBXZWFrTWFwKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGFibGVTdGF0ZTxUIGV4dGVuZHMgb2JqZWN0PihkYXRhOiBUKTogVXBkYXRhYmxlUmVmZXJlbmNlPFQ+IHtcbiAgaWYgKFNUQUJMRV9TVEFURS5oYXMoZGF0YSkpIHtcbiAgICByZXR1cm4gU1RBQkxFX1NUQVRFLmdldChkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgcmVmID0gbmV3IFVwZGF0YWJsZVJlZmVyZW5jZShkYXRhKTtcbiAgICBTVEFCTEVfU1RBVEUuc2V0KGRhdGEsIHJlZik7XG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==