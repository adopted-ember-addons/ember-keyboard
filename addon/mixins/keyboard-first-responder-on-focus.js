import Ember from 'ember';

const {
  Mixin,
  on,
  set,
  setProperties
} = Ember;

export default Mixin.create({
  makeFirstResponderOnFocusIn: on('click', 'focusIn', function() {
    setProperties(this, {
      keyboardActivated: true,
      keyboardFirstResponder: true
    });
  }),

  resignFirstResponderOnFocusOut: on('focusOut', function() {
    setProperties(this, {
      keyboardActivated: false,
      keyboardFirstResponder: false
    });
  })
});
