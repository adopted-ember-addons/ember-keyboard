import Ember from 'ember';
import { EKFirstResponderOnFocus, EKOnInsert, keyDown } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(EKFirstResponderOnFocus, EKOnInsert, {
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
