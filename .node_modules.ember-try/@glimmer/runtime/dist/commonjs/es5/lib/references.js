"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConditionalReference = exports.FALSE_REFERENCE = exports.TRUE_REFERENCE = exports.NULL_REFERENCE = exports.UNDEFINED_REFERENCE = exports.PrimitiveReference = undefined;

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

var PrimitiveReference = exports.PrimitiveReference = function (_ConstReference) {
    _inherits(PrimitiveReference, _ConstReference);

    function PrimitiveReference(value) {
        _classCallCheck(this, PrimitiveReference);

        return _possibleConstructorReturn(this, _ConstReference.call(this, value));
    }

    PrimitiveReference.create = function create(value) {
        if (value === undefined) {
            return UNDEFINED_REFERENCE;
        } else if (value === null) {
            return NULL_REFERENCE;
        } else if (value === true) {
            return TRUE_REFERENCE;
        } else if (value === false) {
            return FALSE_REFERENCE;
        } else if (typeof value === 'number') {
            return new ValueReference(value);
        } else {
            return new StringReference(value);
        }
    };

    PrimitiveReference.prototype.get = function get(_key) {
        return UNDEFINED_REFERENCE;
    };

    return PrimitiveReference;
}(_reference.ConstReference);

var StringReference = function (_PrimitiveReference) {
    _inherits(StringReference, _PrimitiveReference);

    function StringReference() {
        _classCallCheck(this, StringReference);

        var _this2 = _possibleConstructorReturn(this, _PrimitiveReference.apply(this, arguments));

        _this2.lengthReference = null;
        return _this2;
    }

    StringReference.prototype.get = function get(key) {
        if (key === 'length') {
            var lengthReference = this.lengthReference;

            if (lengthReference === null) {
                lengthReference = this.lengthReference = new ValueReference(this.inner.length);
            }
            return lengthReference;
        } else {
            return _PrimitiveReference.prototype.get.call(this, key);
        }
    };

    return StringReference;
}(PrimitiveReference);

var ValueReference = function (_PrimitiveReference2) {
    _inherits(ValueReference, _PrimitiveReference2);

    function ValueReference(value) {
        _classCallCheck(this, ValueReference);

        return _possibleConstructorReturn(this, _PrimitiveReference2.call(this, value));
    }

    return ValueReference;
}(PrimitiveReference);

