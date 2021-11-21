import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { focus, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { keyDown, keyPress, keyUp } from 'ember-keyboard/test-support/test-helpers';

module('Integration | Modifier | on-key', function(hooks) {
  setupRenderingTest(hooks);

  let onTriggerCalled;
  hooks.beforeEach(function() {
    onTriggerCalled = false;
    this.set('onTrigger', () => {
      onTriggerCalled = true;
    });
  });

  module('when used with an input element', function(/* hooks */) {
    module('unspecified event param', function(hooks) {
      hooks.beforeEach(async function() {
        await render(hbs`<input type="text" {{on-key 'shift+c' this.onTrigger}}>`);
      });
      module('when element has focus', function(hooks) {
        hooks.beforeEach(async function() {
          await focus('input[type="text"]');
        });
        test('triggers on keydown by default', async function(assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keyup or keypress', async function(assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
        test('called with event', async function(assert) {
          let onTriggerCalledWith;
          this.set('onTrigger', (ev) => {
            onTriggerCalledWith = ev;
          });
          await keyDown('shift+c');
          assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
        });
      });
      module('when element does not have focus', function(/* hooks */) {
        test('does not trigger on keydown, keyup, or keypress', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
    });
    module('with event="keydown"', function(hooks) {
      hooks.beforeEach(async function() {
        await render(hbs`<input type="text" {{on-key 'shift+c' this.onTrigger event='keydown'}}>`);
      });
      module('when element has focus', function(hooks) {
        hooks.beforeEach(async function() {
          await focus('input[type="text"]');
        });
        test('triggers on keydown', async function(assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keyup or keypress', async function(assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
      module('when element does not have focus', function() {
        test('does not trigger on keydown, keyup, or keypress', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
    });
    module('with event="keyup"', function(hooks) {
      hooks.beforeEach(async function() {
        await render(hbs`<input type="text" {{on-key 'shift+c' this.onTrigger event='keyup'}}>`);
      });
      module('when element has focus', function(hooks) {
        hooks.beforeEach(async function() {
          await focus('input[type="text"]');
        });
        test('triggers on keyup', async function(assert) {
          await keyUp('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keydown or keypress', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
      module('when element does not have focus', function(/* hooks */) {
        test('does not trigger on keydown, keyup, or keypress', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
    });
    module('with event="keypress"', function(hooks) {
      hooks.beforeEach(async function() {
        await render(hbs`<input type="text" {{on-key 'shift+c' this.onTrigger event='keypress'}}>`);
      });
      module('when element has focus', function(hooks) {
        hooks.beforeEach(async function() {
          await focus('input[type="text"]');
        });
        test('triggers on keypress', async function(assert) {
          await keyPress('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keydown or keyup', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
      module('when element does not have focus', function(/* hooks */) {
        test('does not trigger on keydown, keyup, or keypress', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
    });
    module('activated param', function(hooks) {
      hooks.beforeEach(function() {
        this.set('isActivated', false);
        this.renderWithActivated = () => {
          return render(hbs`<input type="text" {{on-key 'shift+c' this.onTrigger activated=this.isActivated}}>`);
        }
      });
      module('with activated=false', function(hooks) {
        hooks.beforeEach(function() {
          this.set('isActivated', false);
          return this.renderWithActivated();
        });
        module('when element has focus', function(hooks) {
          hooks.beforeEach(async function() {
            await focus('input[type="text"]');
          });
          test('does not trigger on keydown, keyup or keypress', async function(assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
        });
        module('when element does not have focus', function(hooks) {
          hooks.beforeEach(async function() {
            await focus('input[type="text"]');
          });
          test('does not trigger on keydown, keyup or keypress', async function(assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
        });
      });
      module('with activated=true', function(hooks) {
        hooks.beforeEach(function() {
          this.set('isActivated', true);
          return this.renderWithActivated();
        });
        module('when element has focus', function(hooks) {
          hooks.beforeEach(async function() {
            await focus('input[type="text"]');
          });
          test('triggers on keydown by default', async function(assert) {
            await keyDown('shift+c');
            assert.ok(onTriggerCalled, 'triggers action');
          });

          test('does not trigger on keyup or keypress', async function(assert) {
            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
        });
        module('when element does not have focus', function(/* hooks */) {
          test('does not trigger on keydown, keyup or keypress', async function(assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
        });
      });
    });
  });

  module('when used with a textarea element', function(hooks) {
    // Behavior is the same as with input element. That scenario has thorough
    // tests above. This is a basic smoketest.
    hooks.beforeEach(async function() {
      await render(hbs`<textarea {{on-key 'shift+c' this.onTrigger}}></textarea>`);
    });
    module('when element has focus', function(hooks) {
      hooks.beforeEach(async function() {
        await focus('textarea');
      });
      test('triggers on keydown by default', async function(assert) {
        await keyDown('shift+c');
        assert.ok(onTriggerCalled, 'triggers action');
      });

      test('does not trigger on keyup or keypress', async function(assert) {
        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
    module('when element does not have focus', function(/* hooks */) {
      test('does not trigger on keydown, keyup, or keypress', async function(assert) {
        await keyDown('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
  });

  module('when used with a select element', function(hooks) {
    // Behavior is the same as with input element. That scenario has thorough
    // tests above. This is a basic smoketest.
    hooks.beforeEach(async function() {
      await render(hbs`<select {{on-key 'shift+c' this.onTrigger}}></select>`);
    });
    module('when element has focus', function(hooks) {
      hooks.beforeEach(async function() {
        await focus('select');
      });
      test('triggers on keydown by default', async function(assert) {
        await keyDown('shift+c');
        assert.ok(onTriggerCalled, 'triggers action');
      });

      test('does not trigger on keyup or keypress', async function(assert) {
        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
    module('when element does not have focus', function(/* hooks */) {
      test('does not trigger on keydown, keyup, or keypress', async function(assert) {
        await keyDown('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
  });

  module('when used with a button element', function(/* hooks */) {
    module('with no action specified', function(/* hooks */) {
      module('unspecified event param', function(hooks) {
        hooks.beforeEach(async function() {
          await render(hbs`<button type="button" {{on 'click' this.onTrigger}} {{on-key 'shift+c'}}></button>`);
        });
        test('triggers click on element on keydown by default', async function(assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keyup or keypress', async function(assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });

        test('called without keyboard event', async function(assert) {
          let onTriggerCalledWith;
          this.set('onTrigger', (ev) => {
            onTriggerCalledWith = ev;
          });
          await keyDown('shift+c');
          assert.ok(onTriggerCalledWith instanceof MouseEvent);
        });
      });
      module('with event="keydown"', function(hooks) {
        hooks.beforeEach(async function() {
          await render(hbs`<button type="button" {{on 'click' this.onTrigger}} {{on-key 'shift+c' event='keydown'}}></button>`);
        });
        test('triggers click on keydown', async function(assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger a click on keyup or keypress', async function(assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
      module('with event="keyup"', function(hooks) {
        hooks.beforeEach(async function() {
          await render(hbs`<button type="button" {{on 'click' this.onTrigger}} {{on-key 'shift+c' event='keyup'}}></button>`);
        });
        test('triggers click on element on keyup', async function(assert) {
          await keyUp('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keydown or keypress', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
      module('with event="keypress"', function(hooks) {
        hooks.beforeEach(async function() {
          await render(hbs`<button type="button" {{on 'click' this.onTrigger}} {{on-key 'shift+c' event='keypress'}}></button>`);
        });
        test('triggers click on element on keypress', async function(assert) {
          await keyPress('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keydown or keyup', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
      module('activated param', function(hooks) {
        hooks.beforeEach(function() {
          this.set('isActivated', false);
          this.renderWithActivated = () => {
            return render(hbs`<button type="button" {{on 'click' this.onTrigger}} {{on-key 'shift+c' activated=this.isActivated}}></button>`);
          }
        });
        module('with activated=false', function(hooks) {
          hooks.beforeEach(function() {
            this.set('isActivated', false);
            return this.renderWithActivated();
          });
          test('does not trigger on keydown, keyup or keypress', async function(assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
          test('after set activated back to true, triggers', async function(assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            this.set('isActivated', true);

            await keyDown('shift+c');
            assert.ok(onTriggerCalled, 'triggers action');
          });
        });
        module('with activated=true', function(hooks) {
          hooks.beforeEach(function() {
            this.set('isActivated', true);
            return this.renderWithActivated();
          });
          test('triggers element click on keydown by default', async function(assert) {
            await keyDown('shift+c');
            assert.ok(onTriggerCalled, 'triggers action');
          });

          test('does not trigger on keyup or keypress', async function(assert) {
            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
        });
      });
    });
    module('with an action specified', function(hooks) {
      let onTriggerClickCalled;
      hooks.beforeEach(function() {
        onTriggerClickCalled = false;
        this.set('onTriggerClick', () => {
          onTriggerClickCalled = true;
        });
      });
      module('unspecified event param', function(hooks) {
        hooks.beforeEach(async function() {
          await render(hbs`<button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'shift+c' this.onTrigger}}></button>`);
        });
        test('triggers action on keydown by default', async function(assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
        test('does not trigger on keyup or keypress', async function(assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
      });
      module('with event="keydown"', function(hooks) {
        hooks.beforeEach(async function() {
          await render(hbs`<button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'shift+c' this.onTrigger event='keydown'}}></button>`);
        });
        test('triggers action on keydown', async function(assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
        test('does not trigger a click on keyup or keypress', async function(assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
      });
      module('with event="keyup"', function(hooks) {
        hooks.beforeEach(async function() {
          await render(hbs`<button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'shift+c' this.onTrigger event='keyup'}}></button>`);
        });
        test('triggers action on keyup', async function(assert) {
          await keyUp('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
        test('does not trigger on keydown or keypress', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
      });
      module('with event="keypress"', function(hooks) {
        hooks.beforeEach(async function() {
          await render(hbs`<button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'shift+c' this.onTrigger event='keypress'}}></button>`);
        });
        test('triggers action on keypress', async function(assert) {
          await keyPress('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
        test('does not trigger on keydown or keyup', async function(assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
      });
      module('activated param', function(hooks) {
        hooks.beforeEach(function() {
          this.set('isActivated', false);
          this.renderWithActivated = () => {
            return render(hbs`<button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'shift+c' this.onTrigger activated=this.isActivated}}></button>`);
          }
        });
        module('with activated=false', function(hooks) {
          hooks.beforeEach(function() {
            this.set('isActivated', false);
            return this.renderWithActivated();
          });
          test('does not trigger on keydown, keyup or keypress', async function(assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');

            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');
          });
          test('after set activated back to true, triggers', async function(assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');

            this.set('isActivated', true);

            await keyDown('shift+c');
            assert.ok(onTriggerCalled, 'triggers action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');
          });
        });
        module('with activated=true', function(hooks) {
          hooks.beforeEach(function() {
            this.set('isActivated', true);
            return this.renderWithActivated();
          });
          test('triggers on keydown by default', async function(assert) {
            await keyDown('shift+c');
            assert.ok(onTriggerCalled, 'triggers action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');
          });
          test('does not trigger on keyup or keypress', async function(assert) {
            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');
          });
        });
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
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A2a' true true) priority=2}}></button>
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A2b' true true) priority=2}}></button>
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A1' true true) priority=1}}></button>
          `);
          await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
          assert.deepEqual(triggered, ['A2a']);
        });
        test('stopPropagation', async function(assert) {
          await render(hbs`
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A2a' true false) priority=2}}></button>
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A2b' true false) priority=2}}></button>
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A1' true false) priority=1}}></button>
          `);
          await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
          assert.deepEqual(triggered, ['A2a', 'A2b']);
        });
        test('stopImmediatePropagation', async function(assert) {
          await render(hbs`
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A2a' false true) priority=2}}></button>
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A2b' false true) priority=2}}></button>
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A1' false true) priority=1}}></button>
          `);
          await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
          assert.deepEqual(triggered, ['A2a', 'A1']);
        });
        test('no stopping', async function(assert) {
          await render(hbs`
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A2a' false false) priority=2}}></button>
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A2b' false false) priority=2}}></button>
            <button type="button" {{on 'click' this.onTriggerClick}} {{on-key 'alt+a' (fn this.trigger 'A1' false false) priority=1}}></button>
          `);
          await triggerEvent(document.body, 'keydown', { altKey: true, key: 'a' });
          assert.deepEqual(triggered, ['A2a', 'A2b', 'A1']);
        });
      });
    });
  });

  module('when used with an `a` element', function() {
    // Behavior is the same as with button element. That scenario has thorough
    // tests above. This is a basic smoketest.
    module('with no action specified', function(hooks) {
      hooks.beforeEach(async function() {
        await render(hbs`<a href="#" {{on 'click' this.onTrigger}} {{on-key 'shift+c'}}>Hello</a>`);
      });
      test('triggers click on element on keydown by default', async function(assert) {
        await keyDown('shift+c');
        assert.ok(onTriggerCalled, 'triggers action');
      });

      test('does not trigger on keyup or keypress', async function(assert) {
        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
    module('with an action specified', function(hooks) {
      let onTriggerClickCalled;
      hooks.beforeEach(function() {
        onTriggerClickCalled = false;
        this.set('onTriggerClick', () => {
          onTriggerClickCalled = true;
        });
      });
      hooks.beforeEach(async function() {
        await render(hbs`<a href="#" {{on 'click' this.onTriggerClick}} {{on-key 'shift+c' this.onTrigger}}>Hello</a>`);
      });
      test('triggers action on keydown by default', async function(assert) {
        await keyDown('shift+c');
        assert.ok(onTriggerCalled, 'triggers action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');
      });
      test('does not trigger on keyup or keypress', async function(assert) {
        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');
      });
    });
  });

  module('when used with a `div` element', function() {
    // Behavior is the same as with button element. That scenario has thorough
    // tests above. This is a basic smoketest.
    module('with no action specified', function(hooks) {
      hooks.beforeEach(async function() {
        await render(hbs`<div {{on 'click' this.onTrigger}} {{on-key 'shift+c'}}></div>`);
      });
      test('triggers click on element on keydown by default', async function(assert) {
        await keyDown('shift+c');
        assert.ok(onTriggerCalled, 'triggers action');
      });

      test('does not trigger on keyup or keypress', async function(assert) {
        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
    module('with an action specified', function(hooks) {
      let onTriggerClickCalled;
      hooks.beforeEach(function() {
        onTriggerClickCalled = false;
        this.set('onTriggerClick', () => {
          onTriggerClickCalled = true;
        });
      });
      hooks.beforeEach(async function() {
        await render(hbs`<div {{on 'click' this.onTriggerClick}} {{on-key 'shift+c' this.onTrigger}}></div>`);
        await render(hbs`<a href="#" {{on 'click' this.onTriggerClick}} {{on-key 'shift+c' this.onTrigger}}>Hello</a>`);
      });
      test('triggers action on keydown by default', async function(assert) {
        await keyDown('shift+c');
        assert.ok(onTriggerCalled, 'triggers action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');
      });
      test('does not trigger on keyup or keypress', async function(assert) {
        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');
      });
    });
  });
});
