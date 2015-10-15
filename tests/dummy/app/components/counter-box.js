import Ember from 'ember';
import { keyDown } from 'ember-keyboard';

const {
  Component,
  inject,
  on
} = Ember;

export default Component.extend({
  classNames: ['counter-box'],
  counter: 0,
  keyboard: inject.service(),

  activateKeyboard: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
  }),

  deactivateKeyboard: on('willDestroyElement', function() {
    this.get('keyboard').deactivate(this);
  }),

  decrementCounter: keyDown('ArrowLeft', function() {
    this.decrementProperty('counter');
  }),

  incrementCounter: keyDown('ArrowRight', function() {
    this.incrementProperty('counter');
  })
});
