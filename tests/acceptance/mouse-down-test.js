import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { mouseDown } from 'ember-keyboard/test-support/test-helpers';

import { textChanged } from '../helpers/text-changed';

module('Acceptance | ember keyboard | mouseDown', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function() {
    await visit('/test-scenario/mouse-down');
  });

  module('left clicking', function() {
    const clickButton = 'left';

    test('clicking once adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown(clickButton), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '1',
        });
    });

    test('clicking twice adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown(clickButton) && mouseDown(clickButton), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '2',
        });
    });
  });

  module('middle clicking', function() {
    const clickButton = 'middle';

    test('clicking once adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown(clickButton), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '-10',
        });
    });

    test('clicking twice adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown(clickButton) && mouseDown(clickButton), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '-20',
        });
    });
  });

  module('right clicking', function() {
    const clickButton = 'right';

    test('clicking once adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown(clickButton), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '10',
        });
    });

    test('clicking twice adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown(clickButton) && mouseDown(clickButton), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '20',
        });
    });
  });
});
