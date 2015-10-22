import Ember from 'ember';
import { KeyboardFirstResponderOnFocusMixin, ActivateKeyboardOnInsertMixin, keyDown } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(KeyboardFirstResponderOnFocusMixin, ActivateKeyboardOnInsertMixin, {
  name: 'Counter Box',

  classNames: ['counter-box'],
  counter: 0,

  decrementCounter: keyDown('ArrowLeft', function() {
    this.decrementProperty('counter');
  }),

  incrementCounter: keyDown('ArrowRight', function() {
    this.incrementProperty('counter');
  })
});
