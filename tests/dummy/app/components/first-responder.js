import Ember from 'ember';
import { KeyboardFirstResponderMixin } from 'ember-keyboard';

const {
  Component,
  on
} = Ember;

export default Component.extend(KeyboardFirstResponderMixin, {
  classNames: ['mixin-component', 'first-responder'],
  name: 'KeyboardFirstResponderMixin',
  showInMixinList: true,

  becomeFirstResponderOnInsert: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
    this.becomeFirstResponder();
  }),

  resignOnDestroy: on('willDestroyElement', function() {
    this.resignFirstResponder();
  })
});
