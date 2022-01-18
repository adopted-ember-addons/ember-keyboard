'use strict';

const sourceForNode = require('./source-for-node');

const ALPHA = /[A-Za-z]/;
const WHITESPACE = /[\t\r\n\f ]/;

/*
  Ember < 3.1.0 mutates `element.tag` so that the first character
  is _always_ lower case (even if the raw source includes upper case).

  This function falls back to the raw source when possible to detect
  the _actual_ first char.
*/
module.exports = function getTag(element, sourceLines) {
  // if we have no source, we must use whatever element.tag has
  if (!sourceLines || sourceLines.length === 0) {
    return element.tag;
  }

  let nodeSource = sourceForNode(element, sourceLines);

  let tagNameStarted = false;
  let tagName = '';
  for (let i = 1 /* starting after the opening < */; i < nodeSource.length; i++) {
    let char = nodeSource[i];

    if (tagNameStarted) {
      if (char === '/' || char === '>' || WHITESPACE.test(char)) {
        break;
      } else {
        tagName += char;
      }
    } else {
      if (char == '@' || ALPHA.test(char)) {
        tagNameStarted = true;
        tagName += char;
      }
    }
  }

  return tagName;
};
