import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  render,
  resetOnerror,
  setupOnerror,
  triggerEvent,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | if-key', function (hooks) {
  setupRenderingTest(hooks);

  module('error cases', function (hooks) {
    hooks.afterEach(() => resetOnerror());

    // This doesn't work. I wish it did, but can't figure out why not.
    skip('errors if invoked without a handler', async function (assert) {
      assert.expect(1);
      setupOnerror(function (error) {
        assert.strictEqual(
          error.message,
          'Assertion Failed: ember-keyboard: The if-key helper must be provided a function as its second argument',
          'error is thrown'
        );
      });
      await render(
        hbs`{{on-document "keydown" (if-key "alt+c" this.unknownEvent)}}`
      );
      await triggerEvent(document.body, 'keydown', { altKey: true, key: 'c' });
    });

    // This doesn't work. I wish it did, but can't figure out why not.
    skip('warns if called without a keyboard event', async function (assert) {
      assert.expect(1);
      setupOnerror(function (error) {
        assert.strictEqual(
          error.message,
          'Assertion Failed: ember-keyboard: The if-key helper expects to be invoked with a KeyboardEvent',
          'error is thrown'
        );
      });
      await render(
        hbs`<button {{on 'click' (if-key "alt+c" this.onTrigger)}}>Press me</button>`
      );
      await click('button');
    });
  });

  test('called with event', async function (assert) {
    let onTriggerCalledWith;
    this.set('onTrigger', (ev) => {
      onTriggerCalledWith = ev;
    });
    await render(
      hbs`{{on-document "keydown" (if-key "alt+c" this.onTrigger)}}`
    );
    await triggerEvent(document.body, 'keydown', { altKey: true, key: 'c' });
    assert.ok(onTriggerCalledWith instanceof KeyboardEvent);
  });

  test('not called if key combo does not match', async function (assert) {
    let onTriggerCalledWith;
    this.set('onTrigger', (ev) => {
      onTriggerCalledWith = ev;
    });
    await render(
      hbs`{{on-document "keydown" (if-key "alt+c" this.onTrigger)}}`
    );
    await triggerEvent(document.body, 'keydown', { shiftKey: true, key: 'z' });
    assert.notOk(
      onTriggerCalledWith,
      'trigger is on invoked if key does not match'
    );
  });
});
