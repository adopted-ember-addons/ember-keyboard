function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { ConstReference } from '@glimmer/reference';
export var PrimitiveReference = function (_ConstReference) {
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
}(ConstReference);

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

export var UNDEFINED_REFERENCE = new ValueReference(undefined);
export var NULL_REFERENCE = new ValueReference(null);
export var TRUE_REFERENCE = new ValueReference(true);
export var FALSE_REFERENCE = new ValueReference(false);
export var ConditionalReference = function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQSxTQUFBLGNBQUEsUUFBQSxvQkFBQTtBQUlBLFdBQU0sa0JBQU47QUFBQTs7QUFrQkUsZ0NBQUEsS0FBQSxFQUE4QjtBQUFBOztBQUFBLGdEQUM1QiwyQkFBQSxLQUFBLENBRDRCO0FBRTdCOztBQXBCSCx1QkFFRSxNQUZGLG1CQUVFLEtBRkYsRUFFNkM7QUFDekMsWUFBSSxVQUFKLFNBQUEsRUFBeUI7QUFDdkIsbUJBQUEsbUJBQUE7QUFERixTQUFBLE1BRU8sSUFBSSxVQUFKLElBQUEsRUFBb0I7QUFDekIsbUJBQUEsY0FBQTtBQURLLFNBQUEsTUFFQSxJQUFJLFVBQUosSUFBQSxFQUFvQjtBQUN6QixtQkFBQSxjQUFBO0FBREssU0FBQSxNQUVBLElBQUksVUFBSixLQUFBLEVBQXFCO0FBQzFCLG1CQUFBLGVBQUE7QUFESyxTQUFBLE1BRUEsSUFBSSxPQUFBLEtBQUEsS0FBSixRQUFBLEVBQStCO0FBQ3BDLG1CQUFPLElBQUEsY0FBQSxDQUFQLEtBQU8sQ0FBUDtBQURLLFNBQUEsTUFFQTtBQUNMLG1CQUFPLElBQUEsZUFBQSxDQUFQLEtBQU8sQ0FBUDtBQUNEO0FBQ0YsS0FoQkg7O0FBQUEsaUNBc0JFLEdBdEJGLGdCQXNCRSxJQXRCRixFQXNCa0I7QUFDZCxlQUFBLG1CQUFBO0FBQ0QsS0F4Qkg7O0FBQUE7QUFBQSxFQUFNLGNBQU47O0lBMkJBLGU7OztBQUFBLCtCQUFBO0FBQUE7O0FBQUEsc0QsMENBQUE7O0FBQ1UsZUFBQSxlQUFBLEdBQUEsSUFBQTtBQURWO0FBZ0JDOzs4QkFiQyxHLGdCQUFBLEcsRUFBZTtBQUNiLFlBQUksUUFBSixRQUFBLEVBQXNCO0FBQUEsZ0JBQ2hCLGVBRGdCLEdBQ3BCLElBRG9CLENBQ2hCLGVBRGdCOztBQUdwQixnQkFBSSxvQkFBSixJQUFBLEVBQThCO0FBQzVCLGtDQUFrQixLQUFBLGVBQUEsR0FBdUIsSUFBQSxjQUFBLENBQW1CLEtBQUEsS0FBQSxDQUE1RCxNQUF5QyxDQUF6QztBQUNEO0FBRUQsbUJBQUEsZUFBQTtBQVBGLFNBQUEsTUFRTztBQUNMLG1CQUFPLDhCQUFBLEdBQUEsWUFBUCxHQUFPLENBQVA7QUFDRDtBQUNGLEs7OztFQWZILGtCOztJQW9CQSxjOzs7QUFDRSw0QkFBQSxLQUFBLEVBQW9CO0FBQUE7O0FBQUEsZ0RBQ2xCLGdDQUFBLEtBQUEsQ0FEa0I7QUFFbkI7OztFQUhILGtCOztBQU1BLE9BQU8sSUFBTSxzQkFBcUQsSUFBQSxjQUFBLENBQTNELFNBQTJELENBQTNEO0FBQ1AsT0FBTyxJQUFNLGlCQUEyQyxJQUFBLGNBQUEsQ0FBakQsSUFBaUQsQ0FBakQ7QUFDUCxPQUFPLElBQU0saUJBQThDLElBQUEsY0FBQSxDQUFwRCxJQUFvRCxDQUFwRDtBQUNQLE9BQU8sSUFBTSxrQkFBK0MsSUFBQSxjQUFBLENBQXJELEtBQXFELENBQXJEO0FBRVAsV0FBTSxvQkFBTjtBQUdFLGtDQUFBLEtBQUEsRUFFNkQ7QUFBQSxZQUFuRCxNQUFtRCx1RUFGN0QsYUFFNkQ7O0FBQUE7O0FBRG5ELGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxhQUFBLE1BQUEsR0FBQSxNQUFBO0FBRVIsYUFBQSxHQUFBLEdBQVcsTUFBWCxHQUFBO0FBQ0Q7O0FBUkgsbUNBVUUsS0FWRixvQkFVTztBQUNILGVBQU8sS0FBQSxNQUFBLENBQVksS0FBQSxLQUFBLENBQW5CLEtBQW1CLEVBQVosQ0FBUDtBQUNELEtBWkg7O0FBQUE7QUFBQTtBQWVBLFNBQUEsYUFBQSxDQUFBLEtBQUEsRUFBcUM7QUFDbkMsV0FBTyxDQUFDLENBQVIsS0FBQTtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3B0aW9uLCBSZWNhc3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IENvbnN0UmVmZXJlbmNlLCBQYXRoUmVmZXJlbmNlLCBSZWZlcmVuY2UsIFRhZyB9IGZyb20gJ0BnbGltbWVyL3JlZmVyZW5jZSc7XG5cbmV4cG9ydCB0eXBlIFByaW1pdGl2ZSA9IHVuZGVmaW5lZCB8IG51bGwgfCBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nO1xuXG5leHBvcnQgY2xhc3MgUHJpbWl0aXZlUmVmZXJlbmNlPFQgZXh0ZW5kcyBQcmltaXRpdmU+IGV4dGVuZHMgQ29uc3RSZWZlcmVuY2U8VD5cbiAgaW1wbGVtZW50cyBQYXRoUmVmZXJlbmNlPFQ+IHtcbiAgc3RhdGljIGNyZWF0ZTxUIGV4dGVuZHMgUHJpbWl0aXZlPih2YWx1ZTogVCk6IFByaW1pdGl2ZVJlZmVyZW5jZTxUPiB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBVTkRFRklORURfUkVGRVJFTkNFIGFzIFByaW1pdGl2ZVJlZmVyZW5jZTxUPjtcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gTlVMTF9SRUZFUkVOQ0UgYXMgUHJpbWl0aXZlUmVmZXJlbmNlPFQ+O1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBUUlVFX1JFRkVSRU5DRSBhcyBQcmltaXRpdmVSZWZlcmVuY2U8VD47XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBGQUxTRV9SRUZFUkVOQ0UgYXMgUHJpbWl0aXZlUmVmZXJlbmNlPFQ+O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIG5ldyBWYWx1ZVJlZmVyZW5jZSh2YWx1ZSkgYXMgUHJpbWl0aXZlUmVmZXJlbmNlPFQ+O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFN0cmluZ1JlZmVyZW5jZSh2YWx1ZSBhcyBzdHJpbmcpIGFzIFJlY2FzdDxTdHJpbmdSZWZlcmVuY2UsIFByaW1pdGl2ZVJlZmVyZW5jZTxUPj47XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHZhbHVlOiBUKSB7XG4gICAgc3VwZXIodmFsdWUpO1xuICB9XG5cbiAgZ2V0KF9rZXk6IHN0cmluZyk6IFByaW1pdGl2ZVJlZmVyZW5jZTxQcmltaXRpdmU+IHtcbiAgICByZXR1cm4gVU5ERUZJTkVEX1JFRkVSRU5DRTtcbiAgfVxufVxuXG5jbGFzcyBTdHJpbmdSZWZlcmVuY2UgZXh0ZW5kcyBQcmltaXRpdmVSZWZlcmVuY2U8c3RyaW5nPiB7XG4gIHByaXZhdGUgbGVuZ3RoUmVmZXJlbmNlOiBPcHRpb248UHJpbWl0aXZlUmVmZXJlbmNlPG51bWJlcj4+ID0gbnVsbDtcblxuICBnZXQoa2V5OiBzdHJpbmcpOiBQcmltaXRpdmVSZWZlcmVuY2U8UHJpbWl0aXZlPiB7XG4gICAgaWYgKGtleSA9PT0gJ2xlbmd0aCcpIHtcbiAgICAgIGxldCB7IGxlbmd0aFJlZmVyZW5jZSB9ID0gdGhpcztcblxuICAgICAgaWYgKGxlbmd0aFJlZmVyZW5jZSA9PT0gbnVsbCkge1xuICAgICAgICBsZW5ndGhSZWZlcmVuY2UgPSB0aGlzLmxlbmd0aFJlZmVyZW5jZSA9IG5ldyBWYWx1ZVJlZmVyZW5jZSh0aGlzLmlubmVyLmxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsZW5ndGhSZWZlcmVuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci5nZXQoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxudHlwZSBWYWx1ZSA9IHVuZGVmaW5lZCB8IG51bGwgfCBudW1iZXIgfCBib29sZWFuO1xuXG5jbGFzcyBWYWx1ZVJlZmVyZW5jZTxUIGV4dGVuZHMgVmFsdWU+IGV4dGVuZHMgUHJpbWl0aXZlUmVmZXJlbmNlPFQ+IHtcbiAgY29uc3RydWN0b3IodmFsdWU6IFQpIHtcbiAgICBzdXBlcih2YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFVOREVGSU5FRF9SRUZFUkVOQ0U6IFByaW1pdGl2ZVJlZmVyZW5jZTx1bmRlZmluZWQ+ID0gbmV3IFZhbHVlUmVmZXJlbmNlKHVuZGVmaW5lZCk7XG5leHBvcnQgY29uc3QgTlVMTF9SRUZFUkVOQ0U6IFByaW1pdGl2ZVJlZmVyZW5jZTxudWxsPiA9IG5ldyBWYWx1ZVJlZmVyZW5jZShudWxsKTtcbmV4cG9ydCBjb25zdCBUUlVFX1JFRkVSRU5DRTogUHJpbWl0aXZlUmVmZXJlbmNlPGJvb2xlYW4+ID0gbmV3IFZhbHVlUmVmZXJlbmNlKHRydWUpO1xuZXhwb3J0IGNvbnN0IEZBTFNFX1JFRkVSRU5DRTogUHJpbWl0aXZlUmVmZXJlbmNlPGJvb2xlYW4+ID0gbmV3IFZhbHVlUmVmZXJlbmNlKGZhbHNlKTtcblxuZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsUmVmZXJlbmNlIGltcGxlbWVudHMgUmVmZXJlbmNlPGJvb2xlYW4+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaW5uZXI6IFJlZmVyZW5jZTx1bmtub3duPixcbiAgICBwcml2YXRlIHRvQm9vbDogKHZhbHVlOiB1bmtub3duKSA9PiBib29sZWFuID0gZGVmYXVsdFRvQm9vbFxuICApIHtcbiAgICB0aGlzLnRhZyA9IGlubmVyLnRhZztcbiAgfVxuXG4gIHZhbHVlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRvQm9vbCh0aGlzLmlubmVyLnZhbHVlKCkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRUb0Jvb2wodmFsdWU6IHVua25vd24pIHtcbiAgcmV0dXJuICEhdmFsdWU7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9