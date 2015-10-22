import Ember from 'ember';
import { ActivateKeyboardOnFocusMixin } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(ActivateKeyboardOnFocusMixin, {
  classNames: ['mixin-component', 'activate-on-focus'],
  name: 'ActivateKeyboardOnFocusMixin',
  showInMixinList: true
});
