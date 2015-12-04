import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

const search = '.input';
const textarea = '.textarea';
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
    // press 'ArrowLeft'
    return keyEvent(document, 'keydown', 37);
  }).then(() => {
    assert.equal(Ember.$(standAloneCounter).first().text().trim(), '-1', 'counter respond to keydown event');

    return triggerEvent(search, 'focus');
  }).then(() => {
    // press 'ArrowLeft' from within an input
    return keyEvent(search, 'keydown', 37);
  }).then(() => {
    assert.equal(Ember.$(standAloneCounter).first().text().trim(), '-1', 'focused input prevents event bubbling');

    return triggerEvent(search, 'blur');
  }).then(() => {
    // press 'ArrowLeft' from within an input
    return keyEvent(document, 'keydown', 37);
  }).then(() => {
    assert.equal(Ember.$(standAloneCounter).first().text().trim(), '-2', 'bluring an input reenables event bubbling');

    return triggerEvent(textarea, 'focus');
  }).then(() => {
    // press 'ArrowLeft' from within an textarea
    return keyEvent(textarea, 'keydown', 37);
  }).then(() => {
    assert.equal(Ember.$(standAloneCounter).first().text().trim(), '-2', 'focused textarea prevents event bubbling');

    return triggerEvent(textarea, 'blur');
  }).then(() => {
    // press 'ArrowLeft' from within a textarea
    return keyEvent(textarea, 'keydown', 37);
  }).then(() => {
    assert.equal(Ember.$(standAloneCounter).first().text().trim(), '-3', 'bluring a textarea reenables event bubbling');

    // press 'cltr+shift+a'
    return triggerEvent(document, 'keyup', { keyCode: 65, which: 65, ctrlKey: true, shiftKey: true });
  }).then(() => {
    assert.ok(Ember.$(modal).length > 0, 'modal is present after pressing ctrl+shift+a');

    // press 'ArrowRight'
    return keyEvent(document, 'keydown', 39);
  }).then(() => {
    assert.equal(Ember.$(modalCounter).text().trim(), '1', 'modal counter respond to keydown event');
    assert.equal(Ember.$(standAloneCounter).first().text().trim(), '-3', 'standalone counter is blocked by modal counter');

    // press 's'
    return keyEvent(document, 'keyup', 83);
  }).then(() => {
    assert.ok(!Ember.$(search).is(':focus'), 'event does not bubble after modal');
  });
});
