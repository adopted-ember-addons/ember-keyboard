import Ember from 'ember';
import { ActivateKeyboardOnInsertMixin, keyUp } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(ActivateKeyboardOnInsertMixin, {
  name: 'Modal Container',

  isOpen: false,

  openModal: keyUp('ctrl+shift+a', function() {
    this.set('isOpen', true);
  }),

  actions: {
    closeModal() {
      this.set('isOpen', false);
    }
  }
});
