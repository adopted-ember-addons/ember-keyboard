import Ember from 'ember';
import { EKOnFocusMixin } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(EKOnFocusMixin, {
  classNames: ['mixin-component', 'activate-on-focus'],
  name: 'EKOnFocusMixin',
  showInMixinList: true
});
