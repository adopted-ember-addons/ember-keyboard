"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.strip = strip;

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function strip(strings) {
  var out = '';

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < strings.length; i++) {
    var string = strings[i];
    var dynamic = args[i] !== undefined ? String(args[i]) : '';
    out += "" + string + dynamic;
  }

  var lines = out.split('\n');

  while (lines.length && lines[0].match(/^\s*$/)) {
    lines.shift();
  }

  while (lines.length && lines[lines.length - 1].match(/^\s*$/)) {
    lines.pop();
  }

  var min = Infinity;

  for (var _iterator = _createForOfIteratorHelperLoose(lines), _step; !(_step = _iterator()).done;) {
    var line = _step.value;
    var leading = line.match(/^\s*/)[0].length;
    min = Math.min(min, leading);
  }

  var stripped = [];

  for (var _iterator2 = _createForOfIteratorHelperLoose(lines), _step2; !(_step2 = _iterator2()).done;) {
    var _line = _step2.value;
    stripped.push(_line.slice(min));
  }

  return stripped.join('\n');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTSxTQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQWlFO0FBQ3JFLE1BQUksR0FBRyxHQUFQLEVBQUE7O0FBRHFFLE9BQUEsSUFBQSxJQUFBLEdBQUEsU0FBQSxDQUFBLE1BQUEsRUFBakUsSUFBaUUsR0FBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEdBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxFQUFBO0FBQWpFLElBQUEsSUFBaUUsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxDQUFqRSxHQUFpRSxTQUFBLENBQUEsSUFBQSxDQUFqRTtBQUFpRTs7QUFFckUsT0FBSyxJQUFJLENBQUMsR0FBVixDQUFBLEVBQWdCLENBQUMsR0FBRyxPQUFPLENBQTNCLE1BQUEsRUFBb0MsQ0FBcEMsRUFBQSxFQUF5QztBQUN2QyxRQUFJLE1BQU0sR0FBRyxPQUFPLENBQXBCLENBQW9CLENBQXBCO0FBQ0EsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFKLENBQUksQ0FBSixLQUFBLFNBQUEsR0FBd0IsTUFBTSxDQUFDLElBQUksQ0FBbkMsQ0FBbUMsQ0FBTCxDQUE5QixHQUFkLEVBQUE7QUFFQSxJQUFBLEdBQUcsSUFBQSxLQUFBLE1BQUEsR0FBSCxPQUFBO0FBQ0Q7O0FBRUQsTUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFILEtBQUEsQ0FBWixJQUFZLENBQVo7O0FBRUEsU0FBTyxLQUFLLENBQUwsTUFBQSxJQUFnQixLQUFLLENBQUwsQ0FBSyxDQUFMLENBQUEsS0FBQSxDQUF2QixPQUF1QixDQUF2QixFQUFnRDtBQUM5QyxJQUFBLEtBQUssQ0FBTCxLQUFBO0FBQ0Q7O0FBRUQsU0FBTyxLQUFLLENBQUwsTUFBQSxJQUFnQixLQUFLLENBQUMsS0FBSyxDQUFMLE1BQUEsR0FBTixDQUFLLENBQUwsQ0FBQSxLQUFBLENBQXZCLE9BQXVCLENBQXZCLEVBQStEO0FBQzdELElBQUEsS0FBSyxDQUFMLEdBQUE7QUFDRDs7QUFFRCxNQUFJLEdBQUcsR0FBUCxRQUFBOztBQUVBLE9BQUEsSUFBQSxTQUFBLEdBQUEsK0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxTQUFBLEVBQUEsRUFBQSxJQUFBLEdBQXdCO0FBQUEsUUFBeEIsSUFBd0IsR0FBQSxLQUFBLENBQUEsS0FBQTtBQUN0QixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUosS0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQWQsTUFBQTtBQUVBLElBQUEsR0FBRyxHQUFHLElBQUksQ0FBSixHQUFBLENBQUEsR0FBQSxFQUFOLE9BQU0sQ0FBTjtBQUNEOztBQUVELE1BQUksUUFBUSxHQUFaLEVBQUE7O0FBRUEsT0FBQSxJQUFBLFVBQUEsR0FBQSwrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsRUFBQSxFQUFBLElBQUEsR0FBd0I7QUFBQSxRQUF4QixLQUF3QixHQUFBLE1BQUEsQ0FBQSxLQUFBO0FBQ3RCLElBQUEsUUFBUSxDQUFSLElBQUEsQ0FBYyxLQUFJLENBQUosS0FBQSxDQUFkLEdBQWMsQ0FBZDtBQUNEOztBQUVELFNBQU8sUUFBUSxDQUFSLElBQUEsQ0FBUCxJQUFPLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBzdHJpcChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uYXJnczogdW5rbm93bltdKSB7XG4gIGxldCBvdXQgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHN0cmluZyA9IHN0cmluZ3NbaV07XG4gICAgbGV0IGR5bmFtaWMgPSBhcmdzW2ldICE9PSB1bmRlZmluZWQgPyBTdHJpbmcoYXJnc1tpXSkgOiAnJztcblxuICAgIG91dCArPSBgJHtzdHJpbmd9JHtkeW5hbWljfWA7XG4gIH1cblxuICBsZXQgbGluZXMgPSBvdXQuc3BsaXQoJ1xcbicpO1xuXG4gIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbMF0ubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgbGluZXMuc2hpZnQoKTtcbiAgfVxuXG4gIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgbGluZXMucG9wKCk7XG4gIH1cblxuICBsZXQgbWluID0gSW5maW5pdHk7XG5cbiAgZm9yIChsZXQgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBsZWFkaW5nID0gbGluZS5tYXRjaCgvXlxccyovKSFbMF0ubGVuZ3RoO1xuXG4gICAgbWluID0gTWF0aC5taW4obWluLCBsZWFkaW5nKTtcbiAgfVxuXG4gIGxldCBzdHJpcHBlZCA9IFtdO1xuXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBzdHJpcHBlZC5wdXNoKGxpbmUuc2xpY2UobWluKSk7XG4gIH1cblxuICByZXR1cm4gc3RyaXBwZWQuam9pbignXFxuJyk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9