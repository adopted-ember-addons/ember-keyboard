'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReferenceCache = exports.CachedReference = undefined;
exports.isModified = isModified;

var _validators = require('./validators');

class CachedReference {
    constructor() {
        this.lastRevision = null;
        this.lastValue = null;
    }
    value() {
        let { tag, lastRevision, lastValue } = this;
        if (lastRevision === null || !(0, _validators.validate)(tag, lastRevision)) {
            lastValue = this.lastValue = this.compute();
            this.lastRevision = (0, _validators.value)(tag);
        }
        return lastValue;
    }
    invalidate() {
        this.lastRevision = null;
    }
}
exports.CachedReference = CachedReference; //////////

class ReferenceCache {
    constructor(reference) {
        this.lastValue = null;
        this.lastRevision = null;
        this.initialized = false;
        this.tag = reference.tag;
        this.reference = reference;
    }
    peek() {
        if (!this.initialized) {
            return this.initialize();
        }
        return this.lastValue;
    }
    revalidate() {
        if (!this.initialized) {
            return this.initialize();
        }
        let { reference, lastRevision } = this;
        let tag = reference.tag;
        if ((0, _validators.validate)(tag, lastRevision)) return NOT_MODIFIED;
        this.lastRevision = (0, _validators.value)(tag);
        let { lastValue } = this;
        let currentValue = reference.value();
        if (currentValue === lastValue) return NOT_MODIFIED;
        this.lastValue = currentValue;
        return currentValue;
    }
    initialize() {
        let { reference } = this;
        let currentValue = this.lastValue = reference.value();
        this.lastRevision = (0, _validators.value)(reference.tag);
        this.initialized = true;
        return currentValue;
    }
}
exports.ReferenceCache = ReferenceCache;
const NOT_MODIFIED = 'adb3b78e-3d22-4e4b-877a-6317c2c5c145';
function isModified(value) {
    return value !== NOT_MODIFIED;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcmVmZXJlbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQXdHTSxVLEdBQUEsVTs7OztBQW5GQSxNQUFBLGVBQUEsQ0FBK0I7QUFBckMsa0JBQUE7QUFHVSxhQUFBLFlBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsSUFBQTtBQWtCVDtBQWhCQyxZQUFLO0FBQ0gsWUFBSSxFQUFBLEdBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxLQUFKLElBQUE7QUFFQSxZQUFJLGlCQUFBLElBQUEsSUFBeUIsQ0FBQywwQkFBQSxHQUFBLEVBQTlCLFlBQThCLENBQTlCLEVBQTJEO0FBQ3pELHdCQUFZLEtBQUEsU0FBQSxHQUFpQixLQUE3QixPQUE2QixFQUE3QjtBQUNBLGlCQUFBLFlBQUEsR0FBb0IsdUJBQXBCLEdBQW9CLENBQXBCO0FBQ0Q7QUFFRCxlQUFBLFNBQUE7QUFDRDtBQUlTLGlCQUFVO0FBQ2xCLGFBQUEsWUFBQSxHQUFBLElBQUE7QUFDRDtBQXJCa0M7UUFBL0IsZSxHQUFBLGUsRUF3Qk47O0FBRU0sTUFBQSxjQUFBLENBQXFCO0FBUXpCLGdCQUFBLFNBQUEsRUFBNEM7QUFKcEMsYUFBQSxTQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsWUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLFdBQUEsR0FBQSxLQUFBO0FBR04sYUFBQSxHQUFBLEdBQVcsVUFBWCxHQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQUNEO0FBRUQsV0FBSTtBQUNGLFlBQUksQ0FBQyxLQUFMLFdBQUEsRUFBdUI7QUFDckIsbUJBQU8sS0FBUCxVQUFPLEVBQVA7QUFDRDtBQUVELGVBQU8sS0FBUCxTQUFBO0FBQ0Q7QUFFRCxpQkFBVTtBQUNSLFlBQUksQ0FBQyxLQUFMLFdBQUEsRUFBdUI7QUFDckIsbUJBQU8sS0FBUCxVQUFPLEVBQVA7QUFDRDtBQUVELFlBQUksRUFBQSxTQUFBLEVBQUEsWUFBQSxLQUFKLElBQUE7QUFDQSxZQUFJLE1BQU0sVUFBVixHQUFBO0FBRUEsWUFBSSwwQkFBQSxHQUFBLEVBQUosWUFBSSxDQUFKLEVBQTJDLE9BQUEsWUFBQTtBQUMzQyxhQUFBLFlBQUEsR0FBb0IsdUJBQXBCLEdBQW9CLENBQXBCO0FBRUEsWUFBSSxFQUFBLFNBQUEsS0FBSixJQUFBO0FBQ0EsWUFBSSxlQUFlLFVBQW5CLEtBQW1CLEVBQW5CO0FBQ0EsWUFBSSxpQkFBSixTQUFBLEVBQWdDLE9BQUEsWUFBQTtBQUNoQyxhQUFBLFNBQUEsR0FBQSxZQUFBO0FBRUEsZUFBQSxZQUFBO0FBQ0Q7QUFFTyxpQkFBVTtBQUNoQixZQUFJLEVBQUEsU0FBQSxLQUFKLElBQUE7QUFFQSxZQUFJLGVBQWdCLEtBQUEsU0FBQSxHQUFpQixVQUFyQyxLQUFxQyxFQUFyQztBQUNBLGFBQUEsWUFBQSxHQUFvQix1QkFBTSxVQUExQixHQUFvQixDQUFwQjtBQUNBLGFBQUEsV0FBQSxHQUFBLElBQUE7QUFFQSxlQUFBLFlBQUE7QUFDRDtBQWhEd0I7UUFBckIsYyxHQUFBLGM7QUF1RE4sTUFBTSxlQUFOLHNDQUFBO0FBRU0sU0FBQSxVQUFBLENBQUEsS0FBQSxFQUE0QztBQUNoRCxXQUFPLFVBQVAsWUFBQTtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBSZXZpc2lvbiwgVGFnLCBUYWdnZWQsIHZhbHVlLCB2YWxpZGF0ZSB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVmZXJlbmNlPFQ+IHtcbiAgdmFsdWUoKTogVDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVmZXJlbmNlO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBhdGhSZWZlcmVuY2U8VD4gZXh0ZW5kcyBSZWZlcmVuY2U8VD4ge1xuICBnZXQoa2V5OiBzdHJpbmcpOiBQYXRoUmVmZXJlbmNlPHVua25vd24+O1xufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBpbnRlcmZhY2UgVmVyc2lvbmVkUmVmZXJlbmNlPFQgPSB1bmtub3duPiBleHRlbmRzIFJlZmVyZW5jZTxUPiwgVGFnZ2VkIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxUID0gdW5rbm93bj4gZXh0ZW5kcyBQYXRoUmVmZXJlbmNlPFQ+LCBUYWdnZWQge1xuICBnZXQocHJvcGVydHk6IHN0cmluZyk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8dW5rbm93bj47XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDYWNoZWRSZWZlcmVuY2U8VD4gaW1wbGVtZW50cyBWZXJzaW9uZWRSZWZlcmVuY2U8VD4ge1xuICBwdWJsaWMgYWJzdHJhY3QgdGFnOiBUYWc7XG5cbiAgcHJpdmF0ZSBsYXN0UmV2aXNpb246IE9wdGlvbjxSZXZpc2lvbj4gPSBudWxsO1xuICBwcml2YXRlIGxhc3RWYWx1ZTogT3B0aW9uPFQ+ID0gbnVsbDtcblxuICB2YWx1ZSgpOiBUIHtcbiAgICBsZXQgeyB0YWcsIGxhc3RSZXZpc2lvbiwgbGFzdFZhbHVlIH0gPSB0aGlzO1xuXG4gICAgaWYgKGxhc3RSZXZpc2lvbiA9PT0gbnVsbCB8fCAhdmFsaWRhdGUodGFnLCBsYXN0UmV2aXNpb24pKSB7XG4gICAgICBsYXN0VmFsdWUgPSB0aGlzLmxhc3RWYWx1ZSA9IHRoaXMuY29tcHV0ZSgpO1xuICAgICAgdGhpcy5sYXN0UmV2aXNpb24gPSB2YWx1ZSh0YWcpO1xuICAgIH1cblxuICAgIHJldHVybiBsYXN0VmFsdWUgYXMgVDtcbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBjb21wdXRlKCk6IFQ7XG5cbiAgcHJvdGVjdGVkIGludmFsaWRhdGUoKSB7XG4gICAgdGhpcy5sYXN0UmV2aXNpb24gPSBudWxsO1xuICB9XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNsYXNzIFJlZmVyZW5jZUNhY2hlPFQ+IGltcGxlbWVudHMgVGFnZ2VkIHtcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIHByaXZhdGUgcmVmZXJlbmNlOiBWZXJzaW9uZWRSZWZlcmVuY2U8VD47XG4gIHByaXZhdGUgbGFzdFZhbHVlOiBPcHRpb248VD4gPSBudWxsO1xuICBwcml2YXRlIGxhc3RSZXZpc2lvbjogT3B0aW9uPFJldmlzaW9uPiA9IG51bGw7XG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihyZWZlcmVuY2U6IFZlcnNpb25lZFJlZmVyZW5jZTxUPikge1xuICAgIHRoaXMudGFnID0gcmVmZXJlbmNlLnRhZztcbiAgICB0aGlzLnJlZmVyZW5jZSA9IHJlZmVyZW5jZTtcbiAgfVxuXG4gIHBlZWsoKTogVCB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdFZhbHVlIGFzIFQ7XG4gIH1cblxuICByZXZhbGlkYXRlKCk6IFZhbGlkYXRpb248VD4ge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIGxldCB7IHJlZmVyZW5jZSwgbGFzdFJldmlzaW9uIH0gPSB0aGlzO1xuICAgIGxldCB0YWcgPSByZWZlcmVuY2UudGFnO1xuXG4gICAgaWYgKHZhbGlkYXRlKHRhZywgbGFzdFJldmlzaW9uIGFzIG51bWJlcikpIHJldHVybiBOT1RfTU9ESUZJRUQ7XG4gICAgdGhpcy5sYXN0UmV2aXNpb24gPSB2YWx1ZSh0YWcpO1xuXG4gICAgbGV0IHsgbGFzdFZhbHVlIH0gPSB0aGlzO1xuICAgIGxldCBjdXJyZW50VmFsdWUgPSByZWZlcmVuY2UudmFsdWUoKTtcbiAgICBpZiAoY3VycmVudFZhbHVlID09PSBsYXN0VmFsdWUpIHJldHVybiBOT1RfTU9ESUZJRUQ7XG4gICAgdGhpcy5sYXN0VmFsdWUgPSBjdXJyZW50VmFsdWU7XG5cbiAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplKCk6IFQge1xuICAgIGxldCB7IHJlZmVyZW5jZSB9ID0gdGhpcztcblxuICAgIGxldCBjdXJyZW50VmFsdWUgPSAodGhpcy5sYXN0VmFsdWUgPSByZWZlcmVuY2UudmFsdWUoKSk7XG4gICAgdGhpcy5sYXN0UmV2aXNpb24gPSB2YWx1ZShyZWZlcmVuY2UudGFnKTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsaWRhdGlvbjxUPiA9IFQgfCBOb3RNb2RpZmllZDtcblxuZXhwb3J0IHR5cGUgTm90TW9kaWZpZWQgPSAnYWRiM2I3OGUtM2QyMi00ZTRiLTg3N2EtNjMxN2MyYzVjMTQ1JztcblxuY29uc3QgTk9UX01PRElGSUVEOiBOb3RNb2RpZmllZCA9ICdhZGIzYjc4ZS0zZDIyLTRlNGItODc3YS02MzE3YzJjNWMxNDUnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNNb2RpZmllZDxUPih2YWx1ZTogVmFsaWRhdGlvbjxUPik6IHZhbHVlIGlzIFQge1xuICByZXR1cm4gdmFsdWUgIT09IE5PVF9NT0RJRklFRDtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=