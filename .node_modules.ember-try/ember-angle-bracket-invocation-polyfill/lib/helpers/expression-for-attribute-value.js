'use strict';

function isSimple(mustache) {
  return mustache.params.length === 0 && mustache.hash.pairs.length === 0;
}

module.exports = function expressionForAttributeValue(b, value) {
  if (value.type === 'TextNode') {
    return b.string(value.chars);
  } else if (value.type === 'MustacheStatement') {
    // TODO: Resolve ambiguous case data-foo="{{is-this-a-helper}}"
    if (isSimple(value)) {
      return value.path;
    } else {
      return b.sexpr(value.path, value.params, value.hash, value.loc);
    }
  } else if (value.type === 'ConcatStatement') {
    return b.sexpr(
      'concat',
      value.parts.map(p => expressionForAttributeValue(b, p))
    );
  }
};
