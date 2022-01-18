function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { combine as _combine, CONSTANT_TAG } from './validators';
import { createTag, dirty } from './validators';
import { tagFor, dirtyTag } from './meta';
/**
 * Whenever a tracked computed property is entered, the current tracker is
 * saved off and a new tracker is replaced.
 *
 * Any tracked properties consumed are added to the current tracker.
 *
 * When a tracked computed property is exited, the tracker's tags are
 * combined and added to the parent tracker.
 *
 * The consequence is that each tracked computed property has a tag
 * that corresponds to the tracked properties consumed inside of
 * itself, including child tracked computed properties.
 */
var CURRENT_TRACKER = null;
/**
 * An object that that tracks @tracked properties that were consumed.
 */

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

        if (tags.size === 0) {
            return CONSTANT_TAG;
        } else if (tags.size === 1) {
            return this.last;
        } else {
            var tagsArr = [];
            tags.forEach(function (tag) {
                return tagsArr.push(tag);
            });
            return _combine(tagsArr);
        }
    };

    return Tracker;
}();

export function track(callback) {
    var parent = CURRENT_TRACKER;
    var current = new Tracker();
    CURRENT_TRACKER = current;
    try {
        callback();
    } finally {
        CURRENT_TRACKER = parent;
    }
    return current.combine();
}
export function consume(tag) {
    if (CURRENT_TRACKER !== null) {
        CURRENT_TRACKER.add(tag);
    }
}
//////////
export var EPOCH = createTag();
export function trackedData(key, initializer) {
    var values = new WeakMap();
    var hasInitializer = typeof initializer === 'function';
    function getter(self) {
        consume(tagFor(self, key));
        var value = void 0;
        // If the field has never been initialized, we should initialize it
        if (hasInitializer && !values.has(self)) {
            value = initializer();
            values.set(self, value);
        } else {
            value = values.get(self);
        }
        return value;
    }
    function setter(self, value) {
        dirty(EPOCH);
        dirtyTag(self, key);
        values.set(self, value);
    }
    return { getter: getter, setter: setter };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdHJhY2tpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFBLG1CQUFBLEVBQUEsWUFBQSxRQUFBLGNBQUE7QUFDQSxTQUFBLFNBQUEsRUFBQSxLQUFBLFFBQUEsY0FBQTtBQUNBLFNBQUEsTUFBQSxFQUFBLFFBQUEsUUFBQSxRQUFBO0FBSUE7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFJLGtCQUFKLElBQUE7QUFFQTs7OztJQUdBLE87QUFBQSx1QkFBQTtBQUFBOztBQUNVLGFBQUEsSUFBQSxHQUFPLElBQVAsR0FBTyxFQUFQO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQW9CVDs7c0JBbEJDLEcsZ0JBQUEsRyxFQUFZO0FBQ1YsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxHQUFBO0FBQ0QsSzs7c0JBRUQsTyxzQkFBTztBQUFBLFlBQ0QsSUFEQyxHQUNMLElBREssQ0FDRCxJQURDOztBQUdMLFlBQUksS0FBQSxJQUFBLEtBQUosQ0FBQSxFQUFxQjtBQUNuQixtQkFBQSxZQUFBO0FBREYsU0FBQSxNQUVPLElBQUksS0FBQSxJQUFBLEtBQUosQ0FBQSxFQUFxQjtBQUMxQixtQkFBTyxLQUFQLElBQUE7QUFESyxTQUFBLE1BRUE7QUFDTCxnQkFBSSxVQUFKLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQWE7QUFBQSx1QkFBTyxRQUFBLElBQUEsQ0FBcEIsR0FBb0IsQ0FBUDtBQUFBLGFBQWI7QUFDQSxtQkFBTyxTQUFQLE9BQU8sQ0FBUDtBQUNEO0FBQ0YsSzs7Ozs7QUFHSCxPQUFNLFNBQUEsS0FBQSxDQUFBLFFBQUEsRUFBb0M7QUFDeEMsUUFBSSxTQUFKLGVBQUE7QUFDQSxRQUFJLFVBQVUsSUFBZCxPQUFjLEVBQWQ7QUFFQSxzQkFBQSxPQUFBO0FBRUEsUUFBSTtBQUNGO0FBREYsS0FBQSxTQUVVO0FBQ1IsMEJBQUEsTUFBQTtBQUNEO0FBRUQsV0FBTyxRQUFQLE9BQU8sRUFBUDtBQUNEO0FBRUQsT0FBTSxTQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQTBCO0FBQzlCLFFBQUksb0JBQUosSUFBQSxFQUE4QjtBQUM1Qix3QkFBQSxHQUFBLENBQUEsR0FBQTtBQUNEO0FBQ0Y7QUFFRDtBQUVBLE9BQU8sSUFBTSxRQUFOLFdBQUE7QUFLUCxPQUFNLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQSxXQUFBLEVBRW9CO0FBRXhCLFFBQUksU0FBUyxJQUFiLE9BQWEsRUFBYjtBQUNBLFFBQUksaUJBQWlCLE9BQUEsV0FBQSxLQUFyQixVQUFBO0FBRUEsYUFBQSxNQUFBLENBQUEsSUFBQSxFQUF1QjtBQUNyQixnQkFBUSxPQUFBLElBQUEsRUFBUixHQUFRLENBQVI7QUFFQSxZQUFBLGNBQUE7QUFFQTtBQUNBLFlBQUksa0JBQWtCLENBQUMsT0FBQSxHQUFBLENBQXZCLElBQXVCLENBQXZCLEVBQXlDO0FBQ3ZDLG9CQUFBLGFBQUE7QUFDQSxtQkFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFGRixTQUFBLE1BR087QUFDTCxvQkFBUSxPQUFBLEdBQUEsQ0FBUixJQUFRLENBQVI7QUFDRDtBQUVELGVBQUEsS0FBQTtBQUNEO0FBRUQsYUFBQSxNQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFBb0M7QUFDbEMsY0FBQSxLQUFBO0FBQ0EsaUJBQUEsSUFBQSxFQUFBLEdBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQTtBQUNEO0FBRUQsV0FBTyxFQUFBLGNBQUEsRUFBUCxjQUFPLEVBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRhZywgY29tYmluZSwgQ09OU1RBTlRfVEFHIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IGNyZWF0ZVRhZywgZGlydHkgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgdGFnRm9yLCBkaXJ0eVRhZyB9IGZyb20gJy4vbWV0YSc7XG5cbnR5cGUgT3B0aW9uPFQ+ID0gVCB8IG51bGw7XG5cbi8qKlxuICogV2hlbmV2ZXIgYSB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGlzIGVudGVyZWQsIHRoZSBjdXJyZW50IHRyYWNrZXIgaXNcbiAqIHNhdmVkIG9mZiBhbmQgYSBuZXcgdHJhY2tlciBpcyByZXBsYWNlZC5cbiAqXG4gKiBBbnkgdHJhY2tlZCBwcm9wZXJ0aWVzIGNvbnN1bWVkIGFyZSBhZGRlZCB0byB0aGUgY3VycmVudCB0cmFja2VyLlxuICpcbiAqIFdoZW4gYSB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGlzIGV4aXRlZCwgdGhlIHRyYWNrZXIncyB0YWdzIGFyZVxuICogY29tYmluZWQgYW5kIGFkZGVkIHRvIHRoZSBwYXJlbnQgdHJhY2tlci5cbiAqXG4gKiBUaGUgY29uc2VxdWVuY2UgaXMgdGhhdCBlYWNoIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaGFzIGEgdGFnXG4gKiB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB0cmFja2VkIHByb3BlcnRpZXMgY29uc3VtZWQgaW5zaWRlIG9mXG4gKiBpdHNlbGYsIGluY2x1ZGluZyBjaGlsZCB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnRpZXMuXG4gKi9cbmxldCBDVVJSRU5UX1RSQUNLRVI6IE9wdGlvbjxUcmFja2VyPiA9IG51bGw7XG5cbi8qKlxuICogQW4gb2JqZWN0IHRoYXQgdGhhdCB0cmFja3MgQHRyYWNrZWQgcHJvcGVydGllcyB0aGF0IHdlcmUgY29uc3VtZWQuXG4gKi9cbmNsYXNzIFRyYWNrZXIge1xuICBwcml2YXRlIHRhZ3MgPSBuZXcgU2V0PFRhZz4oKTtcbiAgcHJpdmF0ZSBsYXN0OiBPcHRpb248VGFnPiA9IG51bGw7XG5cbiAgYWRkKHRhZzogVGFnKSB7XG4gICAgdGhpcy50YWdzLmFkZCh0YWcpO1xuICAgIHRoaXMubGFzdCA9IHRhZztcbiAgfVxuXG4gIGNvbWJpbmUoKTogVGFnIHtcbiAgICBsZXQgeyB0YWdzIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRhZ3Muc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIENPTlNUQU5UX1RBRztcbiAgICB9IGVsc2UgaWYgKHRhZ3Muc2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMubGFzdCBhcyBUYWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB0YWdzQXJyOiBUYWdbXSA9IFtdO1xuICAgICAgdGFncy5mb3JFYWNoKHRhZyA9PiB0YWdzQXJyLnB1c2godGFnKSk7XG4gICAgICByZXR1cm4gY29tYmluZSh0YWdzQXJyKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogVGFnIHtcbiAgbGV0IHBhcmVudCA9IENVUlJFTlRfVFJBQ0tFUjtcbiAgbGV0IGN1cnJlbnQgPSBuZXcgVHJhY2tlcigpO1xuXG4gIENVUlJFTlRfVFJBQ0tFUiA9IGN1cnJlbnQ7XG5cbiAgdHJ5IHtcbiAgICBjYWxsYmFjaygpO1xuICB9IGZpbmFsbHkge1xuICAgIENVUlJFTlRfVFJBQ0tFUiA9IHBhcmVudDtcbiAgfVxuXG4gIHJldHVybiBjdXJyZW50LmNvbWJpbmUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWUodGFnOiBUYWcpIHtcbiAgaWYgKENVUlJFTlRfVFJBQ0tFUiAhPT0gbnVsbCkge1xuICAgIENVUlJFTlRfVFJBQ0tFUi5hZGQodGFnKTtcbiAgfVxufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjb25zdCBFUE9DSCA9IGNyZWF0ZVRhZygpO1xuXG5leHBvcnQgdHlwZSBHZXR0ZXI8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gKHNlbGY6IFQpID0+IFRbS10gfCB1bmRlZmluZWQ7XG5leHBvcnQgdHlwZSBTZXR0ZXI8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gKHNlbGY6IFQsIHZhbHVlOiBUW0tdKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2tlZERhdGE8VCBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIFQ+KFxuICBrZXk6IEssXG4gIGluaXRpYWxpemVyPzogKCkgPT4gVFtLXVxuKTogeyBnZXR0ZXI6IEdldHRlcjxULCBLPjsgc2V0dGVyOiBTZXR0ZXI8VCwgSz4gfSB7XG4gIGxldCB2YWx1ZXMgPSBuZXcgV2Vha01hcDxULCBUW0tdPigpO1xuICBsZXQgaGFzSW5pdGlhbGl6ZXIgPSB0eXBlb2YgaW5pdGlhbGl6ZXIgPT09ICdmdW5jdGlvbic7XG5cbiAgZnVuY3Rpb24gZ2V0dGVyKHNlbGY6IFQpIHtcbiAgICBjb25zdW1lKHRhZ0ZvcihzZWxmLCBrZXkpKTtcblxuICAgIGxldCB2YWx1ZTtcblxuICAgIC8vIElmIHRoZSBmaWVsZCBoYXMgbmV2ZXIgYmVlbiBpbml0aWFsaXplZCwgd2Ugc2hvdWxkIGluaXRpYWxpemUgaXRcbiAgICBpZiAoaGFzSW5pdGlhbGl6ZXIgJiYgIXZhbHVlcy5oYXMoc2VsZikpIHtcbiAgICAgIHZhbHVlID0gaW5pdGlhbGl6ZXIhKCk7XG4gICAgICB2YWx1ZXMuc2V0KHNlbGYsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSB2YWx1ZXMuZ2V0KHNlbGYpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHRlcihzZWxmOiBULCB2YWx1ZTogVFtLXSk6IHZvaWQge1xuICAgIGRpcnR5KEVQT0NIKTtcbiAgICBkaXJ0eVRhZyhzZWxmLCBrZXkpO1xuICAgIHZhbHVlcy5zZXQoc2VsZiwgdmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHsgZ2V0dGVyLCBzZXR0ZXIgfTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=