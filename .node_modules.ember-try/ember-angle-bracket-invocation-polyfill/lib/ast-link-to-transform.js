'use strict';

const checkAttributes = require('./helpers/check-attributes');
const supportsAttribute = require('./helpers/supports-attribute');
const expressionForAttributeValue = require('./helpers/expression-for-attribute-value');
const SilentError = require('silent-error');

const reservedProps = ['@route', '@model', '@models', '@query'];
const supportedHTMLAttributes = [
  'id',
  'class',
  'rel',
  'tabindex',
  'title',
  'target',
  'role',

  /data-test-.+/, // support for ember-test-selectors
];
const attributeToPropertyMap = {
  role: 'ariaRole',
};

class AngleBracketLinkToPolyfill {
  constructor(options) {
    this.moduleName = options.meta && options.meta.moduleName;
  }

  transform(ast) {
    let b = this.syntax.builders;
    let { moduleName } = this;

    // in order to debug in https://astexplorer.net/#/gist/0590eb883edfcd163b183514df4cc717/4f4fe68b6c9de49e633ceb7f41a0c13b6fcc6cc6
    // **** copy from here ****
    let visitor = {
      ElementNode(node) {
        if (node.tag.toLowerCase() === 'linkto') {
          let { children, blockParams, attributes } = node;
          let params = [];
          let helperParams = [];

          let route = attributes.find(({ name }) => name === '@route');
          let model = attributes.find(({ name }) => name === '@model');
          let models = attributes.find(({ name }) => name === '@models');
          let query = attributes.find(({ name }) => name === '@query');

          if (model && models) {
            throw new SilentError(
              'You cannot provide both the `@model` and `@models` arguments to the <LinkTo> component.'
            );
          }

          checkAttributes(node, supportedHTMLAttributes, moduleName);

          let needsParamsHelper =
            (models && models.value.path.original !== 'array') ||
            (query && query.value.path.original !== 'hash');

          if (route) {
            if (needsParamsHelper) {
              helperParams.push(b.pair('route', expressionForAttributeValue(b, route.value)));
            } else {
              params.push(expressionForAttributeValue(b, route.value));
            }
          }

          if (model) {
            if (needsParamsHelper) {
              helperParams.push(b.pair('model', expressionForAttributeValue(b, model.value)));
            } else {
              params.push(expressionForAttributeValue(b, model.value));
            }
          }

          if (models) {
            if (models.value.path.original === 'array') {
              params.push(...models.value.params);
            } else {
              helperParams.push(b.pair('models', expressionForAttributeValue(b, models.value)));
            }
          }

          if (query) {
            if (query.value.path.original === 'hash') {
              params.push(b.sexpr('query-params', null, query.value.hash, query.loc));
            } else {
              helperParams.push(b.pair('query', expressionForAttributeValue(b, query.value)));
            }
          }

          let props = attributes
            .filter(({ name }) => name.charAt(0) === '@' && !reservedProps.includes(name))
            .map(attribute => Object.assign({}, attribute, { name: attribute.name.slice(1) }));
          let attrs = attributes
            .filter(({ name }) => supportsAttribute(name, supportedHTMLAttributes))
            .map(attribute =>
              attributeToPropertyMap[attribute.name]
                ? Object.assign({}, attribute, { name: attributeToPropertyMap[attribute.name] })
                : attribute
            );

          let hash = b.hash(
            [...props, ...attrs].map(({ name, value, loc }) =>
              b.pair(name, expressionForAttributeValue(b, value), loc)
            )
          );

          if (needsParamsHelper) {
            hash.pairs.push(
              b.pair('params', b.sexpr('-link-to-params', null, b.hash(helperParams)))
            );

            return b.block(
              b.path('link-to'),
              null,
              hash,
              b.program(children, blockParams),
              null,
              node.loc
            );
          } else {
            return b.block(
              b.path('link-to'),
              params,
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

module.exports = AngleBracketLinkToPolyfill;
