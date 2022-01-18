'use strict';

module.exports = function supportsAttribute(name, supported) {
  return !!supported.find(supportedName =>
    supportedName instanceof RegExp ? supportedName.exec(name) : name === supportedName
  );
};
