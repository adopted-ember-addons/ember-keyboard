import { keyDown, keyUp } from 'ember-keyboard';
import { module, test } from 'qunit';

module('Unit | Listener | key events');

test('`keyDown` sorts the provided keys and prefixes `keydown:`', function(assert) {
  const result = keyDown('m+shift+ctrl');

  assert.equal(result, 'keydown:ctrl+m+shift', 'it returns the correct value');
});

test('`keyUp` sorts the provided keys and prefixes `keyup:`', function(assert) {
  const result = keyUp('m+shift+ctrl');

  assert.equal(result, 'keyup:ctrl+m+shift', 'it returns the correct value');
});
