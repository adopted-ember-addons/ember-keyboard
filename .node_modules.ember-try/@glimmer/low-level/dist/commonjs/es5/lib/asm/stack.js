"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Stack = exports.Stack = function () {
    function Stack() {
        var vec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        _classCallCheck(this, Stack);

        this.vec = vec;
    }

    Stack.prototype.clone = function clone() {
        return new Stack(this.vec.slice());
    };

    Stack.prototype.sliceFrom = function sliceFrom(start) {
        return new Stack(this.vec.slice(start));
    };

    Stack.prototype.slice = function slice(start, end) {
        return new Stack(this.vec.slice(start, end));
    };

    Stack.prototype.copy = function copy(from, to) {
        this.vec[to] = this.vec[from];
    };
    // TODO: how to model u64 argument?


    Stack.prototype.writeRaw = function writeRaw(pos, value) {
        // TODO: Grow?
        this.vec[pos] = value;
    };
    // TODO: partially decoded enum?


    Stack.prototype.getRaw = function getRaw(pos) {
        return this.vec[pos];
    };

    Stack.prototype.reset = function reset() {
        this.vec.length = 0;
    };

    Stack.prototype.len = function len() {
        return this.vec.length;
    };

    return Stack;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2xvdy1sZXZlbC9saWIvYXNtL3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBSU0sSUFBQSx3QkFBQSxZQUFBO0FBQ0osYUFBQSxLQUFBLEdBQW1DO0FBQUEsWUFBZixNQUFlLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FBbkMsRUFBbUM7O0FBQUEsd0JBQUEsSUFBQSxFQUFBLEtBQUE7O0FBQWYsYUFBQSxHQUFBLEdBQUEsR0FBQTtBQUFtQjs7QUFEbkMsVUFBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFNBQUEsS0FBQSxHQUdDO0FBQ0gsZUFBTyxJQUFBLEtBQUEsQ0FBVSxLQUFBLEdBQUEsQ0FBakIsS0FBaUIsRUFBVixDQUFQO0FBSkUsS0FBQTs7QUFBQSxVQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxTQUFBLENBQUEsS0FBQSxFQU9nQjtBQUNsQixlQUFPLElBQUEsS0FBQSxDQUFVLEtBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBakIsS0FBaUIsQ0FBVixDQUFQO0FBUkUsS0FBQTs7QUFBQSxVQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsRUFXc0I7QUFDeEIsZUFBTyxJQUFBLEtBQUEsQ0FBVSxLQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxFQUFqQixHQUFpQixDQUFWLENBQVA7QUFaRSxLQUFBOztBQUFBLFVBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxTQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsRUFBQSxFQWVtQjtBQUNyQixhQUFBLEdBQUEsQ0FBQSxFQUFBLElBQWUsS0FBQSxHQUFBLENBQWYsSUFBZSxDQUFmO0FBaEJFLEtBQUE7QUFtQko7OztBQW5CSSxVQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLENBQUEsR0FBQSxFQUFBLEtBQUEsRUFvQnlCO0FBQzNCO0FBQ0EsYUFBQSxHQUFBLENBQUEsR0FBQSxJQUFBLEtBQUE7QUF0QkUsS0FBQTtBQXlCSjs7O0FBekJJLFVBQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBMEJXO0FBQ2IsZUFBTyxLQUFBLEdBQUEsQ0FBUCxHQUFPLENBQVA7QUEzQkUsS0FBQTs7QUFBQSxVQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxLQUFBLEdBOEJDO0FBQ0gsYUFBQSxHQUFBLENBQUEsTUFBQSxHQUFBLENBQUE7QUEvQkUsS0FBQTs7QUFBQSxVQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxHQUFBLEdBa0NEO0FBQ0QsZUFBTyxLQUFBLEdBQUEsQ0FBUCxNQUFBO0FBbkNFLEtBQUE7O0FBQUEsV0FBQSxLQUFBO0FBQUEsQ0FBQSxFQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHR5cGUgdTY0ID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgdTMyID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgaTMyID0gbnVtYmVyO1xuXG5leHBvcnQgY2xhc3MgU3RhY2sge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHZlYzogdTY0W10gPSBbXSkge31cblxuICBjbG9uZSgpOiBTdGFjayB7XG4gICAgcmV0dXJuIG5ldyBTdGFjayh0aGlzLnZlYy5zbGljZSgpKTtcbiAgfVxuXG4gIHNsaWNlRnJvbShzdGFydDogdTMyKTogU3RhY2sge1xuICAgIHJldHVybiBuZXcgU3RhY2sodGhpcy52ZWMuc2xpY2Uoc3RhcnQpKTtcbiAgfVxuXG4gIHNsaWNlKHN0YXJ0OiB1MzIsIGVuZDogaTMyKTogU3RhY2sge1xuICAgIHJldHVybiBuZXcgU3RhY2sodGhpcy52ZWMuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICB9XG5cbiAgY29weShmcm9tOiB1MzIsIHRvOiB1MzIpIHtcbiAgICB0aGlzLnZlY1t0b10gPSB0aGlzLnZlY1tmcm9tXTtcbiAgfVxuXG4gIC8vIFRPRE86IGhvdyB0byBtb2RlbCB1NjQgYXJndW1lbnQ/XG4gIHdyaXRlUmF3KHBvczogdTMyLCB2YWx1ZTogdTY0KTogdm9pZCB7XG4gICAgLy8gVE9ETzogR3Jvdz9cbiAgICB0aGlzLnZlY1twb3NdID0gdmFsdWU7XG4gIH1cblxuICAvLyBUT0RPOiBwYXJ0aWFsbHkgZGVjb2RlZCBlbnVtP1xuICBnZXRSYXcocG9zOiB1MzIpOiB1MzIge1xuICAgIHJldHVybiB0aGlzLnZlY1twb3NdO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy52ZWMubGVuZ3RoID0gMDtcbiAgfVxuXG4gIGxlbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnZlYy5sZW5ndGg7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gUHJpbWl0aXZlVHlwZSB7XG4gIE5VTUJFUiA9IDBiMDAwLFxuICBGTE9BVCA9IDBiMDAxLFxuICBTVFJJTkcgPSAwYjAxMCxcbiAgQk9PTEVBTl9PUl9WT0lEID0gMGIwMTEsXG4gIE5FR0FUSVZFID0gMGIxMDAsXG59XG4iXSwic291cmNlUm9vdCI6IiJ9