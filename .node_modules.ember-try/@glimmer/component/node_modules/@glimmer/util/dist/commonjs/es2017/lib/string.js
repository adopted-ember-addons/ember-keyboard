'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.strip = strip;
function strip(strings, ...args) {
    let out = '';
    for (let i = 0; i < strings.length; i++) {
        let string = strings[i];
        let dynamic = args[i] !== undefined ? String(args[i]) : '';
        out += `${string}${dynamic}`;
    }
    let lines = out.split('\n');
    while (lines.length && lines[0].match(/^\s*$/)) {
        lines.shift();
    }
    while (lines.length && lines[lines.length - 1].match(/^\s*$/)) {
        lines.pop();
    }
    let min = Infinity;
    for (let line of lines) {
        let leading = line.match(/^\s*/)[0].length;
        min = Math.min(min, leading);
    }
    let stripped = [];
    for (let line of lines) {
        stripped.push(line.slice(min));
    }
    return stripped.join('\n');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUFNLEssR0FBQSxLO0FBQUEsU0FBQSxLQUFBLENBQUEsT0FBQSxFQUErQyxHQUEvQyxJQUFBLEVBQWlFO0FBQ3JFLFFBQUksTUFBSixFQUFBO0FBQ0EsU0FBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLFFBQXBCLE1BQUEsRUFBQSxHQUFBLEVBQXlDO0FBQ3ZDLFlBQUksU0FBUyxRQUFiLENBQWEsQ0FBYjtBQUNBLFlBQUksVUFBVSxLQUFBLENBQUEsTUFBQSxTQUFBLEdBQXdCLE9BQU8sS0FBL0IsQ0FBK0IsQ0FBUCxDQUF4QixHQUFkLEVBQUE7QUFFQSxlQUFPLEdBQUcsTUFBTSxHQUFHLE9BQW5CLEVBQUE7QUFDRDtBQUVELFFBQUksUUFBUSxJQUFBLEtBQUEsQ0FBWixJQUFZLENBQVo7QUFFQSxXQUFPLE1BQUEsTUFBQSxJQUFnQixNQUFBLENBQUEsRUFBQSxLQUFBLENBQXZCLE9BQXVCLENBQXZCLEVBQWdEO0FBQzlDLGNBQUEsS0FBQTtBQUNEO0FBRUQsV0FBTyxNQUFBLE1BQUEsSUFBZ0IsTUFBTSxNQUFBLE1BQUEsR0FBTixDQUFBLEVBQUEsS0FBQSxDQUF2QixPQUF1QixDQUF2QixFQUErRDtBQUM3RCxjQUFBLEdBQUE7QUFDRDtBQUVELFFBQUksTUFBSixRQUFBO0FBRUEsU0FBSyxJQUFMLElBQUEsSUFBQSxLQUFBLEVBQXdCO0FBQ3RCLFlBQUksVUFBVSxLQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFkLE1BQUE7QUFFQSxjQUFNLEtBQUEsR0FBQSxDQUFBLEdBQUEsRUFBTixPQUFNLENBQU47QUFDRDtBQUVELFFBQUksV0FBSixFQUFBO0FBRUEsU0FBSyxJQUFMLElBQUEsSUFBQSxLQUFBLEVBQXdCO0FBQ3RCLGlCQUFBLElBQUEsQ0FBYyxLQUFBLEtBQUEsQ0FBZCxHQUFjLENBQWQ7QUFDRDtBQUVELFdBQU8sU0FBQSxJQUFBLENBQVAsSUFBTyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gc3RyaXAoc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLmFyZ3M6IHVua25vd25bXSkge1xuICBsZXQgb3V0ID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBzdHJpbmcgPSBzdHJpbmdzW2ldO1xuICAgIGxldCBkeW5hbWljID0gYXJnc1tpXSAhPT0gdW5kZWZpbmVkID8gU3RyaW5nKGFyZ3NbaV0pIDogJyc7XG5cbiAgICBvdXQgKz0gYCR7c3RyaW5nfSR7ZHluYW1pY31gO1xuICB9XG5cbiAgbGV0IGxpbmVzID0gb3V0LnNwbGl0KCdcXG4nKTtcblxuICB3aGlsZSAobGluZXMubGVuZ3RoICYmIGxpbmVzWzBdLm1hdGNoKC9eXFxzKiQvKSkge1xuICAgIGxpbmVzLnNoaWZ0KCk7XG4gIH1cblxuICB3aGlsZSAobGluZXMubGVuZ3RoICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLm1hdGNoKC9eXFxzKiQvKSkge1xuICAgIGxpbmVzLnBvcCgpO1xuICB9XG5cbiAgbGV0IG1pbiA9IEluZmluaXR5O1xuXG4gIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBsZXQgbGVhZGluZyA9IGxpbmUubWF0Y2goL15cXHMqLykhWzBdLmxlbmd0aDtcblxuICAgIG1pbiA9IE1hdGgubWluKG1pbiwgbGVhZGluZyk7XG4gIH1cblxuICBsZXQgc3RyaXBwZWQgPSBbXTtcblxuICBmb3IgKGxldCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgc3RyaXBwZWQucHVzaChsaW5lLnNsaWNlKG1pbikpO1xuICB9XG5cbiAgcmV0dXJuIHN0cmlwcGVkLmpvaW4oJ1xcbicpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==