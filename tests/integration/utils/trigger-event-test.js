import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  triggerKeyDown,
  triggerKeyPress,
  triggerKeyUp,
  initialize
} from 'ember-keyboard';

import { hook } from '../../helpers/hook';

module('Integration | Util | triggerEvent', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    initialize();
  });

  test('`keyDown` triggers a keydown event', async function(assert) {
    assert.expect(4);

    await render(hbs`{{trigger-event-test}}`);

    triggerKeyDown('KeyA');

    assert.equal(document.querySelector(hook('key_down')).textContent.trim(), 'true', 'keyDown was triggered');
    assert.equal(document.querySelector(hook('key_down_with_mods')).textContent.trim(), 'false', 'keyDown was triggered with mods');
    assert.equal(document.querySelector(hook('key_press')).textContent.trim(), 'false', 'keyPress was triggered');
    assert.equal(document.querySelector(hook('key_up')).textContent.trim(), 'false', 'keyUp was triggered');
  });

  test('`keyPress` triggers a keypress event', async function(assert) {
    assert.expect(4);

    await render(hbs`{{trigger-event-test}}`);

    triggerKeyPress('KeyA');

    assert.equal(document.querySelector(hook('key_down')).textContent.trim(), 'false', 'keyDown was triggered');
    assert.equal(document.querySelector(hook('key_down_with_mods')).textContent.trim(), 'false', 'keyDown was triggered with mods');
    assert.equal(document.querySelector(hook('key_press')).textContent.trim(), 'true', 'keyPress was triggered');
    assert.equal(document.querySelector(hook('key_up')).textContent.trim(), 'false', 'keyUp was triggered');
  });

  test('`keyUp` triggers a keyup event', async function(assert) {
    assert.expect(4);

    await render(hbs`{{trigger-event-test}}`);

    triggerKeyUp('KeyA');

    assert.equal(document.querySelector(hook('key_down')).textContent.trim(), 'false', 'keyDown was triggered');
    assert.equal(document.querySelector(hook('key_down_with_mods')).textContent.trim(), 'false', 'keyDown was triggered with mods');
    assert.equal(document.querySelector(hook('key_press')).textContent.trim(), 'false', 'keyPress was triggered');
    assert.equal(document.querySelector(hook('key_up')).textContent.trim(), 'true', 'keyUp was triggered');
  });

  test('modifiers can be added', async function(assert) {
    assert.expect(4);

    await render(hbs`{{trigger-event-test}}`);

    triggerKeyDown('shift+KeyA+cmd');

    assert.equal(document.querySelector(hook('key_down')).textContent.trim(), 'false', 'keyDown was triggered');
    assert.equal(document.querySelector(hook('key_down_with_mods')).textContent.trim(), 'true', 'keyDown was triggered with mods');
    assert.equal(document.querySelector(hook('key_press')).textContent.trim(), 'false', 'keyPress was triggered');
    assert.equal(document.querySelector(hook('key_up')).textContent.trim(), 'false', 'keyUp was triggered');
  });
});
