var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');
var broccoli = require('broccoli');
var plugin = require('../');
var lint = require('mocha-eslint');
var walkSync = require('walk-sync');

function file(path) {
  return fs.readFileSync(path,  'UTF-8').trim();;
}

describe('broccoli-sri-hash', function () {
  var builder;

  before(function() {
    builder = new broccoli.Builder(plugin('test/fixtures/input', {
      prefix: 'https://example.com/',
      crossorigin: 'anonymous'
    }));
  });

  after(function() {
    builder.cleanup();
  });

  it('rule outputs match (initial build)', function () {
    return builder.build().then(function(output) {
      var actual, expected;

      actual = file(output.directory + '/test.html');
      expected = file('test/fixtures/output/test.html');

      assert.equal(actual, expected);

      actual = file(output.directory + '/foo/test.html');
      expected = file('test/fixtures/output/foo/test.html');

      assert.equal(actual, expected);

      assert.deepEqual(walkSync(output.directory), [
        'favicon.png',
        'foo/',
        'foo/test.html',
        'moment-with-locales.min.js',
        'omg.png',
        'other.css',
        'test.html',
        'thing.js',
        'unicode-chars.js'
      ]);
    });
  });

  it('rule outputs match (rebuild)', function () {
    var pathToMutate = 'test/fixtures/input/other.css';
    var originalContent = fs.readFileSync(pathToMutate);
    return builder.build().then(function(output) {
      // mutate input File
      fs.writeFileSync('test/fixtures/input/other.css', '* { display: none; }');

      assert.deepEqual(walkSync(output.directory), [
        'favicon.png',
        'foo/',
        'foo/test.html',
        'moment-with-locales.min.js',
        'omg.png',
        'other.css',
        'test.html',
        'thing.js',
        'unicode-chars.js'
      ]);
      return builder.build();
    }).then(function(output) {
      var actual = file(output.directory + '/test.html');
      var expected = file('test/fixtures/output2/test.html');

      assert.deepEqual(walkSync(output.directory), [
        'favicon.png',
        'foo/',
        'foo/test.html',
        'moment-with-locales.min.js',
        'omg.png',
        'other.css',
        'test.html',
        'thing.js',
        'unicode-chars.js'
      ]);
      assert.equal(actual, expected);
    }).finally(function() {
      fs.writeFileSync(pathToMutate, originalContent);
    });
  });

});


lint([
  'index.js',
  'tests/index.js'
]);
