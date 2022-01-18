function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

export var Stack = function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2xvdy1sZXZlbC9saWIvYXNtL3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSU0sV0FBQSxLQUFBO0FBQ0oscUJBQW1DO0FBQUEsWUFBZixHQUFlLHVFQUFuQyxFQUFtQzs7QUFBQTs7QUFBZixhQUFBLEdBQUEsR0FBQSxHQUFBO0FBQW1COztBQURuQyxvQkFHSixLQUhJLG9CQUdDO0FBQ0gsZUFBTyxJQUFBLEtBQUEsQ0FBVSxLQUFBLEdBQUEsQ0FBakIsS0FBaUIsRUFBVixDQUFQO0FBQ0QsS0FMRzs7QUFBQSxvQkFPSixTQVBJLHNCQU9KLEtBUEksRUFPZ0I7QUFDbEIsZUFBTyxJQUFBLEtBQUEsQ0FBVSxLQUFBLEdBQUEsQ0FBQSxLQUFBLENBQWpCLEtBQWlCLENBQVYsQ0FBUDtBQUNELEtBVEc7O0FBQUEsb0JBV0osS0FYSSxrQkFXSixLQVhJLEVBV0osR0FYSSxFQVdzQjtBQUN4QixlQUFPLElBQUEsS0FBQSxDQUFVLEtBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQWpCLEdBQWlCLENBQVYsQ0FBUDtBQUNELEtBYkc7O0FBQUEsb0JBZUosSUFmSSxpQkFlSixJQWZJLEVBZUosRUFmSSxFQWVtQjtBQUNyQixhQUFBLEdBQUEsQ0FBQSxFQUFBLElBQWUsS0FBQSxHQUFBLENBQWYsSUFBZSxDQUFmO0FBQ0QsS0FqQkc7QUFtQko7OztBQW5CSSxvQkFvQkosUUFwQkkscUJBb0JKLEdBcEJJLEVBb0JKLEtBcEJJLEVBb0J5QjtBQUMzQjtBQUNBLGFBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxLQUFBO0FBQ0QsS0F2Qkc7QUF5Qko7OztBQXpCSSxvQkEwQkosTUExQkksbUJBMEJKLEdBMUJJLEVBMEJXO0FBQ2IsZUFBTyxLQUFBLEdBQUEsQ0FBUCxHQUFPLENBQVA7QUFDRCxLQTVCRzs7QUFBQSxvQkE4QkosS0E5Qkksb0JBOEJDO0FBQ0gsYUFBQSxHQUFBLENBQUEsTUFBQSxHQUFBLENBQUE7QUFDRCxLQWhDRzs7QUFBQSxvQkFrQ0osR0FsQ0ksa0JBa0NEO0FBQ0QsZUFBTyxLQUFBLEdBQUEsQ0FBUCxNQUFBO0FBQ0QsS0FwQ0c7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIHU2NCA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIHUzMiA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIGkzMiA9IG51bWJlcjtcblxuZXhwb3J0IGNsYXNzIFN0YWNrIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB2ZWM6IHU2NFtdID0gW10pIHt9XG5cbiAgY2xvbmUoKTogU3RhY2sge1xuICAgIHJldHVybiBuZXcgU3RhY2sodGhpcy52ZWMuc2xpY2UoKSk7XG4gIH1cblxuICBzbGljZUZyb20oc3RhcnQ6IHUzMik6IFN0YWNrIHtcbiAgICByZXR1cm4gbmV3IFN0YWNrKHRoaXMudmVjLnNsaWNlKHN0YXJ0KSk7XG4gIH1cblxuICBzbGljZShzdGFydDogdTMyLCBlbmQ6IGkzMik6IFN0YWNrIHtcbiAgICByZXR1cm4gbmV3IFN0YWNrKHRoaXMudmVjLnNsaWNlKHN0YXJ0LCBlbmQpKTtcbiAgfVxuXG4gIGNvcHkoZnJvbTogdTMyLCB0bzogdTMyKSB7XG4gICAgdGhpcy52ZWNbdG9dID0gdGhpcy52ZWNbZnJvbV07XG4gIH1cblxuICAvLyBUT0RPOiBob3cgdG8gbW9kZWwgdTY0IGFyZ3VtZW50P1xuICB3cml0ZVJhdyhwb3M6IHUzMiwgdmFsdWU6IHU2NCk6IHZvaWQge1xuICAgIC8vIFRPRE86IEdyb3c/XG4gICAgdGhpcy52ZWNbcG9zXSA9IHZhbHVlO1xuICB9XG5cbiAgLy8gVE9ETzogcGFydGlhbGx5IGRlY29kZWQgZW51bT9cbiAgZ2V0UmF3KHBvczogdTMyKTogdTMyIHtcbiAgICByZXR1cm4gdGhpcy52ZWNbcG9zXTtcbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMudmVjLmxlbmd0aCA9IDA7XG4gIH1cblxuICBsZW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy52ZWMubGVuZ3RoO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFByaW1pdGl2ZVR5cGUge1xuICBOVU1CRVIgPSAwYjAwMCxcbiAgRkxPQVQgPSAwYjAwMSxcbiAgU1RSSU5HID0gMGIwMTAsXG4gIEJPT0xFQU5fT1JfVk9JRCA9IDBiMDExLFxuICBORUdBVElWRSA9IDBiMTAwLFxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==