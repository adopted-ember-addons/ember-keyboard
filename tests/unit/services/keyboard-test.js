import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:keyboard', 'Unit | Service | keyboard');

const {
  Evented,
  get
} = Ember;

// Since `activate` call `.on` on the responder, we need to make sure we're using evented objects
const EventedObject = Ember.Object.extend(Evented);

test('`activate` adds the supplied responder to `responders`', function(assert) {
  const service = this.subject();
  const responder = EventedObject.create({ keyboardPriority: 1 });
  const secondResponder = EventedObject.create({ keyboardPriority: 2 });
  const thirdResponder = EventedObject.create({ keyboardPriority: 2 });

  service.activate(responder);
  assert.deepEqual([...service.get('responders').keys()], [1], 'creates priortySet');

  service.activate(responder);
  assert.deepEqual([...service.get('responders').keys()], [1], 'ensures priortySet uniqueness');

  service.activate(secondResponder);
  assert.deepEqual([...service.get('responders').keys()], [1, 2], 'adds new prioritySet');

  service.activate(thirdResponder);
  assert.deepEqual([...service.get('responders').keys()], [1, 2], 'uses preexisting prioritySet');

  service.activate();
  assert.deepEqual([...service.get('responders').keys()], [1, 2], 'does not add a blank entry when undefined');
});

test('`deactivate` removes the supplied responder from the _responderStack', function(assert) {
  const service = this.subject();
  const responder = EventedObject.create({ name: 'bar' });

  service.activate(responder);
  service.deactivate(responder);
  assert.deepEqual([...service.get('responders').keys()], [], 'destroys priortySet');
});

test('`_teardownListener` removes the jquery listeners', function(assert) {
  const service = this.subject();

  service._teardownListener();

  const listeners = Ember.$._data(document);

  assert.ok(!get(listeners, 'events.keyup'), 'listeners have been removed');
});
