import Ember from 'ember';
import { ActivateKeyboardOnInsertMixin } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(ActivateKeyboardOnInsertMixin, {
  classNames: ['mixin-component', 'activate-on-insert'],
  name: 'ActivateKeyboardOnInsertMixin',
  showInMixinList: true
});
