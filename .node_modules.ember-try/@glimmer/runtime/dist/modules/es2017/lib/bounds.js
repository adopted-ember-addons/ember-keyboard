
export class CursorImpl {
    constructor(element, nextSibling) {
        this.element = element;
        this.nextSibling = nextSibling;
    }
}
export class ConcreteBounds {
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
export class SingleNodeBounds {
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
export function move(bounds, reference) {
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
export function clear(bounds) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3J1bnRpbWUvbGliL2JvdW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO09BSU0sTUFBTyxVQUFQLENBQWlCO0FBQ3JCLGdCQUFtQixPQUFuQixFQUFrRCxXQUFsRCxFQUFpRjtBQUE5RCxhQUFBLE9BQUEsR0FBQSxPQUFBO0FBQStCLGFBQUEsV0FBQSxHQUFBLFdBQUE7QUFBbUM7QUFEaEU7QUFNdkIsT0FBTSxNQUFPLGNBQVAsQ0FBcUI7QUFDekIsZ0JBQ1MsVUFEVCxFQUVVLEtBRlYsRUFHVSxJQUhWLEVBRzBCO0FBRmpCLGFBQUEsVUFBQSxHQUFBLFVBQUE7QUFDQyxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNOO0FBRUosb0JBQWE7QUFDWCxlQUFPLEtBQUssVUFBWjtBQUNEO0FBRUQsZ0JBQVM7QUFDUCxlQUFPLEtBQUssS0FBWjtBQUNEO0FBRUQsZUFBUTtBQUNOLGVBQU8sS0FBSyxJQUFaO0FBQ0Q7QUFqQndCO0FBb0IzQixPQUFNLE1BQU8sZ0JBQVAsQ0FBdUI7QUFDM0IsZ0JBQW9CLFVBQXBCLEVBQXVELElBQXZELEVBQXVFO0FBQW5ELGFBQUEsVUFBQSxHQUFBLFVBQUE7QUFBbUMsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUFvQjtBQUUzRSxvQkFBYTtBQUNYLGVBQU8sS0FBSyxVQUFaO0FBQ0Q7QUFFRCxnQkFBUztBQUNQLGVBQU8sS0FBSyxJQUFaO0FBQ0Q7QUFFRCxlQUFRO0FBQ04sZUFBTyxLQUFLLElBQVo7QUFDRDtBQWIwQjtBQWdCN0IsT0FBTSxTQUFVLElBQVYsQ0FBZSxNQUFmLEVBQStCLFNBQS9CLEVBQTREO0FBQ2hFLFFBQUksU0FBUyxPQUFPLGFBQVAsRUFBYjtBQUNBLFFBQUksUUFBUSxPQUFPLFNBQVAsRUFBWjtBQUNBLFFBQUksT0FBTyxPQUFPLFFBQVAsRUFBWDtBQUVBLFFBQUksVUFBc0IsS0FBMUI7QUFFQSxXQUFPLElBQVAsRUFBYTtBQUNYLFlBQUksT0FBTyxRQUFRLFdBQW5CO0FBRUEsZUFBTyxZQUFQLENBQW9CLE9BQXBCLEVBQTZCLFNBQTdCO0FBRUEsWUFBSSxZQUFZLElBQWhCLEVBQXNCO0FBQ3BCLG1CQUFPLElBQVA7QUFDRDtBQUVELGtCQUFpQixJQUFqQjtBQUNEO0FBQ0Y7QUFFRCxPQUFNLFNBQVUsS0FBVixDQUFnQixNQUFoQixFQUE4QjtBQUNsQyxRQUFJLFNBQVMsT0FBTyxhQUFQLEVBQWI7QUFDQSxRQUFJLFFBQVEsT0FBTyxTQUFQLEVBQVo7QUFDQSxRQUFJLE9BQU8sT0FBTyxRQUFQLEVBQVg7QUFFQSxRQUFJLFVBQXNCLEtBQTFCO0FBRUEsV0FBTyxJQUFQLEVBQWE7QUFDWCxZQUFJLE9BQU8sUUFBUSxXQUFuQjtBQUVBLGVBQU8sV0FBUCxDQUFtQixPQUFuQjtBQUVBLFlBQUksWUFBWSxJQUFoQixFQUFzQjtBQUNwQixtQkFBTyxJQUFQO0FBQ0Q7QUFFRCxrQkFBaUIsSUFBakI7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQm91bmRzLCBDdXJzb3IsIFN5bWJvbERlc3Ryb3lhYmxlIH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBleHBlY3QsIE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgU2ltcGxlRWxlbWVudCwgU2ltcGxlTm9kZSB9IGZyb20gJ0BzaW1wbGUtZG9tL2ludGVyZmFjZSc7XG5cbmV4cG9ydCBjbGFzcyBDdXJzb3JJbXBsIGltcGxlbWVudHMgQ3Vyc29yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IFNpbXBsZUVsZW1lbnQsIHB1YmxpYyBuZXh0U2libGluZzogT3B0aW9uPFNpbXBsZU5vZGU+KSB7fVxufVxuXG5leHBvcnQgdHlwZSBEZXN0cm95YWJsZUJvdW5kcyA9IEJvdW5kcyAmIFN5bWJvbERlc3Ryb3lhYmxlO1xuXG5leHBvcnQgY2xhc3MgQ29uY3JldGVCb3VuZHMgaW1wbGVtZW50cyBCb3VuZHMge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcGFyZW50Tm9kZTogU2ltcGxlRWxlbWVudCxcbiAgICBwcml2YXRlIGZpcnN0OiBTaW1wbGVOb2RlLFxuICAgIHByaXZhdGUgbGFzdDogU2ltcGxlTm9kZVxuICApIHt9XG5cbiAgcGFyZW50RWxlbWVudCgpOiBTaW1wbGVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnROb2RlO1xuICB9XG5cbiAgZmlyc3ROb2RlKCk6IFNpbXBsZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmZpcnN0O1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubGFzdDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2luZ2xlTm9kZUJvdW5kcyBpbXBsZW1lbnRzIEJvdW5kcyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyZW50Tm9kZTogU2ltcGxlRWxlbWVudCwgcHJpdmF0ZSBub2RlOiBTaW1wbGVOb2RlKSB7fVxuXG4gIHBhcmVudEVsZW1lbnQoKTogU2ltcGxlRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50Tm9kZTtcbiAgfVxuXG4gIGZpcnN0Tm9kZSgpOiBTaW1wbGVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlO1xuICB9XG5cbiAgbGFzdE5vZGUoKTogU2ltcGxlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShib3VuZHM6IEJvdW5kcywgcmVmZXJlbmNlOiBPcHRpb248U2ltcGxlTm9kZT4pOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICBsZXQgcGFyZW50ID0gYm91bmRzLnBhcmVudEVsZW1lbnQoKTtcbiAgbGV0IGZpcnN0ID0gYm91bmRzLmZpcnN0Tm9kZSgpO1xuICBsZXQgbGFzdCA9IGJvdW5kcy5sYXN0Tm9kZSgpO1xuXG4gIGxldCBjdXJyZW50OiBTaW1wbGVOb2RlID0gZmlyc3Q7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBsZXQgbmV4dCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG5cbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGN1cnJlbnQsIHJlZmVyZW5jZSk7XG5cbiAgICBpZiAoY3VycmVudCA9PT0gbGFzdCkge1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfVxuXG4gICAgY3VycmVudCA9IGV4cGVjdChuZXh0LCAnaW52YWxpZCBib3VuZHMnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoYm91bmRzOiBCb3VuZHMpOiBPcHRpb248U2ltcGxlTm9kZT4ge1xuICBsZXQgcGFyZW50ID0gYm91bmRzLnBhcmVudEVsZW1lbnQoKTtcbiAgbGV0IGZpcnN0ID0gYm91bmRzLmZpcnN0Tm9kZSgpO1xuICBsZXQgbGFzdCA9IGJvdW5kcy5sYXN0Tm9kZSgpO1xuXG4gIGxldCBjdXJyZW50OiBTaW1wbGVOb2RlID0gZmlyc3Q7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBsZXQgbmV4dCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG5cbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoY3VycmVudCk7XG5cbiAgICBpZiAoY3VycmVudCA9PT0gbGFzdCkge1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfVxuXG4gICAgY3VycmVudCA9IGV4cGVjdChuZXh0LCAnaW52YWxpZCBib3VuZHMnKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==