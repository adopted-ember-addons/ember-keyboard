define('@glimmer/low-level', ['exports'], function (exports) { 'use strict';

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Storage = function () {
        function Storage() {
            _classCallCheck(this, Storage);

            this.array = [];
            this.next = 0;
        }

        Storage.prototype.add = function add(element) {
            var slot = this.next,
                array = this.array;

            if (slot === array.length) {
                this.next++;
            } else {
                var prev = array[slot];
                this.next = prev;
            }
            this.array[slot] = element;
            return slot;
        };

        Storage.prototype.deref = function deref(pointer) {
            return this.array[pointer];
        };

        Storage.prototype.drop = function drop(pointer) {
            this.array[pointer] = this.next;
            this.next = pointer;
        };

        return Storage;
    }();

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Stack = function () {
        function Stack() {
            var vec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            _classCallCheck$1(this, Stack);

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

    exports.Storage = Storage;
    exports.Stack = Stack;

    Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci1sb3ctbGV2ZWwuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2xvdy1sZXZlbC9saWIvZ2x1ZS9zdG9yYWdlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvbG93LWxldmVsL2xpYi9hc20vc3RhY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFN0b3JhZ2Uge1xuICBwcml2YXRlIHJlYWRvbmx5IGFycmF5OiB1bmtub3duW10gPSBbXTtcbiAgcHJpdmF0ZSBuZXh0ID0gMDtcblxuICBhZGQoZWxlbWVudDogdW5rbm93bik6IG51bWJlciB7XG4gICAgbGV0IHsgbmV4dDogc2xvdCwgYXJyYXkgfSA9IHRoaXM7XG5cbiAgICBpZiAoc2xvdCA9PT0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICB0aGlzLm5leHQrKztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHByZXYgPSBhcnJheVtzbG90XSBhcyBudW1iZXI7XG4gICAgICB0aGlzLm5leHQgPSBwcmV2O1xuICAgIH1cblxuICAgIHRoaXMuYXJyYXlbc2xvdF0gPSBlbGVtZW50O1xuICAgIHJldHVybiBzbG90O1xuICB9XG5cbiAgZGVyZWYocG9pbnRlcjogbnVtYmVyKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuYXJyYXlbcG9pbnRlcl07XG4gIH1cblxuICBkcm9wKHBvaW50ZXI6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuYXJyYXlbcG9pbnRlcl0gPSB0aGlzLm5leHQ7XG4gICAgdGhpcy5uZXh0ID0gcG9pbnRlcjtcbiAgfVxufVxuIiwiZXhwb3J0IHR5cGUgdTY0ID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgdTMyID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgaTMyID0gbnVtYmVyO1xuXG5leHBvcnQgY2xhc3MgU3RhY2sge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHZlYzogdTY0W10gPSBbXSkge31cblxuICBjbG9uZSgpOiBTdGFjayB7XG4gICAgcmV0dXJuIG5ldyBTdGFjayh0aGlzLnZlYy5zbGljZSgpKTtcbiAgfVxuXG4gIHNsaWNlRnJvbShzdGFydDogdTMyKTogU3RhY2sge1xuICAgIHJldHVybiBuZXcgU3RhY2sodGhpcy52ZWMuc2xpY2Uoc3RhcnQpKTtcbiAgfVxuXG4gIHNsaWNlKHN0YXJ0OiB1MzIsIGVuZDogaTMyKTogU3RhY2sge1xuICAgIHJldHVybiBuZXcgU3RhY2sodGhpcy52ZWMuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICB9XG5cbiAgY29weShmcm9tOiB1MzIsIHRvOiB1MzIpIHtcbiAgICB0aGlzLnZlY1t0b10gPSB0aGlzLnZlY1tmcm9tXTtcbiAgfVxuXG4gIC8vIFRPRE86IGhvdyB0byBtb2RlbCB1NjQgYXJndW1lbnQ/XG4gIHdyaXRlUmF3KHBvczogdTMyLCB2YWx1ZTogdTY0KTogdm9pZCB7XG4gICAgLy8gVE9ETzogR3Jvdz9cbiAgICB0aGlzLnZlY1twb3NdID0gdmFsdWU7XG4gIH1cblxuICAvLyBUT0RPOiBwYXJ0aWFsbHkgZGVjb2RlZCBlbnVtP1xuICBnZXRSYXcocG9zOiB1MzIpOiB1MzIge1xuICAgIHJldHVybiB0aGlzLnZlY1twb3NdO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy52ZWMubGVuZ3RoID0gMDtcbiAgfVxuXG4gIGxlbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnZlYy5sZW5ndGg7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gUHJpbWl0aXZlVHlwZSB7XG4gIE5VTUJFUiA9IDBiMDAwLFxuICBGTE9BVCA9IDBiMDAxLFxuICBTVFJJTkcgPSAwYjAxMCxcbiAgQk9PTEVBTl9PUl9WT0lEID0gMGIwMTEsXG4gIE5FR0FUSVZFID0gMGIxMDAsXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFNLFFBQUEsT0FBQTtJQUFOLHVCQUFBO0lBQUE7O0lBQ21CLGFBQUEsS0FBQSxHQUFBLEVBQUE7SUFDVCxhQUFBLElBQUEsR0FBQSxDQUFBO0lBd0JUOztJQTFCSyxzQkFJSixHQUpJLGdCQUlKLE9BSkksRUFJZ0I7SUFBQSxZQUNkLElBRGMsR0FDbEIsSUFEa0IsQ0FDWixJQURZO0lBQUEsWUFDZCxLQURjLEdBQ2xCLElBRGtCLENBQ2QsS0FEYzs7SUFHbEIsWUFBSSxTQUFTLE1BQWIsTUFBQSxFQUEyQjtJQUN6QixpQkFBQSxJQUFBO0lBREYsU0FBQSxNQUVPO0lBQ0wsZ0JBQUksT0FBTyxNQUFYLElBQVcsQ0FBWDtJQUNBLGlCQUFBLElBQUEsR0FBQSxJQUFBO0lBQ0Q7SUFFRCxhQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsT0FBQTtJQUNBLGVBQUEsSUFBQTtJQUNELEtBaEJHOztJQUFBLHNCQWtCSixLQWxCSSxrQkFrQkosT0FsQkksRUFrQmlCO0lBQ25CLGVBQU8sS0FBQSxLQUFBLENBQVAsT0FBTyxDQUFQO0lBQ0QsS0FwQkc7O0lBQUEsc0JBc0JKLElBdEJJLGlCQXNCSixPQXRCSSxFQXNCZ0I7SUFDbEIsYUFBQSxLQUFBLENBQUEsT0FBQSxJQUFzQixLQUF0QixJQUFBO0lBQ0EsYUFBQSxJQUFBLEdBQUEsT0FBQTtJQUNELEtBekJHOztJQUFBO0lBQUE7Ozs7QUNJQSxRQUFBLEtBQUE7SUFDSixxQkFBbUM7SUFBQSxZQUFmLEdBQWUsdUVBQW5DLEVBQW1DOztJQUFBOztJQUFmLGFBQUEsR0FBQSxHQUFBLEdBQUE7SUFBbUI7O0lBRG5DLG9CQUdKLEtBSEksb0JBR0M7SUFDSCxlQUFPLElBQUEsS0FBQSxDQUFVLEtBQUEsR0FBQSxDQUFqQixLQUFpQixFQUFWLENBQVA7SUFDRCxLQUxHOztJQUFBLG9CQU9KLFNBUEksc0JBT0osS0FQSSxFQU9nQjtJQUNsQixlQUFPLElBQUEsS0FBQSxDQUFVLEtBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBakIsS0FBaUIsQ0FBVixDQUFQO0lBQ0QsS0FURzs7SUFBQSxvQkFXSixLQVhJLGtCQVdKLEtBWEksRUFXSixHQVhJLEVBV3NCO0lBQ3hCLGVBQU8sSUFBQSxLQUFBLENBQVUsS0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsRUFBakIsR0FBaUIsQ0FBVixDQUFQO0lBQ0QsS0FiRzs7SUFBQSxvQkFlSixJQWZJLGlCQWVKLElBZkksRUFlSixFQWZJLEVBZW1CO0lBQ3JCLGFBQUEsR0FBQSxDQUFBLEVBQUEsSUFBZSxLQUFBLEdBQUEsQ0FBZixJQUFlLENBQWY7SUFDRCxLQWpCRztJQW1CSjs7O0lBbkJJLG9CQW9CSixRQXBCSSxxQkFvQkosR0FwQkksRUFvQkosS0FwQkksRUFvQnlCO0lBQzNCO0lBQ0EsYUFBQSxHQUFBLENBQUEsR0FBQSxJQUFBLEtBQUE7SUFDRCxLQXZCRztJQXlCSjs7O0lBekJJLG9CQTBCSixNQTFCSSxtQkEwQkosR0ExQkksRUEwQlc7SUFDYixlQUFPLEtBQUEsR0FBQSxDQUFQLEdBQU8sQ0FBUDtJQUNELEtBNUJHOztJQUFBLG9CQThCSixLQTlCSSxvQkE4QkM7SUFDSCxhQUFBLEdBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQTtJQUNELEtBaENHOztJQUFBLG9CQWtDSixHQWxDSSxrQkFrQ0Q7SUFDRCxlQUFPLEtBQUEsR0FBQSxDQUFQLE1BQUE7SUFDRCxLQXBDRzs7SUFBQTtJQUFBOzs7Ozs7Ozs7Ozs7OyJ9