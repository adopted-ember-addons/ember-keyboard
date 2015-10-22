import Ember from 'ember';
import { ActivateKeyboardOnInsertMixin, KeyboardFirstResponderOnFocusMixin } from 'ember-keyboard';

export function initialize() {
  Ember.Component.reopen({
    keyboardPriority: 0
  });

  Ember.TextField.reopen(ActivateKeyboardOnInsertMixin, KeyboardFirstResponderOnFocusMixin);
  Ember.TextArea.reopen(ActivateKeyboardOnInsertMixin, KeyboardFirstResponderOnFocusMixin);
}

export default {
  name: 'ember-keyboard-reopen-component',
  initialize: initialize
};
