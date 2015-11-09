import Ember from 'ember';
import { EKFirstResponder } from 'ember-keyboard';

const {
  Component,
  on
} = Ember;

export default Component.extend(EKFirstResponder, {
  classNames: ['mixin-component', 'first-responder'],
  name: 'EKFirstResponder',
  showInMixinList: true,

  becomeFirstResponderOnInsert: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
    this.becomeFirstResponder();
  }),

  resignOnDestroy: on('willDestroyElement', function() {
    this.resignFirstResponder();
  })
});
