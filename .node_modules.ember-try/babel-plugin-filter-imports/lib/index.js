"use strict";

var _lodash = _interopRequireDefault(require("lodash"));

var _path = _interopRequireDefault(require("path"));

var _getSpecifierNames = _interopRequireDefault(require("./getSpecifierNames"));

var _removeReferences = _interopRequireDefault(require("./removeReferences"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = () => ({
  manipulateOptions: (opts, parserOptions) => {
    parserOptions.plugins.push('exportDefaultFrom');
    parserOptions.plugins.push('exportNamespaceFrom');
  },
  visitor: {
    ImportDeclaration: (path, {
      opts
    }) => {
      const {
        imports,
        keepImports = false
      } = opts;
      const {
        source,
        specifiers
      } = path.node;

      const members = _lodash.default.get(imports, _lodash.default.get(source, 'value'));
      /*
       * Heads up! This condition omits processing of non-filtered imports.
       */


      if (!members) return;
      const specifiersForRemoval = (0, _getSpecifierNames.default)(members, specifiers);

      const specifierNames = _lodash.default.map(specifiersForRemoval, 'local.name');

      _lodash.default.forEach(specifierNames, specifier => (0, _removeReferences.default)(path, specifier));

      if (keepImports) return false;

      if (specifiers.length === specifierNames.length) {
        path.remove();
        return;
      }

      _lodash.default.set(path, 'node.specifiers', _lodash.default.without(specifiers, ...specifiersForRemoval));
    },
    ExportNamedDeclaration: (path, {
      opts
    }) => {
      const declaration = _lodash.default.get(path, 'node.declaration'); // Heads up! Exports that have decrations will be handled
      // by the ImportDeclaration visitor


      if (declaration) return;
      const {
        imports
      } = opts;

      const source = _lodash.default.get(path, 'node.source.value');

      if (_lodash.default.has(imports, source)) path.remove();
    }
  }
}); // Provide the path to the package's base directory for caching with broccoli
// Ref: https://github.com/babel/broccoli-babel-transpiler#caching


module.exports.baseDir = () => _path.default.resolve(__dirname, '..');