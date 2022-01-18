"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeBlockComments;

function removeBlockComments(str = "") {
  return str.split("/*").map(maybeBlockComment => {
    const endBlockIdx = maybeBlockComment.indexOf("*/");
    return endBlockIdx >= 0 ? maybeBlockComment.substring(endBlockIdx + 2).trim() : maybeBlockComment;
  }).join("");
}