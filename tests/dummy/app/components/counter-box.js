import Ember from 'ember';
import { KeyboardFirstResponderOnFocusMixin, ActivateKeyboardOnInsertMixin, keyDown, onKeyDown } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(KeyboardFirstResponderOnFocusMixin, ActivateKeyboardOnInsertMixin, {
  name: 'Counter Box',

  classNames: ['counter-box'],
  counter: 0,

  decrementCounter: on(keyDown('ArrowLeft'), function() {
    this.decrementProperty('counter');
  }),

  incrementCounter: onKeyDown('ArrowRight', function() {
    this.incrementProperty('counter');
  })
});
