"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Path = /*#__PURE__*/function () {
  function Path(node, parent, parentKey) {
    if (parent === void 0) {
      parent = null;
    }

    if (parentKey === void 0) {
      parentKey = null;
    }

    this.node = node;
    this.parent = parent;
    this.parentKey = parentKey;
  }

  var _proto = Path.prototype;

  _proto.parents = function parents() {
    var _this = this,
        _ref;

    return _ref = {}, _ref[Symbol.iterator] = function () {
      return new PathParentsIterator(_this);
    }, _ref;
  };

  _createClass(Path, [{
    key: "parentNode",
    get: function get() {
      return this.parent ? this.parent.node : null;
    }
  }]);

  return Path;
}();

exports.default = Path;

var PathParentsIterator = /*#__PURE__*/function () {
  function PathParentsIterator(path) {
    this.path = path;
  }

  var _proto2 = PathParentsIterator.prototype;

  _proto2.next = function next() {
    if (this.path.parent) {
      this.path = this.path.parent;
      return {
        done: false,
        value: this.path
      };
    } else {
      return {
        done: true,
        value: null
      };
    }
  };

  return PathParentsIterator;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHJhdmVyc2FsL3BhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFYyxJO0FBS1osV0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQXNGO0FBQUEsUUFBakUsTUFBaUUsS0FBQSxLQUFBLENBQUEsRUFBQTtBQUFqRSxNQUFBLE1BQWlFLEdBQXRGLElBQXFCO0FBQWlFOztBQUFBLFFBQS9CLFNBQStCLEtBQUEsS0FBQSxDQUFBLEVBQUE7QUFBL0IsTUFBQSxTQUErQixHQUF0RixJQUF1RDtBQUErQjs7QUFDcEYsU0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLFNBQUEsTUFBQSxHQUFBLE1BQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxTQUFBO0FBQ0Q7Ozs7U0FNRCxPLEdBQUEsU0FBQSxPQUFBLEdBQU87QUFBQSxRQUFBLEtBQUEsR0FBQSxJQUFBO0FBQUEsUUFBQSxJQUFBOztBQUNMLFdBQUEsSUFBQSxHQUFBLEVBQUEsRUFBQSxJQUFBLENBQ0csTUFBTSxDQURULFFBQUEsQ0FBQSxHQUNxQixZQUFLO0FBQ3RCLGFBQU8sSUFBQSxtQkFBQSxDQUFQLEtBQU8sQ0FBUDtBQUZKLEtBQUEsRUFBQSxJQUFBOzs7Ozt3QkFMWTtBQUNaLGFBQU8sS0FBQSxNQUFBLEdBQWMsS0FBQSxNQUFBLENBQWQsSUFBQSxHQUFQLElBQUE7QUFDRDs7Ozs7Ozs7SUFXSCxtQjtBQUdFLFdBQUEsbUJBQUEsQ0FBQSxJQUFBLEVBQTRCO0FBQzFCLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFDRDs7OztVQUVELEksR0FBQSxTQUFBLElBQUEsR0FBSTtBQUNGLFFBQUksS0FBQSxJQUFBLENBQUosTUFBQSxFQUFzQjtBQUNwQixXQUFBLElBQUEsR0FBWSxLQUFBLElBQUEsQ0FBWixNQUFBO0FBQ0EsYUFBTztBQUFFLFFBQUEsSUFBSSxFQUFOLEtBQUE7QUFBZSxRQUFBLEtBQUssRUFBRSxLQUFLO0FBQTNCLE9BQVA7QUFGRixLQUFBLE1BR087QUFDTCxhQUFPO0FBQUUsUUFBQSxJQUFJLEVBQU4sSUFBQTtBQUFjLFFBQUEsS0FBSyxFQUFFO0FBQXJCLE9BQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGg8TiBleHRlbmRzIE5vZGU+IHtcbiAgbm9kZTogTjtcbiAgcGFyZW50OiBQYXRoPE5vZGU+IHwgbnVsbDtcbiAgcGFyZW50S2V5OiBzdHJpbmcgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKG5vZGU6IE4sIHBhcmVudDogUGF0aDxOb2RlPiB8IG51bGwgPSBudWxsLCBwYXJlbnRLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsKSB7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLnBhcmVudEtleSA9IHBhcmVudEtleTtcbiAgfVxuXG4gIGdldCBwYXJlbnROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5ub2RlIDogbnVsbDtcbiAgfVxuXG4gIHBhcmVudHMoKTogSXRlcmFibGU8UGF0aDxOb2RlPiB8IG51bGw+IHtcbiAgICByZXR1cm4ge1xuICAgICAgW1N5bWJvbC5pdGVyYXRvcl06ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoUGFyZW50c0l0ZXJhdG9yKHRoaXMpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG59XG5cbmNsYXNzIFBhdGhQYXJlbnRzSXRlcmF0b3IgaW1wbGVtZW50cyBJdGVyYXRvcjxQYXRoPE5vZGU+IHwgbnVsbD4ge1xuICBwYXRoOiBQYXRoPE5vZGU+O1xuXG4gIGNvbnN0cnVjdG9yKHBhdGg6IFBhdGg8Tm9kZT4pIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICB9XG5cbiAgbmV4dCgpIHtcbiAgICBpZiAodGhpcy5wYXRoLnBhcmVudCkge1xuICAgICAgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnBhcmVudDtcbiAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdGhpcy5wYXRoIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBudWxsIH07XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9