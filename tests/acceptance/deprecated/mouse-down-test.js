import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { mouseDown } from 'ember-keyboard/test-support/test-helpers';

import { textChanged } from '../../helpers/text-changed';

module('Acceptance | ember keyboard | deprecated | mouseDown', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function() {
    await visit('/test-scenario/deprecated/mouse-down');
  });

  module('left clicking', function() {
    test('clicking once adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown('left'), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '1',
        });
    });

    test('clicking twice adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown('left') && mouseDown('left'), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '2',
        });
    });
  });

  module('middle clicking', function() {
    test('clicking once adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown('middle'), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '-10',
        });
    });

    test('clicking twice adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown('middle') && mouseDown('middle'), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '-20',
        });
    });
  });

  module('right clicking', function() {
    test('clicking once adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown('right'), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '10',
        });
    });

    test('clicking twice adjusts the counter by 1', async function(assert) {
      assert.expect(2);

      await textChanged(assert,
        () => mouseDown('right') && mouseDown('right'), {
          selectorName: 'mouse-down-counter',
          beforeValue: '0',
          afterValue: '20',
        });
    });
  });
});
