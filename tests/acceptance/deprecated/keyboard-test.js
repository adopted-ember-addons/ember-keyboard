import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { keyDown, keyUp, keyPress } from 'ember-keyboard/test-support/test-helpers';

import { textChanged } from '../../helpers/text-changed';

// Test using deprecated APIs
module('Acceptance | ember keyboard | deprecated | keyboard', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function() {
    await visit('/test-scenario/deprecated/keyboard');
  });

  module('keyDown', function() {
    module('Arrow keys', function() {
      test('Left is pressed', async function(assert) {
        assert.expect(2);

        await textChanged(assert,
          () => keyDown('ArrowLeft'), {
            selectorName: 'counter-counter',
            beforeValue: '0',
            afterValue: '-1',
          });
      });
    });
  });

  module('keyUp', function() {
    module('Letters are pressed', function() {
      module('R is configured to reset the counter', function(hooks) {
        hooks.beforeEach(async function() {
          await keyDown('ArrowRight');
        });

        test('the counter is cleared', async function(assert) {
          assert.expect(2);

          await textChanged(assert,
                            () => keyUp('KeyR'), {
                              selectorName: 'counter-counter',
                              beforeValue: '1',
                              afterValue: '0'
                            });
        });
      });
    });
  });

  module('keyPress', function() {
    module('Numbers are pressed', function() {
      test('pressing 5 sets the the counter', async function(assert) {
        assert.expect(2);

        await textChanged(assert,
                          () => keyPress('Digit5'), {
                            selectorName: 'counter-counter',
                            beforeValue: '0',
                            afterValue: '5'
                          });
      });
    });
  });
});
