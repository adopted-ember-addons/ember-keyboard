"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseDefaultImport;

function parseDefaultImport(str = "") {
  const commaIdx = str.indexOf(",");
  const starIdx = str.indexOf("*");
  const curlyIdx = str.indexOf("{");
  const fromIdx = str.indexOf("from");
  const importIdx = str.indexOf("import");
  const startIdx = importIdx + 6;

  if (fromIdx < 0 || importIdx < 0) {
    return "";
  }

  const hasComma = commaIdx >= 0;
  const hasNamedImports = curlyIdx >= 0;
  const hasStarImport = starIdx >= 0; // check for comma that comes before named and star imports

  if (hasComma && (hasNamedImports && commaIdx < curlyIdx || hasStarImport && commaIdx < starIdx)) {
    return str.substring(startIdx, commaIdx).replace(/(,|\s)+/gm, "");
  } // has named or star imports only


  if (hasNamedImports || hasStarImport) {
    return "";
  }

  return str.substring(startIdx, fromIdx).trim();
}