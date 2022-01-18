'use strict';

class FnPolyfill {
  constructor(options) {
    this.syntax = null;
    this.options = options;
  }

  transform(ast) {
    let b = this.syntax.builders;

    // in order to debug in https://astexplorer.net/#/gist/77dd55c52597d33d6d40d82d272ed177
    // **** copy from here ****

    function handleNode(node) {
      if (!node.path || node.path.original !== "fn") {
        return;
      }

      let firstParam = node.params[0];

      if (firstParam && firstParam.type === "SubExpression" && firstParam.path.original === "mut") {
        node.params[0] = b.sexpr("action", [firstParam]);
      }
    }

    let visitor = {
      MustacheStatement: handleNode,
      SubExpression: handleNode
    };

    // **** copy to here ****

    this.syntax.traverse(ast, visitor);

    return ast;
  }
}

module.exports = FnPolyfill;
