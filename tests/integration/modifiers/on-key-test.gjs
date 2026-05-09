import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { focus, render, triggerEvent } from '@ember/test-helpers';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import onKeyModifier from '#src/modifiers/on-key.js';
import { keyDown, keyPress, keyUp } from '#src/test-support/test-helpers.js';

class TestState {
  @tracked isActivated = false;
}

module('Integration | Modifier | on-key', function (hooks) {
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
    state.isActivated = false;
  });

  module('when used with an input element', function (/* hooks */) {
    module('unspecified event param', function (hooks) {
      hooks.beforeEach(async function () {
        await render(
          <template>
            <input
              type="text"
              aria-label="test input"
              {{onKeyModifier "shift+c" onTrigger}}
            />
          </template>,
        );
      });
      module('when element has focus', function (hooks) {
        hooks.beforeEach(async function () {
          await focus('input[type="text"]');
        });
        test('triggers on keydown by default', async function (assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keyup or keypress', async function (assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
        test('called with event', async function (assert) {
          let onTriggerCalledWith;
          onTriggerImpl = (ev) => {
            onTriggerCalledWith = ev;
          };
          await keyDown('shift+c');
          assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
        });
      });
      module('when element does not have focus', function (/* hooks */) {
        test('does not trigger on keydown, keyup, or keypress', async function (assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
    });
    module('with event="keydown"', function (hooks) {
      hooks.beforeEach(async function () {
        await render(
          <template>
            <input
              type="text"
              aria-label="test input"
              {{onKeyModifier "shift+c" onTrigger event="keydown"}}
            />
          </template>,
        );
      });
      module('when element has focus', function (hooks) {
        hooks.beforeEach(async function () {
          await focus('input[type="text"]');
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
      module('when element does not have focus', function () {
        test('does not trigger on keydown, keyup, or keypress', async function (assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
    });
    module('with event="keyup"', function (hooks) {
      hooks.beforeEach(async function () {
        await render(
          <template>
            <input
              type="text"
              aria-label="test input"
              {{onKeyModifier "shift+c" onTrigger event="keyup"}}
            />
          </template>,
        );
      });
      module('when element has focus', function (hooks) {
        hooks.beforeEach(async function () {
          await focus('input[type="text"]');
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
      module('when element does not have focus', function (/* hooks */) {
        test('does not trigger on keydown, keyup, or keypress', async function (assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
    });
    module('with event="keypress"', function (hooks) {
      hooks.beforeEach(async function () {
        await render(
          <template>
            <input
              type="text"
              aria-label="test input"
              {{onKeyModifier "shift+c" onTrigger event="keypress"}}
            />
          </template>,
        );
      });
      module('when element has focus', function (hooks) {
        hooks.beforeEach(async function () {
          await focus('input[type="text"]');
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
      module('when element does not have focus', function (/* hooks */) {
        test('does not trigger on keydown, keyup, or keypress', async function (assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
    });
    module('activated param', function (hooks) {
      let renderWithActivated;
      hooks.beforeEach(function () {
        state.isActivated = false;
        renderWithActivated = () => {
          return render(
            <template>
              <input
                type="text"
                aria-label="test input"
                {{onKeyModifier
                  "shift+c"
                  onTrigger
                  activated=state.isActivated
                }}
              />
            </template>,
          );
        };
      });
      module('with activated=false', function (hooks) {
        hooks.beforeEach(function () {
          state.isActivated = false;
          return renderWithActivated();
        });
        module('when element has focus', function (hooks) {
          hooks.beforeEach(async function () {
            await focus('input[type="text"]');
          });
          test('does not trigger on keydown, keyup or keypress', async function (assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
        });
        module('when element does not have focus', function (hooks) {
          hooks.beforeEach(async function () {
            await focus('input[type="text"]');
          });
          test('does not trigger on keydown, keyup or keypress', async function (assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
        });
      });
      module('with activated=true', function (hooks) {
        hooks.beforeEach(function () {
          state.isActivated = true;
          return renderWithActivated();
        });
        module('when element has focus', function (hooks) {
          hooks.beforeEach(async function () {
            await focus('input[type="text"]');
          });
          test('triggers on keydown by default', async function (assert) {
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
        module('when element does not have focus', function (/* hooks */) {
          test('does not trigger on keydown, keyup or keypress', async function (assert) {
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

  module('when used with a textarea element', function (hooks) {
    // Behavior is the same as with input element. That scenario has thorough
    // tests above. This is a basic smoketest.
    hooks.beforeEach(async function () {
      await render(
        <template>
          <textarea
            aria-label="test textarea"
            {{onKeyModifier "shift+c" onTrigger}}
          ></textarea>
        </template>,
      );
    });
    module('when element has focus', function (hooks) {
      hooks.beforeEach(async function () {
        await focus('textarea');
      });
      test('triggers on keydown by default', async function (assert) {
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
    module('when element does not have focus', function (/* hooks */) {
      test('does not trigger on keydown, keyup, or keypress', async function (assert) {
        await keyDown('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
  });

  module('when used with a select element', function (hooks) {
    // Behavior is the same as with input element. That scenario has thorough
    // tests above. This is a basic smoketest.
    hooks.beforeEach(async function () {
      await render(
        <template>
          <select
            aria-label="test select"
            {{onKeyModifier "shift+c" onTrigger}}
          ></select>
        </template>,
      );
    });
    module('when element has focus', function (hooks) {
      hooks.beforeEach(async function () {
        await focus('select');
      });
      test('triggers on keydown by default', async function (assert) {
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
    module('when element does not have focus', function (/* hooks */) {
      test('does not trigger on keydown, keyup, or keypress', async function (assert) {
        await keyDown('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
      });
    });
  });

  module('when used with a button element', function (/* hooks */) {
    module('with no action specified', function (/* hooks */) {
      module('unspecified event param', function (hooks) {
        hooks.beforeEach(async function () {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTrigger}}
                {{onKeyModifier "shift+c"}}
              ></button>
            </template>,
          );
        });
        test('triggers click on element on keydown by default', async function (assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger on keyup or keypress', async function (assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });

        test('called without keyboard event', async function (assert) {
          let onTriggerCalledWith;
          onTriggerImpl = (ev) => {
            onTriggerCalledWith = ev;
          };
          await keyDown('shift+c');
          assert.ok(onTriggerCalledWith instanceof MouseEvent);
        });
      });
      module('with event="keydown"', function (hooks) {
        hooks.beforeEach(async function () {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTrigger}}
                {{onKeyModifier "shift+c" event="keydown"}}
              ></button>
            </template>,
          );
        });
        test('triggers click on keydown', async function (assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
        });

        test('does not trigger a click on keyup or keypress', async function (assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
        });
      });
      module('with event="keyup"', function (hooks) {
        hooks.beforeEach(async function () {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTrigger}}
                {{onKeyModifier "shift+c" event="keyup"}}
              ></button>
            </template>,
          );
        });
        test('triggers click on element on keyup', async function (assert) {
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
            <template>
              <button
                type="button"
                {{on "click" onTrigger}}
                {{onKeyModifier "shift+c" event="keypress"}}
              ></button>
            </template>,
          );
        });
        test('triggers click on element on keypress', async function (assert) {
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
                <button
                  type="button"
                  {{on "click" onTrigger}}
                  {{onKeyModifier "shift+c" activated=state.isActivated}}
                ></button>
              </template>,
            );
          };
        });
        module('with activated=false', function (hooks) {
          hooks.beforeEach(function () {
            state.isActivated = false;
            return renderWithActivated();
          });
          test('does not trigger on keydown, keyup or keypress', async function (assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
          });
          test('after set activated back to true, triggers', async function (assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');

            state.isActivated = true;

            await keyDown('shift+c');
            assert.ok(onTriggerCalled, 'triggers action');
          });
        });
        module('with activated=true', function (hooks) {
          hooks.beforeEach(function () {
            state.isActivated = true;
            return renderWithActivated();
          });
          test('triggers element click on keydown by default', async function (assert) {
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
      });
    });
    module('with an action specified', function (hooks) {
      let onTriggerClickCalled;
      let onTriggerClickImpl;
      const onTriggerClick = (...args) => onTriggerClickImpl(...args);
      hooks.beforeEach(function () {
        onTriggerClickCalled = false;
        onTriggerClickImpl = () => {
          onTriggerClickCalled = true;
        };
      });
      module('unspecified event param', function (hooks) {
        hooks.beforeEach(async function () {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier "shift+c" onTrigger}}
              ></button>
            </template>,
          );
        });
        test('triggers action on keydown by default', async function (assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
        test('does not trigger on keyup or keypress', async function (assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
      });
      module('with event="keydown"', function (hooks) {
        hooks.beforeEach(async function () {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier "shift+c" onTrigger event="keydown"}}
              ></button>
            </template>,
          );
        });
        test('triggers action on keydown', async function (assert) {
          await keyDown('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
        test('does not trigger a click on keyup or keypress', async function (assert) {
          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
      });
      module('with event="keyup"', function (hooks) {
        hooks.beforeEach(async function () {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier "shift+c" onTrigger event="keyup"}}
              ></button>
            </template>,
          );
        });
        test('triggers action on keyup', async function (assert) {
          await keyUp('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
        test('does not trigger on keydown or keypress', async function (assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');

          await keyPress('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
      });
      module('with event="keypress"', function (hooks) {
        hooks.beforeEach(async function () {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier "shift+c" onTrigger event="keypress"}}
              ></button>
            </template>,
          );
        });
        test('triggers action on keypress', async function (assert) {
          await keyPress('shift+c');
          assert.ok(onTriggerCalled, 'triggers action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
        test('does not trigger on keydown or keyup', async function (assert) {
          await keyDown('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');

          await keyUp('shift+c');
          assert.notOk(onTriggerCalled, 'does not trigger action');
          assert.notOk(onTriggerClickCalled, 'does not trigger click');
        });
      });
      module('activated param', function (hooks) {
        let renderWithActivated;
        hooks.beforeEach(function () {
          state.isActivated = false;
          renderWithActivated = () => {
            return render(
              <template>
                <button
                  type="button"
                  {{on "click" onTriggerClick}}
                  {{onKeyModifier
                    "shift+c"
                    onTrigger
                    activated=state.isActivated
                  }}
                ></button>
              </template>,
            );
          };
        });
        module('with activated=false', function (hooks) {
          hooks.beforeEach(function () {
            state.isActivated = false;
            return renderWithActivated();
          });
          test('does not trigger on keydown, keyup or keypress', async function (assert) {
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
          test('after set activated back to true, triggers', async function (assert) {
            await keyDown('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');

            state.isActivated = true;

            await keyDown('shift+c');
            assert.ok(onTriggerCalled, 'triggers action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');
          });
        });
        module('with activated=true', function (hooks) {
          hooks.beforeEach(function () {
            state.isActivated = true;
            return renderWithActivated();
          });
          test('triggers on keydown by default', async function (assert) {
            await keyDown('shift+c');
            assert.ok(onTriggerCalled, 'triggers action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');
          });
          test('does not trigger on keyup or keypress', async function (assert) {
            await keyUp('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');

            await keyPress('shift+c');
            assert.notOk(onTriggerCalled, 'does not trigger action');
            assert.notOk(onTriggerClickCalled, 'does not trigger click');
          });
        });
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
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A2a" true true)
                  priority=2
                }}
              ></button>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A2b" true true)
                  priority=2
                }}
              ></button>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier "alt+a" (fn trigger "A1" true true) priority=1}}
              ></button>
            </template>,
          );
          await triggerEvent(document.body, 'keydown', {
            altKey: true,
            key: 'a',
          });
          assert.deepEqual(triggered, ['A2a']);
        });
        test('stopPropagation', async function (assert) {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A2a" true false)
                  priority=2
                }}
              ></button>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A2b" true false)
                  priority=2
                }}
              ></button>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A1" true false)
                  priority=1
                }}
              ></button>
            </template>,
          );
          await triggerEvent(document.body, 'keydown', {
            altKey: true,
            key: 'a',
          });
          assert.deepEqual(triggered, ['A2a', 'A2b']);
        });
        test('stopImmediatePropagation', async function (assert) {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A2a" false true)
                  priority=2
                }}
              ></button>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A2b" false true)
                  priority=2
                }}
              ></button>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A1" false true)
                  priority=1
                }}
              ></button>
            </template>,
          );
          await triggerEvent(document.body, 'keydown', {
            altKey: true,
            key: 'a',
          });
          assert.deepEqual(triggered, ['A2a', 'A1']);
        });
        test('no stopping', async function (assert) {
          await render(
            <template>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A2a" false false)
                  priority=2
                }}
              ></button>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A2b" false false)
                  priority=2
                }}
              ></button>
              <button
                type="button"
                {{on "click" onTriggerClick}}
                {{onKeyModifier
                  "alt+a"
                  (fn trigger "A1" false false)
                  priority=1
                }}
              ></button>
            </template>,
          );
          await triggerEvent(document.body, 'keydown', {
            altKey: true,
            key: 'a',
          });
          assert.deepEqual(triggered, ['A2a', 'A2b', 'A1']);
        });
      });
    });
  });

  module('when used with an `a` element', function () {
    // Behavior is the same as with button element. That scenario has thorough
    // tests above. This is a basic smoketest.
    module('with no action specified', function (hooks) {
      hooks.beforeEach(async function () {
        await render(
          <template>
            <a
              href="#"
              {{on "click" onTrigger}}
              {{onKeyModifier "shift+c"}}
            >Hello</a>
          </template>,
        );
      });
      test('triggers click on element on keydown by default', async function (assert) {
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
    module('with an action specified', function (hooks) {
      let onTriggerClickCalled;
      let onTriggerClickImpl;
      const onTriggerClick = (...args) => onTriggerClickImpl(...args);
      hooks.beforeEach(function () {
        onTriggerClickCalled = false;
        onTriggerClickImpl = () => {
          onTriggerClickCalled = true;
        };
      });
      hooks.beforeEach(async function () {
        await render(
          <template>
            <a
              href="#"
              {{on "click" onTriggerClick}}
              {{onKeyModifier "shift+c" onTrigger}}
            >Hello</a>
          </template>,
        );
      });
      test('triggers action on keydown by default', async function (assert) {
        await keyDown('shift+c');
        assert.ok(onTriggerCalled, 'triggers action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');
      });
      test('does not trigger on keyup or keypress', async function (assert) {
        await keyUp('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');

        await keyPress('shift+c');
        assert.notOk(onTriggerCalled, 'does not trigger action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');
      });
    });
  });

  module('when used with a `div` element', function () {
    // Behavior is the same as with button element. That scenario has thorough
    // tests above. This is a basic smoketest.
    module('with no action specified', function (hooks) {
      hooks.beforeEach(async function () {
        await render(
          <template>
            <div
              role="button"
              {{on "click" onTrigger}}
              {{onKeyModifier "shift+c"}}
            ></div>
          </template>,
        );
      });
      test('triggers click on element on keydown by default', async function (assert) {
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
    module('with an action specified', function (hooks) {
      let onTriggerClickCalled;
      let onTriggerClickImpl;
      const onTriggerClick = (...args) => onTriggerClickImpl(...args);
      hooks.beforeEach(function () {
        onTriggerClickCalled = false;
        onTriggerClickImpl = () => {
          onTriggerClickCalled = true;
        };
      });
      hooks.beforeEach(async function () {
        await render(
          <template>
            <div
              role="button"
              {{on "click" onTriggerClick}}
              {{onKeyModifier "shift+c" onTrigger}}
            ></div>
          </template>,
        );
        await render(
          <template>
            <a
              href="#"
              {{on "click" onTriggerClick}}
              {{onKeyModifier "shift+c" onTrigger}}
            >Hello</a>
          </template>,
        );
      });
      test('triggers action on keydown by default', async function (assert) {
        await keyDown('shift+c');
        assert.ok(onTriggerCalled, 'triggers action');
        assert.notOk(onTriggerClickCalled, 'does not trigger click');
      });
      test('does not trigger on keyup or keypress', async function (assert) {
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
