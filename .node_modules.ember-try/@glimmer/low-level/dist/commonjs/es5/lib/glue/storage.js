"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Storage = exports.Storage = function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL2xvdy1sZXZlbC9saWIvZ2x1ZS9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQU0sSUFBQSw0QkFBQSxZQUFBO0FBQU4sYUFBQSxPQUFBLEdBQUE7QUFBQSx3QkFBQSxJQUFBLEVBQUEsT0FBQTs7QUFDbUIsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNULGFBQUEsSUFBQSxHQUFBLENBQUE7QUF3QlQ7O0FBMUJLLFlBQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxTQUFBLEdBQUEsQ0FBQSxPQUFBLEVBSWdCO0FBQUEsWUFBQSxPQUFBLEtBQUEsSUFBQTtBQUFBLFlBQUEsUUFBQSxLQUFBLEtBQUE7O0FBR2xCLFlBQUksU0FBUyxNQUFiLE1BQUEsRUFBMkI7QUFDekIsaUJBQUEsSUFBQTtBQURGLFNBQUEsTUFFTztBQUNMLGdCQUFJLE9BQU8sTUFBWCxJQUFXLENBQVg7QUFDQSxpQkFBQSxJQUFBLEdBQUEsSUFBQTtBQUNEO0FBRUQsYUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLE9BQUE7QUFDQSxlQUFBLElBQUE7QUFmRSxLQUFBOztBQUFBLFlBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxPQUFBLEVBa0JpQjtBQUNuQixlQUFPLEtBQUEsS0FBQSxDQUFQLE9BQU8sQ0FBUDtBQW5CRSxLQUFBOztBQUFBLFlBQUEsU0FBQSxDQUFBLElBQUEsR0FBQSxTQUFBLElBQUEsQ0FBQSxPQUFBLEVBc0JnQjtBQUNsQixhQUFBLEtBQUEsQ0FBQSxPQUFBLElBQXNCLEtBQXRCLElBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxPQUFBO0FBeEJFLEtBQUE7O0FBQUEsV0FBQSxPQUFBO0FBQUEsQ0FBQSxFQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFN0b3JhZ2Uge1xuICBwcml2YXRlIHJlYWRvbmx5IGFycmF5OiB1bmtub3duW10gPSBbXTtcbiAgcHJpdmF0ZSBuZXh0ID0gMDtcblxuICBhZGQoZWxlbWVudDogdW5rbm93bik6IG51bWJlciB7XG4gICAgbGV0IHsgbmV4dDogc2xvdCwgYXJyYXkgfSA9IHRoaXM7XG5cbiAgICBpZiAoc2xvdCA9PT0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICB0aGlzLm5leHQrKztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHByZXYgPSBhcnJheVtzbG90XSBhcyBudW1iZXI7XG4gICAgICB0aGlzLm5leHQgPSBwcmV2O1xuICAgIH1cblxuICAgIHRoaXMuYXJyYXlbc2xvdF0gPSBlbGVtZW50O1xuICAgIHJldHVybiBzbG90O1xuICB9XG5cbiAgZGVyZWYocG9pbnRlcjogbnVtYmVyKTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMuYXJyYXlbcG9pbnRlcl07XG4gIH1cblxuICBkcm9wKHBvaW50ZXI6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuYXJyYXlbcG9pbnRlcl0gPSB0aGlzLm5leHQ7XG4gICAgdGhpcy5uZXh0ID0gcG9pbnRlcjtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==