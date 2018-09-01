import { getKeyCode } from 'ember-keyboard';
import { module, test } from 'qunit';

module('Unit | Utility | get key code', function() {
  test('`getKeyCode` will return the `keyCode` associated with the provided `key`', function(assert) {
    const result = getKeyCode('BracketLeft');

    assert.equal(result, '219', 'it returns the correct keyCode');
  });
});
