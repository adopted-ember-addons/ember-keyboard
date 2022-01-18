'use strict';

const checkAttributes = require('./helpers/check-attributes');
const supportsAttribute = require('./helpers/supports-attribute');
const expressionForAttributeValue = require('./helpers/expression-for-attribute-value');
const getTag = require('./helpers/get-tag');

const reLines = /(.*?(?:\r\n?|\n|$))/gm;
const attributeToPropertyMap = {
  role: 'ariaRole',
};

const commonAttributes = [
  'id',
  'class',
  'role',

  // TextSupportMixin
  'autocapitalize',
  'autocorrect',
  'autofocus',
  'disabled',
  'form',
  'maxlength',
  'minlength',
  'placeholder',
  'readonly',
  'required',
  'selectionDirection',
  'spellcheck',
  'tabindex',
  'title',

  /data-test-.+/, // support for ember-test-selectors
];

const inputAttributes = [
  'accept',
  'autocomplete',
  'autosave',
  'dir',
  'formaction',
  'formenctype',
  'formmethod',
  'formnovalidate',
  'formtarget',
  'height',
  'inputmode',
  'lang',
  'list',
  'type',
  'max',
  'min',
  'multiple',
  'name',
  'pattern',
  'size',
  'step',
  'value',
  'width',
].concat(commonAttributes);

const textareaAttributes = [
  'rows',
  'cols',
  'name',
  'selectionEnd',
  'selectionStart',
  'autocomplete',
  'wrap',
  'lang',
  'dir',
  'value',
].concat(commonAttributes);

const checkboxAttributes = [
  'type',
  'checked',
  'indeterminate',
  'disabled',
  'tabindex',
  'name',
  'autofocus',
  'required',
  'form',
].concat(commonAttributes);

class AngleBracketInputPolyfill {
  constructor(options) {
    this.moduleName = options.meta && options.meta.moduleName;
    this.syntax = null;
    this.sourceLines = options.contents && options.contents.match(reLines);
  }

  transform(ast) {
    let b = this.syntax.builders;
    let { moduleName, sourceLines } = this;

    // in order to debug in https://https://astexplorer.net/#/gist/0590eb883edfcd163b183514df4cc717
    // **** copy from here ****
    let visitor = {
      ElementNode(node) {
        let tag = getTag(node, sourceLines);

        if (tag === 'Input' || tag === 'Textarea') {
          let { attributes } = node;
          let isCheckbox =
            tag === 'Input' &&
            attributes.find(({ name, value }) => name === '@type' && value.chars === 'checkbox');
          let supportedAttributes =
            tag === 'Textarea'
              ? textareaAttributes
              : isCheckbox
              ? checkboxAttributes
              : inputAttributes;

          checkAttributes(node, supportedAttributes, moduleName);

          let props = attributes
            .filter(({ name }) => name.charAt(0) === '@')
            .map(attribute => Object.assign({}, attribute, { name: attribute.name.slice(1) }));
          let attrs = attributes
            .filter(({ name }) => supportsAttribute(name, supportedAttributes))
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

          return b.mustache(b.path(tag.toLowerCase()), null, hash, false, node.loc);
        }
      },
    };
    // **** copy to here ****

    this.syntax.traverse(ast, visitor);

    return ast;
  }
}

module.exports = AngleBracketInputPolyfill;
