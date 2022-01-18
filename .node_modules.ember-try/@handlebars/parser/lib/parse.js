import parser from './parser';
import WhitespaceControl from './whitespace-control';
import * as Helpers from './helpers';

let baseHelpers = {};

for (let helper in Helpers) {
  if (Object.prototype.hasOwnProperty.call(Helpers, helper)) {
    baseHelpers[helper] = Helpers[helper];
  }
}

export function parseWithoutProcessing(input, options) {
  // Just return if an already-compiled AST was passed in.
  if (input.type === 'Program') {
    return input;
  }

  parser.yy = baseHelpers;

  // Altering the shared object here, but this is ok as parser is a sync operation
  parser.yy.locInfo = function(locInfo) {
    return new Helpers.SourceLocation(options && options.srcName, locInfo);
  };

  let ast = parser.parse(input);

  return ast;
}

export function parse(input, options) {
  let ast = parseWithoutProcessing(input, options);
  let strip = new WhitespaceControl(options);

  return strip.accept(ast);
}
