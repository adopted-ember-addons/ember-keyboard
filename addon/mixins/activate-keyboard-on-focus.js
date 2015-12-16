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

  activateKeyboardWhenFocused: on('click', 'focusIn', function() {
    this.set('keyboardActivated', true);
  }),

  deactivateKeyboardWhenFocusOut: on('focusOut', function() {
    this.set('keyboardActivated', false);
  })
});
