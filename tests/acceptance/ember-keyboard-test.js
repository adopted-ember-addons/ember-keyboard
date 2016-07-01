import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';
import { hook } from 'ember-hook';

function getValues() {
  return find(`${hook('counter-counter')}`).map(function(index, counter) {
    return parseInt($(counter).text().trim(), 10);
  }).get();
}

module('Acceptance | ember keyboard', {
  beforeEach() {
    this.application = startApp();
  },

  afterEach() {
    Ember.run(this.application, 'destroy');
  }
});

test('test standard functionality', function(assert) {
  assert.expect(7);

  visit('/test-scenario').then(() => {
    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [1, 1, 1], 'equal responders all respond');

    fillIn(`${hook('counter')}:nth(0) ${hook('counter-priority-input')}`, '1');

    triggerEvent(`${hook('counter')}:nth(0) ${hook('counter-priority-input')}`, 'blur');

    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [2, 1, 1], 'highest responder responds first');

    click(`${hook('counter')}:nth(1) ${hook('counter-first-responder-toggle')}`);

    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [2, 2, 1], 'first responder responds first');

    click(`${hook('counter')}:nth(1) ${hook('counter-lax-priority-toggle')}`);

    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [3, 3, 1], 'lax priority does not block lower priority responders');

    click(`${hook('counter')}:nth(0) ${hook('counter-activated-toggle')}`);

    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [3, 4, 2], 'deactivating a responder removes it from the stack');

    return keyDown('ArrowRight+ctrl+shift');
  }).then(() => {
    assert.deepEqual(getValues(), [3, 104, 102], 'modifier keys work');

    return keyUp('KeyR');
  }).then(() => {
    assert.deepEqual(getValues(), [3, 0, 0], 'keyUp works');
  });
});
