"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.pushTrackFrame = pushTrackFrame;
exports.popTrackFrame = popTrackFrame;
exports.trackedData = trackedData;

var _validators = require("./validators");

var _tracked = require("./tracked");

var _tags2 = require("./tags");

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Tracker = function () {
    function Tracker() {
        _classCallCheck(this, Tracker);

        this.tags = new Set();
        this.last = null;
    }

    Tracker.prototype.add = function add(tag) {
        this.tags.add(tag);
        this.last = tag;
    };

    Tracker.prototype.combine = function combine() {
        var tags = this.tags;

        var tag = (0, _validators.createUpdatableTag)();
        if (tags.size === 1) {
            (0, _validators.update)(tag, this.last);
        } else if (tags.size > 1) {
            var _tags = [];
            this.tags.forEach(function (tag) {
                return _tags.push(tag);
            });
            (0, _validators.update)(tag, (0, _validators.combine)(_tags));
        }
        return tag;
    };

    _createClass(Tracker, [{
        key: 'size',
        get: function get() {
            return this.tags.size;
        }
    }]);

    return Tracker;
}();

function pushTrackFrame() {
    var old = CURRENT_TRACKER;
    var tracker = new Tracker();
    CURRENT_TRACKER = tracker;
    return old;
}
function popTrackFrame(old) {
    var tag = CURRENT_TRACKER.combine();
    CURRENT_TRACKER = old;
    if (CURRENT_TRACKER) CURRENT_TRACKER.add(tag);
    return tag;
}
var CURRENT_TRACKER = null;
function trackedData(key) {
    function getter(self) {
        if (CURRENT_TRACKER) CURRENT_TRACKER.add((0, _tags2.tagFor)(self, key));
        return (0, _tracked.getStateFor)(self, key);
    }
    function setter(self, value) {
        (0, _tracked.setStateFor)(self, key, value);
    }
    return { getter: getter, setter: setter };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvYXV0b3RyYWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O1FBbUNNLGMsR0FBQSxjO1FBUUEsYSxHQUFBLGE7UUFZQSxXLEdBQUEsVzs7QUF2RE47O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVBLFU7QUFBQSxhQUFBLE9BQUEsR0FBQTtBQUFBLHdCQUFBLElBQUEsRUFBQSxPQUFBOztBQUNVLGFBQUEsSUFBQSxHQUFPLElBQVAsR0FBTyxFQUFQO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQTBCVDs7c0JBeEJDLEcsZ0JBQUEsRyxFQUFZO0FBQ1YsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxHQUFBOzs7c0JBT0YsTyxzQkFBTztBQUFBLFlBQUEsT0FBQSxLQUFBLElBQUE7O0FBRUwsWUFBSSxNQUFKLHFDQUFBO0FBRUEsWUFBSSxLQUFBLElBQUEsS0FBSixDQUFBLEVBQXFCO0FBQ25CLG9DQUFBLEdBQUEsRUFBWSxLQUFaLElBQUE7QUFERixTQUFBLE1BRU8sSUFBSSxLQUFBLElBQUEsR0FBSixDQUFBLEVBQW1CO0FBQ3hCLGdCQUFJLFFBQUosRUFBQTtBQUNBLGlCQUFBLElBQUEsQ0FBQSxPQUFBLENBQWtCLFVBQUEsR0FBQSxFQUFBO0FBQUEsdUJBQU8sTUFBQSxJQUFBLENBQXpCLEdBQXlCLENBQVA7QUFBbEIsYUFBQTtBQUVBLG9DQUFBLEdBQUEsRUFBWSx5QkFBWixLQUFZLENBQVo7QUFDRDtBQUVELGVBQUEsR0FBQTs7Ozs7NEJBakJNO0FBQ04sbUJBQU8sS0FBQSxJQUFBLENBQVAsSUFBQTtBQUNEOzs7Ozs7QUFtQkcsU0FBQSxjQUFBLEdBQXdCO0FBQzVCLFFBQUksTUFBSixlQUFBO0FBQ0EsUUFBSSxVQUFVLElBQWQsT0FBYyxFQUFkO0FBRUEsc0JBQUEsT0FBQTtBQUNBLFdBQUEsR0FBQTtBQUNEO0FBRUssU0FBQSxhQUFBLENBQUEsR0FBQSxFQUE0QztBQUNoRCxRQUFJLE1BQU0sZ0JBQVYsT0FBVSxFQUFWO0FBQ0Esc0JBQUEsR0FBQTtBQUNBLFFBQUEsZUFBQSxFQUFxQixnQkFBQSxHQUFBLENBQUEsR0FBQTtBQUNyQixXQUFBLEdBQUE7QUFDRDtBQUVELElBQUksa0JBQUosSUFBQTtBQUtNLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFDRTtBQUVOLGFBQUEsTUFBQSxDQUFBLElBQUEsRUFBdUI7QUFDckIsWUFBQSxlQUFBLEVBQXFCLGdCQUFBLEdBQUEsQ0FBb0IsbUJBQUEsSUFBQSxFQUFwQixHQUFvQixDQUFwQjtBQUNyQixlQUFPLDBCQUFBLElBQUEsRUFBUCxHQUFPLENBQVA7QUFDRDtBQUVELGFBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBQW9DO0FBQ2xDLGtDQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQTtBQUNEO0FBRUQsV0FBTyxFQUFBLFFBQUEsTUFBQSxFQUFQLFFBQUEsTUFBTyxFQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUYWcsIGNvbWJpbmUsIHVwZGF0ZSwgVXBkYXRhYmxlVGFnLCBjcmVhdGVVcGRhdGFibGVUYWcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBnZXRTdGF0ZUZvciwgc2V0U3RhdGVGb3IgfSBmcm9tICcuL3RyYWNrZWQnO1xuaW1wb3J0IHsgdGFnRm9yIH0gZnJvbSAnLi90YWdzJztcblxuY2xhc3MgVHJhY2tlciB7XG4gIHByaXZhdGUgdGFncyA9IG5ldyBTZXQ8VGFnPigpO1xuICBwcml2YXRlIGxhc3Q6IE9wdGlvbjxUYWc+ID0gbnVsbDtcblxuICBhZGQodGFnOiBUYWcpOiB2b2lkIHtcbiAgICB0aGlzLnRhZ3MuYWRkKHRhZyk7XG4gICAgdGhpcy5sYXN0ID0gdGFnO1xuICB9XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50YWdzLnNpemU7XG4gIH1cblxuICBjb21iaW5lKCk6IFVwZGF0YWJsZVRhZyB7XG4gICAgbGV0IHsgdGFncyB9ID0gdGhpcztcbiAgICBsZXQgdGFnID0gY3JlYXRlVXBkYXRhYmxlVGFnKCk7XG5cbiAgICBpZiAodGFncy5zaXplID09PSAxKSB7XG4gICAgICB1cGRhdGUodGFnLCB0aGlzLmxhc3QhKTtcbiAgICB9IGVsc2UgaWYgKHRhZ3Muc2l6ZSA+IDEpIHtcbiAgICAgIGxldCB0YWdzOiBUYWdbXSA9IFtdO1xuICAgICAgdGhpcy50YWdzLmZvckVhY2godGFnID0+IHRhZ3MucHVzaCh0YWcpKTtcblxuICAgICAgdXBkYXRlKHRhZywgY29tYmluZSh0YWdzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhZztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHVzaFRyYWNrRnJhbWUoKTogT3B0aW9uPFRyYWNrZXI+IHtcbiAgbGV0IG9sZCA9IENVUlJFTlRfVFJBQ0tFUjtcbiAgbGV0IHRyYWNrZXIgPSBuZXcgVHJhY2tlcigpO1xuXG4gIENVUlJFTlRfVFJBQ0tFUiA9IHRyYWNrZXI7XG4gIHJldHVybiBvbGQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3BUcmFja0ZyYW1lKG9sZDogT3B0aW9uPFRyYWNrZXI+KTogVXBkYXRhYmxlVGFnIHtcbiAgbGV0IHRhZyA9IENVUlJFTlRfVFJBQ0tFUiEuY29tYmluZSgpO1xuICBDVVJSRU5UX1RSQUNLRVIgPSBvbGQ7XG4gIGlmIChDVVJSRU5UX1RSQUNLRVIpIENVUlJFTlRfVFJBQ0tFUi5hZGQodGFnKTtcbiAgcmV0dXJuIHRhZztcbn1cblxubGV0IENVUlJFTlRfVFJBQ0tFUjogT3B0aW9uPFRyYWNrZXI+ID0gbnVsbDtcblxuZXhwb3J0IHR5cGUgR2V0dGVyPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IChzZWxmOiBUKSA9PiBUW0tdIHwgdW5kZWZpbmVkO1xuZXhwb3J0IHR5cGUgU2V0dGVyPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IChzZWxmOiBULCB2YWx1ZTogVFtLXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrZWREYXRhPFQgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBUPihcbiAga2V5OiBLXG4pOiB7IGdldHRlcjogR2V0dGVyPFQsIEs+OyBzZXR0ZXI6IFNldHRlcjxULCBLPiB9IHtcbiAgZnVuY3Rpb24gZ2V0dGVyKHNlbGY6IFQpIHtcbiAgICBpZiAoQ1VSUkVOVF9UUkFDS0VSKSBDVVJSRU5UX1RSQUNLRVIuYWRkKHRhZ0ZvcihzZWxmLCBrZXkpKTtcbiAgICByZXR1cm4gZ2V0U3RhdGVGb3Ioc2VsZiwga2V5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHRlcihzZWxmOiBULCB2YWx1ZTogVFtLXSk6IHZvaWQge1xuICAgIHNldFN0YXRlRm9yKHNlbGYsIGtleSwgdmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHsgZ2V0dGVyLCBzZXR0ZXIgfTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=