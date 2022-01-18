"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
class Storage {
    constructor() {
        this.array = [];
        this.next = 0;
    }
    add(element) {
        let { next: slot, array } = this;
        if (slot === array.length) {
            this.next++;
        } else {
            let prev = array[slot];
            this.next = prev;
        }
        this.array[slot] = element;
        return slot;
    }
    deref(pointer) {
        return this.array[pointer];
    }
    drop(pointer) {
        this.array[pointer] = this.next;
        this.next = pointer;
    }
}
exports.Storage = Storage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2xvdy1sZXZlbC9saWIvZ2x1ZS9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU0sTUFBQSxPQUFBLENBQWM7QUFBcEIsa0JBQUE7QUFDbUIsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNULGFBQUEsSUFBQSxHQUFBLENBQUE7QUF3QlQ7QUF0QkMsUUFBQSxPQUFBLEVBQW9CO0FBQ2xCLFlBQUksRUFBRSxNQUFGLElBQUEsRUFBQSxLQUFBLEtBQUosSUFBQTtBQUVBLFlBQUksU0FBUyxNQUFiLE1BQUEsRUFBMkI7QUFDekIsaUJBQUEsSUFBQTtBQURGLFNBQUEsTUFFTztBQUNMLGdCQUFJLE9BQU8sTUFBWCxJQUFXLENBQVg7QUFDQSxpQkFBQSxJQUFBLEdBQUEsSUFBQTtBQUNEO0FBRUQsYUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLE9BQUE7QUFDQSxlQUFBLElBQUE7QUFDRDtBQUVELFVBQUEsT0FBQSxFQUFxQjtBQUNuQixlQUFPLEtBQUEsS0FBQSxDQUFQLE9BQU8sQ0FBUDtBQUNEO0FBRUQsU0FBQSxPQUFBLEVBQW9CO0FBQ2xCLGFBQUEsS0FBQSxDQUFBLE9BQUEsSUFBc0IsS0FBdEIsSUFBQTtBQUNBLGFBQUEsSUFBQSxHQUFBLE9BQUE7QUFDRDtBQXpCaUI7UUFBZCxPLEdBQUEsTyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBTdG9yYWdlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBhcnJheTogdW5rbm93bltdID0gW107XG4gIHByaXZhdGUgbmV4dCA9IDA7XG5cbiAgYWRkKGVsZW1lbnQ6IHVua25vd24pOiBudW1iZXIge1xuICAgIGxldCB7IG5leHQ6IHNsb3QsIGFycmF5IH0gPSB0aGlzO1xuXG4gICAgaWYgKHNsb3QgPT09IGFycmF5Lmxlbmd0aCkge1xuICAgICAgdGhpcy5uZXh0Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwcmV2ID0gYXJyYXlbc2xvdF0gYXMgbnVtYmVyO1xuICAgICAgdGhpcy5uZXh0ID0gcHJldjtcbiAgICB9XG5cbiAgICB0aGlzLmFycmF5W3Nsb3RdID0gZWxlbWVudDtcbiAgICByZXR1cm4gc2xvdDtcbiAgfVxuXG4gIGRlcmVmKHBvaW50ZXI6IG51bWJlcik6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLmFycmF5W3BvaW50ZXJdO1xuICB9XG5cbiAgZHJvcChwb2ludGVyOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmFycmF5W3BvaW50ZXJdID0gdGhpcy5uZXh0O1xuICAgIHRoaXMubmV4dCA9IHBvaW50ZXI7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=