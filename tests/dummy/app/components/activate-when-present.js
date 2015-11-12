import Ember from 'ember';
import { EKOnInsertMixin } from 'ember-keyboard';

const { Component } = Ember;

export default Component.extend(EKOnInsertMixin, {
  classNames: ['mixin-component', 'activate-on-insert'],
  name: 'EKOnInsertMixin',
  showInMixinList: true
});
