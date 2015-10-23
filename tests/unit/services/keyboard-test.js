import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:keyboard', 'Unit | Service | keyboard');

const {
  Evented,
  get
} = Ember;

// transforms EventedObjects and Ember.Arrays into normal objects and arrays
const normalize = function normalize(data) {
  return JSON.parse(JSON.stringify(data));
};

// Since `activate` call `.on` on the responder, we need to make sure we're using evented objects
const EventedObject = Ember.Object.extend(Evented);

test('`activate` adds the supplied responder to the _responderStack', function(assert) {
  const service = this.subject();
  const responder = EventedObject.create({ name: 'foo' });
  const secondResponder = EventedObject.create({ name: 'bar' });

  service.activate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder]), 'adds responder to sortedResponderStack');

  service.activate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder]), 'ensures responder uniquness');

  service.activate(secondResponder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder, secondResponder]), 'adds to the top of the stack');

  service.activate();
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder, secondResponder]), 'passing no arguments will not result in an undefined element');
});

test('`sortedResponderStack` sorts the sortedResponderStack by priorty', function(assert) {
  const service = this.subject();
  const responder = EventedObject.create({ name: 'foo', keyboardPriority: 2 });
  const secondResponder = EventedObject.create({ name: 'bar', keyboardPriority: 1 });
  const thirdResponder = EventedObject.create({ name: 'baz' });
  const fourthResponder = EventedObject.create({ name: 'beetle' });

  service.activate(responder);
  service.activate(secondResponder);
  service.activate(thirdResponder);
  service.activate(fourthResponder);
  
  const expected = normalize([responder, secondResponder, thirdResponder, fourthResponder]);

  assert.deepEqual(normalize(service.get('sortedResponderStack')), expected, 'sort by priority ascending, non-priority at the end');
});

test('`deactivate` removes the supplied responder from the _responderStack', function(assert) {
  const service = this.subject();
  const responder = EventedObject.create({ name: 'bar' });

  service.activate(responder);
  service.deactivate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), [], 'removes responder from sortedResponderStack');
});

test('`_teardownListener` removes the jquery listeners', function(assert) {
  const service = this.subject();

  service._teardownListener();
  
  const listeners = Ember.$._data(document);

  assert.ok(!get(listeners, 'events.keyup'), 'listeners have been removed');
});
