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
    const keyboard = this.get('keyboard');

    keyboard.activate(this);
    keyboard.becomeFirstResponder(this);
  }),

  resignFirstResponderOnFocusOut: on('focusOut', function() {
    this.get('keyboard').resignFirstResponder(this);
  })
});
