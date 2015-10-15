import Ember from 'ember';

const {
  Component,
  inject,
  on
} = Ember;

export default Component.extend({
  classNames: ['modal'],
  keyboard: inject.service(),

  activateKeyboard: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
  }),

  deactivateKeyboard: on('willDestroyElement', function() {
    this.get('keyboard').deactivate(this);
  }),

  closeModal: on('keyUp:Escape', function() {
    this.attrs.closeModal();
  })
});
