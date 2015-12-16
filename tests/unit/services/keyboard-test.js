import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

const { get } = Ember;

moduleFor('service:keyboard', 'Unit | Service | keyboard');

test('`_teardownListener` removes the jquery listeners', function(assert) {
  const service = this.subject();

  service._teardownListener();

  const listeners = Ember.$._data(document);

  assert.ok(!get(listeners, 'events.keyup'), 'listeners have been removed');
});
