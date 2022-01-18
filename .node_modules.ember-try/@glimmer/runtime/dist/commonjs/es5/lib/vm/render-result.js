'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('@glimmer/util');

var _bounds = require('../bounds');

var _environment = require('../environment');

var _lifetime = require('../lifetime');

var _update = require('./update');

var _update2 = _interopRequireDefault(_update);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var RenderResultImpl = function () {
    function RenderResultImpl(env, updating, bounds, drop) {
        _classCallCheck(this, RenderResultImpl);

        this.env = env;
        this.updating = updating;
        this.bounds = bounds;
        this.drop = drop;
        (0, _util.associate)(this, drop);
    }

    RenderResultImpl.prototype.rerender = function rerender() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { alwaysRevalidate: false },
            _ref$alwaysRevalidate = _ref.alwaysRevalidate,
            alwaysRevalidate = _ref$alwaysRevalidate === undefined ? false : _ref$alwaysRevalidate;

        var env = this.env,
            updating = this.updating;

        var vm = new _update2.default(env, { alwaysRevalidate: alwaysRevalidate });
        vm.execute(updating, this);
    };

    RenderResultImpl.prototype.parentElement = function parentElement() {
        return this.bounds.parentElement();
    };

    RenderResultImpl.prototype.firstNode = function firstNode() {
        return this.bounds.firstNode();
    };

    RenderResultImpl.prototype.lastNode = function lastNode() {
        return this.bounds.lastNode();
    };

    RenderResultImpl.prototype.handleException = function handleException() {
        throw 'this should never happen';
    };

    RenderResultImpl.prototype[_util.DESTROY] = function () {
        (0, _bounds.clear)(this.bounds);
    };
    // compat, as this is a user-exposed API


    RenderResultImpl.prototype.destroy = function destroy() {
        var _this = this;

        (0, _environment.inTransaction)(this.env, function () {
            return (0, _lifetime.asyncDestroy)(_this, _this.env);
        });
    };

    return RenderResultImpl;
}();

exports.default = RenderResultImpl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3ZtL3JlbmRlci1yZXN1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztJQUVjLG1CO0FBQ1osYUFBQSxnQkFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFJdUI7QUFBQSx3QkFBQSxJQUFBLEVBQUEsZ0JBQUE7O0FBSGQsYUFBQSxHQUFBLEdBQUEsR0FBQTtBQUNDLGFBQUEsUUFBQSxHQUFBLFFBQUE7QUFDQSxhQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0MsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUVULDZCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0Q7OytCQUVELFEsdUJBQW1FO0FBQUEsWUFBQSxPQUFBLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FBM0IsRUFBRSxrQkFBMUMsS0FBd0MsRUFBMkI7QUFBQSxZQUFBLHdCQUFBLEtBQXhELGdCQUF3RDtBQUFBLFlBQXhELG1CQUF3RCwwQkFBQSxTQUFBLEdBQTFELEtBQTBELEdBQUEscUJBQUE7O0FBQUEsWUFBQSxNQUFBLEtBQUEsR0FBQTtBQUFBLFlBQUEsV0FBQSxLQUFBLFFBQUE7O0FBRWpFLFlBQUksS0FBSyxJQUFBLGdCQUFBLENBQUEsR0FBQSxFQUFvQixFQUE3QixrQkFBQSxnQkFBNkIsRUFBcEIsQ0FBVDtBQUNBLFdBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxJQUFBOzs7K0JBR0YsYSw0QkFBYTtBQUNYLGVBQU8sS0FBQSxNQUFBLENBQVAsYUFBTyxFQUFQOzs7K0JBR0YsUyx3QkFBUztBQUNQLGVBQU8sS0FBQSxNQUFBLENBQVAsU0FBTyxFQUFQOzs7K0JBR0YsUSx1QkFBUTtBQUNOLGVBQU8sS0FBQSxNQUFBLENBQVAsUUFBTyxFQUFQOzs7K0JBR0YsZSw4QkFBZTtBQUNiLGNBQUEsMEJBQUE7OzsrQkFHRixhLGdCQUFTO0FBQ1AsMkJBQU0sS0FBTixNQUFBOztBQUdGOzs7K0JBQ0EsTyxzQkFBTztBQUFBLFlBQUEsUUFBQSxJQUFBOztBQUNMLHdDQUFjLEtBQWQsR0FBQSxFQUF3QixZQUFBO0FBQUEsbUJBQU0sNEJBQUEsS0FBQSxFQUFtQixNQUFqRCxHQUE4QixDQUFOO0FBQXhCLFNBQUE7Ozs7OztrQkF0Q1UsZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnZpcm9ubWVudCwgUmVuZGVyUmVzdWx0LCBMaXZlQmxvY2sgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc29jaWF0ZSwgREVTVFJPWSwgTGlua2VkTGlzdCB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCwgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBjbGVhciB9IGZyb20gJy4uL2JvdW5kcyc7XG5pbXBvcnQgeyBpblRyYW5zYWN0aW9uIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgYXN5bmNEZXN0cm95IH0gZnJvbSAnLi4vbGlmZXRpbWUnO1xuaW1wb3J0IHsgVXBkYXRpbmdPcGNvZGUgfSBmcm9tICcuLi9vcGNvZGVzJztcbmltcG9ydCBVcGRhdGluZ1ZNIGZyb20gJy4vdXBkYXRlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyUmVzdWx0SW1wbCBpbXBsZW1lbnRzIFJlbmRlclJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbnY6IEVudmlyb25tZW50LFxuICAgIHByaXZhdGUgdXBkYXRpbmc6IExpbmtlZExpc3Q8VXBkYXRpbmdPcGNvZGU+LFxuICAgIHByaXZhdGUgYm91bmRzOiBMaXZlQmxvY2ssXG4gICAgcmVhZG9ubHkgZHJvcDogb2JqZWN0XG4gICkge1xuICAgIGFzc29jaWF0ZSh0aGlzLCBkcm9wKTtcbiAgfVxuXG4gIHJlcmVuZGVyKHsgYWx3YXlzUmV2YWxpZGF0ZSA9IGZhbHNlIH0gPSB7IGFsd2F5c1JldmFsaWRhdGU6IGZhbHNlIH0pIHtcbiAgICBsZXQgeyBlbnYsIHVwZGF0aW5nIH0gPSB0aGlzO1xuICAgIGxldCB2bSA9IG5ldyBVcGRhdGluZ1ZNKGVudiwgeyBhbHdheXNSZXZhbGlkYXRlIH0pO1xuICAgIHZtLmV4ZWN1dGUodXBkYXRpbmcsIHRoaXMpO1xuICB9XG5cbiAgcGFyZW50RWxlbWVudCgpOiBTaW1wbGVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHMucGFyZW50RWxlbWVudCgpO1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5maXJzdE5vZGUoKTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmJvdW5kcy5sYXN0Tm9kZSgpO1xuICB9XG5cbiAgaGFuZGxlRXhjZXB0aW9uKCkge1xuICAgIHRocm93ICd0aGlzIHNob3VsZCBuZXZlciBoYXBwZW4nO1xuICB9XG5cbiAgW0RFU1RST1ldKCkge1xuICAgIGNsZWFyKHRoaXMuYm91bmRzKTtcbiAgfVxuXG4gIC8vIGNvbXBhdCwgYXMgdGhpcyBpcyBhIHVzZXItZXhwb3NlZCBBUElcbiAgZGVzdHJveSgpIHtcbiAgICBpblRyYW5zYWN0aW9uKHRoaXMuZW52LCAoKSA9PiBhc3luY0Rlc3Ryb3kodGhpcywgdGhpcy5lbnYpKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==