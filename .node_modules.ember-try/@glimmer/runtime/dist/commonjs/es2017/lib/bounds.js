"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.move = move;
exports.clear = clear;
class CursorImpl {
    constructor(element, nextSibling) {
        this.element = element;
        this.nextSibling = nextSibling;
    }
}
exports.CursorImpl = CursorImpl;
class ConcreteBounds {
    constructor(parentNode, first, last) {
        this.parentNode = parentNode;
        this.first = first;
        this.last = last;
    }
    parentElement() {
        return this.parentNode;
    }
    firstNode() {
        return this.first;
    }
    lastNode() {
        return this.last;
    }
}
exports.ConcreteBounds = ConcreteBounds;
class SingleNodeBounds {
    constructor(parentNode, node) {
        this.parentNode = parentNode;
        this.node = node;
    }
    parentElement() {
        return this.parentNode;
    }
    firstNode() {
        return this.node;
    }
    lastNode() {
        return this.node;
    }
}
exports.SingleNodeBounds = SingleNodeBounds;
function move(bounds, reference) {
    let parent = bounds.parentElement();
    let first = bounds.firstNode();
    let last = bounds.lastNode();
    let current = first;
    while (true) {
        let next = current.nextSibling;
        parent.insertBefore(current, reference);
        if (current === last) {
            return next;
        }
        current = next;
    }
}
function clear(bounds) {
    let parent = bounds.parentElement();
    let first = bounds.firstNode();
    let last = bounds.lastNode();
    let current = first;
    while (true) {
        let next = current.nextSibling;
        parent.removeChild(current);
        if (current === last) {
            return next;
        }
        current = next;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2JvdW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQThDTSxJLEdBQUEsSTtRQW9CQSxLLEdBQUEsSztBQTlEQSxNQUFBLFVBQUEsQ0FBaUI7QUFDckIsZ0JBQUEsT0FBQSxFQUFBLFdBQUEsRUFBaUY7QUFBOUQsYUFBQSxPQUFBLEdBQUEsT0FBQTtBQUErQixhQUFBLFdBQUEsR0FBQSxXQUFBO0FBQW1DO0FBRGhFO1FBQWpCLFUsR0FBQSxVO0FBTUEsTUFBQSxjQUFBLENBQXFCO0FBQ3pCLGdCQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUcwQjtBQUZqQixhQUFBLFVBQUEsR0FBQSxVQUFBO0FBQ0MsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFDTjtBQUVKLG9CQUFhO0FBQ1gsZUFBTyxLQUFQLFVBQUE7QUFDRDtBQUVELGdCQUFTO0FBQ1AsZUFBTyxLQUFQLEtBQUE7QUFDRDtBQUVELGVBQVE7QUFDTixlQUFPLEtBQVAsSUFBQTtBQUNEO0FBakJ3QjtRQUFyQixjLEdBQUEsYztBQW9CQSxNQUFBLGdCQUFBLENBQXVCO0FBQzNCLGdCQUFBLFVBQUEsRUFBQSxJQUFBLEVBQXVFO0FBQW5ELGFBQUEsVUFBQSxHQUFBLFVBQUE7QUFBbUMsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUFvQjtBQUUzRSxvQkFBYTtBQUNYLGVBQU8sS0FBUCxVQUFBO0FBQ0Q7QUFFRCxnQkFBUztBQUNQLGVBQU8sS0FBUCxJQUFBO0FBQ0Q7QUFFRCxlQUFRO0FBQ04sZUFBTyxLQUFQLElBQUE7QUFDRDtBQWIwQjtRQUF2QixnQixHQUFBLGdCO0FBZ0JBLFNBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLEVBQTREO0FBQ2hFLFFBQUksU0FBUyxPQUFiLGFBQWEsRUFBYjtBQUNBLFFBQUksUUFBUSxPQUFaLFNBQVksRUFBWjtBQUNBLFFBQUksT0FBTyxPQUFYLFFBQVcsRUFBWDtBQUVBLFFBQUksVUFBSixLQUFBO0FBRUEsV0FBQSxJQUFBLEVBQWE7QUFDWCxZQUFJLE9BQU8sUUFBWCxXQUFBO0FBRUEsZUFBQSxZQUFBLENBQUEsT0FBQSxFQUFBLFNBQUE7QUFFQSxZQUFJLFlBQUosSUFBQSxFQUFzQjtBQUNwQixtQkFBQSxJQUFBO0FBQ0Q7QUFFRCxrQkFBQSxJQUFBO0FBQ0Q7QUFDRjtBQUVLLFNBQUEsS0FBQSxDQUFBLE1BQUEsRUFBOEI7QUFDbEMsUUFBSSxTQUFTLE9BQWIsYUFBYSxFQUFiO0FBQ0EsUUFBSSxRQUFRLE9BQVosU0FBWSxFQUFaO0FBQ0EsUUFBSSxPQUFPLE9BQVgsUUFBVyxFQUFYO0FBRUEsUUFBSSxVQUFKLEtBQUE7QUFFQSxXQUFBLElBQUEsRUFBYTtBQUNYLFlBQUksT0FBTyxRQUFYLFdBQUE7QUFFQSxlQUFBLFdBQUEsQ0FBQSxPQUFBO0FBRUEsWUFBSSxZQUFKLElBQUEsRUFBc0I7QUFDcEIsbUJBQUEsSUFBQTtBQUNEO0FBRUQsa0JBQUEsSUFBQTtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCb3VuZHMsIEN1cnNvciwgU3ltYm9sRGVzdHJveWFibGUgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGV4cGVjdCwgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBTaW1wbGVFbGVtZW50LCBTaW1wbGVOb2RlIH0gZnJvbSAnQHNpbXBsZS1kb20vaW50ZXJmYWNlJztcblxuZXhwb3J0IGNsYXNzIEN1cnNvckltcGwgaW1wbGVtZW50cyBDdXJzb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogU2ltcGxlRWxlbWVudCwgcHVibGljIG5leHRTaWJsaW5nOiBPcHRpb248U2ltcGxlTm9kZT4pIHt9XG59XG5cbmV4cG9ydCB0eXBlIERlc3Ryb3lhYmxlQm91bmRzID0gQm91bmRzICYgU3ltYm9sRGVzdHJveWFibGU7XG5cbmV4cG9ydCBjbGFzcyBDb25jcmV0ZUJvdW5kcyBpbXBsZW1lbnRzIEJvdW5kcyB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBwYXJlbnROb2RlOiBTaW1wbGVFbGVtZW50LFxuICAgIHByaXZhdGUgZmlyc3Q6IFNpbXBsZU5vZGUsXG4gICAgcHJpdmF0ZSBsYXN0OiBTaW1wbGVOb2RlXG4gICkge31cblxuICBwYXJlbnRFbGVtZW50KCk6IFNpbXBsZUVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLnBhcmVudE5vZGU7XG4gIH1cblxuICBmaXJzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuZmlyc3Q7XG4gIH1cblxuICBsYXN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTaW5nbGVOb2RlQm91bmRzIGltcGxlbWVudHMgQm91bmRzIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJlbnROb2RlOiBTaW1wbGVFbGVtZW50LCBwcml2YXRlIG5vZGU6IFNpbXBsZU5vZGUpIHt9XG5cbiAgcGFyZW50RWxlbWVudCgpOiBTaW1wbGVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnROb2RlO1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLm5vZGU7XG4gIH1cblxuICBsYXN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlKGJvdW5kczogQm91bmRzLCByZWZlcmVuY2U6IE9wdGlvbjxTaW1wbGVOb2RlPik6IE9wdGlvbjxTaW1wbGVOb2RlPiB7XG4gIGxldCBwYXJlbnQgPSBib3VuZHMucGFyZW50RWxlbWVudCgpO1xuICBsZXQgZmlyc3QgPSBib3VuZHMuZmlyc3ROb2RlKCk7XG4gIGxldCBsYXN0ID0gYm91bmRzLmxhc3ROb2RlKCk7XG5cbiAgbGV0IGN1cnJlbnQ6IFNpbXBsZU5vZGUgPSBmaXJzdDtcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGxldCBuZXh0ID0gY3VycmVudC5uZXh0U2libGluZztcblxuICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY3VycmVudCwgcmVmZXJlbmNlKTtcblxuICAgIGlmIChjdXJyZW50ID09PSBsYXN0KSB7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9XG5cbiAgICBjdXJyZW50ID0gZXhwZWN0KG5leHQsICdpbnZhbGlkIGJvdW5kcycpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhcihib3VuZHM6IEJvdW5kcyk6IE9wdGlvbjxTaW1wbGVOb2RlPiB7XG4gIGxldCBwYXJlbnQgPSBib3VuZHMucGFyZW50RWxlbWVudCgpO1xuICBsZXQgZmlyc3QgPSBib3VuZHMuZmlyc3ROb2RlKCk7XG4gIGxldCBsYXN0ID0gYm91bmRzLmxhc3ROb2RlKCk7XG5cbiAgbGV0IGN1cnJlbnQ6IFNpbXBsZU5vZGUgPSBmaXJzdDtcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGxldCBuZXh0ID0gY3VycmVudC5uZXh0U2libGluZztcblxuICAgIHBhcmVudC5yZW1vdmVDaGlsZChjdXJyZW50KTtcblxuICAgIGlmIChjdXJyZW50ID09PSBsYXN0KSB7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9XG5cbiAgICBjdXJyZW50ID0gZXhwZWN0KG5leHQsICdpbnZhbGlkIGJvdW5kcycpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9