import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

const { get } = Ember;

moduleFor('service:keyboard', 'Unit | Service | keyboard');

test('`isDestroying` removes the jquery listeners', function(assert) {
  const service = this.subject();

  service.isDestroying();

  const listeners = Ember.$._data(document);

  assert.ok(!get(listeners, 'events.keyup'), 'listeners have been removed');
});
