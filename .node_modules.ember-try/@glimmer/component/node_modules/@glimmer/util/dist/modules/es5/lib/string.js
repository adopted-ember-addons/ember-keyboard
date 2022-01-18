export function strip(strings) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTSxTQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQWlFO0FBQ3JFLFFBQUksTUFBSixFQUFBOztBQURxRSxzQ0FBakUsSUFBaUU7QUFBakUsWUFBaUU7QUFBQTs7QUFFckUsU0FBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLFFBQXBCLE1BQUEsRUFBQSxHQUFBLEVBQXlDO0FBQ3ZDLFlBQUksU0FBUyxRQUFiLENBQWEsQ0FBYjtBQUNBLFlBQUksVUFBVSxLQUFBLENBQUEsTUFBQSxTQUFBLEdBQXdCLE9BQU8sS0FBL0IsQ0FBK0IsQ0FBUCxDQUF4QixHQUFkLEVBQUE7QUFFQSxvQkFBVSxNQUFWLEdBQUEsT0FBQTtBQUNEO0FBRUQsUUFBSSxRQUFRLElBQUEsS0FBQSxDQUFaLElBQVksQ0FBWjtBQUVBLFdBQU8sTUFBQSxNQUFBLElBQWdCLE1BQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBdkIsT0FBdUIsQ0FBdkIsRUFBZ0Q7QUFDOUMsY0FBQSxLQUFBO0FBQ0Q7QUFFRCxXQUFPLE1BQUEsTUFBQSxJQUFnQixNQUFNLE1BQUEsTUFBQSxHQUFOLENBQUEsRUFBQSxLQUFBLENBQXZCLE9BQXVCLENBQXZCLEVBQStEO0FBQzdELGNBQUEsR0FBQTtBQUNEO0FBRUQsUUFBSSxNQUFKLFFBQUE7QUFFQSx5QkFBQSxLQUFBLGtIQUF3QjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsWUFBeEIsSUFBd0I7O0FBQ3RCLFlBQUksVUFBVSxLQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFkLE1BQUE7QUFFQSxjQUFNLEtBQUEsR0FBQSxDQUFBLEdBQUEsRUFBTixPQUFNLENBQU47QUFDRDtBQUVELFFBQUksV0FBSixFQUFBO0FBRUEsMEJBQUEsS0FBQSx5SEFBd0I7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBLFlBQXhCLEtBQXdCOztBQUN0QixpQkFBQSxJQUFBLENBQWMsTUFBQSxLQUFBLENBQWQsR0FBYyxDQUFkO0FBQ0Q7QUFFRCxXQUFPLFNBQUEsSUFBQSxDQUFQLElBQU8sQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHN0cmlwKHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5hcmdzOiB1bmtub3duW10pIHtcbiAgbGV0IG91dCA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgc3RyaW5nID0gc3RyaW5nc1tpXTtcbiAgICBsZXQgZHluYW1pYyA9IGFyZ3NbaV0gIT09IHVuZGVmaW5lZCA/IFN0cmluZyhhcmdzW2ldKSA6ICcnO1xuXG4gICAgb3V0ICs9IGAke3N0cmluZ30ke2R5bmFtaWN9YDtcbiAgfVxuXG4gIGxldCBsaW5lcyA9IG91dC5zcGxpdCgnXFxuJyk7XG5cbiAgd2hpbGUgKGxpbmVzLmxlbmd0aCAmJiBsaW5lc1swXS5tYXRjaCgvXlxccyokLykpIHtcbiAgICBsaW5lcy5zaGlmdCgpO1xuICB9XG5cbiAgd2hpbGUgKGxpbmVzLmxlbmd0aCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5tYXRjaCgvXlxccyokLykpIHtcbiAgICBsaW5lcy5wb3AoKTtcbiAgfVxuXG4gIGxldCBtaW4gPSBJbmZpbml0eTtcblxuICBmb3IgKGxldCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgbGV0IGxlYWRpbmcgPSBsaW5lLm1hdGNoKC9eXFxzKi8pIVswXS5sZW5ndGg7XG5cbiAgICBtaW4gPSBNYXRoLm1pbihtaW4sIGxlYWRpbmcpO1xuICB9XG5cbiAgbGV0IHN0cmlwcGVkID0gW107XG5cbiAgZm9yIChsZXQgbGluZSBvZiBsaW5lcykge1xuICAgIHN0cmlwcGVkLnB1c2gobGluZS5zbGljZShtaW4pKTtcbiAgfVxuXG4gIHJldHVybiBzdHJpcHBlZC5qb2luKCdcXG4nKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=