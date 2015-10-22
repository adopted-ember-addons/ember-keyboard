import Ember from 'ember';

const {
  inject,
  Mixin,
  on
} = Ember;

export default Mixin.create({
  keyboard: inject.service(),

  activateKeyboardWhenPresent: on('didInsertElement', function() {
    this.get('keyboard').activate(this);
  })
});
