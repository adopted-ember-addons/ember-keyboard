import getCmdKey from 'ember-keyboard/utils/get-cmd-key';
import { module, test } from 'qunit';

module('Unit | Utility | get cmd key', function() {
  test('it returns ctrl for windows', function(assert) {
    const result = getCmdKey('Windows');
    assert.strictEqual(result, 'ctrl');
  });

  test('it returns ctrl for linux', function(assert) {
    const result = getCmdKey('Linux');
    assert.strictEqual(result, 'ctrl');
  });

  test('it defaults to ctlr for unexpected platform', function(assert) {
    const result = getCmdKey('NeXTSTEP');
    assert.strictEqual(result, 'ctrl');
  });

  test('it returns meta (command) for macOS', function(assert) {
    const result = getCmdKey('MacIntel');
    assert.strictEqual(result, 'meta');
  });
});
