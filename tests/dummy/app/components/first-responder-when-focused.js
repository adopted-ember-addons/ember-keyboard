import Ember from 'ember';
import { ActivateKeyboardOnInsertMixin, KeyboardFirstResponderOnFocusMixin } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(ActivateKeyboardOnInsertMixin, KeyboardFirstResponderOnFocusMixin, {
  classNames: ['mixin-component', 'first-responder-on-focus'],
  keyboardPriority: 1,
  name: 'KeyboardFirstResponderOnFocusMixin',
  showInMixinList: true
});
