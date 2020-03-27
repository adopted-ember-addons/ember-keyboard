import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

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
export default class OnKeyboardModifier extends Modifier {
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
      this.onFocusBound = this.onFocus.bind(this);
      this.onFocusOutBound = this.onFocusOut.bind(this);
      this.element.addEventListener('click', this.onFocusBound, true);
      this.element.addEventListener('focus', this.onFocusBound, true);
      this.element.addEventListener('focusout', this.onFocusOutBound, true);
    }
  }

  willRemove() {
    if (this.onlyWhenFocused) {
      this.element.removeEventListener('click', this.onFocusBound, true);
      this.element.removeEventListener('focus', this.onFocusBound, true);
      this.element.removeEventListener('focusout', this.onFocusOutBound, true);
      this.keyboard.unregister(this);
    }
  }

  onFocus() {
    this.keyboardActivated = true;
    this.keyboardFirstResponder = true;
  }

  onFocusOut() {
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
