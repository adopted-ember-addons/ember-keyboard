import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { lte } from 'ember-compatibility-helpers';
import { gte } from 'ember-compatibility-helpers';

let Klass;
if (gte('3.12.0')) {

  /* This is an element modifier to trigger a click on the element when
   * the specified key is pressed. In the following example, we trigger a
   * click on the button when the B key is pressed:
   *
   * <button {{keyboard-shortcut 'KeyB'}}>Press me or press "B"</button>
   */
  Klass = class KeyboardShortcutModifier extends Modifier {
    @service keyboard;

    keyboardActivated = true;
    keyboardPriority = 0;
    keyboardFirstResponder = false;
    keyboardEventType = 'keypress';


    didReceiveArguments() {
      this.key = this.args.positional[0];

      // Future TODO: support specifying keyboardEventType, keyboardActivated,
      // keyboardPriority, and keyboardFirstResponder via named arguments.
      // This should be straightforward, just needs test coverage.

    }

    didInstall() {
      try {
        this.keyboard.register(this);
      } catch(e) {
        if (lte('3.12.0')) {
          console.warn('ember-keyboard\'s modifiers are only supported in Ember 3.12+');
        }
        throw e;
      }
    }

    willRemove() {
      this.keyboard.unregister(this);
    }

    has(triggerName) {
      return triggerName === this.keyboardEventName;
    }

    trigger(listenerName) {
      if (listenerName === this.keyboardEventName) {
        this.element.click();
      }
    }

    get keyboardEventName() {
      let { key, keyboardEventType } = this;
      return `${keyboardEventType}:${key}`;
    }
  }
} else {
  Klass = class OnKeyboardModifier extends Modifier {
    didInstall() {
      throw new Error('ember-keyboard only supports the keyboard-shortcut element modifier in Ember 3.12 and higher.');
    }
  }
}
export default Klass;
