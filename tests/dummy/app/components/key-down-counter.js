import { get, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import Component from '@ember/component';
import { EKMixin, keyDown, keyUp, keyPress } from 'ember-keyboard';

function makeEventHandler(stepSize = 1) {
  return function(event, ekEvent) {
    if (get(this, 'stopImmediatePropagation')) {
      ekEvent.stopImmediatePropagation();
    }
    if (get(this, 'stopPropagation')) {
      ekEvent.stopPropagation();
    }
    this.incrementProperty('counter', stepSize);
  }
}

export default Component.extend(EKMixin, {
  tagName: 'span',
  classNames: 'counter-container',
  toggleActivated: true,
  hook: 'counter',

  counter: 0,

  keyboardActivated: computed('parentActivated', 'toggleActivated', 'activatedToggle', {
    get() {
      const toggleActivated = this.get('activatedToggle') ? this.get('toggleActivated') : true;

      return toggleActivated && this.get('parentActivated');
    }
  }).readOnly(),

  decrementCounter: on(keyDown('ArrowLeft'), makeEventHandler(-1)),

  incrementCounter: on(keyDown('ArrowRight'), makeEventHandler(1)),

  decrementCounter10: on(keyDown('shift+ArrowLeft'), makeEventHandler(-10)),

  incrementCounter10: on(keyDown('shift+ArrowRight'), makeEventHandler(10)),

  decrementCounter100: on(keyDown('ctrl+shift+ArrowLeft'), makeEventHandler(-100)),

  incrementCounter100: on(keyDown('ctrl+shift+ArrowRight'), makeEventHandler(100)),

  resetCounter: on(keyUp('KeyR'), function() {
    this.set('counter', 0);
  }),

  setCounterTo5: on(keyPress('Digit5'), function() {
    this.set('counter', 5);
  })
});
