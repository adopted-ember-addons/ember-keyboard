function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { createUpdatableTag, combine, update } from './validators';
import { property } from './property';
import { pushTrackFrame, popTrackFrame } from './autotrack';
export function map(input, callback) {
    return new MapReference(input, callback);
}

var MapReference = function () {
    function MapReference(inner, callback) {
        _classCallCheck(this, MapReference);

        this.inner = inner;
        this.callback = callback;
        this.updatable = createUpdatableTag();
        this.tag = combine([inner.tag, this.updatable]);
    }

    MapReference.prototype.value = function value() {
        var inner = this.inner,
            callback = this.callback;

        var old = pushTrackFrame();
        var ret = callback(inner.value());
        var tag = popTrackFrame(old);
        update(this.updatable, tag);
        return ret;
    };

    MapReference.prototype.get = function get(key) {
        return property(this, key);
    };

    return MapReference;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3JlZmVyZW5jZS9saWIvY29tYmluYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFBLGtCQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsUUFBQSxjQUFBO0FBQ0EsU0FBQSxRQUFBLFFBQUEsWUFBQTtBQUVBLFNBQUEsY0FBQSxFQUFBLGFBQUEsUUFBQSxhQUFBO0FBRUEsT0FBTSxTQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUVxQjtBQUV6QixXQUFPLElBQUEsWUFBQSxDQUFBLEtBQUEsRUFBUCxRQUFPLENBQVA7QUFDRDs7SUFFRCxZO0FBSUUsMEJBQUEsS0FBQSxFQUFBLFFBQUEsRUFBdUY7QUFBQTs7QUFBbkUsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUEwQyxhQUFBLFFBQUEsR0FBQSxRQUFBO0FBRnJELGFBQUEsU0FBQSxHQUFBLG9CQUFBO0FBR1AsYUFBQSxHQUFBLEdBQVcsUUFBUSxDQUFDLE1BQUQsR0FBQSxFQUFZLEtBQS9CLFNBQW1CLENBQVIsQ0FBWDtBQUNEOzsyQkFFRCxLLG9CQUFLO0FBQUEsWUFDQyxLQURELEdBQ0gsSUFERyxDQUNDLEtBREQ7QUFBQSxZQUNDLFFBREQsR0FDSCxJQURHLENBQ0MsUUFERDs7QUFHSCxZQUFJLE1BQUosZ0JBQUE7QUFDQSxZQUFJLE1BQU0sU0FBUyxNQUFuQixLQUFtQixFQUFULENBQVY7QUFDQSxZQUFJLE1BQU0sY0FBVixHQUFVLENBQVY7QUFDQSxlQUFPLEtBQVAsU0FBQSxFQUFBLEdBQUE7QUFFQSxlQUFBLEdBQUE7QUFDRCxLOzsyQkFFRCxHLGdCQUFBLEcsRUFBZTtBQUNiLGVBQU8sU0FBQSxJQUFBLEVBQVAsR0FBTyxDQUFQO0FBQ0QsSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRhZywgY3JlYXRlVXBkYXRhYmxlVGFnLCBjb21iaW5lLCB1cGRhdGUgfSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgcHJvcGVydHkgfSBmcm9tICcuL3Byb3BlcnR5JztcbmltcG9ydCB7IFZlcnNpb25lZFBhdGhSZWZlcmVuY2UgfSBmcm9tICcuL3JlZmVyZW5jZSc7XG5pbXBvcnQgeyBwdXNoVHJhY2tGcmFtZSwgcG9wVHJhY2tGcmFtZSB9IGZyb20gJy4vYXV0b3RyYWNrJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1hcDxULCBVPihcbiAgaW5wdXQ6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4sXG4gIGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IFVcbik6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VT4ge1xuICByZXR1cm4gbmV3IE1hcFJlZmVyZW5jZShpbnB1dCwgY2FsbGJhY2spO1xufVxuXG5jbGFzcyBNYXBSZWZlcmVuY2U8VCwgVT4gaW1wbGVtZW50cyBWZXJzaW9uZWRQYXRoUmVmZXJlbmNlPFU+IHtcbiAgcmVhZG9ubHkgdGFnOiBUYWc7XG4gIHJlYWRvbmx5IHVwZGF0YWJsZSA9IGNyZWF0ZVVwZGF0YWJsZVRhZygpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5uZXI6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2U8VD4sIHByaXZhdGUgY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gVSkge1xuICAgIHRoaXMudGFnID0gY29tYmluZShbaW5uZXIudGFnLCB0aGlzLnVwZGF0YWJsZV0pO1xuICB9XG5cbiAgdmFsdWUoKTogVSB7XG4gICAgbGV0IHsgaW5uZXIsIGNhbGxiYWNrIH0gPSB0aGlzO1xuXG4gICAgbGV0IG9sZCA9IHB1c2hUcmFja0ZyYW1lKCk7XG4gICAgbGV0IHJldCA9IGNhbGxiYWNrKGlubmVyLnZhbHVlKCkpO1xuICAgIGxldCB0YWcgPSBwb3BUcmFja0ZyYW1lKG9sZCk7XG4gICAgdXBkYXRlKHRoaXMudXBkYXRhYmxlLCB0YWcpO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IFZlcnNpb25lZFBhdGhSZWZlcmVuY2Uge1xuICAgIHJldHVybiBwcm9wZXJ0eSh0aGlzLCBrZXkpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9