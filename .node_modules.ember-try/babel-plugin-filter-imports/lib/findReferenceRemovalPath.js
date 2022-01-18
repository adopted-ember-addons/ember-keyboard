"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isRemovablePath = _interopRequireDefault(require("./isRemovablePath"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const findReferenceRemovalPath = referencePath => {
  const parent = referencePath.findParent(_isRemovablePath.default);
  if (parent) return parent;
  if ((0, _isRemovablePath.default)(referencePath)) return referencePath;
  throw new Error(['Cannot find the path for removal, please open issue with code example and the stack trace on Github:', 'https://github.com/ember-cli/babel-plugin-filter-imports'].join(' '));
};

var _default = findReferenceRemovalPath;
exports.default = _default;