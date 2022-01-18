export default typeof WeakSet === 'function' ? WeakSet : /*#__PURE__*/function () {
  function WeakSetPolyFill() {
    this._map = new WeakMap();
  }

  var _proto = WeakSetPolyFill.prototype;

  _proto.add = function add(val) {
    this._map.set(val, true);

    return this;
  };

  _proto["delete"] = function _delete(val) {
    return this._map["delete"](val);
  };

  _proto.has = function has(val) {
    return this._map.has(val);
  };

  return WeakSetPolyFill;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3dlYWstc2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGVBQWdCLE9BQUEsT0FBQSxLQUFBLFVBQUEsR0FBQSxPQUFBO0FBRVosNkJBQUE7QUFDVSxTQUFBLElBQUEsR0FBTyxJQUFQLE9BQU8sRUFBUDtBQWNUOztBQWpCVzs7QUFBQSxTQUtWLEdBTFUsR0FLVixhQUFHLEdBQUgsRUFBVTtBQUNSLFNBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQTs7QUFDQSxXQUFBLElBQUE7QUFDRCxHQVJTOztBQUFBLHFCQVVWLGlCQUFNLEdBQU4sRUFBYTtBQUNYLFdBQU8sS0FBQSxJQUFBLFdBQVAsR0FBTyxDQUFQO0FBQ0QsR0FaUzs7QUFBQSxTQWNWLEdBZFUsR0FjVixhQUFHLEdBQUgsRUFBVTtBQUNSLFdBQU8sS0FBQSxJQUFBLENBQUEsR0FBQSxDQUFQLEdBQU8sQ0FBUDtBQUNELEdBaEJTOztBQUFBO0FBQUEsR0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAodHlwZW9mIFdlYWtTZXQgPT09ICdmdW5jdGlvbidcbiAgPyBXZWFrU2V0XG4gIDogY2xhc3MgV2Vha1NldFBvbHlGaWxsPFQgZXh0ZW5kcyBvYmplY3Q+IHtcbiAgICAgIHByaXZhdGUgX21hcCA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICAgIGFkZCh2YWw6IFQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fbWFwLnNldCh2YWwsIHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgZGVsZXRlKHZhbDogVCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmRlbGV0ZSh2YWwpO1xuICAgICAgfVxuXG4gICAgICBoYXModmFsOiBUKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuaGFzKHZhbCk7XG4gICAgICB9XG4gICAgfSkgYXMgV2Vha1NldENvbnN0cnVjdG9yO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==