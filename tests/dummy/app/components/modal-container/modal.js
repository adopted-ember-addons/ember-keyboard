import Ember from 'ember';
import { keyUp } from 'ember-keyboard';

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

  closeModal: keyUp('Escape', function() {
    this.attrs.closeModal();
  })
});
