import { moduleFor, test } from 'ember-qunit';

moduleFor('service:keyboard', 'Unit | Service | keyboard');

test('`activate` adds the supplied responder to the responderStack', function(assert) {
  const service = this.subject();
  const responder = 'foo';
  const secondResponder = 'bar';

  service.activate(responder);
  assert.deepEqual(service.get('responderStack'), [responder], 'adds responder to responderStack');

  service.activate(responder);
  assert.deepEqual(service.get('responderStack'), [responder], 'ensures responder uniquness');

  service.activate(secondResponder);
  assert.deepEqual(service.get('responderStack'), [secondResponder, responder], 'adds to the top of the stack');
});

test('`deactivate` removes the supplied responder from the responderStack', function(assert) {
  const service = this.subject();
  const responder = 'foo';

  service.activate(responder);
  service.deactivate(responder);
  assert.deepEqual(service.get('responderStack'), [], 'removes responder from responderStack');
});
