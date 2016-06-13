import Ember from 'ember';
import { EKMixin, EKFirstResponderOnFocusMixin } from 'ember-keyboard';

const {
  TextArea,
  TextField
} = Ember;

export function initialize() {
  TextField.reopen(EKMixin, EKFirstResponderOnFocusMixin, {
    resignFirstResponderOnFocusOut: on('focusOut', function() {
      setProperties(this, {
        keyboardActivated: false,
        keyboardFirstResponder: false
      });
    })
  });
  TextArea.reopen(EKMixin, EKFirstResponderOnFocusMixin, {
    resignFirstResponderOnFocusOut: on('focusOut', function() {
      setProperties(this, {
        keyboardActivated: false,
        keyboardFirstResponder: false
      });
    })
  });
}

export default {
  name: 'ember-keyboard-first-responder-inputs',
  initialize: initialize
};
