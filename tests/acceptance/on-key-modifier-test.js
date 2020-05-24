import { currentURL, click, fillIn, focus, triggerEvent, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { gte } from 'ember-compatibility-helpers';
import { textChanged } from '../helpers/text-changed';

if (gte('3.12.0')) {
  module('Acceptance | ember keyboard | on-key modifier', function(hooks) {
    setupApplicationTest(hooks);

    hooks.beforeEach(async function(assert) {
      await visit('/test-scenario/on-key-modifier-examples');

      assert.equal(currentURL(), '/test-scenario/on-key-modifier-examples');
    });

    test('KeyB button shortcut', async function(assert) {
      assert.expect(3);
      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', { code: 'KeyB', key: 'b' }), {
          selectorName: 'b-button',
          beforeValue: 'button press not triggered',
          afterValue: 'button press triggered'
        });
    });

    test('KeyC button shortcut should only fire when keyboard is activated', async function(assert) {
      assert.expect(5);

      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', { code: 'KeyC', key: 'c' }), {
          selectorName: 'c-button',
          beforeValue: 'button press not triggered',
          afterValue: 'button press not triggered'
        });

      await click('[data-test-checkbox]')
      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', { code: 'KeyC', key: 'c' }), {
          selectorName: 'c-button',
          beforeValue: 'button press not triggered',
          afterValue: 'button press triggered'
        });
    });

    test('KeyD button shortcut for keydown should fire', async function(assert) {
      assert.expect(5);

      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keyup', { code: 'KeyD', key: 'd' }), {
          selectorName: 'd-button',
          beforeValue: 'button press not triggered',
          afterValue: 'button press not triggered'
        });

      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', { code: 'KeyD', key: 'd' }), {
          selectorName: 'd-button',
          beforeValue: 'button press not triggered',
          afterValue: 'button press triggered'
        });
    });

    test('KeyP button shortcut should only fire highest priority', async function(assert) {
      assert.expect(5);

      await fillIn('[data-test-priority]', 1);

      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', { code: 'KeyD', key: 'd' }), {
          selectorName: 'd-button',
          beforeValue: 'button press not triggered',
          afterValue: 'button press not triggered'
        });

      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', { code: 'KeyP', key: 'p' }), {
          selectorName: 'p-button',
          beforeValue: 'button press not triggered',
          afterValue: 'button press triggered'
        });
    });


    test('Enter text input shortcut', async function(assert) {
      assert.expect(5);

      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', { code: 'Enter', key: 'Enter' }), {
          selectorName: 'text-field',
          beforeValue: 'enter not pressed while input focused',
          afterValue: 'enter not pressed while input focused'
        });

      await focus('input[type="text"]');
      await textChanged(
        assert,
        () => triggerEvent(document.body, 'keydown', { code: 'Enter', key: 'Enter' }), {
          selectorName: 'text-field',
          beforeValue: 'enter not pressed while input focused',
          afterValue: 'enter pressed while input focused'
        });
    });
  });
}
