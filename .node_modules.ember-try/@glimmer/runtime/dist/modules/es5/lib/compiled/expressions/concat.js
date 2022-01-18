function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { CachedReference, combineTagged } from '@glimmer/reference';
export var ConcatReference = function (_CachedReference) {
    _inherits(ConcatReference, _CachedReference);

    function ConcatReference(parts) {
        _classCallCheck(this, ConcatReference);

        var _this = _possibleConstructorReturn(this, _CachedReference.call(this));

        _this.parts = parts;
        _this.tag = combineTagged(parts);
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
}(CachedReference);
function castToString(value) {
    if (typeof value.toString !== 'function') {
        return '';
    }
    return String(value);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2NvbXBpbGVkL2V4cHJlc3Npb25zL2NvbmNhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBLFNBQUEsZUFBQSxFQUFBLGFBQUEsUUFBQSxvQkFBQTtBQUVBLFdBQU0sZUFBTjtBQUFBOztBQUdFLDZCQUFBLEtBQUEsRUFBd0Q7QUFBQTs7QUFBQSxxREFDdEQsMkJBRHNEOztBQUFwQyxjQUFBLEtBQUEsR0FBQSxLQUFBO0FBRWxCLGNBQUEsR0FBQSxHQUFXLGNBQVgsS0FBVyxDQUFYO0FBRnNEO0FBR3ZEOztBQU5ILDhCQVFZLE9BUlosc0JBUW1CO0FBQ2YsWUFBSSxRQUFRLElBQVosS0FBWSxFQUFaO0FBRUEsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLEtBQUEsS0FBQSxDQUFwQixNQUFBLEVBQUEsR0FBQSxFQUE0QztBQUMxQyxnQkFBSSxRQUFRLEtBQUEsS0FBQSxDQUFBLENBQUEsRUFBWixLQUFZLEVBQVo7QUFFQSxnQkFBSSxVQUFBLElBQUEsSUFBa0IsVUFBdEIsU0FBQSxFQUEyQztBQUN6QyxzQkFBQSxDQUFBLElBQVcsYUFBWCxLQUFXLENBQVg7QUFDRDtBQUNGO0FBRUQsWUFBSSxNQUFBLE1BQUEsR0FBSixDQUFBLEVBQXNCO0FBQ3BCLG1CQUFPLE1BQUEsSUFBQSxDQUFQLEVBQU8sQ0FBUDtBQUNEO0FBRUQsZUFBQSxJQUFBO0FBQ0QsS0F4Qkg7O0FBQUE7QUFBQSxFQUFNLGVBQU47QUEyQkEsU0FBQSxZQUFBLENBQUEsS0FBQSxFQUFpQztBQUMvQixRQUFJLE9BQU8sTUFBUCxRQUFBLEtBQUosVUFBQSxFQUEwQztBQUN4QyxlQUFBLEVBQUE7QUFDRDtBQUVELFdBQU8sT0FBUCxLQUFPLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wdGlvbiwgRGljdCwgTWF5YmUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IENhY2hlZFJlZmVyZW5jZSwgY29tYmluZVRhZ2dlZCwgUGF0aFJlZmVyZW5jZSwgVGFnIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcblxuZXhwb3J0IGNsYXNzIENvbmNhdFJlZmVyZW5jZSBleHRlbmRzIENhY2hlZFJlZmVyZW5jZTxPcHRpb248c3RyaW5nPj4ge1xuICBwdWJsaWMgdGFnOiBUYWc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJ0czogQXJyYXk8UGF0aFJlZmVyZW5jZTx1bmtub3duPj4pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudGFnID0gY29tYmluZVRhZ2dlZChwYXJ0cyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY29tcHV0ZSgpOiBPcHRpb248c3RyaW5nPiB7XG4gICAgbGV0IHBhcnRzID0gbmV3IEFycmF5PHN0cmluZz4oKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5wYXJ0c1tpXS52YWx1ZSgpIGFzIE1heWJlPERpY3Q+O1xuXG4gICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYXJ0c1tpXSA9IGNhc3RUb1N0cmluZyh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBwYXJ0cy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYXN0VG9TdHJpbmcodmFsdWU6IERpY3QpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZS50b1N0cmluZyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHJldHVybiBTdHJpbmcodmFsdWUpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==