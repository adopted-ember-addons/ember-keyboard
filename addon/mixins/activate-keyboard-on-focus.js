import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { set } from '@ember/object';

export default Mixin.create({
  activateKeyboardWhenFocused: on('click', 'focusIn', function() {
    set(this, 'keyboardActivated', true);
  }),

  deactivateKeyboardWhenFocusOut: on('focusOut', function() {
    set(this, 'keyboardActivated', false);
  })
});
