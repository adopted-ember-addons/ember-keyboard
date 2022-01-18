'use strict';
/* eslint-disable node/no-unpublished-require */

/*
  This script is pretty useful for launching a single template compilation
  with our script:

  node --inspect-brk lib/sample-compile-script.js
*/

const compiler = require('ember-source/dist/ember-template-compiler');
//compiler.registerPlugin('ast', require('ember-named-arguments-polyfill/lib/ast-transform'));
compiler.registerPlugin('ast', require('./ast-transform'));

let template = '<@curriedThing />';
let output = compiler.precompile(template, { contents: template });
console.log(output); // eslint-disable-line no-console
