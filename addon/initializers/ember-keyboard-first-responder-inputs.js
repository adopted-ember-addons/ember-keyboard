import Ember from 'ember';
import { EKMixin, EKFirstResponderOnFocusMixin } from 'ember-keyboard';

const {
  TextArea,
  TextField
} = Ember;

export function initialize() {
  TextField.reopen(EKMixin, EKFirstResponderOnFocusMixin);
  TextArea.reopen(EKMixin, EKFirstResponderOnFocusMixin);
}

export default {
  name: 'ember-keyboard-first-responder-inputs',
  initialize: initialize
};
