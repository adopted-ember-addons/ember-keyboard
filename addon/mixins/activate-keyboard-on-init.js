import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { set } from '@ember/object';

export default Mixin.create({
  activateKeyboardWhenStarted: on('init', function() {
    set(this, 'keyboardActivated', true);
  })
});
