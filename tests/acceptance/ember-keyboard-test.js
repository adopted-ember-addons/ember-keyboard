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
  visit('/test-scenario').then(() => {
    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [1, 1, 1], 'equal responders all respond');

    fillIn(`${hook('counter')}:nth(0) ${hook('counter-priority-input')}`, '1');

    triggerEvent(`${hook('counter')}:nth(0) ${hook('counter-priority-input')}`, 'blur');

    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [2, 1, 1], 'highest responder responds first');

    click(`${hook('counter')}:nth(1) ${hook('counter-first-responder-toggle')}`);

    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [2, 2, 1], 'first responder responds first');

    click(`${hook('counter')}:nth(1) ${hook('counter-lax-priority-toggle')}`);

    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [3, 3, 1], 'lax priority does not block lower priority responders');

    click(`${hook('counter')}:nth(0) ${hook('counter-activated-toggle')}`);

    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [3, 4, 2], 'deactivating a responder removes it from the stack');

    return triggerEvent(document, 'keydown', { keyCode: 39, which: 39, ctrlKey: true, shiftKey: true });
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [3, 104, 102], 'modifier keys work');
  });
});
