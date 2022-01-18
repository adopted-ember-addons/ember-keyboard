"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeLineComments;

function removeLineComments(str = "") {
  const lines = str.split("\n");
  return lines.filter(line => !line.includes("//")).join("\n");
}