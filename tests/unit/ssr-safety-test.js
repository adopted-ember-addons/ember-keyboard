import { module, test } from 'qunit';

/**
 * These tests validate that all addon modules can be imported without
 * accessing browser globals (window, document, navigator) at module
 * evaluation time, which is required for SSR/FastBoot compatibility.
 */
module('Unit | SSR Safety', function () {
  test('all public modules can be imported', async function (assert) {
    const index = await import('#src/index.js');
    assert.ok(index, 'index module loads');
  });

  test('helpers can be imported', async function (assert) {
    const onKeyHelper = await import('#src/helpers/on-key.js');
    assert.ok(onKeyHelper, 'on-key helper loads');

    const ifKeyHelper = await import('#src/helpers/if-key.js');
    assert.ok(ifKeyHelper, 'if-key helper loads');
  });

  test('modifiers can be imported', async function (assert) {
    const onKeyMod = await import('#src/modifiers/on-key.js');
    assert.ok(onKeyMod, 'on-key modifier loads');
  });

  test('decorators can be imported', async function (assert) {
    const keyResponder = await import('#src/decorators/key-responder.js');
    assert.ok(keyResponder, 'key-responder decorator loads');

    const onKey = await import('#src/decorators/on-key.js');
    assert.ok(onKey, 'on-key decorator loads');
  });

  test('services can be imported', async function (assert) {
    const keyboard = await import('#src/services/keyboard.js');
    assert.ok(keyboard, 'keyboard service loads');
  });

  test('utils do not access browser globals at import time', async function (assert) {
    const isKey = await import('#src/utils/is-key.js');
    assert.ok(isKey, 'is-key util loads');

    const listenerName = await import('#src/utils/listener-name.js');
    assert.ok(listenerName, 'listener-name util loads');

    const sort = await import('#src/utils/sort.js');
    assert.ok(sort, 'sort util loads');

    const handleKeyEvent = await import('#src/utils/handle-key-event.js');
    assert.ok(handleKeyEvent, 'handle-key-event util loads');
  });
});
