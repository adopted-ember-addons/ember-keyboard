'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.strip = strip;
function strip(strings) {
    var out = '';

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    for (var i = 0; i < strings.length; i++) {
        var string = strings[i];
        var dynamic = args[i] !== undefined ? String(args[i]) : '';
        out += '' + string + dynamic;
    }
    var lines = out.split('\n');
    while (lines.length && lines[0].match(/^\s*$/)) {
        lines.shift();
    }
    while (lines.length && lines[lines.length - 1].match(/^\s*$/)) {
        lines.pop();
    }
    var min = Infinity;
    for (var _iterator = lines, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var line = _ref;

        var leading = line.match(/^\s*/)[0].length;
        min = Math.min(min, leading);
    }
    var stripped = [];
    for (var _iterator2 = lines, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
            if (_i2 >= _iterator2.length) break;
            _ref2 = _iterator2[_i2++];
        } else {
            _i2 = _iterator2.next();
            if (_i2.done) break;
            _ref2 = _i2.value;
        }

        var _line = _ref2;

        stripped.push(_line.slice(min));
    }
    return stripped.join('\n');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUFNLEssR0FBQSxLO0FBQUEsU0FBQSxLQUFBLENBQUEsT0FBQSxFQUFpRTtBQUNyRSxRQUFJLE1BQUosRUFBQTs7QUFEcUUsU0FBQSxJQUFBLE9BQUEsVUFBQSxNQUFBLEVBQWpFLE9BQWlFLE1BQUEsT0FBQSxDQUFBLEdBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxDQUFBLEVBQUEsT0FBQSxJQUFBLEVBQUEsTUFBQSxFQUFBO0FBQWpFLGFBQWlFLE9BQUEsQ0FBakUsSUFBaUUsVUFBQSxJQUFBLENBQWpFO0FBQWlFOztBQUVyRSxTQUFLLElBQUksSUFBVCxDQUFBLEVBQWdCLElBQUksUUFBcEIsTUFBQSxFQUFBLEdBQUEsRUFBeUM7QUFDdkMsWUFBSSxTQUFTLFFBQWIsQ0FBYSxDQUFiO0FBQ0EsWUFBSSxVQUFVLEtBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBd0IsT0FBTyxLQUEvQixDQUErQixDQUFQLENBQXhCLEdBQWQsRUFBQTtBQUVBLGVBQUEsS0FBQSxNQUFBLEdBQUEsT0FBQTtBQUNEO0FBRUQsUUFBSSxRQUFRLElBQUEsS0FBQSxDQUFaLElBQVksQ0FBWjtBQUVBLFdBQU8sTUFBQSxNQUFBLElBQWdCLE1BQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBdkIsT0FBdUIsQ0FBdkIsRUFBZ0Q7QUFDOUMsY0FBQSxLQUFBO0FBQ0Q7QUFFRCxXQUFPLE1BQUEsTUFBQSxJQUFnQixNQUFNLE1BQUEsTUFBQSxHQUFOLENBQUEsRUFBQSxLQUFBLENBQXZCLE9BQXVCLENBQXZCLEVBQStEO0FBQzdELGNBQUEsR0FBQTtBQUNEO0FBRUQsUUFBSSxNQUFKLFFBQUE7QUFFQSxTQUFBLElBQUEsWUFBQSxLQUFBLEVBQUEsV0FBQSxNQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxZQUFBLFdBQUEsU0FBQSxHQUFBLFVBQUEsT0FBQSxRQUFBLEdBQUEsSUFBd0I7QUFBQSxZQUFBLElBQUE7O0FBQUEsWUFBQSxRQUFBLEVBQUE7QUFBQSxnQkFBQSxNQUFBLFVBQUEsTUFBQSxFQUFBO0FBQUEsbUJBQUEsVUFBQSxJQUFBLENBQUE7QUFBQSxTQUFBLE1BQUE7QUFBQSxpQkFBQSxVQUFBLElBQUEsRUFBQTtBQUFBLGdCQUFBLEdBQUEsSUFBQSxFQUFBO0FBQUEsbUJBQUEsR0FBQSxLQUFBO0FBQUE7O0FBQUEsWUFBeEIsT0FBd0IsSUFBQTs7QUFDdEIsWUFBSSxVQUFVLEtBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQWQsTUFBQTtBQUVBLGNBQU0sS0FBQSxHQUFBLENBQUEsR0FBQSxFQUFOLE9BQU0sQ0FBTjtBQUNEO0FBRUQsUUFBSSxXQUFKLEVBQUE7QUFFQSxTQUFBLElBQUEsYUFBQSxLQUFBLEVBQUEsWUFBQSxNQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsRUFBQSxhQUFBLFlBQUEsVUFBQSxHQUFBLFdBQUEsT0FBQSxRQUFBLEdBQUEsSUFBd0I7QUFBQSxZQUFBLEtBQUE7O0FBQUEsWUFBQSxTQUFBLEVBQUE7QUFBQSxnQkFBQSxPQUFBLFdBQUEsTUFBQSxFQUFBO0FBQUEsb0JBQUEsV0FBQSxLQUFBLENBQUE7QUFBQSxTQUFBLE1BQUE7QUFBQSxrQkFBQSxXQUFBLElBQUEsRUFBQTtBQUFBLGdCQUFBLElBQUEsSUFBQSxFQUFBO0FBQUEsb0JBQUEsSUFBQSxLQUFBO0FBQUE7O0FBQUEsWUFBeEIsUUFBd0IsS0FBQTs7QUFDdEIsaUJBQUEsSUFBQSxDQUFjLE1BQUEsS0FBQSxDQUFkLEdBQWMsQ0FBZDtBQUNEO0FBRUQsV0FBTyxTQUFBLElBQUEsQ0FBUCxJQUFPLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBzdHJpcChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uYXJnczogdW5rbm93bltdKSB7XG4gIGxldCBvdXQgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHN0cmluZyA9IHN0cmluZ3NbaV07XG4gICAgbGV0IGR5bmFtaWMgPSBhcmdzW2ldICE9PSB1bmRlZmluZWQgPyBTdHJpbmcoYXJnc1tpXSkgOiAnJztcblxuICAgIG91dCArPSBgJHtzdHJpbmd9JHtkeW5hbWljfWA7XG4gIH1cblxuICBsZXQgbGluZXMgPSBvdXQuc3BsaXQoJ1xcbicpO1xuXG4gIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbMF0ubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgbGluZXMuc2hpZnQoKTtcbiAgfVxuXG4gIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgbGluZXMucG9wKCk7XG4gIH1cblxuICBsZXQgbWluID0gSW5maW5pdHk7XG5cbiAgZm9yIChsZXQgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBsZWFkaW5nID0gbGluZS5tYXRjaCgvXlxccyovKSFbMF0ubGVuZ3RoO1xuXG4gICAgbWluID0gTWF0aC5taW4obWluLCBsZWFkaW5nKTtcbiAgfVxuXG4gIGxldCBzdHJpcHBlZCA9IFtdO1xuXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBzdHJpcHBlZC5wdXNoKGxpbmUuc2xpY2UobWluKSk7XG4gIH1cblxuICByZXR1cm4gc3RyaXBwZWQuam9pbignXFxuJyk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9