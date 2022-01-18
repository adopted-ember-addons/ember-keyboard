"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = void 0;
function expect(value, message) {
    if (value === undefined || value === null) {
        throw new Error(`LIBRARY BUG: ${message}`);
    }
    return value;
}
exports.expect = expect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGVidWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsU0FBZ0IsTUFBTSxDQUFJLEtBQTJCLEVBQUUsT0FBZTtJQUNwRSxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtRQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQzVDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBTkQsd0JBTUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gZXhwZWN0PFQ+KHZhbHVlOiBUIHwgbnVsbCB8IHVuZGVmaW5lZCwgbWVzc2FnZTogc3RyaW5nKTogVCB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBMSUJSQVJZIEJVRzogJHttZXNzYWdlfWApO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuIl19