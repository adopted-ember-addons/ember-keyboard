import { visit, currentURL, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { keyDown } from 'ember-keyboard/test-support/test-helpers';

import { textChanged } from '../helpers/text-changed';

module('Acceptance | on-key helper ', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function(assert) {
    await visit('/test-scenario/on-key-examples');
    assert.equal(currentURL(), '/test-scenario/on-key-examples');
  });

  test('KeyS, no modifiers', async function(assert) {
    assert.expect(3);

    await textChanged(
      assert,
      () => keyDown('KeyS'), {
        selectorName: 's',
        beforeValue: 'S not pressed',
        afterValue: 'S pressed'
      });
  });

  test('Ctrl+KeyK', async function(assert) {
    assert.expect(3);

    await textChanged(
      assert,
      () => keyDown('ctrl+KeyK'), {
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
      () => keyDown('shift+Slash'), {
        selectorName: 'question-mark',
        beforeValue: 'question mark not pressed',
        afterValue: 'question mark pressed'
      });
  });
});
