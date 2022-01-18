import { combine, CONSTANT_TAG } from './validators';
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
            return CONSTANT_TAG;
        } else if (tags.size === 1) {
            return this.last;
        } else {
            let tagsArr = [];
            tags.forEach(tag => tagsArr.push(tag));
            return combine(tagsArr);
        }
    }
}
export function track(callback) {
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
export function consume(tag) {
    if (CURRENT_TRACKER !== null) {
        CURRENT_TRACKER.add(tag);
    }
}
//////////
export const EPOCH = createTag();
export function trackedData(key, initializer) {
    let values = new WeakMap();
    let hasInitializer = typeof initializer === 'function';
    function getter(self) {
        consume(tagFor(self, key));
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
        dirty(EPOCH);
        dirtyTag(self, key);
        values.set(self, value);
    }
    return { getter, setter };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3ZhbGlkYXRvci9saWIvdHJhY2tpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBYyxPQUFkLEVBQXVCLFlBQXZCLFFBQTJDLGNBQTNDO0FBQ0EsU0FBUyxTQUFULEVBQW9CLEtBQXBCLFFBQWlDLGNBQWpDO0FBQ0EsU0FBUyxNQUFULEVBQWlCLFFBQWpCLFFBQWlDLFFBQWpDO0FBSUE7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFJLGtCQUFtQyxJQUF2QztBQUVBOzs7QUFHQSxNQUFNLE9BQU4sQ0FBYTtBQUFiLGtCQUFBO0FBQ1UsYUFBQSxJQUFBLEdBQU8sSUFBSSxHQUFKLEVBQVA7QUFDQSxhQUFBLElBQUEsR0FBb0IsSUFBcEI7QUFvQlQ7QUFsQkMsUUFBSSxHQUFKLEVBQVk7QUFDVixhQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsR0FBZDtBQUNBLGFBQUssSUFBTCxHQUFZLEdBQVo7QUFDRDtBQUVELGNBQU87QUFDTCxZQUFJLEVBQUUsSUFBRixLQUFXLElBQWY7QUFFQSxZQUFJLEtBQUssSUFBTCxLQUFjLENBQWxCLEVBQXFCO0FBQ25CLG1CQUFPLFlBQVA7QUFDRCxTQUZELE1BRU8sSUFBSSxLQUFLLElBQUwsS0FBYyxDQUFsQixFQUFxQjtBQUMxQixtQkFBTyxLQUFLLElBQVo7QUFDRCxTQUZNLE1BRUE7QUFDTCxnQkFBSSxVQUFpQixFQUFyQjtBQUNBLGlCQUFLLE9BQUwsQ0FBYSxPQUFPLFFBQVEsSUFBUixDQUFhLEdBQWIsQ0FBcEI7QUFDQSxtQkFBTyxRQUFRLE9BQVIsQ0FBUDtBQUNEO0FBQ0Y7QUFyQlU7QUF3QmIsT0FBTSxTQUFVLEtBQVYsQ0FBZ0IsUUFBaEIsRUFBb0M7QUFDeEMsUUFBSSxTQUFTLGVBQWI7QUFDQSxRQUFJLFVBQVUsSUFBSSxPQUFKLEVBQWQ7QUFFQSxzQkFBa0IsT0FBbEI7QUFFQSxRQUFJO0FBQ0Y7QUFDRCxLQUZELFNBRVU7QUFDUiwwQkFBa0IsTUFBbEI7QUFDRDtBQUVELFdBQU8sUUFBUSxPQUFSLEVBQVA7QUFDRDtBQUVELE9BQU0sU0FBVSxPQUFWLENBQWtCLEdBQWxCLEVBQTBCO0FBQzlCLFFBQUksb0JBQW9CLElBQXhCLEVBQThCO0FBQzVCLHdCQUFnQixHQUFoQixDQUFvQixHQUFwQjtBQUNEO0FBQ0Y7QUFFRDtBQUVBLE9BQU8sTUFBTSxRQUFRLFdBQWQ7QUFLUCxPQUFNLFNBQVUsV0FBVixDQUNKLEdBREksRUFFSixXQUZJLEVBRW9CO0FBRXhCLFFBQUksU0FBUyxJQUFJLE9BQUosRUFBYjtBQUNBLFFBQUksaUJBQWlCLE9BQU8sV0FBUCxLQUF1QixVQUE1QztBQUVBLGFBQVMsTUFBVCxDQUFnQixJQUFoQixFQUF1QjtBQUNyQixnQkFBUSxPQUFPLElBQVAsRUFBYSxHQUFiLENBQVI7QUFFQSxZQUFJLEtBQUo7QUFFQTtBQUNBLFlBQUksa0JBQWtCLENBQUMsT0FBTyxHQUFQLENBQVcsSUFBWCxDQUF2QixFQUF5QztBQUN2QyxvQkFBUSxhQUFSO0FBQ0EsbUJBQU8sR0FBUCxDQUFXLElBQVgsRUFBaUIsS0FBakI7QUFDRCxTQUhELE1BR087QUFDTCxvQkFBUSxPQUFPLEdBQVAsQ0FBVyxJQUFYLENBQVI7QUFDRDtBQUVELGVBQU8sS0FBUDtBQUNEO0FBRUQsYUFBUyxNQUFULENBQWdCLElBQWhCLEVBQXlCLEtBQXpCLEVBQW9DO0FBQ2xDLGNBQU0sS0FBTjtBQUNBLGlCQUFTLElBQVQsRUFBZSxHQUFmO0FBQ0EsZUFBTyxHQUFQLENBQVcsSUFBWCxFQUFpQixLQUFqQjtBQUNEO0FBRUQsV0FBTyxFQUFFLE1BQUYsRUFBVSxNQUFWLEVBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRhZywgY29tYmluZSwgQ09OU1RBTlRfVEFHIH0gZnJvbSAnLi92YWxpZGF0b3JzJztcbmltcG9ydCB7IGNyZWF0ZVRhZywgZGlydHkgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgdGFnRm9yLCBkaXJ0eVRhZyB9IGZyb20gJy4vbWV0YSc7XG5cbnR5cGUgT3B0aW9uPFQ+ID0gVCB8IG51bGw7XG5cbi8qKlxuICogV2hlbmV2ZXIgYSB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGlzIGVudGVyZWQsIHRoZSBjdXJyZW50IHRyYWNrZXIgaXNcbiAqIHNhdmVkIG9mZiBhbmQgYSBuZXcgdHJhY2tlciBpcyByZXBsYWNlZC5cbiAqXG4gKiBBbnkgdHJhY2tlZCBwcm9wZXJ0aWVzIGNvbnN1bWVkIGFyZSBhZGRlZCB0byB0aGUgY3VycmVudCB0cmFja2VyLlxuICpcbiAqIFdoZW4gYSB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnR5IGlzIGV4aXRlZCwgdGhlIHRyYWNrZXIncyB0YWdzIGFyZVxuICogY29tYmluZWQgYW5kIGFkZGVkIHRvIHRoZSBwYXJlbnQgdHJhY2tlci5cbiAqXG4gKiBUaGUgY29uc2VxdWVuY2UgaXMgdGhhdCBlYWNoIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaGFzIGEgdGFnXG4gKiB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB0cmFja2VkIHByb3BlcnRpZXMgY29uc3VtZWQgaW5zaWRlIG9mXG4gKiBpdHNlbGYsIGluY2x1ZGluZyBjaGlsZCB0cmFja2VkIGNvbXB1dGVkIHByb3BlcnRpZXMuXG4gKi9cbmxldCBDVVJSRU5UX1RSQUNLRVI6IE9wdGlvbjxUcmFja2VyPiA9IG51bGw7XG5cbi8qKlxuICogQW4gb2JqZWN0IHRoYXQgdGhhdCB0cmFja3MgQHRyYWNrZWQgcHJvcGVydGllcyB0aGF0IHdlcmUgY29uc3VtZWQuXG4gKi9cbmNsYXNzIFRyYWNrZXIge1xuICBwcml2YXRlIHRhZ3MgPSBuZXcgU2V0PFRhZz4oKTtcbiAgcHJpdmF0ZSBsYXN0OiBPcHRpb248VGFnPiA9IG51bGw7XG5cbiAgYWRkKHRhZzogVGFnKSB7XG4gICAgdGhpcy50YWdzLmFkZCh0YWcpO1xuICAgIHRoaXMubGFzdCA9IHRhZztcbiAgfVxuXG4gIGNvbWJpbmUoKTogVGFnIHtcbiAgICBsZXQgeyB0YWdzIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRhZ3Muc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIENPTlNUQU5UX1RBRztcbiAgICB9IGVsc2UgaWYgKHRhZ3Muc2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIHRoaXMubGFzdCBhcyBUYWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB0YWdzQXJyOiBUYWdbXSA9IFtdO1xuICAgICAgdGFncy5mb3JFYWNoKHRhZyA9PiB0YWdzQXJyLnB1c2godGFnKSk7XG4gICAgICByZXR1cm4gY29tYmluZSh0YWdzQXJyKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogVGFnIHtcbiAgbGV0IHBhcmVudCA9IENVUlJFTlRfVFJBQ0tFUjtcbiAgbGV0IGN1cnJlbnQgPSBuZXcgVHJhY2tlcigpO1xuXG4gIENVUlJFTlRfVFJBQ0tFUiA9IGN1cnJlbnQ7XG5cbiAgdHJ5IHtcbiAgICBjYWxsYmFjaygpO1xuICB9IGZpbmFsbHkge1xuICAgIENVUlJFTlRfVFJBQ0tFUiA9IHBhcmVudDtcbiAgfVxuXG4gIHJldHVybiBjdXJyZW50LmNvbWJpbmUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWUodGFnOiBUYWcpIHtcbiAgaWYgKENVUlJFTlRfVFJBQ0tFUiAhPT0gbnVsbCkge1xuICAgIENVUlJFTlRfVFJBQ0tFUi5hZGQodGFnKTtcbiAgfVxufVxuXG4vLy8vLy8vLy8vXG5cbmV4cG9ydCBjb25zdCBFUE9DSCA9IGNyZWF0ZVRhZygpO1xuXG5leHBvcnQgdHlwZSBHZXR0ZXI8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gKHNlbGY6IFQpID0+IFRbS10gfCB1bmRlZmluZWQ7XG5leHBvcnQgdHlwZSBTZXR0ZXI8VCwgSyBleHRlbmRzIGtleW9mIFQ+ID0gKHNlbGY6IFQsIHZhbHVlOiBUW0tdKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2tlZERhdGE8VCBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIFQ+KFxuICBrZXk6IEssXG4gIGluaXRpYWxpemVyPzogKCkgPT4gVFtLXVxuKTogeyBnZXR0ZXI6IEdldHRlcjxULCBLPjsgc2V0dGVyOiBTZXR0ZXI8VCwgSz4gfSB7XG4gIGxldCB2YWx1ZXMgPSBuZXcgV2Vha01hcDxULCBUW0tdPigpO1xuICBsZXQgaGFzSW5pdGlhbGl6ZXIgPSB0eXBlb2YgaW5pdGlhbGl6ZXIgPT09ICdmdW5jdGlvbic7XG5cbiAgZnVuY3Rpb24gZ2V0dGVyKHNlbGY6IFQpIHtcbiAgICBjb25zdW1lKHRhZ0ZvcihzZWxmLCBrZXkpKTtcblxuICAgIGxldCB2YWx1ZTtcblxuICAgIC8vIElmIHRoZSBmaWVsZCBoYXMgbmV2ZXIgYmVlbiBpbml0aWFsaXplZCwgd2Ugc2hvdWxkIGluaXRpYWxpemUgaXRcbiAgICBpZiAoaGFzSW5pdGlhbGl6ZXIgJiYgIXZhbHVlcy5oYXMoc2VsZikpIHtcbiAgICAgIHZhbHVlID0gaW5pdGlhbGl6ZXIhKCk7XG4gICAgICB2YWx1ZXMuc2V0KHNlbGYsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSB2YWx1ZXMuZ2V0KHNlbGYpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHRlcihzZWxmOiBULCB2YWx1ZTogVFtLXSk6IHZvaWQge1xuICAgIGRpcnR5KEVQT0NIKTtcbiAgICBkaXJ0eVRhZyhzZWxmLCBrZXkpO1xuICAgIHZhbHVlcy5zZXQoc2VsZiwgdmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHsgZ2V0dGVyLCBzZXR0ZXIgfTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=