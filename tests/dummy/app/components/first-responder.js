import Ember from 'ember';
import { EKFirstResponderMixin } from 'ember-keyboard';

const {
  Component,
  on
} = Ember;

export default Component.extend(EKFirstResponderMixin, {
  classNames: ['mixin-component', 'first-responder'],
  name: 'EKFirstResponderMixin',
  showInMixinList: true,

  becomeFirstResponderOnInsert: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
    this.becomeFirstResponder();
  }),

  resignOnDestroy: on('willDestroyElement', function() {
    this.resignFirstResponder();
  })
});
