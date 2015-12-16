import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';
import { hook } from 'ember-hook';

function getValues() {
  return find(`${hook('lax-priority-counter')} ${hook('counter-counter')}`).map(function(index, counter) {
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

test('does nothing without responders', function(assert) {
  assert.expect(0);

  visit('/showcase').then(() => {
    return visit('/');
  }).then(() => {
    keyEvent(document, 'keydown', 37);
  });
});

test('test standard functionality', function(assert) {
  visit('/showcase').then(() => {
    click(hook('lax-widget'));

    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [1, 1, 0], 'default response is correct');

    click(`${hook('lax-priority-counter')}:nth(1) ${hook('counter-lax-priority-toggle')}`);

    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [1, 2, 0], 'removing lax responser is correct');

    click(`${hook('lax-priority-counter')}:nth(1) ${hook('counter-first-responder-toggle')}`);

    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [2, 2, 0], 'removing first responder is correct');

    click(`${hook('lax-priority-counter')}:nth(0) ${hook('counter-activated-toggle')}`);

    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    const values = getValues();

    assert.deepEqual(values, [2, 3, 1], 'deactivating a responder is correct');
  });
});
