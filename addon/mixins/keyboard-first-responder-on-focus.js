import Ember from 'ember';

const {
  inject,
  Mixin,
  on
} = Ember;

export default Mixin.create({
  attributeBindings: ['tabindex'],
  keyboard: inject.service(),
  tabindex: 0, // ensures that element is focusable

  makeFirstResponderOnFocusIn: on('focusIn', function() {
    this.set('keyboardFirstResponder', true);
  }),

  resignFirstResponderOnFocusOut: on('focusOut', function() {
    this.set('keyboardFirstResponder', false);
  })
});
