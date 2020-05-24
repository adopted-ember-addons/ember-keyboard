import { visit, currentURL, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { textChanged } from '../helpers/text-changed';

module('Acceptance | on-key helper ', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function(assert) {
    await visit('/test-scenario/on-key-helper-examples');
    assert.equal(currentURL(), '/test-scenario/on-key-helper-examples');
  });

  test('KeyS, no modifiers', async function(assert) {
    assert.expect(3);

    await textChanged(
      assert,
      () => triggerEvent(document.body, 'keydown', { code: 'KeyS', key: 's' }), {
        selectorName: 's',
        beforeValue: 'S not pressed',
        afterValue: 'S pressed'
      });
  });

  test('Ctrl+k', async function(assert) {
    assert.expect(3);

    await textChanged(
      assert,
      () => triggerEvent(document.body, 'keydown', { code: 'KeyK', key: 'k', ctrlKey: true }), {
        selectorName: 'ctrl-k',
        beforeValue: 'Ctrl+K not pressed',
        afterValue: 'Ctrl+K pressed'
      });
  });

  test('keydown: Ctrl+k on a Dvorak Keyboard', async function(assert) {
    assert.expect(3);

    const ctrlKDownProperties = {
      code: 'KeyV',
      key: 'k',
      keyCode: 75,
      which: 75,
      ctrlKey: true
    };

    await textChanged(
      assert,
      () => triggerEvent(document.body, 'keydown', ctrlKDownProperties), {
        selectorName: 'ctrl-k',
        beforeValue: 'Ctrl+K not pressed',
        afterValue: 'Ctrl+K pressed'
      });
  });

  test('shift+Slash', async function(assert) {
    assert.expect(3);

    await textChanged(
      assert,
      () => triggerEvent(document.body, 'keydown', { code: 'Slash', key: '?', shiftKey: true }), {
        selectorName: 'question-mark',
        beforeValue: 'question mark not pressed',
        afterValue: 'question mark pressed'
      });
  });
});
