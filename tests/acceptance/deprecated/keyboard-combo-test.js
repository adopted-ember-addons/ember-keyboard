import { visit, currentURL, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { keyPress } from 'ember-keyboard/test-support/test-helpers';
import { textChanged } from '../../helpers/text-changed';
import { registerDeprecationHandler } from '@ember/debug';

module('Acceptance | ember keyboard | deprecated | keyboard combos', function(hooks) {
  setupApplicationTest(hooks);

  let deprecations;
  hooks.beforeEach(async function(assert) {
    deprecations = [];
    registerDeprecationHandler((message, options, next) => {
      deprecations.push({ message, options });
      next(message, options);
    });
    await visit('/test-scenario/deprecated/keyboard-combo');

    assert.equal(currentURL(), '/test-scenario/deprecated/keyboard-combo');
  });

  test('issues deprecation warnings', function(assert) {
    assert.ok(deprecations.length > 0);
    assert.equal(deprecations[0].message, "The `keyboard-press` component of ember-keyboard is deprecated. Please use the `on-key` helper instead.");
    assert.equal(deprecations[0].options.id, "ember-keyboard.keyboard-press");
    assert.equal(deprecations[0].options.until, "7.0.0");
    assert.equal(deprecations[0].options.url, "https://adopted-ember-addons.github.io/ember-keyboard/usage#deprecations-keyboard-press");
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
        code: 'BracketLeft',
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
          () => keyPress('ctrl+k'), {
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
    module('shift', function() {
      test('shift+Slash', async function(assert) {
        assert.expect(3);

        await textChanged(
          assert,
          () => keyPress('shift+Slash'), {
            selectorName: 'question-mark',
            beforeValue: 'question mark not pressed',
            afterValue: 'question mark pressed'
          });
      });
    });
  });
});
