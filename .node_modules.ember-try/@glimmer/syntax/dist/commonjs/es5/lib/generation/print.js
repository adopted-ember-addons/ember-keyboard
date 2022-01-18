"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _printer = _interopRequireDefault(require("./printer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function build(ast, options) {
  if (options === void 0) {
    options = {
      entityEncoding: 'transformed'
    };
  }

  if (!ast) {
    return '';
  }

  var printer = new _printer.default(options);
  return printer.print(ast);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvZ2VuZXJhdGlvbi9wcmludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7Ozs7QUFFYyxTQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsT0FBQSxFQUUrQztBQUFBLE1BQTNELE9BQTJELEtBQUEsS0FBQSxDQUFBLEVBQUE7QUFBM0QsSUFBQSxPQUEyRCxHQUFqQztBQUFFLE1BQUEsY0FBYyxFQUFFO0FBQWxCLEtBQTFCO0FBQTJEOztBQUUzRCxNQUFJLENBQUosR0FBQSxFQUFVO0FBQ1IsV0FBQSxFQUFBO0FBQ0Q7O0FBRUQsTUFBSSxPQUFPLEdBQUcsSUFBQSxnQkFBQSxDQUFkLE9BQWMsQ0FBZDtBQUNBLFNBQU8sT0FBTyxDQUFQLEtBQUEsQ0FBUCxHQUFPLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgUHJpbnRlciwgeyBQcmludGVyT3B0aW9ucyB9IGZyb20gJy4vcHJpbnRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJ1aWxkKFxuICBhc3Q6IE5vZGUsXG4gIG9wdGlvbnM6IFByaW50ZXJPcHRpb25zID0geyBlbnRpdHlFbmNvZGluZzogJ3RyYW5zZm9ybWVkJyB9XG4pOiBzdHJpbmcge1xuICBpZiAoIWFzdCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGxldCBwcmludGVyID0gbmV3IFByaW50ZXIob3B0aW9ucyk7XG4gIHJldHVybiBwcmludGVyLnByaW50KGFzdCk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9