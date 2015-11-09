import Ember from 'ember';
import { FocusActivatedEKEKFirstResponderOnFocus, EKOnInsert, keyDown } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(FocusActivatedEKEKFirstResponderOnFocus, EKOnInsert, {
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
