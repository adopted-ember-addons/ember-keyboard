"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _printer = _interopRequireDefault(require("./printer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function build(ast, options = {
  entityEncoding: 'transformed'
}) {
  if (!ast) {
    return '';
  }

  let printer = new _printer.default(options);
  return printer.print(ast);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvZ2VuZXJhdGlvbi9wcmludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7Ozs7QUFFYyxTQUFBLEtBQUEsQ0FBQSxHQUFBLEVBRVosT0FBQSxHQUEwQjtBQUFFLEVBQUEsY0FBYyxFQUFFO0FBQWxCLENBRmQsRUFFK0M7QUFFM0QsTUFBSSxDQUFKLEdBQUEsRUFBVTtBQUNSLFdBQUEsRUFBQTtBQUNEOztBQUVELE1BQUksT0FBTyxHQUFHLElBQUEsZ0JBQUEsQ0FBZCxPQUFjLENBQWQ7QUFDQSxTQUFPLE9BQU8sQ0FBUCxLQUFBLENBQVAsR0FBTyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0IFByaW50ZXIsIHsgUHJpbnRlck9wdGlvbnMgfSBmcm9tICcuL3ByaW50ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBidWlsZChcbiAgYXN0OiBOb2RlLFxuICBvcHRpb25zOiBQcmludGVyT3B0aW9ucyA9IHsgZW50aXR5RW5jb2Rpbmc6ICd0cmFuc2Zvcm1lZCcgfVxuKTogc3RyaW5nIHtcbiAgaWYgKCFhc3QpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBsZXQgcHJpbnRlciA9IG5ldyBQcmludGVyKG9wdGlvbnMpO1xuICByZXR1cm4gcHJpbnRlci5wcmludChhc3QpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==