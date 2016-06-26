import listenerName from '../../../utils/listener-name';
import { module, test } from 'qunit';
import getCmdKey from 'ember-keyboard/utils/get-cmd-key';

module('Unit | Utility | listener name');

test('it returns a sorted list of keys after the event name', function(assert) {
  const result = listenerName('keydown', ['c', 'a', 'b']);

  assert.equal(result, 'keydown:a+b+c', 'name is correctly formatted');
});

test('it returns `_all` if the keys array is empty', function(assert) {
  const result = listenerName('keydown');

  assert.equal(result, 'keydown:_all', 'name is correctly formatted');
});

test('it replaces cmd with the platform appropriate key', function(assert) {
  const result = listenerName('keydown', ['Enter', 'cmd']);

  assert.equal(result, `keydown:Enter+${getCmdKey()}`);
  assert.equal(result.indexOf('cmd'), -1);
});
