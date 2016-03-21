import Ember from 'ember';
import { EKMixin, keyDown, keyUp, keyPress } from 'ember-keyboard';

const {
  Component,
  computed,
  on
} = Ember;

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

  decrementCounter: on(keyDown('ArrowLeft'), function() {
    this.decrementProperty('counter');
  }),

  incrementCounter: on(keyDown('ArrowRight'), function() {
    this.incrementProperty('counter');
  }),

  decrementCounter10: on(keyDown('ctrl+ArrowLeft'), function() {
    this.decrementProperty('counter', 10);
  }),

  incrementCounter10: on(keyDown('ctrl+ArrowRight'), function() {
    this.incrementProperty('counter', 10);
  }),

  decrementCounter100: on(keyDown('ctrl+shift+ArrowLeft'), function() {
    this.decrementProperty('counter', 100);
  }),

  incrementCounter100: on(keyDown('ctrl+shift+ArrowRight'), function() {
    this.incrementProperty('counter', 100);
  }),

  resetCounter: on(keyUp('r'), function() {
    this.set('counter', 0);
  }),

  resetCounter: on(keyPress('5'), function() {
    this.set('counter', 5);
  })
});
