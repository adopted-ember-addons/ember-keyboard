"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dict = dict;
exports.isDict = isDict;
exports.isObject = isObject;
exports.StackImpl = exports.DictSet = void 0;

var _guid = require("./guid");

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function dict() {
  return Object.create(null);
}

function isDict(u) {
  return u !== null && u !== undefined;
}

function isObject(u) {
  return typeof u === 'object' && u !== null;
}

var DictSet = /*#__PURE__*/function () {
  function DictSet() {
    this.dict = dict();
  }

  var _proto = DictSet.prototype;

  _proto.add = function add(obj) {
    if (typeof obj === 'string') this.dict[obj] = obj;else this.dict[(0, _guid.ensureGuid)(obj)] = obj;
    return this;
  };

  _proto["delete"] = function _delete(obj) {
    if (typeof obj === 'string') delete this.dict[obj];else if (obj._guid) delete this.dict[obj._guid];
  };

  return DictSet;
}();

exports.DictSet = DictSet;

var StackImpl = /*#__PURE__*/function () {
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

exports.StackImpl = StackImpl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2NvbGxlY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU00sU0FBQSxJQUFBLEdBQWM7QUFDbEIsU0FBTyxNQUFNLENBQU4sTUFBQSxDQUFQLElBQU8sQ0FBUDtBQUNEOztBQUVLLFNBQUEsTUFBQSxDQUFBLENBQUEsRUFBd0I7QUFDNUIsU0FBTyxDQUFDLEtBQUQsSUFBQSxJQUFjLENBQUMsS0FBdEIsU0FBQTtBQUNEOztBQUVLLFNBQUEsUUFBQSxDQUFBLENBQUEsRUFBMEI7QUFDOUIsU0FBTyxPQUFBLENBQUEsS0FBQSxRQUFBLElBQXlCLENBQUMsS0FBakMsSUFBQTtBQUNEOztBQUlELElBQU0sT0FBTixHQUFBLGFBQUEsWUFBQTtBQUdFLFdBQUEsT0FBQSxHQUFBO0FBQ0UsU0FBQSxJQUFBLEdBQVksSUFBWixFQUFBO0FBQ0Q7O0FBTEgsTUFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLFNBQUE7O0FBQUEsRUFBQSxNQUFBLENBQUEsR0FBQSxHQU9FLFNBQUEsR0FBQSxDQUFBLEdBQUEsRUFBVTtBQUNSLFFBQUksT0FBQSxHQUFBLEtBQUosUUFBQSxFQUE2QixLQUFBLElBQUEsQ0FBQSxHQUFBLElBQTdCLEdBQTZCLENBQTdCLEtBQ0ssS0FBQSxJQUFBLENBQVUsc0JBQVYsR0FBVSxDQUFWLElBQUEsR0FBQTtBQUNMLFdBQUEsSUFBQTtBQVZKLEdBQUE7O0FBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLEdBYUUsU0FBQSxPQUFBLENBQUEsR0FBQSxFQUFhO0FBQ1gsUUFBSSxPQUFBLEdBQUEsS0FBSixRQUFBLEVBQTZCLE9BQU8sS0FBQSxJQUFBLENBQXBDLEdBQW9DLENBQVAsQ0FBN0IsS0FDSyxJQUFLLEdBQVcsQ0FBaEIsS0FBQSxFQUF3QixPQUFPLEtBQUEsSUFBQSxDQUFXLEdBQVcsQ0FBN0IsS0FBTyxDQUFQO0FBZmpDLEdBQUE7O0FBQUEsU0FBQSxPQUFBO0FBQUEsQ0FBQSxFQUFBOzs7O0FBbUJBLElBQU0sU0FBTixHQUFBLGFBQUEsWUFBQTtBQUFBLFdBQUEsU0FBQSxHQUFBO0FBQ1UsU0FBQSxLQUFBLEdBQUEsRUFBQTtBQUNELFNBQUEsT0FBQSxHQUFBLElBQUE7QUErQlI7O0FBakNELE1BQUEsT0FBQSxHQUFBLFNBQUEsQ0FBQSxTQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFBLElBQUEsR0FRRSxTQUFBLElBQUEsQ0FBQSxJQUFBLEVBQVk7QUFDVixTQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLElBQUE7QUFWSixHQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFBLEdBQUEsR0FhRSxTQUFBLEdBQUEsR0FBRztBQUNELFFBQUksSUFBSSxHQUFHLEtBQUEsS0FBQSxDQUFYLEdBQVcsRUFBWDtBQUNBLFFBQUksR0FBRyxHQUFHLEtBQUEsS0FBQSxDQUFWLE1BQUE7QUFDQSxTQUFBLE9BQUEsR0FBZSxHQUFHLEtBQUgsQ0FBQSxHQUFBLElBQUEsR0FBbUIsS0FBQSxLQUFBLENBQVcsR0FBRyxHQUFoRCxDQUFrQyxDQUFsQztBQUVBLFdBQU8sSUFBSSxLQUFKLFNBQUEsR0FBQSxJQUFBLEdBQVAsSUFBQTtBQWxCSixHQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFBLEdBQUEsR0FxQkUsU0FBQSxHQUFBLENBQUEsSUFBQSxFQUFnQjtBQUNkLFFBQUksR0FBRyxHQUFHLEtBQUEsS0FBQSxDQUFWLE1BQUE7QUFDQSxXQUFPLEdBQUcsR0FBSCxJQUFBLEdBQUEsSUFBQSxHQUFvQixLQUFBLEtBQUEsQ0FBVyxHQUFHLEdBQXpDLElBQTJCLENBQTNCO0FBdkJKLEdBQUE7O0FBQUEsRUFBQSxPQUFBLENBQUEsT0FBQSxHQTBCRSxTQUFBLE9BQUEsR0FBTztBQUNMLFdBQU8sS0FBQSxLQUFBLENBQUEsTUFBQSxLQUFQLENBQUE7QUEzQkosR0FBQTs7QUFBQSxFQUFBLE9BQUEsQ0FBQSxPQUFBLEdBOEJFLFNBQUEsT0FBQSxHQUFPO0FBQ0wsV0FBTyxLQUFQLEtBQUE7QUEvQkosR0FBQTs7QUFBQSxFQUFBLFlBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtBQUFBLElBQUEsR0FBQSxFQUFBLE1BQUE7QUFBQSxJQUFBLEdBQUEsRUFBQSxTQUFBLEdBQUEsR0FJaUI7QUFDYixhQUFPLEtBQUEsS0FBQSxDQUFQLE1BQUE7QUFDRDtBQU5ILEdBQUEsQ0FBQSxDQUFBOztBQUFBLFNBQUEsU0FBQTtBQUFBLENBQUEsRUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEhhc0d1aWQsIGVuc3VyZUd1aWQgfSBmcm9tICcuL2d1aWQnO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnLi9wbGF0Zm9ybS11dGlscyc7XG5pbXBvcnQgeyBEaWN0LCBTdGFjayB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNldDxUPiB7XG4gIGFkZCh2YWx1ZTogVCk6IFNldDxUPjtcbiAgZGVsZXRlKHZhbHVlOiBUKTogdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpY3Q8VCA9IHVua25vd24+KCk6IERpY3Q8VD4ge1xuICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGljdDxUPih1OiBUKTogdSBpcyBEaWN0ICYgVCB7XG4gIHJldHVybiB1ICE9PSBudWxsICYmIHUgIT09IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0PFQ+KHU6IFQpOiB1IGlzIG9iamVjdCAmIFQge1xuICByZXR1cm4gdHlwZW9mIHUgPT09ICdvYmplY3QnICYmIHUgIT09IG51bGw7XG59XG5cbmV4cG9ydCB0eXBlIFNldE1lbWJlciA9IEhhc0d1aWQgfCBzdHJpbmc7XG5cbmV4cG9ydCBjbGFzcyBEaWN0U2V0PFQgZXh0ZW5kcyBTZXRNZW1iZXI+IGltcGxlbWVudHMgU2V0PFQ+IHtcbiAgcHJpdmF0ZSBkaWN0OiBEaWN0PFQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGljdCA9IGRpY3Q8VD4oKTtcbiAgfVxuXG4gIGFkZChvYmo6IFQpOiBTZXQ8VD4ge1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykgdGhpcy5kaWN0W29iaiBhcyBhbnldID0gb2JqO1xuICAgIGVsc2UgdGhpcy5kaWN0W2Vuc3VyZUd1aWQob2JqIGFzIGFueSldID0gb2JqO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGVsZXRlKG9iajogVCkge1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykgZGVsZXRlIHRoaXMuZGljdFtvYmogYXMgYW55XTtcbiAgICBlbHNlIGlmICgob2JqIGFzIGFueSkuX2d1aWQpIGRlbGV0ZSB0aGlzLmRpY3RbKG9iaiBhcyBhbnkpLl9ndWlkXTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3RhY2tJbXBsPFQ+IGltcGxlbWVudHMgU3RhY2s8VD4ge1xuICBwcml2YXRlIHN0YWNrOiBUW10gPSBbXTtcbiAgcHVibGljIGN1cnJlbnQ6IE9wdGlvbjxUPiA9IG51bGw7XG5cbiAgcHVibGljIGdldCBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLnN0YWNrLmxlbmd0aDtcbiAgfVxuXG4gIHB1c2goaXRlbTogVCkge1xuICAgIHRoaXMuY3VycmVudCA9IGl0ZW07XG4gICAgdGhpcy5zdGFjay5wdXNoKGl0ZW0pO1xuICB9XG5cbiAgcG9wKCk6IE9wdGlvbjxUPiB7XG4gICAgbGV0IGl0ZW0gPSB0aGlzLnN0YWNrLnBvcCgpO1xuICAgIGxldCBsZW4gPSB0aGlzLnN0YWNrLmxlbmd0aDtcbiAgICB0aGlzLmN1cnJlbnQgPSBsZW4gPT09IDAgPyBudWxsIDogdGhpcy5zdGFja1tsZW4gLSAxXTtcblxuICAgIHJldHVybiBpdGVtID09PSB1bmRlZmluZWQgPyBudWxsIDogaXRlbTtcbiAgfVxuXG4gIG50aChmcm9tOiBudW1iZXIpOiBPcHRpb248VD4ge1xuICAgIGxldCBsZW4gPSB0aGlzLnN0YWNrLmxlbmd0aDtcbiAgICByZXR1cm4gbGVuIDwgZnJvbSA/IG51bGwgOiB0aGlzLnN0YWNrW2xlbiAtIGZyb21dO1xuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zdGFjay5sZW5ndGggPT09IDA7XG4gIH1cblxuICB0b0FycmF5KCk6IFRbXSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2s7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=