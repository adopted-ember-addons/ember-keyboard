'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConcatReference = undefined;

var _reference = require('@glimmer/reference');

class ConcatReference extends _reference.CachedReference {
    constructor(parts) {
        super();
        this.parts = parts;
        this.tag = (0, _reference.combineTagged)(parts);
    }
    compute() {
        let parts = new Array();
        for (let i = 0; i < this.parts.length; i++) {
            let value = this.parts[i].value();
            if (value !== null && value !== undefined) {
                parts[i] = castToString(value);
            }
        }
        if (parts.length > 0) {
            return parts.join('');
        }
        return null;
    }
}
exports.ConcatReference = ConcatReference;
function castToString(value) {
    if (typeof value.toString !== 'function') {
        return '';
    }
    return String(value);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL2V4cHJlc3Npb25zL2NvbmNhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFHTSxNQUFBLGVBQUEsU0FBQSwwQkFBQSxDQUE4RDtBQUdsRSxnQkFBQSxLQUFBLEVBQXdEO0FBQ3REO0FBRGtCLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFFbEIsYUFBQSxHQUFBLEdBQVcsOEJBQVgsS0FBVyxDQUFYO0FBQ0Q7QUFFUyxjQUFPO0FBQ2YsWUFBSSxRQUFRLElBQVosS0FBWSxFQUFaO0FBRUEsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLEtBQUEsS0FBQSxDQUFwQixNQUFBLEVBQUEsR0FBQSxFQUE0QztBQUMxQyxnQkFBSSxRQUFRLEtBQUEsS0FBQSxDQUFBLENBQUEsRUFBWixLQUFZLEVBQVo7QUFFQSxnQkFBSSxVQUFBLElBQUEsSUFBa0IsVUFBdEIsU0FBQSxFQUEyQztBQUN6QyxzQkFBQSxDQUFBLElBQVcsYUFBWCxLQUFXLENBQVg7QUFDRDtBQUNGO0FBRUQsWUFBSSxNQUFBLE1BQUEsR0FBSixDQUFBLEVBQXNCO0FBQ3BCLG1CQUFPLE1BQUEsSUFBQSxDQUFQLEVBQU8sQ0FBUDtBQUNEO0FBRUQsZUFBQSxJQUFBO0FBQ0Q7QUF4QmlFO1FBQTlELGUsR0FBQSxlO0FBMkJOLFNBQUEsWUFBQSxDQUFBLEtBQUEsRUFBaUM7QUFDL0IsUUFBSSxPQUFPLE1BQVAsUUFBQSxLQUFKLFVBQUEsRUFBMEM7QUFDeEMsZUFBQSxFQUFBO0FBQ0Q7QUFFRCxXQUFPLE9BQVAsS0FBTyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcHRpb24sIERpY3QsIE1heWJlIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBDYWNoZWRSZWZlcmVuY2UsIGNvbWJpbmVUYWdnZWQsIFBhdGhSZWZlcmVuY2UsIFRhZyB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBjbGFzcyBDb25jYXRSZWZlcmVuY2UgZXh0ZW5kcyBDYWNoZWRSZWZlcmVuY2U8T3B0aW9uPHN0cmluZz4+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFydHM6IEFycmF5PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmVUYWdnZWQocGFydHMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNvbXB1dGUoKTogT3B0aW9uPHN0cmluZz4ge1xuICAgIGxldCBwYXJ0cyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMucGFydHNbaV0udmFsdWUoKSBhcyBNYXliZTxEaWN0PjtcblxuICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGFydHNbaV0gPSBjYXN0VG9TdHJpbmcodmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gcGFydHMuam9pbignJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FzdFRvU3RyaW5nKHZhbHVlOiBEaWN0KSB7XG4gIGlmICh0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=