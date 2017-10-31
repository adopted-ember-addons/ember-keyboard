import TextArea from '@ember/component/text-area';
import TextField from '@ember/component/text-field';
import {
  EKMixin,
  EKFirstResponderOnFocusMixin
} from 'ember-keyboard';

export function initialize() {
  TextField.reopen(EKMixin, EKFirstResponderOnFocusMixin);
  TextArea.reopen(EKMixin, EKFirstResponderOnFocusMixin);
}

export default {
  name: 'ember-keyboard-first-responder-inputs',
  initialize: initialize
};
