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

class RootReference {
    constructor(inner) {
        this.inner = inner;
        this.children = (0, _util.dict)();
        this.tag = _validators.CONSTANT_TAG;
    }
    value() {
        return this.inner;
    }
    get(propertyKey) {
        let ref = this.children[propertyKey];
        if (!ref) {
            ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
        }
        return ref;
    }
}
exports.RootReference = RootReference;
class ImmutableRootReference {
    constructor(inner) {
        this.inner = inner;
        this.children = (0, _util.dict)();
        this.tag = _validators.CONSTANT_TAG;
    }
    value() {
        return this.inner;
    }
    get(propertyKey) {
        let ref = this.children[propertyKey];
        if (!ref) {
            ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
        }
        return ref;
    }
}
exports.ImmutableRootReference = ImmutableRootReference;
class PrimitiveReference {
    constructor(inner) {
        this.inner = inner;
        this.tag = _validators.CONSTANT_TAG;
    }
    value() {
        return this.inner;
    }
    get(_key) {
        return UNDEFINED_REFERENCE;
    }
}
exports.PrimitiveReference = PrimitiveReference;
const UNDEFINED_REFERENCE = exports.UNDEFINED_REFERENCE = new PrimitiveReference(undefined);
function cached(inner) {
    return new Cached(inner);
}
class Cached {
    constructor(inner) {
        this.inner = inner;
        this._lastRevision = null;
        this._lastValue = null;
        this.tag = _validators.CONSTANT_TAG;
    }
    value() {
        let { tag, _lastRevision, _lastValue } = this;
        if (!_lastRevision || !(0, _validators.validate)(tag, _lastRevision)) {
            _lastValue = this._lastValue = this.inner.value();
            this._lastRevision = (0, _validators.value)(tag);
        }
        return _lastValue;
    }
    get(key) {
        return property(this, key);
    }
}
exports.Cached = Cached;
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
class RootPropertyReference {
    constructor(_parentValue, _propertyKey) {
        this._parentValue = _parentValue;
        this._propertyKey = _propertyKey;
        this.tag = (0, _validators.createUpdatableTag)();
    }
    value() {
        let { _parentValue } = this;
        if ((0, _util.isDict)(_parentValue)) {
            let old = (0, _autotrack.pushTrackFrame)();
            let ret = _parentValue[this._propertyKey];
            let tag = (0, _autotrack.popTrackFrame)(old);
            (0, _validators.update)(this.tag, tag);
            return ret;
        } else {
            return undefined;
        }
    }
    get(key) {
        return new NestedPropertyReference(this, key);
    }
}
exports.RootPropertyReference = RootPropertyReference;
class NestedPropertyReference {
    constructor(_parentReference, _propertyKey) {
        this._parentReference = _parentReference;
        this._propertyKey = _propertyKey;
        let parentObjectTag = this._parentObjectTag = (0, _validators.createUpdatableTag)();
        let parentReferenceTag = _parentReference.tag;
        this.tag = (0, _validators.combine)([parentReferenceTag, parentObjectTag]);
    }
    value() {
        let { _parentReference, _parentObjectTag, _propertyKey } = this;
        let parentValue = _parentReference.value();
        (0, _validators.update)(_parentObjectTag, (0, _tags.tagFor)(parentValue, _propertyKey));
        if ((0, _util.isDict)(parentValue)) {
            let old = (0, _autotrack.pushTrackFrame)();
            let ret = parentValue[_propertyKey];
            let tag = (0, _autotrack.popTrackFrame)(old);
            (0, _validators.update)(_parentObjectTag, tag);
            return ret;
        } else {
            return undefined;
        }
    }
    get(key) {
        return new NestedPropertyReference(this, key);
    }
}
exports.NestedPropertyReference = NestedPropertyReference;
class UpdatableReference {
    constructor(_value) {
        this._value = _value;
        this.tag = (0, _validators.createUpdatableTag)();
    }
    value() {
        return this._value;
    }
    update(value) {
        let { _value } = this;
        if (value !== _value) {
            (0, _validators.dirty)(this.tag);
            this._value = value;
        }
    }
    forceUpdate(value) {
        (0, _validators.dirty)(this.tag);
        this._value = value;
    }
    dirty() {
        (0, _validators.dirty)(this.tag);
    }
    get(key) {
        return new NestedPropertyReference(this, key);
    }
}
exports.UpdatableReference = UpdatableReference;
function State(data) {
    return new UpdatableReference(data);
}
const STABLE_STATE = new WeakMap();
function StableState(data) {
    if (STABLE_STATE.has(data)) {
        return STABLE_STATE.get(data);
    } else {
        let ref = new UpdatableReference(data);
        STABLE_STATE.set(data, ref);
        return ref;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcHJvcGVydHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBK0VNLE0sR0FBQSxNO1FBNEJBLEksR0FBQSxJO1FBUUEsUSxHQUFBLFE7UUF1R0EsSyxHQUFBLEs7UUFNQSxXLEdBQUEsVzs7OztBQS9OTjs7QUFhQTs7QUFDQTs7QUFFTSxNQUFBLGFBQUEsQ0FBb0I7QUFLeEIsZ0JBQUEsS0FBQSxFQUE0QjtBQUFSLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFKWixhQUFBLFFBQUEsR0FBQSxpQkFBQTtBQUVSLGFBQUEsR0FBQSxHQUFBLHdCQUFBO0FBRWdDO0FBRWhDLFlBQUs7QUFDSCxlQUFPLEtBQVAsS0FBQTtBQUNEO0FBRUQsUUFBQSxXQUFBLEVBQXVCO0FBQ3JCLFlBQUksTUFBTSxLQUFBLFFBQUEsQ0FBVixXQUFVLENBQVY7QUFFQSxZQUFJLENBQUosR0FBQSxFQUFVO0FBQ1Isa0JBQU0sS0FBQSxRQUFBLENBQUEsV0FBQSxJQUE2QixJQUFBLHFCQUFBLENBQTBCLEtBQTFCLEtBQUEsRUFBbkMsV0FBbUMsQ0FBbkM7QUFDRDtBQUVELGVBQUEsR0FBQTtBQUNEO0FBbkJ1QjtRQUFwQixhLEdBQUEsYTtBQXNCQSxNQUFBLHNCQUFBLENBQTZCO0FBS2pDLGdCQUFBLEtBQUEsRUFBNEI7QUFBUixhQUFBLEtBQUEsR0FBQSxLQUFBO0FBSlosYUFBQSxRQUFBLEdBQUEsaUJBQUE7QUFFUixhQUFBLEdBQUEsR0FBQSx3QkFBQTtBQUVnQztBQUVoQyxZQUFLO0FBQ0gsZUFBTyxLQUFQLEtBQUE7QUFDRDtBQUVELFFBQUEsV0FBQSxFQUF1QjtBQUNyQixZQUFJLE1BQU0sS0FBQSxRQUFBLENBQVYsV0FBVSxDQUFWO0FBRUEsWUFBSSxDQUFKLEdBQUEsRUFBVTtBQUNSLGtCQUFNLEtBQUEsUUFBQSxDQUFBLFdBQUEsSUFBNkIsSUFBQSxxQkFBQSxDQUEwQixLQUExQixL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QUFBO0FBQ0Q7QUFDRjtBQUVELGdCQUFBLEtBQUEsRUFBb0I7QUFDbEIsK0JBQU0sS0FBTixHQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQUEsS0FBQTtBQUNEO0FBRUQsWUFBSztBQUNILCtCQUFNLEtBQU4sR0FBQTtBQUNEO0FBRUQsUUFBQSxHQUFBLEVBQWU7QUFDYixlQUFPLElBQUEsdUJBQUEsQ0FBQSxJQUFBLEVBQVAsR0FBTyxDQUFQO0FBQ0Q7QUE3QjRCO1FBQXpCLGtCLEdBQUEsa0I7QUFnQ0EsU0FBQSxLQUFBLENBQUEsSUFBQSxFQUEwQjtBQUM5QixXQUFPLElBQUEsa0JBQUEsQ0FBUCxJQUFPLENBQVA7QUFDRDtBQUVELE1BQU0sZUFBZSxJQUFyQixPQUFxQixFQUFyQjtBQUVNLFNBQUEsV0FBQSxDQUFBLElBQUEsRUFBK0M7QUFDbkQsUUFBSSxhQUFBLEdBQUEsQ0FBSixJQUFJLENBQUosRUFBNEI7QUFDMUIsZUFBTyxhQUFBLEdBQUEsQ0FBUCxJQUFPLENBQVA7QUFERixLQUFBLE1BRU87QUFDTCxZQUFJLE1BQU0sSUFBQSxrQkFBQSxDQUFWLElBQVUsQ0FBVjtBQUNBLHFCQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQTtBQUNBLGVBQUEsR0FBQTtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkaWN0LCBpc0RpY3QgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7XG4gIENPTlNUQU5UX1RBRyxcbiAgaXNDb25zdCxcbiAgVGFnLFxuICBjb21iaW5lLFxuICBjcmVhdGVVcGRhdGFibGVUYWcsXG4gIFVwZGF0YWJsZVRhZyxcbiAgdmFsaWRhdGUsXG4gIHZhbHVlLFxuICBkaXJ0eSxcbiAgdXBkYXRlLFxufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB9IGZyb20gJy4vcmVmZXJlbmNlJztcbmltcG9ydCB7IHB1c2hUcmFja0ZyYW1lLCBwb3BUcmFja0ZyYW1lIH0gZnJvbSAnLi9hdXRvdHJhY2snO1xuaW1wb3J0IHsgdGFnRm9yIH0gZnJvbSAnLi90YWdzJztcblxuZXhwb3J0IGNsYXNzIFJvb3RSZWZlcmVuY2U8VD4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHJpdmF0ZSBjaGlsZHJlbiA9IGRpY3Q8Um9vdFByb3BlcnR5UmVmZXJlbmNlPigpO1xuXG4gIHRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBUKSB7fVxuXG4gIHZhbHVlKCk6IFQge1xuICAgIHJldHVybiB0aGlzLmlubmVyO1xuICB9XG5cbiAgZ2V0KHByb3BlcnR5S2V5OiBzdHJpbmcpOiBSb290UHJvcGVydHlSZWZlcmVuY2Uge1xuICAgIGxldCByZWYgPSB0aGlzLmNoaWxkcmVuW3Byb3BlcnR5S2V5XTtcblxuICAgIGlmICghcmVmKSB7XG4gICAgICByZWYgPSB0aGlzLmNoaWxkcmVuW3Byb3BlcnR5S2V5XSA9IG5ldyBSb290UHJvcGVydHlSZWZlcmVuY2UodGhpcy5pbm5lciwgcHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIHJldHVybiByZWY7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltbXV0YWJsZVJvb3RSZWZlcmVuY2U8VD4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcHJpdmF0ZSBjaGlsZHJlbiA9IGRpY3Q8Um9vdFByb3BlcnR5UmVmZXJlbmNlPigpO1xuXG4gIHRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBUKSB7fVxuXG4gIHZhbHVlKCk6IFQge1xuICAgIHJldHVybiB0aGlzLmlubmVyO1xuICB9XG5cbiAgZ2V0KHByb3BlcnR5S2V5OiBzdHJpbmcpOiBSb290UHJvcGVydHlSZWZlcmVuY2Uge1xuICAgIGxldCByZWYgPSB0aGlzLmNoaWxkcmVuW3Byb3BlcnR5S2V5XTtcblxuICAgIGlmICghcmVmKSB7XG4gICAgICByZWYgPSB0aGlzLmNoaWxkcmVuW3Byb3BlcnR5S2V5XSA9IG5ldyBSb290UHJvcGVydHlSZWZlcmVuY2UodGhpcy5pbm5lciwgcHJvcGVydHlLZXkpO1xuICAgIH1cblxuICAgIHJldHVybiByZWY7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUHJpbWl0aXZlID0gdW5kZWZpbmVkIHwgbnVsbCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmc7XG5cbmV4cG9ydCBjbGFzcyBQcmltaXRpdmVSZWZlcmVuY2U8VCBleHRlbmRzIFByaW1pdGl2ZT4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgcmVhZG9ubHkgdGFnID0gQ09OU1RBTlRfVEFHO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFQpIHt9XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXI7XG4gIH1cblxuICBnZXQoX2tleTogc3RyaW5nKTogUHJpbWl0aXZlUmVmZXJlbmNlPFByaW1pdGl2ZT4ge1xuICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBVTkRFRklORURfUkVGRVJFTkNFOiBQcmltaXRpdmVSZWZlcmVuY2U8dW5kZWZpbmVkPiA9IG5ldyBQcmltaXRpdmVSZWZlcmVuY2UodW5kZWZpbmVkKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlZDxUPihpbm5lcjogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPik6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4ge1xuICByZXR1cm4gbmV3IENhY2hlZChpbm5lcik7XG59XG5cbmV4cG9ydCBjbGFzcyBDYWNoZWQ8VCA9IHVua25vd24+IGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHByaXZhdGUgX2xhc3RSZXZpc2lvbjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RWYWx1ZTogYW55ID0gbnVsbDtcblxuICB0YWc6IFRhZyA9IENPTlNUQU5UX1RBRztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+KSB7fVxuXG4gIHZhbHVlKCkge1xuICAgIGxldCB7IHRhZywgX2xhc3RSZXZpc2lvbiwgX2xhc3RWYWx1ZSB9ID0gdGhpcztcblxuICAgIGlmICghX2xhc3RSZXZpc2lvbiB8fCAhdmFsaWRhdGUodGFnLCBfbGFzdFJldmlzaW9uKSkge1xuICAgICAgX2xhc3RWYWx1ZSA9IHRoaXMuX2xhc3RWYWx1ZSA9IHRoaXMuaW5uZXIudmFsdWUoKTtcbiAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9sYXN0VmFsdWU7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gcHJvcGVydHkodGhpcywga2V5KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0YSh2YWx1ZTogdW5rbm93bik6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICBpZiAoaXNEaWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBuZXcgUm9vdFJlZmVyZW5jZSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBQcmltaXRpdmVSZWZlcmVuY2UodmFsdWUgYXMgbnVsbCB8IHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5KHBhcmVudFJlZmVyZW5jZTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSwgcHJvcGVydHlLZXk6IHN0cmluZykge1xuICBpZiAoaXNDb25zdChwYXJlbnRSZWZlcmVuY2UpKSB7XG4gICAgcmV0dXJuIG5ldyBSb290UHJvcGVydHlSZWZlcmVuY2UocGFyZW50UmVmZXJlbmNlLnZhbHVlKCksIHByb3BlcnR5S2V5KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlKHBhcmVudFJlZmVyZW5jZSwgcHJvcGVydHlLZXkpO1xuICB9XG59XG5cbi8vIGZ1bmN0aW9uIGlzTXV0YWJsZSh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuLy8gICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhT2JqZWN0LmlzRnJvemVuKHZhbHVlKTtcbi8vIH1cblxuLy8gZnVuY3Rpb24gY2hpbGQodmFsdWU6IHVua25vd24sIGtleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7fVxuXG5leHBvcnQgY2xhc3MgUm9vdFByb3BlcnR5UmVmZXJlbmNlIGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gIHRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BhcmVudFZhbHVlOiB1bmtub3duLCBwcml2YXRlIF9wcm9wZXJ0eUtleTogc3RyaW5nKSB7fVxuXG4gIHZhbHVlKCk6IHVua25vd24ge1xuICAgIGxldCB7IF9wYXJlbnRWYWx1ZSB9ID0gdGhpcztcbiAgICBpZiAoaXNEaWN0KF9wYXJlbnRWYWx1ZSkpIHtcbiAgICAgIGxldCBvbGQgPSBwdXNoVHJhY2tGcmFtZSgpO1xuICAgICAgbGV0IHJldCA9IF9wYXJlbnRWYWx1ZVt0aGlzLl9wcm9wZXJ0eUtleV07XG4gICAgICBsZXQgdGFnID0gcG9wVHJhY2tGcmFtZShvbGQpO1xuICAgICAgdXBkYXRlKHRoaXMudGFnLCB0YWcpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gbmV3IE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlKHRoaXMsIGtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5lc3RlZFByb3BlcnR5UmVmZXJlbmNlIGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gIHB1YmxpYyB0YWc6IFRhZztcbiAgcHJpdmF0ZSBfcGFyZW50T2JqZWN0VGFnOiBVcGRhdGFibGVUYWc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyZW50UmVmZXJlbmNlOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlLCBwcml2YXRlIF9wcm9wZXJ0eUtleTogc3RyaW5nKSB7XG4gICAgbGV0IHBhcmVudE9iamVjdFRhZyA9ICh0aGlzLl9wYXJlbnRPYmplY3RUYWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKSk7XG4gICAgbGV0IHBhcmVudFJlZmVyZW5jZVRhZyA9IF9wYXJlbnRSZWZlcmVuY2UudGFnO1xuXG4gICAgdGhpcy50YWcgPSBjb21iaW5lKFtwYXJlbnRSZWZlcmVuY2VUYWcsIHBhcmVudE9iamVjdFRhZ10pO1xuICB9XG5cbiAgdmFsdWUoKSB7XG4gICAgbGV0IHsgX3BhcmVudFJlZmVyZW5jZSwgX3BhcmVudE9iamVjdFRhZywgX3Byb3BlcnR5S2V5IH0gPSB0aGlzO1xuXG4gICAgbGV0IHBhcmVudFZhbHVlID0gX3BhcmVudFJlZmVyZW5jZS52YWx1ZSgpO1xuXG4gICAgdXBkYXRlKF9wYXJlbnRPYmplY3RUYWcsIHRhZ0ZvcihwYXJlbnRWYWx1ZSwgX3Byb3BlcnR5S2V5KSk7XG5cbiAgICBpZiAoaXNEaWN0KHBhcmVudFZhbHVlKSkge1xuICAgICAgbGV0IG9sZCA9IHB1c2hUcmFja0ZyYW1lKCk7XG4gICAgICBsZXQgcmV0ID0gcGFyZW50VmFsdWVbX3Byb3BlcnR5S2V5XTtcbiAgICAgIGxldCB0YWcgPSBwb3BUcmFja0ZyYW1lKG9sZCk7XG4gICAgICB1cGRhdGUoX3BhcmVudE9iamVjdFRhZywgdGFnKTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIG5ldyBOZXN0ZWRQcm9wZXJ0eVJlZmVyZW5jZSh0aGlzLCBrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGFibGVSZWZlcmVuY2U8VCA9IHVua25vd24+IGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHB1YmxpYyB0YWcgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92YWx1ZTogVCkge31cblxuICB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICB1cGRhdGUodmFsdWU6IFQpIHtcbiAgICBsZXQgeyBfdmFsdWUgfSA9IHRoaXM7XG5cbiAgICBpZiAodmFsdWUgIT09IF92YWx1ZSkge1xuICAgICAgZGlydHkodGhpcy50YWcpO1xuICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBmb3JjZVVwZGF0ZSh2YWx1ZTogVCkge1xuICAgIGRpcnR5KHRoaXMudGFnKTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgZGlydHkoKSB7XG4gICAgZGlydHkodGhpcy50YWcpO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZSB7XG4gICAgcmV0dXJuIG5ldyBOZXN0ZWRQcm9wZXJ0eVJlZmVyZW5jZSh0aGlzLCBrZXkpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGF0ZTxUPihkYXRhOiBUKTogVXBkYXRhYmxlUmVmZXJlbmNlPFQ+IHtcbiAgcmV0dXJuIG5ldyBVcGRhdGFibGVSZWZlcmVuY2UoZGF0YSk7XG59XG5cbmNvbnN0IFNUQUJMRV9TVEFURSA9IG5ldyBXZWFrTWFwKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGFibGVTdGF0ZTxUIGV4dGVuZHMgb2JqZWN0PihkYXRhOiBUKTogVXBkYXRhYmxlUmVmZXJlbmNlPFQ+IHtcbiAgaWYgKFNUQUJMRV9TVEFURS5oYXMoZGF0YSkpIHtcbiAgICByZXR1cm4gU1RBQkxFX1NUQVRFLmdldChkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgcmVmID0gbmV3IFVwZGF0YWJsZVJlZmVyZW5jZShkYXRhKTtcbiAgICBTVEFCTEVfU1RBVEUuc2V0KGRhdGEsIHJlZik7XG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==