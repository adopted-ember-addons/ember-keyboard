import Ember from 'ember';
import { EKEKFirstResponderOnFocus } from 'ember-keyboard';

const {
  Component,
  on
} = Ember;

export default Component.extend(EKEKFirstResponderOnFocus, {
  classNames: ['mixin-component', 'first-responder'],
  name: 'EKEKFirstResponderOnFocus',
  showInMixinList: true,

  becomeEKEKFirstResponderOnFocusOnInsert: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
    this.becomeEKEKFirstResponderOnFocus();
  }),

  resignOnDestroy: on('willDestroyElement', function() {
    this.resignEKEKFirstResponderOnFocus();
  })
});
