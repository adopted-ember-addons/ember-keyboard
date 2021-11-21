import { keyDown, keyUp } from 'ember-keyboard';
import { module, test } from 'qunit';

module('Unit | Listener | key events', function() {
  test('`keyDown` sorts the provided keys and prefixes `keydown:`', function(assert) {
    const result = keyDown('m+shift+ctrl');

    assert.strictEqual(result, 'keydown:ctrl+m+shift', 'it returns the correct value');
  });

  test('`keyUp` sorts the provided keys and prefixes `keyup:`', function(assert) {
    const result = keyUp('m+shift+ctrl');

    assert.strictEqual(result, 'keyup:ctrl+m+shift', 'it returns the correct value');
  });
});
