'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReferenceCache = exports.CachedReference = undefined;
exports.isModified = isModified;

var _validators = require('./validators');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var CachedReference = exports.CachedReference = function () {
    function CachedReference() {
        _classCallCheck(this, CachedReference);

        this.lastRevision = null;
        this.lastValue = null;
    }

    CachedReference.prototype.value = function value() {
        var tag = this.tag,
            lastRevision = this.lastRevision,
            lastValue = this.lastValue;

        if (lastRevision === null || !(0, _validators.validate)(tag, lastRevision)) {
            lastValue = this.lastValue = this.compute();
            this.lastRevision = (0, _validators.value)(tag);
        }
        return lastValue;
    };

    CachedReference.prototype.invalidate = function invalidate() {
        this.lastRevision = null;
    };

    return CachedReference;
}();
//////////
var ReferenceCache = exports.ReferenceCache = function () {
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
        if ((0, _validators.validate)(tag, lastRevision)) return NOT_MODIFIED;
        this.lastRevision = (0, _validators.value)(tag);
        var lastValue = this.lastValue;

        var currentValue = reference.value();
        if (currentValue === lastValue) return NOT_MODIFIED;
        this.lastValue = currentValue;
        return currentValue;
    };

    ReferenceCache.prototype.initialize = function initialize() {
        var reference = this.reference;

        var currentValue = this.lastValue = reference.value();
        this.lastRevision = (0, _validators.value)(reference.tag);
        this.initialized = true;
        return currentValue;
    };

    return ReferenceCache;
}();
var NOT_MODIFIED = 'adb3b78e-3d22-4e4b-877a-6317c2c5c145';
function isModified(value) {
    return value !== NOT_MODIFIED;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvcmVmZXJlbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztRQXdHTSxVLEdBQUEsVTs7QUF2R047Ozs7Ozs7O0FBb0JBLElBQUEsNENBQUEsWUFBQTtBQUFBLGFBQUEsZUFBQSxHQUFBO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGVBQUE7O0FBR1UsYUFBQSxZQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsU0FBQSxHQUFBLElBQUE7QUFrQlQ7O0FBdEJELG9CQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxLQUFBLEdBTU87QUFBQSxZQUFBLE1BQUEsS0FBQSxHQUFBO0FBQUEsWUFBQSxlQUFBLEtBQUEsWUFBQTtBQUFBLFlBQUEsWUFBQSxLQUFBLFNBQUE7O0FBR0gsWUFBSSxpQkFBQSxJQUFBLElBQXlCLENBQUMsMEJBQUEsR0FBQSxFQUE5QixZQUE4QixDQUE5QixFQUEyRDtBQUN6RCx3QkFBWSxLQUFBLFNBQUEsR0FBaUIsS0FBN0IsT0FBNkIsRUFBN0I7QUFDQSxpQkFBQSxZQUFBLEdBQW9CLHVCQUFwQixHQUFvQixDQUFwQjtBQUNEO0FBRUQsZUFBQSxTQUFBO0FBZEosS0FBQTs7QUFBQSxvQkFBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFNBQUEsVUFBQSxHQW1Cc0I7QUFDbEIsYUFBQSxZQUFBLEdBQUEsSUFBQTtBQXBCSixLQUFBOztBQUFBLFdBQUEsZUFBQTtBQUFBLENBQUEsRUFBQTtBQXdCQTtBQUVBLElBQUEsMENBQUEsWUFBQTtBQVFFLGFBQUEsY0FBQSxDQUFBLFNBQUEsRUFBNEM7QUFBQSx3QkFBQSxJQUFBLEVBQUEsY0FBQTs7QUFKcEMsYUFBQSxTQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsWUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLFdBQUEsR0FBQSxLQUFBO0FBR04sYUFBQSxHQUFBLEdBQVcsVUFBWCxHQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsU0FBQTtBQUNEOztBQVhILG1CQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsU0FBQSxJQUFBLEdBYU07QUFDRixZQUFJLENBQUMsS0FBTCxXQUFBLEVBQXVCO0FBQ3JCLG1CQUFPLEtBQVAsVUFBTyxFQUFQO0FBQ0Q7QUFFRCxlQUFPLEtBQVAsU0FBQTtBQWxCSixLQUFBOztBQUFBLG1CQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxVQUFBLEdBcUJZO0FBQ1IsWUFBSSxDQUFDLEtBQUwsV0FBQSxFQUF1QjtBQUNyQixtQkFBTyxLQUFQLFVBQU8sRUFBUDtBQUNEO0FBSE8sWUFBQSxZQUFBLEtBQUEsU0FBQTtBQUFBLFlBQUEsZUFBQSxLQUFBLFlBQUE7O0FBTVIsWUFBSSxNQUFNLFVBQVYsR0FBQTtBQUVBLFlBQUksMEJBQUEsR0FBQSxFQUFKLFlBQUksQ0FBSixFQUEyQyxPQUFBLFlBQUE7QUFDM0MsYUFBQSxZQUFBLEdBQW9CLHVCQUFwQixHQUFvQixDQUFwQjtBQVRRLFlBQUEsWUFBQSxLQUFBLFNBQUE7O0FBWVIsWUFBSSxlQUFlLFVBQW5CLEtBQW1CLEVBQW5CO0FBQ0EsWUFBSSxpQkFBSixTQUFBLEVBQWdDLE9BQUEsWUFBQTtBQUNoQyxhQUFBLFNBQUEsR0FBQSxZQUFBO0FBRUEsZUFBQSxZQUFBO0FBckNKLEtBQUE7O0FBQUEsbUJBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0F3Q29CO0FBQUEsWUFBQSxZQUFBLEtBQUEsU0FBQTs7QUFHaEIsWUFBSSxlQUFnQixLQUFBLFNBQUEsR0FBaUIsVUFBckMsS0FBcUMsRUFBckM7QUFDQSxhQUFBLFlBQUEsR0FBb0IsdUJBQU0sVUFBMUIsR0FBb0IsQ0FBcEI7QUFDQSxhQUFBLFdBQUEsR0FBQSxJQUFBO0FBRUEsZUFBQSxZQUFBO0FBL0NKLEtBQUE7O0FBQUEsV0FBQSxjQUFBO0FBQUEsQ0FBQSxFQUFBO0FBdURBLElBQU0sZUFBTixzQ0FBQTtBQUVNLFNBQUEsVUFBQSxDQUFBLEtBQUEsRUFBNEM7QUFDaEQsV0FBTyxVQUFQLFlBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgUmV2aXNpb24sIFRhZywgVGFnZ2VkLCB2YWx1ZSwgdmFsaWRhdGUgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlZmVyZW5jZTxUPiB7XG4gIHZhbHVlKCk6IFQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlZmVyZW5jZTtcblxuZXhwb3J0IGludGVyZmFjZSBQYXRoUmVmZXJlbmNlPFQ+IGV4dGVuZHMgUmVmZXJlbmNlPFQ+IHtcbiAgZ2V0KGtleTogc3RyaW5nKTogUGF0aFJlZmVyZW5jZTx1bmtub3duPjtcbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgaW50ZXJmYWNlIFZlcnNpb25lZFJlZmVyZW5jZTxUID0gdW5rbm93bj4gZXh0ZW5kcyBSZWZlcmVuY2U8VD4sIFRhZ2dlZCB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VCA9IHVua25vd24+IGV4dGVuZHMgUGF0aFJlZmVyZW5jZTxUPiwgVGFnZ2VkIHtcbiAgZ2V0KHByb3BlcnR5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPHVua25vd24+O1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FjaGVkUmVmZXJlbmNlPFQ+IGltcGxlbWVudHMgVmVyc2lvbmVkUmVmZXJlbmNlPFQ+IHtcbiAgcHVibGljIGFic3RyYWN0IHRhZzogVGFnO1xuXG4gIHByaXZhdGUgbGFzdFJldmlzaW9uOiBPcHRpb248UmV2aXNpb24+ID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0VmFsdWU6IE9wdGlvbjxUPiA9IG51bGw7XG5cbiAgdmFsdWUoKTogVCB7XG4gICAgbGV0IHsgdGFnLCBsYXN0UmV2aXNpb24sIGxhc3RWYWx1ZSB9ID0gdGhpcztcblxuICAgIGlmIChsYXN0UmV2aXNpb24gPT09IG51bGwgfHwgIXZhbGlkYXRlKHRhZywgbGFzdFJldmlzaW9uKSkge1xuICAgICAgbGFzdFZhbHVlID0gdGhpcy5sYXN0VmFsdWUgPSB0aGlzLmNvbXB1dGUoKTtcbiAgICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGFnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGFzdFZhbHVlIGFzIFQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgY29tcHV0ZSgpOiBUO1xuXG4gIHByb3RlY3RlZCBpbnZhbGlkYXRlKCkge1xuICAgIHRoaXMubGFzdFJldmlzaW9uID0gbnVsbDtcbiAgfVxufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjbGFzcyBSZWZlcmVuY2VDYWNoZTxUPiBpbXBsZW1lbnRzIFRhZ2dlZCB7XG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBwcml2YXRlIHJlZmVyZW5jZTogVmVyc2lvbmVkUmVmZXJlbmNlPFQ+O1xuICBwcml2YXRlIGxhc3RWYWx1ZTogT3B0aW9uPFQ+ID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0UmV2aXNpb246IE9wdGlvbjxSZXZpc2lvbj4gPSBudWxsO1xuICBwcml2YXRlIGluaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocmVmZXJlbmNlOiBWZXJzaW9uZWRSZWZlcmVuY2U8VD4pIHtcbiAgICB0aGlzLnRhZyA9IHJlZmVyZW5jZS50YWc7XG4gICAgdGhpcy5yZWZlcmVuY2UgPSByZWZlcmVuY2U7XG4gIH1cblxuICBwZWVrKCk6IFQge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxhc3RWYWx1ZSBhcyBUO1xuICB9XG5cbiAgcmV2YWxpZGF0ZSgpOiBWYWxpZGF0aW9uPFQ+IHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB9XG5cbiAgICBsZXQgeyByZWZlcmVuY2UsIGxhc3RSZXZpc2lvbiB9ID0gdGhpcztcbiAgICBsZXQgdGFnID0gcmVmZXJlbmNlLnRhZztcblxuICAgIGlmICh2YWxpZGF0ZSh0YWcsIGxhc3RSZXZpc2lvbiBhcyBudW1iZXIpKSByZXR1cm4gTk9UX01PRElGSUVEO1xuICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUodGFnKTtcblxuICAgIGxldCB7IGxhc3RWYWx1ZSB9ID0gdGhpcztcbiAgICBsZXQgY3VycmVudFZhbHVlID0gcmVmZXJlbmNlLnZhbHVlKCk7XG4gICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gbGFzdFZhbHVlKSByZXR1cm4gTk9UX01PRElGSUVEO1xuICAgIHRoaXMubGFzdFZhbHVlID0gY3VycmVudFZhbHVlO1xuXG4gICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZSgpOiBUIHtcbiAgICBsZXQgeyByZWZlcmVuY2UgfSA9IHRoaXM7XG5cbiAgICBsZXQgY3VycmVudFZhbHVlID0gKHRoaXMubGFzdFZhbHVlID0gcmVmZXJlbmNlLnZhbHVlKCkpO1xuICAgIHRoaXMubGFzdFJldmlzaW9uID0gdmFsdWUocmVmZXJlbmNlLnRhZyk7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFZhbGlkYXRpb248VD4gPSBUIHwgTm90TW9kaWZpZWQ7XG5cbmV4cG9ydCB0eXBlIE5vdE1vZGlmaWVkID0gJ2FkYjNiNzhlLTNkMjItNGU0Yi04NzdhLTYzMTdjMmM1YzE0NSc7XG5cbmNvbnN0IE5PVF9NT0RJRklFRDogTm90TW9kaWZpZWQgPSAnYWRiM2I3OGUtM2QyMi00ZTRiLTg3N2EtNjMxN2MyYzVjMTQ1JztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzTW9kaWZpZWQ8VD4odmFsdWU6IFZhbGlkYXRpb248VD4pOiB2YWx1ZSBpcyBUIHtcbiAgcmV0dXJuIHZhbHVlICE9PSBOT1RfTU9ESUZJRUQ7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9