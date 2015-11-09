import Ember from 'ember';
import { ActivateKeyboardOnInsertMixin, keyUp } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(ActivateKeyboardOnInsertMixin, {
  name: 'Modal', 

  classNames: ['modal'],

  closeModal: on(keyUp('Escape'), function() {
    this.attrs.closeModal();
  })
});
