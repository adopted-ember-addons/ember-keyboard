import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:keyboard', 'Unit | Service | keyboard');

// transforms Ember.Objects and Ember.Arrays into normal objects and arrays
const normalize = function normalize(data) {
  return JSON.parse(JSON.stringify(data));
};

test('`activate` adds the supplied responder to the _responderStack', function(assert) {
  const service = this.subject();
  const responder = Ember.Object.create({ name: 'foo' });
  const secondResponder = Ember.Object.create({ name: 'bar' });

  service.activate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder]), 'adds responder to sortedResponderStack');

  service.activate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder]), 'ensures responder uniquness');

  service.activate(secondResponder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), normalize([responder, secondResponder]), 'adds to the top of the stack');
});

test('`sortedResponderStack` sorts the sortedResponderStack by priorty', function(assert) {
  const service = this.subject();
  const responder = Ember.Object.create({ name: 'foo', keyboardPriority: 2 });
  const secondResponder = Ember.Object.create({ name: 'bar', keyboardPriority: 1 });
  const thirdResponder = Ember.Object.create({ name: 'baz' });
  const fourthResponder = Ember.Object.create({ name: 'beetle' });

  service.activate(responder);
  service.activate(secondResponder);
  service.activate(thirdResponder);
  service.activate(fourthResponder);
  
  const expected = normalize([responder, secondResponder, thirdResponder, fourthResponder]);

  assert.deepEqual(normalize(service.get('sortedResponderStack')), expected, 'sort by priority ascending, non-priority at the end');
});

test('`deactivate` removes the supplied responder from the _responderStack', function(assert) {
  const service = this.subject();
  const responder = Ember.Object.create({ name: 'bar' });

  service.activate(responder);
  service.deactivate(responder);
  assert.deepEqual(normalize(service.get('sortedResponderStack')), [], 'removes responder from sortedResponderStack');
});
