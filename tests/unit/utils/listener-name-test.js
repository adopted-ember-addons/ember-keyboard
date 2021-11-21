import { module, test } from 'qunit';
import listenerName from 'ember-keyboard/utils/listener-name';
import getCmdKey from 'ember-keyboard/utils/get-cmd-key';

module('Unit | Utility | listener name', function() {
  test('it returns a sorted list of keys (with modifier) after the event name', function(assert) {
    const result = listenerName('keydown', ['c', 'alt', 'shift']);

    assert.strictEqual(result, 'keydown:alt+c+shift', 'name is correctly formatted');
  });

  test('it can be passed a string instead of an array of keys', function(assert) {
    const result = listenerName('keydown', 'shift+alt+c');

    assert.strictEqual(result, 'keydown:alt+c+shift', 'name is correctly formatted');
  });

  test('it returns a sorted list of keys after the event name', function(assert) {
    const result = listenerName('keydown', ['c', 'a', 'b']);

    assert.strictEqual(result, 'keydown:a+b+c', 'name is correctly formatted');
  });

  test('it returns `_all` if the keys array is empty', function(assert) {
    const result = listenerName('keydown');

    assert.strictEqual(result, 'keydown:_all', 'name is correctly formatted');
  });

  test('it replaces cmd with the platform appropriate key', function(assert) {
    const result = listenerName('keydown', ['Enter', 'cmd']);

    assert.strictEqual(result, `keydown:Enter+${getCmdKey()}`);
    assert.strictEqual(result.indexOf('cmd'), -1);
  });
});
