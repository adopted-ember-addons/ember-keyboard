import Ember from 'ember';

const {
  Mixin,
  on,
  set
} = Ember;

export default Mixin.create({
  activateKeyboardWhenPresent: on('didInsertElement', function() {
    set(this, 'keyboardActivated', true);
  })
});
