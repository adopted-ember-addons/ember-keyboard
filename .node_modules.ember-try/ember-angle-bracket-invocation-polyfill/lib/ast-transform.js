'use strict';

const getTag = require('./helpers/get-tag');
const sourceForNode = require('./helpers/source-for-node');
const expressionForAttributeValue = require('./helpers/expression-for-attribute-value');

const reLines = /(.*?(?:\r\n?|\n|$))/gm;
const ALPHA = /[A-Za-z]/;

class AngleBracketPolyfill {
  constructor(options) {
    this.syntax = null;
    this.sourceLines = options.contents && options.contents.match(reLines);
  }

  transform(ast) {
    let b = this.syntax.builders;
    let { sourceLines } = this;
    let hasSourceAvailable = sourceLines && sourceLines.length > 0;

    // in order to debug in https://astexplorer.net/#/gist/5e923e7322de5052a26a5a292f8c3995/
    // **** copy from here ****
    function dasherize(string) {
      return string.replace(/[A-Z]/g, function(char, index) {
        if (index === 0 || !ALPHA.test(string[index - 1])) {
          return char.toLowerCase();
        }

        return `-${char.toLowerCase()}`;
      });
    }

    function replaceNestedComponents(string) {
      return string.replace(/::/g, '/');
    }

    function getSelfClosing(element) {
      if ('selfClosing' in element) {
        return element.selfClosing;
      }
      if (!hasSourceAvailable || element.loc.source === '(synthetic)') {
        return false;
      }

      let nodeSource = sourceForNode(element, sourceLines);
      let firstClosingBracketIndex = nodeSource.indexOf('>');

      return nodeSource[firstClosingBracketIndex - 1] === '/';
    }

    function getInvocationDetails(element) {
      let tag = getTag(element, sourceLines);
      let invocationFirstChar = tag[0];
      let isNamedArgument = invocationFirstChar === '@';
      let isThisPath = tag.indexOf('this.') === 0;
      let [maybeLocal] = tag.split('.');

      let isLocal = locals.indexOf(maybeLocal) !== -1;
      let isUpperCase =
        invocationFirstChar === (invocationFirstChar && invocationFirstChar.toUpperCase()) &&
        invocationFirstChar !== (invocationFirstChar && invocationFirstChar.toLowerCase());
      let selfClosing = getSelfClosing(element);
      let hasAttrSplat = element.attributes.find(n => n.name === '...attributes');
      let dasherizedComponentName = dasherize(tag);
      let nestedComponentName = replaceNestedComponents(dasherizedComponentName);
      let singleWordComponent = nestedComponentName.indexOf('-') === -1;

      if (isLocal || isNamedArgument || isThisPath) {
        let path = b.path(tag);

        if (isNamedArgument) {
          path = b.path(tag.slice(1));
          path.original = tag;
          path.data = true;
        }

        return {
          kind: 'DynamicComponent',
          path,
          selfClosing,
          hasAttrSplat,
        };
      } else if (isUpperCase && singleWordComponent) {
        let path = b.string(nestedComponentName);

        return {
          kind: 'DynamicComponent',
          path,
          selfClosing,
          hasAttrSplat,
        };
      } else if (isUpperCase) {
        return {
          kind: 'StaticComponent',
          componentName: nestedComponentName,
          selfClosing,
          hasAttrSplat,
        };
      } else {
        return { kind: 'Element', hasAttrSplat };
      }
    }

    function attrsAsHash(attrs) {
      if (attrs.length > 0) {
        return b.sexpr(
          'hash',
          [],
          b.hash(
            attrs.map(attr =>
              b.pair(attr.name, expressionForAttributeValue(b, attr.value), attr.loc)
            )
          )
        );
      }
    }

    function angleAttrsExpression(attributes) {
      let preSplatAttributes = [];
      let postSplatAttributes = [];
      let foundSplat = false;

      for (let i = 0; i < attributes.length; i++) {
        let attr = attributes[i];
        if (attr.name === '...attributes') {
          foundSplat = true;
        } else {
          if (foundSplat) {
            postSplatAttributes.push(attr);
          } else {
            preSplatAttributes.push(attr);
          }
        }
      }

      let attrGroups = [
        attrsAsHash(preSplatAttributes),
        foundSplat && b.path('__ANGLE_ATTRS__'),
        attrsAsHash(postSplatAttributes),
      ].filter(Boolean);
      if (attrGroups.length > 1) {
        return b.sexpr('-merge-attrs', attrGroups);
      } else {
        return attrGroups[0];
      }
    }

    let locals = [];

    let visitor = {
      Program: {
        enter(node) {
          locals.push(...node.blockParams);
        },
        exit(node) {
          for (let i = 0; i < node.blockParams.length; i++) {
            locals.pop();
          }
        },
      },

      ElementNode(node) {
        let invocation = getInvocationDetails(node);

        if (invocation.kind === 'Element') {
          if (invocation.hasAttrSplat) {
            let angle = angleAttrsExpression(node.attributes);
            node.attributes = [];
            node.modifiers.push(b.elementModifier('_splattributes', [angle]));
          }
          return;
        }

        let { children, blockParams } = node;

        let attributes = node.attributes.filter(node => node.name[0] !== '@');
        let args = node.attributes.filter(
          node => node.name[0] === '@' && node.name !== '...attributes'
        );

        let hash = b.hash(
          args.map(arg =>
            b.pair(arg.name.slice(1), expressionForAttributeValue(b, arg.value), arg.loc)
          )
        );

        if (attributes.length > 0) {
          hash.pairs.push(b.pair('__ANGLE_ATTRS__', angleAttrsExpression(attributes)));
        }

        if (invocation.kind === 'StaticComponent') {
          if (invocation.selfClosing === true) {
            return b.mustache(invocation.componentName, null, hash, false, node.loc);
          } else {
            return b.block(
              invocation.componentName,
              null,
              hash,
              b.program(children, blockParams),
              null,
              node.loc
            );
          }
        } else {
          if (invocation.selfClosing === true) {
            return b.mustache('component', [invocation.path], hash, null, node.loc);
          } else {
            return b.block(
              'component',
              [invocation.path],
              hash,
              b.program(children, blockParams),
              null,
              node.loc
            );
          }
        }
      },
    };
    // **** copy to here ****

    this.syntax.traverse(ast, visitor);

    return ast;
  }
}

module.exports = AngleBracketPolyfill;
