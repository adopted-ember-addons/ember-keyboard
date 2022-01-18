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
let CURRENT_TRACKER = null;
/**
 * An object that that tracks @tracked properties that were consumed.
 */
class Tracker {
    constructor() {
        this.tags = new Set();
        this.last = null;
    }
    add(tag) {
        this.tags.add(tag);
        this.last = tag;
    }
    combine() {
        let { tags } = this;
        if (tags.size === 0) {
            return _validators.CONSTANT_TAG;
        } else if (tags.size === 1) {
            return this.last;
        } else {
            let tagsArr = [];
            tags.forEach(tag => tagsArr.push(tag));
            return (0, _validators.combine)(tagsArr);
        }
    }
}
function track(callback) {
    let parent = CURRENT_TRACKER;
    let current = new Tracker();
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
const EPOCH = exports.EPOCH = (0, _validators.createTag)();
function trackedData(key, initializer) {
    let values = new WeakMap();
    let hasInitializer = typeof initializer === 'function';
    function getter(self) {
        consume((0, _meta.tagFor)(self, key));
        let value;
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
    return { getter, setter };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdHJhY2tpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBZ0RNLEssR0FBQSxLO1FBZUEsTyxHQUFBLE87UUFhQSxXLEdBQUEsVzs7OztBQTFFTjs7QUFJQTs7Ozs7Ozs7Ozs7OztBQWFBLElBQUksa0JBQUosSUFBQTtBQUVBOzs7QUFHQSxNQUFBLE9BQUEsQ0FBYTtBQUFiLGtCQUFBO0FBQ1UsYUFBQSxJQUFBLEdBQU8sSUFBUCxHQUFPLEVBQVA7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBb0JUO0FBbEJDLFFBQUEsR0FBQSxFQUFZO0FBQ1YsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxHQUFBO0FBQ0Q7QUFFRCxjQUFPO0FBQ0wsWUFBSSxFQUFBLElBQUEsS0FBSixJQUFBO0FBRUEsWUFBSSxLQUFBLElBQUEsS0FBSixDQUFBLEVBQXFCO0FBQ25CLG1CQUFBLHdCQUFBO0FBREYsU0FBQSxNQUVPLElBQUksS0FBQSxJQUFBLEtBQUosQ0FBQSxFQUFxQjtBQUMxQixtQkFBTyxLQUFQLElBQUE7QUFESyxTQUFBLE1BRUE7QUFDTCxnQkFBSSxVQUFKLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQWEsT0FBTyxRQUFBLElBQUEsQ0FBcEIsR0FBb0IsQ0FBcEI7QUFDQSxtQkFBTyx5QkFBUCxPQUFPLENBQVA7QUFDRDtBQUNGO0FBckJVO0FBd0JQLFNBQUEsS0FBQSxDQUFBLFFBQUEsRUFBb0M7QUFDeEMsUUFBSSxTQUFKLGVBQUE7QUFDQSxRQUFJLFVBQVUsSUFBZCxPQUFjLEVBQWQ7QUFFQSxzQkFBQSxPQUFBO0FBRUEsUUFBSTtBQUNGO0FBREYsS0FBQSxTQUVVO0FBQ1IsMEJBQUEsTUFBQTtBQUNEO0FBRUQsV0FBTyxRQUFQLE9BQU8sRUFBUDtBQUNEO0FBRUssU0FBQSxPQUFBLENBQUEsR0FBQSxFQUEwQjtBQUM5QixRQUFJLG9CQUFKLElBQUEsRUFBOEI7QUFDNUIsd0JBQUEsR0FBQSxDQUFBLEdBQUE7QUFDRDtBQUNGO0FBRUQ7QUFFTyxNQUFNLHdCQUFOLDRCQUFBO0FBS0QsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBLFdBQUEsRUFFb0I7QUFFeEIsUUFBSSxTQUFTLElBQWIsT0FBYSxFQUFiO0FBQ0EsUUFBSSxpQkFBaUIsT0FBQSxXQUFBLEtBQXJCLFVBQUE7QUFFQSxhQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQXVCO0FBQ3JCLGdCQUFRLGtCQUFBLElBQUEsRUFBUixHQUFRLENBQVI7QUFFQSxZQUFBLEtBQUE7QUFFQTtBQUNBLFlBQUksa0JBQWtCLENBQUMsT0FBQSxHQUFBLENBQXZCLElBQXVCLENBQXZCLEVBQXlDO0FBQ3ZDLG9CQUFBLGFBQUE7QUFDQSxtQkFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFGRixTQUFBLE1BR087QUFDTCxvQkFBUSxPQUFBLEdBQUEsQ0FBUixJQUFRLENBQVI7QUFDRDtBQUVELGVBQUEsS0FBQTtBQUNEO0FBRUQsYUFBQSxNQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFBb0M7QUFDbEMsK0JBQUEsS0FBQTtBQUNBLDRCQUFBLElBQUEsRUFBQSxHQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDRDtBQUVELFdBQU8sRUFBQSxNQUFBLEVBQVAsTUFBTyxFQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUYWcsIGNvbWJpbmUsIENPTlNUQU5UX1RBRyB9IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBjcmVhdGVUYWcsIGRpcnR5IH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IHRhZ0ZvciwgZGlydHlUYWcgfSBmcm9tICcuL21ldGEnO1xuXG50eXBlIE9wdGlvbjxUPiA9IFQgfCBudWxsO1xuXG4vKipcbiAqIFdoZW5ldmVyIGEgdHJhY2tlZCBjb21wdXRlZCBwcm9wZXJ0eSBpcyBlbnRlcmVkLCB0aGUgY3VycmVudCB0cmFja2VyIGlzXG4gKiBzYXZlZCBvZmYgYW5kIGEgbmV3IHRyYWNrZXIgaXMgcmVwbGFjZWQuXG4gKlxuICogQW55IHRyYWNrZWQgcHJvcGVydGllcyBjb25zdW1lZCBhcmUgYWRkZWQgdG8gdGhlIGN1cnJlbnQgdHJhY2tlci5cbiAqXG4gKiBXaGVuIGEgdHJhY2tlZCBjb21wdXRlZCBwcm9wZXJ0eSBpcyBleGl0ZWQsIHRoZSB0cmFja2VyJ3MgdGFncyBhcmVcbiAqIGNvbWJpbmVkIGFuZCBhZGRlZCB0byB0aGUgcGFyZW50IHRyYWNrZXIuXG4gKlxuICogVGhlIGNvbnNlcXVlbmNlIGlzIHRoYXQgZWFjaCB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGhhcyBhIHRhZ1xuICogdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgdHJhY2tlZCBwcm9wZXJ0aWVzIGNvbnN1bWVkIGluc2lkZSBvZlxuICogaXRzZWxmLCBpbmNsdWRpbmcgY2hpbGQgdHJhY2tlZCBjb21wdXRlZCBwcm9wZXJ0aWVzLlxuICovXG5sZXQgQ1VSUkVOVF9UUkFDS0VSOiBPcHRpb248VHJhY2tlcj4gPSBudWxsO1xuXG4vKipcbiAqIEFuIG9iamVjdCB0aGF0IHRoYXQgdHJhY2tzIEB0cmFja2VkIHByb3BlcnRpZXMgdGhhdCB3ZXJlIGNvbnN1bWVkLlxuICovXG5jbGFzcyBUcmFja2VyIHtcbiAgcHJpdmF0ZSB0YWdzID0gbmV3IFNldDxUYWc+KCk7XG4gIHByaXZhdGUgbGFzdDogT3B0aW9uPFRhZz4gPSBudWxsO1xuXG4gIGFkZCh0YWc6IFRhZykge1xuICAgIHRoaXMudGFncy5hZGQodGFnKTtcbiAgICB0aGlzLmxhc3QgPSB0YWc7XG4gIH1cblxuICBjb21iaW5lKCk6IFRhZyB7XG4gICAgbGV0IHsgdGFncyB9ID0gdGhpcztcblxuICAgIGlmICh0YWdzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBDT05TVEFOVF9UQUc7XG4gICAgfSBlbHNlIGlmICh0YWdzLnNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiB0aGlzLmxhc3QgYXMgVGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdGFnc0FycjogVGFnW10gPSBbXTtcbiAgICAgIHRhZ3MuZm9yRWFjaCh0YWcgPT4gdGFnc0Fyci5wdXNoKHRhZykpO1xuICAgICAgcmV0dXJuIGNvbWJpbmUodGFnc0Fycik7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFjayhjYWxsYmFjazogKCkgPT4gdm9pZCk6IFRhZyB7XG4gIGxldCBwYXJlbnQgPSBDVVJSRU5UX1RSQUNLRVI7XG4gIGxldCBjdXJyZW50ID0gbmV3IFRyYWNrZXIoKTtcblxuICBDVVJSRU5UX1RSQUNLRVIgPSBjdXJyZW50O1xuXG4gIHRyeSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBDVVJSRU5UX1RSQUNLRVIgPSBwYXJlbnQ7XG4gIH1cblxuICByZXR1cm4gY3VycmVudC5jb21iaW5lKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lKHRhZzogVGFnKSB7XG4gIGlmIChDVVJSRU5UX1RSQUNLRVIgIT09IG51bGwpIHtcbiAgICBDVVJSRU5UX1RSQUNLRVIuYWRkKHRhZyk7XG4gIH1cbn1cblxuLy8vLy8vLy8vL1xuXG5leHBvcnQgY29uc3QgRVBPQ0ggPSBjcmVhdGVUYWcoKTtcblxuZXhwb3J0IHR5cGUgR2V0dGVyPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IChzZWxmOiBUKSA9PiBUW0tdIHwgdW5kZWZpbmVkO1xuZXhwb3J0IHR5cGUgU2V0dGVyPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IChzZWxmOiBULCB2YWx1ZTogVFtLXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrZWREYXRhPFQgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBUPihcbiAga2V5OiBLLFxuICBpbml0aWFsaXplcj86ICgpID0+IFRbS11cbik6IHsgZ2V0dGVyOiBHZXR0ZXI8VCwgSz47IHNldHRlcjogU2V0dGVyPFQsIEs+IH0ge1xuICBsZXQgdmFsdWVzID0gbmV3IFdlYWtNYXA8VCwgVFtLXT4oKTtcbiAgbGV0IGhhc0luaXRpYWxpemVyID0gdHlwZW9mIGluaXRpYWxpemVyID09PSAnZnVuY3Rpb24nO1xuXG4gIGZ1bmN0aW9uIGdldHRlcihzZWxmOiBUKSB7XG4gICAgY29uc3VtZSh0YWdGb3Ioc2VsZiwga2V5KSk7XG5cbiAgICBsZXQgdmFsdWU7XG5cbiAgICAvLyBJZiB0aGUgZmllbGQgaGFzIG5ldmVyIGJlZW4gaW5pdGlhbGl6ZWQsIHdlIHNob3VsZCBpbml0aWFsaXplIGl0XG4gICAgaWYgKGhhc0luaXRpYWxpemVyICYmICF2YWx1ZXMuaGFzKHNlbGYpKSB7XG4gICAgICB2YWx1ZSA9IGluaXRpYWxpemVyISgpO1xuICAgICAgdmFsdWVzLnNldChzZWxmLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdmFsdWVzLmdldChzZWxmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiBzZXR0ZXIoc2VsZjogVCwgdmFsdWU6IFRbS10pOiB2b2lkIHtcbiAgICBkaXJ0eShFUE9DSCk7XG4gICAgZGlydHlUYWcoc2VsZiwga2V5KTtcbiAgICB2YWx1ZXMuc2V0KHNlbGYsIHZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiB7IGdldHRlciwgc2V0dGVyIH07XG59XG4iXSwic291cmNlUm9vdCI6IiJ9