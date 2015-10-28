import Ember from 'ember';
import { ActivateKeyboardOnInsertMixin, onKeyUp } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(ActivateKeyboardOnInsertMixin, {
  name: 'Modal', 

  classNames: ['modal'],

  closeModal: onKeyUp('Escape', function() {
    this.attrs.closeModal();
  })
});
