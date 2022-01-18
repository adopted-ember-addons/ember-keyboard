function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

export var Storage = function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2xvdy1sZXZlbC9saWIvZ2x1ZS9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQU0sV0FBQSxPQUFBO0FBQU4sdUJBQUE7QUFBQTs7QUFDbUIsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNULGFBQUEsSUFBQSxHQUFBLENBQUE7QUF3QlQ7O0FBMUJLLHNCQUlKLEdBSkksZ0JBSUosT0FKSSxFQUlnQjtBQUFBLFlBQ2QsSUFEYyxHQUNsQixJQURrQixDQUNaLElBRFk7QUFBQSxZQUNkLEtBRGMsR0FDbEIsSUFEa0IsQ0FDZCxLQURjOztBQUdsQixZQUFJLFNBQVMsTUFBYixNQUFBLEVBQTJCO0FBQ3pCLGlCQUFBLElBQUE7QUFERixTQUFBLE1BRU87QUFDTCxnQkFBSSxPQUFPLE1BQVgsSUFBVyxDQUFYO0FBQ0EsaUJBQUEsSUFBQSxHQUFBLElBQUE7QUFDRDtBQUVELGFBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxPQUFBO0FBQ0EsZUFBQSxJQUFBO0FBQ0QsS0FoQkc7O0FBQUEsc0JBa0JKLEtBbEJJLGtCQWtCSixPQWxCSSxFQWtCaUI7QUFDbkIsZUFBTyxLQUFBLEtBQUEsQ0FBUCxPQUFPLENBQVA7QUFDRCxLQXBCRzs7QUFBQSxzQkFzQkosSUF0QkksaUJBc0JKLE9BdEJJLEVBc0JnQjtBQUNsQixhQUFBLEtBQUEsQ0FBQSxPQUFBLElBQXNCLEtBQXRCLElBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxPQUFBO0FBQ0QsS0F6Qkc7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBTdG9yYWdlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBhcnJheTogdW5rbm93bltdID0gW107XG4gIHByaXZhdGUgbmV4dCA9IDA7XG5cbiAgYWRkKGVsZW1lbnQ6IHVua25vd24pOiBudW1iZXIge1xuICAgIGxldCB7IG5leHQ6IHNsb3QsIGFycmF5IH0gPSB0aGlzO1xuXG4gICAgaWYgKHNsb3QgPT09IGFycmF5Lmxlbmd0aCkge1xuICAgICAgdGhpcy5uZXh0Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwcmV2ID0gYXJyYXlbc2xvdF0gYXMgbnVtYmVyO1xuICAgICAgdGhpcy5uZXh0ID0gcHJldjtcbiAgICB9XG5cbiAgICB0aGlzLmFycmF5W3Nsb3RdID0gZWxlbWVudDtcbiAgICByZXR1cm4gc2xvdDtcbiAgfVxuXG4gIGRlcmVmKHBvaW50ZXI6IG51bWJlcik6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLmFycmF5W3BvaW50ZXJdO1xuICB9XG5cbiAgZHJvcChwb2ludGVyOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmFycmF5W3BvaW50ZXJdID0gdGhpcy5uZXh0O1xuICAgIHRoaXMubmV4dCA9IHBvaW50ZXI7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=