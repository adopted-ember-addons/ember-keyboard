import Ember from 'ember';

const {
  inject,
  Mixin
} = Ember;

// a high, high hacky number that should not be exceeded by most devs
const FIRST_RESPONDER_PRIORITY = 9999999999999;

export default Mixin.create({
  keyboard: inject.service(),

  becomeFirstResponder() {
    this._resignAnyEKFirstResponderMixins();

    if (this.get('keyboardPriority') !== FIRST_RESPONDER_PRIORITY) {
      this.setProperties({
        _formerKeyboardPriority: this.get('keyboardPriority'),
        keyboardPriority: FIRST_RESPONDER_PRIORITY
      });
    }
  },

  resignFirstResponder() {
    // ensure it is currently the first responder
    if (this.get('keyboardPriority') !== FIRST_RESPONDER_PRIORITY) { return; }

    // if there was no formerPriority, then use default priority of 0
    const formerPriority = this.get('_formerKeyboardPriority') || 0;

    this.set('keyboardPriority', formerPriority);
  },

  _resignAnyEKFirstResponderMixins() {
    this.get('keyboard.sortedResponderStack').filter((responder) => {
      return responder.get('keyboardPriority') === FIRST_RESPONDER_PRIORITY;
    }).forEach((responder) => responder.resignFirstResponder());
  }
});
