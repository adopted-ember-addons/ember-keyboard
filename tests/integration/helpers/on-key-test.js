import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
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

  module('various key combos', function() {
    let table = `
    keyCombo         alt ctrl meta shift key  code    shouldTrigger  pending   note
    alt+c            T   F    F    F     c    KeyC    T              T
    alt+c            T   F    F    F     j    KeyC    F              T         simulates dvorak j
    alt+c            T   F    F    F     c    KeyI    T              T         simulates dvorak c
    alt+c            T   F    F    F     ç    KeyC    T              T         simulates Mac alt+c
    alt+KeyC         T   F    F    F     c    KeyC    T              F
    alt+c            F   F    F    F     c    KeyC    F              F          alt not pressed
    alt+c            T   F    F    T     c    KeyC    F              F          alt+shift pressed
    alt+KeyC         F   F    F    F     c    KeyC    F              F          alt not pressed
    alt+KeyC         T   F    F    T     c    KeyC    F              F          alt+shift pressed
    shift+c          F   F    F    T     c    KeyC    T              T
    shift+KeyC       F   F    F    T     c    KeyC    T              F
    ctrl+shift+t     F   T    F    T     t    KeyT    T              T
    ctrl+shift+KeyT  F   T    F    T     t    KeyT    T              F
    alt+Digit2       T   F    F    F     2    Digit2  T              F
    shift+Digit2     F   F    F    T     @    Digit2  T              T
    shift+2          F   F    F    T     @    Digit2  T              T
    @                F   F    F    F     @    Digit2  T              T
    ?                F   F    F    T     ?    Slash   T              T
    ctrl+?           F   T    F    T     ?    Slash   T              T
    ctrl+Slash       F   T    F    F     /    Slash   T              F
    ctrl+Slash       F   T    F    T     ?    Slash   F              F
    `;
    let line;
    for (line of table.split("\n").map(line => line.trim())) {
      if (line === '' || line.match(/^keyCombo/)) { continue; } // blank or header row
      buildTestFromLine(line);
    }
  });

  function stringToBoolean(s) {
    if (s === 'T') return true;
    if (s === 'F') return false;
    throw new Error(`Invalid boolean string value: ${s}. Must be 'T' or 'F'`);
  }

  function buildTestFromLine(line) {
    let [keyCombo,alt,ctrl,meta,shift,key,code,shouldTriggerS,pending,note] = line.split(/\s+/);
    let altKey = stringToBoolean(alt);
    let ctrlKey = stringToBoolean(ctrl);
    let metaKey = stringToBoolean(meta);
    let shiftKey = stringToBoolean(shift);
    let shouldTrigger = stringToBoolean(shouldTriggerS);
    let isPending = stringToBoolean(pending);
    let testDescription = `with "${keyCombo}", `;
    testDescription += shouldTrigger ? 'should ' : 'should not ';
    testDescription += `trigger on keydown with `;
    testDescription += `key: ${key}, `;
    testDescription += `code: ${code}, `;
    testDescription += `with modifiers `;
    let modifiers = [];
    if (altKey) {
      modifiers.push('alt');
    }
    if (ctrlKey) {
      modifiers.push('ctrl');
    }
    if (metaKey) {
      modifiers.push('meta');
    }
    if (shiftKey) {
      modifiers.push('shift');
    }
    testDescription += modifiers.join('+');
    let testFunc = isPending ? skip : test;
    testFunc(testDescription, async function(assert) {
      this.set('keyCombo', keyCombo);
      await render(hbs`
        {{on-key keyCombo onTrigger}}
      `);
      await triggerEvent(document.body, 'keydown', {
        code, key, altKey, ctrlKey, metaKey, shiftKey
      });
      if (shouldTrigger) {
        let expectedTriggerMessage = `should trigger${note ? ', ' + note : ''}`;
        assert.ok(onTriggerCalled, expectedTriggerMessage);
      } else {
        let expectedNoTriggerMessage = `should not trigger${note ? ', ' + note : ''}`;
        assert.ok(!onTriggerCalled, expectedNoTriggerMessage);
      }
    });
  }
});
