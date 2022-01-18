"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConcatReference = undefined;

var _reference = require("@glimmer/reference");

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass);
}

var ConcatReference = exports.ConcatReference = function (_CachedReference) {
    _inherits(ConcatReference, _CachedReference);

    function ConcatReference(parts) {
        _classCallCheck(this, ConcatReference);

        var _this = _possibleConstructorReturn(this, _CachedReference.call(this));

        _this.parts = parts;
        _this.tag = (0, _reference.combineTagged)(parts);
        return _this;
    }

    ConcatReference.prototype.compute = function compute() {
        var parts = new Array();
        for (var i = 0; i < this.parts.length; i++) {
            var value = this.parts[i].value();
            if (value !== null && value !== undefined) {
                parts[i] = castToString(value);
            }
        }
        if (parts.length > 0) {
            return parts.join('');
        }
        return null;
    };

    return ConcatReference;
}(_reference.CachedReference);
function castToString(value) {
    if (typeof value.toString !== 'function') {
        return '';
    }
    return String(value);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL2V4cHJlc3Npb25zL2NvbmNhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFBLDRDQUFBLFVBQUEsZ0JBQUEsRUFBQTtBQUFBLGNBQUEsZUFBQSxFQUFBLGdCQUFBOztBQUdFLGFBQUEsZUFBQSxDQUFBLEtBQUEsRUFBd0Q7QUFBQSx3QkFBQSxJQUFBLEVBQUEsZUFBQTs7QUFBQSxZQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUN0RCxpQkFBQSxJQUFBLENBRHNELElBQ3RELENBRHNELENBQUE7O0FBQXBDLGNBQUEsS0FBQSxHQUFBLEtBQUE7QUFFbEIsY0FBQSxHQUFBLEdBQVcsOEJBQVgsS0FBVyxDQUFYO0FBRnNELGVBQUEsS0FBQTtBQUd2RDs7QUFOSCxvQkFBQSxTQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsT0FBQSxHQVFtQjtBQUNmLFlBQUksUUFBUSxJQUFaLEtBQVksRUFBWjtBQUVBLGFBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBSSxLQUFBLEtBQUEsQ0FBcEIsTUFBQSxFQUFBLEdBQUEsRUFBNEM7QUFDMUMsZ0JBQUksUUFBUSxLQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQVosS0FBWSxFQUFaO0FBRUEsZ0JBQUksVUFBQSxJQUFBLElBQWtCLFVBQXRCLFNBQUEsRUFBMkM7QUFDekMsc0JBQUEsQ0FBQSxJQUFXLGFBQVgsS0FBVyxDQUFYO0FBQ0Q7QUFDRjtBQUVELFlBQUksTUFBQSxNQUFBLEdBQUosQ0FBQSxFQUFzQjtBQUNwQixtQkFBTyxNQUFBLElBQUEsQ0FBUCxFQUFPLENBQVA7QUFDRDtBQUVELGVBQUEsSUFBQTtBQXZCSixLQUFBOztBQUFBLFdBQUEsZUFBQTtBQUFBLENBQUEsQ0FBQSwwQkFBQSxDQUFBO0FBMkJBLFNBQUEsWUFBQSxDQUFBLEtBQUEsRUFBaUM7QUFDL0IsUUFBSSxPQUFPLE1BQVAsUUFBQSxLQUFKLFVBQUEsRUFBMEM7QUFDeEMsZUFBQSxFQUFBO0FBQ0Q7QUFFRCxXQUFPLE9BQVAsS0FBTyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcHRpb24sIERpY3QsIE1heWJlIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBDYWNoZWRSZWZlcmVuY2UsIGNvbWJpbmVUYWdnZWQsIFBhdGhSZWZlcmVuY2UsIFRhZyB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCBjbGFzcyBDb25jYXRSZWZlcmVuY2UgZXh0ZW5kcyBDYWNoZWRSZWZlcmVuY2U8T3B0aW9uPHN0cmluZz4+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFydHM6IEFycmF5PFBhdGhSZWZlcmVuY2U8dW5rbm93bj4+KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmVUYWdnZWQocGFydHMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNvbXB1dGUoKTogT3B0aW9uPHN0cmluZz4ge1xuICAgIGxldCBwYXJ0cyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMucGFydHNbaV0udmFsdWUoKSBhcyBNYXliZTxEaWN0PjtcblxuICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcGFydHNbaV0gPSBjYXN0VG9TdHJpbmcodmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gcGFydHMuam9pbignJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FzdFRvU3RyaW5nKHZhbHVlOiBEaWN0KSB7XG4gIGlmICh0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=