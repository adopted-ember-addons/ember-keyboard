import { module, test } from 'qunit';
import {
  setup,
  visit /* mockServer */,
} from 'ember-cli-fastboot-testing/test-support';

module('FastBoot | rendering test', function (hooks) {
  setup(hooks);

  test('renders', async function (assert) {
    const res = await visit('/test-scenario');
    assert.strictEqual(res.statusCode, 200);
  });
});
