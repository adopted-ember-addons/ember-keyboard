/* eslint-env node */
'use strict';

/*
  ```hbs
  {{set this.bar}}
  {{set this.bar "baz"}}
  ```

  becomes

  ```hbs
  {{set this "bar"}}
  {{set this "bar" "baz"}}
  ```
*/

module.exports = class SetTransform {
  transform(ast) {
    let b = this.syntax.builders;

    function transformNode(node) {
      if (node.path.original === 'set') {
        if (!node.params[0] || node.params[0].type !== 'PathExpression') {
          throw new Error(
            'the (set) helper requires a path to be passed in as its first parameter, received: ' +
              path.original
          );
        }

        if (node.params.length > 2) {
          throw new Error(
            'the (set) helper can only recieve 2 arguments at most, recieved: ' +
              node.params.length
          );
        }

        let path = node.params.shift();

        let splitPoint = path.original.lastIndexOf('.');

        let key = path.original.substr(splitPoint + 1);

        let targetName =
          splitPoint === -1 ? 'this' : path.original.substr(0, splitPoint);

        let target;

        if (targetName[0] === '@') {
          target = b.path(targetName.slice(1));
          target.data = true;
        } else {
          target = b.path(targetName);
        }

        node.params.unshift(target, b.string(key));

        // console.log(node);
      }
    }

    this.syntax.traverse(ast, {
      SubExpression: transformNode,
      MustacheStatement: transformNode,
    });

    return ast;
  }
};
