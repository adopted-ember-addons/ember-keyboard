"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isSideEffectOnly;

function isSideEffectOnly(str = "") {
  const importIdx = str.indexOf("import");
  const quoteIdx = str.replace(/(\'|\`)+/gm, '"').indexOf('"'); // eslint-disable-line no-useless-escape

  const startIdx = importIdx >= 0 ? importIdx + 6 : 0;
  const betweenImportAndQuote = str.substring(startIdx, quoteIdx).trim();
  return importIdx >= 0 && betweenImportAndQuote.length === 0;
}