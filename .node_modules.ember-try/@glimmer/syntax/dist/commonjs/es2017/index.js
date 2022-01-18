"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  preprocess: true,
  builders: true,
  TraversalError: true,
  cannotRemoveNode: true,
  cannotReplaceNode: true,
  cannotReplaceOrRemoveInKeyHandlerYet: true,
  traverse: true,
  Path: true,
  Walker: true,
  print: true,
  SyntaxError: true,
  AST: true,
  isLiteral: true,
  printLiteral: true
};
Object.defineProperty(exports, "preprocess", {
  enumerable: true,
  get: function () {
    return _tokenizerEventHandlers.preprocess;
  }
});
Object.defineProperty(exports, "builders", {
  enumerable: true,
  get: function () {
    return _builders.default;
  }
});
Object.defineProperty(exports, "TraversalError", {
  enumerable: true,
  get: function () {
    return _errors.default;
  }
});
Object.defineProperty(exports, "cannotRemoveNode", {
  enumerable: true,
  get: function () {
    return _errors.cannotRemoveNode;
  }
});
Object.defineProperty(exports, "cannotReplaceNode", {
  enumerable: true,
  get: function () {
    return _errors.cannotReplaceNode;
  }
});
Object.defineProperty(exports, "cannotReplaceOrRemoveInKeyHandlerYet", {
  enumerable: true,
  get: function () {
    return _errors.cannotReplaceOrRemoveInKeyHandlerYet;
  }
});
Object.defineProperty(exports, "traverse", {
  enumerable: true,
  get: function () {
    return _traverse.default;
  }
});
Object.defineProperty(exports, "Path", {
  enumerable: true,
  get: function () {
    return _path.default;
  }
});
Object.defineProperty(exports, "Walker", {
  enumerable: true,
  get: function () {
    return _walker.default;
  }
});
Object.defineProperty(exports, "print", {
  enumerable: true,
  get: function () {
    return _print.default;
  }
});
Object.defineProperty(exports, "SyntaxError", {
  enumerable: true,
  get: function () {
    return _syntaxError.default;
  }
});
Object.defineProperty(exports, "isLiteral", {
  enumerable: true,
  get: function () {
    return _utils.isLiteral;
  }
});
Object.defineProperty(exports, "printLiteral", {
  enumerable: true,
  get: function () {
    return _utils.printLiteral;
  }
});
exports.AST = void 0;

var _tokenizerEventHandlers = require("./lib/parser/tokenizer-event-handlers");

var _builders = _interopRequireDefault(require("./lib/builders"));

var _errors = _interopRequireWildcard(require("./lib/traversal/errors"));

var _traverse = _interopRequireDefault(require("./lib/traversal/traverse"));

var _visitor = require("./lib/traversal/visitor");

Object.keys(_visitor).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _visitor[key];
    }
  });
});

var _path = _interopRequireDefault(require("./lib/traversal/path"));

var _walker = _interopRequireDefault(require("./lib/traversal/walker"));

var _print = _interopRequireDefault(require("./lib/generation/print"));

var _syntaxError = _interopRequireDefault(require("./lib/errors/syntax-error"));

var AST = _interopRequireWildcard(require("./lib/types/nodes"));

exports.AST = AST;

var _utils = require("./lib/utils");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBOztBQVVBOztBQUNBOztBQU1BOztBQUNBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUdBOzs7O0FBRUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB1c2VkIGJ5IGVtYmVyLWNvbXBpbGVyXG5leHBvcnQge1xuICBwcmVwcm9jZXNzLFxuICBQcmVwcm9jZXNzT3B0aW9ucyxcbiAgQVNUUGx1Z2luLFxuICBBU1RQbHVnaW5CdWlsZGVyLFxuICBBU1RQbHVnaW5FbnZpcm9ubWVudCxcbiAgU3ludGF4LFxufSBmcm9tICcuL2xpYi9wYXJzZXIvdG9rZW5pemVyLWV2ZW50LWhhbmRsZXJzJztcblxuLy8gbmVlZGVkIGZvciB0ZXN0cyBvbmx5XG5leHBvcnQgeyBkZWZhdWx0IGFzIGJ1aWxkZXJzIH0gZnJvbSAnLi9saWIvYnVpbGRlcnMnO1xuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBUcmF2ZXJzYWxFcnJvcixcbiAgY2Fubm90UmVtb3ZlTm9kZSxcbiAgY2Fubm90UmVwbGFjZU5vZGUsXG4gIGNhbm5vdFJlcGxhY2VPclJlbW92ZUluS2V5SGFuZGxlcllldCxcbn0gZnJvbSAnLi9saWIvdHJhdmVyc2FsL2Vycm9ycyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHRyYXZlcnNlIH0gZnJvbSAnLi9saWIvdHJhdmVyc2FsL3RyYXZlcnNlJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL3RyYXZlcnNhbC92aXNpdG9yJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGF0aCB9IGZyb20gJy4vbGliL3RyYXZlcnNhbC9wYXRoJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgV2Fsa2VyIH0gZnJvbSAnLi9saWIvdHJhdmVyc2FsL3dhbGtlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHByaW50IH0gZnJvbSAnLi9saWIvZ2VuZXJhdGlvbi9wcmludCc7XG5cbi8vIGVycm9yc1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTeW50YXhFcnJvciB9IGZyb20gJy4vbGliL2Vycm9ycy9zeW50YXgtZXJyb3InO1xuXG4vLyBBU1RcbmltcG9ydCAqIGFzIEFTVCBmcm9tICcuL2xpYi90eXBlcy9ub2Rlcyc7XG5leHBvcnQgeyBBU1QgfTtcbmV4cG9ydCB7IGlzTGl0ZXJhbCwgcHJpbnRMaXRlcmFsIH0gZnJvbSAnLi9saWIvdXRpbHMnO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==