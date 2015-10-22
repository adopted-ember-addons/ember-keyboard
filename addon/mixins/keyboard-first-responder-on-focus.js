import Ember from 'ember';
import KeyboardFirstResponderMixin from './keyboard-first-responder';

const {
  inject,
  Mixin,
  on
} = Ember;

export default Mixin.create(KeyboardFirstResponderMixin, {
  attributeBindings: ['tabindex'],
  keyboard: inject.service(),
  tabindex: 0, // ensures that element is focusable

  makeFirstResponderWhenFocused: on('focusIn', function() {
    this.get('keyboard').activate(this);
    this.becomeFirstResponder();
  }),

  resignFirstResponderWhenFocusOut: on('focusOut', function() {
    this.resignFirstResponder();
  })
});
