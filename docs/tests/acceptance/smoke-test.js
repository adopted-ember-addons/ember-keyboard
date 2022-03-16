import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL, click, findAll } from '@ember/test-helpers';

module('Acceptance | Smoke', function (hooks) {
  setupApplicationTest(hooks);

  test('step through all /docs pages', async function (assert) {
    assert.expect(9);

    await visit('/');
    const links = findAll('nav.menu > a');

    for (const link of links) {
      await click(link);
      assert.strictEqual(currentURL(), link.pathname);
    }

    assert.strictEqual(currentURL(), '/upgrading', 'last expected page');
    assert.strictEqual(links.length, 7, 'expected number of docs pages');
  });
});
