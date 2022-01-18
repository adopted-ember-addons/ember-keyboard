function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { combineTagged } from '@glimmer/reference';
import { normalizeStringValue } from '../dom/normalize';

var ClassListReference = function () {
    function ClassListReference(list) {
        _classCallCheck(this, ClassListReference);

        this.list = list;
        this.tag = combineTagged(list);
        this.list = list;
    }

    ClassListReference.prototype.value = function value() {
        var ret = [];
        var list = this.list;

        for (var i = 0; i < list.length; i++) {
            var value = normalizeStringValue(list[i].value());
            if (value) ret.push(value);
        }
        return ret.length === 0 ? null : ret.join(' ');
    };

    return ClassListReference;
}();

export default ClassListReference;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL3JlZmVyZW5jZXMvY2xhc3MtbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFNBQUEsYUFBQSxRQUFBLG9CQUFBO0FBR0EsU0FBQSxvQkFBQSxRQUFBLGtCQUFBOztJQUVjLGtCO0FBR1osZ0NBQUEsSUFBQSxFQUE4QztBQUFBOztBQUExQixhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ2xCLGFBQUEsR0FBQSxHQUFXLGNBQVgsSUFBVyxDQUFYO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNEOztpQ0FFRCxLLG9CQUFLO0FBQ0gsWUFBSSxNQUFKLEVBQUE7QUFERyxZQUVDLElBRkQsR0FFSCxJQUZHLENBRUMsSUFGRDs7QUFJSCxhQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksS0FBcEIsTUFBQSxFQUFBLEdBQUEsRUFBc0M7QUFDcEMsZ0JBQUksUUFBUSxxQkFBcUIsS0FBQSxDQUFBLEVBQWpDLEtBQWlDLEVBQXJCLENBQVo7QUFDQSxnQkFBQSxLQUFBLEVBQVcsSUFBQSxJQUFBLENBQUEsS0FBQTtBQUNaO0FBRUQsZUFBTyxJQUFBLE1BQUEsS0FBQSxDQUFBLEdBQUEsSUFBQSxHQUEwQixJQUFBLElBQUEsQ0FBakMsR0FBaUMsQ0FBakM7QUFDRCxLOzs7OztlQWxCVyxrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlZmVyZW5jZSwgVGFnLCBjb21iaW5lVGFnZ2VkIH0gZnJvbSAnQGdsaW1tZXIvcmVmZXJlbmNlJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuXG5pbXBvcnQgeyBub3JtYWxpemVTdHJpbmdWYWx1ZSB9IGZyb20gJy4uL2RvbS9ub3JtYWxpemUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGFzc0xpc3RSZWZlcmVuY2UgaW1wbGVtZW50cyBSZWZlcmVuY2U8T3B0aW9uPHN0cmluZz4+IHtcbiAgcHVibGljIHRhZzogVGFnO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbGlzdDogUmVmZXJlbmNlPHVua25vd24+W10pIHtcbiAgICB0aGlzLnRhZyA9IGNvbWJpbmVUYWdnZWQobGlzdCk7XG4gICAgdGhpcy5saXN0ID0gbGlzdDtcbiAgfVxuXG4gIHZhbHVlKCk6IE9wdGlvbjxzdHJpbmc+IHtcbiAgICBsZXQgcmV0OiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCB7IGxpc3QgfSA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCB2YWx1ZSA9IG5vcm1hbGl6ZVN0cmluZ1ZhbHVlKGxpc3RbaV0udmFsdWUoKSk7XG4gICAgICBpZiAodmFsdWUpIHJldC5wdXNoKHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0Lmxlbmd0aCA9PT0gMCA/IG51bGwgOiByZXQuam9pbignICcpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9