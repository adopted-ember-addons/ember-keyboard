import Ember from 'ember';
import KeyboardEKEKFirstResponderOnFocusMixin from './keyboard-first-responder';

const {
  inject,
  Mixin,
  on
} = Ember;

export default Mixin.create(KeyboardEKEKFirstResponderOnFocusMixin, {
  attributeBindings: ['tabindex'],
  keyboard: inject.service(),
  tabindex: 0, // ensures that element is focusable

  makeEKEKFirstResponderOnFocusWhenFocused: on('focusIn', function() {
    this.get('keyboard').activate(this);
    this.becomeEKEKFirstResponderOnFocus();
  }),

  resignEKEKFirstResponderOnFocusWhenFocusOut: on('focusOut', function() {
    this.resignEKEKFirstResponderOnFocus();
  })
});
