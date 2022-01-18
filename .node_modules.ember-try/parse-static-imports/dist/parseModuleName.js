"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseModuleName;

function parseModuleName(str = "") {
  const normalized = str.replace(/(\'|\`)+/gm, '"'); // eslint-disable-line no-useless-escape

  const importIdx = normalized.indexOf("import");
  const startQuoteIdx = normalized.indexOf('"');
  const endQuoteIdx = normalized.indexOf('"', startQuoteIdx + 1);

  if (importIdx < 0 || startQuoteIdx < 0 || endQuoteIdx < 0) {
    return "";
  }

  return normalized.substring(startQuoteIdx, endQuoteIdx).replace(/(\"|\s)+/gm, ""); // eslint-disable-line no-useless-escape
}