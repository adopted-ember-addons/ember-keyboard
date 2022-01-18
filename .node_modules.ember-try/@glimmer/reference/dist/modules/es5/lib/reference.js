function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { value as _value, validate } from './validators';
export var CachedReference = function () {
    function CachedReference() {
        _classCallCheck(this, CachedReference);

        this.lastRevision = null;
        this.lastValue = null;
    }

    CachedReference.prototype.value = function value() {
        var tag = this.tag,
            lastRevision = this.lastRevision,
            lastValue = this.lastValue;

        if (lastRevision === null || !validate(tag, lastRevision)) {
            lastValue = this.lastValue = this.compute();
            this.lastRevision = _value(tag);
        }
        return lastValue;
    };

    CachedReference.prototype.invalidate = function invalidate() {
        this.lastRevision = null;
    };

    return CachedReference;
}();
//////////
export var ReferenceCache = function () {
    function ReferenceCache(reference) {
        _classCallCheck(this, ReferenceCache);

        this.lastValue = null;
        this.lastRevision = null;
        this.initialized = false;
        this.tag = reference.tag;
        this.reference = reference;
    }

    ReferenceCache.prototype.peek = function peek() {
        if (!this.initialized) {
            return this.initialize();
        }
        return this.lastValue;
    };

    ReferenceCache.prototype.revalidate = function revalidate() {
        if (!this.initialized) {
            return this.initialize();
        }
        var reference = this.reference,
            lastRevision = this.lastRevision;

        var tag = reference.tag;
        if (validate(tag, lastRevision)) return NOT_MODIFIED;
        this.lastRevision = _value(tag);
        var lastValue = this.lastValue;

        var currentValue = reference.value();
        if (currentValue === lastValue) return NOT_MODIFIED;
        this.lastValue = currentValue;
        return currentValue;
    };

    ReferenceCache.prototype.initialize = function initialize() {
        var reference = this.reference;

        var currentValue = this.lastValue = reference.value();
        this.lastRevision = _value(reference.tag);
        this.initialized = true;
        return currentValue;
    };

    return ReferenceCache;
}();
var NOT_MODIFIED = 'adb3b78e-3d22-4e4b-877a-6317c2c5c145';
export function isModified(value) {
    return value !== NOT_MODIFIED;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcmVmZXJlbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsU0FBQSxlQUFBLEVBQUEsUUFBQSxRQUFBLGNBQUE7QUFvQkEsV0FBTSxlQUFOO0FBQUEsK0JBQUE7QUFBQTs7QUFHVSxhQUFBLFlBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsSUFBQTtBQWtCVDs7QUF0QkQsOEJBTUUsS0FORixvQkFNTztBQUFBLFlBQ0MsR0FERCxHQUNILElBREcsQ0FDQyxHQUREO0FBQUEsWUFDQyxZQURELEdBQ0gsSUFERyxDQUNDLFlBREQ7QUFBQSxZQUNDLFNBREQsR0FDSCxJQURHLENBQ0MsU0FERDs7QUFHSCxZQUFJLGlCQUFBLElBQUEsSUFBeUIsQ0FBQyxTQUFBLEdBQUEsRUFBOUIsWUFBOEIsQ0FBOUIsRUFBMkQ7QUFDekQsd0JBQVksS0FBQSxTQUFBLEdBQWlCLEtBQTdCLE9BQTZCLEVBQTdCO0FBQ0EsaUJBQUEsWUFBQSxHQUFvQixPQUFwQixHQUFvQixDQUFwQjtBQUNEO0FBRUQsZUFBQSxTQUFBO0FBQ0QsS0FmSDs7QUFBQSw4QkFtQlksVUFuQloseUJBbUJzQjtBQUNsQixhQUFBLFlBQUEsR0FBQSxJQUFBO0FBQ0QsS0FyQkg7O0FBQUE7QUFBQTtBQXdCQTtBQUVBLFdBQU0sY0FBTjtBQVFFLDRCQUFBLFNBQUEsRUFBNEM7QUFBQTs7QUFKcEMsYUFBQSxTQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsWUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLFdBQUEsR0FBQSxLQUFBO0FBR04sYUFBQSxHQUFBLEdBQVcsVUFBWCxHQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQUNEOztBQVhILDZCQWFFLElBYkYsbUJBYU07QUFDRixZQUFJLENBQUMsS0FBTCxXQUFBLEVBQXVCO0FBQ3JCLG1CQUFPLEtBQVAsVUFBTyxFQUFQO0FBQ0Q7QUFFRCxlQUFPLEtBQVAsU0FBQTtBQUNELEtBbkJIOztBQUFBLDZCQXFCRSxVQXJCRix5QkFxQlk7QUFDUixZQUFJLENBQUMsS0FBTCxXQUFBLEVBQXVCO0FBQ3JCLG1CQUFPLEtBQVAsVUFBTyxFQUFQO0FBQ0Q7QUFITyxZQUtKLFNBTEksR0FLUixJQUxRLENBS0osU0FMSTtBQUFBLFlBS0osWUFMSSxHQUtSLElBTFEsQ0FLSixZQUxJOztBQU1SLFlBQUksTUFBTSxVQUFWLEdBQUE7QUFFQSxZQUFJLFNBQUEsR0FBQSxFQUFKLFlBQUksQ0FBSixFQUEyQyxPQUFBLFlBQUE7QUFDM0MsYUFBQSxZQUFBLEdBQW9CLE9BQXBCLEdBQW9CLENBQXBCO0FBVFEsWUFXSixTQVhJLEdBV1IsSUFYUSxDQVdKLFNBWEk7O0FBWVIsWUFBSSxlQUFlLFVBQW5CLEtBQW1CLEVBQW5CO0FBQ0EsWUFBSSxpQkFBSixTQUFBLEVBQWdDLE9BQUEsWUFBQTtBQUNoQyxhQUFBLFNBQUEsR0FBQSxZQUFBO0FBRUEsZUFBQSxZQUFBO0FBQ0QsS0F0Q0g7O0FBQUEsNkJBd0NVLFVBeENWLHlCQXdDb0I7QUFBQSxZQUNaLFNBRFksR0FDaEIsSUFEZ0IsQ0FDWixTQURZOztBQUdoQixZQUFJLGVBQWdCLEtBQUEsU0FBQSxHQUFpQixVQUFyQyxLQUFxQyxFQUFyQztBQUNBLGFBQUEsWUFBQSxHQUFvQixPQUFNLFVBQTFCLEdBQW9CLENBQXBCO0FBQ0EsYUFBQSxXQUFBLEdBQUEsSUFBQTtBQUVBLGVBQUEsWUFBQTtBQUNELEtBaERIOztBQUFBO0FBQUE7QUF1REEsSUFBTSxlQUFOLHNDQUFBO0FBRUEsT0FBTSxTQUFBLFVBQUEsQ0FBQSxLQUFBLEVBQTRDO0FBQ2hELFdBQU8sVUFBUCxZQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFJldmlzaW9uLCBUYWcsIFRhZ2dlZCwgdmFsdWUsIHZhbGlkYXRlIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcblxuZXhwb3J0IGludGVyZmFjZSBSZWZlcmVuY2U8VD4ge1xuICB2YWx1ZSgpOiBUO1xufVxuXG5leHBvcnQgZGVmYXVsdCBSZWZlcmVuY2U7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF0aFJlZmVyZW5jZTxUPiBleHRlbmRzIFJlZmVyZW5jZTxUPiB7XG4gIGdldChrZXk6IHN0cmluZyk6IFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uZWRSZWZlcmVuY2U8VCA9IHVua25vd24+IGV4dGVuZHMgUmVmZXJlbmNlPFQ+LCBUYWdnZWQge31cblxuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQgPSB1bmtub3duPiBleHRlbmRzIFBhdGhSZWZlcmVuY2U8VD4sIFRhZ2dlZCB7XG4gIGdldChwcm9wZXJ0eTogc3RyaW5nKTogVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTx1bmtub3duPjtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENhY2hlZFJlZmVyZW5jZTxUPiBpbXBsZW1lbnRzIFZlcnNpb25lZFJlZmVyZW5jZTxUPiB7XG4gIHB1YmxpYyBhYnN0cmFjdCB0YWc6IFRhZztcblxuICBwcml2YXRlIGxhc3RSZXZpc2lvbjogT3B0aW9uPFJldmlzaW9uPiA9IG51bGw7XG4gIHByaXZhdGUgbGFzdFZhbHVlOiBPcHRpb248VD4gPSBudWxsO1xuXG4gIHZhbHVlKCk6IFQge1xuICAgIGxldCB7IHRhZywgbGFzdFJldmlzaW9uLCBsYXN0VmFsdWUgfSA9IHRoaXM7XG5cbiAgICBpZiAobGFzdFJldmlzaW9uID09PSBudWxsIHx8ICF2YWxpZGF0ZSh0YWcsIGxhc3RSZXZpc2lvbikpIHtcbiAgICAgIGxhc3RWYWx1ZSA9IHRoaXMubGFzdFZhbHVlID0gdGhpcy5jb21wdXRlKCk7XG4gICAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhc3RWYWx1ZSBhcyBUO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGNvbXB1dGUoKTogVDtcblxuICBwcm90ZWN0ZWQgaW52YWxpZGF0ZSgpIHtcbiAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IG51bGw7XG4gIH1cbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY2xhc3MgUmVmZXJlbmNlQ2FjaGU8VD4gaW1wbGVtZW50cyBUYWdnZWQge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgcHJpdmF0ZSByZWZlcmVuY2U6IFZlcnNpb25lZFJlZmVyZW5jZTxUPjtcbiAgcHJpdmF0ZSBsYXN0VmFsdWU6IE9wdGlvbjxUPiA9IG51bGw7XG4gIHByaXZhdGUgbGFzdFJldmlzaW9uOiBPcHRpb248UmV2aXNpb24+ID0gbnVsbDtcbiAgcHJpdmF0ZSBpbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHJlZmVyZW5jZTogVmVyc2lvbmVkUmVmZXJlbmNlPFQ+KSB7XG4gICAgdGhpcy50YWcgPSByZWZlcmVuY2UudGFnO1xuICAgIHRoaXMucmVmZXJlbmNlID0gcmVmZXJlbmNlO1xuICB9XG5cbiAgcGVlaygpOiBUIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sYXN0VmFsdWUgYXMgVDtcbiAgfVxuXG4gIHJldmFsaWRhdGUoKTogVmFsaWRhdGlvbjxUPiB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplKCk7XG4gICAgfVxuXG4gICAgbGV0IHsgcmVmZXJlbmNlLCBsYXN0UmV2aXNpb24gfSA9IHRoaXM7XG4gICAgbGV0IHRhZyA9IHJlZmVyZW5jZS50YWc7XG5cbiAgICBpZiAodmFsaWRhdGUodGFnLCBsYXN0UmV2aXNpb24gYXMgbnVtYmVyKSkgcmV0dXJuIE5PVF9NT0RJRklFRDtcbiAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHRhZyk7XG5cbiAgICBsZXQgeyBsYXN0VmFsdWUgfSA9IHRoaXM7XG4gICAgbGV0IGN1cnJlbnRWYWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpO1xuICAgIGlmIChjdXJyZW50VmFsdWUgPT09IGxhc3RWYWx1ZSkgcmV0dXJuIE5PVF9NT0RJRklFRDtcbiAgICB0aGlzLmxhc3RWYWx1ZSA9IGN1cnJlbnRWYWx1ZTtcblxuICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemUoKTogVCB7XG4gICAgbGV0IHsgcmVmZXJlbmNlIH0gPSB0aGlzO1xuXG4gICAgbGV0IGN1cnJlbnRWYWx1ZSA9ICh0aGlzLmxhc3RWYWx1ZSA9IHJlZmVyZW5jZS52YWx1ZSgpKTtcbiAgICB0aGlzLmxhc3RSZXZpc2lvbiA9IHZhbHVlKHJlZmVyZW5jZS50YWcpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBWYWxpZGF0aW9uPFQ+ID0gVCB8IE5vdE1vZGlmaWVkO1xuXG5leHBvcnQgdHlwZSBOb3RNb2RpZmllZCA9ICdhZGIzYjc4ZS0zZDIyLTRlNGItODc3YS02MzE3YzJjNWMxNDUnO1xuXG5jb25zdCBOT1RfTU9ESUZJRUQ6IE5vdE1vZGlmaWVkID0gJ2FkYjNiNzhlLTNkMjItNGU0Yi04NzdhLTYzMTdjMmM1YzE0NSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01vZGlmaWVkPFQ+KHZhbHVlOiBWYWxpZGF0aW9uPFQ+KTogdmFsdWUgaXMgVCB7XG4gIHJldHVybiB2YWx1ZSAhPT0gTk9UX01PRElGSUVEO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==