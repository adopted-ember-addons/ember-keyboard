"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseNamedImports;

function createNamedImport(str = "") {
  const asIdx = str.indexOf(" as ");

  if (asIdx < 0) {
    const name = str.trim();
    return {
      name,
      alias: name
    };
  }

  const alias = str.substring(asIdx + 4).trim();
  const name = str.substring(0, asIdx).trim();
  return {
    name,
    alias
  };
}

function parseNamedImports(str = "") {
  const startCurlyIdx = str.indexOf("{");
  const endCurlyIdx = str.indexOf("}");

  if (startCurlyIdx < 0 || endCurlyIdx < 0) {
    return [];
  }

  return str.substring(startCurlyIdx + 1, endCurlyIdx - 1).split(",").filter(Boolean).map(createNamedImport);
}