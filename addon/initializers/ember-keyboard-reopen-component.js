import Ember from 'ember';
import { EKOnInsert, FocusActivatedEKEKFirstResponderOnFocus } from 'ember-keyboard';

export function initialize() {
  Ember.Component.reopen({
    keyboardPriority: 0
  });

  Ember.TextField.reopen(EKOnInsert, FocusActivatedEKEKFirstResponderOnFocus);
  Ember.TextArea.reopen(EKOnInsert, FocusActivatedEKEKFirstResponderOnFocus);
}

export default {
  name: 'ember-keyboard-reopen-component',
  initialize: initialize
};
