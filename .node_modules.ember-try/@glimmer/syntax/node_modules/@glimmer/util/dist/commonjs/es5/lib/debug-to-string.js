"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _env = require("@glimmer/env");

var debugToString;

if (_env.DEBUG) {
  var getFunctionName = function getFunctionName(fn) {
    var functionName = fn.name;

    if (functionName === undefined) {
      var match = Function.prototype.toString.call(fn).match(/function (\w+)\s*\(/);
      functionName = match && match[1] || '';
    }

    return functionName.replace(/^bound /, '');
  };

  var getObjectName = function getObjectName(obj) {
    var name;
    var className;

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
      return name.replace(/<.*:/, "<" + className + ":");
    }

    return name || className;
  };

  var getPrimitiveName = function getPrimitiveName(value) {
    return String(value);
  };

  debugToString = function debugToString(value) {
    if (typeof value === 'function') {
      return getFunctionName(value) || "(unknown function)";
    } else if (typeof value === 'object' && value !== null) {
      return getObjectName(value) || "(unknown object)";
    } else {
      return getPrimitiveName(value);
    }
  };
}

var _default = debugToString;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2RlYnVnLXRvLXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUEsSUFBQSxhQUFBOztBQUVBLElBQUEsVUFBQSxFQUFXO0FBQ1QsTUFBSSxlQUFlLEdBQUksU0FBbkIsZUFBbUIsQ0FBRCxFQUFDLEVBQWdCO0FBQ3JDLFFBQUksWUFBWSxHQUFHLEVBQUUsQ0FBckIsSUFBQTs7QUFFQSxRQUFJLFlBQVksS0FBaEIsU0FBQSxFQUFnQztBQUM5QixVQUFJLEtBQUssR0FBRyxRQUFRLENBQVIsU0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLEtBQUEsQ0FBWixxQkFBWSxDQUFaO0FBRUEsTUFBQSxZQUFZLEdBQUksS0FBSyxJQUFJLEtBQUssQ0FBZixDQUFlLENBQWQsSUFBaEIsRUFBQTtBQUNEOztBQUVELFdBQU8sWUFBWSxDQUFaLE9BQUEsQ0FBQSxTQUFBLEVBQVAsRUFBTyxDQUFQO0FBVEYsR0FBQTs7QUFZQSxNQUFJLGFBQWEsR0FBSSxTQUFqQixhQUFpQixDQUFELEdBQUMsRUFBZTtBQUNsQyxRQUFBLElBQUE7QUFDQSxRQUFBLFNBQUE7O0FBRUEsUUFBSSxHQUFHLENBQUgsV0FBQSxJQUFtQixHQUFHLENBQUgsV0FBQSxLQUF2QixNQUFBLEVBQW1EO0FBQ2pELE1BQUEsU0FBUyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQS9CLFdBQTJCLENBQTNCO0FBQ0Q7O0FBRUQsUUFDRSxjQUFBLEdBQUEsSUFDQSxHQUFHLENBQUgsUUFBQSxLQUFpQixNQUFNLENBQU4sU0FBQSxDQURqQixRQUFBLElBRUEsR0FBRyxDQUFILFFBQUEsS0FBaUIsUUFBUSxDQUFSLFNBQUEsQ0FIbkIsUUFBQSxFQUlFO0FBQ0EsTUFBQSxJQUFJLEdBQUcsR0FBRyxDQUFWLFFBQU8sRUFBUDtBQWJnQyxLQUFBLENBZ0JsQztBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsUUFDRSxJQUFJLElBQ0osSUFBSSxDQUFKLEtBQUEsQ0FEQSxlQUNBLENBREEsSUFBQSxTQUFBLElBR0EsU0FBUyxDQUFULENBQVMsQ0FBVCxLQUhBLEdBQUEsSUFJQSxTQUFTLENBQVQsTUFBQSxHQUpBLENBQUEsSUFLQSxTQUFTLEtBTlgsT0FBQSxFQU9FO0FBQ0EsYUFBTyxJQUFJLENBQUosT0FBQSxDQUFBLE1BQUEsRUFBQSxNQUFQLFNBQU8sR0FBUCxHQUFPLENBQVA7QUFDRDs7QUFFRCxXQUFPLElBQUksSUFBWCxTQUFBO0FBL0JGLEdBQUE7O0FBa0NBLE1BQUksZ0JBQWdCLEdBQUksU0FBcEIsZ0JBQW9CLENBQUQsS0FBQyxFQUFjO0FBQ3BDLFdBQU8sTUFBTSxDQUFiLEtBQWEsQ0FBYjtBQURGLEdBQUE7O0FBSUEsRUFBQSxhQUFhLEdBQUksU0FBQSxhQUFBLENBQUQsS0FBQyxFQUFrQjtBQUNqQyxRQUFJLE9BQUEsS0FBQSxLQUFKLFVBQUEsRUFBaUM7QUFDL0IsYUFBTyxlQUFlLENBQXRCLEtBQXNCLENBQWYsSUFBUCxvQkFBQTtBQURGLEtBQUEsTUFFTyxJQUFJLE9BQUEsS0FBQSxLQUFBLFFBQUEsSUFBNkIsS0FBSyxLQUF0QyxJQUFBLEVBQWlEO0FBQ3RELGFBQU8sYUFBYSxDQUFwQixLQUFvQixDQUFiLElBQVAsa0JBQUE7QUFESyxLQUFBLE1BRUE7QUFDTCxhQUFPLGdCQUFnQixDQUF2QixLQUF1QixDQUF2QjtBQUNEO0FBUEgsR0FBQTtBQVNEOztlQUVELGEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2Vudic7XG5cbmxldCBkZWJ1Z1RvU3RyaW5nOiB1bmRlZmluZWQgfCAoKHZhbHVlOiB1bmtub3duKSA9PiBzdHJpbmcpO1xuXG5pZiAoREVCVUcpIHtcbiAgbGV0IGdldEZ1bmN0aW9uTmFtZSA9IChmbjogRnVuY3Rpb24pID0+IHtcbiAgICBsZXQgZnVuY3Rpb25OYW1lID0gZm4ubmFtZTtcblxuICAgIGlmIChmdW5jdGlvbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbGV0IG1hdGNoID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZm4pLm1hdGNoKC9mdW5jdGlvbiAoXFx3KylcXHMqXFwoLyk7XG5cbiAgICAgIGZ1bmN0aW9uTmFtZSA9IChtYXRjaCAmJiBtYXRjaFsxXSkgfHwgJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uTmFtZS5yZXBsYWNlKC9eYm91bmQgLywgJycpO1xuICB9O1xuXG4gIGxldCBnZXRPYmplY3ROYW1lID0gKG9iajogb2JqZWN0KSA9PiB7XG4gICAgbGV0IG5hbWU7XG4gICAgbGV0IGNsYXNzTmFtZTtcblxuICAgIGlmIChvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHtcbiAgICAgIGNsYXNzTmFtZSA9IGdldEZ1bmN0aW9uTmFtZShvYmouY29uc3RydWN0b3IpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICd0b1N0cmluZycgaW4gb2JqICYmXG4gICAgICBvYmoudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgJiZcbiAgICAgIG9iai50b1N0cmluZyAhPT0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nXG4gICAgKSB7XG4gICAgICBuYW1lID0gb2JqLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGNsYXNzIGhhcyBhIGRlY2VudCBsb29raW5nIG5hbWUsIGFuZCB0aGUgYHRvU3RyaW5nYCBpcyBvbmUgb2YgdGhlXG4gICAgLy8gZGVmYXVsdCBFbWJlciB0b1N0cmluZ3MsIHJlcGxhY2UgdGhlIGNvbnN0cnVjdG9yIHBvcnRpb24gb2YgdGhlIHRvU3RyaW5nXG4gICAgLy8gd2l0aCB0aGUgY2xhc3MgbmFtZS4gV2UgY2hlY2sgdGhlIGxlbmd0aCBvZiB0aGUgY2xhc3MgbmFtZSB0byBwcmV2ZW50IGRvaW5nXG4gICAgLy8gdGhpcyB3aGVuIHRoZSB2YWx1ZSBpcyBtaW5pZmllZC5cbiAgICBpZiAoXG4gICAgICBuYW1lICYmXG4gICAgICBuYW1lLm1hdGNoKC88Lio6ZW1iZXJcXGQrPi8pICYmXG4gICAgICBjbGFzc05hbWUgJiZcbiAgICAgIGNsYXNzTmFtZVswXSAhPT0gJ18nICYmXG4gICAgICBjbGFzc05hbWUubGVuZ3RoID4gMiAmJlxuICAgICAgY2xhc3NOYW1lICE9PSAnQ2xhc3MnXG4gICAgKSB7XG4gICAgICByZXR1cm4gbmFtZS5yZXBsYWNlKC88Lio6LywgYDwke2NsYXNzTmFtZX06YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWUgfHwgY2xhc3NOYW1lO1xuICB9O1xuXG4gIGxldCBnZXRQcmltaXRpdmVOYW1lID0gKHZhbHVlOiBhbnkpID0+IHtcbiAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgfTtcblxuICBkZWJ1Z1RvU3RyaW5nID0gKHZhbHVlOiB1bmtub3duKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGdldEZ1bmN0aW9uTmFtZSh2YWx1ZSkgfHwgYCh1bmtub3duIGZ1bmN0aW9uKWA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZ2V0T2JqZWN0TmFtZSh2YWx1ZSkgfHwgYCh1bmtub3duIG9iamVjdClgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0UHJpbWl0aXZlTmFtZSh2YWx1ZSk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWJ1Z1RvU3RyaW5nO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==