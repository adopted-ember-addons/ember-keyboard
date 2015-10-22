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
    this.get('keyboard').activate(this);
  }),

  deactivateKeyboardWhenFocusOut: on('focusOut', function() {
    this.get('keyboard').deactivate(this);
  })
});
