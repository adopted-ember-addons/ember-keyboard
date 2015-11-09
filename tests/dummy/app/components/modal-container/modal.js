import Ember from 'ember';
import { EKOnInsert, keyUp } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(EKOnInsert, {
  name: 'Modal',

  classNames: ['modal'],

  closeModal: on(keyUp('Escape'), function() {
    this.attrs.closeModal();
  })
});
