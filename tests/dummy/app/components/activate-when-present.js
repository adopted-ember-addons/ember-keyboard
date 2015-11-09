import Ember from 'ember';
import { EKOnInsert } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(EKOnInsert, {
  classNames: ['mixin-component', 'activate-on-insert'],
  name: 'EKOnInsert',
  showInMixinList: true
});
