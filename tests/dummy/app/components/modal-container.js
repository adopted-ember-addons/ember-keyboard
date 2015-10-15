import Ember from 'ember';
import { keyUp } from 'ember-keyboard';

const {
  Component,
  inject,
  on
} = Ember;

export default Component.extend({
  isOpen: false,
  keyboard: inject.service(),

  activateKeyboard: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
  }),

  openModal: keyUp('ctrl+shift+a', function() {
    this.set('isOpen', true);
  }),

  actions: {
    closeModal() {
      this.set('isOpen', false);
    }
  }
});
