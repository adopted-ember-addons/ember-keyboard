import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, fillIn, blur, visit } from '@ember/test-helpers';
import { gte } from 'ember-compatibility-helpers';
import config from 'dummy/config/environment';

import {
  mouseDown,
  keyUp,
  keyDown,
  touchStart,
  keyDownWithElement,
} from 'ember-keyboard/test-support/test-helpers';

import { hook } from '../helpers/hook';

import {
  getValues,
  getMouseValues,
  getTouchValues,
} from '../helpers/get-values';

module('Acceptance | disableOnInputFields config', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(() => {
    config.emberKeyboard.disableOnInputFields = true;
  });

  if (gte('3.10.0')) {
    test('test event does not propagate on input field', async function (assert) {
      assert.expect(1);

      await visit('/test-scenario');

      await keyDownWithElement('ArrowRight', '[data-test-input-field]');
      assert.deepEqual(getValues(), [0, 0, 0], 'responders do not respond');
    });

    test('test standard functionality', async function (assert) {
      assert.expect(8);

      await visit('/test-scenario');

      await mouseDown('left');
      assert.deepEqual(getMouseValues(), [1], 'left mouse');

      await mouseDown('right');
      assert.deepEqual(getMouseValues(), [11], 'right mouse');

      await mouseDown('middle');
      assert.deepEqual(getMouseValues(), [1], 'middle mouse');

      await touchStart();
      assert.deepEqual(getTouchValues(), [1], 'touch event');

      await keyDown('ArrowRight');
      assert.deepEqual(getValues(), [1, 1, 1], 'equal responders all respond');

      await click(
        `${hook('counter-first')} ${hook('counter-activated-toggle')}`
      );

      await keyDown('ArrowRight');
      assert.deepEqual(
        getValues(),
        [1, 2, 2],
        'deactivating a responder removes it from the stack'
      );

      await keyDown('ArrowRight+ctrl+shift');
      assert.deepEqual(getValues(), [1, 102, 102], 'modifier keys work');

      await keyUp('KeyR');
      assert.deepEqual(getValues(), [1, 0, 0], 'keyUp works');
    });

    test('test event propagation', async function (assert) {
      assert.expect(6);

      await visit('/test-scenario');
      await keyDown('ArrowRight');
      assert.deepEqual(getValues(), [1, 1, 1], 'equal responders all respond');

      await fillIn(
        `${hook('counter-first')} ${hook('counter-priority-input')}`,
        '1'
      );
      await blur(`${hook('counter-first')} ${hook('counter-priority-input')}`);

      await keyDown('ArrowRight');
      assert.deepEqual(
        getValues(),
        [2, 2, 2],
        'highest responder responds first, lower responders follow'
      );

      await fillIn(
        `${hook('counter-second')} ${hook('counter-priority-input')}`,
        '1'
      );
      await blur(`${hook('counter-second')} ${hook('counter-priority-input')}`);
      await click(
        `${hook('counter-first')} ${hook(
          'counter-stop-immediate-propagation-toggle'
        )}`
      );

      await keyDown('ArrowRight');
      assert.deepEqual(
        getValues(),
        [3, 2, 3],
        'highest responder responds first and stops immediate propagation, lower responders follow'
      );

      await click(
        `${hook('counter-first')} ${hook(
          'counter-stop-immediate-propagation-toggle'
        )}`
      );
      await click(
        `${hook('counter-first')} ${hook('counter-stop-propagation-toggle')}`
      );

      await keyDown('ArrowRight');
      assert.deepEqual(
        getValues(),
        [4, 3, 3],
        'highest responders responds first and block propagation to lower priority responders'
      );

      await click(
        `${hook('counter-first')} ${hook('counter-activated-toggle')}`
      );

      await keyDown('ArrowRight');
      assert.deepEqual(
        getValues(),
        [4, 4, 4],
        'deactivating a responder removes it from the stack, deactivated responders do not block propagation'
      );

      await fillIn(
        `${hook('counter-first')} ${hook('counter-priority-input')}`,
        '2'
      );
      await blur(`${hook('counter-first')} ${hook('counter-priority-input')}`);
      await click(
        `${hook('counter-first')} ${hook('counter-stop-propagation-toggle')}`
      );
      await click(
        `${hook('counter-first')} ${hook('counter-activated-toggle')}`
      );
      await click(
        `${hook('counter-first')} ${hook('counter-first-responder-toggle')}`
      );
      await click(
        `${hook('counter-second')} ${hook('counter-first-responder-toggle')}`
      );
      await click(
        `${hook('counter-second')} ${hook(
          'counter-stop-immediate-propagation-toggle'
        )}`
      );

      await click(
        `${hook('counter-third')} ${hook('counter-first-responder-toggle')}`
      );

      await keyDown('ArrowRight');
      assert.deepEqual(
        getValues(),
        [5, 5, 4],
        'first responders get called in priority order.'
      );
    });
  }
});
