import Ember from 'ember';
import { EKOnInsertMixin, keyUp, getKey } from 'ember-keyboard';

const { Component, on } = Ember;

export default Component.extend(EKOnInsertMixin, {
  name: 'Modal',

  classNames: ['modal'],

  triggerCloseModal: on(keyUp(), function(event) {
    const key = getKey(event);

    if (key === 'Escape' || key === 'q' || key === 'x' || key === 'Backspace') {
      this.attrs.closeModal();
    }
  })
});
