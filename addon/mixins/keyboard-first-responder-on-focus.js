import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { setProperties, set } from '@ember/object';

export default Mixin.create({
  makeFirstResponderOnFocusIn: on('click', 'focusIn', function() {
    setProperties(this, {
      keyboardActivated: true,
      keyboardFirstResponder: true
    });
  }),

  resignFirstResponderOnFocusOut: on('focusOut', function() {
    set(this, 'keyboardFirstResponder', false);
  })
});
