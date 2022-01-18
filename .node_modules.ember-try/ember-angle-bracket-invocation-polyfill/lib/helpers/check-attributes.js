'use strict';

const calculateLocationDisplay = require('./calculate-location-display');
const supportsAttribute = require('./supports-attribute');
const SilentError = require('silent-error');

module.exports = function checkAttributes(node, supported, moduleName) {
  let sourceReference = calculateLocationDisplay(moduleName, node.loc.start);

  if (node.modifiers.length > 0) {
    throw new SilentError(
      `Passing element modifiers to the <${node.tag}> component ${sourceReference} is not supported by ember-angle-bracket-invocation-polyfill.`
    );
  }

  let unsupported = node.attributes
    .map(({ name }) => name)
    .filter(name => name.charAt(0) !== '@' && !supportsAttribute(name, supported));

  if (unsupported.length > 0) {
    console.warn(
      `You passed ${
        unsupported.length > 1 ? 'these HTML attributes' : 'this HTML attribute'
      } to the <${
        node.tag
      }> component ${sourceReference} which cannot be supported by ember-angle-bracket-invocation-polyfill: ${unsupported.join(
        ', '
      )}`
    );
  }
};
