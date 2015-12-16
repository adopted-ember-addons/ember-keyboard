import Ember from 'ember';

const {
  Mixin,
  computed,
  get,
  getProperties,
  observer,
  on
} = Ember;

const { inject: { service } } = Ember;

export default Mixin.create({
  keyboardPriority: 0,

  keyboard: service(),

  _activateKeyboard: on('init', observer('keyboardActivated', function() {
    const {
      keyboard,
      keyboardActivated
    } = getProperties(this, 'keyboard', 'keyboardActivated');

    if (keyboardActivated === true) {
      keyboard.activate(this);
    } else if (keyboardActivated === false) {
      keyboard.deactivate(this);
    }
  })),

  _pushToKeyboardPriorityLevel: observer('_keyboardPriorityLevel', function() {
    const {
      keyboard,
      keyboardActivated
    } = getProperties(this, 'keyboard', 'keyboardActivated');

    if (keyboardActivated === true) {
      keyboard.deactivate(this);
      keyboard.activate(this);
    }
  }),

  _keyboardPriorityLevel: computed('keyboardPriority', 'keyboardFirstResponder', {
    get() {
      return get(this, 'keyboardFirstResponder') ?
        'firstResponder' :
        parseInt(get(this, 'keyboardPriority'), 10);
    }
  }).readOnly()
});
