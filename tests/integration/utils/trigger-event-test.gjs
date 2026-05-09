import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { triggerKeyDown, triggerKeyPress, triggerKeyUp } from '#src/index.js';
import TriggerEventWidget from '../../../demo-app/components/trigger-event-widget.gjs';

import { hook } from '../../helpers/hook';

module('Integration | Util | triggerEvent', function (hooks) {
  setupRenderingTest(hooks);

  test('`keyDown` triggers a keydown event', async function (assert) {
    assert.expect(4);

    await render(<template><TriggerEventWidget /></template>);

    triggerKeyDown('KeyA');

    assert.dom(hook('key_down')).hasText('true', 'keyDown was triggered');
    assert
      .dom(hook('key_down_with_mods'))
      .hasText('false', 'keyDown was triggered with mods');
    assert.dom(hook('key_press')).hasText('false', 'keyPress was triggered');
    assert.dom(hook('key_up')).hasText('false', 'keyUp was triggered');
  });

  test('`keyPress` triggers a keypress event', async function (assert) {
    assert.expect(4);

    await render(<template><TriggerEventWidget /></template>);

    triggerKeyPress('KeyA');

    assert.dom(hook('key_down')).hasText('false', 'keyDown was triggered');
    assert
      .dom(hook('key_down_with_mods'))
      .hasText('false', 'keyDown was triggered with mods');
    assert.dom(hook('key_press')).hasText('true', 'keyPress was triggered');
    assert.dom(hook('key_up')).hasText('false', 'keyUp was triggered');
  });

  test('`keyUp` triggers a keyup event', async function (assert) {
    assert.expect(4);

    await render(<template><TriggerEventWidget /></template>);

    triggerKeyUp('KeyA');

    assert.dom(hook('key_down')).hasText('false', 'keyDown was triggered');
    assert
      .dom(hook('key_down_with_mods'))
      .hasText('false', 'keyDown was triggered with mods');
    assert.dom(hook('key_press')).hasText('false', 'keyPress was triggered');
    assert.dom(hook('key_up')).hasText('true', 'keyUp was triggered');
  });

  test('modifiers can be added', async function (assert) {
    assert.expect(4);

    await render(<template><TriggerEventWidget /></template>);

    triggerKeyDown('shift+KeyA+cmd');

    assert.dom(hook('key_down')).hasText('false', 'keyDown was triggered');
    assert
      .dom(hook('key_down_with_mods'))
      .hasText('true', 'keyDown was triggered with mods');
    assert.dom(hook('key_press')).hasText('false', 'keyPress was triggered');
    assert.dom(hook('key_up')).hasText('false', 'keyUp was triggered');
  });
});
