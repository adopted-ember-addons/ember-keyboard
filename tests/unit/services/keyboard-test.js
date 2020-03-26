import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | keyboard', function(hooks) {
  setupTest(hooks);

  test('`activeResponders` is a filtered list of registeredResponders with keyboardActivated true', function(assert) {
    const service = this.owner.factoryFor('service:keyboard').create({
      registeredResponders: A([{
        keyboardActivated: true
      }, {
        keyboardActivated: false
      }, {
        keyboardActivated: true
      }])
    });

    assert.equal(service.get('activeResponders.length'), 2, 'correct number of responders');
  });

  test('`sortedResponders` sorts by keyboardFirstResponder and keyboardPriority', function(assert) {
    const service = this.owner.factoryFor('service:keyboard').create({
      registeredResponders: A([{
        keyboardActivated: true,
        keyboardPriority: 0
      }, {
        keyboardActivated: true,
        keyboardPriority: -1
      }, {
        keyboardActivated: false,
        keyboardPriority: 50
      }, {
        keyboardActivated: true,
        keyboardPriority: 0,
        keyboardFirstResponder: true
      }, {
        keyboardActivated: true,
        keyboardPriority: 1
      }])
    });

    assert.deepEqual(service.get('sortedResponders').mapBy('keyboardPriority'), [0, 1, 0, -1], 'correct sorting');
  });

  // It would be nice to test that tearing down this service removes the installed
  // event listeners. However, DOM does not have a way to get a collection of
  // attached event listeners.
});
