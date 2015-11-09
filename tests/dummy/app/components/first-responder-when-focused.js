import Ember from 'ember';
import { EKOnInsert, FocusActivatedEKEKFirstResponderOnFocus } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(EKOnInsert, FocusActivatedEKEKFirstResponderOnFocus, {
  classNames: ['mixin-component', 'first-responder-on-focus'],
  keyboardPriority: 1,
  name: 'FocusActivatedEKEKFirstResponderOnFocus',
  showInMixinList: true
});
