import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

const search = '.input';
const modal = '.modal';
const modalCounter = '.modal-counter';
const standAloneCounter = '.standalone-counter';

module('Acceptance | ember keyboard', {
  beforeEach() {
    this.application = startApp();
  },

  afterEach() {
    Ember.run(this.application, 'destroy');
  }
});

test('run the paces', function(assert) {
  visit('/').then(() => {
    // press 'ArrowLeft'
    return keyEvent(document, 'keydown', 37); 
  }).then(() => {
    assert.equal(Ember.$(standAloneCounter).text().trim(), '-1', 'counter respond to keydown event');

    // press 'cltr+shift+a'
    return triggerEvent(document, 'keyup', { keyCode: 65, which: 65, ctrlKey: true, shiftKey: true });
  }).then(() => {
    assert.ok(Ember.$(modal).length > 0, 'modal is present after pressing ctrl+shift+a');

    // press 'ArrowRight'
    return keyEvent(document, 'keydown', 39); 
  }).then(() => {
    assert.equal(Ember.$(modalCounter).text().trim(), '1', 'modal counter respond to keydown event');
    assert.equal(Ember.$(standAloneCounter).text().trim(), '-1', 'standalone counter is blocked by modal counter');

    // press 's'
    return keyEvent(document, 'keyup', 83);
  }).then(() => {
    assert.ok(!Ember.$(search).is(':focus'), 'event does not bubble after modal');
  });
});
