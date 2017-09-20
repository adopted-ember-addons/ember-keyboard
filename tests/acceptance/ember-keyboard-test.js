import { run } from '@ember/runloop';
import { set } from '@ember/object';
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
    run(this.application, 'destroy');
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

test('test event propagation', function(assert) {
  assert.expect(6);

  const keyboardService = this.application.__container__.lookup('service:keyboard');
  set(keyboardService, 'isPropagationEnabled', true);

  visit('/test-scenario').then(() => {
    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [1, 1, 1], 'equal responders all respond');

    fillIn(`${hook('counter')}:nth(0) ${hook('counter-priority-input')}`, '1');

    triggerEvent(`${hook('counter')}:nth(0) ${hook('counter-priority-input')}`, 'blur');

    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [2, 2, 2], 'highest responder responds first, lower responders follow');

    fillIn(`${hook('counter')}:nth(1) ${hook('counter-priority-input')}`, '1');

    triggerEvent(`${hook('counter')}:nth(1) ${hook('counter-priority-input')}`, 'blur');

    click(`${hook('counter')}:nth(0) ${hook('counter-stop-immediate-propagation-toggle')}`);

    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [3, 2, 3], 'highest responder responds first and stops immediate propagation, lower responders follow');

    click(`${hook('counter')}:nth(0) ${hook('counter-stop-immediate-propagation-toggle')}`);

    click(`${hook('counter')}:nth(0) ${hook('counter-stop-propagation-toggle')}`);


    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [4, 3, 3], 'highest responders responds first and block propagation to lower priority responders');

    click(`${hook('counter')}:nth(0) ${hook('counter-activated-toggle')}`);

    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [4, 4, 4], 'deactivating a responder removes it from the stack, deactivated responders do not block propagation');

    fillIn(`${hook('counter')}:nth(0) ${hook('counter-priority-input')}`, '2');
    triggerEvent(`${hook('counter')}:nth(0) ${hook('counter-priority-input')}`, 'blur');
    click(`${hook('counter')}:nth(0) ${hook('counter-stop-propagation-toggle')}`);
    click(`${hook('counter')}:nth(0) ${hook('counter-activated-toggle')}`);
    click(`${hook('counter')}:nth(0) ${hook('counter-first-responder-toggle')}`)
    ;
    click(`${hook('counter')}:nth(1) ${hook('counter-first-responder-toggle')}`);
    click(`${hook('counter')}:nth(1) ${hook('counter-stop-immediate-propagation-toggle')}`);

    click(`${hook('counter')}:nth(2) ${hook('counter-first-responder-toggle')}`);

    return keyDown('ArrowRight');
  }).then(() => {
    assert.deepEqual(getValues(), [5, 5, 4], 'first responders get called in priority order.');
  });
});
