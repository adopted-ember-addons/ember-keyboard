import Ember from 'ember';

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

  openModal: on('keyUp:ctrl+shift+a', function() {
    this.set('isOpen', true);
  }),

  actions: {
    closeModal() {
      this.set('isOpen', false);
    }
  }
});
