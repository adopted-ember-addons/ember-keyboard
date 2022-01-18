'use strict';

// politely lifted from https://github.com/glimmerjs/glimmer-vm/blob/v0.35.0/packages/%40glimmer/syntax/lib/parser.ts#L113-L149
module.exports = function sourceForNode(node, sourceLines) {
  let firstLine = node.loc.start.line - 1;
  let currentLine = firstLine - 1;
  let firstColumn = node.loc.start.column;
  let string = [];
  let line;

  let lastLine = node.loc.end.line - 1;
  let lastColumn = node.loc.end.column;

  while (currentLine < lastLine) {
    currentLine++;
    line = sourceLines[currentLine];

    if (currentLine === firstLine) {
      if (firstLine === lastLine) {
        string.push(line.slice(firstColumn, lastColumn));
      } else {
        string.push(line.slice(firstColumn));
      }
    } else if (currentLine === lastLine) {
      string.push(line.slice(0, lastColumn));
    } else {
      string.push(line);
    }
  }

  return string.join('\n');
};
