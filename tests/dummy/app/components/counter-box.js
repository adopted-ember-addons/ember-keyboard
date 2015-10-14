import Ember from 'ember';

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

  decrementCounter: on('keyDown:ArrowLeft', function() {
    this.decrementProperty('counter');
  }),

  incrementCounter: on('keyDown:ArrowRight', function() {
    this.incrementProperty('counter');
  })
});
