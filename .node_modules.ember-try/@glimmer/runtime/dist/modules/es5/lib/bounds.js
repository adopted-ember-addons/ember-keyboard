function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

export var CursorImpl = function CursorImpl(element, nextSibling) {
    _classCallCheck(this, CursorImpl);

    this.element = element;
    this.nextSibling = nextSibling;
};
export var ConcreteBounds = function () {
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
export var SingleNodeBounds = function () {
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
export function move(bounds, reference) {
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
export function clear(bounds) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2JvdW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlNLFdBQUEsVUFBQSxHQUNKLG9CQUFBLE9BQUEsRUFBQSxXQUFBLEVBQWlGO0FBQUE7O0FBQTlELFNBQUEsT0FBQSxHQUFBLE9BQUE7QUFBK0IsU0FBQSxXQUFBLEdBQUEsV0FBQTtBQUFtQyxDQURqRjtBQU1OLFdBQU0sY0FBTjtBQUNFLDRCQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUcwQjtBQUFBOztBQUZqQixhQUFBLFVBQUEsR0FBQSxVQUFBO0FBQ0MsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFDTjs7QUFMTiw2QkFPRSxhQVBGLDRCQU9lO0FBQ1gsZUFBTyxLQUFQLFVBQUE7QUFDRCxLQVRIOztBQUFBLDZCQVdFLFNBWEYsd0JBV1c7QUFDUCxlQUFPLEtBQVAsS0FBQTtBQUNELEtBYkg7O0FBQUEsNkJBZUUsUUFmRix1QkFlVTtBQUNOLGVBQU8sS0FBUCxJQUFBO0FBQ0QsS0FqQkg7O0FBQUE7QUFBQTtBQW9CQSxXQUFNLGdCQUFOO0FBQ0UsOEJBQUEsVUFBQSxFQUFBLElBQUEsRUFBdUU7QUFBQTs7QUFBbkQsYUFBQSxVQUFBLEdBQUEsVUFBQTtBQUFtQyxhQUFBLElBQUEsR0FBQSxJQUFBO0FBQW9COztBQUQ3RSwrQkFHRSxhQUhGLDRCQUdlO0FBQ1gsZUFBTyxLQUFQLFVBQUE7QUFDRCxLQUxIOztBQUFBLCtCQU9FLFNBUEYsd0JBT1c7QUFDUCxlQUFPLEtBQVAsSUFBQTtBQUNELEtBVEg7O0FBQUEsK0JBV0UsUUFYRix1QkFXVTtBQUNOLGVBQU8sS0FBUCxJQUFBO0FBQ0QsS0FiSDs7QUFBQTtBQUFBO0FBZ0JBLE9BQU0sU0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLFNBQUEsRUFBNEQ7QUFDaEUsUUFBSSxTQUFTLE9BQWIsYUFBYSxFQUFiO0FBQ0EsUUFBSSxRQUFRLE9BQVosU0FBWSxFQUFaO0FBQ0EsUUFBSSxPQUFPLE9BQVgsUUFBVyxFQUFYO0FBRUEsUUFBSSxVQUFKLEtBQUE7QUFFQSxXQUFBLElBQUEsRUFBYTtBQUNYLFlBQUksT0FBTyxRQUFYLFdBQUE7QUFFQSxlQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsU0FBQTtBQUVBLFlBQUksWUFBSixJQUFBLEVBQXNCO0FBQ3BCLG1CQUFBLElBQUE7QUFDRDtBQUVELGtCQUFBLElBQUE7QUFDRDtBQUNGO0FBRUQsT0FBTSxTQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQThCO0FBQ2xDLFFBQUksU0FBUyxPQUFiLGFBQWEsRUFBYjtBQUNBLFFBQUksUUFBUSxPQUFaLFNBQVksRUFBWjtBQUNBLFFBQUksT0FBTyxPQUFYLFFBQVcsRUFBWDtBQUVBLFFBQUksVUFBSixLQUFBO0FBRUEsV0FBQSxJQUFBLEVBQWE7QUFDWCxZQUFJLE9BQU8sUUFBWCxXQUFBO0FBRUEsZUFBQSxXQUFBLENBQUEsT0FBQTtBQUVBLFlBQUksWUFBSixJQUFBLEVBQXNCO0FBQ3BCLG1CQUFBLElBQUE7QUFDRDtBQUVELGtCQUFBLElBQUE7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQm91bmRzLCBDdXJzb3IsIFN5bWJvbERlc3Ryb3lhYmxlIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBleHBlY3QsIE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCwgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5cbmV4cG9ydCBjbGFzcyBDdXJzb3JJbXBsIGltcGxlbWVudHMgQ3Vyc29yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsIHB1YmxpYyBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+KSB7fVxufVxuXG5leHBvcnQgdHlwZSBEZXN0cm95YWJsZUJvdW5kcyA9IEJvdW5kcyAmIFN5bWJvbERlc3Ryb3lhYmxlO1xuXG5leHBvcnQgY2xhc3MgQ29uY3JldGVCb3VuZHMgaW1wbGVtZW50cyBCb3VuZHMge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGFyZW50Tm9kZTogU2ltcGxlRWxlbWVudCxcbiAgICBwcml2YXRlIGZpcnN0OiBTaW1wbGVOb2RlLFxuICAgIHByaXZhdGUgbGFzdDogU2ltcGxlTm9kZVxuICApIHt9XG5cbiAgcGFyZW50RWxlbWVudCgpOiBTaW1wbGVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnROb2RlO1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmZpcnN0O1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubGFzdDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2luZ2xlTm9kZUJvdW5kcyBpbXBsZW1lbnRzIEJvdW5kcyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyZW50Tm9kZTogU2ltcGxlRWxlbWVudCwgcHJpdmF0ZSBub2RlOiBTaW1wbGVOb2RlKSB7fVxuXG4gIHBhcmVudEVsZW1lbnQoKTogU2ltcGxlRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50Tm9kZTtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlO1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShib3VuZHM6IEJvdW5kcywgcmVmZXJlbmNlOiBPcHRpb248U2ltcGxlTm9kZT4pOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICBsZXQgcGFyZW50ID0gYm91bmRzLnBhcmVudEVsZW1lbnQoKTtcbiAgbGV0IGZpcnN0ID0gYm91bmRzLmZpcnN0Tm9kZSgpO1xuICBsZXQgbGFzdCA9IGJvdW5kcy5sYXN0Tm9kZSgpO1xuXG4gIGxldCBjdXJyZW50OiBTaW1wbGVOb2RlID0gZmlyc3Q7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBsZXQgbmV4dCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG5cbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGN1cnJlbnQsIHJlZmVyZW5jZSk7XG5cbiAgICBpZiAoY3VycmVudCA9PT0gbGFzdCkge1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfVxuXG4gICAgY3VycmVudCA9IGV4cGVjdChuZXh0LCAnaW52YWxpZCBib3VuZHMnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoYm91bmRzOiBCb3VuZHMpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICBsZXQgcGFyZW50ID0gYm91bmRzLnBhcmVudEVsZW1lbnQoKTtcbiAgbGV0IGZpcnN0ID0gYm91bmRzLmZpcnN0Tm9kZSgpO1xuICBsZXQgbGFzdCA9IGJvdW5kcy5sYXN0Tm9kZSgpO1xuXG4gIGxldCBjdXJyZW50OiBTaW1wbGVOb2RlID0gZmlyc3Q7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBsZXQgbmV4dCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG5cbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoY3VycmVudCk7XG5cbiAgICBpZiAoY3VycmVudCA9PT0gbGFzdCkge1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfVxuXG4gICAgY3VycmVudCA9IGV4cGVjdChuZXh0LCAnaW52YWxpZCBib3VuZHMnKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==