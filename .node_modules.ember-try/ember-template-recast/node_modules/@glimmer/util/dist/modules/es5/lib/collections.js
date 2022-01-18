function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { ensureGuid } from './guid';
export function dict() {
  return Object.create(null);
}
export function isDict(u) {
  return u !== null && u !== undefined;
}
export function isObject(u) {
  return typeof u === 'object' && u !== null;
}
export var DictSet = /*#__PURE__*/function () {
  function DictSet() {
    this.dict = dict();
  }

  var _proto = DictSet.prototype;

  _proto.add = function add(obj) {
    if (typeof obj === 'string') this.dict[obj] = obj;else this.dict[ensureGuid(obj)] = obj;
    return this;
  };

  _proto["delete"] = function _delete(obj) {
    if (typeof obj === 'string') delete this.dict[obj];else if (obj._guid) delete this.dict[obj._guid];
  };

  return DictSet;
}();
export var StackImpl = /*#__PURE__*/function () {
  function StackImpl() {
    this.stack = [];
    this.current = null;
  }

  var _proto2 = StackImpl.prototype;

  _proto2.push = function push(item) {
    this.current = item;
    this.stack.push(item);
  };

  _proto2.pop = function pop() {
    var item = this.stack.pop();
    var len = this.stack.length;
    this.current = len === 0 ? null : this.stack[len - 1];
    return item === undefined ? null : item;
  };

  _proto2.nth = function nth(from) {
    var len = this.stack.length;
    return len < from ? null : this.stack[len - from];
  };

  _proto2.isEmpty = function isEmpty() {
    return this.stack.length === 0;
  };

  _proto2.toArray = function toArray() {
    return this.stack;
  };

  _createClass(StackImpl, [{
    key: "size",
    get: function get() {
      return this.stack.length;
    }
  }]);

  return StackImpl;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2NvbGxlY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxTQUFBLFVBQUEsUUFBQSxRQUFBO0FBU0EsT0FBTSxTQUFBLElBQUEsR0FBYztBQUNsQixTQUFPLE1BQU0sQ0FBTixNQUFBLENBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFFRCxPQUFNLFNBQUEsTUFBQSxDQUFBLENBQUEsRUFBd0I7QUFDNUIsU0FBTyxDQUFDLEtBQUQsSUFBQSxJQUFjLENBQUMsS0FBdEIsU0FBQTtBQUNEO0FBRUQsT0FBTSxTQUFBLFFBQUEsQ0FBQSxDQUFBLEVBQTBCO0FBQzlCLFNBQU8sT0FBQSxDQUFBLEtBQUEsUUFBQSxJQUF5QixDQUFDLEtBQWpDLElBQUE7QUFDRDtBQUlELFdBQU0sT0FBTjtBQUdFLHFCQUFBO0FBQ0UsU0FBQSxJQUFBLEdBQVksSUFBWixFQUFBO0FBQ0Q7O0FBTEg7O0FBQUEsU0FPRSxHQVBGLEdBT0UsYUFBRyxHQUFILEVBQVU7QUFDUixRQUFJLE9BQUEsR0FBQSxLQUFKLFFBQUEsRUFBNkIsS0FBQSxJQUFBLENBQUEsR0FBQSxJQUE3QixHQUE2QixDQUE3QixLQUNLLEtBQUEsSUFBQSxDQUFVLFVBQVUsQ0FBcEIsR0FBb0IsQ0FBcEIsSUFBQSxHQUFBO0FBQ0wsV0FBQSxJQUFBO0FBQ0QsR0FYSDs7QUFBQSxxQkFhRSxpQkFBTSxHQUFOLEVBQWE7QUFDWCxRQUFJLE9BQUEsR0FBQSxLQUFKLFFBQUEsRUFBNkIsT0FBTyxLQUFBLElBQUEsQ0FBcEMsR0FBb0MsQ0FBUCxDQUE3QixLQUNLLElBQUssR0FBVyxDQUFoQixLQUFBLEVBQXdCLE9BQU8sS0FBQSxJQUFBLENBQVcsR0FBVyxDQUE3QixLQUFPLENBQVA7QUFDOUIsR0FoQkg7O0FBQUE7QUFBQTtBQW1CQSxXQUFNLFNBQU47QUFBQSx1QkFBQTtBQUNVLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDRCxTQUFBLE9BQUEsR0FBQSxJQUFBO0FBK0JSOztBQWpDRDs7QUFBQSxVQVFFLElBUkYsR0FRRSxjQUFJLElBQUosRUFBWTtBQUNWLFNBQUEsT0FBQSxHQUFBLElBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQTtBQUNELEdBWEg7O0FBQUEsVUFhRSxHQWJGLEdBYUUsZUFBRztBQUNELFFBQUksSUFBSSxHQUFHLEtBQUEsS0FBQSxDQUFYLEdBQVcsRUFBWDtBQUNBLFFBQUksR0FBRyxHQUFHLEtBQUEsS0FBQSxDQUFWLE1BQUE7QUFDQSxTQUFBLE9BQUEsR0FBZSxHQUFHLEtBQUgsQ0FBQSxHQUFBLElBQUEsR0FBbUIsS0FBQSxLQUFBLENBQVcsR0FBRyxHQUFoRCxDQUFrQyxDQUFsQztBQUVBLFdBQU8sSUFBSSxLQUFKLFNBQUEsR0FBQSxJQUFBLEdBQVAsSUFBQTtBQUNELEdBbkJIOztBQUFBLFVBcUJFLEdBckJGLEdBcUJFLGFBQUcsSUFBSCxFQUFnQjtBQUNkLFFBQUksR0FBRyxHQUFHLEtBQUEsS0FBQSxDQUFWLE1BQUE7QUFDQSxXQUFPLEdBQUcsR0FBSCxJQUFBLEdBQUEsSUFBQSxHQUFvQixLQUFBLEtBQUEsQ0FBVyxHQUFHLEdBQXpDLElBQTJCLENBQTNCO0FBQ0QsR0F4Qkg7O0FBQUEsVUEwQkUsT0ExQkYsR0EwQkUsbUJBQU87QUFDTCxXQUFPLEtBQUEsS0FBQSxDQUFBLE1BQUEsS0FBUCxDQUFBO0FBQ0QsR0E1Qkg7O0FBQUEsVUE4QkUsT0E5QkYsR0E4QkUsbUJBQU87QUFDTCxXQUFPLEtBQVAsS0FBQTtBQUNELEdBaENIOztBQUFBO0FBQUE7QUFBQSx3QkFJaUI7QUFDYixhQUFPLEtBQUEsS0FBQSxDQUFQLE1BQUE7QUFDRDtBQU5IOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIYXNHdWlkLCBlbnN1cmVHdWlkIH0gZnJvbSAnLi9ndWlkJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJy4vcGxhdGZvcm0tdXRpbHMnO1xuaW1wb3J0IHsgRGljdCwgU3RhY2sgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXQ8VD4ge1xuICBhZGQodmFsdWU6IFQpOiBTZXQ8VD47XG4gIGRlbGV0ZSh2YWx1ZTogVCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWN0PFQgPSB1bmtub3duPigpOiBEaWN0PFQ+IHtcbiAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RpY3Q8VD4odTogVCk6IHUgaXMgRGljdCAmIFQge1xuICByZXR1cm4gdSAhPT0gbnVsbCAmJiB1ICE9PSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdDxUPih1OiBUKTogdSBpcyBvYmplY3QgJiBUIHtcbiAgcmV0dXJuIHR5cGVvZiB1ID09PSAnb2JqZWN0JyAmJiB1ICE9PSBudWxsO1xufVxuXG5leHBvcnQgdHlwZSBTZXRNZW1iZXIgPSBIYXNHdWlkIHwgc3RyaW5nO1xuXG5leHBvcnQgY2xhc3MgRGljdFNldDxUIGV4dGVuZHMgU2V0TWVtYmVyPiBpbXBsZW1lbnRzIFNldDxUPiB7XG4gIHByaXZhdGUgZGljdDogRGljdDxUPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmRpY3QgPSBkaWN0PFQ+KCk7XG4gIH1cblxuICBhZGQob2JqOiBUKTogU2V0PFQ+IHtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHRoaXMuZGljdFtvYmogYXMgYW55XSA9IG9iajtcbiAgICBlbHNlIHRoaXMuZGljdFtlbnN1cmVHdWlkKG9iaiBhcyBhbnkpXSA9IG9iajtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlbGV0ZShvYmo6IFQpIHtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIGRlbGV0ZSB0aGlzLmRpY3Rbb2JqIGFzIGFueV07XG4gICAgZWxzZSBpZiAoKG9iaiBhcyBhbnkpLl9ndWlkKSBkZWxldGUgdGhpcy5kaWN0WyhvYmogYXMgYW55KS5fZ3VpZF07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN0YWNrSW1wbDxUPiBpbXBsZW1lbnRzIFN0YWNrPFQ+IHtcbiAgcHJpdmF0ZSBzdGFjazogVFtdID0gW107XG4gIHB1YmxpYyBjdXJyZW50OiBPcHRpb248VD4gPSBudWxsO1xuXG4gIHB1YmxpYyBnZXQgc2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjay5sZW5ndGg7XG4gIH1cblxuICBwdXNoKGl0ZW06IFQpIHtcbiAgICB0aGlzLmN1cnJlbnQgPSBpdGVtO1xuICAgIHRoaXMuc3RhY2sucHVzaChpdGVtKTtcbiAgfVxuXG4gIHBvcCgpOiBPcHRpb248VD4ge1xuICAgIGxldCBpdGVtID0gdGhpcy5zdGFjay5wb3AoKTtcbiAgICBsZXQgbGVuID0gdGhpcy5zdGFjay5sZW5ndGg7XG4gICAgdGhpcy5jdXJyZW50ID0gbGVuID09PSAwID8gbnVsbCA6IHRoaXMuc3RhY2tbbGVuIC0gMV07XG5cbiAgICByZXR1cm4gaXRlbSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGl0ZW07XG4gIH1cblxuICBudGgoZnJvbTogbnVtYmVyKTogT3B0aW9uPFQ+IHtcbiAgICBsZXQgbGVuID0gdGhpcy5zdGFjay5sZW5ndGg7XG4gICAgcmV0dXJuIGxlbiA8IGZyb20gPyBudWxsIDogdGhpcy5zdGFja1tsZW4gLSBmcm9tXTtcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2subGVuZ3RoID09PSAwO1xuICB9XG5cbiAgdG9BcnJheSgpOiBUW10ge1xuICAgIHJldHVybiB0aGlzLnN0YWNrO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9