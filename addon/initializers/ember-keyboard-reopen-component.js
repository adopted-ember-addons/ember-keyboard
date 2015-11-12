import Ember from 'ember';
import { EKOnInsertMixin, EKFirstResponderOnFocusMixin } from 'ember-keyboard';

export function initialize() {
  Ember.Component.reopen({
    keyboardPriority: 0
  });

  Ember.TextField.reopen(EKOnInsertMixin, EKFirstResponderOnFocusMixin);
  Ember.TextArea.reopen(EKOnInsertMixin, EKFirstResponderOnFocusMixin);
}

export default {
  name: 'ember-keyboard-reopen-component',
  initialize: initialize
};
