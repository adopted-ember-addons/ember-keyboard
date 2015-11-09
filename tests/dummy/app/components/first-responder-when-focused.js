import Ember from 'ember';
import { EKOnInsert, EKFirstResponderOnFocus } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(EKOnInsert, EKFirstResponderOnFocus, {
  classNames: ['mixin-component', 'first-responder-on-focus'],
  keyboardPriority: 1,
  name: 'FocusActivatedEKFirstResponder',
  showInMixinList: true
});
