'use strict';

const reLines = /(.*?(?:\r\n?|\n|$))/gm;
const ALPHA = /[A-Za-z]/;

class AngleBracketPolyfill {
  constructor(options) {
    this.syntax = null;
    this.sourceLines = options.contents && options.contents.match(reLines);
  }

  transform(ast) {
    let b = this.syntax.builders;

    // in order to debug in https://https://astexplorer.net/#/gist/0590eb883edfcd163b183514df4cc717
    // **** copy from here ****

    function dasherize(string) {
      return string.replace(/[A-Z]/g, function(char, index) {
        if (index === 0 || !ALPHA.test(string[index - 1])) {
          return char.toLowerCase();
        }

        return `-${char.toLowerCase()}`;
      });
    }

    let rootProgram;
    let letBlock;
    let yieldedComponents = new Map();

    function ensureLetWrapper() {
      if (!letBlock) {
        letBlock = b.block('let', [], b.hash([]), b.program(rootProgram.body), null, null);
        rootProgram.body = [letBlock];
      }
    }

    let counter = 0;
    function localNameForYieldedComponent(tag) {
      let localName = yieldedComponents.get(tag);
      if (!localName) {
        localName = tag.replace(/::/g, '') + '_ANGLE_' + counter++;
        let transformedPath = dasherize(tag.replace(/::/g, '/'));

        let positionalArg = b.sexpr(b.path('component'), [b.string(transformedPath)]);
        letBlock.params.push(positionalArg);
        letBlock.program.blockParams.push(localName);

        yieldedComponents.set(tag, localName);
      }

      return localName;
    }

    let visitor = {
      // supports glimmer-vm@0.39
      Template(node) {
        rootProgram = node;
      },

      // supports glimmer-vm < 0.39
      Program(node) {
        // on older ember versions `Program` is used for both the "wrapping
        // template" and for each block
        if (!rootProgram) {
          rootProgram = node;
        }
      },

      ElementNode(node) {
        let tag = node.tag;

        if (tag.indexOf('::') !== -1) {
          ensureLetWrapper();

          let localName = localNameForYieldedComponent(tag);
          node.tag = localName;
        }
      },
    };
    // **** copy to here ****

    this.syntax.traverse(ast, visitor);

    return ast;
  }
}

module.exports = AngleBracketPolyfill;
