import Ember from 'ember';
import { EKOnInsert, EKFirstResponderOnFocus } from 'ember-keyboard';

export function initialize() {
  Ember.Component.reopen({
    keyboardPriority: 0
  });

  Ember.TextField.reopen(EKOnInsert, EKFirstResponderOnFocus);
  Ember.TextArea.reopen(EKOnInsert, EKFirstResponderOnFocus);
}

export default {
  name: 'ember-keyboard-reopen-component',
  initialize: initialize
};
