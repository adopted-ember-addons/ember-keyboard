import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { gte } from 'ember-compatibility-helpers';

let Klass;
if (gte('3.12.0')) {

  /* This is an element modifier to trigger a click on the element when
   * the specified key is pressed. In the following example, we trigger a
   * click on the button when the B key is pressed:
   *
   * <input
   *    type="text"
   *    placeholder="Type and then press enter to save"
   *    {{on-keyboard 'Enter' (action this.saveChanges)}
   * >
   */
  Klass = class OnKeyboardModifier extends Modifier {
    @service keyboard;

    keyboardActivated = true;
    keyboardPriority = 0;
    keyboardFirstResponder = false;
    keyboardEventType = 'keydown';
    onlyWhenFocused = true;


    didReceiveArguments() {
      this.key = this.args.positional[0];
      this.keyboardAction = this.args.positional[1];
      if (this.args.named.onlyWhenFocused !== undefined) {
        this.onlyWhenFocused = this.args.named.onlyWhenFocused;
      }

      // Future TODO: support specifying keyboardEventType, keyboardActivated,
      // keyboardPriority, and keyboardFirstResponder via named arguments.
      // This should be straightforward, just needs test coverage and some API
      // decisions.
    }

    didInstall() {
      this.keyboard.register(this);
      if (this.onlyWhenFocused) {
        this.keyboardActivated = false;
        this.keyboardFirstResponder = false;
        this.element.addEventListener('click', this.onFocus, true);
        this.element.addEventListener('focus', this.onFocus, true);
        this.element.addEventListener('focusout', this.onFocusOut, true);
      }
    }

    willRemove() {
      if (this.onlyWhenFocused) {
        this.element.removeEventListener('click', this.onFocus, true);
        this.element.removeEventListener('focus', this.onFocus, true);
        this.element.removeEventListener('focusout', this.onFocusOut, true);
        this.keyboard.unregister(this);
      }
    }

    @action onFocus() {
      this.keyboardActivated = true;
      this.keyboardFirstResponder = true;
    }

    @action onFocusOut() {
      this.keyboardActivated = false;
      this.keyboardFirstResponder = false;
    }

    has(triggerName) {
      return triggerName === this.keyboardEventName;
    }

    trigger(listenerName) {
      if (listenerName === this.keyboardEventName) {
        this.keyboardAction();
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
      throw new Error('ember-keyboard only supports the on-keyboard element modifier in Ember 3.12 and higher.');
    }
  }
}

export default Klass;
