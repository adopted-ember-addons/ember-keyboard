'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.map = map;

var _validators = require('./validators');

var _property = require('./property');

var _autotrack = require('./autotrack');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function map(input, callback) {
    return new MapReference(input, callback);
}

var MapReference = function () {
    function MapReference(inner, callback) {
        _classCallCheck(this, MapReference);

        this.inner = inner;
        this.callback = callback;
        this.updatable = (0, _validators.createUpdatableTag)();
        this.tag = (0, _validators.combine)([inner.tag, this.updatable]);
    }

    MapReference.prototype.value = function value() {
        var inner = this.inner,
            callback = this.callback;

        var old = (0, _autotrack.pushTrackFrame)();
        var ret = callback(inner.value());
        var tag = (0, _autotrack.popTrackFrame)(old);
        (0, _validators.update)(this.updatable, tag);
        return ret;
    };

    MapReference.prototype.get = function get(key) {
        return (0, _property.property)(this, key);
    };

    return MapReference;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvY29tYmluYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUFLTSxHLEdBQUEsRzs7QUFMTjs7QUFDQTs7QUFFQTs7Ozs7Ozs7QUFFTSxTQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUVxQjtBQUV6QixXQUFPLElBQUEsWUFBQSxDQUFBLEtBQUEsRUFBUCxRQUFPLENBQVA7QUFDRDs7SUFFRCxlO0FBSUUsYUFBQSxZQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBdUY7QUFBQSx3QkFBQSxJQUFBLEVBQUEsWUFBQTs7QUFBbkUsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUEwQyxhQUFBLFFBQUEsR0FBQSxRQUFBO0FBRnJELGFBQUEsU0FBQSxHQUFBLHFDQUFBO0FBR1AsYUFBQSxHQUFBLEdBQVcseUJBQVEsQ0FBQyxNQUFELEdBQUEsRUFBWSxLQUEvQixTQUFtQixDQUFSLENBQVg7QUFDRDs7MkJBRUQsSyxvQkFBSztBQUFBLFlBQUEsUUFBQSxLQUFBLEtBQUE7QUFBQSxZQUFBLFdBQUEsS0FBQSxRQUFBOztBQUdILFlBQUksTUFBSixnQ0FBQTtBQUNBLFlBQUksTUFBTSxTQUFTLE1BQW5CLEtBQW1CLEVBQVQsQ0FBVjtBQUNBLFlBQUksTUFBTSw4QkFBVixHQUFVLENBQVY7QUFDQSxnQ0FBTyxLQUFQLFNBQUEsRUFBQSxHQUFBO0FBRUEsZUFBQSxHQUFBOzs7MkJBR0YsRyxnQkFBQSxHLEVBQWU7QUFDYixlQUFPLHdCQUFBLElBQUEsRUFBUCxHQUFPLENBQVAiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUYWcsIGNyZWF0ZVVwZGF0YWJsZVRhZywgY29tYmluZSwgdXBkYXRlIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IHByb3BlcnR5IH0gZnJvbSAnLi9wcm9wZXJ0eSc7XG5pbXBvcnQgeyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIH0gZnJvbSAnLi9yZWZlcmVuY2UnO1xuaW1wb3J0IHsgcHVzaFRyYWNrRnJhbWUsIHBvcFRyYWNrRnJhbWUgfSBmcm9tICcuL2F1dG90cmFjayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXA8VCwgVT4oXG4gIGlucHV0OiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+LFxuICBjYWxsYmFjazogKHZhbHVlOiBUKSA9PiBVXG4pOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFU+IHtcbiAgcmV0dXJuIG5ldyBNYXBSZWZlcmVuY2UoaW5wdXQsIGNhbGxiYWNrKTtcbn1cblxuY2xhc3MgTWFwUmVmZXJlbmNlPFQsIFU+IGltcGxlbWVudHMgVmVyc2lvbmVkUGF0aFJlZmVyZW5jZTxVPiB7XG4gIHJlYWRvbmx5IHRhZzogVGFnO1xuICByZWFkb25seSB1cGRhdGFibGUgPSBjcmVhdGVVcGRhdGFibGVUYWcoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGlubmVyOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFQ+LCBwcml2YXRlIGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IFUpIHtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmUoW2lubmVyLnRhZywgdGhpcy51cGRhdGFibGVdKTtcbiAgfVxuXG4gIHZhbHVlKCk6IFUge1xuICAgIGxldCB7IGlubmVyLCBjYWxsYmFjayB9ID0gdGhpcztcblxuICAgIGxldCBvbGQgPSBwdXNoVHJhY2tGcmFtZSgpO1xuICAgIGxldCByZXQgPSBjYWxsYmFjayhpbm5lci52YWx1ZSgpKTtcbiAgICBsZXQgdGFnID0gcG9wVHJhY2tGcmFtZShvbGQpO1xuICAgIHVwZGF0ZSh0aGlzLnVwZGF0YWJsZSwgdGFnKTtcblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlIHtcbiAgICByZXR1cm4gcHJvcGVydHkodGhpcywga2V5KTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==