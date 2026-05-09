/* eslint-disable no-unused-vars */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { fn } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { keyDown, keyUp } from '#src/test-support/test-helpers.js';
import DecoratorExample1 from '../../../demo-app/components/decorator-example1.gjs';
import DecoratorExample2 from '../../../demo-app/components/decorator-example2.gjs';
import DecoratorExample3 from '../../../demo-app/components/decorator-example3.js';
import DecoratorExample4 from '../../../demo-app/components/decorator-example4.js';

class TestState {
  @tracked shouldRenderOnKeyHelper = false;
  @tracked isActivated = false;
}

module('Integration | decorators', function (hooks) {
  setupRenderingTest(hooks);

  let onTriggerCalled;
  let onTriggerImpl;
  const onTrigger = (...args) => onTriggerImpl(...args);
  const state = new TestState();

  hooks.beforeEach(function () {
    onTriggerCalled = false;
    onTriggerImpl = function () {
      onTriggerCalled = true;
    };
    state.shouldRenderOnKeyHelper = false;
    state.isActivated = false;
  });

  module('decorators with an ES6 class', function (hooks) {
    module('lifecycle', function (hooks) {
      let renderWithConditional;
      hooks.beforeEach(function () {
        state.shouldRenderOnKeyHelper = false;
        renderWithConditional = () => {
          return render(
            <template>
              {{#if state.shouldRenderOnKeyHelper}}
                <DecoratorExample1 @onTrigger={{onTrigger}} />
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
    test('with an event specified', async function (assert) {
      let onTriggerCalledWith;
      onTriggerImpl = (ev) => {
        onTriggerCalledWith = ev;
      };
      await render(
        <template><DecoratorExample1 @onTrigger={{onTrigger}} /></template>,
      );

      await keyUp('shift+c');
      assert.notOk(
        onTriggerCalledWith,
        'not called in keyup if event is not specified',
      );

      await keyDown('ctrl+alt+KeyE');
      assert.notOk(
        onTriggerCalledWith,
        'not called in keydown if keyup is specified',
      );

      await keyUp('ctrl+alt+KeyE');
      assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
    });
    test('with multiple onKeys on one method', async function (assert) {
      let onTriggerCalledWith;
      onTriggerImpl = (ev) => {
        onTriggerCalledWith = ev;
      };
      await render(
        <template><DecoratorExample1 @onTrigger={{onTrigger}} /></template>,
      );

      await keyDown('alt+ArrowLeft');
      assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
      onTriggerCalledWith = null;

      await keyDown('alt+ArrowRight');
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
        triggerImpl = (letter, stop, stopImmediate, _event, ekEvent) => {
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
            <DecoratorExample2
              @onTrigger={{fn trigger "A2a" true true}}
              @priority={{2}}
            />
            <DecoratorExample2
              @onTrigger={{fn trigger "A2b" true true}}
              @priority={{2}}
            />
            <DecoratorExample2
              @onTrigger={{fn trigger "A1" true true}}
              @priority={{1}}
            />
          </template>,
        );
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a']);
      });

      test('stopPropagation', async function (assert) {
        await render(
          <template>
            <DecoratorExample2
              @onTrigger={{fn trigger "A2a" true false}}
              @priority={{2}}
            />
            <DecoratorExample2
              @onTrigger={{fn trigger "A2b" true false}}
              @priority={{2}}
            />
            <DecoratorExample2
              @onTrigger={{fn trigger "A1" true false}}
              @priority={{1}}
            />
          </template>,
        );
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A2b']);
      });

      test('stopImmediatePropagation', async function (assert) {
        await render(
          <template>
            <DecoratorExample2
              @onTrigger={{fn trigger "A2a" false true}}
              @priority={{2}}
            />
            <DecoratorExample2
              @onTrigger={{fn trigger "A2b" false true}}
              @priority={{2}}
            />
            <DecoratorExample2
              @onTrigger={{fn trigger "A1" false true}}
              @priority={{1}}
            />
          </template>,
        );
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A1']);
      });

      test('no stopping', async function (assert) {
        await render(
          <template>
            <DecoratorExample2
              @onTrigger={{fn trigger "A2a" false false}}
              @priority={{2}}
            />
            <DecoratorExample2
              @onTrigger={{fn trigger "A2b" false false}}
              @priority={{2}}
            />
            <DecoratorExample2
              @onTrigger={{fn trigger "A1" false false}}
              @priority={{1}}
            />
          </template>,
        );
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A2b', 'A1']);
      });
    });
    module('activated param', function (hooks) {
      let renderWithActivated;
      hooks.beforeEach(function () {
        state.isActivated = false;
        renderWithActivated = () => {
          return render(
            <template>
              <DecoratorExample2
                @onTrigger={{onTrigger}}
                @activated={{state.isActivated}}
              />
            </template>,
          );
        };
      });
      test('does not trigger if helper is not activated', async function (assert) {
        await renderWithActivated();
        await keyDown('Digit2');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
      test('triggers if helper is activated', async function (assert) {
        await renderWithActivated();
        state.isActivated = true;
        await keyDown('Digit2');
        assert.ok(onTriggerCalled, 'triggers action');
      });
      test('does not trigger if helper is no longer activated', async function (assert) {
        state.shouldRenderOnKeyHelper = true;
        await renderWithActivated();
        state.isActivated = false;
        await keyDown('Digit2');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
  });

  module('decorators with a classic component', function () {
    module('lifecycle', function (hooks) {
      let renderWithConditional;
      hooks.beforeEach(function () {
        state.shouldRenderOnKeyHelper = false;
        renderWithConditional = () => {
          return render(
            <template>
              {{#if state.shouldRenderOnKeyHelper}}
                <DecoratorExample3 @onTrigger={{onTrigger}} />
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
    test('with an event specified', async function (assert) {
      let onTriggerCalledWith;
      onTriggerImpl = (ev) => {
        onTriggerCalledWith = ev;
      };
      await render(
        <template><DecoratorExample3 @onTrigger={{onTrigger}} /></template>,
      );

      await keyUp('shift+c');
      assert.notOk(
        onTriggerCalledWith,
        'not called in keyup if event is not specified',
      );

      await keyDown('ctrl+alt+KeyE');
      assert.notOk(
        onTriggerCalledWith,
        'not called in keydown if keyup is specified',
      );

      await keyUp('ctrl+alt+KeyE');
      assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
    });
    test('with multiple onKeys on one method', async function (assert) {
      let onTriggerCalledWith;
      onTriggerImpl = (ev) => {
        onTriggerCalledWith = ev;
      };
      await render(
        <template><DecoratorExample3 @onTrigger={{onTrigger}} /></template>,
      );

      await keyDown('alt+ArrowLeft');
      assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
      onTriggerCalledWith = null;

      await keyDown('alt+ArrowRight');
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
            <DecoratorExample4
              @onTrigger={{fn trigger "A2a" true true}}
              @priority={{2}}
            />
            <DecoratorExample4
              @onTrigger={{fn trigger "A2b" true true}}
              @priority={{2}}
            />
            <DecoratorExample4
              @onTrigger={{fn trigger "A1" true true}}
              @priority={{1}}
            />
          </template>,
        );
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a']);
      });

      test('stopPropagation', async function (assert) {
        await render(
          <template>
            <DecoratorExample4
              @onTrigger={{fn trigger "A2a" true false}}
              @priority={{2}}
            />
            <DecoratorExample4
              @onTrigger={{fn trigger "A2b" true false}}
              @priority={{2}}
            />
            <DecoratorExample4
              @onTrigger={{fn trigger "A1" true false}}
              @priority={{1}}
            />
          </template>,
        );
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A2b']);
      });

      test('stopImmediatePropagation', async function (assert) {
        await render(
          <template>
            <DecoratorExample4
              @onTrigger={{fn trigger "A2a" false true}}
              @priority={{2}}
            />
            <DecoratorExample4
              @onTrigger={{fn trigger "A2b" false true}}
              @priority={{2}}
            />
            <DecoratorExample4
              @onTrigger={{fn trigger "A1" false true}}
              @priority={{1}}
            />
          </template>,
        );
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A1']);
      });

      test('no stopping', async function (assert) {
        await render(
          <template>
            <DecoratorExample4
              @onTrigger={{fn trigger "A2a" false false}}
              @priority={{2}}
            />
            <DecoratorExample4
              @onTrigger={{fn trigger "A2b" false false}}
              @priority={{2}}
            />
            <DecoratorExample4
              @onTrigger={{fn trigger "A1" false false}}
              @priority={{1}}
            />
          </template>,
        );
        await triggerEvent(document.body, 'keydown', { code: 'Digit2' });
        assert.deepEqual(triggered, ['A2a', 'A2b', 'A1']);
      });
    });
    module('activated param', function (hooks) {
      let renderWithActivated;
      hooks.beforeEach(function () {
        state.isActivated = false;
        renderWithActivated = () => {
          return render(
            <template>
              <DecoratorExample4
                @onTrigger={{onTrigger}}
                @activated={{state.isActivated}}
              />
            </template>,
          );
        };
      });
      test('does not trigger if helper is not activated', async function (assert) {
        await renderWithActivated();
        await keyDown('Digit2');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
      test('triggers if helper is activated', async function (assert) {
        await renderWithActivated();
        state.isActivated = true;
        await keyDown('Digit2');
        assert.ok(onTriggerCalled, 'triggers action');
      });
      test('does not trigger if helper is no longer activated', async function (assert) {
        state.shouldRenderOnKeyHelper = true;
        await renderWithActivated();
        state.isActivated = false;
        await keyDown('Digit2');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
  });
});
