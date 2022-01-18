"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _env = require("@glimmer/env");

let debugToString;

if (_env.DEBUG) {
  let getFunctionName = fn => {
    let functionName = fn.name;

    if (functionName === undefined) {
      let match = Function.prototype.toString.call(fn).match(/function (\w+)\s*\(/);
      functionName = match && match[1] || '';
    }

    return functionName.replace(/^bound /, '');
  };

  let getObjectName = obj => {
    let name;
    let className;

    if (obj.constructor && obj.constructor !== Object) {
      className = getFunctionName(obj.constructor);
    }

    if ('toString' in obj && obj.toString !== Object.prototype.toString && obj.toString !== Function.prototype.toString) {
      name = obj.toString();
    } // If the class has a decent looking name, and the `toString` is one of the
    // default Ember toStrings, replace the constructor portion of the toString
    // with the class name. We check the length of the class name to prevent doing
    // this when the value is minified.


    if (name && name.match(/<.*:ember\d+>/) && className && className[0] !== '_' && className.length > 2 && className !== 'Class') {
      return name.replace(/<.*:/, `<${className}:`);
    }

    return name || className;
  };

  let getPrimitiveName = value => {
    return String(value);
  };

  debugToString = value => {
    if (typeof value === 'function') {
      return getFunctionName(value) || `(unknown function)`;
    } else if (typeof value === 'object' && value !== null) {
      return getObjectName(value) || `(unknown object)`;
    } else {
      return getPrimitiveName(value);
    }
  };
}

var _default = debugToString;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2RlYnVnLXRvLXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUEsSUFBQSxhQUFBOztBQUVBLElBQUEsVUFBQSxFQUFXO0FBQ1QsTUFBSSxlQUFlLEdBQUksRUFBRCxJQUFpQjtBQUNyQyxRQUFJLFlBQVksR0FBRyxFQUFFLENBQXJCLElBQUE7O0FBRUEsUUFBSSxZQUFZLEtBQWhCLFNBQUEsRUFBZ0M7QUFDOUIsVUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFSLFNBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxLQUFBLENBQVoscUJBQVksQ0FBWjtBQUVBLE1BQUEsWUFBWSxHQUFJLEtBQUssSUFBSSxLQUFLLENBQWYsQ0FBZSxDQUFkLElBQWhCLEVBQUE7QUFDRDs7QUFFRCxXQUFPLFlBQVksQ0FBWixPQUFBLENBQUEsU0FBQSxFQUFQLEVBQU8sQ0FBUDtBQVRGLEdBQUE7O0FBWUEsTUFBSSxhQUFhLEdBQUksR0FBRCxJQUFnQjtBQUNsQyxRQUFBLElBQUE7QUFDQSxRQUFBLFNBQUE7O0FBRUEsUUFBSSxHQUFHLENBQUgsV0FBQSxJQUFtQixHQUFHLENBQUgsV0FBQSxLQUF2QixNQUFBLEVBQW1EO0FBQ2pELE1BQUEsU0FBUyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQS9CLFdBQTJCLENBQTNCO0FBQ0Q7O0FBRUQsUUFDRSxjQUFBLEdBQUEsSUFDQSxHQUFHLENBQUgsUUFBQSxLQUFpQixNQUFNLENBQU4sU0FBQSxDQURqQixRQUFBLElBRUEsR0FBRyxDQUFILFFBQUEsS0FBaUIsUUFBUSxDQUFSLFNBQUEsQ0FIbkIsUUFBQSxFQUlFO0FBQ0EsTUFBQSxJQUFJLEdBQUcsR0FBRyxDQUFWLFFBQU8sRUFBUDtBQWJnQyxLQUFBLENBZ0JsQztBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsUUFDRSxJQUFJLElBQ0osSUFBSSxDQUFKLEtBQUEsQ0FEQSxlQUNBLENBREEsSUFBQSxTQUFBLElBR0EsU0FBUyxDQUFULENBQVMsQ0FBVCxLQUhBLEdBQUEsSUFJQSxTQUFTLENBQVQsTUFBQSxHQUpBLENBQUEsSUFLQSxTQUFTLEtBTlgsT0FBQSxFQU9FO0FBQ0EsYUFBTyxJQUFJLENBQUosT0FBQSxDQUFBLE1BQUEsRUFBcUIsSUFBSSxTQUFoQyxHQUFPLENBQVA7QUFDRDs7QUFFRCxXQUFPLElBQUksSUFBWCxTQUFBO0FBL0JGLEdBQUE7O0FBa0NBLE1BQUksZ0JBQWdCLEdBQUksS0FBRCxJQUFlO0FBQ3BDLFdBQU8sTUFBTSxDQUFiLEtBQWEsQ0FBYjtBQURGLEdBQUE7O0FBSUEsRUFBQSxhQUFhLEdBQUksS0FBRCxJQUFtQjtBQUNqQyxRQUFJLE9BQUEsS0FBQSxLQUFKLFVBQUEsRUFBaUM7QUFDL0IsYUFBTyxlQUFlLENBQWYsS0FBZSxDQUFmLElBQVAsb0JBQUE7QUFERixLQUFBLE1BRU8sSUFBSSxPQUFBLEtBQUEsS0FBQSxRQUFBLElBQTZCLEtBQUssS0FBdEMsSUFBQSxFQUFpRDtBQUN0RCxhQUFPLGFBQWEsQ0FBYixLQUFhLENBQWIsSUFBUCxrQkFBQTtBQURLLEtBQUEsTUFFQTtBQUNMLGFBQU8sZ0JBQWdCLENBQXZCLEtBQXVCLENBQXZCO0FBQ0Q7QUFQSCxHQUFBO0FBU0Q7O2VBRUQsYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERFQlVHIH0gZnJvbSAnQGdsaW1tZXIvZW52JztcblxubGV0IGRlYnVnVG9TdHJpbmc6IHVuZGVmaW5lZCB8ICgodmFsdWU6IHVua25vd24pID0+IHN0cmluZyk7XG5cbmlmIChERUJVRykge1xuICBsZXQgZ2V0RnVuY3Rpb25OYW1lID0gKGZuOiBGdW5jdGlvbikgPT4ge1xuICAgIGxldCBmdW5jdGlvbk5hbWUgPSBmbi5uYW1lO1xuXG4gICAgaWYgKGZ1bmN0aW9uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZXQgbWF0Y2ggPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmbikubWF0Y2goL2Z1bmN0aW9uIChcXHcrKVxccypcXCgvKTtcblxuICAgICAgZnVuY3Rpb25OYW1lID0gKG1hdGNoICYmIG1hdGNoWzFdKSB8fCAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb25OYW1lLnJlcGxhY2UoL15ib3VuZCAvLCAnJyk7XG4gIH07XG5cbiAgbGV0IGdldE9iamVjdE5hbWUgPSAob2JqOiBvYmplY3QpID0+IHtcbiAgICBsZXQgbmFtZTtcbiAgICBsZXQgY2xhc3NOYW1lO1xuXG4gICAgaWYgKG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgY2xhc3NOYW1lID0gZ2V0RnVuY3Rpb25OYW1lKG9iai5jb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgJ3RvU3RyaW5nJyBpbiBvYmogJiZcbiAgICAgIG9iai50b1N0cmluZyAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyAmJlxuICAgICAgb2JqLnRvU3RyaW5nICE9PSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmdcbiAgICApIHtcbiAgICAgIG5hbWUgPSBvYmoudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgY2xhc3MgaGFzIGEgZGVjZW50IGxvb2tpbmcgbmFtZSwgYW5kIHRoZSBgdG9TdHJpbmdgIGlzIG9uZSBvZiB0aGVcbiAgICAvLyBkZWZhdWx0IEVtYmVyIHRvU3RyaW5ncywgcmVwbGFjZSB0aGUgY29uc3RydWN0b3IgcG9ydGlvbiBvZiB0aGUgdG9TdHJpbmdcbiAgICAvLyB3aXRoIHRoZSBjbGFzcyBuYW1lLiBXZSBjaGVjayB0aGUgbGVuZ3RoIG9mIHRoZSBjbGFzcyBuYW1lIHRvIHByZXZlbnQgZG9pbmdcbiAgICAvLyB0aGlzIHdoZW4gdGhlIHZhbHVlIGlzIG1pbmlmaWVkLlxuICAgIGlmIChcbiAgICAgIG5hbWUgJiZcbiAgICAgIG5hbWUubWF0Y2goLzwuKjplbWJlclxcZCs+LykgJiZcbiAgICAgIGNsYXNzTmFtZSAmJlxuICAgICAgY2xhc3NOYW1lWzBdICE9PSAnXycgJiZcbiAgICAgIGNsYXNzTmFtZS5sZW5ndGggPiAyICYmXG4gICAgICBjbGFzc05hbWUgIT09ICdDbGFzcydcbiAgICApIHtcbiAgICAgIHJldHVybiBuYW1lLnJlcGxhY2UoLzwuKjovLCBgPCR7Y2xhc3NOYW1lfTpgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZSB8fCBjbGFzc05hbWU7XG4gIH07XG5cbiAgbGV0IGdldFByaW1pdGl2ZU5hbWUgPSAodmFsdWU6IGFueSkgPT4ge1xuICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICB9O1xuXG4gIGRlYnVnVG9TdHJpbmcgPSAodmFsdWU6IHVua25vd24pID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZ2V0RnVuY3Rpb25OYW1lKHZhbHVlKSB8fCBgKHVua25vd24gZnVuY3Rpb24pYDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBnZXRPYmplY3ROYW1lKHZhbHVlKSB8fCBgKHVua25vd24gb2JqZWN0KWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXRQcmltaXRpdmVOYW1lKHZhbHVlKTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlYnVnVG9TdHJpbmc7XG4iXSwic291cmNlUm9vdCI6IiJ9