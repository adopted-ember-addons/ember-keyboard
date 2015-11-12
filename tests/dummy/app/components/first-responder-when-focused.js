import Ember from 'ember';
import { EKOnInsertMixin, EKFirstResponderOnFocusMixin } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(EKOnInsertMixin, EKFirstResponderOnFocusMixin, {
  classNames: ['mixin-component', 'first-responder-on-focus'],
  keyboardPriority: 1,
  name: 'FocusActivatedEKFirstResponderMixin',
  showInMixinList: true
});
