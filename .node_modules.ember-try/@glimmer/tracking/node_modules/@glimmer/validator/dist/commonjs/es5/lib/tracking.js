'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EPOCH = undefined;
exports.track = track;
exports.consume = consume;
exports.trackedData = trackedData;

var _validators = require('./validators');

var _meta = require('./meta');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

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
            return _validators.CONSTANT_TAG;
        } else if (tags.size === 1) {
            return this.last;
        } else {
            var tagsArr = [];
            tags.forEach(function (tag) {
                return tagsArr.push(tag);
            });
            return (0, _validators.combine)(tagsArr);
        }
    };

    return Tracker;
}();

function track(callback) {
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
function consume(tag) {
    if (CURRENT_TRACKER !== null) {
        CURRENT_TRACKER.add(tag);
    }
}
//////////
var EPOCH = exports.EPOCH = (0, _validators.createTag)();
function trackedData(key, initializer) {
    var values = new WeakMap();
    var hasInitializer = typeof initializer === 'function';
    function getter(self) {
        consume((0, _meta.tagFor)(self, key));
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
        (0, _validators.dirty)(EPOCH);
        (0, _meta.dirtyTag)(self, key);
        values.set(self, value);
    }
    return { getter: getter, setter: setter };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdHJhY2tpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBZ0RNLEssR0FBQSxLO1FBZUEsTyxHQUFBLE87UUFhQSxXLEdBQUEsVzs7QUE1RU47O0FBRUE7Ozs7Ozs7O0FBSUE7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFJLGtCQUFKLElBQUE7QUFFQTs7OztJQUdBLFU7QUFBQSxhQUFBLE9BQUEsR0FBQTtBQUFBLHdCQUFBLElBQUEsRUFBQSxPQUFBOztBQUNVLGFBQUEsSUFBQSxHQUFPLElBQVAsR0FBTyxFQUFQO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQW9CVDs7c0JBbEJDLEcsZ0JBQUEsRyxFQUFZO0FBQ1YsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxHQUFBOzs7c0JBR0YsTyxzQkFBTztBQUFBLFlBQUEsT0FBQSxLQUFBLElBQUE7O0FBR0wsWUFBSSxLQUFBLElBQUEsS0FBSixDQUFBLEVBQXFCO0FBQ25CLG1CQUFBLHdCQUFBO0FBREYsU0FBQSxNQUVPLElBQUksS0FBQSxJQUFBLEtBQUosQ0FBQSxFQUFxQjtBQUMxQixtQkFBTyxLQUFQLElBQUE7QUFESyxTQUFBLE1BRUE7QUFDTCxnQkFBSSxVQUFKLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQWEsVUFBQSxHQUFBLEVBQUE7QUFBQSx1QkFBTyxRQUFBLElBQUEsQ0FBcEIsR0FBb0IsQ0FBUDtBQUFiLGFBQUE7QUFDQSxtQkFBTyx5QkFBUCxPQUFPLENBQVA7QUFDRDs7Ozs7O0FBSUMsU0FBQSxLQUFBLENBQUEsUUFBQSxFQUFvQztBQUN4QyxRQUFJLFNBQUosZUFBQTtBQUNBLFFBQUksVUFBVSxJQUFkLE9BQWMsRUFBZDtBQUVBLHNCQUFBLE9BQUE7QUFFQSxRQUFJO0FBQ0Y7QUFERixLQUFBLFNBRVU7QUFDUiwwQkFBQSxNQUFBO0FBQ0Q7QUFFRCxXQUFPLFFBQVAsT0FBTyxFQUFQO0FBQ0Q7QUFFSyxTQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQTBCO0FBQzlCLFFBQUksb0JBQUosSUFBQSxFQUE4QjtBQUM1Qix3QkFBQSxHQUFBLENBQUEsR0FBQTtBQUNEO0FBQ0Y7QUFFRDtBQUVPLElBQU0sd0JBQU4sNEJBQUE7QUFLRCxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUEsV0FBQSxFQUVvQjtBQUV4QixRQUFJLFNBQVMsSUFBYixPQUFhLEVBQWI7QUFDQSxRQUFJLGlCQUFpQixPQUFBLFdBQUEsS0FBckIsVUFBQTtBQUVBLGFBQUEsTUFBQSxDQUFBLElBQUEsRUFBdUI7QUFDckIsZ0JBQVEsa0JBQUEsSUFBQSxFQUFSLEdBQVEsQ0FBUjtBQUVBLFlBQUEsUUFBQSxLQUFBLENBQUE7QUFFQTtBQUNBLFlBQUksa0JBQWtCLENBQUMsT0FBQSxHQUFBLENBQXZCLElBQXVCLENBQXZCLEVBQXlDO0FBQ3ZDLG9CQUFBLGFBQUE7QUFDQSxtQkFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFGRixTQUFBLE1BR087QUFDTCxvQkFBUSxPQUFBLEdBQUEsQ0FBUixJQUFRLENBQVI7QUFDRDtBQUVELGVBQUEsS0FBQTtBQUNEO0FBRUQsYUFBQSxNQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFBb0M7QUFDbEMsK0JBQUEsS0FBQTtBQUNBLDRCQUFBLElBQUEsRUFBQSxHQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDRDtBQUVELFdBQU8sRUFBQSxRQUFBLE1BQUEsRUFBUCxRQUFBLE1BQU8sRUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGFnLCBjb21iaW5lLCBDT05TVEFOVF9UQUcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgY3JlYXRlVGFnLCBkaXJ0eSB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyB0YWdGb3IsIGRpcnR5VGFnIH0gZnJvbSAnLi9tZXRhJztcblxudHlwZSBPcHRpb248VD4gPSBUIHwgbnVsbDtcblxuLyoqXG4gKiBXaGVuZXZlciBhIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaXMgZW50ZXJlZCwgdGhlIGN1cnJlbnQgdHJhY2tlciBpc1xuICogc2F2ZWQgb2ZmIGFuZCBhIG5ldyB0cmFja2VyIGlzIHJlcGxhY2VkLlxuICpcbiAqIEFueSB0cmFja2VkIHByb3BlcnRpZXMgY29uc3VtZWQgYXJlIGFkZGVkIHRvIHRoZSBjdXJyZW50IHRyYWNrZXIuXG4gKlxuICogV2hlbiBhIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaXMgZXhpdGVkLCB0aGUgdHJhY2tlcidzIHRhZ3MgYXJlXG4gKiBjb21iaW5lZCBhbmQgYWRkZWQgdG8gdGhlIHBhcmVudCB0cmFja2VyLlxuICpcbiAqIFRoZSBjb25zZXF1ZW5jZSBpcyB0aGF0IGVhY2ggdHJhY2tlZCBjb21wdXRlZCBwcm9wZXJ0eSBoYXMgYSB0YWdcbiAqIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHRyYWNrZWQgcHJvcGVydGllcyBjb25zdW1lZCBpbnNpZGUgb2ZcbiAqIGl0c2VsZiwgaW5jbHVkaW5nIGNoaWxkIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydGllcy5cbiAqL1xubGV0IENVUlJFTlRfVFJBQ0tFUjogT3B0aW9uPFRyYWNrZXI+ID0gbnVsbDtcblxuLyoqXG4gKiBBbiBvYmplY3QgdGhhdCB0aGF0IHRyYWNrcyBAdHJhY2tlZCBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBjb25zdW1lZC5cbiAqL1xuY2xhc3MgVHJhY2tlciB7XG4gIHByaXZhdGUgdGFncyA9IG5ldyBTZXQ8VGFnPigpO1xuICBwcml2YXRlIGxhc3Q6IE9wdGlvbjxUYWc+ID0gbnVsbDtcblxuICBhZGQodGFnOiBUYWcpIHtcbiAgICB0aGlzLnRhZ3MuYWRkKHRhZyk7XG4gICAgdGhpcy5sYXN0ID0gdGFnO1xuICB9XG5cbiAgY29tYmluZSgpOiBUYWcge1xuICAgIGxldCB7IHRhZ3MgfSA9IHRoaXM7XG5cbiAgICBpZiAodGFncy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gQ09OU1RBTlRfVEFHO1xuICAgIH0gZWxzZSBpZiAodGFncy5zaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5sYXN0IGFzIFRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHRhZ3NBcnI6IFRhZ1tdID0gW107XG4gICAgICB0YWdzLmZvckVhY2godGFnID0+IHRhZ3NBcnIucHVzaCh0YWcpKTtcbiAgICAgIHJldHVybiBjb21iaW5lKHRhZ3NBcnIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2soY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBUYWcge1xuICBsZXQgcGFyZW50ID0gQ1VSUkVOVF9UUkFDS0VSO1xuICBsZXQgY3VycmVudCA9IG5ldyBUcmFja2VyKCk7XG5cbiAgQ1VSUkVOVF9UUkFDS0VSID0gY3VycmVudDtcblxuICB0cnkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH0gZmluYWxseSB7XG4gICAgQ1VSUkVOVF9UUkFDS0VSID0gcGFyZW50O1xuICB9XG5cbiAgcmV0dXJuIGN1cnJlbnQuY29tYmluZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZSh0YWc6IFRhZykge1xuICBpZiAoQ1VSUkVOVF9UUkFDS0VSICE9PSBudWxsKSB7XG4gICAgQ1VSUkVOVF9UUkFDS0VSLmFkZCh0YWcpO1xuICB9XG59XG5cbi8vLy8vLy8vLy9cblxuZXhwb3J0IGNvbnN0IEVQT0NIID0gY3JlYXRlVGFnKCk7XG5cbmV4cG9ydCB0eXBlIEdldHRlcjxULCBLIGV4dGVuZHMga2V5b2YgVD4gPSAoc2VsZjogVCkgPT4gVFtLXSB8IHVuZGVmaW5lZDtcbmV4cG9ydCB0eXBlIFNldHRlcjxULCBLIGV4dGVuZHMga2V5b2YgVD4gPSAoc2VsZjogVCwgdmFsdWU6IFRbS10pID0+IHZvaWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFja2VkRGF0YTxUIGV4dGVuZHMgb2JqZWN0LCBLIGV4dGVuZHMga2V5b2YgVD4oXG4gIGtleTogSyxcbiAgaW5pdGlhbGl6ZXI/OiAoKSA9PiBUW0tdXG4pOiB7IGdldHRlcjogR2V0dGVyPFQsIEs+OyBzZXR0ZXI6IFNldHRlcjxULCBLPiB9IHtcbiAgbGV0IHZhbHVlcyA9IG5ldyBXZWFrTWFwPFQsIFRbS10+KCk7XG4gIGxldCBoYXNJbml0aWFsaXplciA9IHR5cGVvZiBpbml0aWFsaXplciA9PT0gJ2Z1bmN0aW9uJztcblxuICBmdW5jdGlvbiBnZXR0ZXIoc2VsZjogVCkge1xuICAgIGNvbnN1bWUodGFnRm9yKHNlbGYsIGtleSkpO1xuXG4gICAgbGV0IHZhbHVlO1xuXG4gICAgLy8gSWYgdGhlIGZpZWxkIGhhcyBuZXZlciBiZWVuIGluaXRpYWxpemVkLCB3ZSBzaG91bGQgaW5pdGlhbGl6ZSBpdFxuICAgIGlmIChoYXNJbml0aWFsaXplciAmJiAhdmFsdWVzLmhhcyhzZWxmKSkge1xuICAgICAgdmFsdWUgPSBpbml0aWFsaXplciEoKTtcbiAgICAgIHZhbHVlcy5zZXQoc2VsZiwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlcy5nZXQoc2VsZik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0dGVyKHNlbGY6IFQsIHZhbHVlOiBUW0tdKTogdm9pZCB7XG4gICAgZGlydHkoRVBPQ0gpO1xuICAgIGRpcnR5VGFnKHNlbGYsIGtleSk7XG4gICAgdmFsdWVzLnNldChzZWxmLCB2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4geyBnZXR0ZXIsIHNldHRlciB9O1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==