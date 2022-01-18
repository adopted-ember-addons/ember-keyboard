"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.move = move;
exports.clear = clear;
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var CursorImpl = exports.CursorImpl = function CursorImpl(element, nextSibling) {
    _classCallCheck(this, CursorImpl);

    this.element = element;
    this.nextSibling = nextSibling;
};
var ConcreteBounds = exports.ConcreteBounds = function () {
    function ConcreteBounds(parentNode, first, last) {
        _classCallCheck(this, ConcreteBounds);

        this.parentNode = parentNode;
        this.first = first;
        this.last = last;
    }

    ConcreteBounds.prototype.parentElement = function parentElement() {
        return this.parentNode;
    };

    ConcreteBounds.prototype.firstNode = function firstNode() {
        return this.first;
    };

    ConcreteBounds.prototype.lastNode = function lastNode() {
        return this.last;
    };

    return ConcreteBounds;
}();
var SingleNodeBounds = exports.SingleNodeBounds = function () {
    function SingleNodeBounds(parentNode, node) {
        _classCallCheck(this, SingleNodeBounds);

        this.parentNode = parentNode;
        this.node = node;
    }

    SingleNodeBounds.prototype.parentElement = function parentElement() {
        return this.parentNode;
    };

    SingleNodeBounds.prototype.firstNode = function firstNode() {
        return this.node;
    };

    SingleNodeBounds.prototype.lastNode = function lastNode() {
        return this.node;
    };

    return SingleNodeBounds;
}();
function move(bounds, reference) {
    var parent = bounds.parentElement();
    var first = bounds.firstNode();
    var last = bounds.lastNode();
    var current = first;
    while (true) {
        var next = current.nextSibling;
        parent.insertBefore(current, reference);
        if (current === last) {
            return next;
        }
        current = next;
    }
}
function clear(bounds) {
    var parent = bounds.parentElement();
    var first = bounds.firstNode();
    var last = bounds.lastNode();
    var current = first;
    while (true) {
        var next = current.nextSibling;
        parent.removeChild(current);
        if (current === last) {
            return next;
        }
        current = next;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2JvdW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQThDTSxJLEdBQUEsSTtRQW9CQSxLLEdBQUEsSzs7Ozs7OztBQTlEQSxJQUFBLGtDQUNKLFNBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQSxXQUFBLEVBQWlGO0FBQUEsb0JBQUEsSUFBQSxFQUFBLFVBQUE7O0FBQTlELFNBQUEsT0FBQSxHQUFBLE9BQUE7QUFBK0IsU0FBQSxXQUFBLEdBQUEsV0FBQTtBQUQ5QyxDQUFBO0FBTU4sSUFBQSwwQ0FBQSxZQUFBO0FBQ0UsYUFBQSxjQUFBLENBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBRzBCO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGNBQUE7O0FBRmpCLGFBQUEsVUFBQSxHQUFBLFVBQUE7QUFDQyxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNOOztBQUxOLG1CQUFBLFNBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxhQUFBLEdBT2U7QUFDWCxlQUFPLEtBQVAsVUFBQTtBQVJKLEtBQUE7O0FBQUEsbUJBQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLFNBQUEsR0FXVztBQUNQLGVBQU8sS0FBUCxLQUFBO0FBWkosS0FBQTs7QUFBQSxtQkFBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFNBQUEsUUFBQSxHQWVVO0FBQ04sZUFBTyxLQUFQLElBQUE7QUFoQkosS0FBQTs7QUFBQSxXQUFBLGNBQUE7QUFBQSxDQUFBLEVBQUE7QUFvQkEsSUFBQSw4Q0FBQSxZQUFBO0FBQ0UsYUFBQSxnQkFBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLEVBQXVFO0FBQUEsd0JBQUEsSUFBQSxFQUFBLGdCQUFBOztBQUFuRCxhQUFBLFVBQUEsR0FBQSxVQUFBO0FBQW1DLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFBb0I7O0FBRDdFLHFCQUFBLFNBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxhQUFBLEdBR2U7QUFDWCxlQUFPLEtBQVAsVUFBQTtBQUpKLEtBQUE7O0FBQUEscUJBQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLFNBQUEsR0FPVztBQUNQLGVBQU8sS0FBUCxJQUFBO0FBUkosS0FBQTs7QUFBQSxxQkFBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFNBQUEsUUFBQSxHQVdVO0FBQ04sZUFBTyxLQUFQLElBQUE7QUFaSixLQUFBOztBQUFBLFdBQUEsZ0JBQUE7QUFBQSxDQUFBLEVBQUE7QUFnQk0sU0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLFNBQUEsRUFBNEQ7QUFDaEUsUUFBSSxTQUFTLE9BQWIsYUFBYSxFQUFiO0FBQ0EsUUFBSSxRQUFRLE9BQVosU0FBWSxFQUFaO0FBQ0EsUUFBSSxPQUFPLE9BQVgsUUFBVyxFQUFYO0FBRUEsUUFBSSxVQUFKLEtBQUE7QUFFQSxXQUFBLElBQUEsRUFBYTtBQUNYLFlBQUksT0FBTyxRQUFYLFdBQUE7QUFFQSxlQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsU0FBQTtBQUVBLFlBQUksWUFBSixJQUFBLEVBQXNCO0FBQ3BCLG1CQUFBLElBQUE7QUFDRDtBQUVELGtCQUFBLElBQUE7QUFDRDtBQUNGO0FBRUssU0FBQSxLQUFBLENBQUEsTUFBQSxFQUE4QjtBQUNsQyxRQUFJLFNBQVMsT0FBYixhQUFhLEVBQWI7QUFDQSxRQUFJLFFBQVEsT0FBWixTQUFZLEVBQVo7QUFDQSxRQUFJLE9BQU8sT0FBWCxRQUFXLEVBQVg7QUFFQSxRQUFJLFVBQUosS0FBQTtBQUVBLFdBQUEsSUFBQSxFQUFhO0FBQ1gsWUFBSSxPQUFPLFFBQVgsV0FBQTtBQUVBLGVBQUEsV0FBQSxDQUFBLE9BQUE7QUFFQSxZQUFJLFlBQUosSUFBQSxFQUFzQjtBQUNwQixtQkFBQSxJQUFBO0FBQ0Q7QUFFRCxrQkFBQSxJQUFBO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJvdW5kcywgQ3Vyc29yLCBTeW1ib2xEZXN0cm95YWJsZSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZXhwZWN0LCBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFNpbXBsZUVsZW1lbnQsIFNpbXBsZU5vZGUgfSBmcm9tICdAc2ltcGxlLWRvbS9pbnRlcmZhY2UnO1xuXG5leHBvcnQgY2xhc3MgQ3Vyc29ySW1wbCBpbXBsZW1lbnRzIEN1cnNvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50OiBTaW1wbGVFbGVtZW50LCBwdWJsaWMgbmV4dFNpYmxpbmc6IE9wdGlvbjxTaW1wbGVOb2RlPikge31cbn1cblxuZXhwb3J0IHR5cGUgRGVzdHJveWFibGVCb3VuZHMgPSBCb3VuZHMgJiBTeW1ib2xEZXN0cm95YWJsZTtcblxuZXhwb3J0IGNsYXNzIENvbmNyZXRlQm91bmRzIGltcGxlbWVudHMgQm91bmRzIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHBhcmVudE5vZGU6IFNpbXBsZUVsZW1lbnQsXG4gICAgcHJpdmF0ZSBmaXJzdDogU2ltcGxlTm9kZSxcbiAgICBwcml2YXRlIGxhc3Q6IFNpbXBsZU5vZGVcbiAgKSB7fVxuXG4gIHBhcmVudEVsZW1lbnQoKTogU2ltcGxlRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50Tm9kZTtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5maXJzdDtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmxhc3Q7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNpbmdsZU5vZGVCb3VuZHMgaW1wbGVtZW50cyBCb3VuZHMge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcmVudE5vZGU6IFNpbXBsZUVsZW1lbnQsIHByaXZhdGUgbm9kZTogU2ltcGxlTm9kZSkge31cblxuICBwYXJlbnRFbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLnBhcmVudE5vZGU7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgfVxuXG4gIGxhc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLm5vZGU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoYm91bmRzOiBCb3VuZHMsIHJlZmVyZW5jZTogT3B0aW9uPFNpbXBsZU5vZGU+KTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgbGV0IHBhcmVudCA9IGJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIGxldCBmaXJzdCA9IGJvdW5kcy5maXJzdE5vZGUoKTtcbiAgbGV0IGxhc3QgPSBib3VuZHMubGFzdE5vZGUoKTtcblxuICBsZXQgY3VycmVudDogU2ltcGxlTm9kZSA9IGZpcnN0O1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgbGV0IG5leHQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuXG4gICAgcGFyZW50Lmluc2VydEJlZm9yZShjdXJyZW50LCByZWZlcmVuY2UpO1xuXG4gICAgaWYgKGN1cnJlbnQgPT09IGxhc3QpIHtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cblxuICAgIGN1cnJlbnQgPSBleHBlY3QobmV4dCwgJ2ludmFsaWQgYm91bmRzJyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKGJvdW5kczogQm91bmRzKTogT3B0aW9uPFNpbXBsZU5vZGU+IHtcbiAgbGV0IHBhcmVudCA9IGJvdW5kcy5wYXJlbnRFbGVtZW50KCk7XG4gIGxldCBmaXJzdCA9IGJvdW5kcy5maXJzdE5vZGUoKTtcbiAgbGV0IGxhc3QgPSBib3VuZHMubGFzdE5vZGUoKTtcblxuICBsZXQgY3VycmVudDogU2ltcGxlTm9kZSA9IGZpcnN0O1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgbGV0IG5leHQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKGN1cnJlbnQpO1xuXG4gICAgaWYgKGN1cnJlbnQgPT09IGxhc3QpIHtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cblxuICAgIGN1cnJlbnQgPSBleHBlY3QobmV4dCwgJ2ludmFsaWQgYm91bmRzJyk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=