var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { combine as _combine, update, createUpdatableTag } from './validators';
import { getStateFor, setStateFor } from './tracked';
import { tagFor } from './tags';

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

        var tag = createUpdatableTag();
        if (tags.size === 1) {
            update(tag, this.last);
        } else if (tags.size > 1) {
            var _tags = [];
            this.tags.forEach(function (tag) {
                return _tags.push(tag);
            });
            update(tag, _combine(_tags));
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

export function pushTrackFrame() {
    var old = CURRENT_TRACKER;
    var tracker = new Tracker();
    CURRENT_TRACKER = tracker;
    return old;
}
export function popTrackFrame(old) {
    var tag = CURRENT_TRACKER.combine();
    CURRENT_TRACKER = old;
    if (CURRENT_TRACKER) CURRENT_TRACKER.add(tag);
    return tag;
}
var CURRENT_TRACKER = null;
export function trackedData(key) {
    function getter(self) {
        if (CURRENT_TRACKER) CURRENT_TRACKER.add(tagFor(self, key));
        return getStateFor(self, key);
    }
    function setter(self, value) {
        setStateFor(self, key, value);
    }
    return { getter: getter, setter: setter };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvYXV0b3RyYWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxTQUFBLG1CQUFBLEVBQUEsTUFBQSxFQUFBLGtCQUFBLFFBQUEsY0FBQTtBQUVBLFNBQUEsV0FBQSxFQUFBLFdBQUEsUUFBQSxXQUFBO0FBQ0EsU0FBQSxNQUFBLFFBQUEsUUFBQTs7SUFFQSxPO0FBQUEsdUJBQUE7QUFBQTs7QUFDVSxhQUFBLElBQUEsR0FBTyxJQUFQLEdBQU8sRUFBUDtBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUEwQlQ7O3NCQXhCQyxHLGdCQUFBLEcsRUFBWTtBQUNWLGFBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsR0FBQTtBQUNELEs7O3NCQU1ELE8sc0JBQU87QUFBQSxZQUNELElBREMsR0FDTCxJQURLLENBQ0QsSUFEQzs7QUFFTCxZQUFJLE1BQUosb0JBQUE7QUFFQSxZQUFJLEtBQUEsSUFBQSxLQUFKLENBQUEsRUFBcUI7QUFDbkIsbUJBQUEsR0FBQSxFQUFZLEtBQVosSUFBQTtBQURGLFNBQUEsTUFFTyxJQUFJLEtBQUEsSUFBQSxHQUFKLENBQUEsRUFBbUI7QUFDeEIsZ0JBQUksUUFBSixFQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBa0I7QUFBQSx1QkFBTyxNQUFBLElBQUEsQ0FBekIsR0FBeUIsQ0FBUDtBQUFBLGFBQWxCO0FBRUEsbUJBQUEsR0FBQSxFQUFZLFNBQVosS0FBWSxDQUFaO0FBQ0Q7QUFFRCxlQUFBLEdBQUE7QUFDRCxLOzs7OzRCQWxCTztBQUNOLG1CQUFPLEtBQUEsSUFBQSxDQUFQLElBQUE7QUFDRDs7Ozs7O0FBbUJILE9BQU0sU0FBQSxjQUFBLEdBQXdCO0FBQzVCLFFBQUksTUFBSixlQUFBO0FBQ0EsUUFBSSxVQUFVLElBQWQsT0FBYyxFQUFkO0FBRUEsc0JBQUEsT0FBQTtBQUNBLFdBQUEsR0FBQTtBQUNEO0FBRUQsT0FBTSxTQUFBLGFBQUEsQ0FBQSxHQUFBLEVBQTRDO0FBQ2hELFFBQUksTUFBTSxnQkFBVixPQUFVLEVBQVY7QUFDQSxzQkFBQSxHQUFBO0FBQ0EsUUFBQSxlQUFBLEVBQXFCLGdCQUFBLEdBQUEsQ0FBQSxHQUFBO0FBQ3JCLFdBQUEsR0FBQTtBQUNEO0FBRUQsSUFBSSxrQkFBSixJQUFBO0FBS0EsT0FBTSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQ0U7QUFFTixhQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQXVCO0FBQ3JCLFlBQUEsZUFBQSxFQUFxQixnQkFBQSxHQUFBLENBQW9CLE9BQUEsSUFBQSxFQUFwQixHQUFvQixDQUFwQjtBQUNyQixlQUFPLFlBQUEsSUFBQSxFQUFQLEdBQU8sQ0FBUDtBQUNEO0FBRUQsYUFBQSxNQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFBb0M7QUFDbEMsb0JBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBO0FBQ0Q7QUFFRCxXQUFPLEVBQUEsY0FBQSxFQUFQLGNBQU8sRUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGFnLCBjb21iaW5lLCB1cGRhdGUsIFVwZGF0YWJsZVRhZywgY3JlYXRlVXBkYXRhYmxlVGFnIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZ2V0U3RhdGVGb3IsIHNldFN0YXRlRm9yIH0gZnJvbSAnLi90cmFja2VkJztcbmltcG9ydCB7IHRhZ0ZvciB9IGZyb20gJy4vdGFncyc7XG5cbmNsYXNzIFRyYWNrZXIge1xuICBwcml2YXRlIHRhZ3MgPSBuZXcgU2V0PFRhZz4oKTtcbiAgcHJpdmF0ZSBsYXN0OiBPcHRpb248VGFnPiA9IG51bGw7XG5cbiAgYWRkKHRhZzogVGFnKTogdm9pZCB7XG4gICAgdGhpcy50YWdzLmFkZCh0YWcpO1xuICAgIHRoaXMubGFzdCA9IHRhZztcbiAgfVxuXG4gIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudGFncy5zaXplO1xuICB9XG5cbiAgY29tYmluZSgpOiBVcGRhdGFibGVUYWcge1xuICAgIGxldCB7IHRhZ3MgfSA9IHRoaXM7XG4gICAgbGV0IHRhZyA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xuXG4gICAgaWYgKHRhZ3Muc2l6ZSA9PT0gMSkge1xuICAgICAgdXBkYXRlKHRhZywgdGhpcy5sYXN0ISk7XG4gICAgfSBlbHNlIGlmICh0YWdzLnNpemUgPiAxKSB7XG4gICAgICBsZXQgdGFnczogVGFnW10gPSBbXTtcbiAgICAgIHRoaXMudGFncy5mb3JFYWNoKHRhZyA9PiB0YWdzLnB1c2godGFnKSk7XG5cbiAgICAgIHVwZGF0ZSh0YWcsIGNvbWJpbmUodGFncykpO1xuICAgIH1cblxuICAgIHJldHVybiB0YWc7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1c2hUcmFja0ZyYW1lKCk6IE9wdGlvbjxUcmFja2VyPiB7XG4gIGxldCBvbGQgPSBDVVJSRU5UX1RSQUNLRVI7XG4gIGxldCB0cmFja2VyID0gbmV3IFRyYWNrZXIoKTtcblxuICBDVVJSRU5UX1RSQUNLRVIgPSB0cmFja2VyO1xuICByZXR1cm4gb2xkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9wVHJhY2tGcmFtZShvbGQ6IE9wdGlvbjxUcmFja2VyPik6IFVwZGF0YWJsZVRhZyB7XG4gIGxldCB0YWcgPSBDVVJSRU5UX1RSQUNLRVIhLmNvbWJpbmUoKTtcbiAgQ1VSUkVOVF9UUkFDS0VSID0gb2xkO1xuICBpZiAoQ1VSUkVOVF9UUkFDS0VSKSBDVVJSRU5UX1RSQUNLRVIuYWRkKHRhZyk7XG4gIHJldHVybiB0YWc7XG59XG5cbmxldCBDVVJSRU5UX1RSQUNLRVI6IE9wdGlvbjxUcmFja2VyPiA9IG51bGw7XG5cbmV4cG9ydCB0eXBlIEdldHRlcjxULCBLIGV4dGVuZHMga2V5b2YgVD4gPSAoc2VsZjogVCkgPT4gVFtLXSB8IHVuZGVmaW5lZDtcbmV4cG9ydCB0eXBlIFNldHRlcjxULCBLIGV4dGVuZHMga2V5b2YgVD4gPSAoc2VsZjogVCwgdmFsdWU6IFRbS10pID0+IHZvaWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFja2VkRGF0YTxUIGV4dGVuZHMgb2JqZWN0LCBLIGV4dGVuZHMga2V5b2YgVD4oXG4gIGtleTogS1xuKTogeyBnZXR0ZXI6IEdldHRlcjxULCBLPjsgc2V0dGVyOiBTZXR0ZXI8VCwgSz4gfSB7XG4gIGZ1bmN0aW9uIGdldHRlcihzZWxmOiBUKSB7XG4gICAgaWYgKENVUlJFTlRfVFJBQ0tFUikgQ1VSUkVOVF9UUkFDS0VSLmFkZCh0YWdGb3Ioc2VsZiwga2V5KSk7XG4gICAgcmV0dXJuIGdldFN0YXRlRm9yKHNlbGYsIGtleSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXR0ZXIoc2VsZjogVCwgdmFsdWU6IFRbS10pOiB2b2lkIHtcbiAgICBzZXRTdGF0ZUZvcihzZWxmLCBrZXksIHZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiB7IGdldHRlciwgc2V0dGVyIH07XG59XG4iXSwic291cmNlUm9vdCI6IiJ9