import Ember from 'ember';
import KeyboardEKFirstResponderMixinMixin from './keyboard-first-responder';

const {
  inject,
  Mixin,
  on
} = Ember;

export default Mixin.create(KeyboardEKFirstResponderMixinMixin, {
  attributeBindings: ['tabindex'],
  keyboard: inject.service(),
  tabindex: 0, // ensures that element is focusable

  makeEKFirstResponderMixinWhenFocused: on('focusIn', function() {
    this.get('keyboard').activate(this);
    this.becomeFirstResponder();
  }),

  resignFirstResponderWhenFocusOut: on('focusOut', function() {
    this.resignFirstResponder();
  })
});
