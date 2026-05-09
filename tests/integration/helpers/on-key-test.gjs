import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  resetOnerror,
  setupOnerror,
  triggerEvent,
} from '@ember/test-helpers';
import { fn } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import onKey from '#src/helpers/on-key.js';
import { keyDown, keyPress, keyUp } from '#src/test-support/test-helpers.js';

class TestState {
  @tracked shouldRenderOnKeyHelper = false;
  @tracked isActivated = false;
}

module('Integration | Helper | on-key', function (hooks) {
  setupRenderingTest(hooks);

  let onTriggerCalled;
  let onTriggerImpl;
  const onTrigger = (...args) => onTriggerImpl(...args);
  const state = new TestState();

  hooks.beforeEach(function () {
    onTriggerCalled = false;
    onTriggerImpl = () => {
      onTriggerCalled = true;
    };
    state.shouldRenderOnKeyHelper = false;
    state.isActivated = false;
  });

  module('lifecycle', function (hooks) {
    let renderWithConditional;
    hooks.beforeEach(function () {
      state.shouldRenderOnKeyHelper = false;
      renderWithConditional = () => {
        return render(
          <template>
            {{#if state.shouldRenderOnKeyHelper}}
              {{onKey "shift+c" onTrigger}}
            {{/if}}
          </template>,
        );
      };
    });
    test('does not trigger if helper is not rendered', async function (assert) {
      await renderWithConditional();
      await keyDown('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');
    });
    test('triggers if helper is rendered', async function (assert) {
      await renderWithConditional();
      state.shouldRenderOnKeyHelper = true;
      await keyDown('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });
    test('does not trigger if helper is no longer rendered', async function (assert) {
      state.shouldRenderOnKeyHelper = true;
      await renderWithConditional();
      state.shouldRenderOnKeyHelper = false;
      await keyDown('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');
    });
  });

  test('called with event', async function (assert) {
    let onTriggerCalledWith;
    onTriggerImpl = (ev) => {
      onTriggerCalledWith = ev;
    };
    await render(<template>{{onKey "shift+c" onTrigger}}</template>);
    await keyDown('shift+c');
    assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
  });

  module('stopping propagation', function (hooks) {
    let triggered;
    let triggerImpl;
    const trigger = (...args) => triggerImpl(...args);
    hooks.beforeEach(function () {
      const keyboardService = this.owner.lookup('service:keyboard');
      keyboardService.set('isPropagationEnabled', true);
      triggered = [];
      triggerImpl = (letter, stop, stopImmediate, event, ekEvent) => {
        triggered.push(letter);
        if (stop) {
          ekEvent.stopPropagation();
        }
        if (stopImmediate) {
          ekEvent.stopImmediatePropagation();
        }
      };
    });
    test('stopPropagation+stopImmediatePropagation', async function (assert) {
      await render(
        <template>
          {{onKey "alt+a" (fn trigger "A2a" true true) priority=2}}
          {{onKey "alt+a" (fn trigger "A2b" true true) priority=2}}
          {{onKey "alt+a" (fn trigger "A1" true true) priority=1}}
        </template>,
      );
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
      assert.deepEqual(triggered, ['A2a']);
    });
    test('stopPropagation', async function (assert) {
      await render(
        <template>
          {{onKey "alt+a" (fn trigger "A2a" true false) priority=2}}
          {{onKey "alt+a" (fn trigger "A2b" true false) priority=2}}
          {{onKey "alt+a" (fn trigger "A1" true false) priority=1}}
        </template>,
      );
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
      assert.deepEqual(triggered, ['A2a', 'A2b']);
    });
    test('stopImmediatePropagation', async function (assert) {
      await render(
        <template>
          {{onKey "alt+a" (fn trigger "A2a" false true) priority=2}}
          {{onKey "alt+a" (fn trigger "A2b" false true) priority=2}}
          {{onKey "alt+a" (fn trigger "A1" false true) priority=1}}
        </template>,
      );
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
      assert.deepEqual(triggered, ['A2a', 'A1']);
    });
    test('no stopping', async function (assert) {
      await render(
        <template>
          {{onKey "alt+a" (fn trigger "A2a" false false) priority=2}}
          {{onKey "alt+a" (fn trigger "A2b" false false) priority=2}}
          {{onKey "alt+a" (fn trigger "A1" false false) priority=1}}
        </template>,
      );
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
      assert.deepEqual(triggered, ['A2a', 'A2b', 'A1']);
    });
  });

  module('unspecified event param', function (hooks) {
    hooks.beforeEach(async function () {
      await render(<template>{{onKey "shift+c" onTrigger}}</template>);
    });
    test('triggers on keydown by default (affirmative)', async function (assert) {
      await keyDown('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });

    test('does not trigger on keyup or keypress', async function (assert) {
      await keyUp('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');

      await keyPress('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');
    });
  });

  module('with event="keydown"', function (hooks) {
    hooks.beforeEach(async function () {
      await render(
        <template>{{onKey "shift+c" onTrigger event="keydown"}}</template>,
      );
    });
    test('triggers on keydown', async function (assert) {
      await keyDown('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });

    test('does not trigger on keyup or keypress', async function (assert) {
      await keyUp('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');

      await keyPress('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');
    });
  });

  module('with event="keyup"', function (hooks) {
    hooks.beforeEach(async function () {
      await render(
        <template>{{onKey "shift+c" onTrigger event="keyup"}}</template>,
      );
    });
    test('triggers on keyup', async function (assert) {
      await keyUp('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });

    test('does not trigger on keydown or keypress', async function (assert) {
      await keyDown('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');

      await keyPress('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');
    });
  });

  module('with event="keypress"', function (hooks) {
    hooks.beforeEach(async function () {
      await render(
        <template>{{onKey "shift+c" onTrigger event="keypress"}}</template>,
      );
    });
    test('triggers on keypress', async function (assert) {
      await keyPress('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });

    test('does not trigger on keydown or keyup', async function (assert) {
      await keyDown('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');

      await keyUp('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');
    });
  });

  module('activated param', function (hooks) {
    let renderWithActivated;
    hooks.beforeEach(function () {
      state.isActivated = false;
      renderWithActivated = () => {
        return render(
          <template>
            {{onKey "shift+c" onTrigger activated=state.isActivated}}
          </template>,
        );
      };
    });
    test('does not trigger if helper is not activated', async function (assert) {
      await renderWithActivated();
      await keyDown('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');
    });
    test('triggers if helper is activated', async function (assert) {
      await renderWithActivated();
      state.isActivated = true;
      await keyDown('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });
    test('does not trigger if helper is no longer activated', async function (assert) {
      state.shouldRenderOnKeyHelper = true;
      await renderWithActivated();
      state.isActivated = false;
      await keyDown('shift+c');
      assert.notOk(onTriggerCalled, 'does not trigger action');
    });
  });

  module('error cases', function (hooks) {
    hooks.afterEach(() => resetOnerror());

    test('errors if invoked without a handler', async function (assert) {
      assert.expect(1);
      const doesNotExist = undefined;
      setupOnerror(function (error) {
        assert.strictEqual(
          error.message,
          'Assertion Failed: ember-keyboard: You must pass a function as the second argument to the `on-key` helper',
          'error is thrown',
        );
      });
      await render(<template>{{onKey "alt+a" doesNotExist}}</template>);
      await triggerEvent(document.body, 'keydown', {
        altKey: true,
        key: 'c',
      });
    });
  });
});
