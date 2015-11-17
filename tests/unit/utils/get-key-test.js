import { getKey } from 'ember-keyboard';
import { module, test } from 'qunit';

module('Unit | Utility | get key');

test('`getKey` will get the `key` off the event if available', function(assert) {
  const result = getKey({ key: 'foo' });

  assert.equal(result, 'foo', 'it returns the correct value');
});

test('`getKey` will translate the `keyCode` if there is no `key`', function(assert) {
  const result = getKey({ keyCode: 8 });

  assert.equal(result, 'Backspace', 'it returns the correct value');
});
