import Ember from 'ember';
import { EKOnInsertMixin, keyUp } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(EKOnInsertMixin, {
  name: 'Modal',

  classNames: ['modal'],

  closeModal: on(keyUp('Escape'), function() {
    this.attrs.closeModal();
  })
});
