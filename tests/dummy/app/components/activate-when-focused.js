import Ember from 'ember';
import { EKOnFocus } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(EKOnFocus, {
  classNames: ['mixin-component', 'activate-on-focus'],
  name: 'EKOnFocus',
  showInMixinList: true
});
