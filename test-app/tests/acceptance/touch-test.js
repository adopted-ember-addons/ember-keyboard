import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { touchStart } from 'ember-keyboard/test-support/test-helpers';
import { textChanged } from '../helpers/text-changed';
import { gte } from 'ember-compatibility-helpers';

module('Acceptance | ember keyboard | touch', function (hooks) {
  setupApplicationTest(hooks);

  if (gte('3.10.0')) {
    hooks.beforeEach(async function () {
      await visit('/test-scenario/touch');
    });

    module('start touching', function () {
      test('increases the touch counter once', async function (assert) {
        assert.expect(2);

        await textChanged(assert, () => touchStart(), {
          selectorName: 'touch-start-counter',
          beforeValue: '0',
          afterValue: '1',
        });
      });

      test('increases the touch counter twice', async function (assert) {
        assert.expect(2);

        await textChanged(assert, () => touchStart() && touchStart(), {
          selectorName: 'touch-start-counter',
          beforeValue: '0',
          afterValue: '2',
        });
      });
    });
  }
});