var UNDEFINED_REFERENCE = exports.UNDEFINED_REFERENCE = new ValueReference(undefined);
var NULL_REFERENCE = exports.NULL_REFERENCE = new ValueReference(null);
var TRUE_REFERENCE = exports.TRUE_REFERENCE = new ValueReference(true);
var FALSE_REFERENCE = exports.FALSE_REFERENCE = new ValueReference(false);
var ConditionalReference = exports.ConditionalReference = function () {
    function ConditionalReference(inner) {
        var toBool = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultToBool;

        _classCallCheck(this, ConditionalReference);

        this.inner = inner;
        this.toBool = toBool;
        this.tag = inner.tag;
    }

    ConditionalReference.prototype.value = function value() {
        return this.toBool(this.inner.value());
    };

    return ConditionalReference;
}();
function defaultToBool(value) {
    return !!value;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsSUFBQSxrREFBQSxVQUFBLGVBQUEsRUFBQTtBQUFBLGNBQUEsa0JBQUEsRUFBQSxlQUFBOztBQWtCRSxhQUFBLGtCQUFBLENBQUEsS0FBQSxFQUE4QjtBQUFBLHdCQUFBLElBQUEsRUFBQSxrQkFBQTs7QUFBQSxlQUFBLDJCQUFBLElBQUEsRUFDNUIsZ0JBQUEsSUFBQSxDQUFBLElBQUEsRUFENEIsS0FDNUIsQ0FENEIsQ0FBQTtBQUU3Qjs7QUFwQkgsdUJBQUEsTUFBQSxHQUFBLFNBQUEsTUFBQSxDQUFBLEtBQUEsRUFFNkM7QUFDekMsWUFBSSxVQUFKLFNBQUEsRUFBeUI7QUFDdkIsbUJBQUEsbUJBQUE7QUFERixTQUFBLE1BRU8sSUFBSSxVQUFKLElBQUEsRUFBb0I7QUFDekIsbUJBQUEsY0FBQTtBQURLLFNBQUEsTUFFQSxJQUFJLFVBQUosSUFBQSxFQUFvQjtBQUN6QixtQkFBQSxjQUFBO0FBREssU0FBQSxNQUVBLElBQUksVUFBSixLQUFBLEVBQXFCO0FBQzFCLG1CQUFBLGVBQUE7QUFESyxTQUFBLE1BRUEsSUFBSSxPQUFBLEtBQUEsS0FBSixRQUFBLEVBQStCO0FBQ3BDLG1CQUFPLElBQUEsY0FBQSxDQUFQLEtBQU8sQ0FBUDtBQURLLFNBQUEsTUFFQTtBQUNMLG1CQUFPLElBQUEsZUFBQSxDQUFQLEtBQU8sQ0FBUDtBQUNEO0FBZkwsS0FBQTs7QUFBQSx1QkFBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFNBQUEsR0FBQSxDQUFBLElBQUEsRUFzQmtCO0FBQ2QsZUFBQSxtQkFBQTtBQXZCSixLQUFBOztBQUFBLFdBQUEsa0JBQUE7QUFBQSxDQUFBLENBQUEseUJBQUEsQ0FBQTs7SUEyQkEsa0I7OztBQUFBLGFBQUEsZUFBQSxHQUFBO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGVBQUE7O0FBQUEsWUFBQSxTQUFBLDJCQUFBLElBQUEsRSxnQ0FBQSxTLENBQUEsQ0FBQTs7QUFDVSxlQUFBLGVBQUEsR0FBQSxJQUFBO0FBRFYsZUFBQSxNQUFBO0FBZ0JDOzs4QkFiQyxHLGdCQUFBLEcsRUFBZTtBQUNiLFlBQUksUUFBSixRQUFBLEVBQXNCO0FBQUEsZ0JBQUEsa0JBQUEsS0FBQSxlQUFBOztBQUdwQixnQkFBSSxvQkFBSixJQUFBLEVBQThCO0FBQzVCLGtDQUFrQixLQUFBLGVBQUEsR0FBdUIsSUFBQSxjQUFBLENBQW1CLEtBQUEsS0FBQSxDQUE1RCxNQUF5QyxDQUF6QztBQUNEO0FBRUQsbUJBQUEsZUFBQTtBQVBGLFNBQUEsTUFRTztBQUNMLG1CQUFPLG9CQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBUCxHQUFPLENBQVA7QUFDRDs7OztFQWRMLGtCOztJQW9CQSxpQjs7O0FBQ0UsYUFBQSxjQUFBLENBQUEsS0FBQSxFQUFvQjtBQUFBLHdCQUFBLElBQUEsRUFBQSxjQUFBOztBQUFBLGVBQUEsMkJBQUEsSUFBQSxFQUNsQixxQkFBQSxJQUFBLENBQUEsSUFBQSxFQURrQixLQUNsQixDQURrQixDQUFBO0FBRW5COzs7RUFISCxrQjs7QUFNTyxJQUFNLG9EQUFxRCxJQUFBLGNBQUEsQ0FBM0QsU0FBMkQsQ0FBM0Q7QUFDQSxJQUFNLDBDQUEyQyxJQUFBLGNBQUEsQ0FBakQsSUFBaUQsQ0FBakQ7QUFDQSxJQUFNLDBDQUE4QyxJQUFBLGNBQUEsQ0FBcEQsSUFBb0QsQ0FBcEQ7QUFDQSxJQUFNLDRDQUErQyxJQUFBLGNBQUEsQ0FBckQsS0FBcUQsQ0FBckQ7QUFFUCxJQUFBLHNEQUFBLFlBQUE7QUFHRSxhQUFBLG9CQUFBLENBQUEsS0FBQSxFQUU2RDtBQUFBLFlBQW5ELFNBQW1ELFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FGN0QsYUFFNkQ7O0FBQUEsd0JBQUEsSUFBQSxFQUFBLG9CQUFBOztBQURuRCxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQUEsTUFBQTtBQUVSLGFBQUEsR0FBQSxHQUFXLE1BQVgsR0FBQTtBQUNEOztBQVJILHlCQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxLQUFBLEdBVU87QUFDSCxlQUFPLEtBQUEsTUFBQSxDQUFZLEtBQUEsS0FBQSxDQUFuQixLQUFtQixFQUFaLENBQVA7QUFYSixLQUFBOztBQUFBLFdBQUEsb0JBQUE7QUFBQSxDQUFBLEVBQUE7QUFlQSxTQUFBLGFBQUEsQ0FBQSxLQUFBLEVBQXFDO0FBQ25DLFdBQU8sQ0FBQyxDQUFSLEtBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wdGlvbiwgUmVjYXN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBDb25zdFJlZmVyZW5jZSwgUGF0aFJlZmVyZW5jZSwgUmVmZXJlbmNlLCBUYWcgfSBmcm9tICdAZ2xpbW1lci9yZWZlcmVuY2UnO1xuXG5leHBvcnQgdHlwZSBQcmltaXRpdmUgPSB1bmRlZmluZWQgfCBudWxsIHwgYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZztcblxuZXhwb3J0IGNsYXNzIFByaW1pdGl2ZVJlZmVyZW5jZTxUIGV4dGVuZHMgUHJpbWl0aXZlPiBleHRlbmRzIENvbnN0UmVmZXJlbmNlPFQ+XG4gIGltcGxlbWVudHMgUGF0aFJlZmVyZW5jZTxUPiB7XG4gIHN0YXRpYyBjcmVhdGU8VCBleHRlbmRzIFByaW1pdGl2ZT4odmFsdWU6IFQpOiBQcmltaXRpdmVSZWZlcmVuY2U8VD4ge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gVU5ERUZJTkVEX1JFRkVSRU5DRSBhcyBQcmltaXRpdmVSZWZlcmVuY2U8VD47XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIE5VTExfUkVGRVJFTkNFIGFzIFByaW1pdGl2ZVJlZmVyZW5jZTxUPjtcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gVFJVRV9SRUZFUkVOQ0UgYXMgUHJpbWl0aXZlUmVmZXJlbmNlPFQ+O1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gRkFMU0VfUkVGRVJFTkNFIGFzIFByaW1pdGl2ZVJlZmVyZW5jZTxUPjtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiBuZXcgVmFsdWVSZWZlcmVuY2UodmFsdWUpIGFzIFByaW1pdGl2ZVJlZmVyZW5jZTxUPjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBTdHJpbmdSZWZlcmVuY2UodmFsdWUgYXMgc3RyaW5nKSBhcyBSZWNhc3Q8U3RyaW5nUmVmZXJlbmNlLCBQcmltaXRpdmVSZWZlcmVuY2U8VD4+O1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3Rvcih2YWx1ZTogVCkge1xuICAgIHN1cGVyKHZhbHVlKTtcbiAgfVxuXG4gIGdldChfa2V5OiBzdHJpbmcpOiBQcmltaXRpdmVSZWZlcmVuY2U8UHJpbWl0aXZlPiB7XG4gICAgcmV0dXJuIFVOREVGSU5FRF9SRUZFUkVOQ0U7XG4gIH1cbn1cblxuY2xhc3MgU3RyaW5nUmVmZXJlbmNlIGV4dGVuZHMgUHJpbWl0aXZlUmVmZXJlbmNlPHN0cmluZz4ge1xuICBwcml2YXRlIGxlbmd0aFJlZmVyZW5jZTogT3B0aW9uPFByaW1pdGl2ZVJlZmVyZW5jZTxudW1iZXI+PiA9IG51bGw7XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogUHJpbWl0aXZlUmVmZXJlbmNlPFByaW1pdGl2ZT4ge1xuICAgIGlmIChrZXkgPT09ICdsZW5ndGgnKSB7XG4gICAgICBsZXQgeyBsZW5ndGhSZWZlcmVuY2UgfSA9IHRoaXM7XG5cbiAgICAgIGlmIChsZW5ndGhSZWZlcmVuY2UgPT09IG51bGwpIHtcbiAgICAgICAgbGVuZ3RoUmVmZXJlbmNlID0gdGhpcy5sZW5ndGhSZWZlcmVuY2UgPSBuZXcgVmFsdWVSZWZlcmVuY2UodGhpcy5pbm5lci5sZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGVuZ3RoUmVmZXJlbmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuZ2V0KGtleSk7XG4gICAgfVxuICB9XG59XG5cbnR5cGUgVmFsdWUgPSB1bmRlZmluZWQgfCBudWxsIHwgbnVtYmVyIHwgYm9vbGVhbjtcblxuY2xhc3MgVmFsdWVSZWZlcmVuY2U8VCBleHRlbmRzIFZhbHVlPiBleHRlbmRzIFByaW1pdGl2ZVJlZmVyZW5jZTxUPiB7XG4gIGNvbnN0cnVjdG9yKHZhbHVlOiBUKSB7XG4gICAgc3VwZXIodmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBVTkRFRklORURfUkVGRVJFTkNFOiBQcmltaXRpdmVSZWZlcmVuY2U8dW5kZWZpbmVkPiA9IG5ldyBWYWx1ZVJlZmVyZW5jZSh1bmRlZmluZWQpO1xuZXhwb3J0IGNvbnN0IE5VTExfUkVGRVJFTkNFOiBQcmltaXRpdmVSZWZlcmVuY2U8bnVsbD4gPSBuZXcgVmFsdWVSZWZlcmVuY2UobnVsbCk7XG5leHBvcnQgY29uc3QgVFJVRV9SRUZFUkVOQ0U6IFByaW1pdGl2ZVJlZmVyZW5jZTxib29sZWFuPiA9IG5ldyBWYWx1ZVJlZmVyZW5jZSh0cnVlKTtcbmV4cG9ydCBjb25zdCBGQUxTRV9SRUZFUkVOQ0U6IFByaW1pdGl2ZVJlZmVyZW5jZTxib29sZWFuPiA9IG5ldyBWYWx1ZVJlZmVyZW5jZShmYWxzZSk7XG5cbmV4cG9ydCBjbGFzcyBDb25kaXRpb25hbFJlZmVyZW5jZSBpbXBsZW1lbnRzIFJlZmVyZW5jZTxib29sZWFuPiB7XG4gIHB1YmxpYyB0YWc6IFRhZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGlubmVyOiBSZWZlcmVuY2U8dW5rbm93bj4sXG4gICAgcHJpdmF0ZSB0b0Jvb2w6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbiA9IGRlZmF1bHRUb0Jvb2xcbiAgKSB7XG4gICAgdGhpcy50YWcgPSBpbm5lci50YWc7XG4gIH1cblxuICB2YWx1ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy50b0Jvb2wodGhpcy5pbm5lci52YWx1ZSgpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZhdWx0VG9Cb29sKHZhbHVlOiB1bmtub3duKSB7XG4gIHJldHVybiAhIXZhbHVlO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==