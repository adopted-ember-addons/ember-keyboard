import { focus, visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { gte } from 'ember-compatibility-helpers';

import { keyDown, keyPress } from 'ember-keyboard/test-support/test-helpers';

import { textChanged } from '../helpers/text-changed';

if (gte('3.12.0')) {
  module('Acceptance | ember keyboard | element modifiers', function(hooks) {
    setupApplicationTest(hooks);

    hooks.beforeEach(async function(assert) {
      await visit('/test-scenario/element-modifiers');

      assert.equal(currentURL(), '/test-scenario/element-modifiers');
    });

    test('KeyB button shortcut', async function(assert) {
      assert.expect(3);

      await textChanged(
        assert,
        () => keyPress('KeyB'), {
          selectorName: 'button',
          beforeValue: 'button press not triggered',
          afterValue: 'button press triggered'
        });
    });

    test('Enter text input shortcut', async function(assert) {
      assert.expect(5);

      await textChanged(
        assert,
        () => keyDown('Enter'), {
          selectorName: 'text-field',
          beforeValue: 'enter not pressed while input focused',
          afterValue: 'enter not pressed while input focused'
        });

      await focus('input[type="text"]');
      await textChanged(
        assert,
        () => keyDown('Enter'), {
          selectorName: 'text-field',
          beforeValue: 'enter not pressed while input focused',
          afterValue: 'enter pressed while input focused'
        });
    });
  });
}
