/* eslint-disable no-unused-vars */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { keyDown, keyUp } from 'ember-keyboard/test-support/test-helpers';
import { gte } from 'ember-compatibility-helpers';

module('Integration | decorators', function(hooks) {
  setupRenderingTest(hooks);

  let onTriggerCalled;
  hooks.beforeEach(function() {
    onTriggerCalled = false;
    this.set('onTrigger', function() {
      onTriggerCalled = true;
    });
  });

  module('decorators with an ES6 class', function(hooks) {
    module('lifecycle', function(hooks) {
      hooks.beforeEach(function() {
        this.set('shouldRenderOnKeyHelper', false);
        this.renderWithConditional = () => {
          return render(hbs`
            {{#if this.shouldRenderOnKeyHelper}}
              <DecoratorExample1 @onTrigger={{this.onTrigger}} />
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
        this.set('shouldRenderOnKeyHelper', false);
        await keyDown('shift+c');
        assert.ok(!onTriggerCalled, 'does not trigger action');
      });
    });
    test('with an event specified', async function(assert) {
      let onTriggerCalledWith;
      this.set('onTrigger', (ev) => {
        onTriggerCalledWith = ev;
      });
      await render(hbs`<DecoratorExample1 @onTrigger={{this.onTrigger}} />`);

      await keyUp('shift+c');
      assert.ok(!onTriggerCalledWith, 'not called in keyup if event is not specified');

      await keyDown('ctrl+alt+KeyE');
      assert.ok(!onTriggerCalledWith, 'not called in keydown if keyup is specified');

      await keyUp('ctrl+alt+KeyE');
      assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
    });
    test('with multiple onKeys on one method', async function(assert) {
      let onTriggerCalledWith;
      this.set('onTrigger', (ev) => {
        onTriggerCalledWith = ev;
      });
      await render(hbs`<DecoratorExample1 @onTrigger={{this.onTrigger}} />`);

      await keyDown('alt+ArrowLeft');
      assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
      onTriggerCalledWith = null;

      await keyDown('alt+ArrowRight');
      assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
    });
    module('stopping propagation', function(hooks) {
      let triggered;
      hooks.beforeEach(function() {
        const keyboardService = this.owner.lookup('service:keyboard');
        keyboardService.set('isPropagationEnabled', true);
        triggered = [];
        this.set('trigger', (letter, stop, stopImmediate, _event, ekEvent) => {
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
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A2a' true true}} @priority={{2}} />
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A2b' true true}} @priority={{2}} />
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A1' true true}} @priority={{1}} />
        `);
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a']);
      });

      test('stopPropagation', async function(assert) {
        await render(hbs`
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A2a' true false}} @priority={{2}} />
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A2b' true false}} @priority={{2}} />
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A1' true false}} @priority={{1}} />
        `);
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A2b']);
      });

      test('stopImmediatePropagation', async function(assert) {
        await render(hbs`
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A2a' false true}} @priority={{2}} />
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A2b' false true}} @priority={{2}} />
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A1' false true}} @priority={{1}} />
        `);
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A1']);
      });

      test('no stopping', async function(assert) {
        await render(hbs`
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A2a' false false}} @priority={{2}} />
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A2b' false false}} @priority={{2}} />
        <DecoratorExample2 @onTrigger={{fn this.trigger 'A1' false false}} @priority={{1}} />
        `);
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A2b', 'A1']);
      });
    });
    module('activated param', function() {
      hooks.beforeEach(function() {
        this.set('isActivated', false);
        this.renderWithActivated = () => {
          return render(hbs`<DecoratorExample2 @onTrigger={{this.onTrigger}} @activated={{this.isActivated}} />`);
        }
      });
      test('does not trigger if helper is not activated', async function(assert) {
        await this.renderWithActivated();
        await keyDown('Digit2');
        assert.ok(!onTriggerCalled, 'does not trigger action');
      });
      test('triggers if helper is activated', async function(assert) {
        await this.renderWithActivated();
        this.set('isActivated', true);
        await keyDown('Digit2');
        assert.ok(onTriggerCalled, 'triggers action');
      });
      test('does not trigger if helper is no longer activated', async function(assert) {
        this.set('shouldRenderOnKeyHelper', true);
        await this.renderWithActivated();
        this.set('isActivated', false);
        await keyDown('Digit2');
        assert.ok(!onTriggerCalled, 'does not trigger action');
      });
    });
  });

  if (gte('3.10.0')) {
    module('decorators with a classic component', function() {
      module('lifecycle', function(hooks) {
        hooks.beforeEach(function() {
          this.set('shouldRenderOnKeyHelper', false);
          this.renderWithConditional = () => {
            return render(hbs`
              {{#if this.shouldRenderOnKeyHelper}}
                <DecoratorExample3 @onTrigger={{this.onTrigger}} />
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
          this.set('shouldRenderOnKeyHelper', false);
          await keyDown('shift+c');
          assert.ok(!onTriggerCalled, 'does not trigger action');
        });
      });
      test('with an event specified', async function(assert) {
        let onTriggerCalledWith;
        this.set('onTrigger', (ev) => {
          onTriggerCalledWith = ev;
        });
        await render(hbs`<DecoratorExample3 @onTrigger={{this.onTrigger}} />`);

        await keyUp('shift+c');
        assert.ok(!onTriggerCalledWith, 'not called in keyup if event is not specified');

        await keyDown('ctrl+alt+KeyE');
        assert.ok(!onTriggerCalledWith, 'not called in keydown if keyup is specified');

        await keyUp('ctrl+alt+KeyE');
        assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
      });
      test('with multiple onKeys on one method', async function(assert) {
        let onTriggerCalledWith;
        this.set('onTrigger', (ev) => {
          onTriggerCalledWith = ev;
        });
        await render(hbs`<DecoratorExample3 @onTrigger={{this.onTrigger}} />`);

        await keyDown('alt+ArrowLeft');
        assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
        onTriggerCalledWith = null;

        await keyDown('alt+ArrowRight');
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
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A2a' true true}} @priority={{2}} />
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A2b' true true}} @priority={{2}} />
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A1' true true}} @priority={{1}} />
          `);
          await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
          assert.deepEqual(triggered, ['A2a']);
        });

        test('stopPropagation', async function(assert) {
          await render(hbs`
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A2a' true false}} @priority={{2}} />
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A2b' true false}} @priority={{2}} />
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A1' true false}} @priority={{1}} />
          `);
          await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
          assert.deepEqual(triggered, ['A2a', 'A2b']);
        });

        test('stopImmediatePropagation', async function(assert) {
          await render(hbs`
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A2a' false true}} @priority={{2}} />
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A2b' false true}} @priority={{2}} />
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A1' false true}} @priority={{1}} />
          `);
          await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
          assert.deepEqual(triggered, ['A2a', 'A1']);
        });

        test('no stopping', async function(assert) {
          await render(hbs`
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A2a' false false}} @priority={{2}} />
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A2b' false false}} @priority={{2}} />
          <DecoratorExample4 @onTrigger={{fn this.trigger 'A1' false false}} @priority={{1}} />
          `);
          await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
          assert.deepEqual(triggered, ['A2a', 'A2b', 'A1']);
        });
      });
      module('activated param', function(hooks) {
        hooks.beforeEach(function() {
          this.set('isActivated', false);
          this.renderWithActivated = () => {
            return render(hbs`<DecoratorExample4 @onTrigger={{this.onTrigger}} @activated={{this.isActivated}} />`);
          }
        });
        test('does not trigger if helper is not activated', async function(assert) {
          await this.renderWithActivated();
          await keyDown('Digit2');
          assert.ok(!onTriggerCalled, 'does not trigger action');
        });
        test('triggers if helper is activated', async function(assert) {
          await this.renderWithActivated();
          this.set('isActivated', true);
          await keyDown('Digit2');
          assert.ok(onTriggerCalled, 'triggers action');
        });
        test('does not trigger if helper is no longer activated', async function(assert) {
          this.set('shouldRenderOnKeyHelper', true);
          await this.renderWithActivated();
          this.set('isActivated', false);
          await keyDown('Digit2');
          assert.ok(!onTriggerCalled, 'does not trigger action');
        });
      });
    });
  }
});
