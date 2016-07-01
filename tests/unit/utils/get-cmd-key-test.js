import getCmdKey from 'dummy/utils/get-cmd-key';
import { module, test } from 'qunit';

module('Unit | Utility | get cmd key');

test('it returns ctrl for windows', function(assert) {
  let result = getCmdKey('Windows');
  assert.equal(result, 'ctrl');
});

test('it returns ctrl for linux', function(assert) {
  let result = getCmdKey('Linux');
  assert.equal(result, 'ctrl');
});

test('it defaults to ctlr for unexpected platform', function(assert) {
  let result = getCmdKey('NeXTSTEP');
  assert.equal(result, 'ctrl');
});

test('it returns meta (command) for macOS', function(assert) {
  let result = getCmdKey('MacIntel');
  assert.equal(result, 'meta');
});
