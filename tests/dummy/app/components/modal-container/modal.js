import Ember from 'ember';
import { ActivateKeyboardOnInsertMixin, keyUp } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(ActivateKeyboardOnInsertMixin, {
  name: 'Modal', 

  classNames: ['modal'],

  closeModal: keyUp('Escape', function() {
    this.attrs.closeModal();
  })
});
