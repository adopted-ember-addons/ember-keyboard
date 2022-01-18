"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var t = _interopRequireWildcard(require("@babel/types"));

var _lodash = _interopRequireDefault(require("lodash"));

var _findReferenceRemovalPath = _interopRequireDefault(require("./findReferenceRemovalPath"));

var _removeExportSpecifier = _interopRequireDefault(require("./removeExportSpecifier"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const removeReferences = (path, specifier) => {
  if (!path.scope.getBinding(specifier)) return;
  const {
    referencePaths
  } = path.scope.getBinding(specifier);

  _lodash.default.forEach(referencePaths, referencePath => {
    const removalPath = (0, _findReferenceRemovalPath.default)(referencePath);
    if (removalPath.removed) return;

    if (t.isArrowFunctionExpression(removalPath)) {
      removalPath.get('body').remove();
      return;
    }

    if (t.isExportSpecifier(removalPath)) {
      (0, _removeExportSpecifier.default)(removalPath);
      return;
    }

    if (t.isVariableDeclarator(removalPath)) removeReferences(removalPath, _lodash.default.get(removalPath, 'node.id.name'));
    removalPath.remove();
  });
};

var _default = removeReferences;
exports.default = _default;