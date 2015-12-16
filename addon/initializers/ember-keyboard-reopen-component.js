import Ember from 'ember';
import { EKMixin, EKOnInsertMixin, EKFirstResponderOnFocusMixin } from 'ember-keyboard';

const {
  TextArea,
  TextField
} = Ember;

export function initialize() {
  TextField.reopen(EKMixin, EKOnInsertMixin, EKFirstResponderOnFocusMixin);
  TextArea.reopen(EKMixin, EKOnInsertMixin, EKFirstResponderOnFocusMixin);
}

export default {
  name: 'ember-keyboard-reopen-component',
  initialize: initialize
};
