import Ember from 'ember';
import { EKOnInsert, keyUp } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(EKOnInsert, {
  name: 'Modal Container',

  isOpen: false,

  openModal: on(keyUp('ctrl+shift+a'), function() {
    this.set('isOpen', true);
  }),

  actions: {
    closeModal() {
      this.set('isOpen', false);
    }
  }
});
