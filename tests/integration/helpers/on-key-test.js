import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, resetOnerror, setupOnerror, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { keyDown, keyPress, keyUp } from 'ember-keyboard/test-support/test-helpers';

module('Integration | Helper | on-key', function(hooks) {
  setupRenderingTest(hooks);

  let onTriggerCalled;
  hooks.beforeEach(function() {
    onTriggerCalled = false;
    this.set('onTrigger', () => {
      onTriggerCalled = true;
    });
  });

  module('lifecycle', function() {
    hooks.beforeEach(function() {
      this.set('shouldRenderOnKeyHelper', false);
      this.renderWithConditional = () => {
        return render(hbs`
          {{#if shouldRenderOnKeyHelper}}
            {{on-key 'shift+c' onTrigger}}
          {{/if}}
        `);
      }
    });
    test('does not trigger if helper is not rendered', async function(assert) {
      await this.renderWithConditional();
      await keyDown('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');
    });
    test('triggers if helper is rendered', async function(assert) {
      await this.renderWithConditional();
      this.set('shouldRenderOnKeyHelper', true);
      await keyDown('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });
    test('does not trigger if helper is no longer rendered', async function(assert) {
      this.set('shouldRenderOnKeyHelper', true);
      await this.renderWithConditional();
      await this.set('shouldRenderOnKeyHelper', false);
      await keyDown('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');
    });
  });

  test('called with event', async function(assert) {
    let onTriggerCalledWith;
    this.set('onTrigger', (ev) => {
      onTriggerCalledWith = ev;
    });
    await render(hbs`{{on-key 'shift+c' onTrigger}}`);
    await keyDown('shift+c');
    assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
  });

  module('stopping propagation', function(hooks) {
    let triggered;
    hooks.beforeEach(function() {
      const keyboardService = this.owner.lookup('service:keyboard');
      keyboardService.set('isPropagationEnabled', true);
      triggered = [];
      this.set('trigger', (letter, stop, stopImmediate, event, ekEvent) => {
        triggered.push(letter);
        if (stop) {
          ekEvent.stopPropagation();
        }
        if (stopImmediate) {
          ekEvent.stopImmediatePropagation();
        }
      });
     });
     test('stopPropagation+stopImmediatePropagation', async function(assert) {
      await render(hbs`
        {{on-key 'alt+a' (fn trigger 'A2a' true true) priority=2}}
        {{on-key 'alt+a' (fn trigger 'A2b' true true) priority=2}}
        {{on-key 'alt+a' (fn trigger 'A1' true true) priority=1}}
      `);
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
      assert.deepEqual(triggered, ['A2a']);
    });
    test('stopPropagation', async function(assert) {
      await render(hbs`
        {{on-key 'alt+a' (fn trigger 'A2a' true false) priority=2}}
        {{on-key 'alt+a' (fn trigger 'A2b' true false) priority=2}}
        {{on-key 'alt+a' (fn trigger 'A1' true false) priority=1}}
      `);
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
      assert.deepEqual(triggered, ['A2a', 'A2b']);
    });
    test('stopImmediatePropagation', async function(assert) {
      await render(hbs`
        {{on-key 'alt+a' (fn trigger 'A2a' false true) priority=2}}
        {{on-key 'alt+a' (fn trigger 'A2b' false true) priority=2}}
        {{on-key 'alt+a' (fn trigger 'A1' false true) priority=1}}
      `);
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
      assert.deepEqual(triggered, ['A2a', 'A1']);
    });
    test('no stopping', async function(assert) {
      await render(hbs`
        {{on-key 'alt+a' (fn trigger 'A2a' false false) priority=2}}
        {{on-key 'alt+a' (fn trigger 'A2b' false false) priority=2}}
        {{on-key 'alt+a' (fn trigger 'A1' false false) priority=1}}
      `);
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
      assert.deepEqual(triggered, ['A2a', 'A2b', 'A1']);
    });
  });

  module('unspecified event param', function(hooks) {
    hooks.beforeEach(async function() {
      await render(hbs`{{on-key 'shift+c' onTrigger}}`);
    });
    test('triggers on keydown by default (affirmative)', async function(assert) {
      await keyDown('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });

    test('does not trigger on keyup or keypress', async function(assert) {
      await keyUp('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');

      await keyPress('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');
    });
  });

  module('with event="keydown"', function(hooks) {
    hooks.beforeEach(async function() {
      await render(hbs`{{on-key 'shift+c' onTrigger event='keydown'}}`);
    });
    test('triggers on keydown', async function(assert) {
      await keyDown('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });

    test('does not trigger on keyup or keypress', async function(assert) {
      await keyUp('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');

      await keyPress('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');
    });
  });

  module('with event="keyup"', function(hooks) {
    hooks.beforeEach(async function() {
      await render(hbs`{{on-key 'shift+c' onTrigger event='keyup'}}`);
    });
    test('triggers on keyup', async function(assert) {
      await keyUp('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });

    test('does not trigger on keydown or keypress', async function(assert) {
      await keyDown('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');

      await keyPress('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');
    });
  });

  module('with event="keypress"', function(hooks) {
    hooks.beforeEach(async function() {
      await render(hbs`{{on-key 'shift+c' onTrigger event='keypress'}}`);
    });
    test('triggers on keypress', async function(assert) {
      await keyPress('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });

    test('does not trigger on keydown or keyup', async function(assert) {
      await keyDown('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');

      await keyUp('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');
    });
  });

  module('activated param', function() {
    hooks.beforeEach(function() {
      this.set('isActivated', false);
      this.renderWithActivated = () => {
        return render(hbs`{{on-key 'shift+c' onTrigger activated=isActivated}}`);
      }
    });
    test('does not trigger if helper is not activated', async function(assert) {
      await this.renderWithActivated();
      await keyDown('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');
    });
    test('triggers if helper is activated', async function(assert) {
      await this.renderWithActivated();
      this.set('isActivated', true);
      await keyDown('shift+c');
      assert.ok(onTriggerCalled, 'triggers action');
    });
    test('does not trigger if helper is no longer activated', async function(assert) {
      this.set('shouldRenderOnKeyHelper', true);
      await this.renderWithActivated();
      await this.set('isActivated', false);
      await keyDown('shift+c');
      assert.ok(!onTriggerCalled, 'does not trigger action');
    });
  });

  module('error cases', function(hooks) {
    hooks.afterEach(() => resetOnerror());

    // This doesn't work. I wish it did, but can't figure out why not.
    test('errors if invoked without a handler', async function(assert) {
      assert.expect(1);
      setupOnerror(function(error) {
        assert.strictEqual(
          error.message,
          "Assertion Failed: ember-keyboard: You must pass a function as the second argument to the `on-key` helper",
          'error is thrown'
        );
      });  
      await render(hbs`{{on-key "alt+a" doesNotExist}}`);
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'c' });
    });  
  });
});
