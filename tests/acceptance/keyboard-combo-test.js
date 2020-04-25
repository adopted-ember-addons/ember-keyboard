import { visit, currentURL, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { keyPress } from 'ember-keyboard/test-support/test-helpers';

import { textChanged } from '../helpers/text-changed';

module('Acceptance | ember keyboard | keyboard combos', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function(assert) {
    await visit('/test-scenario/keyboard-combo');

    assert.equal(currentURL(), '/test-scenario/keyboard-combo');
  });

  module('Without Modifiers', function() {
    test('KeyS', async function(assert) {
      assert.expect(3);

      await textChanged(
        assert,
        () => keyPress('KeyS'), {
          selectorName: 's',
          beforeValue: 'S not pressed',
          afterValue: 'S pressed'
        });
    });

    test('keydown: Slash on a Dvorak Keyboard', async function(assert) {
      assert.expect(3);

      const slashDownProperties = {
        code: 'BraketLeft',
        key: '/',
        keyCode: 191,
        which: 191
      };

      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', slashDownProperties), {
          selectorName: 'slash',
          beforeValue: 'slash not pressed',
          afterValue: 'slash pressed'
        });
    });
  });

  module('With Modifiers', function() {
    module('Ctrl', function() {
      test('Ctrl+KeyK', async function(assert) {
        assert.expect(3);

        await textChanged(
          assert,
          () => keyPress('ctrl+KeyK'), {
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
    });
  });
});
