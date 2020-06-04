import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | keyboard', function(hooks) {
  setupTest(hooks);

  let service;
  hooks.beforeEach(function() {
    service = this.owner.lookup('service:keyboard');
  });

  hooks.afterEach(function() {
    let { registeredResponders } = service;
    let responder;
    for (responder of registeredResponders) {
      service.unregister(responder);
    }
  });

  test('`activeResponders` is a filtered list of registeredResponders with keyboardActivated true', function(assert) {
    service.register({ keyboardActivated: true });
    service.register({ keyboardActivated: false });
    service.register({ keyboardActivated: true });
    assert.equal(service.activeResponders.length, 2, 'correct number of responders');
  });

  test('`sortedResponders` sorts by keyboardFirstResponder and keyboardPriority', function(assert) {
    service.register({
      keyboardActivated: true,
      keyboardPriority: 0
    });
    service.register({
      keyboardActivated: true,
      keyboardPriority: -1
    });
    service.register({
      keyboardActivated: false,
      keyboardPriority: 50
    });
    service.register({
      keyboardActivated: true,
      keyboardPriority: 0,
        keyboardFirstResponder: true
    });
    service.register({
      keyboardActivated: true,
      keyboardPriority: 1
    });

    assert.deepEqual(service.sortedResponders.map(r => r.keyboardPriority), [0, 1, 0, -1], 'correct sorting');
  });

  // It would be nice to test that tearing down this service removes the installed
  // event listeners. However, DOM does not have a way to get a collection of
  // attached event listeners.
});
