"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseStaticImports;

var _parseModuleName = _interopRequireDefault(require("./parseModuleName"));

var _parseStarImport = _interopRequireDefault(require("./parseStarImport"));

var _parseDefaultImport = _interopRequireDefault(require("./parseDefaultImport"));

var _parseNamedImports = _interopRequireDefault(require("./parseNamedImports"));

var _isSideEffectOnly = _interopRequireDefault(require("./isSideEffectOnly"));

var _removeLineComments = _interopRequireDefault(require("./removeLineComments"));

var _removeBlockComments = _interopRequireDefault(require("./removeBlockComments"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function preprocess(file = "") {
  const normalizeLineEndings = file.replace(/\r/gm, "").trim();

  if (!file.includes("import ")) {
    return [];
  }

  return normalizeLineEndings.split("import ").filter(Boolean).map(str => {
    const normalized = str.replace(/(\'|\`)/gm, '"'); // eslint-disable-line no-useless-escape

    const openImportQuoteIdx = normalized.indexOf('"');
    const closeImportQuoteIdx = normalized.indexOf('"', openImportQuoteIdx + 1);
    const restOfImport = normalized.substring(0, closeImportQuoteIdx + 1).trim();
    return `import ${restOfImport}`;
  }).map(_removeLineComments.default).map(_removeBlockComments.default);
}
/** parseStaticImports
 * returns a a list of objects whose properties represent significant elements
 * of the static import.
 *
 * @param {String} file - Contents of a file containing static imports
 * @returns {Object[]} List of static imports found in the given file contents
 */


function parseStaticImports(file = "") {
  return preprocess(file).reduce((acc, str) => {
    const sideEffectOnly = (0, _isSideEffectOnly.default)(str);
    return [...acc, {
      moduleName: (0, _parseModuleName.default)(str),
      defaultImport: sideEffectOnly ? "" : (0, _parseDefaultImport.default)(str),
      namedImports: sideEffectOnly ? [] : (0, _parseNamedImports.default)(str),
      starImport: sideEffectOnly ? "" : (0, _parseStarImport.default)(str),
      sideEffectOnly
    }];
  }, []);
}