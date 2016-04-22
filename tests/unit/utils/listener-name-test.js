import listenerName from '../../../utils/listener-name';
import { module, test } from 'qunit';

module('Unit | Utility | listener name');

test('it returns a sorted list of keys after the event name', function(assert) {
  const result = listenerName('keydown', ['c', 'a', 'b']);

  assert.equal(result, 'keydown:a+b+c', 'name is correctly formatted');
});

test('it returns `_all` if the keys array is empty', function(assert) {
  const result = listenerName('keydown');

  assert.equal(result, 'keydown:_all', 'name is correctly formatted');
});

test('it converts keys that are in the alt-key-names fixture', function(assert) {
  const result = listenerName('keydown', ['Down']);

  assert.equal(result, 'keydown:ArrowDown', 'name is converted');
});
