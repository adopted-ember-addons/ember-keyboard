import { getCode } from 'ember-keyboard';
import { module, test } from 'qunit';

module('Unit | Utility | get code', function() {
  test('`getCode` will get the `key` off the event if available', function(assert) {
    const result = getCode({ code: 'foo' });

    assert.equal(result, 'foo', 'it returns the correct value');
  });

  test('`getCode` will translate the `keyCode` if there is no `key`', function(assert) {
    const result = getCode({ keyCode: 219 });

    assert.equal(result, 'BracketLeft', 'it returns the correct value');
  });
});
