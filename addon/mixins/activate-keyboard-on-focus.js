import Ember from 'ember';

const {
  Mixin,
  on,
  set
} = Ember;

export default Mixin.create({
  activateKeyboardWhenFocused: on('click', 'focusIn', function() {
    set(this, 'keyboardActivated', true);
  }),

  deactivateKeyboardWhenFocusOut: on('focusOut', function() {
    set(this, 'keyboardActivated', false);
  })
});
