"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const removeExportSpecifier = path => {
  const parent = path.parentPath;

  const specifiers = _lodash.default.get(parent, 'node.specifiers');

  path.remove(); // Heads up! We should also remove ExportNamedDeclaration if it become empty

  if (specifiers.length === 0) parent.remove();
};

var _default = removeExportSpecifier;
exports.default = _default;