function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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

export { Path as default };

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHJhdmVyc2FsL3BhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUVjLEk7QUFLWixnQkFBQSxJQUFBLEVBQXFCLE1BQXJCLEVBQXVELFNBQXZELEVBQXNGO0FBQUEsUUFBakUsTUFBaUU7QUFBakUsTUFBQSxNQUFpRSxHQUF0RixJQUFzRjtBQUFBOztBQUFBLFFBQS9CLFNBQStCO0FBQS9CLE1BQUEsU0FBK0IsR0FBdEYsSUFBc0Y7QUFBQTs7QUFDcEYsU0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLFNBQUEsTUFBQSxHQUFBLE1BQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxTQUFBO0FBQ0Q7Ozs7U0FNRCxPLEdBQUEsbUJBQU87QUFBQTtBQUFBOztBQUNMLDJCQUNHLE1BQU0sQ0FBUCxRQURGLElBQ3FCLFlBQUs7QUFDdEIsYUFBTyxJQUFBLG1CQUFBLENBQVAsS0FBTyxDQUFQO0FBQ0QsS0FISDtBQUtELEc7Ozs7d0JBVmE7QUFDWixhQUFPLEtBQUEsTUFBQSxHQUFjLEtBQUEsTUFBQSxDQUFkLElBQUEsR0FBUCxJQUFBO0FBQ0Q7Ozs7OztTQWJXLEk7O0lBd0JkLG1CO0FBR0UsK0JBQUEsSUFBQSxFQUE0QjtBQUMxQixTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0Q7Ozs7VUFFRCxJLEdBQUEsZ0JBQUk7QUFDRixRQUFJLEtBQUEsSUFBQSxDQUFKLE1BQUEsRUFBc0I7QUFDcEIsV0FBQSxJQUFBLEdBQVksS0FBQSxJQUFBLENBQVosTUFBQTtBQUNBLGFBQU87QUFBRSxRQUFBLElBQUksRUFBTixLQUFBO0FBQWUsUUFBQSxLQUFLLEVBQUUsS0FBSztBQUEzQixPQUFQO0FBRkYsS0FBQSxNQUdPO0FBQ0wsYUFBTztBQUFFLFFBQUEsSUFBSSxFQUFOLElBQUE7QUFBYyxRQUFBLEtBQUssRUFBRTtBQUFyQixPQUFQO0FBQ0Q7QUFDRixHIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uL3R5cGVzL25vZGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0aDxOIGV4dGVuZHMgTm9kZT4ge1xuICBub2RlOiBOO1xuICBwYXJlbnQ6IFBhdGg8Tm9kZT4gfCBudWxsO1xuICBwYXJlbnRLZXk6IHN0cmluZyB8IG51bGw7XG5cbiAgY29uc3RydWN0b3Iobm9kZTogTiwgcGFyZW50OiBQYXRoPE5vZGU+IHwgbnVsbCA9IG51bGwsIHBhcmVudEtleTogc3RyaW5nIHwgbnVsbCA9IG51bGwpIHtcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMucGFyZW50S2V5ID0gcGFyZW50S2V5O1xuICB9XG5cbiAgZ2V0IHBhcmVudE5vZGUoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50Lm5vZGUgOiBudWxsO1xuICB9XG5cbiAgcGFyZW50cygpOiBJdGVyYWJsZTxQYXRoPE5vZGU+IHwgbnVsbD4ge1xuICAgIHJldHVybiB7XG4gICAgICBbU3ltYm9sLml0ZXJhdG9yXTogKCkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFBhdGhQYXJlbnRzSXRlcmF0b3IodGhpcyk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cblxuY2xhc3MgUGF0aFBhcmVudHNJdGVyYXRvciBpbXBsZW1lbnRzIEl0ZXJhdG9yPFBhdGg8Tm9kZT4gfCBudWxsPiB7XG4gIHBhdGg6IFBhdGg8Tm9kZT47XG5cbiAgY29uc3RydWN0b3IocGF0aDogUGF0aDxOb2RlPikge1xuICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gIH1cblxuICBuZXh0KCkge1xuICAgIGlmICh0aGlzLnBhdGgucGFyZW50KSB7XG4gICAgICB0aGlzLnBhdGggPSB0aGlzLnBhdGgucGFyZW50O1xuICAgICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiB0aGlzLnBhdGggfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG51bGwgfTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=