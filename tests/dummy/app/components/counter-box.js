import Ember from 'ember';
import { EKFirstResponderOnFocusMixin, EKOnInsertMixin, keyDown } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(EKFirstResponderOnFocusMixin, EKOnInsertMixin, {
  name: 'Counter Box',

  classNames: ['counter-box'],
  counter: 0,

  decrementCounter: on(keyDown('ArrowLeft'), function() {
    this.decrementProperty('counter');
  }),

  incrementCounter: on(keyDown('ArrowRight'), function() {
    this.incrementProperty('counter');
  })
});
