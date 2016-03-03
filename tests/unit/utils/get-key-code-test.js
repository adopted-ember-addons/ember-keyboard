import { getKeyCode } from 'ember-keyboard';
import { module, test } from 'qunit';

module('Unit | Utility | get key code');

test('`getKeyCode` will return the `keyCode` associated with the provided `key`', function(assert) {
  const result = getKeyCode('Backspace');

  assert.equal(result, '8', 'it returns the correct keyCode');
});
